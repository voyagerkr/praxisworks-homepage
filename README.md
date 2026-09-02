# PraxisWorks Homepage

The applied atlas of AI agents — a searchable, filterable gallery of 100+ real-world
AI agent projects, organized by industry and framework.

Preview: `https://dev.praxisworks.dev/`

Built with the same toolchain as the TIMO WORKS homepage: Vite + React 19 + TypeScript,
hand-authored CSS, pnpm, and a GitHub Actions → Pages deploy.

## Local development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## Data

The gallery is seeded from the open-source
[500 AI Agents Projects](https://github.com/ashishpatel26/500-AI-Agents-Projects) catalog.

`scripts/parse-readme.mjs` parses the upstream README's markdown tables into
`src/data/agents.json`, keeping only rows that carry a real (non-badge) GitHub/Colab/Notebook
link so every card links to a working destination. Raw industry labels are kept on each card
and folded into a normalized `category` used by the domain filter.

To refresh the dataset:

```bash
curl -sSL https://raw.githubusercontent.com/ashishpatel26/500-AI-Agents-Projects/main/README.md -o /tmp/agents_readme.md
pnpm data /tmp/agents_readme.md
```

## Company profile

The 会社概要 / company-profile section (`#company`) is data-driven, so the facts live in
exactly one place:

- `src/data/company.ts` — the factual rows (company name, founded, representative, capital,
  address, business, contact, website) plus the schema.org `Organization` markup built from
  them. A row whose value is empty is **not** rendered, so a fact that has not been confirmed
  yet simply does not appear on the page. A value may be a plain string, or an object with
  per-language variants (`{ en: '...', ja: '...' }`), and may contain `\n` for line breaks.
- `src/i18n.ts` — the row *labels* and the section copy, in all 16 languages.

## Media

- `public/hero.mp4` — hero background loop (720p, audio stripped, `+faststart`), transcoded
  from the source 4K master for web delivery.
- `public/hero-poster.jpg` — first-paint poster frame.

## Deployment notes

- Static build output is written to `dist/`.
- `public/CNAME` contains `dev.praxisworks.dev` for custom-domain hosting.
- The `dev.` subdomain is the development/preview host; production (`praxisworks.dev`) is served
  separately (AWS).
