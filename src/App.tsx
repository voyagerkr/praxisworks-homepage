import { useEffect, useRef, useState } from 'react'
import './App.css'
import type { AgentProject, Framework } from './types'
import agentsData from './data/agents.json'
import { LANGS, dict, type Lang } from './i18n'

const agents = agentsData as unknown as AgentProject[]
const FRAMEWORKS: Framework[] = ['CrewAI', 'AutoGen', 'Agno', 'LangGraph']
const UPSTREAM = 'https://github.com/ashishpatel26/500-AI-Agents-Projects'
const CONTACT = 'koji@praxisworks.dev'
const TOTAL = agents.length

// Portfolio. Re:IW blurb is a placeholder pending detail; its thumb stays a monogram.
type Project = { title: string; mono: string; kind: string; blurb: string; tags: string[]; href?: string; image?: string }
const PORTFOLIO: Project[] = [
  {
    title: 'Iron & Incense',
    mono: 'II',
    kind: 'GAME',
    blurb: 'An occult extraction shooter set in a sealed-off Shibuya — built in Unreal Engine.',
    tags: ['Unreal', 'C++', 'Game'],
    image: 'pf/iron-incense.jpg',
    href: 'https://store.steampowered.com/app/4406440/Iron__Incense/',
  },
]

// A few real agents to anchor the "we build AI" highlight.
const AI_FEATURED: AgentProject[] = FRAMEWORKS.map((fw) => agents.find((a) => a.framework === fw)).filter(
  (a): a is AgentProject => Boolean(a),
)

const MARQUEE = [
  'Game Development',
  'Unreal',
  'Unity',
  'Web',
  'React',
  'Node.js',
  'Mobile',
  'Spine',
  'AI Agents',
  'LLM',
  'Backend',
  'Live-ops',
]

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

// Pointer + scroll micro-interactions: scroll progress, magnetic buttons,
// 3D card tilt, and light parallax. Re-runs when `signature` changes so it
// re-binds after the cards remount (e.g. on a language switch).
function usePageFx(signature: string) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bar = document.querySelector<HTMLElement>('.progress')
    const root = document.documentElement

    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight || 1
      if (bar) bar.style.transform = `scaleX(${Math.min(1, root.scrollTop / max)})`
      document.querySelectorAll<HTMLElement>('[data-par]').forEach((el) => {
        const amt = Number(el.dataset.par ?? '0')
        el.style.transform = `translate3d(0, ${root.scrollTop * amt}px, 0)`
      })
    }
    const magMove = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      const p = e as PointerEvent
      const r = el.getBoundingClientRect()
      el.style.transform = `translate(${(p.clientX - r.left - r.width / 2) * 0.25}px, ${
        (p.clientY - r.top - r.height / 2) * 0.4
      }px)`
    }
    const magLeave = (e: Event) => ((e.currentTarget as HTMLElement).style.transform = '')
    const tiltMove = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      const p = e as PointerEvent
      const r = el.getBoundingClientRect()
      const x = (p.clientX - r.left) / r.width - 0.5
      const y = (p.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(1100px) rotateX(${-y * 5.5}deg) rotateY(${x * 5.5}deg) translateY(-6px)`
    }
    const tiltLeave = (e: Event) => ((e.currentTarget as HTMLElement).style.transform = '')

    const mags = [...document.querySelectorAll<HTMLElement>('.magnetic')]
    const tilts = [...document.querySelectorAll<HTMLElement>('.tilt')]
    mags.forEach((el) => {
      el.addEventListener('pointermove', magMove)
      el.addEventListener('pointerleave', magLeave)
    })
    tilts.forEach((el) => {
      el.addEventListener('pointermove', tiltMove)
      el.addEventListener('pointerleave', tiltLeave)
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      mags.forEach((el) => {
        el.removeEventListener('pointermove', magMove)
        el.removeEventListener('pointerleave', magLeave)
      })
      tilts.forEach((el) => {
        el.removeEventListener('pointermove', tiltMove)
        el.removeEventListener('pointerleave', tiltLeave)
      })
    }
  }, [signature])
}

function hostLabel(url: string): string {
  if (/\.ipynb($|\?)/.test(url)) return 'Notebook'
  if (url.includes('colab.research')) return 'Colab'
  return 'GitHub'
}

function ProjectCard({
  project,
  index,
  view,
  caseStudy,
}: {
  project: Project
  index: number
  view: string
  caseStudy: string
}) {
  const external = !!project.href && /^https?:/.test(project.href)
  return (
    <article className="card pf reveal tilt" style={{ transitionDelay: `${(index % 6) * 60}ms` }}>
      <div className="pf-thumb" data-i={index % 3}>
        {project.image ? (
          <img
            className="pf-img"
            src={`${import.meta.env.BASE_URL}${project.image}`}
            alt={`${project.title} — work by PraxisWorks`}
          />
        ) : (
          <span className="pf-mono" aria-hidden="true">
            {project.mono}
          </span>
        )}
        <span className="pf-kind">{project.kind}</span>
      </div>
      <h3 className="card-name">{project.title}</h3>
      <p className="card-desc">{project.blurb}</p>
      <div className="card-foot">
        <div className="pf-tags">
          {project.tags.map((t) => (
            <span className="pf-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <a
          className="card-link"
          href={project.href ?? '#contact'}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {external ? view : caseStudy}
          <span className="arrow" aria-hidden="true">
            {external ? '↗' : '→'}
          </span>
        </a>
      </div>
    </article>
  )
}

function AgentCard({ agent, index }: { agent: AgentProject; index: number }) {
  return (
    <article className="card reveal tilt" style={{ transitionDelay: `${(index % 4) * 55}ms` }}>
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
  const heroRef = useRef<HTMLElement>(null)
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('pwLang')
    if (saved && LANGS.some((l) => l.code === saved)) return saved as Lang
    const nav = navigator.language.toLowerCase()
    const base = nav.split('-')[0]
    const match =
      LANGS.find((l) => l.code.toLowerCase() === nav) ??
      LANGS.find((l) => l.code.toLowerCase().split('-')[0] === base)
    return match?.code ?? 'en'
  })
  const t = dict[lang]

  useEffect(() => {
    localStorage.setItem('pwLang', lang)
    const meta = LANGS.find((l) => l.code === lang)
    document.documentElement.lang = lang
    document.documentElement.dir = meta?.dir ?? 'ltr'
  }, [lang])

  useReveal(lang)
  usePageFx(lang)

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
      <div className="atmos" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="progress" aria-hidden="true" />
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
        <div className="nav-right">
          <nav className="nav-links" aria-label="Primary">
            <a href="#work">{t.navWork}</a>
            <a href="#ai">{t.navAI}</a>
            <a href="#contact">{t.navContact}</a>
            <a href={UPSTREAM} target="_blank" rel="noopener noreferrer">
              {t.navSource} ↗
            </a>
          </nav>
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label="Language"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
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
            <span className="dot" /> PRAXISWORKS · {t.kicker}
          </p>
          <h1 className="rise" style={{ animationDelay: '.14s' }}>
            <span className="grad">{t.head}</span>
          </h1>
          <p className="hero-sub rise" style={{ animationDelay: '.24s' }}>
            {t.sub}
          </p>
          <div className="hero-cta rise" style={{ animationDelay: '.34s' }}>
            <a className="btn primary magnetic" href="#work">
              {t.ctaWork}
            </a>
            <a className="btn ghost magnetic" href={`mailto:${CONTACT}`}>
              {t.ctaStart}
            </a>
          </div>
          <p className="hero-meta rise" style={{ animationDelay: '.46s' }}>
            {t.meta}
          </p>
        </div>
        <a className="hero-scroll" href="#work" aria-label="Scroll to work">
          <span />
        </a>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <div className="marquee-row">
            {MARQUEE.map((m, i) => (
              <span key={`a-${i}`}>{m}</span>
            ))}
          </div>
          <div className="marquee-row">
            {MARQUEE.map((m, i) => (
              <span key={`b-${i}`}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      <section className="work" id="work">
        <div className="section-head reveal">
          <p className="eyebrow">{t.workKicker}</p>
          <h2>{t.workHead}</h2>
          <p className="section-sub">{t.workSub}</p>
        </div>
        <div className={PORTFOLIO.length === 1 ? 'grid pf-grid single' : 'grid pf-grid'}>
          {PORTFOLIO.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} view={t.view} caseStudy={t.caseStudy} />
          ))}
        </div>
      </section>

      <section className="ai" id="ai">
        <div className="section-head reveal">
          <p className="eyebrow">{t.aiKicker}</p>
          <h2>{t.aiHead}</h2>
          <p className="section-sub">{t.aiSub}</p>
        </div>
        <div className="grid">
          {AI_FEATURED.map((a, i) => (
            <AgentCard key={a.id} agent={a} index={i} />
          ))}
        </div>
        <div className="work-more">
          <a className="btn ghost magnetic" href={UPSTREAM} target="_blank" rel="noopener noreferrer">
            {t.aiBrowse.replace('{n}', String(TOTAL))} ↗
          </a>
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="cta-panel reveal">
          <p className="eyebrow">{t.contactKicker}</p>
          <h2>{t.contactHead}</h2>
          <p className="section-sub">{t.contactSub}</p>
          <a className="btn primary magnetic" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <span className="brand-word">
            PRAXIS<em>WORKS</em>
          </span>
          <p>{t.footer}</p>
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
