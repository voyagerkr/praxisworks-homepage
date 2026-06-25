import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import type { AgentProject, Framework } from './types'
import agentsData from './data/agents.json'

const agents = agentsData as unknown as AgentProject[]

const FRAMEWORKS: Framework[] = ['CrewAI', 'AutoGen', 'Agno', 'LangGraph']
const UPSTREAM = 'https://github.com/ashishpatel26/500-AI-Agents-Projects'

// Category list, most-populated first — computed once.
const CATEGORIES: string[] = Object.entries(
  agents.reduce<Record<string, number>>((m, a) => {
    m[a.category] = (m[a.category] ?? 0) + 1
    return m
  }, {}),
)
  .sort((a, b) => b[1] - a[1])
  .map(([name]) => name)

const TOTAL = agents.length
const TOTAL_CATEGORIES = CATEGORIES.length

const CATEGORY_COUNTS: Record<string, number> = agents.reduce<Record<string, number>>((m, a) => {
  m[a.category] = (m[a.category] ?? 0) + 1
  return m
}, {})
const FRAMEWORK_COUNTS: Record<string, number> = agents.reduce<Record<string, number>>((m, a) => {
  if (a.framework) m[a.framework] = (m[a.framework] ?? 0) + 1
  return m
}, {})

// Domain filter folded into a few meta-groups for a tidier <select> (idea borrowed
// from the curated "site-for-developers" list's collapsible category groups).
const DOMAIN_GROUPS: { label: string; categories: string[] }[] = [
  { label: 'AI & Engineering', categories: ['Agents & Workflows', 'Software & Data', 'Research & Knowledge'] },
  { label: 'Business & Ops', categories: ['Finance', 'HR & Recruitment', 'Sales & Marketing', 'Customer Service', 'Legal'] },
  { label: 'Consumer & Media', categories: ['Media & Entertainment', 'Retail & E-commerce', 'Travel & Hospitality', 'Education'] },
  { label: 'Industry & Infrastructure', categories: ['Healthcare', 'Logistics & Mobility', 'Industrial & Energy', 'Real Estate', 'Cybersecurity'] },
]
const GROUPED_CATS = new Set(DOMAIN_GROUPS.flatMap((g) => g.categories))
const UNGROUPED_CATS = CATEGORIES.filter((c) => !GROUPED_CATS.has(c))

// One-click presets that drive search + filters together (like the list's Quick Start jumps).
type Preset = { label: string; query?: string; framework?: Framework; category?: string }
const PRESETS: Preset[] = [
  { label: 'Multi-agent', query: 'multi-agent' },
  { label: 'RAG', query: 'rag' },
  { label: 'Code', query: 'code' },
  { label: 'Customer support', query: 'customer' },
  { label: 'Finance', category: 'Finance' },
  { label: 'Healthcare', category: 'Healthcare' },
]

// Framework reference — official source per framework, plus how many examples live in the atlas.
const FRAMEWORK_REF: { name: Framework; blurb: string; site: string; repo: string }[] = [
  { name: 'CrewAI', blurb: 'Role-based multi-agent teams for business automation.', site: 'https://www.crewai.com', repo: 'https://github.com/crewAIInc/crewAI' },
  { name: 'AutoGen', blurb: "Microsoft's multi-agent conversation framework.", site: 'https://microsoft.github.io/autogen', repo: 'https://github.com/microsoft/autogen' },
  { name: 'LangGraph', blurb: 'Graph-based, stateful agent workflows.', site: 'https://www.langchain.com/langgraph', repo: 'https://github.com/langchain-ai/langgraph' },
  { name: 'Agno', blurb: 'Lightweight, high-performance single agents.', site: 'https://agno.com', repo: 'https://github.com/agno-agi/agno' },
]

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Reveal-on-scroll. Re-attaches whenever `signature` changes (the grid remounts
 * its keyed cards on every filter change, which would detach old observers). */
function useReveal(signature: string) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = document.querySelectorAll<HTMLElement>('.reveal:not(.in)')
    if (reduce) {
      targets.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [signature])
}

function Stat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = `${value}${suffix}`
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100)
      el.textContent = `${Math.round(value * (1 - (1 - p) ** 3))}${suffix}`
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, suffix])
  return (
    <div className="stat">
      <span className="stat-num" ref={ref}>
        0{suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function hostLabel(url: string): string {
  const isNotebook = /\.ipynb($|\?)/.test(url)
  if (isNotebook) return 'Notebook'
  if (url.includes('colab.research')) return 'Colab'
  return 'GitHub'
}

function AgentCard({ agent, index }: { agent: AgentProject; index: number }) {
  const ordinal = String(index + 1).padStart(3, '0')
  return (
    <article className="card reveal" style={{ transitionDelay: `${(index % 10) * 45}ms` }}>
      <div className="card-top">
        <span className="card-ord">{ordinal}</span>
        {agent.framework ? (
          <span className="tag fw" data-fw={agent.framework}>
            {agent.framework}
          </span>
        ) : (
          <span className="tag fw" data-fw="none">
            Showcase
          </span>
        )}
      </div>
      <h3 className="card-name">{agent.name}</h3>
      <p className="card-desc">{agent.description}</p>
      <div className="card-foot">
        <span className="tag industry">{agent.industry}</span>
        <a className="card-link" href={agent.url} target="_blank" rel="noopener noreferrer">
          {hostLabel(agent.url)}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>
    </article>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [framework, setFramework] = useState<Framework | 'all'>('all')
  const [category, setCategory] = useState<string>('all')
  const debouncedQuery = useDebounced(query, 150)
  const heroRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    return agents.filter((a) => {
      if (framework !== 'all' && a.framework !== framework) return false
      if (category !== 'all' && a.category !== category) return false
      if (q) {
        const hay = `${a.name} ${a.description} ${a.industry} ${a.category} ${a.framework ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [debouncedQuery, framework, category])

  const signature = `${debouncedQuery}|${framework}|${category}`
  useReveal(signature)

  const hasFilters = framework !== 'all' || category !== 'all' || query.trim() !== ''
  const reset = () => {
    setQuery('')
    setFramework('all')
    setCategory('all')
  }
  const applyPreset = (p: Preset) => {
    setQuery(p.query ?? '')
    setFramework(p.framework ?? 'all')
    setCategory(p.category ?? 'all')
  }
  const selectFramework = (fw: Framework) => {
    setFramework(fw)
    setQuery('')
    setCategory('all')
    document.getElementById('atlas')?.scrollIntoView({ behavior: 'smooth' })
  }

  // ⌘K / Ctrl+K focuses the search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Cursor glow on the hero only (atmosphere, perf-friendly).
  useEffect(() => {
    const el = heroRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])

  return (
    <div className="app">
      <header className="nav">
        <a className="brand" href="#top" aria-label="PraxisWorks home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-word">
            PRAXIS<em>WORKS</em>
          </span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#atlas">Atlas</a>
          <a href="#frameworks">Frameworks</a>
          <a href={UPSTREAM} target="_blank" rel="noopener noreferrer">
            Source ↗
          </a>
        </nav>
      </header>

      <section className="hero" id="top" ref={heroRef}>
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster={`${import.meta.env.BASE_URL}hero-poster.jpg`}
          preload="metadata"
        >
          <source src={`${import.meta.env.BASE_URL}hero.mp4`} type="video/mp4" />
        </video>
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-inner">
          <p className="kicker rise" style={{ animationDelay: '.05s' }}>
            <span className="dot" /> PRAXISWORKS · AGENT INTELLIGENCE
          </p>
          <h1 className="rise" style={{ animationDelay: '.14s' }}>
            The applied atlas
            <br />
            of <span className="grad">AI agents</span>.
          </h1>
          <p className="hero-sub rise" style={{ animationDelay: '.24s' }}>
            A curated, working index of {TOTAL} real-world AI agent projects — searchable by
            industry and by framework. From practice, not slideware.
          </p>
          <div className="hero-cta rise" style={{ animationDelay: '.34s' }}>
            <a className="btn primary" href="#atlas">
              Explore the atlas
            </a>
            <a className="btn ghost" href={UPSTREAM} target="_blank" rel="noopener noreferrer">
              View source ↗
            </a>
          </div>
          <div className="hero-stats rise" style={{ animationDelay: '.46s' }}>
            <Stat value={TOTAL} label="Agent projects" />
            <Stat value={FRAMEWORKS.length} label="Frameworks" />
            <Stat value={TOTAL_CATEGORIES} label="Domains" suffix="" />
          </div>
        </div>
        <a className="hero-scroll" href="#atlas" aria-label="Scroll to atlas">
          <span />
        </a>
      </section>

      <section className="frameworks" id="frameworks">
        <div className="section-head reveal">
          <p className="eyebrow">FRAMEWORKS</p>
          <h2>Built across the agent stack</h2>
          <p className="section-sub">
            Every example links to a working repo or notebook. Filter the atlas by framework — or jump
            straight to the official source.
          </p>
        </div>
        <div className="fw-grid">
          {FRAMEWORK_REF.map((f) => (
            <article className="fw-card reveal" data-fw={f.name} key={f.name}>
              <div className="fw-card-head">
                <span className="fw-dot" aria-hidden="true" />
                <h3>{f.name}</h3>
                <span className="fw-count">
                  {FRAMEWORK_COUNTS[f.name] ?? 0}
                  <small>in atlas</small>
                </span>
              </div>
              <p>{f.blurb}</p>
              <div className="fw-links">
                <button type="button" className="fw-filter" onClick={() => selectFramework(f.name)}>
                  Filter atlas →
                </button>
                <a href={f.site} target="_blank" rel="noopener noreferrer">
                  Official ↗
                </a>
                <a href={f.repo} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <main className="atlas" id="atlas">
        <div className="controls">
          <div className="search">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents, use cases, industries…"
              aria-label="Search agents"
            />
            <kbd aria-hidden="true">⌘K</kbd>
          </div>

          <div className="chips" role="group" aria-label="Filter by framework">
            <button
              type="button"
              className={framework === 'all' ? 'chip active' : 'chip'}
              aria-pressed={framework === 'all'}
              onClick={() => setFramework('all')}
            >
              All frameworks
            </button>
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw}
                type="button"
                className={framework === fw ? 'chip active' : 'chip'}
                data-fw={fw}
                aria-pressed={framework === fw}
                onClick={() => setFramework((cur) => (cur === fw ? 'all' : fw))}
              >
                {fw}
              </button>
            ))}
          </div>

          <div className="select-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by domain"
            >
              <option value="all">All domains</option>
              {DOMAIN_GROUPS.map((g) => {
                const members = g.categories.filter((c) => CATEGORY_COUNTS[c])
                if (!members.length) return null
                return (
                  <optgroup key={g.label} label={g.label}>
                    {members
                      .slice()
                      .sort((a, b) => CATEGORY_COUNTS[b] - CATEGORY_COUNTS[a])
                      .map((c) => (
                        <option key={c} value={c}>
                          {c} ({CATEGORY_COUNTS[c]})
                        </option>
                      ))}
                  </optgroup>
                )
              })}
              {UNGROUPED_CATS.length > 0 && (
                <optgroup label="Other">
                  {UNGROUPED_CATS.map((c) => (
                    <option key={c} value={c}>
                      {c} ({CATEGORY_COUNTS[c]})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <span className="select-caret" aria-hidden="true">
              ▾
            </span>
          </div>
        </div>

        <div className="presets" role="group" aria-label="Quick filters">
          <span className="presets-label">Quick</span>
          {PRESETS.map((p) => {
            const active =
              (p.query ?? '') === query &&
              (p.framework ?? 'all') === framework &&
              (p.category ?? 'all') === category
            return (
              <button
                key={p.label}
                type="button"
                className={active ? 'preset active' : 'preset'}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <div className="result-bar">
          <p aria-live="polite">
            <strong>{filtered.length}</strong> {filtered.length === 1 ? 'result' : 'results'}
            <span className="muted"> / {TOTAL}</span>
          </p>
          {hasFilters && (
            <button type="button" className="reset" onClick={reset}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid">
            {filtered.map((a, i) => (
              <AgentCard key={a.id} agent={a} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <p className="empty-glyph" aria-hidden="true">
              ⌀
            </p>
            <h3>No agents match that.</h3>
            <p>Try a broader search or clear the filters.</p>
            <button type="button" className="btn ghost" onClick={reset}>
              Clear filters
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-top">
          <span className="brand-word">
            PRAXIS<em>WORKS</em>
          </span>
          <p>
            The applied atlas of AI agents. Data curated from the open-source{' '}
            <a href={UPSTREAM} target="_blank" rel="noopener noreferrer">
              500 AI Agents Projects
            </a>{' '}
            catalog and refreshed into a working, searchable index.
          </p>
        </div>
        <div className="footer-bot">
          <a href="https://dev.praxisworks.dev/">dev.praxisworks.dev</a>
          <small>© 2026 PraxisWorks. Built from practice.</small>
        </div>
      </footer>
    </div>
  )
}

export default App
