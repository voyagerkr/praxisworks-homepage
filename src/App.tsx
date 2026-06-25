import { useEffect, useRef } from 'react'
import './App.css'
import type { AgentProject, Framework } from './types'
import agentsData from './data/agents.json'

const agents = agentsData as unknown as AgentProject[]
const FRAMEWORKS: Framework[] = ['CrewAI', 'AutoGen', 'Agno', 'LangGraph']
const UPSTREAM = 'https://github.com/ashishpatel26/500-AI-Agents-Projects'
const CONTACT = 'koji@praxisworks.dev'
const TOTAL = agents.length

// Portfolio. Blurbs/tags/links are drafts — refine per project (esp. Love Live / Re:IW),
// and swap the gradient thumbs for real screenshots when available.
type Project = { title: string; mono: string; kind: string; blurb: string; tags: string[]; href?: string }
const PORTFOLIO: Project[] = [
  {
    title: 'Iron & Incense',
    mono: 'II',
    kind: 'GAME',
    blurb: 'An original yokai action game — built in Unreal Engine.',
    tags: ['Unreal', 'C++', 'Game'],
  },
  {
    title: 'Love Live!',
    mono: 'LL',
    kind: 'GAME',
    blurb: 'Engineering for the idol-game franchise.',
    tags: ['Game', 'Live-ops'],
  },
  {
    title: 'Re:IW',
    mono: 'IW',
    kind: 'GAME',
    blurb: 'Game development and engineering.',
    tags: ['Game'],
  },
]

// A few real agents to anchor the "we build AI" highlight.
const AI_FEATURED: AgentProject[] = FRAMEWORKS.map((fw) => agents.find((a) => a.framework === fw)).filter(
  (a): a is AgentProject => Boolean(a),
)

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

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="card pf reveal" style={{ transitionDelay: `${(index % 6) * 60}ms` }}>
      <div className="pf-thumb" data-i={index % 3}>
        <span className="pf-mono" aria-hidden="true">
          {project.mono}
        </span>
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
        <a className="card-link" href={project.href ?? '#contact'}>
          Case study
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </article>
  )
}

function AgentCard({ agent, index }: { agent: AgentProject; index: number }) {
  return (
    <article className="card reveal" style={{ transitionDelay: `${(index % 4) * 55}ms` }}>
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
  useReveal('static')

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
          <a href="#work">Work</a>
          <a href="#ai">AI</a>
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
            We build <span className="grad">products</span>
            <br />
            that ship.
          </h1>
          <p className="hero-sub rise" style={{ animationDelay: '.24s' }}>
            PraxisWorks is a development studio. We design and build software products end to end — games,
            web, mobile, and AI — as your outsourced engineering team.
          </p>
          <div className="hero-cta rise" style={{ animationDelay: '.34s' }}>
            <a className="btn primary" href="#work">
              See our work
            </a>
            <a className="btn ghost" href={`mailto:${CONTACT}`}>
              Start a project
            </a>
          </div>
          <p className="hero-meta rise" style={{ animationDelay: '.46s' }}>
            Product engineering · games · web · mobile · AI
          </p>
        </div>
        <a className="hero-scroll" href="#work" aria-label="Scroll to work">
          <span />
        </a>
      </section>

      <section className="work" id="work">
        <div className="section-head reveal">
          <p className="eyebrow">SELECTED WORK</p>
          <h2>Things we&rsquo;ve built</h2>
          <p className="section-sub">
            A selection of the games and products we&rsquo;ve designed, built, and shipped.
          </p>
        </div>
        <div className="grid pf-grid">
          {PORTFOLIO.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </section>

      <section className="ai" id="ai">
        <div className="section-head reveal">
          <p className="eyebrow">AI PRODUCT DEVELOPMENT</p>
          <h2>We also build AI products</h2>
          <p className="section-sub">
            From AI agents to LLM features — production AI, shipped. This is the agent landscape we build in:
          </p>
        </div>
        <div className="grid">
          {AI_FEATURED.map((a, i) => (
            <AgentCard key={a.id} agent={a} index={i} />
          ))}
        </div>
        <div className="work-more">
          <a className="btn ghost" href={UPSTREAM} target="_blank" rel="noopener noreferrer">
            Browse the agent atlas — {TOTAL} projects ↗
          </a>
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="reveal">
          <p className="eyebrow">CONTACT</p>
          <h2>Start a project.</h2>
          <p className="section-sub">
            Need an outsourced team to design and ship your product — including the AI inside it? Tell us
            what you&rsquo;re building.
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
            A development studio. We design and ship software products end to end — games, web, mobile, and
            AI — as your outsourced engineering team.
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
