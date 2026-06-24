/**
 * Parse the upstream 500-AI-Agents-Projects README markdown tables into a
 * typed agents.json seed. Run: `node scripts/parse-readme.mjs <readme.md>`
 *
 * Source: https://github.com/ashishpatel26/500-AI-Agents-Projects
 * Only rows that carry a real (non-shields.io) GitHub/Colab/Notebook link are
 * kept, so every card in the gallery links to a working destination.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const src = process.argv[2] ?? '/tmp/agents_readme.md'
const md = readFileSync(src, 'utf8')
const lines = md.split('\n')

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 56) || 'agent'

const clean = (s) =>
  s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // strip markdown links → keep text
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim()

const stripLeadingSymbols = (s) => s.replace(/^[^\p{L}\p{N}]+/u, '').trim()

// The upstream README uses 60+ free-text "industry" labels (many near-duplicates
// like "Software Dev" / "Software Development"). We keep the raw label on the card
// badge and fold it into a tidy canonical category for the filter. First match wins.
const CATEGORY_RULES = [
  ['Healthcare', /health|medical|insurance|clinic|patient|diagnos/i],
  ['Finance', /financ|trading|stock|bank|invest|wallet|payment/i],
  ['Education', /education|tutor|learning|study|academ|cognitive|scholar/i],
  ['Customer Service', /customer/i],
  ['Retail & E-commerce', /retail|e-?commerce|shopping|commerce/i],
  ['Legal', /legal|law|compliance/i],
  ['HR & Recruitment', /human resource|recruit|hiring|\bhr\b/i],
  ['Travel & Hospitality', /travel|hospitality|tourism|airbnb/i],
  ['Logistics & Mobility', /transport|supply chain|logistics|delivery|mobility/i],
  ['Industrial & Energy', /manufactur|energy|agricultur|industrial|factory/i],
  ['Real Estate', /real estate|property|housing/i],
  ['Cybersecurity', /cyber|security|threat|fraud/i],
  ['Sales & Marketing', /sales|marketing|advertis|growth|\blead\b/i],
  ['Media & Entertainment', /media|entertain|content|journal|news|music|audio|image|video|multimedia|gaming|game|creative|writing|publish|social|movie|food|culinary/i],
  ['Research & Knowledge', /research|knowledge|information retrieval|\brag\b|intelligent|problem|reasoning/i],
  ['Software & Data', /software|develop|\bweb\b|database|data|documentation|extraction|devops|\bcode\b|\bsql\b|analytic/i],
  ['Agents & Workflows', /workflow|orchestrat|productivity|collaborat|communicat|monitor|evaluation|\btool\b|integration|framework|automation|\bqa\b|planning|multi-agent/i],
]
const categorize = (industry) => {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(industry)) return cat
  return 'Other'
}

let h2 = ''
let h3 = ''
const out = []
const seen = new Set()

for (const raw of lines) {
  const t = raw.trim()
  if (t.startsWith('## ')) {
    h2 = t.replace(/^##\s*/, '').trim()
    h3 = ''
    continue
  }
  if (t.startsWith('### ')) {
    h3 = t.replace(/^###\s*/, '').trim()
    continue
  }
  if (!t.startsWith('|')) continue

  // Collect every http(s) link; the real target is the one that is not a badge.
  const links = [...t.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1])
  const url = links.find((u) => !/shields\.io|img\.shields/.test(u))
  if (!url) continue

  const cells = t.split('|').slice(1, -1).map((c) => c.trim())
  if (cells.length < 3) continue

  const name = stripLeadingSymbols(clean(cells[0]))
  const industry = clean(cells[1])
  const description = clean(cells[2])
  if (!name || /^use case$/i.test(name) || /^framework$/i.test(name)) continue

  const framework = /browse by framework/i.test(h2) ? h3 : null

  let id = slug(name)
  let n = 1
  while (seen.has(id)) id = `${slug(name)}-${++n}`
  seen.add(id)

  out.push({ id, name, description, industry, category: categorize(industry), framework, url })
}

const dest = '/Users/koji/praxisworks-homepage/src/data/agents.json'
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')

const tally = (key) =>
  Object.entries(
    out.reduce((m, a) => {
      const v = a[key]
      if (v) m[v] = (m[v] ?? 0) + 1
      return m
    }, {}),
  ).sort((a, b) => b[1] - a[1])

console.log(`parsed ${out.length} agents`)
console.log(`\ncategories:`, tally('category').map(([k, v]) => `${k}(${v})`).join(', '))
console.log(`\nframeworks:`, tally('framework').map(([k, v]) => `${k}(${v})`).join(', '))
console.log('\nsample:')
console.log(JSON.stringify(out.slice(0, 3), null, 2))
console.log('...')
console.log(JSON.stringify(out.slice(-2), null, 2))
