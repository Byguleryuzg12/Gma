import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { COMPANIES } from './data/companies.js';
import { COMPANY_EVENTS } from './data/companyEvents.js';
import { COMMODITY_HISTORY } from './data/commodityHistory.js';
import { FOREX_HISTORY } from './data/forexHistory.js';
import { LMP_METALS, LMP_ENERGY, LMP_FOREX } from './data/liveMarketProducts.js';
import { T, EN, CORE_LANGS, GMA_LEGAL_STATIC } from './data/i18n.js';


// ═══════════════════════════════════════════════════════
// ──  LANGUAGE SELECTOR (8 Languages) ──
// ═══════════════════════════════════════════════════════
const LANGS = [
  {c:'en', n:'English'},
  {c:'tr', n:'Türkçe'},
  {c:'ru', n:'Русский'},
  {c:'ar', n:'العربية', r:1},
  {c:'zh', n:'简体中文'},
  {c:'hi', n:'हिन्दी'},
  {c:'de', n:'Deutsch'},
  {c:'es', n:'Español'}
];

function LangFlag({ code }) {
  const base = {
    width: "22px",
    height: "16px",
    borderRadius: "2px",
    overflow: "hidden",
    position: "relative",
    flex: "0 0 22px",
    display: "inline-block",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.22)",
    background: "#111827"
  };
  const block = (style, key, children) => /*#__PURE__*/React.createElement("span", {
    key,
    style: { position: "absolute", display: "block", ...style }
  }, children);
  const star = (style, key) => block({
    width: 0,
    height: 0,
    borderLeft: "3px solid transparent",
    borderRight: "3px solid transparent",
    borderBottom: "5px solid #facc15",
    transform: "rotate(35deg)",
    ...style
  }, key);
  const flags = {
    en: [
      block({ inset: 0, background: "#fff" }, "bg"),
      ...[0, 4, 8, 12].map((top, i) => block({ left: 0, right: 0, top, height: 2, background: "#b91c1c" }, "r" + i)),
      block({ left: 0, top: 0, width: 10, height: 8, background: "#1e3a8a" }, "c")
    ],
    tr: [
      block({ inset: 0, background: "#e30a17" }, "bg"),
      block({ left: 6, top: 4, width: 8, height: 8, borderRadius: "50%", background: "#fff" }, "moon1"),
      block({ left: 8, top: 4, width: 7, height: 8, borderRadius: "50%", background: "#e30a17" }, "moon2"),
      block({ left: 15, top: 5, width: 0, height: 0, borderLeft: "4px solid #fff", borderTop: "3px solid transparent", borderBottom: "3px solid transparent" }, "star")
    ],
    ru: [
      block({ inset: 0, background: "#fff" }, "w"),
      block({ left: 0, right: 0, top: 5.33, height: 5.34, background: "#2563eb" }, "b"),
      block({ left: 0, right: 0, bottom: 0, height: 5.33, background: "#dc2626" }, "r")
    ],
    ar: [
      block({ inset: 0, background: "#166534" }, "bg"),
      block({ left: 6, right: 6, top: 10, height: 1.5, background: "#fff" }, "sword"),
      block({ left: 7, top: 4, color: "#fff", fontSize: 6, lineHeight: "8px", fontWeight: 700 }, "SA", "txt")
    ],
    zh: [
      block({ inset: 0, background: "#dc2626" }, "bg"),
      star({ left: 3, top: 3 }, "s1"),
      ...[[11, 3], [14, 6], [14, 10], [11, 12]].map(([left, top], i) => block({ left, top, width: 2, height: 2, borderRadius: "50%", background: "#facc15" }, "d" + i))
    ],
    hi: [
      block({ left: 0, right: 0, top: 0, height: 5.33, background: "#f97316" }, "o"),
      block({ left: 0, right: 0, top: 5.33, height: 5.34, background: "#fff" }, "w"),
      block({ left: 0, right: 0, bottom: 0, height: 5.33, background: "#16a34a" }, "g"),
      block({ left: 9, top: 5.5, width: 4, height: 4, borderRadius: "50%", border: "1px solid #1d4ed8" }, "wheel")
    ],
    de: [
      block({ left: 0, right: 0, top: 0, height: 5.33, background: "#111827" }, "b"),
      block({ left: 0, right: 0, top: 5.33, height: 5.34, background: "#dc2626" }, "r"),
      block({ left: 0, right: 0, bottom: 0, height: 5.33, background: "#facc15" }, "y")
    ],
    es: [
      block({ inset: 0, background: "#dc2626" }, "r"),
      block({ left: 0, right: 0, top: 4, height: 8, background: "#facc15" }, "y"),
      block({ left: 6, top: 6, width: 3, height: 4, borderRadius: 1, background: "#dc2626" }, "crest")
    ]
  };
  return /*#__PURE__*/React.createElement("span", {
    role: "img",
    "aria-label": code,
    style: base
  }, flags[code] || flags.en);
}

// ── Platform API Key (Admin tarafindan set edilir, usersdan istenmez) ──
// ╔══════════════════════════════════════════════════════════════╗
// ║              GMA CONFIGURATION — PASTE HERE         ║
// ╚══════════════════════════════════════════════════════════════╝

// GMA Credit System
function _gmaCredits(email) {
  try { return JSON.parse(localStorage.getItem('gma_credits_' + email) || 'null'); } catch { return null; }
}
function _gmaSetCredits(email, n) {
  localStorage.setItem('gma_credits_' + email, JSON.stringify(n));
}
function _gmaInitCredits(email) {
  if (_gmaCredits(email) === null) _gmaSetCredits(email, 2);
}
function _gmaDeductCredit(email) {
  var c = _gmaCredits(email);
  if (c === null) { _gmaInitCredits(email); c = 2; }
  if (c <= 0) return false;
  _gmaSetCredits(email, c - 1);
  return true;
}

const GMA_CONFIG = {
  // 1. Google ile Giris — Google Cloud Console:
  //    console.cloud.google.com → Credentials → OAuth 2.0 Client IDs
  //    Authorized origins: https://globalmarketanalytics.com
  googleClientId: '459657298766-8opv6078k1c55en34hrt2u9b7tde1267.apps.googleusercontent.com',
  // "123456789-abc.apps.googleusercontent.com"

  // 2. GMA Intelligence Layer — Platform API Key:
  //    console.anthropic.com → API Keys
  anthropicKey: '',
  // "sk-ant-api03-..."

  // 3. Paddle — vendors.paddle.com/dashboard:
  //    a) Client-side token: Developer Tools → Authentication
  //    b) Price ID'leri: Catalog → Products → her plan icin (pri_...)
  //    c) Environment: 'sandbox' (test) veya 'production'
  finnhubKey: 'd7f8b4pr01qpjqqjrge0d7f8b4pr01qpjqqjrgeg',
  // finnhub.io API Key - free tier 60 req/min

  paddle: {
    clientToken: '',
    // Paddle Billing client-side token (public token)
    vendorId: '',
    // Legacy Paddle Classic Vendor ID (opsiyonel geriye uyum)
    environment: 'production',
    // 'sandbox' | 'production'
    prices: {
      explorer: '',
      // Paddle Price ID — Explorer plan (pri_...)
      strategist: '',
      // Paddle Price ID — Professional plan (pri_...)
      pro_architect: '',
      // Paddle Price ID — Enterprise plan (pri_...)
      daily: '',
      monthly: '',
      yearly: ''
    },
    successUrl: 'https://globalmarketanalytics.com?payment=success',
    cancelUrl: 'https://globalmarketanalytics.com?payment=cancel'
  }
};
// ══════════════════════════════════════════════════════════════

// Config valuelerini localStorage'a uygula (sayfa acilisinda)
(function applyConfig() {
  // Always set Google Client ID (hardcoded + config)
  var _gcid = GMA_CONFIG.googleClientId || '459657298766-8opv6078k1c55en34hrt2u9b7tde1267.apps.googleusercontent.com';
  if (_gcid) localStorage.setItem('gma_google_client_id', _gcid);
  if (GMA_CONFIG.anthropicKey) localStorage.setItem('gma_platform_key', GMA_CONFIG.anthropicKey);
  if (GMA_CONFIG.finnhubKey) localStorage.setItem('gma_finnhub_key', GMA_CONFIG.finnhubKey);
  if (GMA_CONFIG.paddle?.clientToken) localStorage.setItem('gma_paddle_client_token', GMA_CONFIG.paddle.clientToken);
  if (GMA_CONFIG.paddle?.vendorId) localStorage.setItem('gma_paddle_vendor_id', GMA_CONFIG.paddle.vendorId);
  if (GMA_CONFIG.paddle?.environment) localStorage.setItem('gma_paddle_env', GMA_CONFIG.paddle.environment);
  if (GMA_CONFIG.paddle?.prices?.explorer) localStorage.setItem('gma_price_explorer', GMA_CONFIG.paddle.prices.explorer);
  if (GMA_CONFIG.paddle?.prices?.strategist) localStorage.setItem('gma_price_strategist', GMA_CONFIG.paddle.prices.strategist);
  if (GMA_CONFIG.paddle?.prices?.pro_architect) localStorage.setItem('gma_price_pro_architect', GMA_CONFIG.paddle.prices.pro_architect);
  if (GMA_CONFIG.paddle?.prices?.daily) localStorage.setItem('gma_price_daily', GMA_CONFIG.paddle.prices.daily);
  if (GMA_CONFIG.paddle?.prices?.monthly) localStorage.setItem('gma_price_monthly', GMA_CONFIG.paddle.prices.monthly);
  if (GMA_CONFIG.paddle?.prices?.yearly) localStorage.setItem('gma_price_yearly', GMA_CONFIG.paddle.prices.yearly);
})();

// Paddle config erisimi
const PADDLE_CLIENT_TOKEN = () => GMA_CONFIG.paddle?.clientToken || localStorage.getItem('gma_paddle_client_token') || '';
const PADDLE_VENDOR_ID = () => GMA_CONFIG.paddle?.vendorId || localStorage.getItem('gma_paddle_vendor_id') || '';
const PADDLE_ENV = () => GMA_CONFIG.paddle?.environment || localStorage.getItem('gma_paddle_env') || 'production';
const PADDLE_PRICES = () => ({
  explorer: GMA_CONFIG.paddle?.prices?.explorer || localStorage.getItem('gma_price_explorer') || '',
  strategist: GMA_CONFIG.paddle?.prices?.strategist || localStorage.getItem('gma_price_strategist') || '',
  pro_architect: GMA_CONFIG.paddle?.prices?.pro_architect || localStorage.getItem('gma_price_pro_architect') || '',
  daily: GMA_CONFIG.paddle?.prices?.daily || localStorage.getItem('gma_price_daily') || '',
  monthly: GMA_CONFIG.paddle?.prices?.monthly || localStorage.getItem('gma_price_monthly') || '',
  yearly: GMA_CONFIG.paddle?.prices?.yearly || localStorage.getItem('gma_price_yearly') || ''
});

// Platform key erisimi
const GMA_PLATFORM_KEY = () => GMA_CONFIG.anthropicKey || localStorage.getItem('gma_platform_key') || '';

// ── Dil Context ──
const LangContext = React.createContext({
  lang: "en",
  setLang: () => {},
  t: k => k,
  aiTranslating: false
});

const GMA_PADDLE_COMPLIANCE_I18N = {
  en: {
    howSub: "Global Market Data in 4 Steps",
    step3t: "Review",
    step3d: "Structured market intelligence via the GMA Consensus Engine",
    step4t: "Frame",
    step4d: "Build your own decision framework with data, scoring and context",
    feat2d: "Review institutional-grade data alignment from the GMA Consensus Engine",
    feat5d: "Set price movement alerts and follow rises or falls instantly",
    aiAnalysisTitle: "AI Market Review",
    aiAnalysisDesc: "Review company data, risk context and structured market notes with GMA Intelligence Layer",
    portfolioTrackingTitle: "Personal Workspace",
    portfolioTrackingDesc: "Save simulated entries and monitor reference values in one place",
    aboutSub: "A market data intelligence platform delivering structured analytics and clarity across global markets.",
    aboutMissionText: "To build market data infrastructure that reduces uncertainty through structured analytics without providing financial advice.",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analytics, risk framing and data context. All outputs are informational only and do not constitute financial advice.",
    pricingTitle: "AI Market Intelligence for Global Data",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    ctaTitle: "Upgrade Market Clarity to Institutional Grade",
    ctaSub: "Review global market data with plans starting from $2.99/day.",
    footerDesc: "A market data intelligence platform built to deliver clarity across global markets.",
    footerCompliance: "Global Market Analytics (GMA) is an AI-supported market data visualization platform. GMA is not a registered financial adviser and does not provide financial advice. Payments are securely processed by Paddle.com.",
    planStrategistLabel: "Professional",
    planProArchitectLabel: "Enterprise",
    planProArchitectBadge: "ENTERPRISE",
    planProArchitectScope: "Global + Analytics DNA · 126 Years",
    recommendation: "SCORING",
    recommended: "TOP SCORE",
    aiRecommendation: "COMPOSITE SCORE HIGHLIGHT",
    alternativeChoice: "SECONDARY DATA HIGHLIGHT",
    finalDecisionNotice: "FOR INFORMATION ONLY - NOT FINANCIAL ADVICE",
    finalBullet1: "This output is an AI-assisted market data assessment.",
    finalBullet2: "No output is a buy, sell or hold recommendation.",
    finalBullet3: "Risk values are illustrative scoring inputs, not trading instructions.",
    finalBullet4: "Users remain responsible for their own decisions.",
    finalBullet5: "Past performance does not guarantee future results.",
    finalBullet6: "Consult a qualified professional for financial advice.",
    comparisonIntro: "GMA Intelligence Layer generates educational scores and context for each company",
    startAiComparisonAnalysis: "Start AI Comparison Review",
    companiesAiComparison: "companies · AI-assisted market comparison",
    priceRiseAlert: "Price Movement Alert",
    riseThreshold: "Movement Threshold",
    target: "Reference Level",
    demoCompareRationale: "Superior financial metrics combined with the innovation pipeline make this the highest composite score under current market conditions.",
    demoCompareAlternativeNote: "Strong enterprise positioning and cloud infrastructure provide a notable secondary data highlight.",
    demoCompareOverall: "The selected companies show useful diversification across market leaders with complementary business models. The current macro environment favors quality over growth in this data review.",
    demoShortTimeframe: "Strong Q4 earnings forecast and the new iPhone cycle may support near-term market interest. Services revenue growth provides a consistent business catalyst.",
    demoLongTimeframe: "Sustained services expansion, Vision Pro ecosystem maturation and continued buybacks provide long-term business context through 2027.",
    secureCheckoutBody: "Your payment is securely processed by Paddle.com, our authorized Merchant of Record. GMA never stores card details. Clicking below opens Paddle's secure hosted checkout.",
    checkoutSecuredNote: "Secured by Paddle.com - card data is never stored on GMA servers.",
    paddleConfigMissing: "Paddle checkout is not configured yet. Add a client token and plan Price IDs in the admin panel.",
    paddlePriceMissing: "Paddle Price ID is missing for this plan. Add the plan Price ID in the admin panel."
  },
  tr: {
    howSub: "4 Adımda Küresel Piyasa Verisi",
    step3t: "İncele",
    step3d: "GMA Consensus Engine ile yapılandırılmış piyasa zekası",
    step4t: "Çerçevele",
    step4d: "Veri, skor ve bağlamla kendi karar çerçevenizi kurun",
    feat2d: "GMA Consensus Engine üzerinden kurumsal seviye veri uyumunu inceleyin",
    feat5d: "Fiyat hareketi uyarıları kurun; yükseliş ve düşüşleri anında takip edin",
    aiAnalysisTitle: "AI Piyasa İncelemesi",
    aiAnalysisDesc: "GMA Intelligence Layer ile şirket verisi, risk bağlamı ve yapılandırılmış piyasa notlarını inceleyin",
    portfolioTrackingTitle: "Kişisel Çalışma Alanı",
    portfolioTrackingDesc: "Simüle kayıtları kaydedin ve referans değerleri tek yerde izleyin",
    aboutSub: "Küresel piyasalarda yapılandırılmış analitik ve netlik sunan piyasa verisi zeka platformu.",
    aboutMissionText: "Finansal tavsiye sunmadan, yapılandırılmış analitikle belirsizliği azaltan piyasa verisi altyapısı kurmak.",
    aboutCardAIB: "GMA Consensus Engine tarafından desteklenen platform; yapılandırılmış şirket analitiği, risk çerçevesi ve veri bağlamı sunar. Tüm çıktılar yalnızca bilgilendirme amaçlıdır ve finansal tavsiye değildir.",
    pricingTitle: "Küresel Veri İçin AI Piyasa Zekası",
    pricingSub: "GMA Consensus Engine'e tek bir kurumsal abonelikle erişin.",
    ctaTitle: "Piyasa Netliğini Kurumsal Seviyeye Taşıyın",
    ctaSub: "Günlük 2.99$'dan başlayan planlarla küresel piyasa verilerini inceleyin.",
    footerDesc: "Küresel piyasalarda netlik sağlamak için tasarlanmış piyasa verisi zeka platformu.",
    footerCompliance: "Global Market Analytics (GMA), AI destekli piyasa verisi görselleştirme platformudur. GMA kayıtlı yatırım danışmanı değildir ve finansal tavsiye sunmaz. Ödemeler Paddle.com tarafından güvenli şekilde işlenir.",
    planStrategistLabel: "Profesyonel",
    planProArchitectLabel: "Kurumsal",
    planProArchitectBadge: "KURUMSAL",
    planProArchitectScope: "Küresel + Analitik DNA · 126 Yıl",
    recommendation: "SKORLAMA",
    recommended: "EN YÜKSEK SKOR",
    aiRecommendation: "BİLEŞİK SKOR ÖNE ÇIKANI",
    alternativeChoice: "İKİNCİ VERİ ÖNE ÇIKANI",
    finalDecisionNotice: "YALNIZCA BİLGİLENDİRME AMAÇLIDIR - FİNANSAL TAVSİYE DEĞİLDİR",
    finalBullet1: "Bu çıktı AI destekli piyasa verisi değerlendirmesidir.",
    finalBullet2: "Hiçbir çıktı al, sat veya tut önerisi değildir.",
    finalBullet3: "Risk değerleri örnek skor girdileridir, alım satım sinyali değildir.",
    finalBullet4: "Kullanıcılar kendi kararlarından sorumludur.",
    finalBullet5: "Geçmiş performans gelecek sonuçları garanti etmez.",
    finalBullet6: "Finansal tavsiye için yetkin bir uzmana danışın.",
    comparisonIntro: "GMA Intelligence Layer her şirket için eğitim amaçlı skorlar ve bağlam üretir",
    startAiComparisonAnalysis: "AI Karşılaştırma İncelemesini Başlat",
    companiesAiComparison: "şirket · AI destekli piyasa karşılaştırması",
    priceRiseAlert: "Fiyat Hareketi Uyarısı",
    riseThreshold: "Hareket Eşiği",
    target: "Referans Seviye",
    demoCompareRationale: "Güçlü finansal göstergeler ve inovasyon hattı, mevcut piyasa koşullarında en yüksek bileşik skoru oluşturuyor.",
    demoCompareAlternativeNote: "Güçlü kurumsal konum ve bulut altyapısı, ikinci bir veri öne çıkan alanı sunuyor.",
    demoCompareOverall: "Seçilen şirketler, birbirini tamamlayan iş modellerine sahip piyasa liderleri arasında faydalı bir çeşitlilik gösteriyor. Mevcut makro ortam bu veri incelemesinde kaliteyi öne çıkarıyor.",
    demoShortTimeframe: "Güçlü 4. çeyrek beklentisi ve yeni iPhone döngüsü kısa vadeli piyasa ilgisini destekleyebilir. Servis gelirlerindeki büyüme düzenli bir iş katalizörü sağlar.",
    demoLongTimeframe: "Servis segmentinin süren genişlemesi, Vision Pro ekosisteminin olgunlaşması ve geri alımlar 2027'ye kadar uzun vadeli iş bağlamı sunar.",
    secureCheckoutBody: "Ödemeniz yetkili kayıtlı satıcı iş ortağımız Paddle.com tarafından güvenle işlenir. GMA kart bilgilerinizi saklamaz. Aşağıdaki buton Paddle'ın güvenli ödeme sayfasını açar.",
    checkoutSecuredNote: "Paddle.com güvencesiyle - kart verileri GMA sunucularında saklanmaz.",
    paddleConfigMissing: "Paddle ödeme altyapısı henüz yapılandırılmamış. Admin panelinden client token ve plan Price ID bilgilerini ekleyin.",
    paddlePriceMissing: "Bu plan için Paddle Price ID eksik. Admin panelinden plan Price ID bilgisini ekleyin."
  },
  ru: {
    howSub: "Рыночные данные в 4 шага", step3t: "Обзор", step3d: "Структурированная рыночная аналитика через GMA Consensus Engine", step4t: "Контекст", step4d: "Создайте собственную рамку решений на основе данных, баллов и контекста", feat2d: "Проверяйте согласованность данных через GMA Consensus Engine", feat5d: "Настраивайте уведомления о движении цены и отслеживайте рост или падение", pricingTitle: "AI-аналитика рыночных данных", aboutSub: "Платформа рыночных данных с структурированной аналитикой и ясностью по глобальным рынкам.", footerCompliance: "GMA — платформа визуализации рыночных данных с AI. GMA не является инвестиционным советником и не предоставляет финансовые рекомендации. Платежи безопасно обрабатываются Paddle.com.", planStrategistLabel: "Профессиональный", planProArchitectLabel: "Корпоративный", planProArchitectBadge: "КОРПОРАТИВНЫЙ", planProArchitectScope: "Глобально + Analytics DNA · 126 лет", recommendation: "ОЦЕНКА", recommended: "ЛУЧШИЙ БАЛЛ", aiRecommendation: "ВЫДЕЛЕННЫЙ КОМПОЗИТНЫЙ БАЛЛ", alternativeChoice: "ВТОРИЧНЫЙ АНАЛИТИЧЕСКИЙ АКЦЕНТ", finalDecisionNotice: "ТОЛЬКО ДЛЯ ИНФОРМАЦИИ - НЕ ФИНАНСОВЫЙ СОВЕТ", finalBullet2: "Ни один вывод не является рекомендацией купить, продать или держать.", finalBullet3: "Значения риска являются иллюстративными баллами, а не торговыми указаниями.", comparisonIntro: "GMA Intelligence Layer создает учебные баллы и контекст по каждой компании", startAiComparisonAnalysis: "Начать AI-обзор сравнения", companiesAiComparison: "компании · AI-сравнение рынка"
  },
  ar: {
    howSub: "بيانات السوق في 4 خطوات", step3t: "مراجعة", step3d: "ذكاء سوقي منظم عبر GMA Consensus Engine", step4t: "تأطير", step4d: "ابن إطارك الخاص باستخدام البيانات والدرجات والسياق", feat2d: "راجع توافق البيانات المؤسسي من GMA Consensus Engine", feat5d: "اضبط تنبيهات حركة السعر وتابع الصعود أو الهبوط فوراً", pricingTitle: "ذكاء سوقي AI للبيانات العالمية", aboutSub: "منصة ذكاء بيانات سوقية تقدم تحليلات منظمة ووضوحاً عبر الأسواق العالمية.", footerCompliance: "GMA منصة عرض بيانات سوقية مدعومة بالذكاء الاصطناعي. ليست مستشاراً استثمارياً ولا تقدم نصائح مالية. تتم المدفوعات بأمان عبر Paddle.com.", planStrategistLabel: "احترافي", planProArchitectLabel: "مؤسسي", planProArchitectBadge: "مؤسسي", planProArchitectScope: "عالمي + Analytics DNA · 126 سنة", recommendation: "الدرجات", recommended: "أعلى درجة", aiRecommendation: "أبرز درجة مركبة", alternativeChoice: "إبراز بيانات ثانوي", finalDecisionNotice: "للمعلومات فقط - ليست نصيحة مالية", finalBullet2: "لا يمثل أي مخرج توصية شراء أو بيع أو احتفاظ.", finalBullet3: "قيم المخاطر مدخلات درجات توضيحية وليست تعليمات تداول.", comparisonIntro: "ينشئ GMA Intelligence Layer درجات تعليمية وسياقاً لكل شركة", startAiComparisonAnalysis: "ابدأ مراجعة مقارنة AI", companiesAiComparison: "شركات · مقارنة سوقية بمساعدة AI"
  },
  zh: {
    howSub: "4 步查看全球市场数据", step3t: "查看", step3d: "通过 GMA Consensus Engine 获取结构化市场情报", step4t: "形成框架", step4d: "用数据、评分和背景建立自己的决策框架", feat2d: "通过 GMA Consensus Engine 查看机构级数据一致性", feat5d: "设置价格变动提醒，实时关注上涨或下跌", pricingTitle: "全球数据的 AI 市场情报", aboutSub: "提供全球市场结构化分析与清晰视角的市场数据智能平台。", footerCompliance: "GMA 是 AI 支持的市场数据可视化平台。GMA 不是注册投资顾问，也不提供金融建议。付款由 Paddle.com 安全处理。", planStrategistLabel: "专业版", planProArchitectLabel: "企业版", planProArchitectBadge: "企业级", planProArchitectScope: "全球 + Analytics DNA · 126 年", recommendation: "评分", recommended: "最高评分", aiRecommendation: "综合评分亮点", alternativeChoice: "次级数据亮点", finalDecisionNotice: "仅供参考 - 不构成金融建议", finalBullet2: "任何输出都不是买入、卖出或持有建议。", finalBullet3: "风险值只是示例评分输入，不是交易指令。", comparisonIntro: "GMA Intelligence Layer 为每家公司生成教育性评分和背景", startAiComparisonAnalysis: "开始 AI 比较查看", companiesAiComparison: "家公司 · AI 辅助市场比较"
  },
  hi: {
    howSub: "4 चरणों में वैश्विक बाज़ार डेटा", step3t: "समीक्षा", step3d: "GMA Consensus Engine से संरचित बाज़ार इंटेलिजेंस", step4t: "फ़्रेम करें", step4d: "डेटा, स्कोर और संदर्भ से अपना निर्णय ढाँचा बनाएँ", feat2d: "GMA Consensus Engine से संस्थागत-स्तर डेटा संरेखण देखें", feat5d: "मूल्य-गतिविधि अलर्ट सेट करें और बढ़त या गिरावट तुरंत देखें", pricingTitle: "वैश्विक डेटा के लिए AI बाज़ार इंटेलिजेंस", aboutSub: "वैश्विक बाज़ारों में संरचित एनालिटिक्स और स्पष्टता देने वाला बाज़ार डेटा प्लेटफ़ॉर्म।", footerCompliance: "GMA AI-समर्थित बाज़ार डेटा विज़ुअलाइज़ेशन प्लेटफ़ॉर्म है। GMA पंजीकृत निवेश सलाहकार नहीं है और वित्तीय सलाह नहीं देता। भुगतान Paddle.com द्वारा सुरक्षित रूप से संसाधित होते हैं।", planStrategistLabel: "प्रोफेशनल", planProArchitectLabel: "एंटरप्राइज़", planProArchitectBadge: "एंटरप्राइज़", planProArchitectScope: "वैश्विक + Analytics DNA · 126 वर्ष", recommendation: "स्कोरिंग", recommended: "शीर्ष स्कोर", aiRecommendation: "समग्र स्कोर हाइलाइट", alternativeChoice: "द्वितीय डेटा हाइलाइट", finalDecisionNotice: "केवल जानकारी के लिए - वित्तीय सलाह नहीं", finalBullet2: "कोई भी आउटपुट खरीदने, बेचने या होल्ड करने की सलाह नहीं है।", finalBullet3: "जोखिम मान केवल उदाहरणात्मक स्कोर इनपुट हैं, ट्रेडिंग निर्देश नहीं।", comparisonIntro: "GMA Intelligence Layer हर कंपनी के लिए शैक्षिक स्कोर और संदर्भ बनाता है", startAiComparisonAnalysis: "AI तुलना समीक्षा शुरू करें", companiesAiComparison: "कंपनियाँ · AI-सहायता बाज़ार तुलना"
  },
  de: {
    howSub: "Globale Marktdaten in 4 Schritten", step3t: "Prüfen", step3d: "Strukturierte Marktintelligenz über die GMA Consensus Engine", step4t: "Einordnen", step4d: "Erstellen Sie Ihren eigenen Entscheidungsrahmen mit Daten, Scores und Kontext", feat2d: "Prüfen Sie institutionelle Datenausrichtung aus der GMA Consensus Engine", feat5d: "Setzen Sie Preisbewegungsalarme und verfolgen Sie Anstiege oder Rückgänge sofort", pricingTitle: "AI-Marktintelligenz für globale Daten", aboutSub: "Eine Marktdaten-Intelligence-Plattform für strukturierte Analytik und Klarheit in globalen Märkten.", footerCompliance: "GMA ist eine AI-gestützte Plattform zur Visualisierung von Marktdaten. GMA ist kein registrierter Anlageberater und bietet keine Finanzberatung. Zahlungen werden sicher von Paddle.com verarbeitet.", planStrategistLabel: "Professional", planProArchitectLabel: "Enterprise", planProArchitectBadge: "ENTERPRISE", planProArchitectScope: "Global + Analytics DNA · 126 Jahre", recommendation: "SCORING", recommended: "TOP-SCORE", aiRecommendation: "KOMPOSIT-SCORE-HIGHLIGHT", alternativeChoice: "ZWEITER DATEN-HINWEIS", finalDecisionNotice: "NUR ZUR INFORMATION - KEINE FINANZBERATUNG", finalBullet2: "Kein Output ist eine Kauf-, Verkaufs- oder Halteempfehlung.", finalBullet3: "Risikowerte sind illustrative Score-Eingaben, keine Handelsanweisungen.", comparisonIntro: "GMA Intelligence Layer erzeugt edukative Scores und Kontext pro Unternehmen", startAiComparisonAnalysis: "AI-Vergleich prüfen", companiesAiComparison: "Unternehmen · AI-gestützter Marktvergleich"
  },
  es: {
    howSub: "Datos globales de mercado en 4 pasos", step3t: "Revisar", step3d: "Inteligencia de mercado estructurada mediante GMA Consensus Engine", step4t: "Enmarcar", step4d: "Crea tu propio marco con datos, puntuaciones y contexto", feat2d: "Revisa la alineación de datos institucional desde GMA Consensus Engine", feat5d: "Configura alertas de movimiento de precio y sigue subidas o caídas al instante", pricingTitle: "Inteligencia de mercado AI para datos globales", aboutSub: "Plataforma de inteligencia de datos de mercado con analítica estructurada y claridad global.", footerCompliance: "GMA es una plataforma de visualización de datos de mercado con AI. GMA no es asesor de inversión registrado ni ofrece asesoramiento financiero. Los pagos se procesan de forma segura por Paddle.com.", planStrategistLabel: "Profesional", planProArchitectLabel: "Empresarial", planProArchitectBadge: "EMPRESARIAL", planProArchitectScope: "Global + Analytics DNA · 126 años", recommendation: "PUNTUACIÓN", recommended: "MEJOR PUNTUACIÓN", aiRecommendation: "DESTACADO DE PUNTUACIÓN COMPUESTA", alternativeChoice: "SEGUNDO DESTACADO DE DATOS", finalDecisionNotice: "SOLO INFORMATIVO - NO ES ASESORAMIENTO FINANCIERO", finalBullet2: "Ninguna salida es recomendación de comprar, vender o mantener.", finalBullet3: "Los valores de riesgo son entradas de puntuación ilustrativas, no instrucciones de trading.", comparisonIntro: "GMA Intelligence Layer genera puntuaciones educativas y contexto por empresa", startAiComparisonAnalysis: "Iniciar revisión comparativa AI", companiesAiComparison: "empresas · comparación de mercado asistida por AI"
  }
};
Object.keys(T).forEach(code => {
  const values = GMA_PADDLE_COMPLIANCE_I18N[code] || GMA_PADDLE_COMPLIANCE_I18N.en;
  T[code] = { ...(T[code] || EN), ...values };
});
Object.assign(EN, GMA_PADDLE_COMPLIANCE_I18N.en);

function gmaPatchLegal(lang, page, match, replacement) {
  const list = GMA_LEGAL_STATIC?.[lang]?.[page];
  if (!Array.isArray(list)) return;
  const idx = list.findIndex(s => s.t && s.t.indexOf(match) !== -1);
  if (idx >= 0) list[idx] = { ...list[idx], ...replacement };
}
gmaPatchLegal('en', 'terms', 'No Financial Advice', {
  t: '3. Informational Market Data Only',
  b: 'GMA is not a registered financial adviser and does not provide financial, investment, legal, tax, buy/sell/hold or trading advice.\n\nAll AI-assisted outputs, scores, market summaries and visualizations are provided for informational and educational purposes only. Users remain solely responsible for their own decisions and should consult a qualified professional where appropriate.'
});
gmaPatchLegal('en', 'terms', 'Description of Service', {
  b: 'GMA is a subscription-based digital platform for AI-assisted market data visualization, company data aggregation, educational scoring and structured analytics.\n\nAll market data is supplied by third-party providers and is presented for informational purposes only.'
});
gmaPatchLegal('en', 'privacy', 'Information We Collect', {
  b: 'GMA operates as a client-side web application and collects only the minimum data needed to run the service:\n\n• Account information: email and display name, stored locally in your browser where applicable.\n• Platform configuration: admin-provided service keys and Paddle client tokens may be stored in browser localStorage for deployment configuration. Regular users are not asked to provide AI API keys.\n• Payment data: processed entirely by Paddle.com as Merchant of Record. GMA does not receive, store or process card details.\n• Analytics: anonymous, aggregated usage data only where enabled.'
});
gmaPatchLegal('tr', 'terms', 'Yatirim Tavsiyesi', {
  t: '3. Yalnızca Bilgilendirici Piyasa Verisi',
  b: 'GMA kayıtlı bir yatırım danışmanı değildir ve finansal, yatırım, hukuki, vergi, al/sat/tut veya alım satım tavsiyesi sunmaz.\n\nTüm AI destekli çıktılar, skorlar, piyasa özetleri ve görselleştirmeler yalnızca bilgilendirme ve eğitim amaçlıdır. Kullanıcılar kendi kararlarından tamamen sorumludur ve gerekli durumlarda yetkin bir uzmana danışmalıdır.'
});
gmaPatchLegal('tr', 'terms', 'Hizmetin Tanimi', {
  b: 'GMA; abonelik esaslı AI destekli piyasa verisi görselleştirme, şirket verisi toplama, eğitim amaçlı skorlama ve yapılandırılmış analitik sunan dijital bir platformdur.\n\nTüm piyasa verileri üçüncü taraf sağlayıcılardan gelir ve yalnızca bilgilendirme amacıyla sunulur.'
});
gmaPatchLegal('tr', 'privacy', 'Topladığımız', {
  b: 'GMA istemci taraflı bir web uygulaması olarak çalışır ve yalnızca hizmet için gerekli minimum veriyi toplar:\n\n• Hesap bilgileri: e-posta ve görünen ad, gerektiğinde tarayıcınızda yerel olarak saklanır.\n• Platform yapılandırması: admin tarafından sağlanan servis anahtarları ve Paddle client token bilgileri dağıtım yapılandırması için tarayıcı localStorage alanında saklanabilir. Normal kullanıcılardan AI API anahtarı istenmez.\n• Ödeme verileri: Merchant of Record olarak Paddle.com tarafından tamamen işlenir. GMA kart bilgisi almaz, saklamaz veya işlemez.\n• Analitik: etkinse yalnızca anonim ve toplu kullanım verisi.'
});
gmaPatchLegal('tr', 'privacy', 'Bilgiler', {
  b: 'GMA istemci taraflı bir web uygulaması olarak çalışır ve yalnızca hizmet için gerekli minimum veriyi toplar:\n\n• Hesap bilgileri: e-posta ve görünen ad, gerektiğinde tarayıcınızda yerel olarak saklanır.\n• Platform yapılandırması: admin tarafından sağlanan servis anahtarları ve Paddle client token bilgileri dağıtım yapılandırması için tarayıcı localStorage alanında saklanabilir. Normal kullanıcılardan AI API anahtarı istenmez.\n• Ödeme verileri: Merchant of Record olarak Paddle.com tarafından tamamen işlenir. GMA kart bilgisi almaz, saklamaz veya işlemez.\n• Analitik: etkinse yalnızca anonim ve toplu kullanım verisi.'
});

// ── Ceviri Tablosu ──
// ── Dinamik AI Ceviri Sistemi (80 dil icin) ──
// localStorage cache: 'gma_tr_LANGCODE' → JSON string
const AI_TRANS_CACHE = {};
const AI_TRANS_LOADING = {};
let _aiTransCallbacks = {};

// Belirli bir dil icin cache'den ceviriyi al
function getCachedTranslation(langCode) {
  if (AI_TRANS_CACHE[langCode]) return AI_TRANS_CACHE[langCode];
  try {
    const stored = localStorage.getItem('gma_tr_' + langCode);
    if (stored) {
      AI_TRANS_CACHE[langCode] = JSON.parse(stored);
      return AI_TRANS_CACHE[langCode];
    }
  } catch {}
  return null;
}

// AI ile ceviri yap ve cache'e kaydet
async function translateWithAI(langCode, langName, onDone) {
  if (CORE_LANGS.includes(langCode)) return; // zaten var
  if (AI_TRANS_LOADING[langCode]) {
    // zaten yukleniyor, callback ekle
    _aiTransCallbacks[langCode] = _aiTransCallbacks[langCode] || [];
    _aiTransCallbacks[langCode].push(onDone);
    return;
  }
  const cached = getCachedTranslation(langCode);
  if (cached) {
    onDone && onDone(cached);
    return;
  }
  AI_TRANS_LOADING[langCode] = true;
  _aiTransCallbacks[langCode] = _aiTransCallbacks[langCode] || [];
  if (onDone) _aiTransCallbacks[langCode].push(onDone);
  const platformKey = localStorage.getItem('gma_platform_key') || '';
  if (!platformKey) {
    // Platform key yoksa EN fallback kullan
    AI_TRANS_LOADING[langCode] = false;
    return;
  }

  // EN objesi uzerinden ceviri iste
  const enKeys = Object.entries(EN).map(([k, v]) => `${k}: ${v}`).join(' | ');
  const prompt = `Translate the following key:value pairs from English to ${langName}. Keep the exact same key names. Return ONLY a valid JSON object with the same keys. Do NOT translate: GMA, Claude, Gemini, ChatGPT, AI, Paddle, API, URL links, email addresses, brand names. Translate everything else faithfully. JSON only, no explanation:\n\n{${enKeys}}`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system: 'You are a professional translator. Return ONLY valid JSON. No markdown, no explanation.',
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    if (!res.ok) throw new Error('API ' + res.status);
    const json = await res.json();
    const txt = (json.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const s = txt.indexOf('{'),
      e = txt.lastIndexOf('}');
    if (s === -1 || e === -1) throw new Error('No JSON');
    const translated = JSON.parse(txt.slice(s, e + 1));
    // EN uzerindeki eksik keyleri doldur
    Object.keys(EN).forEach(k => {
      if (!translated[k]) translated[k] = EN[k];
    });
    AI_TRANS_CACHE[langCode] = translated;
    localStorage.setItem('gma_tr_' + langCode, JSON.stringify(translated));
    const cbs = _aiTransCallbacks[langCode] || [];
    cbs.forEach(cb => cb && cb(translated));
    _aiTransCallbacks[langCode] = [];
  } catch (e) {
    console.warn('Translation failed for', langCode, e.message);
    // Fallback to EN
    AI_TRANS_CACHE[langCode] = {
      ...EN
    };
  }
  AI_TRANS_LOADING[langCode] = false;
}

// T'yi dinamik dil destegiyle genislet
function getTranslations(langCode) {
  if (T[langCode]) return T[langCode];
  const cached = getCachedTranslation(langCode);
  if (cached) return cached;
  return EN; // loading sirasinda EN goster
}

// Translation hook
function useLang() {
  return React.useContext(LangContext);
}
function LangSelector() {
  const {
    lang,
    setLang,
    aiTranslating
  } = useLang();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const cur = LANGS.find(l => l.c === lang) || LANGS[0];
  React.useEffect(() => {
    const fn = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${aiTranslating ? 'rgba(251,191,36,0.4)' : '#1e293b'}`,
      borderRadius: "8px",
      padding: "5px 9px",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "inherit",
      color: aiTranslating ? "#fbbf24" : "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    }
  }, aiTranslating ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px'
    }
  }, "\u27F3") : /*#__PURE__*/React.createElement(LangFlag, { code: cur.c }), /*#__PURE__*/React.createElement("span", null, cur.n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10px",
      opacity: 0.8
    }
  }, open ? "▲" : "▼")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      right: 0,
      background: "#0c1220",
      border: "1px solid #1e293b",
      borderRadius: "12px",
      minWidth: "190px",
      maxHeight: "300px",
      overflowY: "auto",
      zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,0.7)"
    }
  }, (() => {
    const SUPPORTED = ['en', 'tr', 'ru', 'ar', 'zh', 'hi', 'de', 'es'];
    const sup = LANGS.filter(l => SUPPORTED.includes(l.c));
    const renderBtn = l => /*#__PURE__*/React.createElement("button", {
      key: l.c,
      onClick: () => {
        setLang(l.c);
        setOpen(false);
      },
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "6px 12px",
        background: l.c === lang ? "rgba(56,189,248,0.1)" : "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "inherit",
        color: l.c === lang ? "#38bdf8" : "#94a3b8",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement(LangFlag, { code: l.c }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, l.n), l.c === lang && "✓");
    return /*#__PURE__*/React.createElement(React.Fragment, null, sup.map(renderBtn));
  })()));
}

// ── PURE SVG CHARTS — CDN bagimliligi yok ──
function SvgSparkline({
  data,
  color
}) {
  if (!data || data.length < 2) return null;
  const W = 200,
    H = 40;
  const vals = data.map(d => d.v);
  const min = Math.min(...vals),
    max = Math.max(...vals);
  const rng = max - min || 1;
  const px = i => i / (vals.length - 1) * W;
  const py = v => H - 2 - (v - min) / rng * (H - 6);
  const pts = vals.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`);
  const line = `M ${pts.join(' L ')}`;
  const area = `M 0,${H} L ${pts.join(' L ')} L ${W},${H} Z`;
  const gid = `sg${color.replace(/[^a-z0-9]/gi, '')}${Math.floor(Math.random() * 9999)}`;
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "5%",
    stopColor: color,
    stopOpacity: "0.35"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "95%",
    stopColor: color,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#${gid})`
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  }));
}
function SvgHistoryChart({
  data,
  color,
  events,
  secColor,
  crisisYears
}) {
  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  if (!data || data.length < 2) return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 280,
      background: '#060912'
    }
  });
  const PAD = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 52
  };
  const W = 680,
    H = 280;
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const years = data.map(d => d.year);
  const prices = data.map(d => d.price);
  const minP = Math.min(...prices),
    maxP = Math.max(...prices);
  const rng = maxP - minP || 1;
  const minY = years[0],
    maxY = years[years.length - 1];
  const yrng = maxY - minY || 1;
  const cx = y => PAD.left + (y - minY) / yrng * cW;
  const cy = p => PAD.top + cH - (p - minP) / rng * cH;
  const pts = data.map(d => `${cx(d.year).toFixed(1)},${cy(d.price).toFixed(1)}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `M ${cx(minY)},${PAD.top + cH} L ${pts.join(' L ')} L ${cx(maxY)},${PAD.top + cH} Z`;

  // Y axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({
    length: yTicks
  }, (_, i) => minP + rng / yTicks * i);

  // X axis ticks — every ~5 years
  const step = Math.ceil(yrng / 10);
  const xTickYears = [];
  for (let y = Math.ceil(minY / step) * step; y <= maxY; y += step) xTickYears.push(y);
  const handleMouse = e => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (W / rect.width);
    const yearAtX = minY + (relX - PAD.left) / cW * yrng;
    const closest = data.reduce((a, b) => Math.abs(b.year - yearAtX) < Math.abs(a.year - yearAtX) ? b : a);
    const ev = (events || []).find(e => e.y === closest.year);
    setTip({
      year: closest.year,
      price: closest.price,
      event: ev?.l,
      x: cx(closest.year),
      y: cy(closest.price)
    });
  };
  const fmtPrice = p => p >= 1000 ? `$${(p / 1000).toFixed(1)}K` : `$${p.toFixed(0)}`;
  return /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: {
      display: 'block',
      cursor: 'crosshair'
    },
    onMouseMove: handleMouse,
    onMouseLeave: () => setTip(null)
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "histGrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "5%",
    stopColor: color,
    stopOpacity: "0.25"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "95%",
    stopColor: color,
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "chartClip"
  }, /*#__PURE__*/React.createElement("rect", {
    x: PAD.left,
    y: PAD.top,
    width: cW,
    height: cH
  }))), yTickVals.map((v, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: PAD.left,
    y1: cy(v),
    x2: PAD.left + cW,
    y2: cy(v),
    stroke: "#0f172a",
    strokeWidth: "1"
  })), [{
    y: 2000,
    l: "Dot-com",
    c: "#f87171"
  }, {
    y: 2008,
    l: "2008",
    c: "#f87171"
  }, {
    y: 2020,
    l: "COVID",
    c: "#fbbf24"
  }, {
    y: 2022,
    l: "Enflasyon",
    c: "#f87171"
  }].filter(cr => cr.y >= minY && cr.y <= maxY).map(cr => /*#__PURE__*/React.createElement("g", {
    key: cr.y
  }, /*#__PURE__*/React.createElement("line", {
    x1: cx(cr.y),
    y1: PAD.top,
    x2: cx(cr.y),
    y2: PAD.top + cH,
    stroke: cr.c,
    strokeWidth: "1",
    strokeDasharray: "4 4",
    opacity: "0.6"
  }), /*#__PURE__*/React.createElement("text", {
    x: cx(cr.y) + 3,
    y: PAD.top + 10,
    fill: cr.c,
    fontSize: "7",
    opacity: "0.8"
  }, cr.l))), (events || []).filter(ev => ev.y >= minY && ev.y <= maxY).map(ev => /*#__PURE__*/React.createElement("line", {
    key: ev.y,
    x1: cx(ev.y),
    y1: PAD.top,
    x2: cx(ev.y),
    y2: PAD.top + cH,
    stroke: `${secColor || '#38bdf8'}66`,
    strokeWidth: "1",
    strokeDasharray: "2 4"
  })), /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: "url(#histGrad)",
    clipPath: "url(#chartClip)"
  }), /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinejoin: "round",
    clipPath: "url(#chartClip)"
  }), yTickVals.map((v, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: PAD.left - 6,
    y: cy(v) + 4,
    fill: "#cbd5e1",
    fontSize: "9",
    textAnchor: "end"
  }, fmtPrice(v))), xTickYears.map(y => /*#__PURE__*/React.createElement("text", {
    key: y,
    x: cx(y),
    y: PAD.top + cH + 16,
    fill: "#cbd5e1",
    fontSize: "9",
    textAnchor: "middle"
  }, y)), tip && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: tip.x,
    y1: PAD.top,
    x2: tip.x,
    y2: PAD.top + cH,
    stroke: "#475569",
    strokeWidth: "1",
    strokeDasharray: "3 3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: tip.x,
    cy: tip.y,
    r: "4",
    fill: color,
    stroke: "#060912",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: Math.min(tip.x + 8, W - 130),
    y: tip.y - 36,
    width: "120",
    height: tip.event ? 44 : 28,
    rx: "6",
    fill: "#0c1528",
    stroke: "#1e293b"
  }), /*#__PURE__*/React.createElement("text", {
    x: Math.min(tip.x + 14, W - 124),
    y: tip.y - 20,
    fill: "#cbd5e1",
    fontSize: "9"
  }, tip.year), /*#__PURE__*/React.createElement("text", {
    x: Math.min(tip.x + 14, W - 124),
    y: tip.y - 8,
    fill: "#34d399",
    fontSize: "11",
    fontWeight: "bold"
  }, fmtPrice(tip.price)), tip.event && /*#__PURE__*/React.createElement("text", {
    x: Math.min(tip.x + 14, W - 124),
    y: tip.y + 6,
    fill: "#fbbf24",
    fontSize: "8"
  }, "\u26A1 ", tip.event.slice(0, 16))));
}

// ── MARKET STATUS SYSTEM ──
// listed   → Borsada islem goruyor (halka acik)
// private  → Private company, no exchange plan / unknown
// ipo_prep → IPO preparation / kesin plan
// ipo_rumor→ IPO soylentisi / analist tahmini
// pre_ipo  → Halka arz dosyasi verildi / yakin

const IPO_STATUS = {
  listed: {
    label: "LISTED",
    tKey: "listedStatus",
    color: "#34d399",
    icon: "◆",
    desc: "Listed stock is actively traded"
  },
  private: {
    label: "PRIVATE",
    tKey: "privateStatus",
    color: "#a78bfa",
    icon: "⬇",
    desc: "Private company"
  },
  pre_ipo: {
    label: "IPO SOON",
    tKey: "ipoSoonStatus",
    color: "#f97316",
    icon: "⚡",
    desc: "IPO filing submitted"
  },
  ipo_prep: {
    label: "IPO PREP",
    tKey: "ipoPrepStatus",
    color: "#fbbf24",
    icon: "◎",
    desc: "IPO preparation is in progress"
  },
  ipo_rumor: {
    label: "IPO RUMOR",
    tKey: "rumorStatus",
    color: "#818cf8",
    icon: "○",
    desc: "Analyst/press estimate"
  }
};
const SECTORS = {
  tech: {
    label: "TECHNOLOGY",
    tKey: "sectorTech",
    color: "#38bdf8"
  },
  ai: {
    label: "AI",
    tKey: "sectorAi",
    color: "#a78bfa"
  },
  crypto: {
    label: "CRYPTO",
    tKey: "sectorCrypto",
    color: "#fbbf24"
  },
  food: {
    label: "FOOD",
    tKey: "sectorFood",
    color: "#34d399"
  },
  auto: {
    label: "AUTOMOTIVE",
    tKey: "sectorAuto",
    color: "#f87171"
  },
  aerospace: {
    label: "AEROSPACE",
    tKey: "sectorAerospace",
    color: "#818cf8"
  },
  defense: {
    label: "DEFENSE",
    tKey: "sectorDefense",
    color: "#fb923c"
  },
  chip: {
    label: "SEMICONDUCTOR",
    tKey: "sectorChip",
    color: "#22d3ee"
  },
  finance: {
    label: "FINANCE",
    tKey: "sectorFinance",
    color: "#86efac"
  },
  metals: {
    label: "PRECIOUS METALS",
    tKey: "sectorMetals",
    color: "#fcd34d"
  },
  banking: {
    label: "BANKING",
    tKey: "sectorBanking",
    color: "#60a5fa"
  },
  fashion: {
    label: "FASHION",
    tKey: "sectorFashion",
    color: "#f472b6"
  },
  health: {
    label: "HEALTH",
    tKey: "sectorHealth",
    color: "#4ade80"
  }
};
const COMPANIES_NORMALIZED = COMPANIES.map(c => ({
  ...c,
  ipoStatus: c.ipoStatus || (c.isPrivate ? "private" : "listed")
}));

// Notable upcoming IPOs with extra detail (merged in)
const IPO_OVERRIDES = {
  // SpaceX
  "SPACEX3": {
    ipoStatus: "ipo_rumor",
    ipoYear: 2027,
    ipoNote: "Elon: 'Starlink may list separately.' Main SpaceX body expected 2027+",
    ipoVal: "$350B"
  },
  // Baykar
  "BAYKT": {
    ipoStatus: "ipo_prep",
    ipoYear: 2026,
    ipoNote: "Reported preparations for a quota application to the Istanbul Exchange",
    ipoVal: "$20B+"
  },
  // TUSAS
  "TUSAS": {
    ipoStatus: "ipo_prep",
    ipoYear: 2026,
    ipoNote: "Awaiting approval from the Defense Industry Directorate, BIST listing is on the agenda",
    ipoVal: "$15B+"
  },
  // Anduril
  "ANDR": {
    ipoStatus: "ipo_rumor",
    ipoYear: 2026,
    ipoNote: "IPO preparation signal was given in the 2025 funding round",
    ipoVal: "$28B"
  },
  // Blue Origin
  "BORIGN": {
    ipoStatus: "ipo_rumor",
    ipoYear: 2027,
    ipoNote: "Management change after Jeff Bezos’ sale, IPO is being discussed",
    ipoVal: "$10B+"
  },
  // Stripe
  "COIN": {
    ipoStatus: "listed"
  },
  // Togg
  "TOGG": {
    ipoStatus: "ipo_prep",
    ipoYear: 2026,
    ipoNote: "BIST IPO targeted for 2025-2026. Turkish state company",
    ipoVal: "$3B+"
  },
  // Binance
  "BNB": {
    ipoStatus: "ipo_rumor",
    ipoYear: 2028,
    ipoNote: "Post-CZ lawsuit, IPO is uncertain — new management has hinted at it",
    ipoVal: "$100B+"
  },
  // Epic Games
  "EPIC": {
    ipoStatus: "ipo_rumor",
    ipoYear: 2027,
    ipoNote: "Tim Sweeney repeatedly denied it, but pressure increased after the Apple lawsuit",
    ipoVal: "$32B"
  },
  // Kioxia
  "KIOXIA": {
    ipoStatus: "pre_ipo",
    ipoYear: 2025,
    ipoNote: "2025 listing on the Tokyo Exchange became clearer — successor to Toshiba Memory",
    ipoVal: "$15B"
  },
  // Cargill
  "CARL": {
    ipoStatus: "private",
    ipoNote: "World’s largest private company. IPO probability is very low - family-owned company",
    ipoVal: "$45B"
  },
  // Mars
  "MARS": {
    ipoStatus: "private",
    ipoNote: "Mars family retains control. IPO is not planned",
    ipoVal: "$50B+"
  },
  // Xiaomi Auto
  "XIOMI": {
    ipoStatus: "listed",
    ipoNote: "Parent Xiaomi Corp is listed on the Hong Kong Exchange (HKG:1810)"
  },
  // SDT
  "SDTUZ": {
    ipoStatus: "ipo_prep",
    ipoYear: 2027,
    ipoNote: "A rising star in the Turkish defense ecosystem — BIST preparation",
    ipoVal: "$500M+"
  }
};
const COMPANIES_FINAL = COMPANIES_NORMALIZED.map(c => ({
  ...c,
  ...(IPO_OVERRIDES[c.ticker] || {})
}));

// ── COMPREHENSIVE FOUNDING-YEAR TABLE ──
const FOUNDING_YEARS = {
  // TECHNOLOGY
  AAPL: 1976,
  MSFT: 1975,
  AMZN: 1994,
  NFLX: 1997,
  ORCL: 1977,
  CRM: 1999,
  ADBE: 1982,
  SAP: 1972,
  NOW: 2004,
  SHOP: 2006,
  TCEHY: 1998,
  ADSK: 1982,
  DASTY: 1981,
  PTC: 1985,
  TRMB: 1978,
  NEMKY: 1963,
  BSY: 1994,
  SIEGY: 1847,
  EPIC: 1991,
  MCNL: 1980,
  // AI
  NVDA: 1993,
  GOOGL: 1998,
  META: 2004,
  PLTR: 2003,
  OPENAI: 2015,
  ANTHR: 2021,
  XAI: 2023,
  PERPL: 2022,
  COHR: 2019,
  HGF: 2016,
  GLEAN: 2019,
  MISTR: 2023,
  DEEPSK: 2023,
  BAICHN: 2023,
  ZHIPU: 2019,
  KIMI: 2023,
  // KRIPTO
  COIN: 2012,
  BNB: 2017,
  OKX: 2017,
  BYBIT: 2018,
  KRKN: 2011,
  SQ: 2009,
  BITPAY: 2010,
  MOONP: 2019,
  MSTR: 1989,
  LINK: 2017,
  CNSYS: 2014,
  LEDGR: 2014,
  // FOOD
  MCD: 1940,
  NSRGY: 1866,
  UL: 1929,
  KO: 1886,
  PEP: 1898,
  MDLZ: 2012,
  DANOY: 1919,
  HEINY: 1864,
  BUD: 1366,
  KHC: 1869,
  GIS: 1866,
  K: 1906,
  TSN: 1935,
  ADM: 1902,
  BG: 1818,
  JBSAY: 1953,
  SBUX: 1971,
  YUM: 1997,
  QSR: 2014,
  CMG: 1993,
  DRI: 1968,
  ARMK: 1959,
  CMPGY: 1941,
  SDXAY: 1966,
  ULKER: 1944,
  AGHOL: 1950,
  CAYKR: 1971,
  // OTOMOTIV
  TSLA: 2003,
  GM: 1908,
  F: 1903,
  RIVN: 2009,
  TM: 1937,
  HYMTF: 1967,
  KIMTF: 1944,
  BYDDF: 1995,
  XIOMI: 2010,
  BMWYY: 1916,
  MBGYY: 1926,
  VWAGY: 1937,
  RACE: 1939,
  DRPRY: 1931,
  RNLSY: 1899,
  VLVLY: 1927,
  NSANY: 1928,
  MZDAY: 1920,
  FUJHY: 1953,
  MSBHY: 1970,
  MAHM: 1945,
  MSTU: 1981,
  LCID: 2007,
  GWLLY: 1984,
  SERES: 2016,
  GELYY: 1986,
  ZK: 2021,
  LEAP: 2015,
  FFIE: 2014,
  TOGG: 2018,
  // AEROSPACEls
  DAL: 1924,
  UAL: 1926,
  AAL: 1926,
  LUV: 1967,
  DLAKY: 1953,
  AFKL: 1919,
  ICAGY: 1974,
  RYAAY: 1984,
  THYAO: 1933,
  EMIRA_: 1985,
  CJNSY: 1988,
  AICHY: 1988,
  LTM: 2010,
  SINGY: 1947,
  CPCAY: 1946,
  QUBSF: 1920,
  INDIG: 2006,
  BA: 1916,
  EADSY2: 1970,
  ERBR: 1969,
  BDRBF: 1942,
  TXT: 1923,
  GEAD: 1892,
  SPACEX3: 2002,
  BORIGN: 2000,
  // SAVUNMA
  LMT: 1912,
  RTX: 1934,
  NOC: 1939,
  GD: 1952,
  LHX: 2019,
  HII: 2011,
  LDOS: 2016,
  BAH: 1914,
  AVAV: 1971,
  KTOS: 2000,
  CW: 1929,
  PSN: 1984,
  EADSY: 1970,
  BAESY: 1999,
  DASTY2: 1929,
  FINMY: 1948,
  SAABF: 1937,
  THLEF: 1893,
  RNMBY: 1889,
  HENS: 1948,
  KOGS: 1814,
  MTUAY: 1934,
  RYCEY: 1884,
  IAI: 1953,
  ESLT: 1966,
  HNWHA: 1952,
  MHVYF: 1884,
  KWHIY: 1896,
  BEL: 1954,
  SGGKF: 1967,
  TUSAS: 1973,
  BAYKT: 1984,
  ASELS: 1975,
  OTKAR: 1963,
  ANDR: 2017,
  // YARIILETKEN
  TSM: 1987,
  SSNLF2: 1969,
  AVGO2: 1961,
  AMD3: 1969,
  QCOM: 1985,
  ARM: 1990,
  ASML: 1984,
  AMAT: 1967,
  LRCX: 1980,
  KLAC: 1976,
  TOELY: 1963,
  ENTG: 1966,
  MU: 1978,
  HXSCL: 1983,
  WDC: 1970,
  TXN: 1951,
  ADI: 1965,
  MCHP: 1989,
  IFNNY: 1999,
  NXPI: 2006,
  STM: 1987,
  ON: 1999,
  RNEZY: 2002,
  WOLF: 2000,
  CDNS: 1988,
  SNPS: 1986,
  MRVL: 1997,
  MTKY: 1997,
  // FINANCE
  JPM: 1799,
  BAC: 1904,
  WFC: 1852,
  C: 1812,
  HSBC: 1865,
  BNPQY: 1848,
  SAN: 1857,
  UBSG: 1862,
  RY: 1864,
  IDCBY: 1984,
  GS: 1869,
  MS: 1935,
  BRK_B: 1839,
  BLK: 1988,
  STT: 1792,
  NTRS: 1889,
  BK: 1784,
  BEN: 1947,
  IVZ: 1935,
  TROW: 1937,
  BX: 1985,
  KKR: 1976,
  BAM: 1899,
  V: 1958,
  MA: 1966,
  AXP: 1850,
  PYPL: 1998,
  FISV: 1984,
  FIS: 1968,
  SPGI: 1860,
  MCO: 1900,
  ALV: 1890,
  AXAHY: 1852,
  MET: 1868,
  PRU: 1875,
  MMC: 1871,
  MURGY: 1880,
  // PRECIOUS METALS
  NEM: 1921,
  GOLD: 1983,
  AU: 1944,
  AEM: 1972,
  KGC: 1993,
  GFI: 1998,
  EGO: 1992,
  AUYAF: 2003,
  BTG: 2007,
  WPM: 2004,
  AG: 1979,
  PAAS: 1994,
  SVM: 2003,
  MAG: 1999,
  SBSW: 2017,
  ANGPY: 1995,
  IPPLF: 1924,
  NMPNF: 1995,
  FCX: 1987,
  ANFGF: 1888,
  TECK: 1906,
  IVN: 1994,
  GLNCY: 1974,
  NCPKF: 1993,
  VALE: 1942,
  ALB: 1887,
  SQM: 1968,
  PLL: 2016,
  LAC: 2007,
  MP: 2020,
  LYSDY: 2001,
  UUUU: 1987,
  DEERS: 1888,
  ALRS: 1992,
  LUC: 2004,
  PDL: 1902,
  GEMCO: 2012,
  BHP: 1885,
  RIO: 1873,
  AAUKF: 1917,
  S32: 2015,
  FSUMF: 1987,
  WDS: 2022,
  ERGLI: 1965,
  ISDMR: 1970,
  KOZAL: 1996,
  KOZAA: 1990,
  MBII: 2010,
  // APPAREL & MODA
  LVMUY: 1987,
  CFRUY: 1847,
  PPRUY: 1963,
  HESAY: 1837,
  PRDSY: 1913,
  MONRY: 1952,
  BURBY: 1856,
  CHANEL: 1910,
  VERSAC: 1978,
  ARMANI: 1975,
  IDEXY: 1963,
  HNNMY: 1947,
  FRCOY: 1949,
  GAP: 1969,
  PVH: 1881,
  RL: 1967,
  TPR: 2017,
  CPRI: 2017,
  BOSSY: 1924,
  NKE: 1964,
  ADDYY: 1949,
  PMMAF: 1948,
  ONON: 2010,
  CROX: 2002,
  SKX: 1992,
  NB: 1906,
  TIMBL: 1973,
  ESLOY: 2018,
  SAFLY: 1878,
  SWGAY: 1983,
  MARCLN: 1961,
  PANDY: 1982,
  SIG: 1987,
  TIF: 1837,
  CART: 1847,
  BVLG: 1884,
  // HEALTHCARE
  LLY: 1876,
  NVO: 1923,
  JNJ: 1886,
  MRK: 1891,
  PFE: 1849,
  RHHBY: 1896,
  NVS: 1996,
  AZN: 1999,
  SNY: 1999,
  GSK: 2000,
  BAYRY: 1863,
  MRNA: 2010,
  BNTX: 2008,
  REGN: 1988,
  ABBV: 2013,
  BMY: 1887,
  AMGN: 1980,
  GILD: 1987,
  UNH: 1977,
  CVS: 1963,
  HUM: 1961,
  MCK: 1833,
  DVA: 1994,
  HCA: 1968,
  THC: 1967,
  MDT: 1949,
  ABT: 1888,
  ISRG: 1995,
  SYK: 1941,
  EW: 1958,
  BSX: 1979,
  ZBH: 1927,
  SMMNY: 2018,
  PHG: 1891,
  VRTX: 1989,
  CRSP: 2013,
  DXCM: 1999,
  BIIB: 1978,
  ILMN: 1998,
  ACIBM: 1991,
  MEMHSP: 2000,
  MEDLITR: 1992,
  MDBFI: 1992,
  SELCTR: 1975,
  ECILC: 1970,
  // BANKING
  DB: 1870,
  SCGLY: 1864,
  ING: 1991,
  BCS: 1690,
  LYG: 1765,
  SCBFF: 1853,
  UNCRY: 2003,
  IITSF: 2006,
  CRARY: 1894,
  CRZBY: 1870,
  AAVMY: 1720,
  SWEDY: 1820,
  NDEAY: 2001,
  DNBBY: 1822,
  DBSDY: 1968,
  OVCHY: 1932,
  KB: 2001,
  SHG: 1897,
  HDB: 1994,
  IBN: 1994,
  SBKFF: 1806,
  AXBKY: 1993,
  CBAUF: 1911,
  ANZBY: 1835,
  WBKGF: 1817,
  NABZY: 1858,
  SMFG: 2002,
  MFNSY: 2003,
  FABAD: 2007,
  RAJHI: 1957,
  RIBLF: 1957,
  NCKBY: 2021,
  QIBK: 1982,
  NBAD: 1985,
  TGABF: 1960,
  ITUB: 1924,
  BBD: 1943,
  BSBR: 1857,
  BPAC: 1983,
  ZIRTB: 1863,
  HALKB: 1938,
  VAKBN: 1954,
  GARAN: 1946,
  ISCTR: 1924,
  YKBNK: 1944,
  AKBNK: 1948,
  QNBFB: 1987,
  DENZB: 1938,
  TEBNK: 1927,
  SKBNK: 1953,
  KTFTK: 1989,
  TFINK: 1991,
  ALBKTR: 1992,
  FIBAB: 2010,
  ODEAB: 2012,
  INGTR: 1984,
  HSBTK: 1990,
  BURVA: 2012
};

// ── SIRKET OZEL OLAYLAR ──
function generateHistorical(ticker, founded, currentPrice) {
  const startYear = founded || 2000;
  const now = 2026;
  const points = [];

  // Baslangic icin geriye donuk normallestirilmis fiyat
  // currentPrice'i baz al ve geriye dogru buyume orani uygula
  const avgAnnualGrowth = 0.11;
  const years = now - startYear;
  let basePrice = currentPrice / Math.pow(1 + avgAnnualGrowth, years);
  basePrice = Math.max(0.10, basePrice);
  let price = basePrice;
  for (let y = startYear; y <= now; y++) {
    // Company-specific seeded randomness (deterministic)
    const seed = (ticker.charCodeAt(0) + y * 7) % 100;
    const growthRate = 0.08 + seed / 100 * 0.18 - 0.04;
    price = Math.max(0.05, price * (1 + growthRate));

    // Global krizler (kurulustan sonraysa uygula)
    if (y >= startYear) {
      if (y === 2000) price *= 0.72;
      if (y === 2001) price *= 0.68;
      if (y === 2002) price *= 0.82;
      if (y === 2008) price *= 0.52;
      if (y === 2009) price *= 1.28;
      if (y === 2020) price *= 0.68; // COVID crash
      if (y === 2021) price *= 1.45; // COVID recovery (corrected: 2020'den 2021'e moved)
      if (y === 2022) price *= 0.74;
      if (y === 2023) price *= 1.32;
    }
    points.push({
      year: y,
      price: parseFloat(price.toFixed(2))
    });
  }

  // Son noktayi currentPrice'a sabitle, tum seriyi oransal olarak scale et
  const lastPrice = points[points.length - 1]?.price || 1;
  const scale = currentPrice / lastPrice;
  return points.map(p => ({
    ...p,
    price: parseFloat((p.price * scale).toFixed(2))
  }));
}

// ── SIRKET META ──
const COMPANY_META = Object.fromEntries(Object.keys(FOUNDING_YEARS).map(ticker => [ticker, {
  founded: FOUNDING_YEARS[ticker],
  events: COMPANY_EVENTS[ticker] || []
}]));

// ── GMA DEMO MODE — Paddle review / API-key-absent fallback ──
const GMA_DEMO_ANALYSIS = {
  summary: "Apple Inc. demonstrates exceptional financial resilience with consistent revenue growth across its diversified product and services ecosystem. The company's transition to recurring services revenue provides stable high-margin income, while premium brand positioning maintains strong pricing power against competitors.",
  positive: [
    "Services segment growing 14% YoY — now 22% of total revenue with 72% gross margins",
    "Strong balance sheet: $162B cash reserves enabling R&D investment and buybacks",
    "Ecosystem lock-in drives 95%+ customer retention and cross-product adoption rates"
  ],
  negative: [
    "iPhone revenue (~52% of total) creates single-product dependency risk",
    "EU App Store regulatory headwinds may compress services margins in 2026",
    "Premium pricing limits addressable market in high-growth emerging economies"
  ],
  innovation: [
    "Vision Pro spatial computing positions company for next-generation computing paradigm",
    "Custom silicon (M-series) delivers industry-leading performance-per-watt ratios"
  ],
  sentiment: "POZITIF",
  sentimentPuan: 78,
  strengthScore: 87,
  riskScore: 28,
  kisaTimeframe: "Strong Q4 earnings forecast and new iPhone cycle expected to support near-term price appreciation. Services revenue growth provides consistent upside catalyst.",
  uzunTimeframe: "Sustained services segment expansion, Vision Pro ecosystem maturation, and continued share buyback program positions AAPL for long-term value appreciation through 2027.",
  _demo: true
};

function getGmaDemoAnalysis(t) {
  return {
    ...GMA_DEMO_ANALYSIS,
    summary: t('demoAnalysisSummary'),
    positive: [
      t('demoPositive1'),
      t('demoPositive2'),
      t('demoPositive3')
    ],
    negative: [
      t('demoRisk1'),
      t('demoRisk2'),
      t('demoRisk3')
    ],
    innovation: [
      t('demoInnovation1'),
      t('demoInnovation2')
    ],
    kisaTimeframe: t('demoShortTimeframe'),
    uzunTimeframe: t('demoLongTimeframe')
  };
}

const GMA_DEMO_COMPARE = (companies, t) => {
  const txt = (key, fallback) => {
    const value = typeof t === "function" ? t(key) : key;
    return value && value !== key ? value : fallback;
  };
  const withName = (key, fallback, name) => txt(key, fallback).replace("{name}", name);
  return {
  companyAnalysis: companies.map((c, i) => ({
    ticker: c.ticker,
    totalScore: [87, 83, 79, 74][i] || 74,
    growthPotential: [82, 79, 76, 71][i] || 71,
    riskLevel: [28, 31, 35, 38][i] || 38,
    innovationScore: [91, 88, 80, 75][i] || 75,
    financialStrength: [89, 85, 78, 72][i] || 72,
    marketPosition: [94, 87, 81, 76][i] || 76,
    summary: withName("demoCompareCompanySummary", "{name} shows solid market positioning with consistent fundamentals and strong competitive moat in its core segments.", c.name),
    strengths: [txt("demoCompareStrength1", "Dominant market share in core segments"), txt("demoCompareStrength2", "Strong recurring revenue streams"), txt("demoCompareStrength3", "Proven management execution track record")],
    risks: [txt("demoCompareRisk1", "Market concentration exposure"), txt("demoCompareRisk2", "Macro sensitivity in key geographies")],
    nearFuture: txt("demoCompareNearFuture", "AI integration and product expansion are expected to sustain the growth trajectory through 2026-2027.")
  })),
  recommendation: {
    bestTicker: companies[0]?.ticker || "AAPL",
    confidenceRate: 84,
    globalRiskShare: 4.2,
    rationale: txt("demoCompareRationale", "Superior financial metrics combined with the innovation pipeline make this the highest composite score under current market conditions."),
    alternatif: companies[1]?.ticker || "MSFT",
    alternativeNote: txt("demoCompareAlternativeNote", "Strong enterprise positioning and cloud infrastructure provide a notable secondary data highlight.")
  },
  overallAssessment: txt("demoCompareOverall", "The selected companies show useful diversification across market leaders with complementary business models. The current macro environment favors quality over growth in this data review."),
  _demo: true
};
};

// ── HISTORY MODAL ──
function AIAnalysisModal({
  c,
  onClose
}) {
  const { t } = useLang();
  const sec = SECTORS[c.sector] || {
    color: "#94a3b8",
    label: c.sector
  };
  const analysis = getGmaDemoAnalysis(t);
  const sentimentColor = s => s === "POZITIF" ? "#34d399" : s === "NEGATIF" ? "#f87171" : "#fbbf24";
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.88)",
      zIndex: 9200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: "700px",
      maxHeight: "88vh",
      overflow: "auto",
      background: "linear-gradient(145deg,#09101f,#060912)",
      border: `1px solid ${sec.color}44`,
      borderRadius: "18px",
      padding: "22px",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      marginBottom: "18px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#a78bfa",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "0.1em",
      marginBottom: "6px"
    }
  }, "\uD83E\uDD16 ", t('aiAnalysis')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f1f5f9",
      fontSize: "20px",
      fontWeight: "bold"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#64748b",
      fontSize: "13px",
      marginTop: "4px"
    }
  }, c.ticker, " \xB7 $", fmtPrice(c.price), " \xB7 ", c.change >= 0 ? "\u25B2" : "\u25BC", " ", Math.abs(c.change).toFixed(2), "%")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      fontSize: "22px"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid #0f172a",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "14px",
      background: "rgba(255,255,255,0.02)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: sentimentColor(analysis.sentiment),
      fontSize: "13px",
      fontWeight: "bold",
      marginBottom: "8px"
    }
  }, analysis.sentiment, " \xB7 ", analysis.sentimentPuan, "/100"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: 1.6
    }
  }, analysis.summary)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(52,211,153,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(52,211,153,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#34d399",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px"
    }
  }, t('positiveFactors')), analysis.positive.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      color: "#94a3b8",
      fontSize: "13px",
      lineHeight: 1.45,
      marginBottom: "7px"
    }
  }, "+ ", item))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(248,113,113,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(248,113,113,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f87171",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px"
    }
  }, t('riskFactors')), analysis.negative.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      color: "#94a3b8",
      fontSize: "13px",
      lineHeight: 1.45,
      marginBottom: "7px"
    }
  }, "- ", item))))));
}

function RiskOpportunityDemoModal({
  c,
  onClose
}) {
  const { t } = useLang();
  const sec = SECTORS[c.sector] || {
    color: "#94a3b8",
    label: c.sector
  };
  const risks = [
    t('demoRisk1'),
    t('demoRisk2'),
    t('demoRisk3')
  ];
  const opportunities = [
    t('demoOpp1'),
    t('demoOpp2'),
    t('demoOpp3')
  ];
  const row = (items, color, sign) => items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: "8px",
      color: "#94a3b8",
      fontSize: "13px",
      lineHeight: 1.45,
      marginBottom: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: color,
      flexShrink: 0
    }
  }, sign), item));
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.88)",
      zIndex: 9250,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: "720px",
      background: "linear-gradient(145deg,#09101f,#060912)",
      border: `1px solid ${sec.color}44`,
      borderRadius: "18px",
      padding: "22px",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      marginBottom: "18px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f59e0b",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "0.1em",
      marginBottom: "6px"
    }
  }, "\u26A0 ", t('riskOpportunityDemo')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f1f5f9",
      fontSize: "20px",
      fontWeight: "bold"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#64748b",
      fontSize: "13px",
      marginTop: "4px"
    }
  }, c.ticker, " \xB7 ", t(sec.tKey) || sec.label)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      fontSize: "22px"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(248,113,113,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(248,113,113,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f87171",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px",
      letterSpacing: "0.08em"
    }
  }, t('riskSignals')), row(risks, "#f87171", "-")), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(52,211,153,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(52,211,153,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#34d399",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px",
      letterSpacing: "0.08em"
    }
  }, t('opportunitySignals')), row(opportunities, "#34d399", "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "14px",
      color: "#475569",
      fontSize: "11px",
      textAlign: "center"
    }
  }, t('demoContentOnly'))));
}

function AIAnalysisInlinePanel({
  c
}) {
  const { t } = useLang();
  const analysis = getGmaDemoAnalysis(t);
  const sentimentColor = s => s === "POZITIF" ? "#34d399" : s === "NEGATIF" ? "#f87171" : "#fbbf24";
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid #0f172a",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "14px",
      background: "rgba(255,255,255,0.02)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#a78bfa",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "0.1em",
      marginBottom: "8px"
    }
  }, t('aiAnalysisDemo')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: sentimentColor(analysis.sentiment),
      fontSize: "13px",
      fontWeight: "bold",
      marginBottom: "8px"
    }
  }, analysis.sentiment, " \xB7 ", analysis.sentimentPuan, "/100"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: 1.6
    }
  }, c.name, " ", t('demoLayerLabel'), ": ", analysis.summary)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(52,211,153,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(52,211,153,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#34d399",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px"
    }
  }, t('positiveFactors')), analysis.positive.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      color: "#94a3b8",
      fontSize: "13px",
      lineHeight: 1.45,
      marginBottom: "7px"
    }
  }, "+ ", item))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(248,113,113,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(248,113,113,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f87171",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px"
    }
  }, t('riskFactors')), analysis.negative.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      color: "#94a3b8",
      fontSize: "13px",
      lineHeight: 1.45,
      marginBottom: "7px"
    }
  }, "- ", item)))));
}

function RiskOpportunityInlinePanel({
  c
}) {
  const { t } = useLang();
  const risks = [
    t('demoRisk1'),
    t('demoRisk2'),
    t('demoRisk3')
  ];
  const opportunities = [
    t('demoOpp1'),
    t('demoOpp2'),
    t('demoOpp3')
  ];
  const row = (items, color, sign) => items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: "8px",
      color: "#94a3b8",
      fontSize: "13px",
      lineHeight: 1.45,
      marginBottom: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: color,
      flexShrink: 0
    }
  }, sign), item));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f59e0b",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "0.1em",
      marginBottom: "12px"
    }
  }, t('riskOpportunityDemo')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(248,113,113,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(248,113,113,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f87171",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px",
      letterSpacing: "0.08em"
    }
  }, t('riskSignals')), row(risks, "#f87171", "-")), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid rgba(52,211,153,0.24)",
      borderRadius: "10px",
      padding: "14px",
      background: "rgba(52,211,153,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#34d399",
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "10px",
      letterSpacing: "0.08em"
    }
  }, t('opportunitySignals')), row(opportunities, "#34d399", "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "14px",
      color: "#475569",
      fontSize: "11px",
      textAlign: "center"
    }
  }, c.name, " ", t('companyDemoContentOnly')));
}

function HistoryModal({
  c,
  onClose
}) {
  const { t } = useLang();
  const meta = COMPANY_META[c.ticker] || {
    founded: c.founded || 2000,
    events: []
  };
  const histData = useMemo(() => generateHistorical(c.ticker, meta.founded, c.price), [c.ticker, c.price, meta.founded]);
  const ipoSt = IPO_STATUS[c.ipoStatus] || IPO_STATUS.private;
  const sec = SECTORS[c.sector] || {
    color: "#94a3b8",
    label: ""
  };
  const [tab, setTab] = useState("chart");
  const contentDivRef = useRef(null);
  // Analysis states (not used for now, but needed to prevent undefined errors)
  const [loadingAI] = useState(false);
  const [aiError] = useState(null);
  const [analysis] = useState(null);
  
  // Dummy functions for analysis (not used but needed to prevent errors in dead code)
  const fetchAnalysis = () => {};

  // Grafik renkleri
  const chartColor = c.change >= 0 ? "#34d399" : "#f87171";

  // Tab style
  const tabStyle = active => ({
    flex: 1,
    padding: "12px 16px",
    border: "none",
    background: active ? "#0f172a" : "transparent",
    borderBottom: active ? "2px solid #6366f1" : "1px solid #0f172a",
    color: active ? "#e879f9" : "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    fontWeight: active ? "bold" : "normal",
    transition: "all 0.2s"
  });

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const ev = meta.events?.find(e => e.y === d.year);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#0c1528",
        border: "1px solid #1e293b",
        borderRadius: "8px",
        padding: "10px 14px",
        fontFamily: "'Courier New',monospace"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "15px",
        color: "#94a3b8",
        marginBottom: "4px"
      }
    }, d.year), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "17px",
        fontWeight: "bold",
        color: "#34d399"
      }
    }, "$", d.price.toLocaleString()), ev && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "13px",
        color: "#fbbf24",
        marginTop: "4px"
      }
    }, "\u26A1 ", ev.l));
  };

  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      zIndex: 9000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "linear-gradient(145deg,#09101f,#060912)",
      border: `1px solid ${sec.color}33`,
      borderRadius: "20px",
      width: "100%",
      maxWidth: "780px",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 24px 16px",
      borderBottom: "1px solid #0f172a",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "38px",
      height: "38px",
      background: `${sec.color}18`,
      border: `1px solid ${sec.color}33`,
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      fontWeight: "bold",
      color: sec.color
    }
  }, c.ticker[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#f1f5f9"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#64748b"
    }
  }, c.full)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: `${ipoSt.color}18`,
      border: `1px solid ${ipoSt.color}33`,
      color: ipoSt.color,
      borderRadius: "6px",
      padding: "3px 8px",
      fontSize: "12px",
      fontWeight: "bold"
    }
  }, ipoSt.icon, " ", t(ipoSt.tKey) || ipoSt.label)), /*#__PURE__*/React.createElement("div", {
    className: "modal-header-info",
    style: {
      fontSize: "13px",
      color: "#64748b"
    }
  }, t('founded'), ": ", meta.founded, " · ", t('sectorMeta'), ": ", t(sec.tKey) || sec.label, " · ", t('livePrice'), ": $", c.price.toFixed(2))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      fontSize: "22px",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderBottom: "1px solid #0f172a"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "chart"),
    onClick: () => setTab("chart")
  }, "\uD83D\uDCCA ", t('historicalChart')), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "ai"),
    onClick: () => setTab("ai")
  }, "\uD83E\uDD16 ", t('aiAnalysis')), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "risk"),
    onClick: () => setTab("risk")
  }, "\u26A0 ", t('riskOpportunity'))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: contentDivRef,
    style: {
      flex: 1,
      overflow: "auto",
      padding: "20px 24px"
    }
  }, tab === "ai" && /*#__PURE__*/React.createElement(AIAnalysisInlinePanel, {
    c: c
  }), tab === "risk" && /*#__PURE__*/React.createElement(RiskOpportunityInlinePanel, {
    c: c
  }), tab === "chart" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      flex: 1
    }
  },
  /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "9px",
      color: "#e2e8f0"
    }
  }, meta.founded, " \u2014 2026 \xB7 ", 2026 - meta.founded, " ", t('yearsOfMarketHistory')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "8px",
      color: "#94a3b8",
      marginTop: "1px"
    }
  }, t('simulatedHistoricalData'))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      fontWeight: "bold",
      color: c.change >= 0 ? "#34d399" : "#f87171"
    }
  }, "$", c.price.toFixed(2)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "9px",
      color: c.change >= 0 ? "#34d399" : "#f87171"
    }
  }, c.change >= 0 ? "▲" : "▼", " ", Math.abs(c.change).toFixed(2), "% ", t('today')))), /*#__PURE__*/React.createElement("div", {
    className: "chart-wrapper",
    style: {
      height: "280px",
      minHeight: "280px",
      width: "100%",
      marginBottom: "20px",
      borderRadius: "10px",
      overflow: "hidden",
      background: "#070c1a",
      border: "1px solid #0f172a",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement(SvgHistoryChart, {
    data: histData,
    color: chartColor,
    events: meta.events,
    secColor: sec.color
  })), meta.events?.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      letterSpacing: "0.08em",
      marginBottom: "10px"
    }
  }, t('keyEvents')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px"
    }
  }, meta.events.map(ev => /*#__PURE__*/React.createElement("div", {
    key: ev.y,
    style: {
      background: `${sec.color}10`,
      border: `1px solid ${sec.color}22`,
      borderRadius: "6px",
      padding: "4px 10px",
      fontSize: "13px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec.color,
      fontWeight: "bold"
    }
  }, ev.y), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#94a3b8",
      marginLeft: "6px"
    }
  }, ev.l)))))), tab === "ai" && /*#__PURE__*/React.createElement(AIAnalysisInlinePanel, {
    c: c
  }), tab === "risk" && /*#__PURE__*/React.createElement(RiskOpportunityInlinePanel, {
    c: c
  }), false && /*#__PURE__*/React.createElement("div", {style:{flex:"1 0 auto"}}, loadingAI && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "26px",
      marginBottom: "12px"
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px"
    }
  }, t('riskAnalysisLoading'))), aiError && !loadingAI && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "20px 0"
    }
  }, aiError === '__LOGIN_REQUIRED__' ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "32px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "36px",
      marginBottom: "12px"
    }
  }, "\u25A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      fontWeight: "bold",
      color: "#38bdf8",
      marginBottom: "8px"
    }
  }, t('signInRequired')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      marginBottom: "20px",
      lineHeight: 1.6
    }
  }, t('aiFeatureLoginRequired')), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClose();
      window.dispatchEvent(new CustomEvent('gma:navigate', {
        detail: 'login'
      }));
    },
    style: {
      background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
      border: "none",
      color: "#fff",
      borderRadius: "10px",
      padding: "12px 28px",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "inherit",
      fontWeight: "bold",
      letterSpacing: "0.06em"
    }
  }, t('loginRegister'), " \u2192")) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(248,113,113,0.08)",
      border: "1px solid rgba(248,113,113,0.3)",
      borderRadius: "12px",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#f87171",
      fontWeight: "bold",
      marginBottom: "8px"
    }
  }, "\u26A0 ", t('error')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "#94a3b8",
      lineHeight: 1.6,
      wordBreak: "break-word",
      marginBottom: "10px"
    }
  }, aiError === '__NO_KEY__'
    ? t('noAiKey')
    : aiError === '__NO_CREDITS__'
    ? t('noCredits')
    : aiError
  ), /*#__PURE__*/React.createElement("button", {
    onClick: fetchAnalysis,
    style: {
      background: "rgba(248,113,113,0.15)",
      border: "1px solid rgba(248,113,113,0.4)",
      color: "#f87171",
      borderRadius: "8px",
      padding: "8px 14px",
      cursor: "pointer",
      fontSize: "11px",
      fontFamily: "inherit",
      fontWeight: "bold"
    }
  }, "\u21BA ", t('tryAgain')))), !loadingAI && !analysis && !aiError && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: fetchAnalysis,
    style: {
      background: "linear-gradient(135deg,#f97316,#fbbf24)",
      border: "none",
      color: "#000",
      borderRadius: "10px",
      padding: "14px 28px",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "inherit",
      fontWeight: "bold"
    }
  }, "\u26A1 ", t('loadRiskAnalysis')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginTop: "10px"
    }
  }, t('riskAnalysisIntro'))), analysis && !loadingAI && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(52,211,153,0.05)",
      border: "1px solid rgba(52,211,153,0.2)",
      borderRadius: "12px",
      padding: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#34d399",
      letterSpacing: "0.08em",
      marginBottom: "12px"
    }
  }, "\u2705 ", t('positiveFactors')), analysis.positive?.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: "8px",
      marginBottom: "8px",
      fontSize: "14px",
      color: "#94a3b8",
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#34d399",
      flexShrink: 0
    }
  }, "+"), " ", item))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(248,113,113,0.05)",
      border: "1px solid rgba(248,113,113,0.2)",
      borderRadius: "12px",
      padding: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#f87171",
      letterSpacing: "0.08em",
      marginBottom: "12px"
    }
  }, "\u26A0 ", t('negativeFactors')), analysis.negative?.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: "8px",
      marginBottom: "8px",
      fontSize: "14px",
      color: "#94a3b8",
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f87171",
      flexShrink: 0
    }
  }, "\u2212"), " ", item)))))), /*#__PURE__*/React.createElement("div", {
    className: "legal-scroll-area",
    style: {
      borderTop: "1px solid #1e293b",
      background: "linear-gradient(135deg,rgba(251,191,36,0.06),rgba(248,113,113,0.04))"
    }
  }, /*#__PURE__*/React.createElement("div", {style:{display:"block",clear:"both",margin:"4px 0"}}), /*#__PURE__*/React.createElement("div", {
    className: "legal-warning-container",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px 4px",
      borderBottom: "1px solid rgba(251,191,36,0.12)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px"
    }
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "yasal-uyari-title",
    style: {
      fontSize: "9px",
      fontWeight: "bold",
      color: "#fbbf24",
      letterSpacing: "0.03em"
    }
  }, t('legalNoticeNotAdvice'))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 12px 20px",
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "2px"
    }
  }, [t('disclaimer1'), t('disclaimer2'), t('disclaimer3'), t('disclaimer4'), t('disclaimer5'), t('disclaimer6')].map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "legal-disclaimer-item",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "6px",
      marginBottom: "4px",
      fontSize: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f1c40f",
      fontSize: "9px",
      flexShrink: 0,
      paddingTop: "1px",
      lineHeight: "1",
      margin: "0"
    }
  }, ">"), /*#__PURE__*/React.createElement("span", {
    className: "legal-disclaimer-text",
    style: {
      color: "#777777",
      flex: 1,
      lineHeight: "1.2",
      margin: "0"
    }
  }, item)))))))));
}
const genSpark = (price, change, n = 26) => {
  const start = price / (1 + change / 100);
  const pts = Array.from({
    length: n
  }, (_, i) => {
    const t = i / (n - 1);
    const trend = start + (price - start) * t;
    const noise = (Math.random() - 0.48) * price * 0.007;
    return {
      v: parseFloat((trend + noise).toFixed(2))
    };
  });
  pts[pts.length - 1] = {
    v: price
  };
  return pts;
};
const fmtPrice = p => p >= 1000 ? p.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}) : p.toFixed(2);
function BtnFilter({
  active,
  color,
  children,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: active ? `${color}22` : "rgba(255,255,255,0.03)",
      color: active ? color : "#475569",
      border: `1px solid ${active ? color + "66" : "#1e293b"}`,
      borderRadius: "6px",
      padding: "5px 11px",
      cursor: "pointer",
      fontSize: "9px",
      fontFamily: "'Courier New', monospace",
      fontWeight: "bold",
      letterSpacing: "0.08em",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    }
  }, children);
}

// ── COMPAREMA CUBUGU (altta sabit) ──
function CompareBar({
  compareList,
  rows,
  onRemove,
  onAnalyze,
  onClear
}) {
  const {
    t
  } = useLang();
  const companies = rows.filter(r => compareList.has(r.ticker));
  if (companies.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "gma-compare-bar",
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 8500,
      background: "linear-gradient(135deg,#0a0f1e,#0d1628)",
      borderTop: "1px solid rgba(232,121,249,0.3)",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#e879f9",
      fontWeight: "bold",
      letterSpacing: "0.06em",
      flexShrink: 0
    }
  }, "\u2696\uFE0F ", t('compare'), " (", companies.length, "/5)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px",
      flex: 1,
      flexWrap: "wrap"
    }
  }, companies.map(c => {
    const sec = SECTORS[c.sector] || {
      color: "#94a3b8"
    };
    return /*#__PURE__*/React.createElement("div", {
      key: c.ticker,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: `${sec.color}14`,
        border: `1px solid ${sec.color}33`,
        borderRadius: "8px",
        padding: "4px 10px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        color: sec.color
      }
    }, c.ticker), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "14px",
        color: "#94a3b8"
      }
    }, c.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "14px",
        color: c.change >= 0 ? "#34d399" : "#f87171"
      }
    }, c.change >= 0 ? "▲" : "▼", Math.abs(c.change).toFixed(1), "%"), /*#__PURE__*/React.createElement("button", {
      onClick: () => onRemove(c.ticker),
      style: {
        background: "transparent",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "15px",
        lineHeight: 1,
        padding: "0 2px"
      }
    }, "\u2715"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      flexShrink: 0
    }
  }, companies.length >= 2 && /*#__PURE__*/React.createElement("button", {
    onClick: onAnalyze,
    style: {
      background: "linear-gradient(135deg,#7c3aed,#e879f9)",
      border: "none",
      color: "#fff",
      borderRadius: "9px",
      padding: "9px 20px",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold"
    }
  }, "\uD83E\uDD16 ", t('analyzeAI'), " (", companies.length, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: onClear,
    style: {
      background: "transparent",
      border: "1px solid #334155",
      color: "#94a3b8",
      borderRadius: "9px",
      padding: "9px 14px",
      cursor: "pointer",
      fontSize: "14px",
      fontFamily: "inherit"
    }
  }, t('clear'))));
}

// ── COMPAREMA MODALI ──
function CompareModal({
  companies,
  onClose
}) {
  const { t, lang } = useLang();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // false — users baslatir
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [rawLog, setRawLog] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  // companies prop'u ref'e al — sonsuz donguyu engeller
  const companiesRef = useRef(companies);
  const showDemoCompare = (co, raw = "") => {
    setRawLog(raw ? raw.slice(0, 800) : "");
    setError(null);
    setTab("overview");
    setResult(GMA_DEMO_COMPARE(co, t));
  };

  // Analiz fonksiyonu — companiesRef uzerinden calisir, bagimlilik problemi yok
  const runAnalysis = async () => {
    const co = companiesRef.current || companies || [];
    if (co.length < 2) {
      setError("En az 2 şirket seçilmelidir.");
      return;
    }
    // ── Giris kontrolu ──
    const _cu = (() => {
      try {
        return JSON.parse(localStorage.getItem('gma_current_user'));
      } catch {
        return null;
      }
    })();
    if (!_cu) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      showDemoCompare(co);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setRawLog("");
    try {
      const tickerList = co.map(c => c.ticker).join(", ");
      const companyDetails = co.map(c => `${c.name} (${c.ticker}): $${c.price.toFixed(2)}, change ${c.change.toFixed(2)}%, sector ${c.sector}`).join(" | ");

      // Acili parantez (<>) kullanmadan temiz prompt
      const companySchema = co.map(c => `{"ticker":"${c.ticker}","totalScore":0,"growthPotential":0,"riskLevel":0,"innovationScore":0,"financialStrength":0,"marketPosition":0,"summary":"","strengths":["",""],"risks":["",""],"nearFuture":""}`).join(",");
      const outputLanguage = LANGS.find(l => l.c === lang)?.n || "English";
      const promptContent = `${co.length} compare companies and create an educational market intelligence review in ${outputLanguage}: ${companyDetails}

Fill only the JSON template below. Do not write any extra explanation. Make all scores whole numbers from 0 to 100. Do not provide buy, sell, hold, allocation or financial advice language:

{"companyAnalysis":[${companySchema}],"recommendation":{"bestTicker":"${co[0].ticker}","confidenceRate":80,"globalRiskShare":5,"rationale":"","alternatif":"${co[1] ? co[1].ticker : co[0].ticker}","alternativeNote":""},"overallAssessment":""}

CRITICAL: Return only JSON. The first character must be { and the last character must be }.`;
      const apiKey2 = localStorage.getItem('gma_platform_key') || '';
      if (!apiKey2) {
        await new Promise(r => setTimeout(r, 1500));
        showDemoCompare(co);
        setLoading(false);
        return;
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey2,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system: "Sen portfoy yoneticisisin. SADECE gecerli JSON don dur. Baska hicbir sey yazma. Ilk karakter { olmali.",
          messages: [{
            role: "user",
            content: promptContent
          }]
        })
      });
      const rawText = await res.text();
      if (!res.ok) {
        let errMsg = rawText.slice(0, 300);
        try {
          const errJson = JSON.parse(rawText);
          errMsg = errJson?.error?.message || errMsg;
        } catch {}
        showDemoCompare(co, `API Hatasi ${res.status}: ${errMsg}\n${rawText}`);
        return;
      }
      let apiResponse;
      try {
        apiResponse = JSON.parse(rawText);
      } catch {
        showDemoCompare(co, "API yaniti parse edilemedi: " + rawText);
        return;
      }
      const txt = (apiResponse.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setRawLog(txt.slice(0, 800));
      if (!txt) {
        showDemoCompare(co, "Bos yanit. Tipler: " + (apiResponse.content || []).map(b => b.type).join(", "));
        return;
      }
      const cleaned = txt.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        showDemoCompare(co, "JSON bulunamadi: " + cleaned);
        return;
      }
      try {
        const data = JSON.parse(cleaned.slice(start, end + 1));
        if (!data.companyAnalysis || !Array.isArray(data.companyAnalysis)) {
          showDemoCompare(co, "Invalid JSON structure: companyAnalysis array is missing.");
          return;
        }
        setError(null);
        setResult(data);
      } catch (pe) {
        showDemoCompare(co, "JSON parse hatasi: " + pe.message + " — " + cleaned);
      }
    } catch (e) {
      showDemoCompare(co, "Ag hatasi: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Sadece butona basinca calisir — otomatik calismaz, kredi israfi olmaz
  const [started, setStarted] = useState(false);
  const handleStart = () => {
    setStarted(true);
    runAnalysis();
  };
  const tabStyle = active => ({
    flex: 1,
    padding: "10px 4px",
    background: active ? "rgba(232,121,249,0.1)" : "transparent",
    border: "none",
    borderBottom: active ? "2px solid #e879f9" : "2px solid transparent",
    color: active ? "#e879f9" : "#475569",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "'Courier New',monospace",
    fontWeight: "bold",
    letterSpacing: "0.06em"
  });
  const scoreBar = (val, color) => /*#__PURE__*/React.createElement("div", {
    style: {
      height: "6px",
      background: "#0f172a",
      borderRadius: "3px",
      overflow: "hidden",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${val}%`,
      background: color,
      borderRadius: "3px",
      transition: "width 1s"
    }
  }));
  const ScoreRow = ({
    label,
    val,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "5px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      minWidth: "80px",
      letterSpacing: "0.04em"
    }
  }, label), scoreBar(val, color), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      fontWeight: "bold",
      color,
      minWidth: "28px",
      textAlign: "right"
    }
  }, val));
  const winner = result?.recommendation?.bestTicker;
  const alt = result?.recommendation?.alternatif;
  return /*#__PURE__*/React.createElement("div", {
    className: "gma-compare-modal-overlay",
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      zIndex: 9100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "gma-compare-modal",
    onClick: e => e.stopPropagation(),
    style: {
      background: "linear-gradient(145deg,#080e1c,#060912)",
      border: "1px solid rgba(232,121,249,0.25)",
      borderRadius: "22px",
      width: "100%",
      maxWidth: "900px",
      maxHeight: "92vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 26px 16px",
      borderBottom: "1px solid #0f172a",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#e879f9",
      letterSpacing: "0.06em"
    }
  }, "\u2696\uFE0F ", t('companyComparisonAnalysis')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginTop: "3px"
    }
  }, companies.length, " ", t('companiesAiComparison'))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      fontSize: "22px",
      cursor: "pointer"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderBottom: "1px solid #0f172a"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "overview"),
    onClick: () => setTab("overview")
  }, "\uD83D\uDCCA ", t('overview')), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "scores"),
    onClick: () => setTab("scores")
  }, "\uD83C\uDFAF ", t('scoreAnalysis')), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "recommend"),
    onClick: () => setTab("recommend")
  }, "\u2B50 ", t('recommendation'))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: "20px 26px"
    }
  }, !started && !loading && !result && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "40px",
      marginBottom: "16px"
    }
  }, "\u2696\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "17px",
      color: "#e879f9",
      marginBottom: "8px",
      fontWeight: "bold"
    }
  }, companies.length, " ", t('companiesReady')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginBottom: "24px"
    }
  }, companies.map(c => c.name).join(" · ")), /*#__PURE__*/React.createElement("button", {
    onClick: handleStart,
    style: {
      background: "linear-gradient(135deg,#7c3aed,#e879f9)",
      border: "none",
      color: "#fff",
      borderRadius: "12px",
      padding: "14px 32px",
      cursor: "pointer",
      fontSize: "16px",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold",
      letterSpacing: "0.07em"
    }
  }, "\uD83E\uDD16 ", t('startAiComparisonAnalysis')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "10px"
    }
  }, t('comparisonIntro'))), loading && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "40px",
      marginBottom: "16px"
    }
  }, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "16px",
      color: "#e879f9",
      marginBottom: "8px"
    }
  }, t('aiAnalysisRunning')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8"
    }
  }, companies.map(c => c.name).join(" · "), " ", t('companiesBeingCompared'))), error && !loading && /*#__PURE__*/React.createElement("div", null, error === '__LOGIN_REQUIRED__' ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 20px",
      background: "rgba(14,165,233,0.06)",
      border: "1px solid rgba(14,165,233,0.2)",
      borderRadius: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "36px",
      marginBottom: "12px"
    }
  }, "\u25A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      fontWeight: "bold",
      color: "#38bdf8",
      marginBottom: "8px"
    }
  }, t('signInRequired')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      marginBottom: "20px",
      lineHeight: 1.6
    }
  }, t('comparisonLoginRequired')), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClose();
      window.dispatchEvent(new CustomEvent('gma:navigate', {
        detail: 'login'
      }));
    },
    style: {
      background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
      border: "none",
      color: "#fff",
      borderRadius: "10px",
      padding: "12px 28px",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "inherit",
      fontWeight: "bold"
    }
  }, t('loginRegister'), " \u2192")) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(248,113,113,0.06)",
      border: "1px solid rgba(248,113,113,0.3)",
      borderRadius: "14px",
      padding: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#f87171",
      fontWeight: "bold",
      fontSize: "13px",
      marginBottom: "8px"
    }
  }, "\u26A0 ", t('analysisError')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "#94a3b8",
      lineHeight: 1.7,
      wordBreak: "break-word",
      marginBottom: "12px"
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    onClick: runAnalysis,
    style: {
      background: "rgba(248,113,113,0.15)",
      border: "1px solid rgba(248,113,113,0.4)",
      color: "#f87171",
      borderRadius: "8px",
      padding: "9px 18px",
      cursor: "pointer",
      fontSize: "12px",
      fontFamily: "inherit",
      fontWeight: "bold"
    }
  }, "\u21BA ", t('tryAgain')))), !loading && result && tab === "overview" && /*#__PURE__*/React.createElement("div", null,
    result._demo && /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'flex-end',marginBottom:'8px'}},
      /*#__PURE__*/React.createElement("span", {style:{fontSize:'10px',color:'#e879f9',background:'rgba(232,121,249,0.1)',border:'1px solid rgba(232,121,249,0.25)',borderRadius:'20px',padding:'3px 10px',letterSpacing:'0.08em',fontFamily:"'Courier New',monospace"}},
        "\u25C8 ", t('previewModeSampleData')
      )
    ),
    /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      lineHeight: 1.7,
      marginBottom: "20px",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "10px",
      borderLeft: "3px solid #e879f9"
    }
  }, result.overallAssessment), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(companies.length, 3)},1fr)`,
      gap: "12px"
    }
  }, result.companyAnalysis?.map(f => {
    const co = companies.find(c => c.ticker === f.ticker) || {};
    const sec = SECTORS[co.sector] || {
      color: "#94a3b8"
    };
    const isWinner = f.ticker === winner;
    return /*#__PURE__*/React.createElement("div", {
      key: f.ticker,
      style: {
        background: isWinner ? "rgba(232,121,249,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isWinner ? "rgba(232,121,249,0.4)" : "#1e293b"}`,
        borderRadius: "14px",
        padding: "16px",
        position: "relative"
      }
    }, isWinner && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "linear-gradient(135deg,#7c3aed,#e879f9)",
        color: "#fff",
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: "bold"
      }
    }, "\u2B50 ", t('recommended')), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginBottom: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "28px",
        height: "28px",
        background: `${sec.color}18`,
        border: `1px solid ${sec.color}33`,
        borderRadius: "7px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        fontWeight: "bold",
        color: sec.color
      }
    }, f.ticker[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "15px",
        fontWeight: "bold",
        color: "#f1f5f9"
      }
    }, co.name || f.ticker), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#94a3b8"
      }
    }, f.ticker))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "14px",
        color: "#94a3b8",
        lineHeight: 1.5,
        marginBottom: "10px"
      }
    }, f.summary), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#e879f9"
      }
    }, f.totalScore), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#94a3b8"
      }
    }, t('totalScore'))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#34d399"
      }
    }, f.growthPotential), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#94a3b8"
      }
    }, t('growth'))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: f.riskLevel > 60 ? "#f87171" : "#fbbf24"
      }
    }, f.riskLevel), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#94a3b8"
      }
    }, t('risk')))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "13px",
        color: "#94a3b8",
        borderTop: "1px solid #0f172a",
        paddingTop: "8px"
      }
    }, f.nearFuture));
  }))), !loading && result && tab === "scores" && /*#__PURE__*/React.createElement("div", null, result.companyAnalysis?.map(f => {
    const co = companies.find(c => c.ticker === f.ticker) || {};
    const isWinner = f.ticker === winner;
    const scores = [{
      l: t('growthPotential'),
      v: f.growthPotential,
      c: "#34d399"
    }, {
      l: t('financialStrength'),
      v: f.financialStrength,
      c: "#38bdf8"
    }, {
      l: t('innovationScore'),
      v: f.innovationScore,
      c: "#a78bfa"
    }, {
      l: t('marketPosition'),
      v: f.marketPosition,
      c: "#fbbf24"
    }, {
      l: t('riskLevel'),
      v: f.riskLevel,
      c: f.riskLevel > 60 ? "#f87171" : "#fb923c"
    }];
    return /*#__PURE__*/React.createElement("div", {
      key: f.ticker,
      style: {
        background: isWinner ? "rgba(232,121,249,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isWinner ? "rgba(232,121,249,0.3)" : "#1e293b"}`,
        borderRadius: "14px",
        padding: "16px",
        marginBottom: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#f1f5f9"
      }
    }, isWinner && "⭐ ", co.name || f.ticker, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "13px",
        color: "#94a3b8",
        marginLeft: "8px"
      }
    }, f.ticker)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "22px",
        fontWeight: "bold",
        color: "#e879f9"
      }
    }, f.totalScore, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "13px",
        color: "#94a3b8"
      }
    }, "/100"))), scores.map(s => /*#__PURE__*/React.createElement(ScoreRow, {
      key: s.l,
      label: s.l,
      val: s.v,
      color: s.c
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        marginTop: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(52,211,153,0.05)",
        border: "1px solid rgba(52,211,153,0.15)",
        borderRadius: "8px",
        padding: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#34d399",
        marginBottom: "6px"
      }
    }, t('strengths')), f.strengths?.map((g, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "3px"
      }
    }, "+ ", g))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(248,113,113,0.05)",
        border: "1px solid rgba(248,113,113,0.15)",
        borderRadius: "8px",
        padding: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#f87171",
        marginBottom: "6px"
      }
    }, t('risks')), f.risks?.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "3px"
      }
    }, "\u2212 ", r)))));
  })), !loading && result && tab === "recommend" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(232,121,249,0.08))",
      border: "1px solid rgba(232,121,249,0.4)",
      borderRadius: "18px",
      padding: "24px",
      marginBottom: "16px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      color: "#a78bfa",
      letterSpacing: "0.06em",
      marginBottom: "12px"
    }
  }, t('aiRecommendation')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#e879f9",
      marginBottom: "4px"
    }
  }, companies.find(c => c.ticker === winner)?.name || winner), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      color: "#94a3b8",
      marginBottom: "16px"
    }
  }, winner), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "12px",
      background: "rgba(0,0,0,0.3)",
      borderRadius: "12px",
      padding: "12px 24px",
      marginBottom: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#34d399"
    }
  }, "%", result.recommendation?.confidenceRate), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8"
    }
  }, t('aiConfidenceRate'))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      height: "40px",
      background: "#1e293b"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#fbbf24"
    }
  }, "%", result.recommendation?.globalRiskShare), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8"
    }
  }, t('globalRiskShare')))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      lineHeight: 1.7,
      maxWidth: "600px",
      margin: "0 auto 16px",
      textAlign: "left"
    }
  }, result.recommendation?.rationale), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "400px",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      color: "#94a3b8",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", null, t('globalRisk'), ": %", result.recommendation?.globalRiskShare), /*#__PURE__*/React.createElement("span", null, t('aiConfidence'), ": %", result.recommendation?.confidenceRate)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "8px",
      background: "#0f172a",
      borderRadius: "4px",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${result.recommendation?.confidenceRate}%`,
      background: "linear-gradient(90deg,#7c3aed,#e879f9,#34d399)",
      borderRadius: "4px"
    }
  })))), alt && alt !== winner && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid #1e293b",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginBottom: "6px"
    }
  }, t('alternativeChoice')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "17px",
      fontWeight: "bold",
      color: "#94a3b8"
    }
  }, companies.find(c => c.ticker === alt)?.name || alt), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginTop: "6px"
    }
  }, result.recommendation?.alternativeNote)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid #1e293b",
      borderRadius: "12px",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      letterSpacing: "0.08em",
      marginBottom: "12px"
    }
  }, t('scoreRanking')), [...(result.companyAnalysis || [])].sort((a, b) => b.totalScore - a.totalScore).map((f, i) => {
    const co = companies.find(c => c.ticker === f.ticker) || {};
    return /*#__PURE__*/React.createElement("div", {
      key: f.ticker,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "8px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "15px",
        color: "#94a3b8",
        minWidth: "16px"
      }
    }, "#", i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "15px",
        fontWeight: "bold",
        color: f.ticker === winner ? "#e879f9" : "#94a3b8",
        minWidth: "80px"
      }
    }, co.name || f.ticker), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: "6px",
        background: "#0f172a",
        borderRadius: "3px",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: `${f.totalScore}%`,
        background: f.ticker === winner ? "linear-gradient(90deg,#7c3aed,#e879f9)" : "#1e293b",
        borderRadius: "3px"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "15px",
        fontWeight: "bold",
        color: f.ticker === winner ? "#e879f9" : "#475569",
        minWidth: "28px"
      }
    }, f.totalScore));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #1e293b",
      background: "rgba(0,0,0,0.3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 26px 6px",
      borderBottom: "1px solid rgba(248,113,113,0.1)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "16px"
    }
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "15px",
      fontWeight: "bold",
      color: "#f87171",
      letterSpacing: "0.06em"
    }
  }, t('finalDecisionNotice'))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 26px 12px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "4px 16px"
    }
  }, [t('finalBullet1'), t('finalBullet2'), t('finalBullet3'), t('finalBullet4'), t('finalBullet5'), t('finalBullet6')].map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: "5px",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#f87171",
      fontSize: "13px",
      flexShrink: 0
    }
  }, "\u203A"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      lineHeight: 1.5
    }
  }, item)))))));
}

// ── TOAST BILDIRIM ──
function Toast({
  toasts
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }
  }, toasts.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      background: t.type === "success" ? "rgba(52,211,153,0.15)" : t.type === "warn" ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)",
      border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "warn" ? "#fbbf24" : "#f87171"}55`,
      color: t.type === "success" ? "#34d399" : t.type === "warn" ? "#fbbf24" : "#f87171",
      borderRadius: "10px",
      padding: "10px 16px",
      fontSize: "15px",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold",
      backdropFilter: "blur(12px)",
      minWidth: "240px",
      animation: "slideIn 0.3s ease"
    }
  }, t.icon, " ", t.msg)));
}

// ── SATIN AL MODALI ──
function BuyModal({
  c,
  onClose,
  onConfirm
}) {
  const { t } = useLang();
  const [qty, setQty] = useState(1);
  const total = (c.price * qty).toFixed(2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 8000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "linear-gradient(145deg,#0d1626,#080f1e)",
      border: "1px solid rgba(52,211,153,0.3)",
      borderRadius: "18px",
      padding: "28px",
      minWidth: "320px",
      maxWidth: "400px",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      color: "#94a3b8",
      letterSpacing: "0.06em",
      marginBottom: "4px"
    }
  }, t('addToPortfolio')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#f1f5f9",
      marginBottom: "2px"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginBottom: "20px"
    }
  }, c.full), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, t('currentPrice')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#34d399"
    }
  }, "$", c.price.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, t('exchange')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      color: "#94a3b8"
    }
  }, "NASDAQ/NYSE"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginBottom: "8px"
    }
  }, t('quantity')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setQty(q => Math.max(1, q - 1)),
    style: {
      width: "36px",
      height: "36px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid #1e293b",
      borderRadius: "8px",
      color: "#f1f5f9",
      fontSize: "20px",
      cursor: "pointer"
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "26px",
      fontWeight: "bold",
      color: "#f1f5f9",
      minWidth: "40px",
      textAlign: "center"
    }
  }, qty), /*#__PURE__*/React.createElement("button", {
    onClick: () => setQty(q => q + 1),
    style: {
      width: "36px",
      height: "36px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid #1e293b",
      borderRadius: "8px",
      color: "#f1f5f9",
      fontSize: "20px",
      cursor: "pointer"
    }
  }, "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(52,211,153,0.07)",
      border: "1px solid rgba(52,211,153,0.2)",
      borderRadius: "10px",
      padding: "14px",
      marginBottom: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      color: "#94a3b8",
      marginBottom: "6px"
    }
  }, /*#__PURE__*/React.createElement("span", null, t('unitPrice')), /*#__PURE__*/React.createElement("span", null, "$", c.price.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      color: "#94a3b8",
      marginBottom: "6px"
    }
  }, /*#__PURE__*/React.createElement("span", null, t('quantity')), /*#__PURE__*/React.createElement("span", null, qty)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "17px",
      fontWeight: "bold",
      color: "#34d399",
      borderTop: "1px solid #1e293b",
      paddingTop: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", null, t('totalLabel')), /*#__PURE__*/React.createElement("span", null, "$", Number(total).toLocaleString("en-US", {
    minimumFractionDigits: 2
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      flex: 1,
      padding: "12px",
      background: "transparent",
      border: "1px solid #1e293b",
      borderRadius: "10px",
      color: "#94a3b8",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "inherit",
      fontWeight: "bold"
    }
  }, t('cancel')), /*#__PURE__*/React.createElement("button", {
    onClick: () => onConfirm(qty, total),
    style: {
      flex: 2,
      padding: "12px",
      background: "linear-gradient(135deg,#059669,#10b981)",
      border: "none",
      borderRadius: "10px",
      color: "#fff",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "inherit",
      fontWeight: "bold",
      letterSpacing: "0.07em"
    }
  }, "\u2713 ", t('addToPortfolio'))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: "12px",
      color: "#1e293b",
      marginTop: "10px"
    }
  }, "\u26A0 ", t('simulatedTransaction'))));
}

// ── ALARM MODALI ──
function AlertModal({
  c,
  currentAlert,
  onClose,
  onSet
}) {
  const { t } = useLang();
  const [pct, setPct] = useState(currentAlert || 5);
  const target = (c.price * (1 + pct / 100)).toFixed(2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 8000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "linear-gradient(145deg,#0d1626,#080f1e)",
      border: "1px solid rgba(251,191,36,0.3)",
      borderRadius: "18px",
      padding: "28px",
      minWidth: "300px",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      color: "#94a3b8",
      letterSpacing: "0.06em",
      marginBottom: "4px"
    }
  }, t('priceRiseAlert')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#f1f5f9",
      marginBottom: "16px"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "8px",
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, t('riseThreshold'), ": ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#fbbf24",
      fontWeight: "bold"
    }
  }, "+", pct, "%")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "50",
    value: pct,
    onChange: e => setPct(Number(e.target.value)),
    style: {
      width: "100%",
      marginBottom: "12px",
      accentColor: "#fbbf24"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(251,191,36,0.07)",
      border: "1px solid rgba(251,191,36,0.2)",
      borderRadius: "10px",
      padding: "12px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, t('currentPrice')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "18px",
      color: "#f1f5f9",
      fontWeight: "bold"
    }
  }, "$", c.price.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, t('target')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "18px",
      color: "#fbbf24",
      fontWeight: "bold"
    }
  }, "$", target))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      flex: 1,
      padding: "12px",
      background: "transparent",
      border: "1px solid #1e293b",
      borderRadius: "10px",
      color: "#94a3b8",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "inherit"
    }
  }, t('cancel')), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSet(pct),
    style: {
      flex: 2,
      padding: "12px",
      background: "linear-gradient(135deg,#b45309,#fbbf24)",
      border: "none",
      borderRadius: "10px",
      color: "#000",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "inherit",
      fontWeight: "bold"
    }
  }, "\uD83D\uDD14 ", t('setAlert')))));
}

// ── CART / WATCH PANEL ──
function SidePanel({
  cart,
  watchlist,
  portfolio,
  rows,
  onRemoveCart,
  onUnwatch,
  onClose
}) {
  const { t } = useLang();
  const [tab, setTab] = useState("cart");
  const cartItems = rows.filter(r => cart.has(r.ticker));
  const watchItems = rows.filter(r => watchlist.has(r.ticker));
  const portItems = portfolio;
  const cartTotal = portItems.reduce((s, p) => s + p.total, 0);
  const tabStyle = active => ({
    flex: 1,
    padding: "8px",
    background: active ? "rgba(56,189,248,0.15)" : "transparent",
    border: "none",
    borderBottom: active ? "2px solid #38bdf8" : "2px solid transparent",
    color: active ? "#38bdf8" : "#475569",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "'Courier New',monospace",
    fontWeight: "bold",
    letterSpacing: "0.07em"
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "gma-side-panel",
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: "320px",
      zIndex: 7000,
      background: "linear-gradient(180deg,#080f1e,#060912)",
      borderLeft: "1px solid rgba(56,189,248,0.15)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      borderBottom: "1px solid #0f172a",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#38bdf8"
    }
  }, "\u25C8 ", t('myPanel')), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      fontSize: "20px",
      cursor: "pointer"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderBottom: "1px solid #0f172a"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "cart"),
    onClick: () => setTab("cart")
  }, "\uD83D\uDED2 ", t('cart'), " (", cartItems.length, ")"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "watch"),
    onClick: () => setTab("watch")
  }, "\uD83D\uDC41 ", t('watchlist'), " (", watchItems.length, ")"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "port"),
    onClick: () => setTab("port")
  }, "\uD83D\uDCCA ", t('portfolioTrackingTitle'), " (", portItems.length, ")")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "12px"
    }
  }, tab === "cart" && (cartItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "15px",
      marginTop: "40px"
    }
  }, t('cartEmpty')) : cartItems.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.ticker,
    style: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid #0f172a",
      borderRadius: "10px",
      padding: "12px",
      marginBottom: "8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      fontWeight: "bold",
      color: "#f1f5f9"
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, r.ticker)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: r.change >= 0 ? "#34d399" : "#f87171"
    }
  }, "$", r.price.toFixed(2)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onRemoveCart(r.ticker),
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      fontSize: "13px",
      cursor: "pointer"
    }
  }, t('remove'), " \u2715")))))), tab === "watch" && (watchItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "15px",
      marginTop: "40px"
    }
  }, t('watchlistEmpty')) : watchItems.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.ticker,
    style: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid #0f172a",
      borderRadius: "10px",
      padding: "12px",
      marginBottom: "8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      fontWeight: "bold",
      color: "#f1f5f9"
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8"
    }
  }, r.ticker)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: r.change >= 0 ? "#34d399" : "#f87171"
    }
  }, "$", r.price.toFixed(2)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: r.change >= 0 ? "#34d399" : "#f87171"
    }
  }, r.change >= 0 ? "▲" : "▼", Math.abs(r.change).toFixed(2), "%"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onUnwatch(r.ticker),
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      fontSize: "13px",
      cursor: "pointer"
    }
  }, t('remove'), " \u2715")))))), tab === "port" && (portItems.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "15px",
      marginTop: "40px"
    }
  }, t('noPurchasesYet')) : /*#__PURE__*/React.createElement(React.Fragment, null, portItems.map((p, i) => {
    // Fix 5: Find current price from rows and calculate P&L
    const currentRow = rows.find(r => r.ticker === p.ticker);
    const currentPrice = currentRow?.price ?? p.unitPrice;
    const currentVal = currentPrice * p.qty;
    const pnl = currentVal - p.total;
    const pnlPct = pnl / p.total * 100;
    const isProfit = pnl >= 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: isProfit ? "rgba(52,211,153,0.05)" : "rgba(248,113,113,0.05)",
        border: `1px solid ${isProfit ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "15px",
        fontWeight: "bold",
        color: "#f1f5f9"
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "13px",
        color: "#94a3b8"
      }
    }, p.qty, " ", t('units'), " · ", t('buyIn'), " $", p.unitPrice.toFixed(2), " · ", t('currentValue'), " $", currentPrice.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#94a3b8"
      }
    }, "$", currentVal.toFixed(2)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        color: isProfit ? "#34d399" : "#f87171"
      }
    }, isProfit ? "▲ +" : "▼ ", pnl.toFixed(2), " (", isProfit ? "+" : "", pnlPct.toFixed(2), "%)"))));
  }), (() => {
    const totalCost = portItems.reduce((s, p) => s + p.total, 0);
    const totalCurrent = portItems.reduce((s, p) => {
      const cr = rows.find(r => r.ticker === p.ticker);
      return s + (cr?.price ?? p.unitPrice) * p.qty;
    }, 0);
    const totalPnl = totalCurrent - totalCost;
    const totalPnlPct = totalPnl / totalCost * 100;
    const isProfit = totalPnl >= 0;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid #0f172a",
        paddingTop: "12px",
        marginTop: "8px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "15px",
        color: "#94a3b8",
        marginBottom: "4px"
      }
    }, /*#__PURE__*/React.createElement("span", null, t('cost')), /*#__PURE__*/React.createElement("span", null, "$", totalCost.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "15px",
        color: "#94a3b8",
        marginBottom: "4px"
      }
    }, /*#__PURE__*/React.createElement("span", null, t('currentValue')), /*#__PURE__*/React.createElement("span", null, "$", totalCurrent.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "16px",
        fontWeight: "bold",
        borderTop: "1px solid #1e293b",
        paddingTop: "8px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#94a3b8"
      }
    }, t('profitLoss')), /*#__PURE__*/React.createElement("span", {
      style: {
        color: isProfit ? "#34d399" : "#f87171"
      }
    }, isProfit ? "+" : "", totalPnl.toFixed(2), " (", isProfit ? "+" : "", totalPnlPct.toFixed(2), "%)")));
  })()))));
}

// ── COMPANY CARD ──
function CompanyCard({
  c,
  inCart,
  isWatched,
  hasAlert,
  onBuy,
  onCart,
  onWatch,
  onAlert,
  onHistory,
  onAIAnalysis,
  onRiskOpportunity,
  inCompare,
  onCompare,
  compareDisabled
}) {
  const { t } = useLang();
  const sec = SECTORS[c.sector] || {
    color: "#94a3b8",
    label: c.sector
  };
  const ipoSt = IPO_STATUS[c.ipoStatus] || IPO_STATUS.private;
  const isListed = c.ipoStatus === "listed";
  const up = c.change >= 0;
  const clr = up ? "#34d399" : "#f87171";
  const iconBtn = (icon, label, active, activeColor, onClick, disabled, iconColor = "inherit") => /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    title: label,
    style: {
      flex: "1 1 calc(33.333% - 5px)",
      minWidth: "64px",
      minHeight: "54px",
      padding: "6px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2px",
      background: active ? `${activeColor}18` : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? activeColor + "44" : "#1e293b"}`,
      borderRadius: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.35 : 1,
      transition: "all 0.2s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "16px",
      color: active ? activeColor : iconColor
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      color: active ? activeColor : "#e2e8f0",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold",
      letterSpacing: "0.04em",
      lineHeight: 1.1,
      textAlign: "center",
      maxWidth: "100%",
      overflowWrap: "anywhere"
    }
  }, label));
  return /*#__PURE__*/React.createElement("div", {
    className: "gma-market-card",
    style: {
      background: "linear-gradient(145deg,#0c1220 0%,#080d18 100%)",
      border: `1px solid ${isWatched ? "rgba(251,191,36,0.35)" : up ? "rgba(52,211,153,0.18)" : "rgba(248,113,113,0.18)"}`,
      borderRadius: "14px",
      padding: "14px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.4s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: "10%",
      right: "10%",
      height: "1px",
      background: `linear-gradient(90deg,transparent,${sec.color}55,transparent)`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "10px",
      right: "10px"
    }
  }, hasAlert && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      background: "rgba(251,191,36,0.15)",
      border: "1px solid rgba(251,191,36,0.4)",
      color: "#fbbf24",
      borderRadius: "4px",
      padding: "1px 5px"
    }
  }, "\uD83D\uDD14")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "9px",
      alignItems: "center",
      marginBottom: "10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "32px",
      height: "32px",
      background: `${sec.color}18`,
      border: `1px solid ${sec.color}33`,
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "17px",
      fontWeight: "bold",
      color: sec.color,
      flexShrink: 0
    }
  }, c.ticker[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      fontWeight: "bold",
      color: "#f1f5f9",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      letterSpacing: "0.05em"
    }
  }, c.ticker, " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec.color
    }
  }, t(sec.tKey) || sec.label)), !isListed && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "4px",
      display: "inline-block",
      fontSize: "10px",
      fontWeight: "bold",
      letterSpacing: "0.04em",
      background: `${ipoSt.color}18`,
      border: `1px solid ${ipoSt.color}44`,
      color: ipoSt.color,
      borderRadius: "4px",
      padding: "2px 6px"
    }
  }, ipoSt.icon, " ", t(ipoSt.tKey) || ipoSt.label, c.ipoYear ? ` ${c.ipoYear}` : ""))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: "8px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#f1f5f9",
      fontFamily: "'Courier New',monospace",
      lineHeight: 1
    }
  }, isListed ? `$${fmtPrice(c.price)}` : c.ipoVal ? `≈ ${c.ipoVal}` : "—"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      marginTop: "2px"
    }
  }, isListed ? "USD · NASDAQ/NYSE/BIST" : t('valuationEstimate'))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: up ? "rgba(52,211,153,0.13)" : "rgba(248,113,113,0.13)",
      color: clr,
      border: `1px solid ${clr}33`,
      borderRadius: "6px",
      padding: "4px 8px",
      fontSize: "15px",
      fontWeight: "bold",
      fontFamily: "'Courier New',monospace"
    }
  }, up ? "▲" : "▼", " ", Math.abs(c.change).toFixed(2), "%")), !isListed && c.ipoNote && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      lineHeight: 1.4,
      marginBottom: "8px",
      padding: "6px 8px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "6px",
      borderLeft: `2px solid ${ipoSt.color}44`
    }
  }, c.ipoNote), isListed && /*#__PURE__*/React.createElement("div", {
    style: {
      height: "40px",
      margin: "0 -4px 10px"
    }
  }, /*#__PURE__*/React.createElement(SvgSparkline, {
    data: c.spark,
    color: clr
  })), !isListed && /*#__PURE__*/React.createElement("div", {
    style: {
      height: "10px",
      marginBottom: "8px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "5px",
      flexWrap: "wrap",
      justifyContent: "space-between"
    }
    }, iconBtn("📊", t('chart'), false, sec.color, onHistory, false), iconBtn("⚖️", t('compare'), inCompare, "#e879f9", onCompare, compareDisabled && !inCompare), iconBtn("📈", t('add'), false, "#34d399", onBuy, !isListed), iconBtn("🛒", t('cart'), inCart, "#38bdf8", onCart, false), iconBtn("👁", t('watch'), isWatched, "#fbbf24", onWatch, false, "#ffffff"), iconBtn("🔔", t('alert'), hasAlert, "#fb923c", onAlert, false)));
}

// ═══════════════════════════════════════════════════════════════
// ──  COMMODITY & FOREX HISTORICAL DATA ──
// ═══════════════════════════════════════════════════════════════

function CommodityHistorySvgChart({
  data,
  color
}) {
  const [tip, setTip] = React.useState(null);
  const svgRef = React.useRef(null);
  if (!data || data.length < 2) return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 240
    }
  });
  const PAD = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 72
  };
  const W = 680,
    H = 240;
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const years = data.map(d => d.year);
  const prices = data.map(d => d.price);
  const minP = Math.min(...prices),
    maxP = Math.max(...prices);
  const rng = maxP - minP || 1;
  const minY = years[0],
    maxY = years[years.length - 1];
  const yrng = maxY - minY || 1;
  const cx = y => PAD.left + (y - minY) / yrng * cW;
  const cy = p => PAD.top + cH - (p - minP) / rng * cH;
  const pts = data.map(d => `${cx(d.year).toFixed(1)},${cy(d.price).toFixed(1)}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `M ${cx(minY)},${PAD.top + cH} L ${pts.join(' L ')} L ${cx(maxY)},${PAD.top + cH} Z`;
  const yTicks = 5;
  const yTickVals = Array.from({
    length: yTicks
  }, (_, i) => minP + rng / (yTicks - 1) * i);
  const step = Math.ceil(yrng / 10);
  const xTickYears = [];
  for (let y = Math.ceil(minY / step) * step; y <= maxY; y += step) xTickYears.push(y);
  const fmtV = v => {
    if (v < 0.001) return v.toFixed(7);
    if (v < 0.01) return v.toFixed(5);
    if (v < 1) return v.toFixed(4);
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toFixed(2);
  };
  const handleMouse = e => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (W / rect.width);
    const yearAtX = minY + (relX - PAD.left) / cW * yrng;
    const closest = data.reduce((a, b) => Math.abs(b.year - yearAtX) < Math.abs(a.year - yearAtX) ? b : a);
    setTip({
      year: closest.year,
      price: closest.price,
      x: cx(closest.year),
      y: cy(closest.price)
    });
  };
  return /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    width: "100%",
    height: H,
    viewBox: `0 0 ${W} ${H}`,
    style: {
      display: 'block',
      cursor: 'crosshair'
    },
    onMouseMove: handleMouse,
    onMouseLeave: () => setTip(null)
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "commGrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "5%",
    stopColor: color,
    stopOpacity: "0.25"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "95%",
    stopColor: color,
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "commClip"
  }, /*#__PURE__*/React.createElement("rect", {
    x: PAD.left,
    y: PAD.top,
    width: cW,
    height: cH
  }))), yTickVals.map((v, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: PAD.left,
    y1: cy(v),
    x2: PAD.left + cW,
    y2: cy(v),
    stroke: "#0f172a",
    strokeWidth: "1"
  })), [{
    y: 1973,
    l: "OPEC",
    c: "#f87171"
  }, {
    y: 1980,
    l: "Kriz",
    c: "#f87171"
  }, {
    y: 2008,
    l: "2008",
    c: "#f87171"
  }, {
    y: 2020,
    l: "COVID",
    c: "#fbbf24"
  }, {
    y: 2022,
    l: "Russia",
    c: "#f87171"
  }].filter(cr => cr.y >= minY && cr.y <= maxY).map(cr => /*#__PURE__*/React.createElement("g", {
    key: cr.y
  }, /*#__PURE__*/React.createElement("line", {
    x1: cx(cr.y),
    y1: PAD.top,
    x2: cx(cr.y),
    y2: PAD.top + cH,
    stroke: cr.c,
    strokeWidth: "1",
    strokeDasharray: "4 4",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("text", {
    x: cx(cr.y) + 3,
    y: PAD.top + 10,
    fill: cr.c,
    fontSize: "7",
    opacity: "0.8"
  }, cr.l))), /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: "url(#commGrad)",
    clipPath: "url(#commClip)"
  }), /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinejoin: "round",
    clipPath: "url(#commClip)"
  }), yTickVals.map((v, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: PAD.left - 6,
    y: cy(v) + 4,
    fill: "#64748b",
    fontSize: "9",
    textAnchor: "end"
  }, fmtV(v))), xTickYears.map(y => /*#__PURE__*/React.createElement("text", {
    key: y,
    x: cx(y),
    y: PAD.top + cH + 16,
    fill: "#64748b",
    fontSize: "9",
    textAnchor: "middle"
  }, y)), tip && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: tip.x,
    y1: PAD.top,
    x2: tip.x,
    y2: PAD.top + cH,
    stroke: "#475569",
    strokeWidth: "1",
    strokeDasharray: "3 3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: tip.x,
    cy: tip.y,
    r: "4",
    fill: color,
    stroke: "#060912",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: Math.min(tip.x + 8, W - 140),
    y: tip.y - 38,
    width: "132",
    height: "36",
    rx: "6",
    fill: "#0c1528",
    stroke: "#1e293b"
  }), /*#__PURE__*/React.createElement("text", {
    x: Math.min(tip.x + 14, W - 134),
    y: tip.y - 22,
    fill: "#cbd5e1",
    fontSize: "9"
  }, tip.year), /*#__PURE__*/React.createElement("text", {
    x: Math.min(tip.x + 14, W - 134),
    y: tip.y - 8,
    fill: color,
    fontSize: "12",
    fontWeight: "bold"
  }, fmtV(tip.price))));
}

// ── Commodity / Forex historical chart modal ──
function CommodityHistoryModal({
  sym,
  type,
  onClose
}) {
  const { t } = useLang();
  const histData = type === 'forex' ? FOREX_HISTORY[sym] || null : COMMODITY_HISTORY[sym] || null;
  if (!histData) return null;
  const stats = (() => {
    const d = histData.data;
    const first = d[0].price,
      last = d[d.length - 1].price;
    const max = Math.max(...d.map(x => x.price)),
      min = Math.min(...d.map(x => x.price));
    const maxY = d.find(x => x.price === max)?.year,
      minY = d.find(x => x.price === min)?.year;
    const totalReturn = ((last - first) / first * 100).toFixed(1);
    return {
      first,
      last,
      max,
      min,
      maxY,
      minY,
      totalReturn,
      years: d[d.length - 1].year - d[0].year
    };
  })();
  const fmtV = v => {
    if (v < 0.001) return v.toFixed(7);
    if (v < 0.01) return v.toFixed(5);
    if (v < 1) return v.toFixed(4);
    if (v >= 1000) return v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return v.toFixed(2);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.88)",
      zIndex: 9100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "linear-gradient(145deg,#09101f,#060912)",
      border: `1px solid ${histData.color}33`,
      borderRadius: "20px",
      width: "100%",
      maxWidth: "820px",
      maxHeight: "92vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 24px 14px",
      borderBottom: "1px solid #0f172a",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "24px"
    }
  }, type === 'forex' ? '◆' : '◆'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "19px",
      fontWeight: "bold",
      color: "#f1f5f9"
    }
  }, histData.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "2px"
    }
  }, histData.startYear || histData.data[0].year, " \u2014 2026 \xB7 ", stats.years, " ", t('yearHistoricalChart')))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "6px",
      lineHeight: 1.5
    }
  }, histData.note)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      fontSize: "24px",
      cursor: "pointer"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: "1px",
      background: "#0f172a",
      borderBottom: "1px solid #0f172a"
    }
  }, [{
    label: t('starter'),
    val: fmtV(stats.first),
    sub: histData.data[0].year,
    color: "#94a3b8"
  }, {
    label: t('current'),
    val: fmtV(stats.last),
    sub: "2026",
    color: histData.color
  }, {
    label: t('historicalHigh'),
    val: fmtV(stats.max),
    sub: stats.maxY,
    color: "#34d399"
  }, {
    label: t('historicalLow'),
    val: fmtV(stats.min),
    sub: stats.minY,
    color: "#f87171"
  }, {
    label: t('totalReturn'),
    val: `${stats.totalReturn > 0 ? "+" : ""}${stats.totalReturn}%`,
    sub: `${stats.years} yearda`,
    color: stats.totalReturn > 0 ? "#34d399" : "#f87171"
  }].map(({
    label,
    val,
    sub,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      background: "#050a15",
      padding: "12px 16px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      letterSpacing: "0.06em",
      marginBottom: "4px"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "17px",
      fontWeight: "bold",
      color,
      lineHeight: 1.2
    }
  }, val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "2px"
    }
  }, sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 8px",
      flex: 1,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(CommodityHistorySvgChart, {
    data: histData.data,
    color: histData.color
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 24px 14px",
      fontSize: "12px",
      color: "#1e293b",
      borderTop: "1px solid #0f172a",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u25CF ", t('historicalDataNotice')), /*#__PURE__*/React.createElement("span", null, "\u25C8 Global Market Analytics \xB7 2026"))));
}

// ═══════════════════════════════════════════════════════════════
// ──  LIVE COMMODITY & FOREX PANEL ──
// ═══════════════════════════════════════════════════════════════

function _getFinnhubKey() {
  return (typeof GMA_CONFIG !== 'undefined' && GMA_CONFIG.finnhubKey) ||
    localStorage.getItem('gma_finnhub_key') ||
    'd7f8b4pr01qpjqqjrge0d7f8b4pr01qpjqqjrgeg';
}

var _FH_DELAY = 2000; // ms between requests (2s = safest for free tier)

function _wait(ms) {
  return new Promise(function(resolve){ setTimeout(resolve, ms); });
}

// ── Single Finnhub quote with 429 back-off ──
async function fetchFinnhubQuote(symbol, timeout) {
  timeout = timeout || 7000;
  var key = _getFinnhubKey();
  if (!key) return null;
  var url = 'https://finnhub.io/api/v1/quote?symbol=' + encodeURIComponent(symbol) + '&token=' + key;
  var ctrl = new AbortController();
  var tid = setTimeout(function(){ ctrl.abort(); }, timeout);
  try {
    var res = await fetch(url, { signal: ctrl.signal, cache: 'no-cache' });
    clearTimeout(tid);
    if (res.status === 429) {
      console.error('[Finnhub] Rate limit! 5s pause...');
      await _wait(5000);
      // Retry once
      var res2 = await fetch(url, { cache: 'no-cache' });
      if (!res2.ok) return null;
      res = res2;
    }
    if (!res.ok) return null;
    var d = await res.json();
    // data.c = 0 means symbol not found or no data
    if (!d || !d.c) return null;
    return {
      price:  d.c,
      prev:   d.pc || d.c,
      change: d.dp || 0,
      high:   d.h,
      low:    d.l,
      open:   d.o,
      live:   true
    };
  } catch(e) { clearTimeout(tid); return null; }
}

// ── Sequential batch (respects free tier 60 req/min) ──
var _fhLock = false; // Prevent concurrent fetches
async function fetchFinnhubBatch(tickers, timeout) {
  if (_fhLock) {
    console.warn('[Finnhub] Fetch in progress. Skipping overlap.');
    return {};
  }
  _fhLock = true;
  var key = _getFinnhubKey();
  if (!key) { _fhLock = false; return {}; }
  var results = {};
  for (var i = 0; i < tickers.length; i++) {
    var sym = tickers[i];
    try {
      var d = await fetchFinnhubQuote(sym, timeout || 7000);
      if (d && d.price) {
        results[sym] = d;
      }
    } catch(e) {
      console.error('[Finnhub] ' + sym + ':', e);
    }
    if (i < tickers.length - 1) await _wait(_FH_DELAY);
  }
  _fhLock = false;
  return results;
}

// ── Forex: open.er-api.com (genuine CORS, no proxy) ──
async function fetchFinnhubForex(codes) {
  try {
    var ctrl = new AbortController();
    var tid = setTimeout(function(){ ctrl.abort(); }, 8000);
    var res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: ctrl.signal, cache: 'no-cache'
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error('er-api ' + res.status);
    var d = await res.json();
    if (!d || !d.rates) throw new Error('no rates');
    var rates = {}, prev = {};
    codes.forEach(function(c) {
      if (d.rates[c]) {
        rates[c] = d.rates[c];
        prev[c] = d.rates[c] * (1 + (Math.random() - 0.5) * 0.002);
      }
    });
    return { rates: rates, prev: prev, live: Object.keys(rates).length > 0 };
  } catch(e) {
    // Fallback: exchangerate-api.com
    try {
      var res2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-cache' });
      if (!res2.ok) throw new Error('er-api2');
      var d2 = await res2.json();
      var rates2 = {}, prev2 = {};
      codes.forEach(function(c) {
        if (d2.rates && d2.rates[c]) {
          rates2[c] = d2.rates[c];
          prev2[c] = d2.rates[c] * (1 + (Math.random() - 0.5) * 0.002);
        }
      });
      return { rates: rates2, prev: prev2, live: Object.keys(rates2).length > 0 };
    } catch(e2) {}
    return { rates: {}, prev: {}, live: false };
  }
}


function LiveMarketPanel() {
  const { t } = useLang();
  const [mData, setMData] = useState({});
  const [eData, setEData] = useState({});
  const [fxData, setFxData] = useState({});
  const [fxPrev, setFxPrev] = useState({});
  const [tab, setTab] = useState('metals');
  const [status, setStatus] = useState('loading');
  const [updated, setUpdated] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [collapsed, setCollapsed] = useState(false);
  const [histModal, setHistModal] = useState(null); // {sym, type}
  const nextFetch = useRef(Date.now() + 60000);

  // Commodities: Finnhub direct
  const fetchCommodities = useCallback(async () => {
    var syms = [...LMP_METALS, ...LMP_ENERGY].map(function(x){ return x.sym; });
    var map = {};
    for (var i = 0; i < syms.length; i++) {
      var sym = syms[i];
      try {
        var d = await fetchFinnhubQuote(sym, 7000);
        if (d && d.price) { map[sym] = d; }
      } catch(e) { console.warn("[FH] commod " + sym, e); }
      if (i < syms.length - 1) await _wait(_FH_DELAY);
    }
    return { map: map, live: Object.keys(map).length > 0 };
  }, []);


  // Forex: open.er-api.com
  const fetchForex = useCallback(async () => {
    var codes = LMP_FOREX.map(function(f){ return f.code; });
    return fetchFinnhubForex(codes);
  }, []);


  // Fallback: fills missing live prices with slightly noised seed values
  const _lmpApplyFallback = (list, map, symKey) => {
    symKey = symKey || 'sym';
    const out = {};
    list.forEach(item => {
      const key = item[symKey];
      if (map[key]) { out[key] = map[key]; return; }
      const noise = (Math.random() - 0.5) * 0.014;
      const p = item.fb.p * (1 + noise);
      out[key] = {
        price: parseFloat(p.toFixed(item.fb.p > 100 ? 2 : 4)),
        prev: item.fb.q,
        change: (p - item.fb.q) / item.fb.q * 100,
        live: false
      };
    });
    return out;
  };

  const fetchAll = useCallback(async () => {
    setStatus('loading');
    const [comm, fx] = await Promise.all([fetchCommodities(), fetchForex()]);
    setMData(_lmpApplyFallback(LMP_METALS, comm.map));
    setEData(_lmpApplyFallback(LMP_ENERGY, comm.map));
    const fxOut = {}, fxPOut = {};
    LMP_FOREX.forEach(f => {
      const noise = (Math.random() - 0.5) * 0.006;
      fxOut[f.code] = fx.rates[f.code] || f.fb * (1 + noise);
      fxPOut[f.code] = fx.prev[f.code] || fxOut[f.code] * (1 + (Math.random() - 0.5) * 0.004);
    });
    setFxData(fxOut);
    setFxPrev(fxPOut);
    setStatus(comm.live || fx.live ? 'live' : 'simulated');
    setUpdated(new Date());
    nextFetch.current = Date.now() + 60000;
    setCountdown(60);
  }, [fetchCommodities, fetchForex]);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 60000);
    return () => clearInterval(t);
  }, [fetchAll]);

  // Geri sayim
  useEffect(() => {
    const t = setInterval(() => setCountdown(Math.max(0, Math.ceil((nextFetch.current - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Fiyat formatlama ──
  const fmtVal = (v, p) => {
    if (!v || isNaN(v)) return '—';
    if (p > 1000) return v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (p < 10) return v.toFixed(4);
    return v.toFixed(2);
  };
  const fmtFx = (v, fb) => {
    if (!v) return '—';
    if (fb >= 100) return v.toFixed(2);
    if (fb < 5) return v.toFixed(4);
    return v.toFixed(3);
  };

  // ── Tab button style ──
  const tabSty = (active, col) => ({
    background: active ? `${col}20` : 'rgba(255,255,255,0.02)',
    color: active ? col : '#94a3b8',
    border: `1px solid ${active ? col + '55' : '#0f172a'}`,
    borderRadius: '7px',
    padding: '5px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Courier New',monospace",
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  });

  // ── Emtia karti ──
  const CommCard = ({
    item,
    d,
    onOpenHistory
  }) => {
    if (!d) return null;
    const up = d.change >= 0;
    const clr = up ? '#34d399' : '#f87171';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))',
        border: `1px solid rgba(${up ? '52,211,153' : '248,113,113'},0.12)`,
        borderRadius: '10px',
        padding: '10px 13px',
        minWidth: '148px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.15s',
        cursor: COMMODITY_HISTORY[item.sym] ? 'pointer' : 'default'
      },
      onClick: () => COMMODITY_HISTORY[item.sym] && onOpenHistory && onOpenHistory(item.sym, 'commodity'),
      onMouseEnter: e => {
        e.currentTarget.style.borderColor = `${clr}44`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.borderColor = `rgba(${up ? '52,211,153' : '248,113,113'},0.12)`;
        e.currentTarget.style.transform = 'none';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg,${clr}44,transparent)`
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '7px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '22px',
        lineHeight: 1
      }
    }, item.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '15px',
        color: '#94a3b8',
        letterSpacing: '0.07em',
        lineHeight: 1
      }
    }, item.sym.replace('=F', ''), !d.live && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '4px',
        color: '#1e293b'
      }
    }, "~")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '17px',
        color: '#94a3b8',
        fontWeight: 'bold',
        lineHeight: 1.3
      }
    }, item.name))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#e2e8f0',
        letterSpacing: '0.01em'
      }
    }, "$", fmtVal(d.price, item.fb.p)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '15px',
        color: '#1e293b'
      }
    }, item.unit), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, COMMODITY_HISTORY[item.sym] && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '15px',
        color: '#64748b'
      }
    }, "\uD83D\uDCC8"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '17px',
        fontWeight: 'bold',
        color: clr
      }
    }, up ? '▲' : '▼', " ", Math.abs(d.change).toFixed(2), "%"))));
  };

  // ── Currency card ──
  const FxCard = ({
    item,
    onOpenHistory
  }) => {
    const rate = fxData[item.code];
    const prev = fxPrev[item.code];
    if (!rate) return null;
    const chg = prev ? (rate - prev) / prev * 100 : 0;
    const up = chg >= 0;
    const clr = up ? '#34d399' : '#f87171';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))',
        border: `1px solid rgba(96,165,250,0.12)`,
        borderRadius: '10px',
        padding: '10px 13px',
        minWidth: '136px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.15s',
        cursor: FOREX_HISTORY[item.code] ? 'pointer' : 'default'
      },
      onClick: () => FOREX_HISTORY[item.code] && onOpenHistory && onOpenHistory(item.code, 'forex'),
      onMouseEnter: e => {
        e.currentTarget.style.borderColor = 'rgba(96,165,250,0.35)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.borderColor = 'rgba(96,165,250,0.12)';
        e.currentTarget.style.transform = 'none';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg,rgba(96,165,250,0.4),transparent)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '7px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '24px',
        lineHeight: 1
      }
    }, item.flag), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: '#60a5fa',
        fontWeight: 'bold',
        letterSpacing: '0.08em',
        lineHeight: 1
      }
    }, item.code), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '16px',
        color: '#94a3b8',
        lineHeight: 1.3
      }
    }, item.name))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '19px',
        fontWeight: 'bold',
        color: '#e2e8f0',
        letterSpacing: '0.01em'
      }
    }, fmtFx(rate, item.fb)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '15px',
        color: '#1e293b'
      }
    }, "1 USD ="), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    }, FOREX_HISTORY[item.code] && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '15px',
        color: '#64748b'
      }
    }, "\uD83D\uDCC8"), prev ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '17px',
        fontWeight: 'bold',
        color: clr
      }
    }, up ? '▲' : '▼', " ", Math.abs(chg).toFixed(3), "%") : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '15px',
        color: '#1e293b'
      }
    }, "\u2014"))));
  };
  const isLive = status === 'live';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#050a15',
      borderBottom: '1px solid rgba(56,189,248,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      background: 'rgba(0,0,0,0.5)',
      borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '17px',
      fontWeight: 'bold',
      color: '#60a5fa',
      letterSpacing: '0.06em'
    }
  }, "\uD83D\uDC8E ", t('liveCommoditiesForex'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('metals'),
    style: tabSty(tab === 'metals', '#fcd34d')
  }, "\uD83E\uDD47 ", t('metals')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('energy'),
    style: tabSty(tab === 'energy', '#f97316')
  }, "\u26FD ", t('energy')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('forex'),
    style: tabSty(tab === 'forex', '#60a5fa')
  }, "\uD83D\uDCB1 ", t('forex'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, status === 'loading' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '16px',
      color: '#94a3b8',
      animation: 'pulse 1.5s infinite'
    }
  }, "\u27F3 ", t('fetchingData')), status !== 'loading' && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '16px',
      color: isLive ? '#34d399' : '#fbbf24'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      flexShrink: 0,
      background: isLive ? '#34d399' : '#fbbf24',
      animation: isLive ? 'pulse 2s infinite' : 'none',
      display: 'inline-block'
    }
  }), isLive ? t('liveDataStatus') : t('simulated')), updated && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '15px',
      color: '#1e293b',
      whiteSpace: 'nowrap'
    }
  }, updated.toLocaleTimeString('tr-TR'), " \xB7 \u21BA", countdown, "s"), /*#__PURE__*/React.createElement("button", {
    onClick: fetchAll,
    title: t('refreshTitle'),
    style: {
      background: 'rgba(56,189,248,0.06)',
      border: '1px solid rgba(56,189,248,0.18)',
      color: '#38bdf8',
      borderRadius: '6px',
      padding: '3px 9px',
      cursor: 'pointer',
      fontSize: '16px',
      fontFamily: 'inherit',
      fontWeight: 'bold'
    }
  }, "\u21BA ", t('refresh')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCollapsed(c => !c),
    style: {
      background: 'transparent',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '17px',
      padding: '0',
      lineHeight: 1
    }
  }, collapsed ? '▼' : '▲'))), !collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 24px 14px',
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      minWidth: 'min-content'
    }
  }, tab === 'metals' && LMP_METALS.map(item => /*#__PURE__*/React.createElement(CommCard, {
    key: item.sym,
    item: item,
    d: mData[item.sym],
    onOpenHistory: (s, t) => setHistModal({
      sym: s,
      type: t
    })
  })), tab === 'energy' && LMP_ENERGY.map(item => /*#__PURE__*/React.createElement(CommCard, {
    key: item.sym,
    item: item,
    d: eData[item.sym],
    onOpenHistory: (s, t) => setHistModal({
      sym: s,
      type: t
    })
  })), tab === 'forex' && LMP_FOREX.map(item => /*#__PURE__*/React.createElement(FxCard, {
    key: item.code,
    item: item,
    onOpenHistory: (s, t) => setHistModal({
      sym: s,
      type: t
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px',
      fontSize: '15px',
      color: '#94a3b8',
      letterSpacing: '0.04em'
    }
  }, "\u25CF ", tab === 'forex' ? t('forexSourceNote') : t('commoditySourceNote')))), histModal && /*#__PURE__*/React.createElement(CommodityHistoryModal, {
    sym: histModal.sym,
    type: histModal.type,
    onClose: () => setHistModal(null)
  }));
}
// ═══════════════════════════════════════════════════════════════
// ──  2. MARKETS  ──
// ═══════════════════════════════════════════════════════════════
function MarketDashboard({
  onNavigate,
  user
}) {
  const {
    t
  } = useLang();
  const [rows, setRows] = useState(() => COMPANIES_FINAL.map(c => ({
    ...c,
    spark: genSpark(c.price, c.change)
  })));
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("none");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [apiMsg, setApiMsg] = useState("");
  // Fix 2: Track triggered alarms so each alert sends only one toast
  const firedAlerts = useRef({});
  const [cart, setCart] = useState(new Set());
  const [watchlist, setWatchlist] = useState(new Set());
  const [alerts, setAlerts] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [buyModal, setBuyModal] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [aiAnalysisModal, setAiAnalysisModal] = useState(null);
  const [riskOpportunityModal, setRiskOpportunityModal] = useState(null);
  const [compareList, setCompareList] = useState(new Set());
  const [compareModal, setCompareModal] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // Fix 4: Arama state'i
  const [search, setSearch] = useState("");
  const addToast = useCallback((msg, type = "success", icon = "✓") => {
    const id = Date.now();
    setToasts(t => [...t, {
      id,
      msg,
      type,
      icon
    }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // live simulation + alarm check
  useEffect(() => {
    const id = setInterval(() => {
      setRows(prev => {
        const next = prev.map(c => {
          const f = (Math.random() - 0.5) * 0.18;
          const np = parseFloat((c.price * (1 + f / 100)).toFixed(2));
          const nc = parseFloat((c.change + f * 0.04).toFixed(2));
          return {
            ...c,
            price: np,
            change: nc,
            spark: [...c.spark.slice(1), {
              v: np
            }]
          };
        });
        // Fix 2: alarm sadece bir kez tetiklenir; esik asildiktan sonra reset icin
        // fiyat tekrar esigin altina inene kadar susturulur
        next.forEach(c => {
          const threshold = alerts[c.ticker];
          if (!threshold) {
            // If the alert was removed, clear the record
            delete firedAlerts.current[c.ticker];
            return;
          }
          const alreadyFired = firedAlerts.current[c.ticker];
          if (c.change >= threshold && !alreadyFired) {
            firedAlerts.current[c.ticker] = true;
            addToast(`${c.name} ${t('alertCreated')} %${threshold} (${c.change.toFixed(2)}%)`, "warn", "◆");
          } else if (c.change < threshold && alreadyFired) {
            // Reset when price falls below the threshold - alert again on the next crossing
            firedAlerts.current[c.ticker] = false;
          }
        });
        return next;
      });
      setUpdated(new Date());
    }, 2500);
    return () => clearInterval(id);
  }, [alerts, addToast]);

  // Real-time price fetch via Finnhub (on mount + every 5 min)
  // Priority tickers loaded first (top companies by market cap)
  var _PRIORITY_TICKERS = [
    'AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','BRK.B','JPM','V',
    'PLTR','NFLX','ORCL','CRM','ADBE','AMD','INTC','QCOM','AVGO','NOW',
    'ABBV','JNJ','UNH','PFE','MRK','GILD','ABT','MDT','ISRG','AMGN',
    'BNTX','REGN','VRTX','SYK','HCA','BSX','CRSP','CVS','BAYRY','SMMNY',
    'SHOP','TCEHY','SAP','SIEGY','DASTY','ADSK','PTC','TRMB','BSY','NEMKY'
  ];

  function _applyPrices(priceMap) {
    if (Object.keys(priceMap).length === 0) return;
    setRows(function(prev){
      return prev.map(function(c){
        var live = priceMap[c.ticker];
        if (!live || !live.price) return c;
        return Object.assign({}, c, {
          price:  live.price,
          change: live.change !== undefined ? live.change : c.change,
          spark:  genSpark(live.price, live.change !== undefined ? live.change : c.change)
        });
      });
    });
    setUpdated(new Date());
  }

  const fetchRealPrices = React.useCallback(async function() {
    var listed = COMPANIES_FINAL.filter(function(c){
      return !c.isPrivate && c.ticker && c.ticker.indexOf('_') < 0;
    });
    var allTickers = listed.map(function(c){ return c.ticker; });

    // Phase 1: Priority tickers (top 50) via Finnhub sequential
    var priority = _PRIORITY_TICKERS.filter(function(t){
      return allTickers.indexOf(t) >= 0;
    });
    var rest = allTickers.filter(function(t){
      return _PRIORITY_TICKERS.indexOf(t) < 0;
    });

    setApiMsg('\u27F3 ' + priority.length + ' symbols...');
    var allPrices = {};
    try {
      var fp1 = await fetchFinnhubBatch(priority, 7000);
      Object.assign(allPrices, fp1);
      _applyPrices(allPrices);
      setApiMsg('\u2713 ' + Object.keys(allPrices).length + ' live');
    } catch(e) {
      setApiMsg('Finnhub error: ' + e.message);
    }

    // Phase 2: Remaining tickers in background (no UI block)
    if (rest.length > 0) {
      setTimeout(async function() {
        try {
          var fp2 = await fetchFinnhubBatch(rest, 7000);
          Object.assign(allPrices, fp2);
          _applyPrices(allPrices);
          setApiMsg('\u2713 ' + Object.keys(allPrices).length + '/' + allTickers.length + ' live prices');
          setTimeout(function(){ setApiMsg(''); }, 6000);
        } catch(e) {
          console.warn('[GMA] Background price fetch error:', e);
        }
      }, 200);
    } else {
      setTimeout(function(){ setApiMsg(''); }, 5000);
    }
  }, []);

  React.useEffect(function() {
    fetchRealPrices();
    var priceTimer = setInterval(fetchRealPrices, 5 * 60 * 1000);
    return function() { clearInterval(priceTimer); };
  }, [fetchRealPrices]);

  // GMA API refresh
  const refresh = useCallback(async () => {
    setLoading(true);
    setApiMsg("GMA Intelligence Layer...");
    const apiKey3 = localStorage.getItem('gma_platform_key') || '';
    if (!apiKey3) {
      setApiMsg("· " + t('noApiKey'));
      setLoading(false);
      setTimeout(() => setApiMsg(""), 4000);
      return;
    }
    try {
      const tickers = COMPANIES_FINAL.filter(c => !c.isPrivate).map(c => c.ticker).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey3,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          tools: [{"type":"web_search_20250305","name":"web_search"}],
          messages: [{
            role: "user",
            content: "Today is April 14, 2026. Use web search to get the current stock market prices for these tickers: " + tickers.slice(0,30).join(", ") + ". Return ONLY a JSON array like: [{'ticker':'AAPL','price':259.20,'change_percent':-0.49}]. Real prices only."
          }]
        })
      });
      const json = await res.json();
      const txt = json.content.filter(b => b.type === "text").map(b => b.text).join("");
      const m = txt.match(/\[[\s\S]*?\]/);
      if (m) {
        const stocks = JSON.parse(m[0]);
        setRows(prev => prev.map(c => {
          const f = stocks.find(s => s.ticker === c.ticker);
          if (f?.price) return {
            ...c,
            price: f.price,
            change: f.change_percent ?? c.change,
            spark: genSpark(f.price, f.change_percent ?? c.change)
          };
          return c;
        }));
        setUpdated(new Date());
        setApiMsg("✓ " + t('liveDataUpdated'));
      } else {
        setApiMsg(t('simulationRunning'));
      }
    } catch (e) {
      setApiMsg("API error: " + e.message);
    }
    setLoading(false);
    setTimeout(() => setApiMsg(""), 4000);
  }, []);
  const handleBuyConfirm = useCallback((c, qty, total) => {
    setPortfolio(p => [...p, {
      name: c.name,
      ticker: c.ticker,
      qty,
      unitPrice: c.price,
      total: Number(total)
    }]);
    setBuyModal(null);
    setPanelOpen(true);
    addToast(`${c.name} · ${qty} ${t('units')} ${t('basketAdded')} · $${total}`, "success", "◆");
  }, [addToast, t]);
  const toggleCart = useCallback((ticker, name) => {
    setCart(s => {
      const n = new Set(s);
      const wasIn = n.has(ticker);
      wasIn ? n.delete(ticker) : n.add(ticker);
      // Fix 3: Toast mesaji closure'daki eski `cart` degil, guncel `wasIn` uzerinden turetiliyor
      addToast(wasIn ? `${name} ${t('cartRemoved')}` : `${name} ${t('basketAdded')}`, "success", "◆");
      return n;
    });
  }, [addToast, t]);
  const toggleWatch = useCallback((ticker, name) => {
    setWatchlist(s => {
      const n = new Set(s);
      const wasIn = n.has(ticker);
      wasIn ? n.delete(ticker) : n.add(ticker);
      // Fix 3: Toast mesaji closure'daki eski `watchlist` degil, guncel `wasIn` uzerinden turetiliyor
      addToast(wasIn ? `${name} ${t('watchRemoved')}` : `${name} ${t('watchAdded')}`, "success", "◆");
      return n;
    });
  }, [addToast, t]);
  const handleSetAlert = useCallback((c, pct) => {
    setAlerts(a => ({
      ...a,
      [c.ticker]: pct
    }));
    setAlertModal(null);
    addToast(`${c.name} +%${pct} ${t('alertCreated')}`, "warn", "◆");
  }, [addToast, t]);
  const toggleCompare = useCallback((ticker, name) => {
    setCompareList(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
        return next;
      }
      if (next.size >= 5) {
        addToast(t('maxCompare'), "error", "· ");
        return prev;
      }
      next.add(ticker);
      addToast(`${name} ${t('addedToComparison')} (${next.size}/5)`, "success", "⚖️");
      return next;
    });
  }, [addToast, t]);
  const gainers = rows.filter(c => c.change > 0).length;
  const losers = rows.filter(c => c.change < 0).length;
  const avgChange = rows.reduce((a, c) => a + c.change, 0) / rows.length;
  const allSectors = [...new Set(COMPANIES_FINAL.map(c => c.sector))];
  const panelCount = cart.size + watchlist.size + portfolio.length;
  const listedCount = COMPANIES_FINAL.filter(c => c.ipoStatus === "listed").length;
  const privateCount = COMPANIES_FINAL.filter(c => c.ipoStatus === "private").length;
  const preIpoCount = COMPANIES_FINAL.filter(c => c.ipoStatus === "pre_ipo").length;
  const ipoPrepCount = COMPANIES_FINAL.filter(c => c.ipoStatus === "ipo_prep").length;
  const ipoRumorCount = COMPANIES_FINAL.filter(c => c.ipoStatus === "ipo_rumor").length;
  const PAGE = 48;
  const [page, setPage] = useState(1);
  const [marketFilter, setMarketFilter] = useState("all"); // all | listed | private | pre_ipo | ipo_prep | ipo_rumor | ipo_any

  useEffect(() => {
    setPage(1);
  }, [filter, sort, marketFilter, search]);
  let filtered = rows;
  // Fix 4: Arama filtresi — ticker, name veya full name uzerinden arama
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(c => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.full.toLowerCase().includes(q));
  }
  // Sector filter
  if (filter !== "all") filtered = filtered.filter(c => c.sector === filter);
  // Market status filter
  if (marketFilter === "listed") filtered = filtered.filter(c => c.ipoStatus === "listed");
  if (marketFilter === "private") filtered = filtered.filter(c => c.ipoStatus === "private");
  if (marketFilter === "ipo_any") filtered = filtered.filter(c => ["pre_ipo", "ipo_prep", "ipo_rumor"].includes(c.ipoStatus));
  if (marketFilter === "pre_ipo") filtered = filtered.filter(c => c.ipoStatus === "pre_ipo");
  if (marketFilter === "ipo_prep") filtered = filtered.filter(c => c.ipoStatus === "ipo_prep");
  if (marketFilter === "ipo_rumor") filtered = filtered.filter(c => c.ipoStatus === "ipo_rumor");
  if (sort === "gainers") filtered = [...filtered].sort((a, b) => b.change - a.change);
  if (sort === "losers") filtered = [...filtered].sort((a, b) => a.change - b.change);
  const displayed = filtered.slice(0, page * PAGE);
  const hasMore = displayed.length < filtered.length;
  const tickerTape = [...rows.slice(0, 40), ...rows.slice(0, 40)];
  return /*#__PURE__*/React.createElement("div", {
    className: "gma-dashboard-page",
    style: {
      background: "#060912",
      minHeight: "100vh",
      color: "#e2e8f0",
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#09101f,#0c1528)",
      borderBottom: "1px solid rgba(56,189,248,0.18)",
      padding: "14px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "19px",
      fontWeight: "bold",
      color: "#38bdf8",
      letterSpacing: "0.06em"
    }
  }, "\u25C8 ", t('dashboardTitle')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "2px",
      letterSpacing: "0.05em"
    }
  }, COMPANIES_FINAL.length, " ", t('dashboardSub'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: t('gainers'),
    value: `▲ ${gainers}`,
    color: "#34d399"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: t('decliners'),
    value: `▼ ${losers}`,
    color: "#f87171"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: t('avgChange'),
    value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`,
    color: avgChange >= 0 ? "#34d399" : "#f87171"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPanelOpen(p => !p),
    style: {
      background: panelCount > 0 ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${panelCount > 0 ? "rgba(56,189,248,0.4)" : "#1e293b"}`,
      color: panelCount > 0 ? "#38bdf8" : "#475569",
      borderRadius: "9px",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "14px",
      fontFamily: "inherit",
      fontWeight: "bold",
      letterSpacing: "0.06em",
      position: "relative"
    }
  }, "\uD83D\uDDC2 ", t('myPanel'), panelCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "-6px",
      right: "-6px",
      background: "#38bdf8",
      color: "#000",
      borderRadius: "50%",
      width: "16px",
      height: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "bold"
    }
  }, panelCount)), /*#__PURE__*/React.createElement("button", {
    onClick: refresh,
    disabled: loading,
    style: {
      background: loading ? "#111827" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
      color: "#fff",
      border: "none",
      borderRadius: "9px",
      padding: "8px 16px",
      cursor: loading ? "not-allowed" : "pointer",
      fontSize: "14px",
      fontFamily: "inherit",
      fontWeight: "bold",
      letterSpacing: "0.07em",
      opacity: loading ? 0.65 : 1,
      transition: "opacity 0.2s"
    }
  }, loading ? "⟳ " + t('refreshing') : "⟳ " + t('fetchAiData')), /*#__PURE__*/React.createElement(LangSelector, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#070c1a",
      borderBottom: "1px solid rgba(56,189,248,0.08)",
      padding: "7px 0",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      animation: "scroll 50s linear infinite",
      fontSize: "14px"
    }
  }, tickerTape.map((c, i) => {
    const up = c.change >= 0;
    const clr = up ? "#34d399" : "#f87171";
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        marginRight: "36px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: c.ipoStatus === "listed" ? "#94a3b8" : "#475569"
      }
    }, c.ticker, " "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: clr
      }
    }, "$", fmtPrice(c.price), " ", up ? "▲" : "▼", Math.abs(c.change).toFixed(2), "%"));
  }))), /*#__PURE__*/React.createElement(LiveMarketPanel, null), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(0,0,0,0.5)",
      borderBottom: "1px solid #0d1525",
      padding: "8px 24px",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "15px",
      color: "#94a3b8",
      flexShrink: 0
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: t('searchPlaceholder'),
    style: {
      flex: 1,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid #1e293b",
      borderRadius: "8px",
      padding: "7px 14px",
      color: "#e2e8f0",
      fontSize: "15px",
      fontFamily: "'Courier New',monospace",
      outline: "none",
      letterSpacing: "0.03em"
    },
    onFocus: e => e.target.style.borderColor = "#38bdf855",
    onBlur: e => e.target.style.borderColor = "#1e293b"
  }), search && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, filtered.length, " ", t('results')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSearch(""),
    style: {
      background: "rgba(248,113,113,0.1)",
      border: "1px solid rgba(248,113,113,0.3)",
      color: "#f87171",
      borderRadius: "6px",
      padding: "6px 12px",
      flexShrink: 0,
      cursor: "pointer",
      fontSize: "14px",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold"
    }
  }, "\u2715 ", t('clear')))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(0,0,0,0.3)",
      borderBottom: "1px solid #0d1525",
      padding: "10px 24px",
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      letterSpacing: "0.06em",
      marginRight: "4px"
    }
  }, t('marketStatus')), [{
    key: "all",
    label: `${t('allStatus')} (${COMPANIES_FINAL.length})`,
    color: "#38bdf8",
    icon: "◆"
  }, {
    key: "listed",
    label: `${t('listedStatus')} (${listedCount})`,
    color: "#34d399",
    icon: "◆"
  }, {
    key: "private",
    label: `${t('privateStatus')} (${privateCount})`,
    color: "#a78bfa",
    icon: "⬇"
  }, {
    key: "ipo_any",
    label: `${t('ipoRadarStatus')} (${preIpoCount + ipoPrepCount + ipoRumorCount})`,
    color: "#fbbf24",
    icon: "◎"
  }, {
    key: "pre_ipo",
    label: `${t('ipoSoonStatus')} (${preIpoCount})`,
    color: "#f97316",
    icon: "⚡"
  }, {
    key: "ipo_prep",
    label: `${t('ipoPrepStatus')} (${ipoPrepCount})`,
    color: "#fbbf24",
    icon: "◎"
  }, {
    key: "ipo_rumor",
    label: `${t('rumorStatus')} (${ipoRumorCount})`,
    color: "#818cf8",
    icon: "○"
  }].map(({
    key,
    label,
    color,
    icon
  }) => /*#__PURE__*/React.createElement("button", {
    key: key,
    onClick: () => setMarketFilter(key),
    style: {
      background: marketFilter === key ? `${color}20` : "rgba(255,255,255,0.02)",
      color: marketFilter === key ? color : "#64748b",
      border: `1px solid ${marketFilter === key ? color + "55" : "#0f172a"}`,
      borderRadius: "6px",
      padding: "5px 10px",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold",
      letterSpacing: "0.06em",
      transition: "all 0.2s"
    }
  }, icon, " ", label)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement(BtnFilter, {
    active: sort === "gainers",
    color: "#34d399",
    onClick: () => setSort(sort === "gainers" ? "none" : "gainers")
  }, "\u2191 ", t('gainers')), /*#__PURE__*/React.createElement(BtnFilter, {
    active: sort === "losers",
    color: "#f87171",
    onClick: () => setSort(sort === "losers" ? "none" : "losers")
  }, "\u2193 ", t('losers')))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 24px",
      display: "flex",
      gap: "5px",
      flexWrap: "wrap",
      alignItems: "center",
      borderBottom: "1px solid #0f172a"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      letterSpacing: "0.06em",
      marginRight: "4px"
    }
  }, t('sectors')), /*#__PURE__*/React.createElement(BtnFilter, {
    active: filter === "all",
    color: "#38bdf8",
    onClick: () => setFilter("all")
  }, t('allSectors')), allSectors.map(s => /*#__PURE__*/React.createElement(BtnFilter, {
    key: s,
    active: filter === s,
    color: SECTORS[s]?.color || "#94a3b8",
    onClick: () => setFilter(s)
  }, t(SECTORS[s]?.tKey) || SECTORS[s]?.label || s))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 24px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#34d399",
      animation: "pulse 2s infinite",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      letterSpacing: "0.05em"
    }
  }, t('liveAutoLabel'), " \xB7 ", updated.toLocaleTimeString("en-US"), " · ", t('autoRefreshShort')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#34d399"
    }
  }, "\u25C8 ", t('listedStatus'), ": ", listedCount), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#a78bfa"
    }
  }, "\u2B21 ", t('privateStatus'), ": ", privateCount), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#f97316"
    }
  }, "\u26A1 ", t('ipoSoonStatus'), ": ", preIpoCount), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#fbbf24"
    }
  }, "\u25CE ", t('prepStatus'), ": ", ipoPrepCount), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#818cf8"
    }
  }, "\u25CC ", t('rumorStatus'), ": ", ipoRumorCount), apiMsg && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      color: "#a78bfa"
    }
  }, "\u25C8 ", apiMsg)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
      gap: "10px",
      padding: "4px 24px 16px"
    }
  }, displayed.map(c => /*#__PURE__*/React.createElement(CompanyCard, {
    key: c.ticker,
    c: c,
    inCart: cart.has(c.ticker),
    isWatched: watchlist.has(c.ticker),
    hasAlert: !!alerts[c.ticker],
    inCompare: compareList.has(c.ticker),
    compareDisabled: compareList.size >= 5,
    onHistory: () => setHistoryModal(c),
    onAIAnalysis: () => setAiAnalysisModal(c),
    onRiskOpportunity: () => setRiskOpportunityModal(c),
    onBuy: () => setBuyModal(c),
    onCart: () => toggleCart(c.ticker, c.name),
    onWatch: () => toggleWatch(c.ticker, c.name),
    onAlert: () => setAlertModal(c),
    onCompare: () => toggleCompare(c.ticker, c.name)
  }))), hasMore && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "16px 24px 32px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPage(p => p + 1),
    style: {
      background: "rgba(56,189,248,0.1)",
      border: "1px solid rgba(56,189,248,0.3)",
      color: "#38bdf8",
      borderRadius: "10px",
      padding: "12px 32px",
      cursor: "pointer",
      fontSize: "15px",
      fontFamily: "'Courier New',monospace",
      fontWeight: "bold",
      letterSpacing: "0.08em"
    }
  }, t('loadMore'), " \xB7 ", displayed.length, " / ", filtered.length)), !hasMore && filtered.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "8px 24px 32px",
      fontSize: "13px",
      color: "#1e293b",
      letterSpacing: "0.06em"
    }
  }, "\u25C8 ", t('allOrganizationsShownPrefix'), " ", filtered.length, " ", t('allOrganizationsShownSuffix')), historyModal && /*#__PURE__*/React.createElement(HistoryModal, {
    c: historyModal,
    onClose: () => setHistoryModal(null)
  }), aiAnalysisModal && /*#__PURE__*/React.createElement(AIAnalysisModal, {
    c: aiAnalysisModal,
    onClose: () => setAiAnalysisModal(null)
  }), riskOpportunityModal && /*#__PURE__*/React.createElement(RiskOpportunityDemoModal, {
    c: riskOpportunityModal,
    onClose: () => setRiskOpportunityModal(null)
  }), buyModal && /*#__PURE__*/React.createElement(BuyModal, {
    c: buyModal,
    onClose: () => setBuyModal(null),
    onConfirm: (qty, total) => handleBuyConfirm(buyModal, qty, total)
  }), alertModal && /*#__PURE__*/React.createElement(AlertModal, {
    c: alertModal,
    currentAlert: alerts[alertModal?.ticker],
    onClose: () => setAlertModal(null),
    onSet: pct => handleSetAlert(alertModal, pct)
  }), compareModal && /*#__PURE__*/React.createElement(CompareModal, {
    companies: rows.filter(r => compareList.has(r.ticker)),
    onClose: () => setCompareModal(false)
  }), /*#__PURE__*/React.createElement(CompareBar, {
    compareList: compareList,
    rows: rows,
    onRemove: ticker => setCompareList(p => {
      const n = new Set(p);
      n.delete(ticker);
      return n;
    }),
    onAnalyze: () => setCompareModal(true),
    onClear: () => setCompareList(new Set())
  }), panelOpen && /*#__PURE__*/React.createElement(SidePanel, {
    cart: cart,
    watchlist: watchlist,
    portfolio: portfolio,
    rows: rows,
    onRemoveCart: ticker => {
      setCart(s => {
        const n = new Set(s);
        n.delete(ticker);
        return n;
      });
    },
    onUnwatch: ticker => {
      setWatchlist(s => {
        const n = new Set(s);
        n.delete(ticker);
        return n;
      });
    },
    onClose: () => setPanelOpen(false)
  }), /*#__PURE__*/React.createElement(Toast, {
    toasts: toasts
  }), /*#__PURE__*/React.createElement("style", null, `
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        @keyframes slideIn{ from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `));
}
function Stat({
  label,
  value,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      letterSpacing: "0.07em"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "21px",
      fontWeight: "bold",
      color,
      fontFamily: "'Courier New',monospace"
    }
  }, value));
}

// ═══════════════════════════════════════════════════════════════
// ── ⚙️ AYARLAR MODALI (API Keys + Google OAuth) ──
// ═══════════════════════════════════════════════════════════════
// ── Admin-only platform key modal (gizli) ──

function UsersManager() {
  var _refresh = React.useState(0);
  var refresh = _refresh[0]; var setRefresh = _refresh[1];
  var _filter = React.useState('');
  var filter = _filter[0]; var setFilter = _filter[1];

  // Load users from localStorage
  var users = [];
  try {
    users = JSON.parse(localStorage.getItem('gma_users') || '[]');
  } catch { users = []; }

  // Enrich with credits and onboarding state
  users = users.map(function(u) {
    var credits = null;
    try { credits = JSON.parse(localStorage.getItem('gma_credits_' + u.email) || 'null'); } catch {}
    var onboarded = localStorage.getItem('gma_onboarded_' + u.email) === '1';
    var hasDNA = !!localStorage.getItem('gma_user_dna_' + u.email);
    return Object.assign({}, u, { _credits: credits, _onboarded: onboarded, _hasDNA: hasDNA });
  });

  // Filter
  if (filter) {
    var f = filter.toLowerCase();
    users = users.filter(function(u){
      return (u.email||'').toLowerCase().indexOf(f) !== -1 ||
             (u.name||'').toLowerCase().indexOf(f) !== -1;
    });
  }

  var deleteUser = function(email) {
    if (!window.confirm('Are you sure you want to permanently delete this user?\n\n' + email + '\n\nThis action cannot be undone.')) return;
    // Remove from users list
    var all = [];
    try { all = JSON.parse(localStorage.getItem('gma_users') || '[]'); } catch {}
    all = all.filter(function(u){ return u.email !== email; });
    localStorage.setItem('gma_users', JSON.stringify(all));
    // Remove credits, onboarding, DNA
    localStorage.removeItem('gma_credits_' + email);
    localStorage.removeItem('gma_onboarded_' + email);
    localStorage.removeItem('gma_user_dna_' + email);
    localStorage.removeItem('gma_profile_' + email);
    localStorage.removeItem('gma_plan_' + email);
    // If deleting current user, log them out
    try {
      var cur = JSON.parse(localStorage.getItem('gma_current_user'));
      if (cur && cur.email === email) {
        localStorage.removeItem('gma_current_user');
      }
    } catch {}
    setRefresh(refresh + 1);
  };

  var resetCredits = function(email) {
    if (!window.confirm('Do you want to reset credits to 3/3?\n\n' + email)) return;
    localStorage.setItem('gma_credits_' + email, '3');
    setRefresh(refresh + 1);
  };

  var resetOnboarding = function(email) {
    if (!window.confirm('Do you want to reset the onboarding survey?\n\n' + email + '\n\nThe user will complete the survey again on next sign-in.')) return;
    localStorage.removeItem('gma_onboarded_' + email);
    localStorage.removeItem('gma_user_dna_' + email);
    setRefresh(refresh + 1);
  };

  var clearAllUsers = function() {
    if (!window.confirm('Do you want to delete ALL users and related data?\n\nThis action CANNOT BE UNDONE.')) return;
    if (!window.confirm('Final warning: all accounts, credits, and profiles will be deleted. Continue?')) return;
    Object.keys(localStorage).filter(function(k){ return k.startsWith('gma_'); })
      .forEach(function(k){ localStorage.removeItem(k); });
    setRefresh(refresh + 1);
    setTimeout(function(){ window.location.reload(); }, 500);
  };

  var exportCSV = function() {
    var rows = ['email,name,joined,credits,onboarded,hasDNA,provider'];
    users.forEach(function(u){
      rows.push([
        u.email||'', u.name||'', u.joined||'',
        u._credits === null ? '3 (default)' : u._credits,
        u._onboarded ? 'yes' : 'no',
        u._hasDNA ? 'yes' : 'no',
        u.provider || 'email'
      ].join(','));
    });
    var csv = rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'gma_users_' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  var fmt = function(v) { return v == null ? '-' : v; };
  var badge = function(color, text) {
    return React.createElement('span', {
      style: {
        display: 'inline-block', padding: '2px 8px',
        background: 'rgba(' + color + ',0.15)',
        border: '1px solid rgba(' + color + ',0.3)',
        borderRadius: '999px', fontSize: '9px',
        color: 'rgb(' + color + ')', letterSpacing: '0.05em',
        fontWeight: 500
      }
    }, text);
  };

  return React.createElement('div', null,
    // Toolbar
    React.createElement('div', {
      style: { display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }
    },
      React.createElement('input', {
        type: 'text', value: filter,
        onChange: function(e){ setFilter(e.target.value); },
        placeholder: 'Email veya isim ara...',
        style: {
          flex: 1, minWidth: '180px',
          padding: '8px 12px', background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(148,163,184,0.15)', borderRadius: '7px',
          color: '#e2e8f0', fontFamily: 'inherit', fontSize: '12px'
        }
      }),
      React.createElement('div', {
        style: { fontSize: '11px', color: '#64748b', letterSpacing: '0.05em' }
      }, users.length + ' users'),
      React.createElement('button', {
        onClick: function(){ setRefresh(refresh + 1); },
        style: {
          padding: '7px 12px', background: 'rgba(56,189,248,0.1)',
          border: '1px solid rgba(56,189,248,0.3)', borderRadius: '7px',
          color: '#38bdf8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px'
        }
      }, '↻ Refresh'),
      React.createElement('button', {
        onClick: exportCSV,
        style: {
          padding: '7px 12px', background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.3)', borderRadius: '7px',
          color: '#34d399', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px'
        }
      }, '⬇ CSV')
    ),
    // User list
    users.length === 0
      ? React.createElement('div', {
          style: { padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px',
                   background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }
        }, filter ? 'Eslesen users yok' : 'Henuz kayitli users yok')
      : React.createElement('div', {
          style: {
            maxHeight: '360px', overflowY: 'auto', marginBottom: '10px',
            border: '1px solid rgba(148,163,184,0.08)', borderRadius: '8px'
          }
        },
          users.map(function(u, idx) {
            return React.createElement('div', {
              key: u.email,
              style: {
                padding: '12px 14px',
                borderBottom: idx < users.length - 1 ? '1px solid rgba(148,163,184,0.06)' : 'none',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
              }
            },
              // User info
              React.createElement('div', { style: { flex: 1, minWidth: '200px' } },
                React.createElement('div', {
                  style: { fontSize: '13px', color: '#e2e8f0', fontWeight: 500, marginBottom: '3px' }
                }, u.email),
                React.createElement('div', {
                  style: { fontSize: '10px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }
                },
                  React.createElement('span', null, '◆' + fmt(u.name)),
                  u.joined && React.createElement('span', null, '◆' + u.joined.slice(0,10)),
                  u.provider === 'google' && React.createElement('span', { style: { color: '#4285f4' } }, 'Google'),
                  React.createElement('span', {
                    style: { color: u._credits === 0 ? '#f87171' : '#94a3b8' }
                  }, '◆' + (u._credits === null ? '3/3 (default)' : u._credits + '/3')),
                  u._onboarded && badge('167,139,250', 'Onboarded'),
                  u._hasDNA && badge('212,175,55', 'DNA')
                )
              ),
              // Actions
              React.createElement('div', { style: { display: 'flex', gap: '5px', flexWrap: 'wrap' } },
                React.createElement('button', {
                  onClick: function(){ resetCredits(u.email); },
                  style: {
                    padding: '5px 10px', background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.2)', borderRadius: '6px',
                    color: '#34d399', cursor: 'pointer', fontFamily: 'inherit', fontSize: '10px'
                  }
                }, '↻ Kredi'),
                React.createElement('button', {
                  onClick: function(){ resetOnboarding(u.email); },
                  style: {
                    padding: '5px 10px', background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.2)', borderRadius: '6px',
                    color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', fontSize: '10px'
                  }
                }, '↻ DNA'),
                React.createElement('button', {
                  onClick: function(){ deleteUser(u.email); },
                  style: {
                    padding: '5px 10px', background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.25)', borderRadius: '6px',
                    color: '#f87171', cursor: 'pointer', fontFamily: 'inherit', fontSize: '10px',
                    fontWeight: 'bold'
                  }
                }, '✕ Sil')
              )
            );
          })
        ),
    // Danger zone
    React.createElement('button', {
      onClick: clearAllUsers,
      style: {
        width: '100%', padding: '10px',
        background: 'rgba(248,113,113,0.08)',
        border: '1px solid rgba(248,113,113,0.3)',
        borderRadius: '8px', color: '#f87171',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px',
        fontWeight: 'bold', letterSpacing: '0.05em',
        marginTop: '6px'
      }
    }, '☢ DELETE ALL USERS (Dangerous)')
  );
}


function ApiKeyModal({onClose}) {
  var _fh = React.useState(localStorage.getItem('gma_finnhub_key')||'d7f8b4pr01qpjqqjrge0d7f8b4pr01qpjqqjrgeg'); var finnhubKey=_fh[0]; var setFinnhubKey=_fh[1];
  var _ak = React.useState(localStorage.getItem('gma_platform_key')||''); var apiKey=_ak[0]; var setApiKey=_ak[1];
  var _gk = React.useState(localStorage.getItem('gma_google_client_id')||''); var googleId=_gk[0]; var setGoogleId=_gk[1];
  var _pv = React.useState(localStorage.getItem('gma_paddle_vendor_id')||''); var paddleVid=_pv[0]; var setPaddleVid=_pv[1];
  var _pct = React.useState(localStorage.getItem('gma_paddle_client_token')||''); var paddleClientToken=_pct[0]; var setPaddleClientToken=_pct[1];
  var _pe = React.useState(localStorage.getItem('gma_paddle_env')||'production'); var paddleEnv=_pe[0]; var setPaddleEnv=_pe[1];
  var _pd = React.useState(localStorage.getItem('gma_price_daily')||''); var priceD=_pd[0]; var setPriceD=_pd[1];
  var _pm = React.useState(localStorage.getItem('gma_price_monthly')||''); var priceM=_pm[0]; var setPriceM=_pm[1];
  var _py = React.useState(localStorage.getItem('gma_price_yearly')||''); var priceY=_py[0]; var setPriceY=_py[1];
  var _pex = React.useState(localStorage.getItem('gma_price_explorer')||''); var priceExplorer=_pex[0]; var setPriceExplorer=_pex[1];
  var _pst = React.useState(localStorage.getItem('gma_price_strategist')||''); var priceStrategist=_pst[0]; var setPriceStrategist=_pst[1];
  var _ppa = React.useState(localStorage.getItem('gma_price_pro_architect')||''); var priceProArchitect=_ppa[0]; var setPriceProArchitect=_ppa[1];
  var _sv = React.useState(false); var saved=_sv[0]; var setSaved=_sv[1];

  function save() {
    if (finnhubKey.trim()) localStorage.setItem('gma_finnhub_key', finnhubKey.trim());
    if (apiKey.trim()) localStorage.setItem('gma_platform_key', apiKey.trim());
    if (googleId.trim()) localStorage.setItem('gma_google_client_id', googleId.trim());
    if (paddleClientToken.trim()) localStorage.setItem('gma_paddle_client_token', paddleClientToken.trim());
    if (paddleVid.trim()) localStorage.setItem('gma_paddle_vendor_id', paddleVid.trim());
    localStorage.setItem('gma_paddle_env', paddleEnv);
    if (priceExplorer.trim()) localStorage.setItem('gma_price_explorer', priceExplorer.trim());
    if (priceStrategist.trim()) localStorage.setItem('gma_price_strategist', priceStrategist.trim());
    if (priceProArchitect.trim()) localStorage.setItem('gma_price_pro_architect', priceProArchitect.trim());
    if (priceD.trim()) localStorage.setItem('gma_price_daily', priceD.trim());
    if (priceM.trim()) localStorage.setItem('gma_price_monthly', priceM.trim());
    if (priceY.trim()) localStorage.setItem('gma_price_yearly', priceY.trim());
    setSaved(true);
    setTimeout(function(){setSaved(false);}, 2500);
  }

  function clearAll() {
    if (!window.confirm('Clear all saved keys?')) return;
    ['gma_finnhub_key','gma_platform_key','gma_google_client_id','gma_paddle_client_token','gma_paddle_vendor_id','gma_paddle_env',
     'gma_price_explorer','gma_price_strategist','gma_price_pro_architect',
     'gma_price_daily','gma_price_monthly','gma_price_yearly'].forEach(function(k){localStorage.removeItem(k);});
    setFinnhubKey(''); setApiKey(''); setGoogleId(''); setPaddleVid(''); setPaddleEnv('production');
    setPriceD(''); setPriceM(''); setPriceY('');
    setPaddleClientToken(''); setPriceExplorer(''); setPriceStrategist(''); setPriceProArchitect('');
  }

  var S = {
    overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',overflowY:'auto'},
    box:{background:'#0d1628',border:'1px solid #334155',borderRadius:'16px',padding:'24px',maxWidth:'480px',width:'100%',fontFamily:"'Courier New',monospace",maxHeight:'90vh',overflowY:'auto'},
    title:{fontSize:'13px',fontWeight:'bold',color:'#38bdf8',marginBottom:'4px'},
    sub:{fontSize:'11px',color:'#475569',marginBottom:'16px',lineHeight:1.6,padding:'8px 10px',background:'rgba(251,191,36,0.05)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'8px'},
    section:{fontSize:'10px',color:'#38bdf8',letterSpacing:'0.1em',marginTop:'16px',marginBottom:'8px',borderBottom:'1px solid #1e293b',paddingBottom:'4px'},
    label:{fontSize:'10px',color:'#64748b',marginBottom:'4px',marginTop:'10px'},
    input:{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid #1e293b',borderRadius:'8px',padding:'9px 12px',color:'#e2e8f0',fontSize:'12px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'},
    select:{width:'100%',background:'#0d1628',border:'1px solid #1e293b',borderRadius:'8px',padding:'9px 12px',color:'#e2e8f0',fontSize:'12px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'},
    row:{display:'flex',gap:'8px',marginTop:'16px'},
    btnClose:{flex:1,padding:'10px',background:'transparent',border:'1px solid #1e293b',borderRadius:'8px',color:'#64748b',cursor:'pointer',fontSize:'12px',fontFamily:'inherit'},
    btnSave:{flex:2,padding:'10px',background:saved?'rgba(52,211,153,0.2)':'linear-gradient(135deg,#0ea5e9,#6366f1)',border:saved?'1px solid #34d399':'none',borderRadius:'8px',color:saved?'#34d399':'#fff',cursor:'pointer',fontSize:'12px',fontFamily:'inherit',fontWeight:'bold'},
    btnClear:{padding:'10px 14px',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:'8px',color:'#f87171',cursor:'pointer',fontSize:'12px',fontFamily:'inherit'}
  };

  return React.createElement("div",{style:S.overlay,onClick:onClose},
    React.createElement("div",{style:S.box,onClick:function(e){e.stopPropagation();}},
      React.createElement("div",{style:S.title},"\u2699 Platform Management Panel"),
      React.createElement("div",{style:S.sub},"Admin only \u2014 this panel is not visible to regular users. Keys are saved to browser localStorage and applied immediately."),

      React.createElement("div",{style:S.section},"FINNHUB MARKET DATA"),
React.createElement("div",{style:S.label},"FINNHUB API KEY (finnhub.io)"),
React.createElement("input",{type:"text",value:finnhubKey,onChange:function(e){setFinnhubKey(e.target.value);},placeholder:"d7f8b4pr01...",style:S.input}),
React.createElement("div",{style:{fontSize:'10px',color:'#64748b',marginTop:'4px'}},"Free: 60 req/min | finnhub.io/dashboard"),

React.createElement("div",{style:S.section},"ANTHROPIC API"),
      React.createElement("div",{style:S.label},"PLATFORM API KEY (sk-ant-...)"),
      React.createElement("input",{type:"password",value:apiKey,onChange:function(e){setApiKey(e.target.value);},placeholder:"sk-ant-api03-...",style:S.input}),

      React.createElement("div",{style:S.section},"GOOGLE AUTH"),
      React.createElement("div",{style:S.label},"GOOGLE CLIENT ID"),
      React.createElement("input",{type:"text",value:googleId,onChange:function(e){setGoogleId(e.target.value);},placeholder:"xxxxxxxxxxxx.apps.googleusercontent.com",style:S.input}),
      React.createElement("div",{style:{fontSize:'10px',color:'#64748b',marginTop:'4px',lineHeight:1.6}},
        "console.cloud.google.com \u2192 Credentials \u2192 Create OAuth 2.0 Client ID \u2192 Web application \u2192 Authorized origin: https://globalmarketanalytics.com"
      ),

      React.createElement("div",{style:S.section},"PADDLE PAYMENTS"),
      React.createElement("div",{style:S.label},"CLIENT-SIDE TOKEN (Billing v2)"),
      React.createElement("input",{type:"text",value:paddleClientToken,onChange:function(e){setPaddleClientToken(e.target.value);},placeholder:"test_... / live_...",style:S.input}),
      React.createElement("div",{style:S.label},"VENDOR ID"),
      React.createElement("input",{type:"text",value:paddleVid,onChange:function(e){setPaddleVid(e.target.value);},placeholder:"123456",style:S.input}),
      React.createElement("div",{style:S.label},"ENVIRONMENT"),
      React.createElement("select",{value:paddleEnv,onChange:function(e){setPaddleEnv(e.target.value);},style:S.select},
        React.createElement("option",{value:"production"},"production"),
        React.createElement("option",{value:"sandbox"},"sandbox (test)")
      ),
      React.createElement("div",{style:S.label},"EXPLORER PRICE ID (pri_...)"),
      React.createElement("input",{type:"text",value:priceExplorer,onChange:function(e){setPriceExplorer(e.target.value);},placeholder:"pri_...",style:S.input}),
      React.createElement("div",{style:S.label},"PROFESSIONAL PRICE ID (pri_...)"),
      React.createElement("input",{type:"text",value:priceStrategist,onChange:function(e){setPriceStrategist(e.target.value);},placeholder:"pri_...",style:S.input}),
      React.createElement("div",{style:S.label},"ENTERPRISE PRICE ID (pri_...)"),
      React.createElement("input",{type:"text",value:priceProArchitect,onChange:function(e){setPriceProArchitect(e.target.value);},placeholder:"pri_...",style:S.input}),
      React.createElement("div",{style:S.label},"DAILY PRICE ID (pri_...)"),
      React.createElement("input",{type:"text",value:priceD,onChange:function(e){setPriceD(e.target.value);},placeholder:"pri_...",style:S.input}),
      React.createElement("div",{style:S.label},"MONTHLY PRICE ID (pri_...)"),
      React.createElement("input",{type:"text",value:priceM,onChange:function(e){setPriceM(e.target.value);},placeholder:"pri_...",style:S.input}),
      React.createElement("div",{style:S.label},"YEARLY PRICE ID (pri_...)"),
      React.createElement("input",{type:"text",value:priceY,onChange:function(e){setPriceY(e.target.value);},placeholder:"pri_...",style:S.input}),

      React.createElement("div",{style:S.section},"USER MANAGEMENT"),
      React.createElement(UsersManager, null),


      React.createElement("div",{style:S.row},
        React.createElement("button",{onClick:clearAll,style:S.btnClear},"\u2715 Clear"),
        React.createElement("button",{onClick:onClose,style:S.btnClose},"Close"),
        React.createElement("button",{onClick:save,style:S.btnSave},saved?"\u2713 Saved!":"\u25C8 Save All")
      )
    )
  );
}



// ═══════════════════════════════════════════════════════════════
// ── ·  ANA SAYFA ──
// ═══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// ── GMA PRICING SYSTEM ──
// ══════════════════════════════════════════════════════
const GMA_PLANS = {
  free: {
    id: 'free', label: 'Free Trial', labelKey: 'planFreeLabel', price: 0, period: '',
    credits: 3, color: '#64748b', multiAI: false,
    badge: '3 ANALYSES', badgeKey: 'planFreeBadge', scope: '1 Sector', scopeKey: 'planFreeScope', statsKey: 'planFreeStats'
  },
  explorer: {
    id: 'explorer', label: 'Explorer', labelKey: 'planExplorerLabel', price: 19.99, period: '/mo', periodKey: 'periodMonth',
    credits: 10, color: '#8fa3bd', multiAI: true,
    badge: 'STARTER', badgeKey: 'planExplorerBadge', scope: '1 Sector · 10 Analyses', scopeKey: 'planExplorerScope', statsKey: 'planExplorerStats'
  },
  strategist: {
    id: 'strategist', label: 'Professional', labelKey: 'planStrategistLabel', price: 49.99, period: '/mo', periodKey: 'periodMonth',
    credits: 999, color: '#b6c2d0', multiAI: true,
    badge: 'MOST POPULAR', badgeKey: 'planStrategistBadge', scope: 'Unlimited · All Sectors', scopeKey: 'planStrategistScope', statsKey: 'planStrategistStats'
  },
  pro_architect: {
    id: 'pro_architect', label: 'Enterprise', labelKey: 'planProArchitectLabel', price: 99.99, period: '/mo', periodKey: 'periodMonth',
    credits: 999, color: '#c2a15a', multiAI: true,
    badge: 'ENTERPRISE', badgeKey: 'planProArchitectBadge', scope: 'Global + Analytics DNA · 126 Years', scopeKey: 'planProArchitectScope', statsKey: 'planProArchitectStats'
  }
};
function getPlanText(t, plan, part) {
  if (!plan) return '';
  const key = plan[part + 'Key'];
  return key ? t(key) : (plan[part] || '');
}
function getPlanPeriod(t, plan) {
  if (!plan) return '';
  return plan.periodKey ? t(plan.periodKey) : (plan.period || '');
}
const PADDLE_LINKS = {
  explorer:     GMA_CONFIG.paddle?.explorer     || localStorage.getItem('gma_paddle_explorer')     || 'https://buy.paddle.com/GMA_EXPLORER',
  strategist:   GMA_CONFIG.paddle?.strategist   || localStorage.getItem('gma_paddle_strategist')   || 'https://buy.paddle.com/GMA_STRATEGIST',
  pro_architect:GMA_CONFIG.paddle?.pro_architect|| localStorage.getItem('gma_paddle_proarchitect') || 'https://buy.paddle.com/GMA_PROARCHITECT'
};
function getPlanCredits(email) {
  try {
    const p = JSON.parse(localStorage.getItem('gma_plan_' + email) || 'null');
    return p ? p.credits : 5;
  } catch {
    return 5;
  }
}
function setPlanActive(email, planId) {
  const p = GMA_PLANS[planId];
  localStorage.setItem('gma_plan_' + email, JSON.stringify({
    planId,
    credits: p.credits,
    at: Date.now()
  }));
}

// ======================================================================
// --  PADDLE PAYMENT MODAL --
// ======================================================================
function PaddlePaymentModal({plan,user,onClose,onSuccess}) {
  var t = useLang().t;
  var step = React.useState('confirm'), setStep = step[1]; step = step[0];
  var errMsg = React.useState(''), setErrMsg = errMsg[1]; errMsg = errMsg[0];
  var planColor = plan && plan.color ? plan.color : '#38bdf8';
  function handleCheckout() {
    var priceId = PADDLE_PRICES()[plan.id];
    var clientToken = PADDLE_CLIENT_TOKEN();
    var vendorId = PADDLE_VENDOR_ID();
    setStep('processing');
    if (!clientToken && !vendorId) { setErrMsg(t('paddleConfigMissing')); setStep('error'); return; }
    if (!priceId) { setErrMsg(t('paddlePriceMissing')); setStep('error'); return; }
    if (!window.Paddle) {
      var s=document.createElement('script'); s.src='https://cdn.paddle.com/paddle/paddle.js';
      s.onload=function(){openPaddle(clientToken,vendorId,priceId)};
      s.onerror=function(){setErrMsg('Paddle.js could not be loaded.');setStep('error')};
      document.head.appendChild(s);
    } else { openPaddle(clientToken, vendorId, priceId); }
  }
  function openPaddle(clientToken, vendorId, priceId) {
    try {
      if (PADDLE_ENV() === 'sandbox' && window.Paddle.Environment?.set) window.Paddle.Environment.set('sandbox');
      if (clientToken && window.Paddle.Initialize) {
        window.Paddle.Initialize({
          token: clientToken,
          eventCallback: function(event) {
            if (event && event.name === 'checkout.completed') {
              setStep('success');
              onSuccess&&onSuccess(plan.id);
            }
            if (event && event.name === 'checkout.closed') setStep('confirm');
          }
        });
        window.Paddle.Checkout.open({
          items: [{ priceId: priceId, quantity: 1 }],
          customer: user&&user.email ? { email: user.email } : undefined,
          settings: {
            successUrl: GMA_CONFIG.paddle?.successUrl,
            theme: 'dark'
          }
        });
      } else if (vendorId && window.Paddle.Setup) {
        window.Paddle.Setup({vendor:parseInt(vendorId,10)});
        window.Paddle.Checkout.open({
          product: priceId||plan.id, email: user&&user.email?user.email:'',
          successCallback:function(){setStep('success');onSuccess&&onSuccess(plan.id)},
          closeCallback:function(){setStep('confirm')}
        });
      } else {
        throw new Error('Paddle Billing client token is required.');
      }
    } catch(e){setErrMsg('Paddle init failed: '+e.message);setStep('error');}
  }
  var badges = ['\uD83D\uDD12 256-bit SSL','\u2713 ' + t('paddleSecured'),'\u2713 PCI DSS'];
  return React.createElement("div",{onClick:onClose,style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:9900,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}},
    React.createElement("div",{onClick:function(e){e.stopPropagation()},style:{background:'linear-gradient(145deg,#0a1220,#060912)',border:'1px solid '+planColor+'44',borderRadius:'20px',width:'100%',maxWidth:'440px',fontFamily:"'Courier New',monospace",overflow:'hidden'}},
      React.createElement("div",{style:{padding:'20px 24px 16px',borderBottom:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center'}},
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:'11px',color:planColor,letterSpacing:'0.1em',marginBottom:'4px'}},"\uD83D\uDCB3 ", t('secureCheckoutViaPaddle')),
          React.createElement("div",{style:{fontSize:'16px',fontWeight:'bold',color:'#f1f5f9'}},
            getPlanText(t, plan, 'label'), " ", t('plan'), " \u2014 $",plan&&plan.price,
            React.createElement("span",{style:{fontSize:'12px',color:'#64748b'}},getPlanPeriod(t, plan))
          )
        ),
        React.createElement("button",{onClick:onClose,style:{background:'transparent',border:'none',color:'#64748b',fontSize:'18px',cursor:'pointer',padding:'4px'}},"\u2715")
      ),
      React.createElement("div",{style:{padding:'22px 24px'}},
        (step==='confirm'||step==='error')&&React.createElement("div",null,
          React.createElement("div",{style:{display:'flex',gap:'8px',marginBottom:'18px',flexWrap:'wrap'}},
            badges.map(function(b){return React.createElement("div",{key:b,style:{fontSize:'10px',color:'#64748b',background:'rgba(255,255,255,0.03)',border:'1px solid #1e293b',borderRadius:'16px',padding:'3px 10px'}},b)})
          ),
          React.createElement("div",{style:{background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)',borderRadius:'12px',padding:'16px',marginBottom:'18px',fontSize:'12px',color:'#94a3b8',lineHeight:1.8}},
            React.createElement("div",{style:{fontWeight:'bold',color:'#38bdf8',marginBottom:'8px',fontSize:'13px'}},t('secureCheckoutTitle')),
            t('secureCheckoutBody')
          ),
          step==='error'&&errMsg&&React.createElement("div",{style:{marginBottom:'14px',padding:'10px 14px',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'8px',fontSize:'12px',color:'#f87171'}},"\u26A0 ",errMsg),
          React.createElement("button",{onClick:handleCheckout,style:{width:'100%',padding:'14px',background:'linear-gradient(135deg,'+planColor+','+planColor+'bb)',border:'none',borderRadius:'11px',color:'#000',cursor:'pointer',fontSize:'14px',fontFamily:'inherit',fontWeight:'bold',letterSpacing:'0.07em',transition:'all 0.2s'}},
            plan&&plan.price===0?t('startFreeCheckout'):t('proceedToCheckout')+' \u2014 $'+(plan&&plan.price)+' \u2192'
          ),
          React.createElement("div",{style:{textAlign:'center',marginTop:'12px',fontSize:'10px',color:'#64748b',lineHeight:1.6}},
            t('checkoutSecuredNote'))
        ),
        step==='processing'&&React.createElement("div",{style:{textAlign:'center',padding:'40px 0'}},
          React.createElement("div",{style:{fontSize:'40px',marginBottom:'14px'}},"\u23F3"),
          React.createElement("div",{style:{fontSize:'14px',color:planColor,fontWeight:'bold',marginBottom:'6px'}},t('openingPaddle')),
          React.createElement("div",{style:{fontSize:'11px',color:'#64748b'}},t('pleaseWait'))
        ),
        step==='success'&&React.createElement("div",{style:{textAlign:'center',padding:'30px 0'}},
          React.createElement("div",{style:{fontSize:'48px',marginBottom:'14px'}},"\uD83C\uDF89"),
          React.createElement("div",{style:{fontSize:'15px',fontWeight:'bold',color:'#34d399',marginBottom:'8px'}},t('accessActivated')),
          React.createElement("div",{style:{fontSize:'12px',color:'#64748b',lineHeight:1.7,marginBottom:'20px'}},
            getPlanText(t, plan, 'label'), " ", t('planActivatedShort'), " ", plan&&plan.credits," ", t('creditsAdded')),
          React.createElement("button",{onClick:function(){onSuccess&&onSuccess(plan.id);onClose()},style:{padding:'12px 28px',background:'linear-gradient(135deg,#059669,#10b981)',border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'13px',fontFamily:'inherit',fontWeight:'bold'}},
            "\u25C8 ", t('goToMarkets'), " \u2192")
        )
      )
    )
  );
}

// ═══════════════════════════════════════════════════════════════
// ──  3. PRICING  ──
// ═══════════════════════════════════════════════════════════════
function PricingPage({
  onNavigate,
  user
}) {
  const {
    t
  } = useLang();
  const [payModal, setPayModal] = React.useState(null); // plan objesi
  const [payDone, setPayDone] = React.useState(false);
  const [activePlanId, setActivePlanId] = React.useState(null);
  const plans = Object.values(GMA_PLANS);
  const comparisonGrid = 'minmax(260px, 1.45fr) repeat(4, minmax(120px, 0.7fr))';
  const featureRows = [{
    label: t('marketDataPlan'),
    vals: [true, true, true, true]
  }, {
    label: t('feat3t'),
    vals: [true, true, true, true]
  }, {
    label: t('gmaStructuredAnalysis'),
    vals: [false, true, true, true]
  }, {
    label: t('gmaConsensus'),
    vals: [false, false, true, true]
  }, {
    label: t('feat4t'),
    vals: ['1', '5', '30', t('unlimited')]
  }, {
    label: t('monthlyAiAnalyses'),
    vals: ['5', '30', '300', '5000+']
  }, {
    label: t('alertsWatchlist'),
    vals: [false, true, true, true]
  }, {
    label: t('portfolioManagement'),
    vals: [false, false, true, true]
  }, {
    label: t('prioritySupport'),
    vals: [false, false, false, true]
  }];
  const handleSelect = plan => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (plan.id === 'free') {
      setPlanActive(user.email, 'free');
      setActivePlanId('free');
      setPayDone(true);
      return;
    }
    // Paddle odeme modalini ac
    setPayModal(plan);
  };
  const handlePaySuccess = planId => {
    setPlanActive(user.email, planId);
    setActivePlanId(planId);
    setPayDone(true);
    setPayModal(null);
  };

  // Odeme sonrasi ekran
  const userKey = payDone && user ? 'GMA-' + (user.email?.slice(0, 4) || 'USER').toUpperCase() + '-' + btoa(user.email || '').slice(0, 8).toUpperCase() : '';
  if (payDone && activePlanId) {
    const plan = GMA_PLANS[activePlanId];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        background: '#060912',
        color: '#e2e8f0',
        fontFamily: "'Courier New',monospace",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '64px',
        marginBottom: '16px'
      }
    }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '13px',
        color: '#34d399',
        letterSpacing: '0.12em',
        marginBottom: '8px'
      }
    }, t('paymentSuccessful')), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'clamp(22px,3vw,34px)',
        fontWeight: 'bold',
        color: '#f1f5f9',
        marginBottom: '20px',
        lineHeight: 1.2
      }
    }, getPlanText(t, plan, 'label'), " ", t('planActivated')), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(52,211,153,0.06)',
        border: '1px solid rgba(52,211,153,0.25)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#94a3b8',
        letterSpacing: '0.08em',
        marginBottom: '10px'
      }
    }, "\uD83D\uDD11 " + t('payKey')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#34d399',
        letterSpacing: '0.07em',
        wordBreak: 'break-all',
        padding: '12px',
        background: 'rgba(52,211,153,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(52,211,153,0.15)',
        marginBottom: '10px'
      }
    }, userKey), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#94a3b8',
        lineHeight: 1.7
      }
    }, t('payKeyLinkedNote'), /*#__PURE__*/React.createElement("br", null), t('sovereignAutoNote'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onNavigate('dashboard'),
      style: {
        padding: '14px 32px',
        background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
        border: 'none',
        color: '#fff',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'inherit',
        fontWeight: 'bold',
        boxShadow: '0 8px 24px rgba(14,165,233,0.3)'
      }
    }, "\u25C8 ", t('goToMarkets'), " \u2192"), /*#__PURE__*/React.createElement("button", {
      onClick: () => onNavigate('profile'),
      style: {
        padding: '14px 24px',
        background: 'transparent',
        border: '1px solid #334155',
        color: '#94a3b8',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '13px',
        fontFamily: 'inherit'
      }
    }, "\uD83D\uDC64 ", t('myProfile')))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: 'gma-pricing-page',
    style: {
      minHeight: '100vh',
      background: '#060912',
      color: '#e2e8f0',
      fontFamily: "'Courier New',monospace",
      padding: '60px 24px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '48px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(26px,4vw,44px)',
      fontWeight: 'bold',
      marginBottom: '12px',
      background: 'linear-gradient(135deg,#f1f5f9,#38bdf8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  }, t('pricingTitle')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '15px',
      color: '#cbd5e1',
      maxWidth: '480px',
      margin: '0 auto',
      lineHeight: 1.7
    }
  }, t('pricingManagedLine1'), /*#__PURE__*/React.createElement("br", null), t('pricingManagedLine2'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: '16px',
      maxWidth: '980px',
      margin: '0 auto 48px'
    }
  }, plans.map(plan => /*#__PURE__*/React.createElement("div", {
    key: plan.id,
    className: `gma-pricing-card gma-pricing-card-${plan.id}`,
    style: {
      background: plan.badge ? `linear-gradient(145deg,${plan.color}12,#080d18)` : 'linear-gradient(145deg,#0c1220,#080d18)',
      border: `1px solid ${plan.badge ? plan.color + '44' : '#1e293b'}`,
      borderRadius: '16px',
      padding: '28px 22px',
      position: 'relative',
      transform: plan.id === 'monthly' ? 'scale(1.04)' : 'none',
      boxShadow: plan.id === 'monthly' ? `0 0 32px ${plan.color}18` : 'none',
      transition: 'transform 0.2s'
    },
    onMouseEnter: e => {
      if (plan.id !== 'monthly') e.currentTarget.style.transform = 'scale(1.01)';
    },
    onMouseLeave: e => {
      if (plan.id !== 'monthly') e.currentTarget.style.transform = 'scale(1)';
    }
  }, plan.badge && /*#__PURE__*/React.createElement("div", {
    className: 'gma-pricing-badge',
    style: {
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: `linear-gradient(135deg,${plan.color},${plan.color}bb)`,
      color: '#000',
      borderRadius: '20px',
      padding: '4px 14px',
      fontSize: '10px',
      fontWeight: 'bold',
      letterSpacing: '0.08em',
      whiteSpace: 'nowrap'
    }
  }, getPlanText(t, plan, 'badge')), /*#__PURE__*/React.createElement("div", {
    className: 'gma-pricing-plan-label',
    style: {
      fontSize: '11px',
      color: plan.color,
      letterSpacing: '0.1em',
      marginBottom: '8px'
    }
  }, getPlanText(t, plan, 'label')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '4px',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '34px',
      fontWeight: 'bold',
      color: '#f1f5f9'
    }
  }, "$", plan.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#94a3b8'
    }
  }, getPlanPeriod(t, plan))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: plan.color,
      marginBottom: '18px'
    }
  }, t(plan.statsKey)), /*#__PURE__*/React.createElement("div", {
    className: 'gma-pricing-features',
    style: {
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '7px'
    }
  }, [plan.multiAI ? `✓ ${t('gmaConsensus')} (3)` : `✗ ${t('gmaConsensus')}`, plan.id !== 'free' ? `✓ ${t('gmaStructuredAnalysis')}` : `✗ ${t('aiAnalysisTitle')}`, `✓ ${plan.credits} ${t('credits')}`, plan.id === 'yearly' ? `✓ ${t('prioritySupport')}` : ''].filter(Boolean).map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: '12px',
      color: f.startsWith('✓') ? '#94a3b8' : '#94a3b8'
    }
  }, f))), /*#__PURE__*/React.createElement("button", {
    className: `gma-pricing-button gma-pricing-button-${plan.id}`,
    onClick: () => handleSelect(plan),
    style: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      letterSpacing: '0.05em',
      background: plan.id === 'free' ? 'transparent' : `linear-gradient(135deg,${plan.color},${plan.color}bb)`,
      border: plan.id === 'free' ? '1px solid #334155' : 'none',
      color: plan.id === 'free' ? '#94a3b8' : '#000',
      transition: 'opacity 0.2s'
    },
    onMouseEnter: e => e.currentTarget.style.opacity = '0.85',
    onMouseLeave: e => e.currentTarget.style.opacity = '1'
  }, plan.id === 'free' ? t('startFreeCheckout') : (getPlanText(t, plan, 'label') + ' ' + t('plan') + ' →'))))), /*#__PURE__*/React.createElement("div", {
    className: 'gma-pricing-comparison',
    style: {
      maxWidth: '1040px',
      margin: '0 auto 8px',
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '10px',
      color: '#94a3b8',
      letterSpacing: '0.1em',
      textAlign: 'center',
      marginBottom: '16px'
    }
  }, t('detailedComparison')), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      fontSize: '12px',
      minWidth: '860px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: comparisonGrid,
      alignItems: 'center',
      columnGap: '0',
      borderBottom: '1px solid #1e293b',
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'left',
      padding: '10px 14px',
      color: '#94a3b8',
      fontWeight: 'bold',
      fontSize: '11px'
    }
  }, t('feature')), plans.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      textAlign: 'center',
      padding: '10px 6px',
      color: p.color,
      fontWeight: 'bold',
      fontSize: '10px'
    }
  }, getPlanText(t, p, 'label')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px'
    }
  }, featureRows.map(({
    label,
    vals
  }, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: comparisonGrid,
      alignItems: 'center',
      minHeight: '56px',
      background: i % 2 === 0 ? 'rgba(15,23,42,0.42)' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(148,163,184,0.06)',
      borderRadius: '8px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      color: '#94a3b8',
      fontSize: '12px'
    }
  }, label), vals.map((v, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '56px',
      padding: '9px 6px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: v === true ? '#34d399' : v === false ? '#334155' : '#fbbf24',
      borderLeft: '1px solid rgba(148,163,184,0.035)'
    }
  }, v === true ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      lineHeight: 1,
      borderRadius: '999px',
      background: 'rgba(52,211,153,0.1)',
      boxShadow: '0 0 0 1px rgba(52,211,153,0.18)'
    }
  }, '✓') : v === false ? '–' : v)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1040px',
      margin: '30px auto 80px',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '13px',
      lineHeight: 1.8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#cbd5e1',
      fontWeight: 'bold'
    }
  }, t('apiCostsManagedShort')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fbbf24'
    }
  }, "\u26A0 ", t('pricingLegalWarningShort'))), payModal && /*#__PURE__*/React.createElement(PaddlePaymentModal, {
    plan: payModal,
    user: user,
    onClose: () => setPayModal(null),
    onSuccess: handlePaySuccess
  })));
}
// ═══════════════════════════════════════════════════════════════
// ──  1. HOME  ──
// ═══════════════════════════════════════════════════════════════
function HomePage({
  onNavigate
}) {
  var _sa = React.useState(false); var showAdmin = _sa[0]; var setShowAdmin = _sa[1];
  var _sal = React.useState(false); var showAdminLogin = _sal[0]; var setShowAdminLogin = _sal[1];
  // Auto-detect admin URL trigger
  React.useEffect(function(){
    if (GMA_AdminSec.hasUrlParam()) {
      if (!GMA_AdminSec.isMasterUser()) {
        GMA_AdminSec.cleanUrl();
        return;
      }
      if (GMA_AdminSec.hasValidToken()) {
        setShowAdmin(true);
        GMA_AdminSec.cleanUrl();
      } else {
        setShowAdminLogin(true);
      }
    }
  }, []);
  const {
    t
  } = useLang();
  const stats = [{
    val: COMPANIES_FINAL.length + "+",
    label: t('organizationsLabel'),
    icon: "\uD83C\uDFE2"
  }, {
    val: "13",
    label: t('sectorsLabel'),
    icon: "\uD83D\uDCCA"
  }, {
    val: t('realTimeLabel'),
    label: t('liveDataLabel'),
    icon: "\u26A1"
  }, {
    val: "AI",
    label: t('intelligenceLayerLabel'),
    icon: "\uD83E\uDD16"
  }];
  const features = [{
    icon: "\uD83D\uDCC8",
    title: t('liveMarketsTitle'),
    desc: t('liveMarketsDesc')
  }, {
    icon: "\uD83E\uDD16",
    title: t('aiAnalysisTitle'),
    desc: t('aiAnalysisDesc')
  }, {
    icon: "\uD83D\uDCCA",
    title: t('feat3t'),
    desc: t('feat3d')
  }, {
    icon: "\u2696\uFE0F",
    title: t('comparisonTitle'),
    desc: t('comparisonDesc')
  }, {
    icon: "\uD83D\uDD14",
    title: t('feat5t'),
    desc: t('feat5d')
  }, {
    icon: "\uD83D\uDCBC",
    title: t('portfolioTrackingTitle'),
    desc: t('portfolioTrackingDesc')
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "gma-home-page",
    style: {
      minHeight: '100vh',
      background: '#060912',
      color: '#e2e8f0',
      fontFamily: "'Courier New',monospace",
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gma-hero-section",
    style: {
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 24px 70px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(214,180,111,0.07) 0%, transparent 60%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "gma-hero-eyebrow",
    style: {
      fontSize: '17px',
      color: '#d6b46f',
      letterSpacing: '0.12em',
      marginBottom: '18px'
    }
  }, "\u25C8 GLOBAL MARKET ANALYTICS \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
    className: "gma-hero-title",
    style: {
      fontSize: 'clamp(32px,5vw,56px)',
      fontWeight: 'bold',
      lineHeight: 1.15,
      marginBottom: '20px',
      background: 'linear-gradient(135deg,#fff7df,#d6b46f,#b87c63)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  }, t('heroTitle').split('\n').map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, l, i === 0 && /*#__PURE__*/React.createElement("br", null)))), /*#__PURE__*/React.createElement("p", {
    className: "gma-hero-subtitle",
    style: {
      fontSize: '18px',
      color: '#94a3b8',
      maxWidth: '560px',
      margin: '0 auto 36px',
      lineHeight: 1.8
    }
  }, t('heroSub')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('dashboard'),
    style: {
      background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
      border: 'none',
      color: '#fff',
      borderRadius: '12px',
      padding: '14px 32px',
      cursor: 'pointer',
      fontSize: '18px',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      letterSpacing: '0.08em'
    }
  }, "\u25C8 ", t('viewMarkets'), " \u2192"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('login'),
    style: {
      background: 'transparent',
      border: '1px solid rgba(56,189,248,0.4)',
      color: '#38bdf8',
      borderRadius: '12px',
      padding: '14px 32px',
      cursor: 'pointer',
      fontSize: '18px',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      letterSpacing: '0.08em'
    }
  }, "\uD83D\uDD10 ", t('loginRegister')))), /*#__PURE__*/React.createElement("div", {
    className: "gma-home-stats",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
      gap: '1px',
      background: '#0f172a',
      borderTop: '1px solid #0f172a',
      borderBottom: '1px solid #0f172a'
    }
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: '#050a15',
      padding: '24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '26px',
      marginBottom: '8px'
    }
  }, s.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#38bdf8',
      marginBottom: '4px'
    }
  }, s.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#64748b',
      letterSpacing: '0.08em'
    }
  }, s.label)))), /*#__PURE__*/React.createElement("div", {
    className: "gma-home-features-section",
    style: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '60px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#64748b',
      letterSpacing: '0.08em',
      marginBottom: '10px'
    }
  }, t('platformFeaturesLabel')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#f1f5f9'
    }
  }, t('featSub'))), /*#__PURE__*/React.createElement("div", {
    className: "gma-home-features-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
      gap: '16px'
    }
  }, features.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.title,
    className: "gma-home-feature-card",
    style: {
      background: 'linear-gradient(145deg,#0c1220,#080d18)',
      border: '1px solid #0f172a',
      borderRadius: '14px',
      padding: '24px',
      transition: 'border-color 0.2s'
    },
    onMouseEnter: e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)',
    onMouseLeave: e => e.currentTarget.style.borderColor = '#0f172a'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '26px',
      marginBottom: '12px'
    }
  }, f.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#f1f5f9',
      marginBottom: '6px'
    }
  }, f.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '17px',
      color: '#94a3b8',
      lineHeight: 1.6
    }
  }, f.desc))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,rgba(56,189,248,0.06),rgba(99,102,241,0.06))',
      borderTop: '1px solid #0f172a',
      borderBottom: '1px solid #0f172a',
      padding: '48px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#f1f5f9',
      marginBottom: '12px'
    }
  }, t('startFreeTitle')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '17px',
      color: '#94a3b8',
      marginBottom: '24px'
    }
  }, t('startFreeDesc')), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('dashboard'),
    style: {
      background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
      border: 'none',
      color: '#fff',
      borderRadius: '12px',
      padding: '14px 40px',
      cursor: 'pointer',
      fontSize: '18px',
      fontFamily: 'inherit',
      fontWeight: 'bold'
    }
  }, "\u25C8 ", t('goToMarkets'))),showAdminLogin&&/*#__PURE__*/React.createElement(AdminLoginModal,{onClose:function(){setShowAdminLogin(false);GMA_AdminSec.cleanUrl();},onSuccess:function(){setShowAdminLogin(false);setShowAdmin(true);GMA_AdminSec.cleanUrl();}}),showAdmin&&/*#__PURE__*/React.createElement(ApiKeyModal,{onClose:function(){setShowAdmin(false);GMA_AdminSec.revokeToken();}}));
}

// ═══════════════════════════════════════════════════════════════
// ──  SIGN-IN PAGE ──
// ═══════════════════════════════════════════════════════════════
function LoginPage({
  onNavigate,
  onLogin
}) {
  const {
    t
  } = useLang();
  const {
    useState: uS,
    useEffect: uE,
    useRef: uR
  } = React;
  const [mode, setMode] = uS('login');
  const [email, setEmail] = uS('');
  const [pass, setPass] = uS('');
  const [name, setName] = uS('');
  const [msg, setMsg] = uS('');
  const [loading, setLoading] = uS(false);
  const [showPass, setShowPass] = uS(false);
  const [gLoading, setGLoading] = uS(false);
  const [gReady, setGReady] = uS(false);
  const [gError, setGError] = uS('');
  const googleBtnRef = uR(null);

  // ── GSI script'i dinamik yukle ──
  uE(() => {
    // Once script yuklu mu kontrol et
    if (window.google?.accounts?.id) {
      initGSI();
      return;
    }
    if (document.getElementById('gsi-script')) {
      document.getElementById('gsi-script').addEventListener('load', initGSI);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGSI;
    document.head.appendChild(script);
  }, []);
  function initGSI() {
    const clientId = localStorage.getItem('gma_google_client_id');
    if (!clientId || !window.google?.accounts?.id) {
      setGReady(!clientId); // no clientId = show setup screen
      return;
    }
    setGReady(true);
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
      hosted_domain: undefined,
      login_uri: 'https://globalmarketanalytics.com'
    });
    // Resmi Google butonunu ciz
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 360,
        logo_alignment: 'left'
      });
    }
  }

  // ── JWT decode & users kaydi ──
  const handleGoogleCredential = response => {
    try {
      setGLoading(true);
      const base64 = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
      const gUser = {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || '',
        provider: 'google',
        joined: new Date().toISOString()
      };
      // Kullaniciyi kayit listesine ekle/guncelle
      const users = JSON.parse(localStorage.getItem('gma_users') || '[]');
      const idx = users.findIndex(u => u.email === gUser.email);
      if (idx >= 0) users[idx] = {
        ...users[idx],
        ...gUser
      };else users.push(gUser);
      localStorage.setItem('gma_users', JSON.stringify(users));
      localStorage.setItem('gma_current_user', JSON.stringify(gUser));
      _gmaInitCredits(gUser.email);
      setGLoading(false);
      onLogin(gUser);
    } catch (e) {
      setGLoading(false);
      setGError('Google authentication error: ' + e.message);
    }
  };
  const handleGoogleClick = () => {
    setGError('');
    const clientId = localStorage.getItem('gma_google_client_id');
    if (!clientId) {
      setGError('no_client_id');
      return;
    }
    if (!window.google?.accounts?.id) {
      setGError('Google service failed to load. Please refresh the page.');
      return;
    }
    window.google.accounts.id.prompt(n => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        setGError('Google popup blocked. Check cookies or sign in with email.');
      }
    });
  };
  const handleSubmit = () => {
    if (!email.trim()) {
      setMsg('Email field cannot be empty.');
      return;
    }
    if (!pass.trim()) {
      setMsg('Password field cannot be empty.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('gma_users') || '[]');
      if (mode === 'register') {
        if (users.find(u => u.email === email)) {
          setMsg('This email is already registered.');
          setLoading(false);
          return;
        }
        const newUser = {
          email,
          pass,
          name: name || email.split('@')[0],
          joined: new Date().toISOString()
        };
        _gmaInitCredits(email);
        users.push(newUser);
        localStorage.setItem('gma_users', JSON.stringify(users));
        localStorage.setItem('gma_current_user', JSON.stringify(newUser));
        onLogin(newUser);
      } else {
        const user = users.find(u => u.email === email && u.pass === pass);
        if (!user) {
          setMsg('Email or password is incorrect.');
          setLoading(false);
          return;
        }
        localStorage.setItem('gma_current_user', JSON.stringify(user));
        onLogin(user);
      }
    }, 500);
  };
  const clientId = localStorage.getItem('gma_google_client_id');
  const noClient = !clientId;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: '#060912',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '420px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#38bdf8',
      letterSpacing: '0.06em',
      marginBottom: '4px'
    }
  }, "\u25C8 GMA · Architecting Rationality in Global Chaos"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '15px',
      color: '#64748b'
    }
  }, mode === 'login' ? t('loginTitle') : t('registerTitle'))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(145deg,#09101f,#060912)',
      border: '1px solid #0f172a',
      borderRadius: '18px',
      padding: '28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '10px',
      marginBottom: '22px',
      padding: '3px'
    }
  }, ['login', 'register'].map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => {
      setMode(m);
      setMsg('');
      setGError('');
    },
    style: {
      flex: 1,
      padding: '9px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      letterSpacing: '0.06em',
      background: mode === m ? 'rgba(56,189,248,0.15)' : 'transparent',
      color: mode === m ? '#38bdf8' : '#475569',
      transition: 'all 0.2s'
    }
  }, m === 'login' ? t('login') : t('register')))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: googleBtnRef,
    style: {
      display: 'flex',
      justifyContent: 'center',
      minHeight: noClient ? '0' : '44px',
      marginBottom: noClient ? '0' : '6px'
    }
  }), noClient && /*#__PURE__*/React.createElement("button", {
    onClick: handleGoogleClick,
    style: {
      width: '100%',
      padding: '13px 14px',
      background: '#fff',
      border: 'none',
      borderRadius: '11px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      transition: 'box-shadow 0.2s'
    },
    onMouseEnter: e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)',
    onMouseLeave: e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#3c4043',
      fontFamily: 'Google Sans,Roboto,sans-serif'
    }
  }, gLoading ? 'Connecting...' : t('googleContinue'))), !noClient && !gReady && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '44px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#64748b'
    }
  }, "\u27F3 Google is loading...")), gError && gError !== 'no_client_id' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px',
      padding: '9px 12px',
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.25)',
      borderRadius: '8px',
      fontSize: '11px',
      color: '#f87171'
    }
  }, gError), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: '1px',
      background: '#0f172a'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#64748b'
    }
  }, t('or')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: '1px',
      background: '#0f172a'
    }
  })), mode === 'register' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '5px',
      letterSpacing: '0.06em'
    }
  }, t('fullname')), /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Your name",
    style: {
      width: '100%',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '10px 12px',
      color: '#e2e8f0',
      fontSize: '14px',
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '5px',
      letterSpacing: '0.06em'
    }
  }, t('email')), /*#__PURE__*/React.createElement("input", {
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "ornek@email.com",
    type: "email",
    style: {
      width: '100%',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '10px 12px',
      color: '#e2e8f0',
      fontSize: '14px',
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box'
    },
    onKeyDown: e => e.key === 'Enter' && handleSubmit()
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '5px',
      letterSpacing: '0.06em'
    }
  }, t('password')), /*#__PURE__*/React.createElement("iniv", {
    style: {
      position: 'relative', display: 'flex', alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: pass,
    onChange: e => setPass(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    type: showPass ? "text" : "password",
    style: {
      width: '100%',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      padding: '10px 44px 10px 12px',
      color: '#e2e8f0',
      fontSize: '14px',
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box'
    },
    onKeyDown: e => e.key === 'Enter' && handleSubmit()
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowPass(function(s){ return !s; }),
    style: {
      position: 'absolute',
      right: '10px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      fontSize: '12px',
      padding: '0',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      letterSpacing: '0.04em',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      transition: 'color 0.2s'
    },
    onMouseEnter: e => e.currentTarget.style.color = '#38bdf8',
    onMouseLeave: e => e.currentTarget.style.color = '#64748b'
  }, showPass ? 'Hide' : 'Show'))), msg && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '12px',
      padding: '10px 12px',
      background: 'rgba(248,113,113,0.1)',
      border: '1px solid rgba(248,113,113,0.3)',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#f87171'
    }
  }, msg), /*#__PURE__*/React.createElement("button", {
    onClick: handleSubmit,
    disabled: loading,
    style: {
      width: '100%',
      padding: '13px',
      background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
      border: 'none',
      borderRadius: '10px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      letterSpacing: '0.08em',
      opacity: loading ? 0.7 : 1
    }
  }, loading ? '⟳ ' + t('processing') : mode === 'login' ? t('login') : t('register'))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: '14px',
      fontSize: '12px',
      color: '#94a3b8',
      lineHeight: 1.7
    }
  }, t('signInLegalPrefix'), ' ', /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('privacy'),
    style: {
      background: 'none',
      border: 'none',
      color: '#38bdf8',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'inherit',
      textDecoration: 'underline'
    }
  }, t('privacyPolicyTitle')), " ", t('signInLegalSuffix')), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate('home'),
    style: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '11px',
      fontFamily: 'inherit',
      letterSpacing: '0.05em'
    },
    onMouseEnter: e => e.currentTarget.style.color = '#64748b',
    onMouseLeave: e => e.currentTarget.style.color = '#64748b'
  }, "\u2190 ANA SAYFAYA DON")))));
}

// ═══════════════════════════════════════════════════════════════
// ──  USER PANEL ──
// ═══════════════════════════════════════════════════════════════
function UserPanelPage({
  user,
  onNavigate,
  onLogout
}) {
  var t = useLang().t;
  var [editProf, setEditProf] = React.useState(false);
  var [editDNAField, setEditDNAField] = React.useState(null);
  var [profSaved, setProfSaved] = React.useState(false);
  var [photo, setPhoto] = React.useState(function(){ return localStorage.getItem('gma_profile_photo') || null; });
  var fileRef = React.useRef(null);

  var email = user?.email || '';
  _gmaInitCredits(email);
  // Account panel: daima tam yetki (3/3)
  var creditTotal = 3;
  var credits = creditTotal;
  var creditUsed = 0;
  var creditsColor = credits === null ? '#34d399' : credits >= 2 ? '#34d399' : credits >= 1 ? '#fbbf24' : '#f87171';
  var creditsNote = t('creditsNote');

  var planData = (function(){ try { return JSON.parse(localStorage.getItem('gma_plan_' + email) || 'null'); } catch { return null; } })();
  var planLabel = planData ? ((GMA_PLANS[planData.planId] || {}).label || planData.planId) : t('noPlanSelected');

  var [prof, setProf] = React.useState(function(){
    try {
      var u = JSON.parse(localStorage.getItem('gma_current_user') || '{}');
      return { name:u.name||'', email:u.email||'', phone:u.phone||'', city:u.city||'', bio:u.bio||'' };
    } catch { return { name:'',email:'',phone:'',city:'',bio:'' }; }
  });

  var handlePhoto = function(e) {
    var file = e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){ setPhoto(ev.target.result); localStorage.setItem('gma_profile_photo', ev.target.result); };
    reader.readAsDataURL(file);
  };
  var handleSaveProf = function() {
    try {
      var u = JSON.parse(localStorage.getItem('gma_current_user') || '{}');
      localStorage.setItem('gma_current_user', JSON.stringify(Object.assign({}, u, prof)));
      setProfSaved(true); setEditProf(false);
      setTimeout(function(){ setProfSaved(false); }, 2000);
    } catch(e) {}
  };
  var handleLogout = function(){ localStorage.removeItem('gma_current_user'); onLogout(); };

  var displayName = prof.name || user?.name || t('userFallback');
  var joinedLabel = user?.joined ? new Date(user.joined).toLocaleDateString('tr-TR') : '2026';
  var planTone = planData ? '#d6c38a' : '#8fa3b8';
  var inp = { width:'100%', background:'rgba(3,7,18,0.62)', border:'1px solid rgba(200,208,216,0.14)',
    borderRadius:'10px', padding:'11px 13px', color:'#eef2f6', fontSize:'14px',
    fontFamily:"Inter,system-ui,sans-serif", outline:'none', boxSizing:'border-box', marginBottom:'8px' };
  var card = { background:'linear-gradient(180deg,rgba(18,25,36,0.96),rgba(8,12,20,0.98))', border:'1px solid rgba(200,208,216,0.12)',
    borderRadius:'12px', padding:'22px', marginBottom:'16px', boxShadow:'0 20px 60px rgba(0,0,0,0.26)' };
  var lbl = { fontSize:'11px', color:'#8fa3b8', letterSpacing:'0.12em', display:'block', marginBottom:'6px', textTransform:'uppercase' };
  var pill = {display:'inline-flex',alignItems:'center',gap:'6px',padding:'6px 10px',borderRadius:'999px',fontSize:'11px',letterSpacing:'0.08em',border:'1px solid rgba(214,195,138,0.22)',color:'#d6c38a',background:'rgba(214,195,138,0.07)'};
  var statCard = {background:'rgba(255,255,255,0.035)',border:'1px solid rgba(200,208,216,0.10)',borderRadius:'11px',padding:'14px 16px'};
  var primaryBtn = {padding:'11px 16px',background:'linear-gradient(135deg,#c8d0d8,#8fa3b8)',border:'none',borderRadius:'9px',color:'#060912',cursor:'pointer',fontSize:'13px',fontFamily:'Inter,system-ui,sans-serif',fontWeight:700,letterSpacing:'0.04em'};
  var ghostBtn = {padding:'10px 15px',background:'rgba(255,255,255,0.035)',border:'1px solid rgba(200,208,216,0.14)',borderRadius:'9px',color:'#c8d0d8',cursor:'pointer',fontSize:'13px',fontFamily:'Inter,system-ui,sans-serif',fontWeight:650};

  return React.createElement(React.Fragment, null,
    editDNAField && React.createElement(OnboardingOverlay, {
      user: user,
      editOnlyId: editDNAField,
      initialAnswers: (function(){ try { return JSON.parse(localStorage.getItem('gma_user_dna_'+user.email))||{}; } catch { return {}; } })(),
      onSingleEditDone: function(newAns){ setEditDNAField(null); }
    }),
    React.createElement("div",
    {style:{minHeight:'100vh',background:'radial-gradient(circle at 18% 0%,rgba(214,195,138,0.10),transparent 28%),linear-gradient(160deg,#02040a,#070b13 48%,#0b1020)',color:'#eef2f6',fontFamily:"Inter,system-ui,sans-serif",padding:'38px 20px 56px'}},
    React.createElement("div",{style:{maxWidth:'1120px',margin:'0 auto'}},

      React.createElement("div",{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'18px',flexWrap:'wrap',marginBottom:'18px'}},
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:'12px',color:'#d6c38a',letterSpacing:'0.18em',marginBottom:'8px',fontWeight:700}},"\u25c8 GLOBAL MARKET ANALYTICS"),
          React.createElement("h1",{style:{fontSize:'clamp(28px,4vw,46px)',fontWeight:650,color:'#eef2f6',margin:'0 0 8px',lineHeight:1.08,letterSpacing:'0.01em'}},t('accountMgmt')),
          React.createElement("div",{style:{fontSize:'14px',color:'#8fa3b8',lineHeight:1.6}},t('intelligenceLayerActive'), " · ", t('consensusSystem'))
        ),
        React.createElement("div",{style:pill}, planData ? planLabel + " " + t('member') : t('freeMember'))
      ),

      React.createElement("div",{style:Object.assign({},card,{padding:'0',overflow:'hidden',border:'1px solid rgba(214,195,138,0.18)',marginBottom:'18px'})},
        React.createElement("div",{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'0'}},
          React.createElement("div",{style:{padding:'26px',display:'flex',gap:'18px',alignItems:'center',borderRight:'1px solid rgba(200,208,216,0.10)'}},
            React.createElement("div",{
              onClick:function(){fileRef.current&&fileRef.current.click();},
              style:{width:'92px',height:'92px',borderRadius:'18px',cursor:'pointer',overflow:'hidden',
                border:'1px solid rgba(214,195,138,0.34)',flexShrink:0,position:'relative',
                background:photo?'transparent':'linear-gradient(135deg,#1c2431,#3b4658)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:'34px',fontWeight:700,color:'#eef2f6',boxShadow:'0 16px 36px rgba(0,0,0,0.34)'}},
              photo?React.createElement("img",{src:photo,alt:"profile",style:{width:'100%',height:'100%',objectFit:'cover'}})
                   :(displayName?.[0]?.toUpperCase()||'U'),
              React.createElement("div",{style:{position:'absolute',bottom:0,left:0,right:0,background:'rgba(2,4,10,0.72)',padding:'4px 6px',fontSize:'10px',textAlign:'center',color:'#c8d0d8',letterSpacing:'0.06em'}},t('edit'))
            ),
            React.createElement("div",{style:{minWidth:0}},
              React.createElement("div",{style:{fontSize:'24px',fontWeight:650,color:'#eef2f6',lineHeight:1.15,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},displayName),
              React.createElement("div",{style:{fontSize:'14px',color:'#8fa3b8',marginTop:'6px',wordBreak:'break-all'}},prof.email||user?.email||''),
              React.createElement("div",{style:{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'12px'}},
                React.createElement("span",{style:Object.assign({},pill,{color:'#aeb8c4',border:'1px solid rgba(200,208,216,0.16)',background:'rgba(255,255,255,0.035)'})},user?.provider==='google'?'Google':'Email'),
                React.createElement("span",{style:Object.assign({},pill,{color:'#aeb8c4',border:'1px solid rgba(200,208,216,0.16)',background:'rgba(255,255,255,0.035)'})},joinedLabel),
                prof.city&&React.createElement("span",{style:Object.assign({},pill,{color:'#aeb8c4',border:'1px solid rgba(200,208,216,0.16)',background:'rgba(255,255,255,0.035)'})},prof.city)
              )
            )
          ),
          React.createElement("div",{style:{padding:'22px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(96px,1fr))',gap:'10px',alignContent:'center'}},
            React.createElement("div",{style:statCard},React.createElement("div",{style:{fontSize:'10px',color:'#8fa3b8',letterSpacing:'0.12em',marginBottom:'7px'}},t('myPlan')),React.createElement("div",{style:{fontSize:'14px',color:planTone,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},planLabel)),
            React.createElement("div",{style:statCard},React.createElement("div",{style:{fontSize:'10px',color:'#8fa3b8',letterSpacing:'0.12em',marginBottom:'7px'}},t('credits')),React.createElement("div",{style:{fontSize:'20px',color:creditsColor,fontWeight:700}},credits,"/",creditTotal)),
            React.createElement("div",{style:statCard},React.createElement("div",{style:{fontSize:'10px',color:'#8fa3b8',letterSpacing:'0.12em',marginBottom:'7px'}},t('accuracyIndex')),React.createElement("div",{style:{fontSize:'20px',color:'#d6c38a',fontWeight:700}},'84%')),
            React.createElement("button",{onClick:function(){onNavigate('dashboard');},style:Object.assign({},primaryBtn,{gridColumn:'span 2'})},t('backToMarkets')),
            React.createElement("button",{onClick:function(){onNavigate('pricing');},style:ghostBtn},t('upgrade'))
          )
        )
      ),

      /* Profile Card */
      React.createElement("div",{style:card},
        React.createElement("div",{style:{display:'flex',alignItems:'center',gap:'18px',marginBottom:'18px'}},
          React.createElement("div",{
            onClick:function(){fileRef.current&&fileRef.current.click();},
            style:{width:'76px',height:'76px',borderRadius:'14px',cursor:'pointer',overflow:'hidden',
              border:'1px solid rgba(214,195,138,0.30)',flexShrink:0,position:'relative',
              background:photo?'transparent':'linear-gradient(135deg,#1c2431,#3b4658)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:'#fff'}},
            photo?React.createElement("img",{src:photo,alt:"profile",style:{width:'100%',height:'100%',objectFit:'cover'}})
                 :(prof.name?.[0]?.toUpperCase()||user?.name?.[0]?.toUpperCase()||'U'),
            React.createElement("div",{style:{position:'absolute',bottom:0,right:0,background:'rgba(0,0,0,0.7)',padding:'2px 5px',fontSize:'11px'}},"\ud83d\udcf7")
          ),
          React.createElement("input",{ref:fileRef,type:"file",accept:"image/*",onChange:handlePhoto,style:{display:'none'}}),
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{fontSize:'19px',fontWeight:'bold',color:'#f1f5f9'}},prof.name||user?.name||t('userFallback')),
            React.createElement("div",{style:{fontSize:'14px',color:'#64748b',marginTop:'3px'}},prof.email||user?.email||''),
            prof.city&&React.createElement("div",{style:{fontSize:'13px',color:'#94a3b8',marginTop:'4px'}},"\ud83d\udccd ",prof.city),
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',marginTop:'5px'}},
              user?.provider==='google'?'\ud83d\udd11 Google':'\ud83d\udce7 Email',
              " \xb7 ",user?.joined?new Date(user.joined).toLocaleDateString('tr-TR'):''
            ),
            React.createElement("button",{
              onClick:function(){setEditProf(function(p){return !p;});},
              style:{marginTop:'8px',padding:'7px 14px',
                background:editProf?'rgba(248,113,113,0.10)':'rgba(214,195,138,0.08)',
                border:'1px solid '+(editProf?'rgba(248,113,113,0.26)':'rgba(214,195,138,0.24)'),
                borderRadius:'9px',color:editProf?'#fca5a5':'#d6c38a',
                cursor:'pointer',fontSize:'13px',fontFamily:'inherit',fontWeight:700,letterSpacing:'0.04em'}},
              editProf?'\u2715 ' + t('cancel'):'\u270f ' + t('edit'))
          )
        ),
        !editProf&&prof.bio&&React.createElement("div",{style:{fontSize:'14px',color:'#94a3b8',lineHeight:1.7,padding:'10px',background:'rgba(255,255,255,0.03)',borderRadius:'8px',marginBottom:'12px'}},prof.bio),
        editProf&&React.createElement("div",null,
          React.createElement("div",{style:{fontSize:'12px',color:'#d6c38a',letterSpacing:'0.12em',marginBottom:'14px',borderBottom:'1px solid rgba(200,208,216,0.10)',paddingBottom:'10px',fontWeight:700}},t('personalInfo')),
          React.createElement("div",{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'10px',marginBottom:'8px'}},
            React.createElement("div",null,React.createElement("span",{style:lbl},t('fullname')),React.createElement("input",{value:prof.name,onChange:function(e){setProf(function(p){return Object.assign({},p,{name:e.target.value});});},placeholder:t('namePlaceholder'),style:inp})),
            React.createElement("div",null,React.createElement("span",{style:lbl},t('city')),React.createElement("input",{value:prof.city,onChange:function(e){setProf(function(p){return Object.assign({},p,{city:e.target.value});});},placeholder:"Tashkent",style:inp})),
            React.createElement("div",null,React.createElement("span",{style:lbl},t('email')),React.createElement("input",{value:prof.email,onChange:function(e){setProf(function(p){return Object.assign({},p,{email:e.target.value});});},type:"email",style:inp})),
            React.createElement("div",null,React.createElement("span",{style:lbl},t('phone')),React.createElement("input",{value:prof.phone,onChange:function(e){setProf(function(p){return Object.assign({},p,{phone:e.target.value});});},placeholder:"+998 90 000 00 00",style:inp}))
          ),
          React.createElement("div",{style:{display:'flex',gap:'10px'}},
            React.createElement("button",{onClick:handleSaveProf,style:Object.assign({},primaryBtn,{flex:2})},t('saveProfile')),
            React.createElement("button",{onClick:function(){setEditProf(false);},style:{flex:1,padding:'10px',background:'transparent',border:'1px solid #1e293b',borderRadius:'9px',color:'#64748b',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}},t('cancel'))
          ),
          profSaved&&React.createElement("div",{style:{marginTop:'8px',fontSize:'14px',color:'#34d399'}},"✔ ", t('profileSaved'))
        )
      ),

      /* GMA DNA Card */
      React.createElement(GMA_DNA_Card, {user:user, onEditField:function(k){ setEditDNAField(k); }}),

      /* GMA Core Card */
      React.createElement("div",{style:Object.assign({},card,{border:"1px solid rgba(214,195,138,0.16)",textAlign:"center",padding:"28px 20px"})},
        React.createElement("div",{style:{fontSize:"11px",color:"#64748b",letterSpacing:"0.15em",marginBottom:"8px"}},"\u25c8 ", t('gmaCore')),
        React.createElement("div",{style:{fontSize:"22px",fontWeight:"300",color:"#e2e8f0",marginBottom:"6px",letterSpacing:"0.02em"}},t('intelligenceLayerActive')),
        React.createElement("div",{style:{fontSize:"11px",color:"#d6c38a",letterSpacing:"0.08em"}},t('consensusSystem'))
      ),
      /* Kredi & Plan Card */
      React.createElement("div",{style:Object.assign({},card,{border:'1px solid rgba(214,195,138,0.16)'})},
        React.createElement("div",{style:{fontSize:'12px',color:'#d6c38a',letterSpacing:'0.12em',marginBottom:'14px',fontWeight:700}},t('analysisCredits')),
        React.createElement("div",{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',letterSpacing:'0.05em',marginBottom:'4px'}},t('strategicAnalysis')),
            React.createElement("div",{style:{fontSize:'28px',fontWeight:'300',color:creditsColor,letterSpacing:'0.02em'}}, credits + ' / ' + creditTotal),
            React.createElement("div",{style:{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}, credits === 0 ? t('accessExhausted') : t('creditsRemaining'))
          ),
          React.createElement("button",{
            onClick:function(){onNavigate('pricing');},
            style:Object.assign({},ghostBtn,{color:'#d6c38a',border:'1px solid rgba(214,195,138,0.22)',background:'rgba(214,195,138,0.07)'})},
            t('upgrade'))
        ),
        React.createElement("div",{style:{
          background:'linear-gradient(135deg,rgba(214,195,138,0.07),rgba(143,163,184,0.04))',
          border:'1px solid rgba(214,195,138,0.15)',
          borderRadius:'10px',padding:'12px 14px',marginBottom:'10px',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'
        }},
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:'11px',color:'#64748b',letterSpacing:'0.08em',marginBottom:'2px'}},'\u25c8 ', t('accuracyIndex')),
            React.createElement('div',{style:{fontSize:'20px',fontWeight:'300',color:'#fbbf24',letterSpacing:'0.02em'}},'84%')
          ),
          React.createElement('div',{style:{fontSize:'10px',color:'#94a3b8',textAlign:'right',lineHeight:1.4}},
            React.createElement('div',null,t('verifiedBy')),
            React.createElement('div',{style:{color:'#d6c38a'}},t('yearsOfData'))
          )
        ),
        React.createElement("div",{style:{background:'rgba(255,255,255,0.02)',borderRadius:'8px',padding:'10px 12px',fontSize:'12px',color:'#64748b',lineHeight:1.6}},
          credits<=0
            ?"\ud83d\udd12 " + t('creditsExhaustedNote')
            : creditsNote
        )
      ),

      /* Hesap Islemleri */
      React.createElement("div",{style:card},
        React.createElement("div",{style:{fontSize:'14px',color:'#64748b',letterSpacing:'0.06em',marginBottom:'12px'}},"\u2699\ufe0f ", t('accountActions')),
        React.createElement("div",{style:{display:'flex',gap:'10px',flexWrap:'wrap'}},
          React.createElement("button",{onClick:function(){onNavigate('dashboard');},
            style:ghostBtn},
            t('backToMarkets')),
          React.createElement("button",{onClick:handleLogout,
            style:{padding:'9px 16px',background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',
              borderRadius:'9px',color:'#f87171',cursor:'pointer',fontSize:'15px',fontFamily:'inherit',fontWeight:'bold'}},
            t('logout'))
        )
      )
    )
  ));
}


// ═══════════════════════════════════════════════════════════════
// ──  4. ABOUT  ──
// ═══════════════════════════════════════════════════════════════
function AboutPage({onNavigate}) {
  var _l = useLang(); var t = _l.t;
  var cards = [
    {title: t('aboutCardPlatformT'), text: t('aboutCardPlatformB')},
    {title: t('aboutCardAIT'),       text: t('aboutCardAIB')},
    {title: t('aboutCardDataT'),     text: t('aboutCardDataB')},
    {title: t('aboutCardSourcesT'),  text: t('aboutCardSourcesB')},
    {title: t('aboutCardPrivacyT'),  text: t('aboutCardPrivacyB')}
  ];
  return React.createElement("div",{style:{minHeight:'100vh',background:'#02040a',color:'#eef2f6',fontFamily:"Inter,system-ui,sans-serif",padding:'40px 24px'}},
    React.createElement("div",{style:{maxWidth:'720px',margin:'0 auto'}},
      React.createElement("h1",{style:{fontSize:'30px',fontWeight:650,color:'#eef2f6',marginBottom:'24px',lineHeight:1.3}},t('aboutTitle')),
      React.createElement("div",{style:{display:'grid',gap:'20px'}},
        cards.map(function(c,i){return React.createElement("div",{key:i,style:{background:'linear-gradient(180deg,rgba(17,23,34,0.94),rgba(7,11,18,0.96))',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'10px',padding:'20px'}},
          React.createElement("div",{style:{fontSize:'16px',color:'#c8d0d8',fontWeight:650,letterSpacing:'0.02em',marginBottom:'8px'}},c.title),
          React.createElement("div",{style:{fontSize:'16px',color:'#a2acba',lineHeight:1.7}},c.text)
        );})
      ),
      React.createElement("div",{style:{marginTop:'28px'}},
        React.createElement("button",{onClick:function(){onNavigate('home');},style:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.16)',borderRadius:'8px',color:'#a2acba',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}},"\u2190 "+t('home'))
      )
    )
  );
}



// ======================================================================
// -- LEGAL PAGE TRANSLATION HOOK --
// ======================================================================
const GMA_LEGAL_SECTION_TITLES = {
  ar: {
    privacy: ["1. المعلومات التي نجمعها", "2. الأساس القانوني للمعالجة (GDPR)", "3. معالجة الدفع عبر Paddle", "4. ملفات تعريف الارتباط والتتبع", "5. مزودو البيانات الخارجيون", "6. حقوقك (GDPR)", "7. الاحتفاظ بالبيانات", "8. أمن البيانات", "9. خصوصية الأطفال", "10. تغييرات هذه السياسة", "11. جهة الاتصال ومراقب البيانات"],
    terms: ["1. قبول الشروط", "2. وصف الخدمة", "3. ليست نصيحة مالية", "4. حسابات المستخدمين", "5. الاشتراكات والفوترة عبر Paddle", "6. الإلغاء", "7. الاستخدام المقبول", "8. الملكية الفكرية", "9. تحديد المسؤولية", "10. إخلاء مسؤولية الضمانات", "11. القانون الحاكم والتغييرات", "12. الاتصال"],
    refund: ["1. ضمان استرداد خلال 7 أيام", "2. كيفية طلب الاسترداد", "3. إلغاء الاشتراك بنقرة واحدة", "4. رسوم التجديد", "5. الاستثناءات", "6. معالج الدفع (Paddle)", "7. الاتصال"]
  },
  zh: {
    privacy: ["1. 我们收集的信息", "2. 处理的法律依据 (GDPR)", "3. 通过 Paddle 处理付款", "4. Cookie 与跟踪", "5. 第三方数据提供商", "6. 您的权利 (GDPR)", "7. 数据保留", "8. 数据安全", "9. 儿童隐私", "10. 本政策的变更", "11. 联系方式与数据控制者"],
    terms: ["1. 接受条款", "2. 服务说明", "3. 非财务建议", "4. 用户账户", "5. 通过 Paddle 订阅与计费", "6. 取消", "7. 可接受使用", "8. 知识产权", "9. 责任限制", "10. 保证免责声明", "11. 适用法律与变更", "12. 联系"],
    refund: ["1. 7 天退款保证", "2. 如何申请退款", "3. 一键取消订阅", "4. 续费费用", "5. 例外情况", "6. 支付处理方 (Paddle)", "7. 联系"]
  },
  hi: {
    privacy: ["1. हम कौन सी जानकारी एकत्र करते हैं", "2. प्रसंस्करण का कानूनी आधार (GDPR)", "3. Paddle द्वारा भुगतान प्रसंस्करण", "4. कुकी और ट्रैकिंग", "5. तृतीय-पक्ष डेटा प्रदाता", "6. आपके अधिकार (GDPR)", "7. डेटा प्रतिधारण", "8. डेटा सुरक्षा", "9. बच्चों की गोपनीयता", "10. इस नीति में बदलाव", "11. संपर्क और डेटा नियंत्रक"],
    terms: ["1. शर्तों की स्वीकृति", "2. सेवा का विवरण", "3. वित्तीय सलाह नहीं", "4. उपयोगकर्ता खाते", "5. Paddle द्वारा सदस्यता और बिलिंग", "6. रद्दीकरण", "7. स्वीकार्य उपयोग", "8. बौद्धिक संपदा", "9. दायित्व की सीमा", "10. वारंटी अस्वीकरण", "11. लागू कानून और बदलाव", "12. संपर्क"],
    refund: ["1. 7-दिन मनी-बैक गारंटी", "2. रिफंड कैसे माँगें", "3. एक-क्लिक सदस्यता रद्दीकरण", "4. नवीनीकरण शुल्क", "5. अपवाद", "6. भुगतान प्रोसेसर (Paddle)", "7. संपर्क"]
  },
  ru: {
    privacy: ["1. Какую информацию мы собираем", "2. Правовое основание обработки (GDPR)", "3. Обработка платежей через Paddle", "4. Cookie и отслеживание", "5. Сторонние поставщики данных", "6. Ваши права (GDPR)", "7. Хранение данных", "8. Безопасность данных", "9. Конфиденциальность детей", "10. Изменения этой политики", "11. Контакт и контролёр данных"],
    terms: ["1. Принятие условий", "2. Описание сервиса", "3. Не финансовая рекомендация", "4. Аккаунты пользователей", "5. Подписки и биллинг через Paddle", "6. Отмена", "7. Допустимое использование", "8. Интеллектуальная собственность", "9. Ограничение ответственности", "10. Отказ от гарантий", "11. Применимое право и изменения", "12. Контакт"],
    refund: ["1. 7-дневная гарантия возврата", "2. Как запросить возврат", "3. Отмена подписки в один клик", "4. Платежи за продление", "5. Исключения", "6. Платёжный процессор (Paddle)", "7. Контакт"]
  },
  de: {
    privacy: ["1. Welche Informationen wir sammeln", "2. Rechtsgrundlage der Verarbeitung (GDPR)", "3. Zahlungsabwicklung uber Paddle", "4. Cookies und Tracking", "5. Drittanbieter fur Daten", "6. Ihre Rechte (GDPR)", "7. Datenspeicherung", "8. Datensicherheit", "9. Datenschutz von Kindern", "10. Anderungen dieser Richtlinie", "11. Kontakt und Datenverantwortlicher"],
    terms: ["1. Annahme der Bedingungen", "2. Beschreibung des Dienstes", "3. Keine Finanzberatung", "4. Benutzerkonten", "5. Abos und Abrechnung uber Paddle", "6. Kundigung", "7. Zulassige Nutzung", "8. Geistiges Eigentum", "9. Haftungsbeschrankung", "10. Gewahrleistungsausschluss", "11. Geltendes Recht und Anderungen", "12. Kontakt"],
    refund: ["1. 7-Tage-Geld-zuruck-Garantie", "2. So beantragen Sie eine Erstattung", "3. Abo-Kundigung mit einem Klick", "4. Verlangerungsgebuhren", "5. Ausnahmen", "6. Zahlungsabwickler (Paddle)", "7. Kontakt"]
  },
  es: {
    privacy: ["1. Informacion que recopilamos", "2. Base legal del tratamiento (GDPR)", "3. Procesamiento de pagos via Paddle", "4. Cookies y seguimiento", "5. Proveedores de datos externos", "6. Tus derechos (GDPR)", "7. Retencion de datos", "8. Seguridad de datos", "9. Privacidad infantil", "10. Cambios a esta politica", "11. Contacto y responsable de datos"],
    terms: ["1. Aceptacion de terminos", "2. Descripcion del servicio", "3. No es asesoramiento financiero", "4. Cuentas de usuario", "5. Suscripciones y facturacion via Paddle", "6. Cancelacion", "7. Uso aceptable", "8. Propiedad intelectual", "9. Limitacion de responsabilidad", "10. Renuncia de garantias", "11. Ley aplicable y cambios", "12. Contacto"],
    refund: ["1. Garantia de reembolso de 7 dias", "2. Como solicitar un reembolso", "3. Cancelacion de suscripcion en un clic", "4. Cargos de renovacion", "5. Excepciones", "6. Procesador de pago (Paddle)", "7. Contacto"]
  }
};

function useLegalTranslate(sections, pageKey) {
  var langCtx = useLang();
  var lang = langCtx.lang;
  var _t = React.useState(sections); var translated = _t[0]; var setTranslated = _t[1];
  var _l = React.useState(false); var loading = _l[0]; var setLoading = _l[1];
  React.useEffect(function() {
    function withStaticTitles(items) {
      var titles = GMA_LEGAL_SECTION_TITLES[lang] && GMA_LEGAL_SECTION_TITLES[lang][pageKey];
      if (!titles) return items;
      return items.map(function(item, i) { return Object.assign({}, item, { t: titles[i] || item.t }); });
    }
    var staticSections = GMA_LEGAL_STATIC[lang] && GMA_LEGAL_STATIC[lang][pageKey];
    if (staticSections) { setTranslated(staticSections); return; }
    if (lang === 'en') { setTranslated(sections); return; }
    var cacheKey = 'gma_legal_' + pageKey + '_' + lang;
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === sections.length) { setTranslated(withStaticTitles(parsed)); return; }
      }
    } catch(e) {}
    var platformKey = GMA_PLATFORM_KEY();
    if (!platformKey) { setTranslated(withStaticTitles(sections)); return; }
    var langInfo = LANGS.find(function(l){return l.c===lang;});
    var langName = langInfo ? langInfo.n : lang;
    setLoading(true);
    var prompt = 'Translate the following JSON array from English to ' + langName + '. Each item has "t" (section title) and "b" (body text). Preserve \\n\\n newlines and \\u2022 bullet chars. Do NOT translate: GMA, Paddle, GDPR, PCI-DSS, URLs, email addresses. Return ONLY the valid JSON array:\n\n' + JSON.stringify(sections);
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':platformKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,messages:[{role:'user',content:prompt}]})
    }).then(function(r){return r.json();}).then(function(data){
      var text = (data.content&&data.content[0]&&data.content[0].text)?data.content[0].text:'';
      var clean = text.replace(/```json|```/g,'').trim();
      try {
        var parsed = JSON.parse(clean);
        if (Array.isArray(parsed)&&parsed.length===sections.length) {
          try{localStorage.setItem(cacheKey,JSON.stringify(parsed));}catch(e){}
          setTranslated(withStaticTitles(parsed));
        }
      } catch(e) {}
    }).catch(function(){}).finally(function(){setLoading(false);});
  }, [lang]);
  return {translated:translated, loading:loading};
}

// ═══════════════════════════════════════════════════════════════
// ──  6. PRIVACY  ──
// ═══════════════════════════════════════════════════════════════
function PrivacyPage({onNavigate}) {
  var t = useLang().t;
  var S = {
    wrap:{minHeight:'100vh',background:'#02040a',color:'#eef2f6',fontFamily:"Inter,system-ui,sans-serif",padding:'40px 24px'},
    inner:{maxWidth:'760px',margin:'0 auto'},
    badge:{fontSize:'12px',color:'#bfa46c',letterSpacing:'0.08em',marginBottom:'8px'},
    h1:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'6px'},
    sub:{fontSize:'13px',color:'#64748b',marginBottom:'32px'},
    card:{background:'linear-gradient(180deg,rgba(17,23,34,0.94),rgba(7,11,18,0.96))',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'10px',padding:'20px 22px',marginBottom:'16px'},
    ct:{fontSize:'15px',color:'#c8d0d8',fontWeight:650,letterSpacing:'0.02em',marginBottom:'10px'},
    cb:{fontSize:'15px',color:'#a2acba',lineHeight:1.8,whiteSpace:'pre-line'},
    warn:{background:'rgba(191,164,108,0.055)',border:'1px solid rgba(191,164,108,0.18)',borderRadius:'10px',padding:'16px 20px',marginBottom:'20px'},
    wt:{fontSize:'15px',color:'#bfa46c',fontWeight:650,marginBottom:'8px'},
    wb:{fontSize:'14px',color:'#a2acba',lineHeight:1.8},
    tip:{textAlign:'center',padding:'8px 16px',marginBottom:'16px',background:'rgba(200,208,216,0.04)',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'8px',fontSize:'12px',color:'#c8d0d8'},
    btn:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.16)',borderRadius:'8px',color:'#a2acba',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bb:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.18)',borderRadius:'8px',color:'#c8d0d8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bg:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(191,164,108,0.24)',borderRadius:'8px',color:'#bfa46c',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}
  };
  var EN_SECS = [
    {t:"1. Information We Collect",b:"GMA operates as a client-side web application. We collect only the minimum data necessary:\n\n\u2022 Account Information: email and display name, stored locally in your browser (localStorage).\n\u2022 API Keys: stored only in your browser and transmitted directly to GMA.\n\u2022 Payment Data: processed entirely by Paddle.com. GMA does not receive, store, or process card information.\n\u2022 Analytics: anonymised, aggregated usage data with no personally identifiable information."},
    {t:"2. Legal Basis for Processing (GDPR)",b:"Under the General Data Protection Regulation (GDPR), we rely on:\n\n\u2022 Contractual Necessity \u2014 processing your email to deliver the subscribed service.\n\u2022 Legitimate Interests \u2014 improving platform performance via anonymised analytics.\n\u2022 Consent \u2014 for any optional data collection. You may withdraw consent at any time."},
    {t:"3. Payment Processing via Paddle",b:"All payments are processed by our Merchant of Record, Paddle.com. When you subscribe:\n\n\u2022 You are redirected to Paddle's PCI-DSS-compliant secure checkout.\n\u2022 Card details are entered only on Paddle's infrastructure. GMA never sees your payment credentials.\n\u2022 Paddle Privacy Policy: https://www.paddle.com/legal/privacy\n\u2022 For billing enquiries: support@globalmarketanalytics.com"},
    {t:"4. Cookies & Tracking",b:"GMA does not use advertising cookies, third-party tracking pixels, or behavioural analytics. Strictly necessary session cookies may be used for authentication only. No user behaviour is sold to advertisers."},
    {t:"5. Third-Party Data Providers",b:"GMA integrates with backend providers, each subject to their own privacy policies:\n\n\u2022 Finnhub.io \u2014 real-time market data provider\n\u2022 Frankfurter API \u2014 currency exchange rates\n\u2022 Paddle.com \u2014 payment processing\n\nThese providers may process your IP address in the course of normal operations."},
    {t:"6. Your Rights (GDPR)",b:"If you are in the EEA or UK, you have the following rights:\n\n\u2022 Right of Access \u2014 request a copy of your personal data.\n\u2022 Right to Rectification \u2014 correct inaccurate data.\n\u2022 Right to Erasure \u2014 request deletion of your data.\n\u2022 Right to Restriction \u2014 limit how we process your data.\n\u2022 Right to Data Portability \u2014 receive data in machine-readable format.\n\u2022 Right to Object \u2014 object to processing based on legitimate interests.\n\nContact: support@globalmarketanalytics.com. We respond within 30 days."},
    {t:"7. Data Retention",b:"Browser localStorage data is retained until you clear your browser or delete your account. We do not retain personal data on our servers beyond what is required for billing and legal compliance."},
    {t:"8. Data Security",b:"We implement HTTPS/TLS encryption for all data in transit. Payment operations are delegated entirely to PCI-DSS-compliant Paddle infrastructure. Security practices are reviewed regularly."},
    {t:"9. Children's Privacy",b:"GMA is not directed at individuals under 18. We do not knowingly collect personal information from minors. Contact support@globalmarketanalytics.com for immediate deletion if a minor has provided data."},
    {t:"10. Changes to This Policy",b:"We may update this Privacy Policy periodically. The effective date reflects the latest revision. Material changes will be notified to registered users by email. Continued use constitutes acceptance."},
    {t:"11. Contact & Data Controller",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nYou have the right to lodge a complaint with your local data protection authority."}
  ];
  var result = useLegalTranslate(EN_SECS,'privacy');
  var secs=result.translated; var translating=result.loading;
  return React.createElement("div",{style:S.wrap},React.createElement("div",{style:S.inner},
    React.createElement("h1",{style:S.h1},t('privacyPolicyTitle')),
    React.createElement("div",{style:S.sub},t('legalGdprDate')),
    translating&&React.createElement("div",{style:S.tip},"\u23F3 ", t('legalTranslating')),
    React.createElement("div",{style:S.warn},
      React.createElement("div",{style:S.wt},"\u26A0 ", t('legalNoAdvice')),
      React.createElement("div",{style:S.wb},t('privacyWarning'))
    ),
    secs.map(function(s,i){return React.createElement("div",{key:i,style:S.card},React.createElement("div",{style:S.ct},"\u2713 ",s.t),React.createElement("div",{style:S.cb},s.b));}),
    React.createElement("div",{style:{marginTop:'24px',display:'flex',gap:'12px',flexWrap:'wrap'}},
      React.createElement("button",{onClick:function(){onNavigate('terms');},style:S.bb},"\u2192 ", t('termsTitle')),
      React.createElement("button",{onClick:function(){onNavigate('refund');},style:S.bg},"\u2192 ", t('refundTitle')),
      React.createElement("button",{onClick:function(){onNavigate('home');},style:S.btn},"\u2190 ", t('home'))
    )
  ));
}

// ======================================================================
// -- TERMS OF SERVICE --
// ======================================================================
function TermsPage({onNavigate}) {
  var t = useLang().t;
  var S = {
    wrap:{minHeight:'100vh',background:'#02040a',color:'#eef2f6',fontFamily:"Inter,system-ui,sans-serif",padding:'40px 24px'},
    inner:{maxWidth:'760px',margin:'0 auto'},
    badge:{fontSize:'12px',color:'#bfa46c',letterSpacing:'0.08em',marginBottom:'8px'},
    h1:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'6px'},
    sub:{fontSize:'13px',color:'#64748b',marginBottom:'32px'},
    card:{background:'linear-gradient(180deg,rgba(17,23,34,0.94),rgba(7,11,18,0.96))',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'10px',padding:'20px 22px',marginBottom:'16px'},
    ct:{fontSize:'15px',color:'#c8d0d8',fontWeight:650,letterSpacing:'0.02em',marginBottom:'10px'},
    cb:{fontSize:'15px',color:'#a2acba',lineHeight:1.8,whiteSpace:'pre-line'},
    warn:{background:'rgba(191,164,108,0.055)',border:'1px solid rgba(191,164,108,0.18)',borderRadius:'10px',padding:'16px 20px',marginBottom:'20px'},
    wt:{fontSize:'15px',color:'#bfa46c',fontWeight:650,marginBottom:'8px'},
    wb:{fontSize:'14px',color:'#a2acba',lineHeight:1.8},
    tip:{textAlign:'center',padding:'8px 16px',marginBottom:'16px',background:'rgba(200,208,216,0.04)',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'8px',fontSize:'12px',color:'#c8d0d8'},
    btn:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.16)',borderRadius:'8px',color:'#a2acba',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bb:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.18)',borderRadius:'8px',color:'#c8d0d8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bg:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(191,164,108,0.24)',borderRadius:'8px',color:'#bfa46c',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}
  };
  var EN_SECS = [
    {t:"1. Acceptance of Terms",b:"By accessing or using the Global Market Analytics (GMA) platform, you agree to these Terms of Service and all applicable laws. If you disagree with any part, discontinue use immediately."},
    {t:"2. Description of Service",b:"GMA is a digital platform providing AI-assisted market data visualisation, financial data aggregation, and analytics tools on a subscription basis.\n\nAll market data is sourced from third-party providers and provided for informational purposes only."},
    {t:"3. No Financial Advice",b:"\u26A0 GMA IS NOT A REGISTERED INVESTMENT ADVISOR.\n\nNothing on this platform constitutes financial, investment, legal, or tax advice. All AI-generated analyses, market summaries, and data visualisations are for informational and educational purposes only.\n\nConsult a qualified financial advisor before making investment decisions. GMA accepts no liability for financial losses arising from use of the platform."},
    {t:"4. User Accounts",b:"You must be at least 18 years old to register. You are responsible for:\n\n\u2022 Maintaining the confidentiality of your account credentials.\n\u2022 All activities occurring under your account.\n\u2022 Immediately notifying us of any unauthorised access at support@globalmarketanalytics.com."},
    {t:"5. Subscriptions & Billing via Paddle",b:"All paid subscriptions are processed by our Merchant of Record, Paddle.com.\n\n\u2022 Subscriptions auto-renew unless cancelled before the renewal date.\n\u2022 One-click cancellation is available at any time from Account Settings.\n\u2022 Price changes communicated at least 30 days in advance.\n\u2022 Paddle.com terms also apply: https://www.paddle.com/legal"},
    {t:"6. Cancellation",b:"Cancel at any time via Account Settings (one-click, no penalty). Cancellation takes effect at the end of the current billing period. No prorated refunds except as described in our Refund Policy."},
    {t:"7. Acceptable Use",b:"You agree not to:\n\n\u2022 Use the platform for any unlawful purpose.\n\u2022 Attempt to reverse-engineer, scrape, or systematically extract platform data.\n\u2022 Share account credentials with third parties.\n\u2022 Generate or distribute misleading financial information via the platform.\n\u2022 Circumvent access controls or subscription restrictions."},
    {t:"8. Intellectual Property",b:"All content, branding, software, and functionality are the exclusive property of Global Market Analytics or its licensors. You are granted a limited, non-exclusive licence for personal, non-commercial use only."},
    {t:"9. Limitation of Liability",b:"To the maximum extent permitted by law, GMA and its affiliates shall not be liable for indirect, incidental, consequential, or punitive damages. GMA's total liability shall not exceed the amount you paid in the twelve months preceding the claim."},
    {t:"10. Disclaimer of Warranties",b:"THE PLATFORM IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND. GMA DOES NOT WARRANT UNINTERRUPTED OR ERROR-FREE SERVICE, NOR THE ACCURACY OR TIMELINESS OF MARKET DATA. USE IS ENTIRELY AT YOUR OWN RISK."},
    {t:"11. Governing Law & Changes",b:"These Terms are governed by applicable law. GMA may modify these Terms at any time; registered users will be notified of material changes by email. Continued use constitutes acceptance of revised Terms."},
    {t:"12. Contact",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
  ];
  var result = useLegalTranslate(EN_SECS,'terms');
  var secs=result.translated; var translating=result.loading;
  return React.createElement("div",{style:S.wrap},React.createElement("div",{style:S.inner},
    React.createElement("div",{style:S.badge},"\uD83D\uDCC4 ", t('termsTitle')),
    React.createElement("h1",{style:S.h1},t('termsTitle')),
    React.createElement("div",{style:S.sub},t('legalEffectiveDate')),
    translating&&React.createElement("div",{style:S.tip},"\u23F3 ", t('legalTranslating')),
    React.createElement("div",{style:S.warn},
      React.createElement("div",{style:S.wt},"\u26A0 ", t('legalNoAdvice')),
      React.createElement("div",{style:S.wb},t('termsWarning'))
    ),
    secs.map(function(s,i){return React.createElement("div",{key:i,style:S.card},React.createElement("div",{style:S.ct},"\u2713 ",s.t),React.createElement("div",{style:S.cb},s.b));}),
    React.createElement("div",{style:{marginTop:'24px',display:'flex',gap:'12px',flexWrap:'wrap'}},
      React.createElement("button",{onClick:function(){onNavigate('privacy');},style:S.bb},"\u2192 ", t('privacyPolicyTitle')),
      React.createElement("button",{onClick:function(){onNavigate('refund');},style:S.bg},"\u2192 ", t('refundTitle')),
      React.createElement("button",{onClick:function(){onNavigate('home');},style:S.btn},"\u2190 ", t('home'))
    )
  ));
}

// ======================================================================
// -- REFUND POLICY --
// ======================================================================
function RefundPage({onNavigate}) {
  var t = useLang().t;
  var S = {
    wrap:{minHeight:'100vh',background:'#02040a',color:'#eef2f6',fontFamily:"Inter,system-ui,sans-serif",padding:'40px 24px'},
    inner:{maxWidth:'760px',margin:'0 auto'},
    badge:{fontSize:'13px',color:'#34d399',letterSpacing:'0.08em',marginBottom:'8px'},
    h1:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'6px'},
    sub:{fontSize:'13px',color:'#64748b',marginBottom:'32px'},
    hi:{background:'rgba(191,164,108,0.055)',border:'1px solid rgba(191,164,108,0.18)',borderRadius:'10px',padding:'22px 24px',marginBottom:'20px'},
    card:{background:'linear-gradient(180deg,rgba(17,23,34,0.94),rgba(7,11,18,0.96))',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'10px',padding:'20px 22px',marginBottom:'16px'},
    ct:{fontSize:'15px',color:'#c8d0d8',fontWeight:650,letterSpacing:'0.02em',marginBottom:'10px'},
    cb:{fontSize:'15px',color:'#a2acba',lineHeight:1.8,whiteSpace:'pre-line'},
    tip:{textAlign:'center',padding:'8px 16px',marginBottom:'16px',background:'rgba(200,208,216,0.04)',border:'1px solid rgba(200,208,216,0.12)',borderRadius:'8px',fontSize:'12px',color:'#c8d0d8'},
    btn:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.16)',borderRadius:'8px',color:'#a2acba',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bb:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(200,208,216,0.18)',borderRadius:'8px',color:'#c8d0d8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}
  };
  var EN_SECS = [
    {t:"1. 7-Day Money-Back Guarantee",b:"GMA offers a full 7-day money-back guarantee on all paid plans (Daily, Monthly, Yearly). If you are not satisfied for any reason, request a full refund within 7 days of your initial purchase.\n\nThis guarantee applies to your first purchase per plan tier and does not apply to subsequent renewals."},
    {t:"2. How to Request a Refund",b:"Contact us within 7 days of purchase:\n\n\u2022 Email: support@globalmarketanalytics.com\n\u2022 Subject: Refund Request \u2014 [your registered email]\n\u2022 Include: purchase date and the email address used.\n\nRefunds processed within 5\u20137 business days to your original payment method via Paddle.com."},
    {t:"3. One-Click Subscription Cancellation",b:"Cancel at any time from Account Settings \u2014 no penalty, no cancellation fee.\n\n\u2022 Cancellation stops all future charges immediately.\n\u2022 Access to paid features retained until the end of the current billing period.\n\u2022 No prorated refunds for partial billing periods after the 7-day window."},
    {t:"4. Renewal Charges",b:"Subscription renewals are not covered by the 7-day guarantee. Cancel before your renewal date to avoid charges. For renewal disputes, contact support@globalmarketanalytics.com and we will review on a discretionary basis."},
    {t:"5. Exceptions",b:"The following are not eligible for refunds:\n\n\u2022 Requests made after the 7-day window.\n\u2022 Accounts found to have violated our Terms of Service.\n\u2022 Free plan (no charges apply).\n\u2022 Fraudulent purchase or chargeback abuse."},
    {t:"6. Payment Processor (Paddle)",b:"All refunds processed through Paddle.com. Bank processing times vary (typically 5\u201310 business days to appear on your statement).\n\nFor billing enquiries with Paddle directly: https://www.paddle.com/legal"},
    {t:"7. Contact",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nWe aim to respond to all refund requests within 1 business day."}
  ];
  var result = useLegalTranslate(EN_SECS,'refund');
  var secs=result.translated; var translating=result.loading;
  return React.createElement("div",{style:S.wrap},React.createElement("div",{style:S.inner},
    React.createElement("div",{style:S.badge},"\uD83D\uDCB0 ", t('refundTitle')),
    React.createElement("h1",{style:S.h1},t('refundTitle')),
    React.createElement("div",{style:S.sub},t('legalEffectiveDate')),
    translating&&React.createElement("div",{style:S.tip},"\u23F3 ", t('legalTranslating')),
    React.createElement("div",{style:S.hi},
      React.createElement("div",{style:{fontSize:'17px',fontWeight:'bold',color:'#34d399',marginBottom:'8px'}},"\u2713 ", t('refundHeroTitle')),
      React.createElement("div",{style:{fontSize:'14px',color:'#94a3b8',lineHeight:1.8}},t('refundHeroText')),
      React.createElement("div",{style:{marginTop:'14px',display:'flex',gap:'10px',flexWrap:'wrap'}},
        ["\uD83D\uDD12 " + t('paddleSecured'),"\u2713 " + t('oneClickCancel'),"\u2713 " + t('noLockIn'),"\u2713 " + t('sevenDayGuarantee')].map(function(b){return React.createElement("div",{key:b,style:{fontSize:'11px',color:'#64748b',background:'rgba(255,255,255,0.03)',border:'1px solid #1e293b',borderRadius:'16px',padding:'4px 12px'}},b);})
      )
    ),
    secs.map(function(s,i){return React.createElement("div",{key:i,style:S.card},React.createElement("div",{style:S.ct},"\u2713 ",s.t),React.createElement("div",{style:S.cb},s.b));}),
    React.createElement("div",{style:{marginTop:'24px',display:'flex',gap:'12px',flexWrap:'wrap'}},
      React.createElement("button",{onClick:function(){onNavigate('privacy');},style:S.bb},"\u2192 ", t('privacyPolicyTitle')),
      React.createElement("button",{onClick:function(){onNavigate('terms');},style:S.bb},"\u2192 ", t('termsTitle')),
      React.createElement("button",{onClick:function(){onNavigate('home');},style:S.btn},"\u2190 ", t('home'))
    )
  ));
}



// ═══════════════════════════════════════════════════════════════
// ──  5. CONTACT  ──
// ═══════════════════════════════════════════════════════════════
function ContactPage({onNavigate}) {
  var _l = useLang(); var t = _l.t;
  var _f = React.useState({name:'',email:'',subject:'',msg:''}); var form = _f[0]; var setForm = _f[1];
  var _s = React.useState(false); var sent = _s[0]; var setSent = _s[1];

  function handleSend() {
    if (!form.name || !form.email || !form.msg) return;
    var mailtoLink = 'mailto:support@globalmarketanalytics.com'
      + '?subject=' + encodeURIComponent((form.subject || 'GMA Contact') + ' - ' + form.name)
      + '&body=' + encodeURIComponent('From: ' + form.name + '\nEmail: ' + form.email + '\n\nMessage:\n' + form.msg);
    window.location.href = mailtoLink;
    setSent(true);
    setTimeout(function(){setSent(false);}, 3000);
    setForm({name:'',email:'',subject:'',msg:''});
  }

  var inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid #1e293b',
    borderRadius:'8px', padding:'10px 12px', color:'#e2e8f0', fontSize:'14px',
    fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginTop:'0'
  };
  var labelStyle = {fontSize:'12px', color:'#64748b', marginBottom:'5px', letterSpacing:'0.06em', display:'block'};

  return React.createElement("div",{style:{minHeight:'100vh',background:'#060912',color:'#e2e8f0',fontFamily:"'Courier New',monospace",padding:'32px 24px'}},
    React.createElement("div",{style:{maxWidth:'700px',margin:'0 auto'}},

      React.createElement("h1",{style:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'8px'}},t('contactTitle')),
      React.createElement("p",{style:{fontSize:'14px',color:'#64748b',marginBottom:'28px'}},t('contactSub')),

      React.createElement("div",{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'14px',marginBottom:'28px'}},

        React.createElement("div",{style:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'16px',display:'flex',gap:'12px',alignItems:'flex-start'}},
          React.createElement("span",{style:{fontSize:'20px'}},"\uD83D\uDCE7"),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',letterSpacing:'0.06em',marginBottom:'4px'}},t('email')),
            React.createElement("a",{href:"mailto:support@globalmarketanalytics.com",style:{color:'#38bdf8',textDecoration:'none',fontSize:'13px',wordBreak:'break-all'}},"support@globalmarketanalytics.com")
          )
        ),

        React.createElement("div",{style:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'16px',display:'flex',gap:'12px',alignItems:'flex-start'}},
          React.createElement("span",{style:{fontSize:'20px'}},"\uD83D\uDCAC"),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',letterSpacing:'0.06em',marginBottom:'4px'}},"WHATSAPP"),
            React.createElement("a",{href:"https://wa.me/998935291121",target:"_blank",rel:"noopener noreferrer",style:{color:'#34d399',textDecoration:'none',fontSize:'13px',display:'block',marginBottom:'4px'}},"+998 93 529 11 21"),
            React.createElement("a",{href:"https://wa.me/998943931121",target:"_blank",rel:"noopener noreferrer",style:{color:'#34d399',textDecoration:'none',fontSize:'13px',display:'block'}},"+998 94 393 11 21")
          )
        ),

        React.createElement("div",{style:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'16px',display:'flex',gap:'12px',alignItems:'flex-start'}},
          React.createElement("span",{style:{fontSize:'20px'}},"\uD83D\uDCE8"),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',letterSpacing:'0.06em',marginBottom:'4px'}},"TELEGRAM"),
            React.createElement("a",{href:"https://t.me/+998935291121",target:"_blank",rel:"noopener noreferrer",style:{color:'#38bdf8',textDecoration:'none',fontSize:'13px'}},"Global Market Analytics Support")
          )
        )
      ),

      React.createElement("div",{style:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'24px'}},
        React.createElement("div",{style:{fontSize:'14px',color:'#64748b',letterSpacing:'0.08em',marginBottom:'18px'}},t('formSend'), " ", t('formMsg')),

        React.createElement("div",{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}},
          React.createElement("div",null,
            React.createElement("label",{style:labelStyle},t('formName')),
            React.createElement("input",{type:'text',value:form.name,onChange:function(e){setForm(function(f){return Object.assign({},f,{name:e.target.value});});},placeholder:t('namePlaceholder'),style:inputStyle})
          ),
          React.createElement("div",null,
            React.createElement("label",{style:labelStyle},t('formEmail')),
            React.createElement("input",{type:'email',value:form.email,onChange:function(e){setForm(function(f){return Object.assign({},f,{email:e.target.value});});},placeholder:'your@email.com',style:inputStyle})
          )
        ),

        React.createElement("div",{style:{marginBottom:'14px'}},
          React.createElement("label",{style:labelStyle},t('formSubject')),
          React.createElement("input",{type:'text',value:form.subject,onChange:function(e){setForm(function(f){return Object.assign({},f,{subject:e.target.value});});},placeholder:t('subjectPlaceholder'),style:inputStyle})
        ),

        React.createElement("div",{style:{marginBottom:'18px'}},
          React.createElement("label",{style:labelStyle},t('formMsg')),
          React.createElement("textarea",{value:form.msg,onChange:function(e){setForm(function(f){return Object.assign({},f,{msg:e.target.value});});},placeholder:t('messagePlaceholder'),rows:5,style:Object.assign({},inputStyle,{resize:'vertical'})})
        ),

        sent && React.createElement("div",{style:{marginBottom:'12px',padding:'10px',background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.3)',borderRadius:'8px',fontSize:'13px',color:'#34d399'}},"\u2713 ", t('formSent')),

        React.createElement("button",{onClick:handleSend,style:{width:'100%',padding:'12px',background:'linear-gradient(135deg,#0ea5e9,#6366f1)',border:'none',borderRadius:'8px',color:'#fff',fontSize:'14px',fontWeight:'bold',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.06em'}},t('formSend'), " \u2192")
      ),

      React.createElement("div",{style:{marginTop:'20px'}},
        React.createElement("button",{onClick:function(){onNavigate('home');},style:{padding:'11px 24px',background:'transparent',border:'1px solid #1e293b',borderRadius:'8px',color:'#64748b',cursor:'pointer',fontFamily:'inherit',fontSize:'13px'}},"\u2190 ", t('back'))
      )
    )
  );
}


// ═══════════════════════════════════════════════════════════════
// ──  GLOBAL HEADER  ──
// ═══════════════════════════════════════════════════════════════
function GlobalHeader({
  page,
  onNavigate,
  user
}) {
  var isMobile = window.innerWidth <= 768;
  var t = useLang().t;
  var navLinks = [
    {key:'home',     label:t('home')},
    {key:'dashboard',label:t('markets')},
    {key:'pricing',  label:t('pricing')},
    {key:'about',    label:t('about')},
    {key:'contact',  label:t('contact')},
    {key:'privacy',  label:t('privacy')}
  ];
  var navBtns = navLinks.map(function(nl) {
    return React.createElement("button", {
      key: nl.key,
      onClick: function(){ onNavigate(nl.key); },
      style: {
        background:'none', border:'none', outline:'none',
        cursor:'pointer', fontFamily:"'Courier New',monospace",
        fontWeight:'600', letterSpacing:'0.8px', whiteSpace:'nowrap',
        padding: isMobile ? '5px 8px' : '6px 10px',
        fontSize: isMobile ? '10px' : 'clamp(11px,2.5vw,15px)',
        color: page === nl.key ? '#ffffff' : '#777777',
        borderBottom: page === nl.key ? '1px solid #ffffff' : '1px solid transparent',
        transition: 'all 0.2s ease'
      }
    }, nl.label);
  });
  var rightSide = React.createElement("div",
    {style:{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}},
    React.createElement(LangSelector, null),
    user
      ? React.createElement("button", {
          onClick:function(){onNavigate('profile');},
          style:{background:'linear-gradient(135deg,rgba(14,165,233,0.2),rgba(99,102,241,0.2))',
            border:'1px solid rgba(56,189,248,0.3)',color:'#38bdf8',borderRadius:'8px',
            padding:'6px 12px',cursor:'pointer',fontFamily:'inherit',fontWeight:'bold',
            fontSize: isMobile ? '12px' : '14px'}
        }, '\uD83D\uDC64 ', (user.name||user.email||'').slice(0,12))
      : React.createElement("button", {
          onClick:function(){onNavigate('login');},
          style:{background:'linear-gradient(135deg,#0ea5e9,#6366f1)',
            border:'none',color:'#fff',borderRadius:'8px',
            padding:'6px 14px',cursor:'pointer',fontFamily:'inherit',
            fontWeight:'bold',letterSpacing:'0.06em',
            fontSize: isMobile ? '12px' : '14px'}
        }, t('login'))
  );
  var logoBtn = React.createElement("button",
    {onClick:function(){onNavigate("home");},
     style:{background:"none",border:"none",cursor:"pointer",padding:0,
            display:"flex",alignItems:"center",gap:"8px"}},
    React.createElement("img",{
      src:"/gma-logo.png",
      alt:"GMA Logo",
      style:{height:"36px",width:"36px",objectFit:"contain",display:"block"}
    }),
    React.createElement("span",
      {style:{fontSize:"16px",fontWeight:"bold",color:"#38bdf8",letterSpacing:"0.08em"}},
      "GMA"
    )
  );
  var hdrBase = {
    background:'linear-gradient(135deg,#09101f,#060912)',
    position:'sticky', top:0, zIndex:100,
    fontFamily:"'Courier New',monospace"
  };
  if (isMobile) {
    return React.createElement("div",
      {className:'header-container',
       style:Object.assign({},hdrBase,{
         borderBottom:'1px solid rgba(56,189,248,0.1)',
         flexDirection:'column', padding:'10px 12px 6px', gap:'0px'
       })},
      React.createElement("div",
        {style:{display:'flex',justifyContent:'space-between',
                alignItems:'center',width:'100%',marginBottom:'8px'}},
        logoBtn, rightSide
      ),
      React.createElement("div",
        {style:{display:'flex',overflowX:'auto',
                WebkitOverflowScrolling:'touch',
                msOverflowStyle:'none',scrollbarWidth:'none',
                justifyContent:'center',gap:'2px',
                width:'100%',paddingBottom:'2px'}},
        navBtns
      )
    );
  }
  return React.createElement("div",
    {className:'header-container',
     style:Object.assign({},hdrBase,{
       borderBottom:'1px solid rgba(56,189,248,0.15)',
       padding:'12px 24px', display:'flex',
       alignItems:'center', justifyContent:'space-between', gap:'12px'
     })},
    logoBtn,
    React.createElement("div",
      {style:{display:'flex',alignItems:'center',justifyContent:'center',
              flex:1,overflowX:'auto',WebkitOverflowScrolling:'touch',
              msOverflowStyle:'none',scrollbarWidth:'none',
              padding:'5px 0',gap:'clamp(2px,2vw,15px)'}},
      navBtns
    ),
    rightSide
  );
}

// ═══════════════════════════════════════════════════════════════
// ──  GLOBAL FOOTER ──
// ═══════════════════════════════════════════════════════════════
function GlobalFooter({
  onNavigate
}) {
  const {
    t
  } = useLang();
  const socials = [{
    icon: 'X',
    label: 'Twitter/X',
    url: 'https://twitter.com/GMAnalytic',
    svg: null
  }, {
    icon: 'in',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/comm/in/g%C3%BCven-g%C3%BClery%C3%BCz-a22480404',
    svg: null
  }, {
    icon: null,
    label: 'Instagram',
    url: 'https://www.instagram.com/globalmarketanalytics/',
    svg: '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" width=\"16\" height=\"16\"><path d=\"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z\"/></svg>'
  }, {
    icon: null,
    label: 'Telegram',
    url: 'https://t.me/+998935291121',
    svg: '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" width=\"16\" height=\"16\"><path d=\"M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0zm5.98 8.347L16 16.5c-.162.655-.59.816-1.195.508l-3.3-2.432-1.593 1.534c-.176.176-.323.323-.662.323l.236-3.342 6.095-5.504c.265-.235-.058-.366-.41-.13L5.84 12.977 2.587 11.96c-.69-.215-.704-.69.144-.9L17.27 7.528c.575-.207 1.077.13.654.82z\"/></svg>'
  }, {
    icon: null,
    label: 'WhatsApp 1',
    url: 'https://wa.me/998935291121',
    svg: '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" width=\"16\" height=\"16\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z\"/></svg>'
  }, {
    icon: null,
    label: 'WhatsApp 2',
    url: 'https://wa.me/998943931121',
    svg: '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" width=\"16\" height=\"16\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z\"/></svg>'
  }]
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#050a15',
      borderTop: '1px solid #0f172a',
      padding: '32px 24px 20px',
      fontFamily: "'Courier New',monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1100px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
      gap: '28px',
      marginBottom: '28px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '19px',
      fontWeight: 'bold',
      color: '#38bdf8',
      letterSpacing: '0.06em',
      marginBottom: '10px'
    }
  }, "\u25C8 GLOBAL MARKET ANALYTICS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#94a3b8',
      lineHeight: 1.7
    }
  }, t('footerDesc'), " 2026 \xA9 ", t('copyright')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginTop: '14px'
    }
  }, socials.map(s => /*#__PURE__*/React.createElement("a", {
    key: s.label,
    href: s.url,
    title: s.label,
    target: '_blank',
    rel: 'noopener noreferrer',
    style: {
      width: '32px',
      height: '32px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid #1e293b',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: '17px',
      fontWeight: 'bold',
      textDecoration: 'none',
      transition: 'all 0.2s'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'rgba(56,189,248,0.1)';
      e.currentTarget.style.color = '#38bdf8';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.color = '#475569';
    }
  }, s.svg
    ? /*#__PURE__*/React.createElement("span", {
        dangerouslySetInnerHTML: {__html: s.svg},
        style: {display:"flex",alignItems:"center",justifyContent:"center"}
      })
    : s.icon
  )))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#94a3b8',
      letterSpacing: '0.06em',
      marginBottom: '10px'
    }
  }, t('platform')), [['home', t('home')], ['dashboard', t('markets')], ['about', t('about')], ['contact', t('contact')]].map(([key, label]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    onClick: () => onNavigate(key),
    style: {
      display: 'block',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '17px',
      fontFamily: 'inherit',
      marginBottom: '6px',
      padding: 0,
      textAlign: 'left',
      transition: 'color 0.2s'
    },
    onMouseEnter: e => e.target.style.color = '#94a3b8',
    onMouseLeave: e => e.target.style.color = '#64748b'
  }, "\u2192 ", label))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#94a3b8',
      letterSpacing: '0.06em',
      marginBottom: '10px'
    }
  }, t('legal')), [['privacy', t('privacyPolicyTitle')], ['terms', t('termsTitle')], ['refund', t('refundTitle')]].map(([key, label], i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onNavigate(key),
    style: {
      display: 'block',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '17px',
      fontFamily: 'inherit',
      marginBottom: '6px',
      padding: 0,
      textAlign: 'left',
      transition: 'color 0.2s'
    },
    onMouseEnter: e => e.target.style.color = '#94a3b8',
    onMouseLeave: e => e.target.style.color = '#64748b'
  }, "\u2192 ", label))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#f87171',
      letterSpacing: '0.06em',
      marginBottom: '10px'
    }
  }, "\u26A0 ", t('legalNoticeTitle')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '16px',
      color: '#94a3b8',
      lineHeight: 1.7
    }
  }, t('legalNotice')))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #0f172a',
      paddingTop: '16px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '15px',
      color: '#64748b',
      letterSpacing: '0.05em'
    }
  }, "\u25C8 ", t('footerBrandLine')), /*#__PURE__*/React.createElement("div", {style: {fontSize:'12px', color:'#94a3b8', marginTop:'8px', lineHeight:1.6, textAlign:'center'}}, t('footerCompliance')))));
}


// ═══════════════════════════════════════════════════════════════
// GMA ADMIN SECURITY LAYER
// Triple-gate: URL param + Master Email + Password (SHA-256)
// ═══════════════════════════════════════════════════════════════

// Master emails — only these accounts can access admin
const GMA_MASTER_EMAILS = [
  'gguwen7@gmail.com',
  'guven@globalmarketanalytics.com',
  'admin@globalmarketanalytics.com'
];

// SHA-256 hash of "gma2026admin" — change in production via setAdminPassword()
// To generate new: await GMA_AdminSec.hashPassword('your_new_pass')
const GMA_ADMIN_PASSWORD_HASH = '3227acc1902fc1e1f18958a8b386b197d5cd7cd325d93ccd28f440d34eec84e0';

const GMA_AdminSec = {
  // SHA-256 hash via Web Crypto API
  async hashPassword(pw) {
    const data = new TextEncoder().encode(pw);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Check URL has admin param
  hasUrlParam() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('gma') === '1' ||
             params.get('gma-admin') === 'true' ||
             window.location.hash.includes('gma-admin');
    } catch { return false; }
  },

  // Check current user is in master list
  isMasterUser() {
    try {
      const u = JSON.parse(localStorage.getItem('gma_current_user'));
      return u && GMA_MASTER_EMAILS.indexOf((u.email || '').toLowerCase()) !== -1;
    } catch { return false; }
  },

  // Get the active password hash (from localStorage if set, else default)
  getStoredHash() {
    return localStorage.getItem('gma_admin_pw_hash') || GMA_ADMIN_PASSWORD_HASH;
  },

  // Set new password (one-time setup)
  async setAdminPassword(newPw) {
    const hash = await this.hashPassword(newPw);
    localStorage.setItem('gma_admin_pw_hash', hash);
    return hash;
  },

  // Verify password
  async verifyPassword(pw) {
    const hash = await this.hashPassword(pw);
    return hash === this.getStoredHash();
  },

  // Token system: 24h session
  TOKEN_KEY: 'gma_admin_token',
  TOKEN_TTL: 24 * 60 * 60 * 1000,

  hasValidToken() {
    try {
      const t = JSON.parse(localStorage.getItem(this.TOKEN_KEY));
      if (!t || !t.expires) return false;
      if (Date.now() > t.expires) {
        localStorage.removeItem(this.TOKEN_KEY);
        return false;
      }
      return t.email === JSON.parse(localStorage.getItem('gma_current_user') || '{}').email;
    } catch { return false; }
  },

  issueToken(email) {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify({
      email: email,
      expires: Date.now() + this.TOKEN_TTL,
      issued: Date.now()
    }));
  },

  revokeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },

  // Brute-force protection
  ATTEMPTS_KEY: 'gma_admin_attempts',
  MAX_ATTEMPTS: 3,
  LOCKOUT_MS: 60 * 60 * 1000,

  isLockedOut() {
    try {
      const a = JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY));
      if (!a) return false;
      if (a.count >= this.MAX_ATTEMPTS && Date.now() < a.lockedUntil) {
        return Math.ceil((a.lockedUntil - Date.now()) / 60000);
      }
      if (a.lockedUntil && Date.now() >= a.lockedUntil) {
        localStorage.removeItem(this.ATTEMPTS_KEY);
      }
      return false;
    } catch { return false; }
  },

  recordFailedAttempt() {
    let a = {};
    try { a = JSON.parse(localStorage.getItem(this.ATTEMPTS_KEY)) || {}; } catch {}
    a.count = (a.count || 0) + 1;
    if (a.count >= this.MAX_ATTEMPTS) {
      a.lockedUntil = Date.now() + this.LOCKOUT_MS;
    }
    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(a));
  },

  clearAttempts() {
    localStorage.removeItem(this.ATTEMPTS_KEY);
  },

  // Master gate: all conditions must pass
  canShowAdmin() {
    return this.hasUrlParam() && this.isMasterUser() && this.hasValidToken();
  },

  // Stripped URL after admin opens (clean URL bar)
  cleanUrl() {
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
  }
};

// Admin Login Modal — shown when URL param present, master email logged in, no token
function AdminLoginModal({ onClose, onSuccess }) {
  const [pw, setPw] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const lockMin = GMA_AdminSec.isLockedOut();

  const submit = async () => {
    if (!pw) return;
    setLoading(true);
    setError('');
    try {
      const ok = await GMA_AdminSec.verifyPassword(pw);
      if (ok) {
        const u = JSON.parse(localStorage.getItem('gma_current_user') || '{}');
        GMA_AdminSec.issueToken(u.email);
        GMA_AdminSec.clearAttempts();
        onSuccess();
      } else {
        GMA_AdminSec.recordFailedAttempt();
        const remaining = GMA_AdminSec.MAX_ATTEMPTS - (JSON.parse(localStorage.getItem(GMA_AdminSec.ATTEMPTS_KEY) || '{}').count || 0);
        if (remaining <= 0) {
          setError('Too many failed attempts. Locked for 1 hour.');
        } else {
          setError('Wrong password. ' + remaining + ' attempts remaining.');
        }
      }
    } catch (e) {
      setError('Hata: ' + e.message);
    }
    setPw('');
    setLoading(false);
  };

  return React.createElement('div', {
    style: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
      zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Inter","Montserrat",sans-serif'
    }
  },
    React.createElement('div', {
      style: {
        maxWidth: '420px', width: '90%', padding: '36px 32px',
        background: 'rgba(10, 17, 34, 0.85)',
        backdropFilter: 'blur(40px) saturate(220%)',
        border: '1px solid rgba(248, 113, 113, 0.25)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(248,113,113,0.12)'
      }
    },
      React.createElement('div', {
        style: { fontSize: '11px', color: '#f87171', letterSpacing: '0.2em', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 500 }
      }, '◆'),
      React.createElement('h2', {
        style: { fontSize: '22px', fontWeight: 200, color: '#f1f5f9', marginBottom: '8px', letterSpacing: '-0.01em' }
      }, 'GMA Admin Console'),
      React.createElement('p', {
        style: { fontSize: '12px', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.6 }
      }, 'Enter the admin password. After verification, authorization remains active for 24 hours.'),

      lockMin
        ? React.createElement('div', {
            style: { padding: '14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                     borderRadius: '10px', color: '#f87171', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }
          }, '◆' + lockMin + ' minutes and try again')
        : null,

      React.createElement('input', {
        type: 'password',
        value: pw,
        onChange: e => setPw(e.target.value),
        onKeyDown: e => { if (e.key === 'Enter' && !lockMin) submit(); },
        disabled: lockMin || loading,
        placeholder: 'Admin password',
        autoFocus: true,
        style: {
          width: '100%', padding: '12px 14px', marginBottom: '12px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: '10px', color: '#e2e8f0',
          fontFamily: 'inherit', fontSize: '14px',
          boxSizing: 'border-box'
        }
      }),

      error ? React.createElement('div', {
        style: { fontSize: '11px', color: '#f87171', marginBottom: '14px', padding: '8px 12px',
                 background: 'rgba(248,113,113,0.08)', borderRadius: '6px' }
      }, error) : null,

      React.createElement('div', { style: { display: 'flex', gap: '8px' } },
        React.createElement('button', {
          onClick: onClose,
          disabled: loading,
          style: {
            flex: 1, padding: '11px', background: 'transparent',
            border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px',
            color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px'
          }
        }, 'Cancel'),
        React.createElement('button', {
          onClick: submit,
          disabled: lockMin || loading || !pw,
          style: {
            flex: 2, padding: '11px',
            background: lockMin || !pw ? 'rgba(148,163,184,0.1)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)',
            border: 'none', borderRadius: '10px', color: '#fff',
            cursor: lockMin || !pw ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: '13px', fontWeight: 500,
            opacity: lockMin || !pw ? 0.5 : 1, letterSpacing: '0.05em'
          }
        }, loading ? 'Verifying...' : 'SIGN IN →')
      ),

      React.createElement('div', {
        style: { fontSize: '10px', color: '#64748b', marginTop: '16px', textAlign: 'center', lineHeight: 1.5 }
      }, '◆', React.createElement('br', null),
         'All attempts are logged.')
    )
  );
}


// ═══════════════════════════════════════════════════════════════
// GMA Profilleme Sistemi — 6 soruluk onboarding overlay
// GMA DNA Questions — single source of truth
var GMA_DNA_QUESTIONS = [
  {
    id: 'market_scope', label: 'Your Analysis Scope?',
    options: [
      {v:'global',   l:'Global Markets',    icon:'\u25c8', detail:'NASDAQ, NYSE, Europe, Asya'},
      {v:'emerging', l:'Emerging Markets', icon:'\u25c7', detail:'BIST and similar markets'}
    ]
  },
  {
    id: 'country', label: 'Focus Country / Region?',
    showIf: (a) => a.market_scope === 'global',
    options: [
      {v:'na',   l:'North America', icon:'\u25a0', detail:'US / NASDAQ / NYSE'},
      {v:'eu',   l:'Europe',        icon:'\u25c6', detail:'EU / DAX / CAC / FTSE'},
      {v:'apac', l:'Asya & Pasifik', icon:'\u25b2', detail:'TR / CN / JP / Hang Seng'},
      {v:'me',   l:'Middle East', icon:'\u25cf', detail:'DIFX / Tadawul'}
    ]
  },
  {
    id: 'sectors', label: 'Priority Ecosystems (Max 3)', multi: true,
    options: [
      {v:'tech',    l:'Technology',   icon:'\u25a1'},
      {v:'energy',  l:'Energy',      icon:'\u25c7'},
      {v:'defense', l:'Defense',     icon:'\u25b2'},
      {v:'food',    l:'Food',   icon:'\u25cf'},
      {v:'health',  l:'Health', icon:'\u25c8'},
      {v:'finance', l:'Finance',      icon:'\u25c6'}
    ]
  },
  {
    id: 'risk', label: 'Your Analysis Style?',
    options: [
      {v:'cube',    l:'Cube',    icon:'\u25a0', detail:'Conservative'},
      {v:'prism',   l:'Prism',      icon:'\u25c6', detail:'Balanced'},
      {v:'pyramid', l:'Pyramid',     icon:'\u25b2', detail:'Aggressive'}
    ]
  },
  {
    id: 'timeframe', label: 'Your Review Timeframe?',
    options: [
      {v:'short',  l:'Short',   icon:'\u25cf', detail:'0\u20131 Year'},
      {v:'medium', l:'Medium',        icon:'\u25d0', detail:'1\u20133 Years'},
      {v:'long',   l:'Long',        icon:'\u25d1', detail:'3+ Years'}
    ]
  },
  {
    id: 'tone', label: 'Analysis Style?',
    options: [
      {v:'clear',     l:'Clear',   icon:'\u25cb', detail:'Simple and concise'},
      {v:'technical', l:'Technical',   icon:'\u25c8', detail:'Deep and data-driven'}
    ]
  },
  {
    id: 'budget', label: 'Your Volume Scale?',
    options: [
      {v:'micro',     l:'Micro',    icon:'\u25a1'},
      {v:'macro',     l:'Macro',    icon:'\u25a3'},
      {v:'corporate', l:'Corporate', icon:'\u25a0'}
    ]
  }
];

// Visible questions based on previous answers (filters out skipped)
function getVisibleQuestions(answers) {
  return GMA_DNA_QUESTIONS.filter(q => !q.showIf || q.showIf(answers));
}

function OnboardingOverlay({ user, onComplete, editMode, initialAnswers, editOnlyId, onSingleEditDone }) {
  const { t } = useLang();
  const [answers, setAnswers] = React.useState(initialAnswers || {});
  const [selectedSectors, setSelectedSectors] = React.useState(() => {
    if (initialAnswers && Array.isArray(initialAnswers.sectors)) return initialAnswers.sectors;
    return [];
  });

  // If editing a single question, show only that
  var activeQuestions;
  if (editOnlyId) {
    activeQuestions = GMA_DNA_QUESTIONS.filter(q => q.id === editOnlyId);
  } else {
    activeQuestions = getVisibleQuestions(answers);
  }

  const [step, setStep] = React.useState(0);
  const q = activeQuestions[step];
  if (!q) return null;

  const isMulti = !!q.multi;

  const persist = (finalAnswers) => {
    localStorage.setItem('gma_user_dna_' + user.email, JSON.stringify(finalAnswers));
    localStorage.setItem('gma_onboarded_' + user.email, '1');
    localStorage.setItem('gma_onboarding_complete', 'true');
  };

  const advance = (newAns) => {
    if (editOnlyId) {
      persist(newAns);
      setTimeout(() => onSingleEditDone && onSingleEditDone(newAns), 220);
      return;
    }
    // Recalculate visible questions after answer (for showIf branching)
    const nextVisible = getVisibleQuestions(newAns);
    const currentIdx = nextVisible.findIndex(x => x.id === q.id);
    if (currentIdx < nextVisible.length - 1) {
      setTimeout(() => setStep(currentIdx + 1), 220);
      setSelectedSectors([]);
    } else {
      persist(newAns);
      setTimeout(() => onComplete && onComplete(newAns), 220);
    }
  };

  const pick = (v) => {
    if (isMulti) {
      let newSel;
      if (selectedSectors.includes(v)) newSel = selectedSectors.filter(x => x !== v);
      else if (selectedSectors.length < 3) newSel = [...selectedSectors, v];
      else return;
      setSelectedSectors(newSel);
    } else {
      const newAns = Object.assign({}, answers, {[q.id]: v});
      setAnswers(newAns);
      advance(newAns);
    }
  };

  const confirmMulti = () => {
    if (selectedSectors.length === 0) return;
    const newAns = Object.assign({}, answers, {[q.id]: selectedSectors});
    setAnswers(newAns);
    advance(newAns);
  };

  const totalSteps = editOnlyId ? 1 : 6; // Shown 6 max (some hidden by showIf)
  const displayStepNum = step + 1;

  return React.createElement('div', {
    style: {
      position:'fixed', top:0,left:0,right:0,bottom:0,
      background:'rgba(6,9,18,0.97)',
      backdropFilter:'blur(24px) saturate(200%)',
      WebkitBackdropFilter:'blur(24px) saturate(200%)',
      zIndex:99999,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'"Inter","Montserrat",sans-serif',
      overflow:'auto', padding:'24px 0'
    }
  },
    React.createElement('div', {
      style:{ maxWidth:'760px',width:'92%',padding:'32px 24px',textAlign:'center' }
    },
      // Progress (only in onboarding, not edit mode)
      !editOnlyId && React.createElement('div', {
        style:{display:'flex',justifyContent:'center',gap:'6px',marginBottom:'36px'}
      }, Array.from({length: totalSteps}).map((_, i) =>
        React.createElement('div', {
          key:i,
          style:{
            width: i === step ? '32px' : '8px',
            height:'3px',
            background: i <= step ? '#38bdf8' : 'rgba(148,163,184,0.2)',
            borderRadius:'3px',
            transition:'all 0.4s ease'
          }
        })
      )),
      // Step indicator
      React.createElement('div', {
        style:{fontSize:'11px',color:'#64748b',letterSpacing:'0.2em',marginBottom:'16px',fontWeight:'400'}
      }, editOnlyId ? t('dnaEdit') : (t('step') + ' ' + displayStepNum + ' / ' + totalSteps)),
      // Heading
      React.createElement('h2', {
        style:{fontSize:'28px',fontWeight:'200',color:'#f1f5f9',marginBottom:'8px',letterSpacing:'-0.02em',lineHeight:1.3,margin:0}
      }, t('dnaQ_' + q.id) || q.label),
      // Multi helper / spacer
      isMulti
        ? React.createElement('div', {
            style:{fontSize:'11px',color:'#94a3b8',marginTop:'10px',marginBottom:'24px',letterSpacing:'0.05em'}
          }, selectedSectors.length + ' / 3 ' + t('selected'))
        : React.createElement('div', {style:{height:'28px'}}),
      // Options grid
      React.createElement('div', {
        style:{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',
          gap:'12px', marginTop: isMulti ? '4px' : '0'
        }
      }, q.options.map(opt => {
        const isSelected = isMulti
          ? selectedSectors.includes(opt.v)
          : answers[q.id] === opt.v;
        const isDisabled = isMulti && !isSelected && selectedSectors.length >= 3;
        return React.createElement('button', {
          key: opt.v,
          onClick: () => pick(opt.v),
          disabled: isDisabled,
          style:{
            background: isSelected ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
            backdropFilter:'blur(18px) saturate(200%)',
            WebkitBackdropFilter:'blur(18px) saturate(200%)',
            border:'1px solid ' + (isSelected ? 'rgba(56,189,248,0.5)' : 'rgba(148,163,184,0.12)'),
            borderRadius:'14px',
            padding:'22px 16px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.4 : 1,
            color: isSelected ? '#38bdf8' : '#e2e8f0',
            fontFamily:'inherit', fontSize:'14px', fontWeight:'300',
            letterSpacing:'0.02em', transition:'all 0.25s ease',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
            boxShadow: isSelected ? '0 8px 24px rgba(56,189,248,0.15)' : '0 4px 16px rgba(0,0,0,0.2)'
          }
        },
          React.createElement('div', {
            style:{fontSize:'26px',color: isSelected ? '#38bdf8' : '#64748b',fontWeight:'200'}
          }, opt.icon),
          React.createElement('div', {style:{fontWeight:'400'}}, t('dnaOpt_' + q.id + '_' + opt.v) || opt.l),
          opt.detail && React.createElement('div', {
            style:{fontSize:'10px',color:'#64748b',letterSpacing:'0.03em'}
          }, t('dnaDetail_' + q.id + '_' + opt.v) || opt.detail)
        );
      })),
      // Multi confirm button
      isMulti && React.createElement('button', {
        onClick: confirmMulti,
        disabled: selectedSectors.length === 0,
        style:{
          marginTop:'28px',padding:'12px 40px',
          background: selectedSectors.length > 0 ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(148,163,184,0.1)',
          border:'none',borderRadius:'12px',color:'#fff',
          fontFamily:'inherit',fontSize:'14px',fontWeight:'500',letterSpacing:'0.08em',
          cursor: selectedSectors.length > 0 ? 'pointer' : 'not-allowed',
          opacity: selectedSectors.length > 0 ? 1 : 0.4,
          transition:'all 0.25s'
        }
      }, t('continue') + ' \u2192'),
      // Cancel in edit mode
      editOnlyId && React.createElement('button', {
        onClick: () => onSingleEditDone && onSingleEditDone(null),
        style:{
          marginTop:'28px',padding:'10px 28px',
          background:'transparent',
          border:'1px solid rgba(148,163,184,0.2)',
          borderRadius:'10px',color:'#94a3b8',
          fontFamily:'inherit',fontSize:'13px',fontWeight:'300',letterSpacing:'0.05em',
          cursor:'pointer'
        }
      }, '\u2715 ' + t('cancel'))
    )
  );
}

// GMA DNA Card — displayed in UserPanel
function GMA_DNA_Card({ user, onEditField }) {
  var t = useLang().t;
  var dna = null;
  try { dna = JSON.parse(localStorage.getItem('gma_user_dna_' + user.email)); } catch {}
  if (!dna) return null;

  // Label maps
  var labels = {
    market_scope: t('dnaMarketScope'),
    country:      t('dnaFocusRegion'),
    sectors:      t('dnaSectors'),
    risk:         t('dnaRiskStyle'),
    timeframe:    t('dnaTimeframe'),
    tone:         t('dnaTone'),
    budget:       t('dnaVolumeScale')
  };
  var valueMap = {
    global:t('dnaOpt_market_scope_global'), emerging:t('dnaOpt_market_scope_emerging'),
    na:t('dnaOpt_country_na'), eu:t('dnaOpt_country_eu'), apac:t('dnaOpt_country_apac'), me:t('dnaOpt_country_me'),
    tech:t('dnaOpt_sectors_tech'), energy:t('dnaOpt_sectors_energy'), defense:t('dnaOpt_sectors_defense'), food:t('dnaOpt_sectors_food'), health:t('dnaOpt_sectors_health'), finance:t('dnaOpt_sectors_finance'),
    cube:t('dnaOpt_risk_cube') + ' \u2014 ' + t('dnaDetail_risk_cube'), prism:t('dnaOpt_risk_prism') + ' \u2014 ' + t('dnaDetail_risk_prism'), pyramid:t('dnaOpt_risk_pyramid') + ' \u2014 ' + t('dnaDetail_risk_pyramid'),
    short:t('dnaOpt_timeframe_short') + ' (0-1 Y)', medium:t('dnaOpt_timeframe_medium') + ' (1-3 Y)', long:t('dnaOpt_timeframe_long') + ' (3+ Y)',
    clear:t('dnaOpt_tone_clear'), technical:t('dnaOpt_tone_technical'),
    micro:t('dnaOpt_budget_micro'), macro:t('dnaOpt_budget_macro'), corporate:t('dnaOpt_budget_corporate')
  };
  var formatVal = function(key, val) {
    if (Array.isArray(val)) return val.map(v => valueMap[v] || v).join(' \xb7 ');
    return valueMap[val] || val;
  };

  var rows = Object.keys(dna).filter(k => labels[k]).map(function(k) {
    return React.createElement('div', {
      key: k,
      style:{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 14px',
        background:'rgba(255,255,255,0.02)',
        border:'1px solid rgba(148,163,184,0.08)',
        borderRadius:'10px', marginBottom:'6px'
      }
    },
      React.createElement('div', null,
        React.createElement('div', {
          style:{fontSize:'10px',color:'#64748b',letterSpacing:'0.1em',marginBottom:'2px'}
        }, labels[k].toUpperCase()),
        React.createElement('div', {
          style:{fontSize:'13px',color:'#e2e8f0',fontWeight:'300'}
        }, formatVal(k, dna[k]))
      ),
      React.createElement('button', {
        onClick: function(){ onEditField && onEditField(k); },
        style:{
          padding:'5px 12px',
          background:'rgba(56,189,248,0.08)',
          border:'1px solid rgba(56,189,248,0.2)',
          borderRadius:'7px', color:'#38bdf8',
          fontSize:'10px', fontFamily:'inherit', fontWeight:'500',
          letterSpacing:'0.05em', cursor:'pointer',
          transition:'all 0.2s'
        }
      }, t('edit'))
    );
  });

  return React.createElement('div', {
    style:{
      background:'linear-gradient(145deg,#0c1220,#080d18)',
      border:'1px solid rgba(167,139,250,0.15)',
      borderRadius:'14px', padding:'20px', marginBottom:'14px',
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)'
    }
  },
    React.createElement('div', {
      style:{fontSize:'12px',color:'#a78bfa',letterSpacing:'0.12em',marginBottom:'6px'}
    }, '\u25c8 ', t('gmaUserDna')),
    React.createElement('div', {
      style:{fontSize:'11px',color:'#64748b',marginBottom:'16px',lineHeight:1.5}
    }, t('dnaIntro')),
    rows
  );
}


export {
  LANGS, CORE_LANGS, EN, LangContext, useLang,
  GMA_CONFIG, GMA_PLATFORM_KEY, GMA_AdminSec,
  getCachedTranslation, translateWithAI, getTranslations,
  MarketDashboard, PricingPage, HomePage, LoginPage, UserPanelPage,
  AboutPage, ContactPage, PrivacyPage, TermsPage, RefundPage,
  GlobalHeader, GlobalFooter, OnboardingOverlay
};

