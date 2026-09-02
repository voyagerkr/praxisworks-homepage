// ─────────────────────────────────────────────────────────────────────────────
// 会社概要 / Company profile — the single source of truth for the #company
// section (and for the Organization structured data).
//
// These are registry facts transcribed from the company's 사업자등록증 (Korean
// business registration certificate), not marketing copy, so nothing here is
// invented: a row whose value is empty is simply NOT rendered.
//
// Both registration numbers are published here at the owner's direction, so the
// overseas bank can verify the company straight from the site. Korean companies
// often publish only the 사업자등록번호; the 법인등록번호 is on the public
// 등기부등본 anyone can order, so this exposes nothing that is not obtainable.
//
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
/** 사업자등록번호 — the public business registration number. */
const BIZ_NO = '846-87-03684'
/** 법인등록번호 — the corporate registration number. */
const CORP_NO = '110111-0960724'
/** The `founded` row above, in the ISO form schema.org wants. */
const FOUNDED_ISO = '2026-06-01'
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
  { key: 'name', value: { en: 'Praxis Works.Inc.', ko: '주식회사 프락시스웍스 (Praxis Works.Inc.)' } },
  {
    key: 'founded',
    value: { en: 'June 1, 2026', ko: '2026년 6월 1일', ja: '2026年6月1日', 'zh-Hans': '2026年6月1日', 'zh-Hant': '2026年6月1日' },
  },
  { key: 'rep', value: { en: 'Koji Tamura', ja: '田村浩二', 'zh-Hans': '田村浩二', 'zh-Hant': '田村浩二' } },
  { key: 'capital', value: { en: 'KRW 1,000,000', ko: '1,000,000원', ja: '1,000,000ウォン' } },
  { key: 'bizNo', value: BIZ_NO },
  { key: 'corpNo', value: CORP_NO },
  {
    key: 'address',
    value: {
      en: '5F, Units 520–524, Gasan Urban Work\n135 Gasan digital 2-ro, Geumcheon-gu, Seoul, Republic of Korea',
      ko: '서울특별시 금천구 가산디지털2로 135, 5층 520,521,522,523,524호\n(가산동, 가산 어반워크)',
      ja: '大韓民国 ソウル特別市 衿川区 加山デジタル2路135\nカサン・アーバンワーク 5階 520〜524号',
    },
  },
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
  if (address) {
    ld.address = {
      '@type': 'PostalAddress',
      streetAddress: address.replace(/\n/g, ', '),
      addressCountry: 'KR',
    }
  }
  ld.foundingDate = FOUNDED_ISO
  ld.taxID = BIZ_NO
  return JSON.stringify(ld)
}
