import { useEffect, useRef, useState } from 'react'
import './App.css'
import type { AgentProject, Framework } from './types'
import agentsData from './data/agents.json'

const agents = agentsData as unknown as AgentProject[]
const FRAMEWORKS: Framework[] = ['CrewAI', 'AutoGen', 'Agno', 'LangGraph']
const UPSTREAM = 'https://github.com/ashishpatel26/500-AI-Agents-Projects'
const CONTACT = 'koji@praxisworks.dev'
const TOTAL = agents.length

// A framework-diverse handful for the homepage highlight; the full list is opt-in.
const pick = (pred: (a: AgentProject) => boolean, n: number) => agents.filter(pred).slice(0, n)
const FEATURED: AgentProject[] = [
  ...FRAMEWORKS.flatMap((fw) => pick((a) => a.framework === fw, 2)),
  ...pick((a) => !a.framework, 1),
].slice(0, 9)

/** Reveal-on-scroll. Re-runs when the shown set changes (expanding to the full list). */
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

function hostLabel(url: string): string {
  if (/\.ipynb($|\?)/.test(url)) return 'Notebook'
  if (url.includes('colab.research')) return 'Colab'
  return 'GitHub'
}

function AgentCard({ agent, index }: { agent: AgentProject; index: number }) {
  return (
    <article className="card reveal" style={{ transitionDelay: `${(index % 9) * 45}ms` }}>
      <div className="card-top">
        <span className="card-ord">{String(index + 1).padStart(3, '0')}</span>
        <span className="tag fw" data-fw={agent.framework ?? 'none'}>
          {agent.framework ?? 'Showcase'}
        </span>
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
  const [expanded, setExpanded] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  useReveal(expanded ? 'all' : 'featured')

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

  const shown = expanded ? agents : FEATURED

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
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
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
            <span className="dot" /> PRAXISWORKS · DEVELOPMENT STUDIO
          </p>
          <h1 className="rise" style={{ animationDelay: '.14s' }}>
            We build <span className="grad">AI agents</span>
            <br />
            that ship.
          </h1>
          <p className="hero-sub rise" style={{ animationDelay: '.24s' }}>
            PraxisWorks is a development studio. We design, build, and ship AI agents — and the production
            software around them — as your outsourced engineering team.
          </p>
          <div className="hero-cta rise" style={{ animationDelay: '.34s' }}>
            <a className="btn primary" href="#work">
              See the work
            </a>
            <a className="btn ghost" href={`mailto:${CONTACT}`}>
              Start a project
            </a>
          </div>
          <p className="hero-meta rise" style={{ animationDelay: '.46s' }}>
            Outsourced engineering · AI agents · production software
          </p>
        </div>
        <a className="hero-scroll" href="#work" aria-label="Scroll to work">
          <span />
        </a>
      </section>

      <section className="work" id="work">
        <div className="section-head reveal">
          <p className="eyebrow">THE FIELD WE BUILD IN</p>
          <h2>A working atlas of AI agents</h2>
          <p className="section-sub">
            The landscape we work in — a curated slice of {TOTAL}+ real-world agent projects across CrewAI,
            AutoGen, Agno and LangGraph. Every card links to working code.
          </p>
        </div>
        <div className="grid">
          {shown.map((a, i) => (
            <AgentCard key={a.id} agent={a} index={i} />
          ))}
        </div>
        <div className="work-more">
          {!expanded ? (
            <button type="button" className="btn ghost" onClick={() => setExpanded(true)}>
              View all {TOTAL} agents
            </button>
          ) : (
            <a className="btn ghost" href={UPSTREAM} target="_blank" rel="noopener noreferrer">
              Browse the full catalog ↗
            </a>
          )}
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="reveal">
          <p className="eyebrow">CONTACT</p>
          <h2>Start a project.</h2>
          <p className="section-sub">
            Need an outsourced team to design and ship AI agents — or the software around them? Tell us what
            you're building.
          </p>
          <a className="btn primary" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <span className="brand-word">
            PRAXIS<em>WORKS</em>
          </span>
          <p>
            A development studio building AI agents and the products around them. Atlas curated from the
            open-source{' '}
            <a href={UPSTREAM} target="_blank" rel="noopener noreferrer">
              500 AI Agents Projects
            </a>{' '}
            catalog.
          </p>
        </div>
        <div className="footer-bot">
          <a href="https://dev.praxisworks.dev/">dev.praxisworks.dev</a>
          <small>© 2026 PraxisWorks.</small>
        </div>
      </footer>
    </div>
  )
}

export default App
