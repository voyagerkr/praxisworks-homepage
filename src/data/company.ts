// ─────────────────────────────────────────────────────────────────────────────
// 会社概要 / Company profile — the single source of truth for the #company
// section (and for the Organization structured data).
//
// These are registry facts, not marketing copy, so nothing here is invented:
// a row whose value is empty is simply NOT rendered. Fill a value in and its
// row appears — no other file needs to change.
//
// TODO(praxisworks): 未確定の項目を埋めてください / 미확정 항목을 채워주세요
//   founded  設立    e.g. { en: 'April 2025',        ja: '2025年4月' }
//   capital  資本金  e.g. { en: 'JPY 10,000,000',    ja: '1,000万円' }
//   address  所在地  e.g. { en: 'Floor, Building\n1-2-3 Street, Ward, City',
//                           ja: '東京都◯◯区◯◯1-2-3\n◯◯ビル 4F' }
//   `name` also takes the legal form once fixed, e.g. { ja: '株式会社PraxisWorks' }.
// A value may contain "\n" — line breaks are preserved when rendered.
// ─────────────────────────────────────────────────────────────────────────────
import type { CompanyLabels, Lang } from '../i18n'

/** Row labels live in `i18n.ts`; the keys here are those labels' keys. */
export type CompanyRowKey = keyof CompanyLabels

/**
 * A value that reads the same in every language (a plain string), or one with
 * per-language variants. `en` is the fallback for any language without its own.
 */
export type Localized = string | ({ en: string } & Partial<Record<Lang, string>>)

export function localize(value: Localized, lang: Lang): string {
  return typeof value === 'string' ? value : (value[lang] ?? value.en)
}

export const COMPANY_EMAIL = 'koji@praxisworks.dev'
export const COMPANY_SITE = 'https://praxisworks.dev/'

export type CompanyRow = {
  key: CompanyRowKey
  value: Localized
  /** When set, the value renders as a link (forced LTR so URLs survive RTL). */
  href?: string
}

/** 事業内容 — what the studio actually does, in the visitor's language. */
const BUSINESS: Localized = {
  en: 'Software product development and outsourced engineering — game development (Unreal Engine / Unity), web and mobile applications, and AI / LLM agent development.',
  ko: '소프트웨어 제품 개발 및 외주 엔지니어링 — 게임 개발(Unreal Engine / Unity), 웹·모바일 애플리케이션, AI/LLM 에이전트 개발.',
  ja: 'ソフトウェアプロダクトの開発および受託開発 — ゲーム開発（Unreal Engine／Unity）、Web・モバイルアプリケーション、AI／LLMエージェント開発。',
  'zh-Hans': '软件产品开发与外包工程 — 游戏开发（Unreal Engine / Unity）、Web 与移动应用、AI / LLM 智能体开发。',
  'zh-Hant': '軟體產品開發與外包工程 — 遊戲開發（Unreal Engine / Unity）、Web 與行動應用、AI / LLM 代理開發。',
  es: 'Desarrollo de productos de software e ingeniería externalizada: videojuegos (Unreal Engine / Unity), aplicaciones web y móviles, y agentes de IA / LLM.',
  fr: 'Développement de produits logiciels et ingénierie externalisée : jeux (Unreal Engine / Unity), applications web et mobiles, et agents IA / LLM.',
  de: 'Softwareproduktentwicklung und ausgelagerte Entwicklung — Spieleentwicklung (Unreal Engine / Unity), Web- und Mobile-Anwendungen sowie KI-/LLM-Agenten.',
  pt: 'Desenvolvimento de produtos de software e engenharia terceirizada — jogos (Unreal Engine / Unity), aplicações web e mobile e agentes de IA / LLM.',
  it: 'Sviluppo di prodotti software e ingegneria in outsourcing — videogiochi (Unreal Engine / Unity), applicazioni web e mobile e agenti IA / LLM.',
  ru: 'Разработка программных продуктов и внешняя разработка — игры (Unreal Engine / Unity), веб- и мобильные приложения, ИИ-/LLM-агенты.',
  ar: 'تطوير منتجات برمجية وخدمات هندسية خارجية — تطوير الألعاب (Unreal Engine / Unity)، وتطبيقات الويب والموبايل، ووكلاء الذكاء الاصطناعي ونماذج اللغة.',
  hi: 'सॉफ़्टवेयर प्रोडक्ट डेवलपमेंट और आउटसोर्स इंजीनियरिंग — गेम डेवलपमेंट (Unreal Engine / Unity), वेब और मोबाइल ऐप्लिकेशन, तथा AI / LLM एजेंट डेवलपमेंट।',
  id: 'Pengembangan produk perangkat lunak dan rekayasa alih daya — pengembangan game (Unreal Engine / Unity), aplikasi web dan mobile, serta agen AI / LLM.',
  vi: 'Phát triển sản phẩm phần mềm và kỹ thuật thuê ngoài — phát triển game (Unreal Engine / Unity), ứng dụng web và di động, AI agent / LLM.',
  tr: 'Yazılım ürün geliştirme ve dış kaynak mühendislik — oyun geliştirme (Unreal Engine / Unity), web ve mobil uygulamalar, AI / LLM ajan geliştirme.',
}

/** Display order of the profile table. Empty values are skipped at render. */
export const COMPANY_ROWS: CompanyRow[] = [
  { key: 'name', value: 'PraxisWorks' },
  { key: 'founded', value: '' },
  { key: 'rep', value: { en: 'Koji Tamura', ja: '田村浩二', 'zh-Hans': '田村浩二', 'zh-Hant': '田村浩二' } },
  { key: 'capital', value: '' },
  { key: 'address', value: '' },
  { key: 'business', value: BUSINESS },
  { key: 'contact', value: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}` },
  { key: 'website', value: 'praxisworks.dev', href: COMPANY_SITE },
]

/**
 * schema.org Organization markup, built from the rows above so it can never
 * drift from what the page shows. Unknown facts are left out entirely.
 */
export function organizationJsonLd(): string {
  const fact = (key: CompanyRowKey) => {
    const row = COMPANY_ROWS.find((r) => r.key === key)
    return row ? localize(row.value, 'en') : ''
  }
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: fact('name'),
    url: COMPANY_SITE,
    logo: `${COMPANY_SITE}og.png`,
    email: COMPANY_EMAIL,
    description: fact('business'),
  }
  const address = fact('address')
  if (address) ld.address = { '@type': 'PostalAddress', streetAddress: address.replace(/\n/g, ', ') }
  return JSON.stringify(ld)
}
