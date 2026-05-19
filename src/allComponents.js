import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';


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
  //    a) Vendor ID: Developer Tools → Authentication
  //    b) Price ID'leri: Catalog → Products → her plan icin (pri_...)
  //    c) Environment: 'sandbox' (test) veya 'production'
  finnhubKey: 'd7f8b4pr01qpjqqjrge0d7f8b4pr01qpjqqjrgeg',
  // finnhub.io API Key - free tier 60 req/min

  paddle: {
    vendorId: '',
    // Paddle Vendor ID (sayisal)
    environment: 'production',
    // 'sandbox' | 'production'
    prices: {
      daily: '',
      // Paddle Price ID — gunluk plan (pri_...)
      monthly: '',
      // Paddle Price ID — aylik plan (pri_...)
      yearly: '' // Paddle Price ID — yearlik plan (pri_...)
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
  if (GMA_CONFIG.paddle?.vendorId) localStorage.setItem('gma_paddle_vendor_id', GMA_CONFIG.paddle.vendorId);
  if (GMA_CONFIG.paddle?.environment) localStorage.setItem('gma_paddle_env', GMA_CONFIG.paddle.environment);
  if (GMA_CONFIG.paddle?.prices?.daily) localStorage.setItem('gma_price_daily', GMA_CONFIG.paddle.prices.daily);
  if (GMA_CONFIG.paddle?.prices?.monthly) localStorage.setItem('gma_price_monthly', GMA_CONFIG.paddle.prices.monthly);
  if (GMA_CONFIG.paddle?.prices?.yearly) localStorage.setItem('gma_price_yearly', GMA_CONFIG.paddle.prices.yearly);
})();

// Paddle config erisimi
const PADDLE_VENDOR_ID = () => GMA_CONFIG.paddle?.vendorId || localStorage.getItem('gma_paddle_vendor_id') || '';
const PADDLE_ENV = () => GMA_CONFIG.paddle?.environment || localStorage.getItem('gma_paddle_env') || 'production';
const PADDLE_PRICES = () => ({
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

// ── Ceviri Tablosu ──
const T = {
  tr: {
    home: "HOME",
    markets: "MARKETS",
    about: "ABOUT",
    contact: "CONTACT",
    privacy: "PRIVACY",
    pricing: "PRICING",
    login: "SIGN IN",
    register: "SIGN UP",
    logout: "SIGN OUT",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your free account",
    viewMarkets: "VIEW MARKETS",
    loginRegister: "SIGN IN / SIGN UP",
    googleContinue: "Continue with Google",
    heroTitle: "See Global Markets\nwith Greater Clarity",
    heroSub: "600+ global organizations, real-time market data, and structured intelligence via the GMA Consensus Engine.",
    heroBtn1: "VIEW MARKETS",
    heroBtn2: "SEE PRICING",
    heroBtn3: "SIGN UP",
    heroSubtitle: "Reduce uncertainty with structured analysis and clearer decision framing.",
    step1t: "Sign Up",
    step1d: "Create an account in 30 seconds with email or Google",
    step2t: "Choose Plan",
    step2d: "Select from plans starting at $2.99/day",
    step3t: "Analyze",
    step3d: "Strategic clarity via the GMA Consensus Engine",
    step4t: "Decide",
    step4d: "Build your own decision framework with reliable data and analytical clarity",
    howTitle: "How It Works",
    howSub: "Global Investment in 4 Steps",
    featTitle: "Platform Features",
    featSub: "Everything in one place",
    feat1t: "Live Market Feed",
    feat1d: "Track 600+ companies, crypto, commodities and currencies in real time",
    feat2t: "GMA Triumvirate Analysis",
    feat2d: "Review institutional-grade signal alignment from the GMA Consensus Engine",
    feat3t: "Historical Charts",
    feat3d: "Historical charts from founding year, crisis analysis and long-term trends",
    feat4t: "Company Comparison",
    feat4d: "Compare up to 5 companies with AI and review consensus alignment with a clearer risk frame",
    feat5t: "Smart Alerts",
    feat5d: "Set price target alerts, get instant notifications on rises and falls",
    feat6t: "80 Languages",
    feat6d: "Platform experience in 80 languages including Turkish, English, Russian, Arabic",
    ctaTitle: "Upgrade Decision Clarity to Institutional Grade",
    ctaSub: "Analyze global markets at a professional level with plans starting from $2.99/day.",
    ctaBtn1: "Choose Plan →",
    ctaBtn2: "Explore First",
    ctaFree: "Start Free",
    ctaFreeSub: "Explore markets without signing in.",
    sector: "Sector",
    sectors: "SECTOR",
    allSectors: "ALL",
    gainers: "GAINERS",
    losers: "LOSERS",
    live: "LIVE",
    autoRefresh: "AUTO-REFRESH",
    loadMore: "LOAD MORE",
    allShown: "ALL ORGANIZATIONS SHOWN",
    compare: "COMPARE",
    analyzeAI: "AI ANALYZE",
    clear: "Clear",
    accountMgmt: "Account Management",
    profileInfo: "PROFILE INFORMATION",
    accountOps: "ACCOUNT OPERATIONS",
    apiKeyLabel: "GMA PLATFORM ACCESS KEY",
    backToMarkets: "Back to Markets",
    editProfile: "EDIT",
    saveProfile: "SAVE PROFILE",
    cancel: "CANCEL",
    myPlan: "My Active Plan",
    credits: "Credits",
    upgrade: "Upgrade Plan",
    contactTitle: "Get in Touch",
    contactSub: "We are here for any questions and feedback.",
    contactInfo: "Contact Information",
    formName: "FULL NAME",
    formEmail: "EMAIL",
    formSubject: "SUBJECT",
    formMsg: "MESSAGE",
    formSend: "SEND",
    formSending: "SENDING...",
    formSent: "Your message has been sent!",
    aboutTitle: "About Global Market Analytics",
    aboutSub: "A financial intelligence platform delivering structured analysis, clarity and decision support across global markets.",
    aboutMission: "Our Mission",
    aboutMissionText: "To build financial decision infrastructure that reduces uncertainty through structured analysis without crossing into investment advice.",
    aboutVision: "Our Vision",
    aboutVisionText: "A world where clearer understanding, lower uncertainty and stronger decision discipline are accessible across global markets.",
    legalNotice: "This platform does not provide investment advice. GMA delivers AI-supported analytical insights for informational purposes only. Final investment decisions remain entirely the responsibility of the investor.",
    footerDesc: "A financial intelligence platform built to deliver clarity across global markets.",
    copyright: "All rights reserved.",
    email: "EMAIL",
    password: "PASSWORD",
    fullname: "FULL NAME",
    city: "CITY",
    phone: "PHONE",
    bio: "BIO",
    socialMedia: "SOCIAL MEDIA",
    send: "SEND",
    processing: "PROCESSING...",
    or: "OR WITH EMAIL",
    pricingTitle: "AI Power for Global Investment",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    selectPlan: "Select Plan →",
    freePlan: "Start Free",
    aiPartners: "Integrated AI Partners",
    pricingNote: "One subscription unlocks the GMA Consensus Engine. GPT, Claude and Gemini operate as supporting engines, while GMA remains the analytical layer.",
    paySuccess: "Access Activated",
    payKey: "Your Platform Access Key",
    payKeyNote: "This key is linked to your account. Do not share with anyone.",
    payContinue: "Go to Markets →",
    termsNav: "TERMS",
    refundNav: "REFUND",
    aboutCardPlatformT: "Platform",
    aboutCardPlatformB: "Global Market Analytics is a financial information platform built to deliver stock data, IPO status, and market metrics for 600+ global organizations in a single interface.",
    aboutCardAIT: "AI Integration",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analysis, risk framing and strategic outlooks. All outputs are informational only and do not constitute investment advice.",
    aboutCardDataT: "Historical Data",
    aboutCardDataB: "Historical chart indices spanning from 1900 for Gold, from 1930 for major currencies, and from the earliest recorded dates for other commodities up to 2026.",
    aboutCardSourcesT: "Data Sources",
    aboutCardSourcesB: "Live data is provided via Finnhub API. Forex rates are sourced from open.er-api.com. No external proxies are used.",
    aboutCardPrivacyT: "Privacy",
    aboutCardPrivacyB: "User data is never sent to external servers. All preferences, API keys, and portfolio information are stored exclusively in your browser local storage."
  },
  en: {
    home: "HOME",
    markets: "MARKETS",
    about: "ABOUT",
    contact: "CONTACT",
    privacy: "PRIVACY",
    pricing: "PRICING",
    login: "SIGN IN",
    register: "SIGN UP",
    logout: "SIGN OUT",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your free account",
    viewMarkets: "VIEW MARKETS",
    loginRegister: "SIGN IN / SIGN UP",
    googleContinue: "Continue with Google",
    heroTitle: "See Global Markets\nwith Greater Clarity",
    heroSub: "600+ global organizations, real-time market data, and structured intelligence via the GMA Consensus Engine.",
    heroBtn1: "VIEW MARKETS",
    heroBtn2: "SEE PRICING",
    heroBtn3: "SIGN UP",
    heroSubtitle: "Reduce uncertainty with structured analysis and clearer decision framing.",
    step1t: "Sign Up",
    step1d: "Create an account in 30 seconds with email or Google",
    step2t: "Choose Plan",
    step2d: "Select from plans starting at $2.99/day",
    step3t: "Analyze",
    step3d: "Strategic clarity via the GMA Consensus Engine",
    step4t: "Decide",
    step4d: "Build your own decision framework with reliable data and analytical clarity",
    howTitle: "How It Works",
    howSub: "Global Investment in 4 Steps",
    featTitle: "Platform Features",
    featSub: "Everything in one place",
    feat1t: "Live Market Feed",
    feat1d: "Track 600+ companies, crypto, commodities and currencies in real time",
    feat2t: "GMA Triumvirate Analysis",
    feat2d: "Review institutional-grade signal alignment from the GMA Consensus Engine",
    feat3t: "Historical Charts",
    feat3d: "Historical charts from founding year, crisis analysis and long-term trends",
    feat4t: "Company Comparison",
    feat4d: "Compare up to 5 companies with AI and review consensus alignment with a clearer risk frame",
    feat5t: "Smart Alerts",
    feat5d: "Set price target alerts, get instant notifications on rises and falls",
    feat6t: "80 Languages",
    feat6d: "Platform experience in 80 languages including Turkish, English, Russian, Arabic",
    ctaTitle: "Upgrade Decision Clarity to Institutional Grade",
    ctaSub: "Analyze global markets at a professional level with plans starting from $2.99/day.",
    ctaBtn1: "Choose Plan →",
    ctaBtn2: "Explore First",
    ctaFree: "Start Free",
    ctaFreeSub: "Explore markets without signing in.",
    sector: "Sector",
    sectors: "SECTOR",
    allSectors: "ALL",
    gainers: "GAINERS",
    losers: "LOSERS",
    live: "LIVE",
    autoRefresh: "AUTO-REFRESH",
    loadMore: "LOAD MORE",
    allShown: "ALL ORGANIZATIONS SHOWN",
    compare: "COMPARE",
    analyzeAI: "AI ANALYZE",
    clear: "Clear",
    accountMgmt: "Account Management",
    profileInfo: "PROFILE INFORMATION",
    accountOps: "ACCOUNT OPERATIONS",
    apiKeyLabel: "GMA PLATFORM ACCESS KEY",
    backToMarkets: "Back to Markets",
    editProfile: "EDIT",
    saveProfile: "SAVE PROFILE",
    cancel: "CANCEL",
    myPlan: "My Active Plan",
    credits: "Credits",
    upgrade: "Upgrade Plan",
    contactTitle: "Get in Touch",
    contactSub: "We are here for any questions and feedback.",
    contactInfo: "Contact Information",
    formName: "FULL NAME",
    formEmail: "EMAIL",
    formSubject: "SUBJECT",
    formMsg: "MESSAGE",
    formSend: "SEND",
    formSending: "SENDING...",
    formSent: "Your message has been sent!",
    aboutTitle: "About Global Market Analytics",
    aboutSub: "A financial intelligence platform delivering structured analysis, clarity and decision support across global markets.",
    aboutMission: "Our Mission",
    aboutMissionText: "To build financial decision infrastructure that reduces uncertainty through structured analysis without crossing into investment advice.",
    aboutVision: "Our Vision",
    aboutVisionText: "A world where clearer understanding, lower uncertainty and stronger decision discipline are accessible across global markets.",
    legalNotice: "This platform does not provide investment advice. GMA delivers AI-supported analytical insights for informational purposes only. Final investment decisions remain entirely the responsibility of the investor.",
    footerDesc: "A financial intelligence platform built to deliver clarity across global markets.",
    copyright: "All rights reserved.",
    email: "EMAIL",
    password: "PASSWORD",
    fullname: "FULL NAME",
    city: "CITY",
    phone: "PHONE",
    bio: "BIO",
    socialMedia: "SOCIAL MEDIA",
    send: "SEND",
    processing: "PROCESSING...",
    or: "OR WITH EMAIL",
    pricingTitle: "AI Power for Global Investment",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    selectPlan: "Select Plan →",
    freePlan: "Start Free",
    aiPartners: "Integrated AI Partners",
    pricingNote: "One subscription unlocks the GMA Consensus Engine. GPT, Claude and Gemini operate as supporting engines, while GMA remains the analytical layer.",
    paySuccess: "Access Activated",
    payKey: "Your Platform Access Key",
    payKeyNote: "This key is linked to your account. Do not share with anyone.",
    payContinue: "Go to Markets →",
    termsNav: "TERMS",
    refundNav: "REFUND",
    aboutCardPlatformT: "Platform",
    aboutCardPlatformB: "Global Market Analytics is a financial information platform built to deliver stock data, IPO status, and market metrics for 600+ global organizations in a single interface.",
    aboutCardAIT: "AI Integration",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analysis, risk framing and strategic outlooks. All outputs are informational only and do not constitute investment advice.",
    aboutCardDataT: "Historical Data",
    aboutCardDataB: "Historical chart indices spanning from 1900 for Gold, from 1930 for major currencies, and from the earliest recorded dates for other commodities up to 2026.",
    aboutCardSourcesT: "Data Sources",
    aboutCardSourcesB: "Live data is provided via Finnhub API. Forex rates are sourced from open.er-api.com. No external proxies are used.",
    aboutCardPrivacyT: "Privacy",
    aboutCardPrivacyB: "User data is never sent to external servers. All preferences, API keys, and portfolio information are stored exclusively in your browser local storage."
  },
  ru: {
    home: "HOME",
    markets: "MARKETS",
    about: "ABOUT",
    contact: "CONTACT",
    privacy: "PRIVACY",
    pricing: "PRICING",
    login: "SIGN IN",
    register: "SIGN UP",
    logout: "SIGN OUT",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your free account",
    viewMarkets: "VIEW MARKETS",
    loginRegister: "SIGN IN / SIGN UP",
    googleContinue: "Continue with Google",
    heroTitle: "See Global Markets\nwith Greater Clarity",
    heroSub: "600+ global organizations, real-time market data, and structured intelligence via the GMA Consensus Engine.",
    heroBtn1: "VIEW MARKETS",
    heroBtn2: "SEE PRICING",
    heroBtn3: "SIGN UP",
    heroSubtitle: "Reduce uncertainty with structured analysis and clearer decision framing.",
    step1t: "Sign Up",
    step1d: "Create an account in 30 seconds with email or Google",
    step2t: "Choose Plan",
    step2d: "Select from plans starting at $2.99/day",
    step3t: "Analyze",
    step3d: "Strategic clarity via the GMA Consensus Engine",
    step4t: "Decide",
    step4d: "Build your own decision framework with reliable data and analytical clarity",
    howTitle: "How It Works",
    howSub: "Global Investment in 4 Steps",
    featTitle: "Platform Features",
    featSub: "Everything in one place",
    feat1t: "Live Market Feed",
    feat1d: "Track 600+ companies, crypto, commodities and currencies in real time",
    feat2t: "GMA Triumvirate Analysis",
    feat2d: "Review institutional-grade signal alignment from the GMA Consensus Engine",
    feat3t: "Historical Charts",
    feat3d: "Historical charts from founding year, crisis analysis and long-term trends",
    feat4t: "Company Comparison",
    feat4d: "Compare up to 5 companies with AI and review consensus alignment with a clearer risk frame",
    feat5t: "Smart Alerts",
    feat5d: "Set price target alerts, get instant notifications on rises and falls",
    feat6t: "80 Languages",
    feat6d: "Platform experience in 80 languages including Turkish, English, Russian, Arabic",
    ctaTitle: "Upgrade Decision Clarity to Institutional Grade",
    ctaSub: "Analyze global markets at a professional level with plans starting from $2.99/day.",
    ctaBtn1: "Choose Plan →",
    ctaBtn2: "Explore First",
    ctaFree: "Start Free",
    ctaFreeSub: "Explore markets without signing in.",
    sector: "Sector",
    sectors: "SECTOR",
    allSectors: "ALL",
    gainers: "GAINERS",
    losers: "LOSERS",
    live: "LIVE",
    autoRefresh: "AUTO-REFRESH",
    loadMore: "LOAD MORE",
    allShown: "ALL ORGANIZATIONS SHOWN",
    compare: "COMPARE",
    analyzeAI: "AI ANALYZE",
    clear: "Clear",
    accountMgmt: "Account Management",
    profileInfo: "PROFILE INFORMATION",
    accountOps: "ACCOUNT OPERATIONS",
    apiKeyLabel: "GMA PLATFORM ACCESS KEY",
    backToMarkets: "Back to Markets",
    editProfile: "EDIT",
    saveProfile: "SAVE PROFILE",
    cancel: "CANCEL",
    myPlan: "My Active Plan",
    credits: "Credits",
    upgrade: "Upgrade Plan",
    contactTitle: "Get in Touch",
    contactSub: "We are here for any questions and feedback.",
    contactInfo: "Contact Information",
    formName: "FULL NAME",
    formEmail: "EMAIL",
    formSubject: "SUBJECT",
    formMsg: "MESSAGE",
    formSend: "SEND",
    formSending: "SENDING...",
    formSent: "Your message has been sent!",
    aboutTitle: "About Global Market Analytics",
    aboutSub: "A financial intelligence platform delivering structured analysis, clarity and decision support across global markets.",
    aboutMission: "Our Mission",
    aboutMissionText: "To build financial decision infrastructure that reduces uncertainty through structured analysis without crossing into investment advice.",
    aboutVision: "Our Vision",
    aboutVisionText: "A world where clearer understanding, lower uncertainty and stronger decision discipline are accessible across global markets.",
    legalNotice: "This platform does not provide investment advice. GMA delivers AI-supported analytical insights for informational purposes only. Final investment decisions remain entirely the responsibility of the investor.",
    footerDesc: "A financial intelligence platform built to deliver clarity across global markets.",
    copyright: "All rights reserved.",
    email: "EMAIL",
    password: "PASSWORD",
    fullname: "FULL NAME",
    city: "CITY",
    phone: "PHONE",
    bio: "BIO",
    socialMedia: "SOCIAL MEDIA",
    send: "SEND",
    processing: "PROCESSING...",
    or: "OR WITH EMAIL",
    pricingTitle: "AI Power for Global Investment",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    selectPlan: "Select Plan →",
    freePlan: "Start Free",
    aiPartners: "Integrated AI Partners",
    pricingNote: "One subscription unlocks the GMA Consensus Engine. GPT, Claude and Gemini operate as supporting engines, while GMA remains the analytical layer.",
    paySuccess: "Access Activated",
    payKey: "Your Platform Access Key",
    payKeyNote: "This key is linked to your account. Do not share with anyone.",
    payContinue: "Go to Markets →",
    termsNav: "TERMS",
    refundNav: "REFUND",
    aboutCardPlatformT: "Platform",
    aboutCardPlatformB: "Global Market Analytics is a financial information platform built to deliver stock data, IPO status, and market metrics for 600+ global organizations in a single interface.",
    aboutCardAIT: "AI Integration",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analysis, risk framing and strategic outlooks. All outputs are informational only and do not constitute investment advice.",
    aboutCardDataT: "Historical Data",
    aboutCardDataB: "Historical chart indices spanning from 1900 for Gold, from 1930 for major currencies, and from the earliest recorded dates for other commodities up to 2026.",
    aboutCardSourcesT: "Data Sources",
    aboutCardSourcesB: "Live data is provided via Finnhub API. Forex rates are sourced from open.er-api.com. No external proxies are used.",
    aboutCardPrivacyT: "Privacy",
    aboutCardPrivacyB: "User data is never sent to external servers. All preferences, API keys, and portfolio information are stored exclusively in your browser local storage."
  },
  es: {
    home: "HOME",
    markets: "MARKETS",
    about: "ABOUT",
    contact: "CONTACT",
    privacy: "PRIVACY",
    pricing: "PRICING",
    login: "SIGN IN",
    register: "SIGN UP",
    logout: "SIGN OUT",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your free account",
    viewMarkets: "VIEW MARKETS",
    loginRegister: "SIGN IN / SIGN UP",
    googleContinue: "Continue with Google",
    heroTitle: "See Global Markets\nwith Greater Clarity",
    heroSub: "600+ global organizations, real-time market data, and structured intelligence via the GMA Consensus Engine.",
    heroBtn1: "VIEW MARKETS",
    heroBtn2: "SEE PRICING",
    heroBtn3: "SIGN UP",
    heroSubtitle: "Reduce uncertainty with structured analysis and clearer decision framing.",
    step1t: "Sign Up",
    step1d: "Create an account in 30 seconds with email or Google",
    step2t: "Choose Plan",
    step2d: "Select from plans starting at $2.99/day",
    step3t: "Analyze",
    step3d: "Strategic clarity via the GMA Consensus Engine",
    step4t: "Decide",
    step4d: "Build your own decision framework with reliable data and analytical clarity",
    howTitle: "How It Works",
    howSub: "Global Investment in 4 Steps",
    featTitle: "Platform Features",
    featSub: "Everything in one place",
    feat1t: "Live Market Feed",
    feat1d: "Track 600+ companies, crypto, commodities and currencies in real time",
    feat2t: "GMA Triumvirate Analysis",
    feat2d: "Review institutional-grade signal alignment from the GMA Consensus Engine",
    feat3t: "Historical Charts",
    feat3d: "Historical charts from founding year, crisis analysis and long-term trends",
    feat4t: "Company Comparison",
    feat4d: "Compare up to 5 companies with AI and review consensus alignment with a clearer risk frame",
    feat5t: "Smart Alerts",
    feat5d: "Set price target alerts, get instant notifications on rises and falls",
    feat6t: "80 Languages",
    feat6d: "Platform experience in 80 languages including Turkish, English, Russian, Arabic",
    ctaTitle: "Upgrade Decision Clarity to Institutional Grade",
    ctaSub: "Analyze global markets at a professional level with plans starting from $2.99/day.",
    ctaBtn1: "Choose Plan →",
    ctaBtn2: "Explore First",
    ctaFree: "Start Free",
    ctaFreeSub: "Explore markets without signing in.",
    sector: "Sector",
    sectors: "SECTOR",
    allSectors: "ALL",
    gainers: "GAINERS",
    losers: "LOSERS",
    live: "LIVE",
    autoRefresh: "AUTO-REFRESH",
    loadMore: "LOAD MORE",
    allShown: "ALL ORGANIZATIONS SHOWN",
    compare: "COMPARE",
    analyzeAI: "AI ANALYZE",
    clear: "Clear",
    accountMgmt: "Account Management",
    profileInfo: "PROFILE INFORMATION",
    accountOps: "ACCOUNT OPERATIONS",
    apiKeyLabel: "GMA PLATFORM ACCESS KEY",
    backToMarkets: "Back to Markets",
    editProfile: "EDIT",
    saveProfile: "SAVE PROFILE",
    cancel: "CANCEL",
    myPlan: "My Active Plan",
    credits: "Credits",
    upgrade: "Upgrade Plan",
    contactTitle: "Get in Touch",
    contactSub: "We are here for any questions and feedback.",
    contactInfo: "Contact Information",
    formName: "FULL NAME",
    formEmail: "EMAIL",
    formSubject: "SUBJECT",
    formMsg: "MESSAGE",
    formSend: "SEND",
    formSending: "SENDING...",
    formSent: "Your message has been sent!",
    aboutTitle: "About Global Market Analytics",
    aboutSub: "A financial intelligence platform delivering structured analysis, clarity and decision support across global markets.",
    aboutMission: "Our Mission",
    aboutMissionText: "To build financial decision infrastructure that reduces uncertainty through structured analysis without crossing into investment advice.",
    aboutVision: "Our Vision",
    aboutVisionText: "A world where clearer understanding, lower uncertainty and stronger decision discipline are accessible across global markets.",
    legalNotice: "This platform does not provide investment advice. GMA delivers AI-supported analytical insights for informational purposes only. Final investment decisions remain entirely the responsibility of the investor.",
    footerDesc: "A financial intelligence platform built to deliver clarity across global markets.",
    copyright: "All rights reserved.",
    email: "EMAIL",
    password: "PASSWORD",
    fullname: "FULL NAME",
    city: "CITY",
    phone: "PHONE",
    bio: "BIO",
    socialMedia: "SOCIAL MEDIA",
    send: "SEND",
    processing: "PROCESSING...",
    or: "OR WITH EMAIL",
    pricingTitle: "AI Power for Global Investment",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    selectPlan: "Select Plan →",
    freePlan: "Start Free",
    aiPartners: "Integrated AI Partners",
    pricingNote: "One subscription unlocks the GMA Consensus Engine. GPT, Claude and Gemini operate as supporting engines, while GMA remains the analytical layer.",
    paySuccess: "Access Activated",
    payKey: "Your Platform Access Key",
    payKeyNote: "This key is linked to your account. Do not share with anyone.",
    payContinue: "Go to Markets →",
    termsNav: "TERMS",
    refundNav: "REFUND",
    aboutCardPlatformT: "Platform",
    aboutCardPlatformB: "Global Market Analytics is a financial information platform built to deliver stock data, IPO status, and market metrics for 600+ global organizations in a single interface.",
    aboutCardAIT: "AI Integration",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analysis, risk framing and strategic outlooks. All outputs are informational only and do not constitute investment advice.",
    aboutCardDataT: "Historical Data",
    aboutCardDataB: "Historical chart indices spanning from 1900 for Gold, from 1930 for major currencies, and from the earliest recorded dates for other commodities up to 2026.",
    aboutCardSourcesT: "Data Sources",
    aboutCardSourcesB: "Live data is provided via Finnhub API. Forex rates are sourced from open.er-api.com. No external proxies are used.",
    aboutCardPrivacyT: "Privacy",
    aboutCardPrivacyB: "User data is never sent to external servers. All preferences, API keys, and portfolio information are stored exclusively in your browser local storage."
  },
  fr: {
    home: "HOME",
    markets: "MARKETS",
    about: "ABOUT",
    contact: "CONTACT",
    privacy: "PRIVACY",
    pricing: "PRICING",
    login: "SIGN IN",
    register: "SIGN UP",
    logout: "SIGN OUT",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your free account",
    viewMarkets: "VIEW MARKETS",
    loginRegister: "SIGN IN / SIGN UP",
    googleContinue: "Continue with Google",
    heroTitle: "See Global Markets\nwith Greater Clarity",
    heroSub: "600+ global organizations, real-time market data, and structured intelligence via the GMA Consensus Engine.",
    heroBtn1: "VIEW MARKETS",
    heroBtn2: "SEE PRICING",
    heroBtn3: "SIGN UP",
    heroSubtitle: "Reduce uncertainty with structured analysis and clearer decision framing.",
    step1t: "Sign Up",
    step1d: "Create an account in 30 seconds with email or Google",
    step2t: "Choose Plan",
    step2d: "Select from plans starting at $2.99/day",
    step3t: "Analyze",
    step3d: "Strategic clarity via the GMA Consensus Engine",
    step4t: "Decide",
    step4d: "Build your own decision framework with reliable data and analytical clarity",
    howTitle: "How It Works",
    howSub: "Global Investment in 4 Steps",
    featTitle: "Platform Features",
    featSub: "Everything in one place",
    feat1t: "Live Market Feed",
    feat1d: "Track 600+ companies, crypto, commodities and currencies in real time",
    feat2t: "GMA Triumvirate Analysis",
    feat2d: "Review institutional-grade signal alignment from the GMA Consensus Engine",
    feat3t: "Historical Charts",
    feat3d: "Historical charts from founding year, crisis analysis and long-term trends",
    feat4t: "Company Comparison",
    feat4d: "Compare up to 5 companies with AI and review consensus alignment with a clearer risk frame",
    feat5t: "Smart Alerts",
    feat5d: "Set price target alerts, get instant notifications on rises and falls",
    feat6t: "80 Languages",
    feat6d: "Platform experience in 80 languages including Turkish, English, Russian, Arabic",
    ctaTitle: "Upgrade Decision Clarity to Institutional Grade",
    ctaSub: "Analyze global markets at a professional level with plans starting from $2.99/day.",
    ctaBtn1: "Choose Plan →",
    ctaBtn2: "Explore First",
    ctaFree: "Start Free",
    ctaFreeSub: "Explore markets without signing in.",
    sector: "Sector",
    sectors: "SECTOR",
    allSectors: "ALL",
    gainers: "GAINERS",
    losers: "LOSERS",
    live: "LIVE",
    autoRefresh: "AUTO-REFRESH",
    loadMore: "LOAD MORE",
    allShown: "ALL ORGANIZATIONS SHOWN",
    compare: "COMPARE",
    analyzeAI: "AI ANALYZE",
    clear: "Clear",
    accountMgmt: "Account Management",
    profileInfo: "PROFILE INFORMATION",
    accountOps: "ACCOUNT OPERATIONS",
    apiKeyLabel: "GMA PLATFORM ACCESS KEY",
    backToMarkets: "Back to Markets",
    editProfile: "EDIT",
    saveProfile: "SAVE PROFILE",
    cancel: "CANCEL",
    myPlan: "My Active Plan",
    credits: "Credits",
    upgrade: "Upgrade Plan",
    contactTitle: "Get in Touch",
    contactSub: "We are here for any questions and feedback.",
    contactInfo: "Contact Information",
    formName: "FULL NAME",
    formEmail: "EMAIL",
    formSubject: "SUBJECT",
    formMsg: "MESSAGE",
    formSend: "SEND",
    formSending: "SENDING...",
    formSent: "Your message has been sent!",
    aboutTitle: "About Global Market Analytics",
    aboutSub: "A financial intelligence platform delivering structured analysis, clarity and decision support across global markets.",
    aboutMission: "Our Mission",
    aboutMissionText: "To build financial decision infrastructure that reduces uncertainty through structured analysis without crossing into investment advice.",
    aboutVision: "Our Vision",
    aboutVisionText: "A world where clearer understanding, lower uncertainty and stronger decision discipline are accessible across global markets.",
    legalNotice: "This platform does not provide investment advice. GMA delivers AI-supported analytical insights for informational purposes only. Final investment decisions remain entirely the responsibility of the investor.",
    footerDesc: "A financial intelligence platform built to deliver clarity across global markets.",
    copyright: "All rights reserved.",
    email: "EMAIL",
    password: "PASSWORD",
    fullname: "FULL NAME",
    city: "CITY",
    phone: "PHONE",
    bio: "BIO",
    socialMedia: "SOCIAL MEDIA",
    send: "SEND",
    processing: "PROCESSING...",
    or: "OR WITH EMAIL",
    pricingTitle: "AI Power for Global Investment",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    selectPlan: "Select Plan →",
    freePlan: "Start Free",
    aiPartners: "Integrated AI Partners",
    pricingNote: "One subscription unlocks the GMA Consensus Engine. GPT, Claude and Gemini operate as supporting engines, while GMA remains the analytical layer.",
    paySuccess: "Access Activated",
    payKey: "Your Platform Access Key",
    payKeyNote: "This key is linked to your account. Do not share with anyone.",
    payContinue: "Go to Markets →",
    termsNav: "TERMS",
    refundNav: "REFUND",
    aboutCardPlatformT: "Platform",
    aboutCardPlatformB: "Global Market Analytics is a financial information platform built to deliver stock data, IPO status, and market metrics for 600+ global organizations in a single interface.",
    aboutCardAIT: "AI Integration",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analysis, risk framing and strategic outlooks. All outputs are informational only and do not constitute investment advice.",
    aboutCardDataT: "Historical Data",
    aboutCardDataB: "Historical chart indices spanning from 1900 for Gold, from 1930 for major currencies, and from the earliest recorded dates for other commodities up to 2026.",
    aboutCardSourcesT: "Data Sources",
    aboutCardSourcesB: "Live data is provided via Finnhub API. Forex rates are sourced from open.er-api.com. No external proxies are used.",
    aboutCardPrivacyT: "Privacy",
    aboutCardPrivacyB: "User data is never sent to external servers. All preferences, API keys, and portfolio information are stored exclusively in your browser local storage."
  },
  de: {
    home: "HOME",
    markets: "MARKETS",
    about: "ABOUT",
    contact: "CONTACT",
    privacy: "PRIVACY",
    pricing: "PRICING",
    login: "SIGN IN",
    register: "SIGN UP",
    logout: "SIGN OUT",
    loginTitle: "Sign in to your account",
    registerTitle: "Create your free account",
    viewMarkets: "VIEW MARKETS",
    loginRegister: "SIGN IN / SIGN UP",
    googleContinue: "Continue with Google",
    heroTitle: "See Global Markets\nwith Greater Clarity",
    heroSub: "600+ global organizations, real-time market data, and structured intelligence via the GMA Consensus Engine.",
    heroBtn1: "VIEW MARKETS",
    heroBtn2: "SEE PRICING",
    heroBtn3: "SIGN UP",
    heroSubtitle: "Reduce uncertainty with structured analysis and clearer decision framing.",
    step1t: "Sign Up",
    step1d: "Create an account in 30 seconds with email or Google",
    step2t: "Choose Plan",
    step2d: "Select from plans starting at $2.99/day",
    step3t: "Analyze",
    step3d: "Strategic clarity via the GMA Consensus Engine",
    step4t: "Decide",
    step4d: "Build your own decision framework with reliable data and analytical clarity",
    howTitle: "How It Works",
    howSub: "Global Investment in 4 Steps",
    featTitle: "Platform Features",
    featSub: "Everything in one place",
    feat1t: "Live Market Feed",
    feat1d: "Track 600+ companies, crypto, commodities and currencies in real time",
    feat2t: "GMA Triumvirate Analysis",
    feat2d: "Review institutional-grade signal alignment from the GMA Consensus Engine",
    feat3t: "Historical Charts",
    feat3d: "Historical charts from founding year, crisis analysis and long-term trends",
    feat4t: "Company Comparison",
    feat4d: "Compare up to 5 companies with AI and review consensus alignment with a clearer risk frame",
    feat5t: "Smart Alerts",
    feat5d: "Set price target alerts, get instant notifications on rises and falls",
    feat6t: "80 Languages",
    feat6d: "Platform experience in 80 languages including Turkish, English, Russian, Arabic",
    ctaTitle: "Upgrade Decision Clarity to Institutional Grade",
    ctaSub: "Analyze global markets at a professional level with plans starting from $2.99/day.",
    ctaBtn1: "Choose Plan →",
    ctaBtn2: "Explore First",
    ctaFree: "Start Free",
    ctaFreeSub: "Explore markets without signing in.",
    sector: "Sector",
    sectors: "SECTOR",
    allSectors: "ALL",
    gainers: "GAINERS",
    losers: "LOSERS",
    live: "LIVE",
    autoRefresh: "AUTO-REFRESH",
    loadMore: "LOAD MORE",
    allShown: "ALL ORGANIZATIONS SHOWN",
    compare: "COMPARE",
    analyzeAI: "AI ANALYZE",
    clear: "Clear",
    accountMgmt: "Account Management",
    profileInfo: "PROFILE INFORMATION",
    accountOps: "ACCOUNT OPERATIONS",
    apiKeyLabel: "GMA PLATFORM ACCESS KEY",
    backToMarkets: "Back to Markets",
    editProfile: "EDIT",
    saveProfile: "SAVE PROFILE",
    cancel: "CANCEL",
    myPlan: "My Active Plan",
    credits: "Credits",
    upgrade: "Upgrade Plan",
    contactTitle: "Get in Touch",
    contactSub: "We are here for any questions and feedback.",
    contactInfo: "Contact Information",
    formName: "FULL NAME",
    formEmail: "EMAIL",
    formSubject: "SUBJECT",
    formMsg: "MESSAGE",
    formSend: "SEND",
    formSending: "SENDING...",
    formSent: "Your message has been sent!",
    aboutTitle: "About Global Market Analytics",
    aboutSub: "A financial intelligence platform delivering structured analysis, clarity and decision support across global markets.",
    aboutMission: "Our Mission",
    aboutMissionText: "To build financial decision infrastructure that reduces uncertainty through structured analysis without crossing into investment advice.",
    aboutVision: "Our Vision",
    aboutVisionText: "A world where clearer understanding, lower uncertainty and stronger decision discipline are accessible across global markets.",
    legalNotice: "This platform does not provide investment advice. GMA delivers AI-supported analytical insights for informational purposes only. Final investment decisions remain entirely the responsibility of the investor.",
    footerDesc: "A financial intelligence platform built to deliver clarity across global markets.",
    copyright: "All rights reserved.",
    email: "EMAIL",
    password: "PASSWORD",
    fullname: "FULL NAME",
    city: "CITY",
    phone: "PHONE",
    bio: "BIO",
    socialMedia: "SOCIAL MEDIA",
    send: "SEND",
    processing: "PROCESSING...",
    or: "OR WITH EMAIL",
    pricingTitle: "AI Power for Global Investment",
    pricingSub: "Access the GMA Consensus Engine through one institutional-grade subscription.",
    selectPlan: "Select Plan →",
    freePlan: "Start Free",
    aiPartners: "Integrated AI Partners",
    pricingNote: "One subscription unlocks the GMA Consensus Engine. GPT, Claude and Gemini operate as supporting engines, while GMA remains the analytical layer.",
    paySuccess: "Access Activated",
    payKey: "Your Platform Access Key",
    payKeyNote: "This key is linked to your account. Do not share with anyone.",
    payContinue: "Go to Markets →",
    termsNav: "TERMS",
    refundNav: "REFUND",
    aboutCardPlatformT: "Platform",
    aboutCardPlatformB: "Global Market Analytics is a financial information platform built to deliver stock data, IPO status, and market metrics for 600+ global organizations in a single interface.",
    aboutCardAIT: "AI Integration",
    aboutCardAIB: "Powered by the GMA Consensus Engine, the platform delivers structured company analysis, risk framing and strategic outlooks. All outputs are informational only and do not constitute investment advice.",
    aboutCardDataT: "Historical Data",
    aboutCardDataB: "Historical chart indices spanning from 1900 for Gold, from 1930 for major currencies, and from the earliest recorded dates for other commodities up to 2026.",
    aboutCardSourcesT: "Data Sources",
    aboutCardSourcesB: "Live data is provided via Finnhub API. Forex rates are sourced from open.er-api.com. No external proxies are used.",
    aboutCardPrivacyT: "Privacy",
    aboutCardPrivacyB: "User data is never sent to external servers. All preferences, API keys, and portfolio information are stored exclusively in your browser local storage."
  }
};

// ── Fallback: eksik keyler Ingilizce doner ──
const EN = T.en;
const GMA_I18N_OVERRIDES = {
  en: { feat6t: "8 Languages", feat6d: "A carefully localized platform experience in English, Turkish, Russian, Arabic, Chinese, Hindi, German and Spanish" },
  tr: {
    home: "ANA SAYFA", markets: "PIYASALAR", about: "HAKKINDA", contact: "ILETISIM", privacy: "GIZLILIK", pricing: "FIYATLAR", login: "GIRIS YAP", register: "KAYIT OL", logout: "CIKIS YAP",
    loginTitle: "Hesabiniza giris yapin", registerTitle: "Ucretsiz hesabinizi olusturun", viewMarkets: "PIYASALARI GOR", loginRegister: "GIRIS / KAYIT", googleContinue: "Google ile devam et",
    heroTitle: "Kuresel Piyasalari\nDaha Net Gorun", heroSub: "600+ kuresel kurulus, gercek zamanli piyasa verisi ve GMA Consensus Engine ile yapilandirilmis finansal zeka.", heroSubtitle: "Yapilandirilmis analiz ve daha net karar cercevesiyle belirsizligi azaltin.",
    howTitle: "Nasil Calisir", featTitle: "Platform Ozellikleri", featSub: "Her sey tek yerde", feat6t: "8 Dil", feat6d: "Ingilizce, Turkce, Rusca, Arapca, Cince, Hintce, Almanca ve Ispanyolca icin ozenle yerellestirilmis deneyim",
    sector: "Sektor", allSectors: "TUMU", gainers: "YUKSELENLER", losers: "DUSENLER", live: "CANLI", loadMore: "DAHA FAZLA YUKLE", compare: "KARSILASTIR", analyzeAI: "AI ANALIZ", contactTitle: "Bize Ulasin",
    legalNotice: "Bu platform yatirim tavsiyesi vermez. GMA, yalnizca bilgilendirme amaciyla AI destekli analitik icgoruler sunar.", footerDesc: "Kuresel piyasalarda netlik saglamak icin tasarlanmis finansal zeka platformu.", pricingTitle: "Kuresel Yatirim Icin AI Gucu"
  },
  ru: { home: "ГЛАВНАЯ", markets: "РЫНКИ", about: "О ПРОЕКТЕ", contact: "КОНТАКТЫ", privacy: "КОНФИДЕНЦИАЛЬНОСТЬ", pricing: "ТАРИФЫ", login: "ВОЙТИ", heroTitle: "Смотрите на глобальные рынки\nс большей ясностью", heroSub: "600+ глобальных организаций, данные рынка в реальном времени и структурированная аналитика через GMA Consensus Engine.", feat6t: "8 языков", feat6d: "Интерфейс на английском, турецком, русском, арабском, китайском, хинди, немецком и испанском", compare: "СРАВНИТЬ", analyzeAI: "AI-АНАЛИЗ", legalNotice: "Эта платформа не предоставляет инвестиционных рекомендаций." },
  ar: { home: "الرئيسية", markets: "الأسواق", about: "حول المنصة", contact: "اتصل بنا", privacy: "الخصوصية", pricing: "الأسعار", login: "تسجيل الدخول", heroTitle: "شاهد الأسواق العالمية\nبوضوح أكبر", heroSub: "أكثر من 600 مؤسسة عالمية، وبيانات سوق فورية، وذكاء منظم عبر GMA Consensus Engine.", feat6t: "8 لغات", feat6d: "تجربة مترجمة بعناية إلى الإنجليزية والتركية والروسية والعربية والصينية والهندية والألمانية والإسبانية", compare: "قارن", analyzeAI: "تحليل AI", legalNotice: "هذه المنصة لا تقدم نصائح استثمارية." },
  zh: { home: "首页", markets: "市场", about: "关于", contact: "联系", privacy: "隐私", pricing: "价格", login: "登录", heroTitle: "以更高的清晰度\n观察全球市场", heroSub: "600+ 家全球机构、实时市场数据，以及由 GMA Consensus Engine 提供的结构化智能。", feat6t: "8 种语言", feat6d: "精心本地化支持英语、土耳其语、俄语、阿拉伯语、中文、印地语、德语和西班牙语", compare: "比较", analyzeAI: "AI 分析", legalNotice: "本平台不提供投资建议。" },
  hi: { home: "होम", markets: "बाज़ार", about: "परिचय", contact: "संपर्क", privacy: "गोपनीयता", pricing: "मूल्य", login: "साइन इन", heroTitle: "वैश्विक बाज़ारों को\nअधिक स्पष्टता से देखें", heroSub: "600+ वैश्विक संगठन, रीयल-टाइम बाज़ार डेटा और GMA Consensus Engine के माध्यम से संरचित इंटेलिजेंस।", feat6t: "8 भाषाएँ", feat6d: "अंग्रेज़ी, तुर्की, रूसी, अरबी, चीनी, हिंदी, जर्मन और स्पेनिश में स्थानीयकृत अनुभव", compare: "तुलना", analyzeAI: "AI विश्लेषण", legalNotice: "यह प्लेटफ़ॉर्म निवेश सलाह नहीं देता।" },
  de: { home: "START", markets: "MARKTE", about: "UBER UNS", contact: "KONTAKT", privacy: "DATENSCHUTZ", pricing: "PREISE", login: "ANMELDEN", heroTitle: "Globale Markte\nmit mehr Klarheit sehen", heroSub: "600+ globale Organisationen, Echtzeit-Marktdaten und strukturierte Intelligenz uber die GMA Consensus Engine.", feat6t: "8 Sprachen", feat6d: "Lokalisierte Plattform auf Englisch, Turkisch, Russisch, Arabisch, Chinesisch, Hindi, Deutsch und Spanisch", compare: "VERGLEICHEN", analyzeAI: "AI-ANALYSE", legalNotice: "Diese Plattform bietet keine Anlageberatung." },
  es: { home: "INICIO", markets: "MERCADOS", about: "ACERCA DE", contact: "CONTACTO", privacy: "PRIVACIDAD", pricing: "PRECIOS", login: "INICIAR SESION", heroTitle: "Vea los mercados globales\ncon mayor claridad", heroSub: "Mas de 600 organizaciones globales, datos de mercado en tiempo real e inteligencia estructurada mediante GMA Consensus Engine.", feat6t: "8 idiomas", feat6d: "Experiencia localizada en ingles, turco, ruso, arabe, chino, hindi, aleman y espanol", compare: "COMPARAR", analyzeAI: "ANALISIS AI", legalNotice: "Esta plataforma no ofrece asesoramiento de inversion." }
};
Object.entries(GMA_I18N_OVERRIDES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_EXTRA_I18N = {
  en: {
    organizationsLabel: "Organizations", sectorsLabel: "Sectors", realTimeLabel: "Real-Time", liveDataLabel: "Live Data", intelligenceLayerLabel: "GMA Intelligence Layer",
    liveMarketsTitle: "Live Markets", liveMarketsDesc: "Track stock, commodity and forex prices in real time", aiAnalysisTitle: "AI Analysis", aiAnalysisDesc: "Get in-depth company and risk analysis with GMA Intelligence Layer", comparisonTitle: "Comparison", comparisonDesc: "AI-assisted side-by-side comparison of up to 5 companies", portfolioTrackingTitle: "Portfolio Tracking", portfolioTrackingDesc: "Record purchases and calculate profit/loss", platformFeaturesLabel: "PLATFORM FEATURES", startFreeTitle: "Start for Free", startFreeDesc: "Explore all market data without signing in.", back: "Back", messagePlaceholder: "Your message...", subjectPlaceholder: "Subject", namePlaceholder: "Your name", paymentSuccessful: "PAYMENT SUCCESSFUL", goToMarkets: "Go to Markets", myProfile: "My Profile", marketDataPlan: "Market Data (600+ Organizations)", gmaStructuredAnalysis: "GMA Structured Analysis", gmaConsensus: "GMA Triumvirate Consensus", monthlyAiAnalyses: "Monthly AI Analyses", alertsWatchlist: "Alerts & Watchlist", portfolioManagement: "Portfolio Management", prioritySupport: "Priority Support", unlimited: "Unlimited"
  },
  tr: {
    organizationsLabel: "Kurulus", sectorsLabel: "Sektor", realTimeLabel: "Gercek Zamanli", liveDataLabel: "Canli Veri", intelligenceLayerLabel: "GMA Zeka Katmani",
    liveMarketsTitle: "Canli Piyasalar", liveMarketsDesc: "Hisse, emtia ve forex fiyatlarini gercek zamanli takip edin", aiAnalysisTitle: "AI Analiz", aiAnalysisDesc: "GMA Zeka Katmani ile derin sirket ve risk analizi alin", comparisonTitle: "Karsilastirma", comparisonDesc: "5 sirkete kadar AI destekli yan yana karsilastirma", portfolioTrackingTitle: "Portfoy Takibi", portfolioTrackingDesc: "Alimlari kaydedin ve kar/zarar hesaplayin", platformFeaturesLabel: "PLATFORM OZELLIKLERI", startFreeTitle: "Ucretsiz Baslayin", startFreeDesc: "Giris yapmadan tum piyasa verilerini kesfedin.", back: "Geri", messagePlaceholder: "Mesajiniz...", subjectPlaceholder: "Konu", namePlaceholder: "Adiniz", paymentSuccessful: "ODEME BASARILI", goToMarkets: "Piyasalara Git", myProfile: "Profilim", marketDataPlan: "Piyasa Verisi (600+ Kurulus)", gmaStructuredAnalysis: "GMA Yapilandirilmis Analiz", gmaConsensus: "GMA Triumvirate Konsensusu", monthlyAiAnalyses: "Aylik AI Analizleri", alertsWatchlist: "Uyarilar ve Izleme Listesi", portfolioManagement: "Portfoy Yonetimi", prioritySupport: "Oncelikli Destek", unlimited: "Sinirsiz"
  },
  ru: {
    organizationsLabel: "Организации", sectorsLabel: "Секторы", realTimeLabel: "Реальное время", liveDataLabel: "Живые данные", intelligenceLayerLabel: "Аналитический слой GMA",
    liveMarketsTitle: "Живые рынки", liveMarketsDesc: "Отслеживайте акции, сырьё и форекс в реальном времени", aiAnalysisTitle: "AI-анализ", aiAnalysisDesc: "Глубокий анализ компаний и рисков с GMA", comparisonTitle: "Сравнение", comparisonDesc: "AI-сравнение до 5 компаний рядом", portfolioTrackingTitle: "Учёт портфеля", portfolioTrackingDesc: "Фиксируйте покупки и считайте прибыль/убыток", platformFeaturesLabel: "ВОЗМОЖНОСТИ ПЛАТФОРМЫ", startFreeTitle: "Начать бесплатно", startFreeDesc: "Изучайте данные рынка без входа.", back: "Назад", messagePlaceholder: "Ваше сообщение...", subjectPlaceholder: "Тема", namePlaceholder: "Ваше имя", paymentSuccessful: "ОПЛАТА УСПЕШНА", goToMarkets: "К рынкам", myProfile: "Мой профиль", marketDataPlan: "Данные рынка (600+ организаций)", gmaStructuredAnalysis: "Структурированный анализ GMA", gmaConsensus: "Консенсус GMA Triumvirate", monthlyAiAnalyses: "Ежемесячные AI-анализы", alertsWatchlist: "Уведомления и список наблюдения", portfolioManagement: "Управление портфелем", prioritySupport: "Приоритетная поддержка", unlimited: "Без лимита"
  },
  ar: {
    organizationsLabel: "المؤسسات", sectorsLabel: "القطاعات", realTimeLabel: "فوري", liveDataLabel: "بيانات مباشرة", intelligenceLayerLabel: "طبقة ذكاء GMA",
    liveMarketsTitle: "أسواق مباشرة", liveMarketsDesc: "تابع الأسهم والسلع والعملات في الوقت الحقيقي", aiAnalysisTitle: "تحليل AI", aiAnalysisDesc: "احصل على تحليل عميق للشركات والمخاطر عبر GMA", comparisonTitle: "مقارنة", comparisonDesc: "مقارنة جانبية مدعومة بالذكاء الاصطناعي لما يصل إلى 5 شركات", portfolioTrackingTitle: "تتبع المحفظة", portfolioTrackingDesc: "سجل عمليات الشراء واحسب الربح والخسارة", platformFeaturesLabel: "ميزات المنصة", startFreeTitle: "ابدأ مجانًا", startFreeDesc: "استكشف جميع بيانات السوق دون تسجيل الدخول.", back: "رجوع", messagePlaceholder: "رسالتك...", subjectPlaceholder: "الموضوع", namePlaceholder: "اسمك", paymentSuccessful: "تم الدفع بنجاح", goToMarkets: "اذهب إلى الأسواق", myProfile: "ملفي الشخصي", marketDataPlan: "بيانات السوق (600+ مؤسسة)", gmaStructuredAnalysis: "تحليل GMA منظم", gmaConsensus: "إجماع GMA Triumvirate", monthlyAiAnalyses: "تحليلات AI شهرية", alertsWatchlist: "التنبيهات وقائمة المتابعة", portfolioManagement: "إدارة المحفظة", prioritySupport: "دعم أولوية", unlimited: "غير محدود"
  },
  zh: {
    organizationsLabel: "机构", sectorsLabel: "行业", realTimeLabel: "实时", liveDataLabel: "实时数据", intelligenceLayerLabel: "GMA 智能层",
    liveMarketsTitle: "实时市场", liveMarketsDesc: "实时跟踪股票、大宗商品和外汇价格", aiAnalysisTitle: "AI 分析", aiAnalysisDesc: "通过 GMA 获取深入的公司与风险分析", comparisonTitle: "比较", comparisonDesc: "最多 5 家公司的 AI 辅助并列比较", portfolioTrackingTitle: "投资组合跟踪", portfolioTrackingDesc: "记录买入并计算盈亏", platformFeaturesLabel: "平台功能", startFreeTitle: "免费开始", startFreeDesc: "无需登录即可浏览全部市场数据。", back: "返回", messagePlaceholder: "请输入您的消息...", subjectPlaceholder: "主题", namePlaceholder: "您的姓名", paymentSuccessful: "支付成功", goToMarkets: "前往市场", myProfile: "我的资料", marketDataPlan: "市场数据（600+ 机构）", gmaStructuredAnalysis: "GMA 结构化分析", gmaConsensus: "GMA Triumvirate 共识", monthlyAiAnalyses: "每月 AI 分析", alertsWatchlist: "提醒与观察列表", portfolioManagement: "投资组合管理", prioritySupport: "优先支持", unlimited: "无限"
  },
  hi: {
    organizationsLabel: "संगठन", sectorsLabel: "क्षेत्र", realTimeLabel: "रीयल-टाइम", liveDataLabel: "लाइव डेटा", intelligenceLayerLabel: "GMA इंटेलिजेंस लेयर",
    liveMarketsTitle: "लाइव बाज़ार", liveMarketsDesc: "स्टॉक, कमोडिटी और फॉरेक्स कीमतों को रीयल-टाइम में ट्रैक करें", aiAnalysisTitle: "AI विश्लेषण", aiAnalysisDesc: "GMA के साथ कंपनी और जोखिम का गहन विश्लेषण प्राप्त करें", comparisonTitle: "तुलना", comparisonDesc: "अधिकतम 5 कंपनियों की AI-सहायता वाली साथ-साथ तुलना", portfolioTrackingTitle: "पोर्टफोलियो ट्रैकिंग", portfolioTrackingDesc: "खरीद दर्ज करें और लाभ/हानि की गणना करें", platformFeaturesLabel: "प्लेटफ़ॉर्म सुविधाएँ", startFreeTitle: "मुफ़्त शुरू करें", startFreeDesc: "साइन इन किए बिना सभी बाज़ार डेटा देखें।", back: "वापस", messagePlaceholder: "आपका संदेश...", subjectPlaceholder: "विषय", namePlaceholder: "आपका नाम", paymentSuccessful: "भुगतान सफल", goToMarkets: "बाज़ारों पर जाएँ", myProfile: "मेरी प्रोफ़ाइल", marketDataPlan: "बाज़ार डेटा (600+ संगठन)", gmaStructuredAnalysis: "GMA संरचित विश्लेषण", gmaConsensus: "GMA Triumvirate सहमति", monthlyAiAnalyses: "मासिक AI विश्लेषण", alertsWatchlist: "अलर्ट और वॉचलिस्ट", portfolioManagement: "पोर्टफोलियो प्रबंधन", prioritySupport: "प्राथमिकता समर्थन", unlimited: "असीमित"
  },
  de: {
    organizationsLabel: "Organisationen", sectorsLabel: "Sektoren", realTimeLabel: "Echtzeit", liveDataLabel: "Live-Daten", intelligenceLayerLabel: "GMA Intelligence Layer",
    liveMarketsTitle: "Live-Markte", liveMarketsDesc: "Aktien, Rohstoffe und Forex in Echtzeit verfolgen", aiAnalysisTitle: "AI-Analyse", aiAnalysisDesc: "Tiefgehende Unternehmens- und Risikoanalyse mit GMA", comparisonTitle: "Vergleich", comparisonDesc: "AI-gestutzter Vergleich von bis zu 5 Unternehmen", portfolioTrackingTitle: "Portfolio-Tracking", portfolioTrackingDesc: "Kaufe erfassen und Gewinn/Verlust berechnen", platformFeaturesLabel: "PLATTFORMFUNKTIONEN", startFreeTitle: "Kostenlos starten", startFreeDesc: "Alle Marktdaten ohne Anmeldung erkunden.", back: "Zuruck", messagePlaceholder: "Ihre Nachricht...", subjectPlaceholder: "Betreff", namePlaceholder: "Ihr Name", paymentSuccessful: "ZAHLUNG ERFOLGREICH", goToMarkets: "Zu Markten", myProfile: "Mein Profil", marketDataPlan: "Marktdaten (600+ Organisationen)", gmaStructuredAnalysis: "GMA Strukturierte Analyse", gmaConsensus: "GMA Triumvirate Consensus", monthlyAiAnalyses: "Monatliche AI-Analysen", alertsWatchlist: "Alarme und Watchlist", portfolioManagement: "Portfolioverwaltung", prioritySupport: "Priorisierter Support", unlimited: "Unbegrenzt"
  },
  es: {
    organizationsLabel: "Organizaciones", sectorsLabel: "Sectores", realTimeLabel: "Tiempo real", liveDataLabel: "Datos en vivo", intelligenceLayerLabel: "Capa de inteligencia GMA",
    liveMarketsTitle: "Mercados en vivo", liveMarketsDesc: "Sigue acciones, materias primas y forex en tiempo real", aiAnalysisTitle: "Analisis AI", aiAnalysisDesc: "Analisis profundo de companias y riesgos con GMA", comparisonTitle: "Comparacion", comparisonDesc: "Comparacion asistida por AI de hasta 5 companias", portfolioTrackingTitle: "Seguimiento de cartera", portfolioTrackingDesc: "Registra compras y calcula ganancias/perdidas", platformFeaturesLabel: "FUNCIONES DE LA PLATAFORMA", startFreeTitle: "Comenzar gratis", startFreeDesc: "Explora todos los datos de mercado sin iniciar sesion.", back: "Volver", messagePlaceholder: "Tu mensaje...", subjectPlaceholder: "Asunto", namePlaceholder: "Tu nombre", paymentSuccessful: "PAGO EXITOSO", goToMarkets: "Ir a mercados", myProfile: "Mi perfil", marketDataPlan: "Datos de mercado (600+ organizaciones)", gmaStructuredAnalysis: "Analisis estructurado GMA", gmaConsensus: "Consenso GMA Triumvirate", monthlyAiAnalyses: "Analisis AI mensuales", alertsWatchlist: "Alertas y lista de seguimiento", portfolioManagement: "Gestion de cartera", prioritySupport: "Soporte prioritario", unlimited: "Ilimitado"
  }
};
Object.entries(GMA_EXTRA_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_DEEP_I18N = {
  en: {
    dashboardTitle: "MARKET DASHBOARD", dashboardSub: "ORGANIZATIONS · LIVE SIMULATION + AI REFRESH", decliners: "DECLINERS", avgChange: "AVG. CHANGE", myPanel: "MY PANEL", fetchAiData: "FETCH AI DATA", refreshing: "REFRESHING...", searchPlaceholder: "Search by ticker, company name, or full name... (e.g. AAPL, Apple, Tesla)", results: "results", marketStatus: "MARKET STATUS", allStatus: "ALL", listedStatus: "LISTED", privateStatus: "PRIVATE", ipoRadarStatus: "IPO RADAR", ipoSoonStatus: "IPO SOON", ipoPrepStatus: "IPO PREP", rumorStatus: "RUMOR", liveAutoLabel: "LIVE", autoRefreshShort: "2.5s AUTO-REFRESH", prepStatus: "PREP", allOrganizationsShownPrefix: "ALL", allOrganizationsShownSuffix: "ORGANIZATIONS SHOWN",
    personalInfo: "PERSONAL INFORMATION", userFallback: "User", member: "Member", freeMember: "Free Member", noPlanSelected: "No Plan Selected", gmaCore: "GMA CORE", intelligenceLayerActive: "Intelligence Layer: Active", consensusSystem: "Three-Layer Consensus System · Sovereign Intelligence", analysisCredits: "ANALYSIS CREDITS", strategicAnalysis: "STRATEGIC ANALYSIS", accessExhausted: "Access exhausted", creditsRemaining: "credits remaining", accuracyIndex: "ACCURACY INDEX", verifiedBy: "Verified by", yearsOfData: "126 Years of Data", creditsNote: "Each GMA Deep Analysis uses 1 credit. A subscription is required after access expires.", creditsExhaustedNote: "Your analysis credits are exhausted. Choose a GMA plan to continue.", accountActions: "ACCOUNT ACTIONS", profileSaved: "Profile saved!", edit: "EDIT",
    dnaEdit: "GMA DNA EDIT", step: "STEP", selected: "selected", continue: "CONTINUE", gmaUserDna: "GMA USER DNA", dnaIntro: "Your preferences define the tone and scope of the GMA Intelligence Layer.", dnaMarketScope: "Market Scope", dnaFocusRegion: "Focus Region", dnaSectors: "Sectors", dnaRiskStyle: "Risk Style", dnaTimeframe: "Timeframe", dnaTone: "Analysis Style", dnaVolumeScale: "Volume Scale",
    dnaQ_market_scope: "Your Analysis Scope?", dnaOpt_market_scope_global: "Global Markets", dnaOpt_market_scope_emerging: "Emerging Markets", dnaDetail_market_scope_global: "NASDAQ, NYSE, Europe, Asia", dnaDetail_market_scope_emerging: "BIST and similar markets",
    dnaQ_country: "Focus Country / Region?", dnaOpt_country_na: "North America", dnaOpt_country_eu: "Europe", dnaOpt_country_apac: "Asia & Pacific", dnaOpt_country_me: "Middle East", dnaDetail_country_na: "US / NASDAQ / NYSE", dnaDetail_country_eu: "EU / DAX / CAC / FTSE", dnaDetail_country_apac: "TR / CN / JP / Hang Seng", dnaDetail_country_me: "DIFX / Tadawul",
    dnaQ_sectors: "Priority Ecosystems (Max 3)", dnaOpt_sectors_tech: "Technology", dnaOpt_sectors_energy: "Energy", dnaOpt_sectors_defense: "Defense", dnaOpt_sectors_food: "Food", dnaOpt_sectors_health: "Health", dnaOpt_sectors_finance: "Finance",
    dnaQ_risk: "Your Investment Style?", dnaOpt_risk_cube: "Cube", dnaOpt_risk_prism: "Prism", dnaOpt_risk_pyramid: "Pyramid", dnaDetail_risk_cube: "Conservative", dnaDetail_risk_prism: "Balanced", dnaDetail_risk_pyramid: "Aggressive",
    dnaQ_timeframe: "Your Investment Timeframe?", dnaOpt_timeframe_short: "Short", dnaOpt_timeframe_medium: "Medium", dnaOpt_timeframe_long: "Long", dnaDetail_timeframe_short: "0-1 Year", dnaDetail_timeframe_medium: "1-3 Years", dnaDetail_timeframe_long: "3+ Years",
    dnaQ_tone: "Analysis Style?", dnaOpt_tone_clear: "Clear", dnaOpt_tone_technical: "Technical", dnaDetail_tone_clear: "Simple and concise", dnaDetail_tone_technical: "Deep and data-driven",
    dnaQ_budget: "Your Volume Scale?", dnaOpt_budget_micro: "Micro", dnaOpt_budget_macro: "Macro", dnaOpt_budget_corporate: "Corporate",
    legalEffectiveDate: "Effective Date: April 2026", legalGdprDate: "Effective Date: April 2026 — GDPR Compliant", legalTranslating: "Translating content to your language...", legalNoAdvice: "NO FINANCIAL ADVICE", privacyPolicyTitle: "Privacy Policy", termsTitle: "Terms of Service", refundTitle: "Refund Policy", privacyWarning: "Global Market Analytics (GMA) is a data visualisation platform. GMA is not a registered investment advisor and does not provide financial, investment, legal, or tax advice. All content and AI-generated analyses are for informational purposes only. Investment decisions are made solely at the user's own risk.", termsWarning: "GMA is not a registered investment advisor. All content is for informational purposes only. Always seek independent professional financial advice before making investment decisions.", refundHeroTitle: "7-Day Money-Back Guarantee", refundHeroText: "Not satisfied? Get a full refund within 7 days — no questions asked. Email support@globalmarketanalytics.com and we'll process it within 5–7 business days.", paddleSecured: "Paddle Secured", oneClickCancel: "One-Click Cancel", noLockIn: "No Lock-in", sevenDayGuarantee: "7-Day Guarantee",
    noApiKey: "No API key — add it from Settings", liveDataUpdated: "Live data updated", simulationRunning: "Simulation is running", cartRemoved: "removed from cart", basketAdded: "added to basket", watchRemoved: "removed from watchlist", watchAdded: "added to watchlist", alertCreated: "alert created", maxCompare: "A maximum of 5 companies can be selected", addedToComparison: "added to comparison", chart: "CHART", compare: "COMPARE", add: "ADD", watch: "WATCH", alert: "ALERT", aiAnalysis: "AI ANALYSIS", riskOpportunity: "RISK & OPPORTUNITY", historicalChart: "HISTORICAL CHART", priceRiseAlert: "PRICE RISE ALERT", riseThreshold: "RISE THRESHOLD", target: "TARGET", setAlert: "SET ALERT", cart: "CART", watchlist: "WATCHLIST", cartEmpty: "Cart is empty", watchlistEmpty: "Watchlist is empty", noPurchasesYet: "No purchases yet", remove: "remove", units: "units", buyIn: "buy-in", currentValue: "Current Value", cost: "Cost", profitLoss: "Profit / Loss", legal: "LEGAL", legalNoticeTitle: "LEGAL NOTICE", legalNoticeNotAdvice: "LEGAL NOTICE - NOT INVESTMENT ADVICE", signInLegalPrefix: "By signing in", signInLegalSuffix: "by continuing.", disclaimer1: "This platform is for digital informational purposes only.", disclaimer2: "No content or AI output is investment advice.", disclaimer3: "All investment decisions are the investor's own responsibility.", disclaimer4: "Past performance does not guarantee future results.", disclaimer5: "Consult a licensed financial advisor before trading.", disclaimer6: "Data may be simulated and may not represent live exchange data."
  },
  tr: {
    dashboardTitle: "PIYASA PANELI", dashboardSub: "KURULUS · CANLI SIMULASYON + AI YENILEME", decliners: "DUSENLER", avgChange: "ORT. DEGISIM", myPanel: "PANELIM", fetchAiData: "AI VERI CEK", refreshing: "YENILENIYOR...", searchPlaceholder: "Ticker, sirket adi veya tam ad ile ara... (orn. AAPL, Apple, Tesla)", results: "sonuc", marketStatus: "PIYASA DURUMU", allStatus: "TUMU", listedStatus: "LISTELI", privateStatus: "OZEL", ipoRadarStatus: "IPO RADARI", ipoSoonStatus: "IPO YAKIN", ipoPrepStatus: "IPO HAZIRLIK", rumorStatus: "SOYLENTI", liveAutoLabel: "CANLI", autoRefreshShort: "2.5 sn OTOMATIK", prepStatus: "HAZIRLIK", allOrganizationsShownPrefix: "TUM", allOrganizationsShownSuffix: "KURULUS GOSTERILDI",
    personalInfo: "KISISEL BILGILER", userFallback: "Kullanici", member: "Uye", freeMember: "Ucretsiz Uye", noPlanSelected: "Plan Secilmedi", gmaCore: "GMA CEKIRDEK", intelligenceLayerActive: "Zeka Katmani: Aktif", consensusSystem: "Uc Katmanli Konsensus Sistemi · Bagimsiz Zeka", analysisCredits: "ANALIZ KREDILERI", strategicAnalysis: "STRATEJIK ANALIZ", accessExhausted: "Erisim tukendi", creditsRemaining: "kredi kaldi", accuracyIndex: "DOGRULUK ENDEKSI", verifiedBy: "Dogrulayan", yearsOfData: "126 Yillik Veri", creditsNote: "Her GMA Derin Analizi 1 kredi kullanir. Erisim suresi dolduktan sonra abonelik gerekir.", creditsExhaustedNote: "Analiz kredileriniz tukendi. Devam etmek icin bir GMA plani secin.", accountActions: "HESAP ISLEMLERI", profileSaved: "Profil kaydedildi!", edit: "DUZENLE",
    dnaEdit: "GMA DNA DUZENLE", step: "ADIM", selected: "secildi", continue: "DEVAM ET", gmaUserDna: "GMA KULLANICI DNA", dnaIntro: "Tercihleriniz GMA Zeka Katmani'nin tonunu ve kapsamını belirler.", dnaMarketScope: "Piyasa Kapsami", dnaFocusRegion: "Odak Bolge", dnaSectors: "Sektorler", dnaRiskStyle: "Risk Stili", dnaTimeframe: "Zaman Ufku", dnaTone: "Analiz Stili", dnaVolumeScale: "Hacim Olcegi",
    dnaQ_market_scope: "Analiz Kapsaminiz?", dnaOpt_market_scope_global: "Kuresel Piyasalar", dnaOpt_market_scope_emerging: "Gelisen Piyasalar", dnaDetail_market_scope_global: "NASDAQ, NYSE, Avrupa, Asya", dnaDetail_market_scope_emerging: "BIST ve benzer piyasalar",
    dnaQ_country: "Odak Ulke / Bolge?", dnaOpt_country_na: "Kuzey Amerika", dnaOpt_country_eu: "Avrupa", dnaOpt_country_apac: "Asya & Pasifik", dnaOpt_country_me: "Orta Dogu", dnaDetail_country_na: "ABD / NASDAQ / NYSE", dnaDetail_country_eu: "AB / DAX / CAC / FTSE", dnaDetail_country_apac: "TR / CN / JP / Hang Seng", dnaDetail_country_me: "DIFX / Tadawul",
    dnaQ_sectors: "Oncelikli Ekosistemler (Maks 3)", dnaOpt_sectors_tech: "Teknoloji", dnaOpt_sectors_energy: "Enerji", dnaOpt_sectors_defense: "Savunma", dnaOpt_sectors_food: "Gida", dnaOpt_sectors_health: "Saglik", dnaOpt_sectors_finance: "Finans",
    dnaQ_risk: "Yatirim Stiliniz?", dnaOpt_risk_cube: "Kup", dnaOpt_risk_prism: "Prizma", dnaOpt_risk_pyramid: "Piramit", dnaDetail_risk_cube: "Muhafazakar", dnaDetail_risk_prism: "Dengeli", dnaDetail_risk_pyramid: "Agresif",
    dnaQ_timeframe: "Yatirim Zaman Ufkunuz?", dnaOpt_timeframe_short: "Kisa", dnaOpt_timeframe_medium: "Orta", dnaOpt_timeframe_long: "Uzun", dnaDetail_timeframe_short: "0-1 Yil", dnaDetail_timeframe_medium: "1-3 Yil", dnaDetail_timeframe_long: "3+ Yil",
    dnaQ_tone: "Analiz Stili?", dnaOpt_tone_clear: "Net", dnaOpt_tone_technical: "Teknik", dnaDetail_tone_clear: "Sade ve oz", dnaDetail_tone_technical: "Derin ve veri odakli",
    dnaQ_budget: "Hacim Olceginiz?", dnaOpt_budget_micro: "Mikro", dnaOpt_budget_macro: "Makro", dnaOpt_budget_corporate: "Kurumsal",
    legalEffectiveDate: "Yururluk Tarihi: Nisan 2026", legalGdprDate: "Yururluk Tarihi: Nisan 2026 — GDPR Uyumlu", legalTranslating: "Icerik dilinize cevriliyor...", legalNoAdvice: "YATIRIM TAVSIYESI DEGILDIR", privacyPolicyTitle: "Gizlilik Politikasi", termsTitle: "Hizmet Sartlari", refundTitle: "Iade Politikasi", privacyWarning: "Global Market Analytics (GMA) bir veri gorsellestirme platformudur. GMA kayitli bir yatirim danismani degildir; finansal, yatirim, hukuki veya vergi tavsiyesi sunmaz. Tum icerik ve AI analizleri yalnizca bilgilendirme amaclidir. Yatirim kararlari tamamen kullanicinin kendi sorumlulugundadir.", termsWarning: "GMA kayitli bir yatirim danismani degildir. Tum icerik yalnizca bilgilendirme amaclidir. Yatirim karari almadan once bagimsiz profesyonel finansal danismanlik alin.", refundHeroTitle: "7 Gun Para Iade Garantisi", refundHeroText: "Memnun kalmadiniz mi? Ilk 7 gun icinde kosulsuz tam iade talep edin. support@globalmarketanalytics.com adresine yazin; 5-7 is gunu icinde isleme alalim.", paddleSecured: "Paddle Guvenceli", oneClickCancel: "Tek Tikla Iptal", noLockIn: "Baglayicilik Yok", sevenDayGuarantee: "7 Gun Garanti",
    noApiKey: "API anahtari yok — Ayarlar'dan ekleyin", liveDataUpdated: "Canli veri guncellendi", simulationRunning: "Simulasyon calisiyor", cartRemoved: "sepetten cikarildi", basketAdded: "sepete eklendi", watchRemoved: "izleme listesinden cikarildi", watchAdded: "izleme listesine eklendi", alertCreated: "uyari olusturuldu", maxCompare: "En fazla 5 sirket secilebilir", addedToComparison: "karsilastirmaya eklendi", chart: "GRAFIK", compare: "KARSILASTIR", add: "EKLE", watch: "IZLE", alert: "UYARI", aiAnalysis: "AI ANALIZ", riskOpportunity: "RISK & FIRSAT", historicalChart: "TARIHSEL GRAFIK", priceRiseAlert: "FIYAT YUKSELIS UYARISI", riseThreshold: "YUKSELIS ESIGI", target: "HEDEF", setAlert: "UYARI KUR", cart: "SEPET", watchlist: "IZLEME", cartEmpty: "Sepet bos", watchlistEmpty: "Izleme listesi bos", noPurchasesYet: "Henuz alim yok", remove: "kaldir", units: "adet", buyIn: "alis", currentValue: "Guncel Deger", cost: "Maliyet", profitLoss: "Kar / Zarar", legal: "YASAL", legalNoticeTitle: "YASAL UYARI", legalNoticeNotAdvice: "YASAL UYARI - YATIRIM TAVSIYESI DEGILDIR", signInLegalPrefix: "Giris yaparak", signInLegalSuffix: "devam etmeyi kabul edersiniz.", disclaimer1: "Bu platform yalnizca dijital bilgilendirme amaclidir.", disclaimer2: "Hicbir icerik veya AI ciktisi yatirim tavsiyesi degildir.", disclaimer3: "Tum yatirim kararlari yatirimcinin kendi sorumlulugundadir.", disclaimer4: "Gecmis performans gelecekteki sonuclari garanti etmez.", disclaimer5: "Islem yapmadan once lisansli bir finansal danismana basvurun.", disclaimer6: "Veriler simule edilmis olabilir ve canli borsa verisini temsil etmeyebilir."
  },
  ru: { dashboardTitle: "ПАНЕЛЬ РЫНКА", dashboardSub: "ОРГАНИЗАЦИИ · ЖИВАЯ СИМУЛЯЦИЯ + AI ОБНОВЛЕНИЕ", decliners: "СНИЖЕНИЕ", avgChange: "СРЕД. ИЗМЕНЕНИЕ", myPanel: "МОЯ ПАНЕЛЬ", fetchAiData: "ЗАГРУЗИТЬ AI ДАННЫЕ", refreshing: "ОБНОВЛЕНИЕ...", searchPlaceholder: "Поиск по тикеру, компании или полному названию... (напр. AAPL, Apple, Tesla)", results: "результатов", marketStatus: "СТАТУС РЫНКА", allStatus: "ВСЕ", listedStatus: "ЛИСТИНГ", privateStatus: "ЧАСТНЫЕ", ipoRadarStatus: "IPO РАДАР", ipoSoonStatus: "СКОРО IPO", ipoPrepStatus: "ПОДГОТОВКА IPO", rumorStatus: "СЛУХИ", liveAutoLabel: "LIVE", autoRefreshShort: "2.5с АВТО", prepStatus: "ПОДГ.", allOrganizationsShownPrefix: "ВСЕ", allOrganizationsShownSuffix: "ОРГАНИЗАЦИЙ ПОКАЗАНО", personalInfo: "ЛИЧНАЯ ИНФОРМАЦИЯ", userFallback: "Пользователь", member: "Участник", freeMember: "Бесплатный участник", noPlanSelected: "Нет выбранного плана", gmaCore: "ЯДРО GMA", intelligenceLayerActive: "Аналитический слой: активен", consensusSystem: "Трёхслойная система консенсуса · суверенная аналитика", analysisCredits: "КРЕДИТЫ АНАЛИЗА", strategicAnalysis: "СТРАТЕГИЧЕСКИЙ АНАЛИЗ", accessExhausted: "Доступ исчерпан", creditsRemaining: "кредитов осталось", accuracyIndex: "ИНДЕКС ТОЧНОСТИ", verifiedBy: "Проверено", yearsOfData: "126 лет данных", creditsNote: "Каждый глубокий анализ GMA использует 1 кредит. После окончания доступа требуется подписка.", creditsExhaustedNote: "Кредиты анализа исчерпаны. Выберите план GMA для продолжения.", accountActions: "ДЕЙСТВИЯ АККАУНТА", profileSaved: "Профиль сохранён!", edit: "ИЗМЕНИТЬ", dnaEdit: "ИЗМЕНИТЬ GMA DNA", step: "ШАГ", selected: "выбрано", continue: "ПРОДОЛЖИТЬ", gmaUserDna: "GMA DNA ПОЛЬЗОВАТЕЛЯ", dnaIntro: "Ваши предпочтения определяют тон и область GMA Intelligence Layer.", dnaMarketScope: "Область рынка", dnaFocusRegion: "Фокус-регион", dnaSectors: "Секторы", dnaRiskStyle: "Стиль риска", dnaTimeframe: "Горизонт", dnaTone: "Стиль анализа", dnaVolumeScale: "Масштаб объёма", legalEffectiveDate: "Дата вступления в силу: апрель 2026", legalGdprDate: "Дата вступления в силу: апрель 2026 — соответствует GDPR", legalTranslating: "Контент переводится на ваш язык...", legalNoAdvice: "НЕ ФИНАНСОВАЯ РЕКОМЕНДАЦИЯ", privacyPolicyTitle: "Политика конфиденциальности", termsTitle: "Условия сервиса", refundTitle: "Политика возврата", privacyWarning: "Global Market Analytics (GMA) является платформой визуализации данных. GMA не является зарегистрированным инвестиционным консультантом и не предоставляет финансовые, инвестиционные, юридические или налоговые советы. Весь контент и AI-анализ предназначены только для информации. Инвестиционные решения принимает сам пользователь.", termsWarning: "GMA не является зарегистрированным инвестиционным консультантом. Весь контент только информационный. Перед инвестиционными решениями обратитесь к независимому специалисту.", refundHeroTitle: "7-дневная гарантия возврата", refundHeroText: "Не устроило? Получите полный возврат в течение 7 дней без лишних вопросов. Напишите на support@globalmarketanalytics.com; обработка займёт 5-7 рабочих дней.", paddleSecured: "Защищено Paddle", oneClickCancel: "Отмена в один клик", noLockIn: "Без привязки", sevenDayGuarantee: "7-дневная гарантия" },
  ar: { dashboardTitle: "لوحة الأسواق", dashboardSub: "مؤسسات · محاكاة مباشرة + تحديث AI", decliners: "المنخفضة", avgChange: "متوسط التغير", myPanel: "لوحتي", fetchAiData: "جلب بيانات AI", refreshing: "جار التحديث...", searchPlaceholder: "ابحث بالرمز أو اسم الشركة أو الاسم الكامل... (مثل AAPL، Apple، Tesla)", results: "نتائج", marketStatus: "حالة السوق", allStatus: "الكل", listedStatus: "مدرجة", privateStatus: "خاصة", ipoRadarStatus: "رادار IPO", ipoSoonStatus: "IPO قريب", ipoPrepStatus: "تحضير IPO", rumorStatus: "شائعة", liveAutoLabel: "مباشر", autoRefreshShort: "تحديث تلقائي 2.5ث", prepStatus: "تحضير", allOrganizationsShownPrefix: "كل", allOrganizationsShownSuffix: "المؤسسات معروضة", personalInfo: "المعلومات الشخصية", userFallback: "مستخدم", member: "عضو", freeMember: "عضو مجاني", noPlanSelected: "لم يتم اختيار خطة", gmaCore: "نواة GMA", intelligenceLayerActive: "طبقة الذكاء: نشطة", consensusSystem: "نظام إجماع ثلاثي الطبقات · ذكاء مستقل", analysisCredits: "أرصدة التحليل", strategicAnalysis: "تحليل استراتيجي", accessExhausted: "انتهى الوصول", creditsRemaining: "أرصدة متبقية", accuracyIndex: "مؤشر الدقة", verifiedBy: "تم التحقق بواسطة", yearsOfData: "126 سنة من البيانات", creditsNote: "كل تحليل GMA عميق يستخدم رصيدًا واحدًا. بعد انتهاء الوصول يلزم اشتراك.", creditsExhaustedNote: "انتهت أرصدة التحليل. اختر خطة GMA للمتابعة.", accountActions: "إجراءات الحساب", profileSaved: "تم حفظ الملف الشخصي!", edit: "تعديل", dnaEdit: "تعديل GMA DNA", step: "خطوة", selected: "محدد", continue: "متابعة", gmaUserDna: "GMA DNA للمستخدم", dnaIntro: "تحدد تفضيلاتك نبرة ونطاق طبقة ذكاء GMA.", dnaMarketScope: "نطاق السوق", dnaFocusRegion: "منطقة التركيز", dnaSectors: "القطاعات", dnaRiskStyle: "أسلوب المخاطر", dnaTimeframe: "الأفق الزمني", dnaTone: "أسلوب التحليل", dnaVolumeScale: "مقياس الحجم", legalEffectiveDate: "تاريخ النفاذ: أبريل 2026", legalGdprDate: "تاريخ النفاذ: أبريل 2026 — متوافق مع GDPR", legalTranslating: "جار ترجمة المحتوى إلى لغتك...", legalNoAdvice: "ليست نصيحة مالية", privacyPolicyTitle: "سياسة الخصوصية", termsTitle: "شروط الخدمة", refundTitle: "سياسة الاسترداد", privacyWarning: "Global Market Analytics (GMA) منصة لعرض البيانات. GMA ليست مستشارًا استثماريًا مسجلًا ولا تقدم نصائح مالية أو استثمارية أو قانونية أو ضريبية. كل المحتوى والتحليلات المدعومة بالذكاء الاصطناعي لأغراض معلوماتية فقط. قرارات الاستثمار تقع بالكامل على مسؤولية المستخدم.", termsWarning: "GMA ليست مستشارًا استثماريًا مسجلًا. كل المحتوى معلوماتي فقط. اطلب استشارة مالية مهنية مستقلة قبل اتخاذ قرارات الاستثمار.", refundHeroTitle: "ضمان استرداد خلال 7 أيام", refundHeroText: "غير راضٍ؟ احصل على استرداد كامل خلال 7 أيام دون أسئلة. راسل support@globalmarketanalytics.com وسنعالجه خلال 5-7 أيام عمل.", paddleSecured: "محمي بواسطة Paddle", oneClickCancel: "إلغاء بنقرة واحدة", noLockIn: "بدون التزام", sevenDayGuarantee: "ضمان 7 أيام" },
  zh: { dashboardTitle: "市场面板", dashboardSub: "机构 · 实时模拟 + AI 刷新", decliners: "下跌", avgChange: "平均变化", myPanel: "我的面板", fetchAiData: "获取 AI 数据", refreshing: "刷新中...", searchPlaceholder: "按代码、公司名或全名搜索...（如 AAPL、Apple、Tesla）", results: "结果", marketStatus: "市场状态", allStatus: "全部", listedStatus: "上市", privateStatus: "私有", ipoRadarStatus: "IPO 雷达", ipoSoonStatus: "即将 IPO", ipoPrepStatus: "IPO 准备", rumorStatus: "传闻", liveAutoLabel: "实时", autoRefreshShort: "2.5秒自动刷新", prepStatus: "准备", allOrganizationsShownPrefix: "全部", allOrganizationsShownSuffix: "机构已显示", personalInfo: "个人信息", userFallback: "用户", member: "会员", freeMember: "免费会员", noPlanSelected: "未选择计划", gmaCore: "GMA 核心", intelligenceLayerActive: "智能层：已启用", consensusSystem: "三层共识系统 · 主权智能", analysisCredits: "分析额度", strategicAnalysis: "战略分析", accessExhausted: "访问已用尽", creditsRemaining: "额度剩余", accuracyIndex: "准确率指数", verifiedBy: "验证依据", yearsOfData: "126 年数据", creditsNote: "每次 GMA 深度分析使用 1 个额度。访问期结束后需要订阅。", creditsExhaustedNote: "您的分析额度已用尽。请选择 GMA 计划继续。", accountActions: "账户操作", profileSaved: "资料已保存！", edit: "编辑", dnaEdit: "编辑 GMA DNA", step: "步骤", selected: "已选择", continue: "继续", gmaUserDna: "GMA 用户 DNA", dnaIntro: "您的偏好会定义 GMA 智能层的语气和范围。", dnaMarketScope: "市场范围", dnaFocusRegion: "关注区域", dnaSectors: "行业", dnaRiskStyle: "风险风格", dnaTimeframe: "时间周期", dnaTone: "分析风格", dnaVolumeScale: "规模", legalEffectiveDate: "生效日期：2026年4月", legalGdprDate: "生效日期：2026年4月 — 符合 GDPR", legalTranslating: "正在翻译为您的语言...", legalNoAdvice: "非金融建议", privacyPolicyTitle: "隐私政策", termsTitle: "服务条款", refundTitle: "退款政策", privacyWarning: "Global Market Analytics (GMA) 是数据可视化平台。GMA 不是注册投资顾问，不提供金融、投资、法律或税务建议。所有内容和 AI 分析仅供参考。投资决定完全由用户自行承担风险。", termsWarning: "GMA 不是注册投资顾问。所有内容仅供参考。做出投资决定前，请寻求独立专业金融建议。", refundHeroTitle: "7 天退款保证", refundHeroText: "不满意？购买后 7 天内可无条件全额退款。请发送邮件至 support@globalmarketanalytics.com，我们将在 5-7 个工作日内处理。", paddleSecured: "Paddle 安全保障", oneClickCancel: "一键取消", noLockIn: "无锁定", sevenDayGuarantee: "7 天保证" },
  hi: { dashboardTitle: "मार्केट डैशबोर्ड", dashboardSub: "संगठन · लाइव सिमुलेशन + AI रिफ्रेश", decliners: "गिरावट", avgChange: "औसत बदलाव", myPanel: "मेरा पैनल", fetchAiData: "AI डेटा लाएँ", refreshing: "रिफ्रेश हो रहा है...", searchPlaceholder: "टिकर, कंपनी नाम या पूरे नाम से खोजें... (जैसे AAPL, Apple, Tesla)", results: "परिणाम", marketStatus: "बाज़ार स्थिति", allStatus: "सभी", listedStatus: "सूचीबद्ध", privateStatus: "निजी", ipoRadarStatus: "IPO रडार", ipoSoonStatus: "जल्द IPO", ipoPrepStatus: "IPO तैयारी", rumorStatus: "अफवाह", liveAutoLabel: "लाइव", autoRefreshShort: "2.5s ऑटो-रिफ्रेश", prepStatus: "तैयारी", allOrganizationsShownPrefix: "सभी", allOrganizationsShownSuffix: "संगठन दिखाए गए", personalInfo: "व्यक्तिगत जानकारी", userFallback: "उपयोगकर्ता", member: "सदस्य", freeMember: "मुफ़्त सदस्य", noPlanSelected: "कोई योजना नहीं चुनी गई", gmaCore: "GMA कोर", intelligenceLayerActive: "इंटेलिजेंस लेयर: सक्रिय", consensusSystem: "तीन-स्तरीय सहमति प्रणाली · स्वतंत्र इंटेलिजेंस", analysisCredits: "विश्लेषण क्रेडिट", strategicAnalysis: "रणनीतिक विश्लेषण", accessExhausted: "एक्सेस समाप्त", creditsRemaining: "क्रेडिट शेष", accuracyIndex: "सटीकता सूचकांक", verifiedBy: "द्वारा सत्यापित", yearsOfData: "126 वर्षों का डेटा", creditsNote: "प्रत्येक GMA डीप विश्लेषण 1 क्रेडिट उपयोग करता है। एक्सेस समाप्त होने के बाद सदस्यता आवश्यक है।", creditsExhaustedNote: "आपके विश्लेषण क्रेडिट समाप्त हो गए हैं। जारी रखने के लिए GMA योजना चुनें।", accountActions: "खाता क्रियाएँ", profileSaved: "प्रोफ़ाइल सहेजी गई!", edit: "संपादित करें", dnaEdit: "GMA DNA संपादित करें", step: "चरण", selected: "चयनित", continue: "जारी रखें", gmaUserDna: "GMA उपयोगकर्ता DNA", dnaIntro: "आपकी प्राथमिकताएँ GMA Intelligence Layer की शैली और दायरा तय करती हैं।", dnaMarketScope: "बाज़ार दायरा", dnaFocusRegion: "फोकस क्षेत्र", dnaSectors: "क्षेत्र", dnaRiskStyle: "जोखिम शैली", dnaTimeframe: "समय सीमा", dnaTone: "विश्लेषण शैली", dnaVolumeScale: "वॉल्यूम स्केल", legalEffectiveDate: "प्रभावी तिथि: अप्रैल 2026", legalGdprDate: "प्रभावी तिथि: अप्रैल 2026 — GDPR अनुरूप", legalTranslating: "सामग्री आपकी भाषा में अनुवाद हो रही है...", legalNoAdvice: "वित्तीय सलाह नहीं", privacyPolicyTitle: "गोपनीयता नीति", termsTitle: "सेवा की शर्तें", refundTitle: "रिफंड नीति", privacyWarning: "Global Market Analytics (GMA) एक डेटा विज़ुअलाइज़ेशन प्लेटफ़ॉर्म है। GMA पंजीकृत निवेश सलाहकार नहीं है और वित्तीय, निवेश, कानूनी या कर सलाह नहीं देता। सभी सामग्री और AI विश्लेषण केवल जानकारी के लिए हैं। निवेश निर्णय पूरी तरह उपयोगकर्ता के अपने जोखिम पर हैं।", termsWarning: "GMA पंजीकृत निवेश सलाहकार नहीं है। सभी सामग्री केवल जानकारी के लिए है। निवेश निर्णय लेने से पहले स्वतंत्र पेशेवर वित्तीय सलाह लें।", refundHeroTitle: "7-दिन मनी-बैक गारंटी", refundHeroText: "संतुष्ट नहीं? 7 दिनों के भीतर पूरा रिफंड लें। support@globalmarketanalytics.com पर ईमेल करें; हम 5-7 व्यावसायिक दिनों में प्रक्रिया करेंगे।", paddleSecured: "Paddle सुरक्षित", oneClickCancel: "वन-क्लिक कैंसल", noLockIn: "कोई लॉक-इन नहीं", sevenDayGuarantee: "7-दिन गारंटी" },
  de: { dashboardTitle: "MARKT-DASHBOARD", dashboardSub: "ORGANISATIONEN · LIVE-SIMULATION + AI-AKTUALISIERUNG", decliners: "VERLIERER", avgChange: "DURCHSCHN. ÄNDERUNG", myPanel: "MEIN PANEL", fetchAiData: "AI-DATEN LADEN", refreshing: "AKTUALISIERT...", searchPlaceholder: "Nach Ticker, Unternehmensname oder Vollname suchen... (z. B. AAPL, Apple, Tesla)", results: "Ergebnisse", marketStatus: "MARKTSTATUS", allStatus: "ALLE", listedStatus: "GELISTET", privateStatus: "PRIVAT", ipoRadarStatus: "IPO-RADAR", ipoSoonStatus: "IPO BALD", ipoPrepStatus: "IPO-VORBEREITUNG", rumorStatus: "GERÜCHT", liveAutoLabel: "LIVE", autoRefreshShort: "2.5s AUTO-REFRESH", prepStatus: "VORB.", allOrganizationsShownPrefix: "ALLE", allOrganizationsShownSuffix: "ORGANISATIONEN ANGEZEIGT", personalInfo: "PERSÖNLICHE INFORMATIONEN", userFallback: "Nutzer", member: "Mitglied", freeMember: "Kostenloses Mitglied", noPlanSelected: "Kein Plan ausgewählt", gmaCore: "GMA CORE", intelligenceLayerActive: "Intelligence Layer: Aktiv", consensusSystem: "Dreischichtiges Konsenssystem · Souveräne Intelligenz", analysisCredits: "ANALYSE-CREDITS", strategicAnalysis: "STRATEGISCHE ANALYSE", accessExhausted: "Zugang erschöpft", creditsRemaining: "Credits übrig", accuracyIndex: "GENAUIGKEITSINDEX", verifiedBy: "Verifiziert durch", yearsOfData: "126 Jahre Daten", creditsNote: "Jede GMA-Tiefenanalyse nutzt 1 Credit. Nach Ablauf des Zugangs ist ein Abonnement erforderlich.", creditsExhaustedNote: "Ihre Analyse-Credits sind erschöpft. Wählen Sie einen GMA-Plan, um fortzufahren.", accountActions: "KONTOAKTIONEN", profileSaved: "Profil gespeichert!", edit: "BEARBEITEN", dnaEdit: "GMA DNA BEARBEITEN", step: "SCHRITT", selected: "ausgewählt", continue: "WEITER", gmaUserDna: "GMA NUTZER-DNA", dnaIntro: "Ihre Präferenzen bestimmen Ton und Umfang des GMA Intelligence Layer.", dnaMarketScope: "Marktumfang", dnaFocusRegion: "Fokusregion", dnaSectors: "Sektoren", dnaRiskStyle: "Risikostil", dnaTimeframe: "Zeithorizont", dnaTone: "Analysestil", dnaVolumeScale: "Volumenskala", legalEffectiveDate: "Gültig ab: April 2026", legalGdprDate: "Gültig ab: April 2026 — DSGVO-konform", legalTranslating: "Inhalt wird in Ihre Sprache übersetzt...", legalNoAdvice: "KEINE FINANZBERATUNG", privacyPolicyTitle: "Datenschutzrichtlinie", termsTitle: "Nutzungsbedingungen", refundTitle: "Rückerstattungsrichtlinie", privacyWarning: "Global Market Analytics (GMA) ist eine Datenvisualisierungsplattform. GMA ist kein registrierter Anlageberater und bietet keine Finanz-, Anlage-, Rechts- oder Steuerberatung. Alle Inhalte und AI-Analysen dienen nur Informationszwecken. Anlageentscheidungen erfolgen ausschließlich auf eigenes Risiko.", termsWarning: "GMA ist kein registrierter Anlageberater. Alle Inhalte dienen nur Informationszwecken. Holen Sie vor Anlageentscheidungen unabhängige professionelle Finanzberatung ein.", refundHeroTitle: "7-Tage-Geld-zurück-Garantie", refundHeroText: "Nicht zufrieden? Erhalten Sie innerhalb von 7 Tagen eine volle Rückerstattung. Schreiben Sie an support@globalmarketanalytics.com; wir bearbeiten dies innerhalb von 5-7 Werktagen.", paddleSecured: "Paddle gesichert", oneClickCancel: "Ein-Klick-Kündigung", noLockIn: "Keine Bindung", sevenDayGuarantee: "7-Tage-Garantie" },
  es: { dashboardTitle: "PANEL DE MERCADO", dashboardSub: "ORGANIZACIONES · SIMULACIÓN EN VIVO + ACTUALIZACIÓN AI", decliners: "BAJADAS", avgChange: "CAMBIO PROM.", myPanel: "MI PANEL", fetchAiData: "OBTENER DATOS AI", refreshing: "ACTUALIZANDO...", searchPlaceholder: "Busca por ticker, nombre de empresa o nombre completo... (ej. AAPL, Apple, Tesla)", results: "resultados", marketStatus: "ESTADO DEL MERCADO", allStatus: "TODO", listedStatus: "COTIZADAS", privateStatus: "PRIVADAS", ipoRadarStatus: "RADAR IPO", ipoSoonStatus: "IPO PRONTO", ipoPrepStatus: "PREP. IPO", rumorStatus: "RUMOR", liveAutoLabel: "EN VIVO", autoRefreshShort: "2.5s AUTO", prepStatus: "PREP.", allOrganizationsShownPrefix: "TODAS", allOrganizationsShownSuffix: "ORGANIZACIONES MOSTRADAS", personalInfo: "INFORMACIÓN PERSONAL", userFallback: "Usuario", member: "Miembro", freeMember: "Miembro gratis", noPlanSelected: "Sin plan seleccionado", gmaCore: "NÚCLEO GMA", intelligenceLayerActive: "Capa de inteligencia: activa", consensusSystem: "Sistema de consenso de tres capas · Inteligencia soberana", analysisCredits: "CRÉDITOS DE ANÁLISIS", strategicAnalysis: "ANÁLISIS ESTRATÉGICO", accessExhausted: "Acceso agotado", creditsRemaining: "créditos restantes", accuracyIndex: "ÍNDICE DE PRECISIÓN", verifiedBy: "Verificado por", yearsOfData: "126 años de datos", creditsNote: "Cada análisis profundo de GMA usa 1 crédito. Se requiere suscripción al vencer el acceso.", creditsExhaustedNote: "Tus créditos de análisis se agotaron. Elige un plan GMA para continuar.", accountActions: "ACCIONES DE CUENTA", profileSaved: "¡Perfil guardado!", edit: "EDITAR", dnaEdit: "EDITAR GMA DNA", step: "PASO", selected: "seleccionado", continue: "CONTINUAR", gmaUserDna: "GMA DNA DE USUARIO", dnaIntro: "Tus preferencias definen el tono y alcance de la capa de inteligencia GMA.", dnaMarketScope: "Alcance de mercado", dnaFocusRegion: "Región foco", dnaSectors: "Sectores", dnaRiskStyle: "Estilo de riesgo", dnaTimeframe: "Horizonte temporal", dnaTone: "Estilo de análisis", dnaVolumeScale: "Escala de volumen", legalEffectiveDate: "Fecha de vigencia: abril de 2026", legalGdprDate: "Fecha de vigencia: abril de 2026 — Cumple GDPR", legalTranslating: "Traduciendo contenido a tu idioma...", legalNoAdvice: "NO ES ASESORAMIENTO FINANCIERO", privacyPolicyTitle: "Política de privacidad", termsTitle: "Términos de servicio", refundTitle: "Política de reembolso", privacyWarning: "Global Market Analytics (GMA) es una plataforma de visualización de datos. GMA no es un asesor de inversiones registrado y no proporciona asesoramiento financiero, de inversión, legal ni fiscal. Todo el contenido y los análisis AI son solo informativos. Las decisiones de inversión son responsabilidad exclusiva del usuario.", termsWarning: "GMA no es un asesor de inversiones registrado. Todo el contenido es solo informativo. Busca asesoramiento financiero profesional independiente antes de invertir.", refundHeroTitle: "Garantía de reembolso de 7 días", refundHeroText: "¿No estás satisfecho? Obtén un reembolso completo dentro de 7 días, sin preguntas. Escribe a support@globalmarketanalytics.com y lo procesaremos en 5-7 días hábiles.", paddleSecured: "Protegido por Paddle", oneClickCancel: "Cancelación en un clic", noLockIn: "Sin permanencia", sevenDayGuarantee: "Garantía de 7 días" }
};
Object.entries(GMA_DEEP_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_CONTENT_I18N = {
  en: {
    platform: "PLATFORM", planActivated: "Plan Activated!", payKeyLinkedNote: "This key is linked to your account. Do not share it with anyone.", sovereignAutoNote: "GMA Sovereign Intelligence · All models are managed automatically. You do not need anything else.", footerBrandLine: "Global Market Analytics · 2026 · Sovereign Intelligence", footerCompliance: "Global Market Analytics (GMA) is a digital platform providing AI-driven market data visualization. GMA is not a registered investment advisor. All payments are securely processed by our partner, Paddle.com.", addToPortfolio: "ADD TO PORTFOLIO", currentPrice: "CURRENT PRICE", exchange: "EXCHANGE", quantity: "QUANTITY", unitPrice: "Unit Price", totalLabel: "TOTAL", simulatedTransaction: "This is a simulated transaction - no real purchase is made"
  },
  tr: {
    feat1t: "Canli Piyasa Akisi", feat1d: "600+ sirket, kripto, emtia ve para birimini gercek zamanli takip edin", feat2t: "GMA Triumvirate Analizi", feat2d: "GMA Consensus Engine uzerinden kurumsal sinyal uyumunu inceleyin", feat3t: "Tarihsel Grafikler", feat3d: "Kurulus yilindan itibaren tarihsel grafikler, kriz analizi ve uzun vadeli trendler", feat4t: "Sirket Karsilastirma", feat4d: "5 sirkete kadar AI destekli karsilastirma ve daha net risk cercevesi", feat5t: "Akilli Uyarilar", feat5d: "Fiyat hedefi uyarilari kurun; yukselis ve dususlerde aninda bildirim alin", feat6t: "8 Dil", feat6d: "Ingilizce, Turkce, Rusca, Arapca, Cince, Hintce, Almanca ve Ispanyolca deneyimi",
    contactSub: "Her soru ve geri bildiriminiz icin buradayiz.", contactInfo: "Iletisim Bilgileri", formName: "AD SOYAD", formEmail: "E-POSTA", formSubject: "KONU", formMsg: "MESAJ", formSend: "GONDER", formSending: "GONDERILIYOR...", formSent: "Mesajiniz gonderildi!", subjectPlaceholder: "Konu", messagePlaceholder: "Mesajiniz...", namePlaceholder: "Adiniz",
    aboutTitle: "Global Market Analytics Hakkinda", aboutSub: "Kuresel piyasalarda yapilandirilmis analiz, netlik ve karar destegi sunan finansal zeka platformu.", aboutMission: "Misyonumuz", aboutMissionText: "Yatirim tavsiyesi sinirina gecmeden, yapilandirilmis analizle belirsizligi azaltan finansal karar altyapisi kurmak.", aboutVision: "Vizyonumuz", aboutVisionText: "Daha net anlayisin, daha dusuk belirsizligin ve daha guclu karar disiplininin kuresel piyasalarda erisilebilir oldugu bir dunya.", aboutCardPlatformT: "Platform", aboutCardPlatformB: "Global Market Analytics; 600+ kuresel kurulusun hisse verisini, IPO durumunu ve piyasa metriklerini tek arayuzde sunmak icin tasarlanmis finansal bilgi platformudur.", aboutCardAIT: "AI Entegrasyonu", aboutCardAIB: "GMA Consensus Engine tarafindan desteklenen platform; yapilandirilmis sirket analizi, risk cercevesi ve stratejik gorunum sunar. Tum ciktilar yalnizca bilgilendirme amaclidir ve yatirim tavsiyesi degildir.", aboutCardDataT: "Tarihsel Veri", aboutCardDataB: "Altin icin 1900'den, baslica para birimleri icin 1930'dan ve diger emtialar icin kayitli en erken tarihlerden 2026'ya uzanan tarihsel grafik endeksleri.", aboutCardSourcesT: "Veri Kaynaklari", aboutCardSourcesB: "Canli veriler Finnhub API ile saglanir. Forex oranlari open.er-api.com kaynaklidir. Harici proxy kullanilmaz.", aboutCardPrivacyT: "Gizlilik", aboutCardPrivacyB: "Kullanici verileri harici sunuculara gonderilmez. Tercihler, API anahtarlari ve portfoy bilgileri yalnizca tarayicinizin localStorage alaninda saklanir.",
    pricingSub: "GMA Consensus Engine'e kurumsal seviyede tek abonelikle erisin.", aiPartners: "Entegre AI Is Ortaklari", pricingNote: "Tek abonelik GMA Consensus Engine'i acar. GPT, Claude ve Gemini destekleyici motorlar olarak calisir; analitik katman GMA'da kalir.", paySuccess: "Erisim Aktif", payKey: "Platform Erisim Anahtariniz", payKeyNote: "Bu anahtar hesabiniza baglidir. Kimseyle paylasmayin.", payContinue: "Piyasalara Git →", planActivated: "Plan Aktif!", payKeyLinkedNote: "Bu anahtar hesabiniza baglidir. Kimseyle paylasmayin.", sovereignAutoNote: "GMA Sovereign Intelligence · Tum modeller otomatik yonetilir. Baska bir seye ihtiyaciniz yok.", footerBrandLine: "Global Market Analytics · 2026 · Bagimsiz Zeka", footerCompliance: "Global Market Analytics (GMA), AI destekli piyasa verisi gorsellestirmesi sunan dijital bir platformdur. GMA kayitli bir yatirim danismani degildir. Tum odemeler is ortagimiz Paddle.com tarafindan guvenli sekilde islenir.", platform: "PLATFORM", addToPortfolio: "PORTFOYE EKLE", currentPrice: "GUNCEL FIYAT", exchange: "BORSA", quantity: "ADET", unitPrice: "Birim Fiyat", totalLabel: "TOPLAM", simulatedTransaction: "Bu simule edilmis bir islemdir - gercek alim yapilmaz"
  },
  ru: {
    feat1t: "Живая лента рынка", feat1d: "Отслеживайте 600+ компаний, крипто, сырьё и валюты в реальном времени", feat2t: "Анализ GMA Triumvirate", feat2d: "Проверяйте институциональное согласование сигналов в GMA Consensus Engine", feat3t: "Исторические графики", feat3d: "Графики с года основания, анализ кризисов и долгосрочные тренды", feat4t: "Сравнение компаний", feat4d: "Сравнивайте до 5 компаний с AI и более ясной риск-рамкой", feat5t: "Умные уведомления", feat5d: "Настройте ценовые оповещения и получайте мгновенные сигналы о росте и падении", feat6t: "8 языков", feat6d: "Интерфейс на английском, турецком, русском, арабском, китайском, хинди, немецком и испанском",
    contactSub: "Мы на связи по любым вопросам и отзывам.", contactInfo: "Контактная информация", formName: "ПОЛНОЕ ИМЯ", formEmail: "EMAIL", formSubject: "ТЕМА", formMsg: "СООБЩЕНИЕ", formSend: "ОТПРАВИТЬ", formSending: "ОТПРАВКА...", formSent: "Сообщение отправлено!", subjectPlaceholder: "Тема", messagePlaceholder: "Ваше сообщение...", namePlaceholder: "Ваше имя",
    aboutTitle: "О Global Market Analytics", aboutSub: "Платформа финансовой аналитики для структурированного анализа, ясности и поддержки решений на глобальных рынках.", aboutMission: "Наша миссия", aboutMissionText: "Создавать инфраструктуру финансовых решений, которая снижает неопределённость через структурированный анализ без инвестиционных рекомендаций.", aboutVision: "Наше видение", aboutVisionText: "Мир, где более ясное понимание, низкая неопределённость и дисциплина решений доступны на глобальных рынках.", aboutCardPlatformT: "Платформа", aboutCardPlatformB: "Global Market Analytics объединяет данные акций, IPO-статус и рыночные метрики 600+ глобальных организаций в одном интерфейсе.", aboutCardAIT: "AI-интеграция", aboutCardAIB: "На базе GMA Consensus Engine платформа даёт структурированный анализ компаний, риск-рамку и стратегический прогноз. Все выводы только информационные.", aboutCardDataT: "Исторические данные", aboutCardDataB: "Исторические индексы: золото с 1900 года, основные валюты с 1930 года, другие товары с самых ранних доступных дат до 2026.", aboutCardSourcesT: "Источники данных", aboutCardSourcesB: "Живые данные поставляет Finnhub API. Forex курсы берутся из open.er-api.com. Внешние прокси не используются.", aboutCardPrivacyT: "Конфиденциальность", aboutCardPrivacyB: "Данные пользователя не отправляются на внешние серверы. Предпочтения, API-ключи и портфель хранятся только в localStorage браузера.",
    pricingSub: "Доступ к GMA Consensus Engine по одной подписке институционального уровня.", aiPartners: "Интегрированные AI-партнёры", pricingNote: "Одна подписка открывает GMA Consensus Engine. GPT, Claude и Gemini работают как поддерживающие движки; GMA остаётся аналитическим слоем.", paySuccess: "Доступ активирован", payKey: "Ваш ключ доступа", payKeyNote: "Этот ключ привязан к вашему аккаунту. Не передавайте его.", payContinue: "К рынкам →", planActivated: "План активирован!", payKeyLinkedNote: "Этот ключ привязан к вашему аккаунту. Не передавайте его.", sovereignAutoNote: "GMA Sovereign Intelligence · Все модели управляются автоматически. Больше ничего не нужно.", footerBrandLine: "Global Market Analytics · 2026 · Суверенная аналитика", footerCompliance: "Global Market Analytics (GMA) — цифровая платформа для AI-визуализации рыночных данных. GMA не является зарегистрированным инвестиционным консультантом. Все платежи безопасно обрабатываются партнёром Paddle.com.", platform: "ПЛАТФОРМА", addToPortfolio: "ДОБАВИТЬ В ПОРТФЕЛЬ", currentPrice: "ТЕКУЩАЯ ЦЕНА", exchange: "БИРЖА", quantity: "КОЛИЧЕСТВО", unitPrice: "Цена за единицу", totalLabel: "ИТОГО", simulatedTransaction: "Это симулированная операция - реальная покупка не выполняется"
  },
  ar: {
    feat3t: "الرسوم التاريخية", feat3d: "رسوم من سنة التأسيس وتحليل الأزمات والاتجاهات طويلة الأجل", feat4t: "مقارنة الشركات", feat4d: "قارن حتى 5 شركات بمساعدة AI مع إطار مخاطر أوضح", feat5t: "تنبيهات ذكية", feat5d: "اضبط تنبيهات أهداف الأسعار واحصل على إشعارات فورية عند الصعود والهبوط", feat6t: "8 لغات", feat6d: "تجربة بالإنجليزية والتركية والروسية والعربية والصينية والهندية والألمانية والإسبانية",
    contactSub: "نحن هنا لأي أسئلة أو ملاحظات.", contactInfo: "معلومات الاتصال", formName: "الاسم الكامل", formEmail: "البريد الإلكتروني", formSubject: "الموضوع", formMsg: "الرسالة", formSend: "إرسال", formSending: "جار الإرسال...", formSent: "تم إرسال رسالتك!", aboutTitle: "حول Global Market Analytics", aboutSub: "منصة ذكاء مالي تقدم تحليلاً منظماً ووضوحاً ودعماً للقرارات عبر الأسواق العالمية.", aboutMission: "مهمتنا", aboutMissionText: "بناء بنية تحتية للقرارات المالية تقلل عدم اليقين من خلال التحليل المنظم دون تقديم نصيحة استثمارية.", aboutVision: "رؤيتنا", aboutVisionText: "عالم تصبح فيه الرؤية الأوضح والانضباط الأقوى في القرار متاحين عبر الأسواق العالمية.", aboutCardPlatformT: "المنصة", aboutCardPlatformB: "Global Market Analytics منصة معلومات مالية تعرض بيانات الأسهم وحالة IPO ومؤشرات السوق لأكثر من 600 مؤسسة عالمية في واجهة واحدة.", aboutCardAIT: "تكامل AI", aboutCardAIB: "بدعم من GMA Consensus Engine تقدم المنصة تحليلاً منظماً للشركات وإطاراً للمخاطر ونظرة استراتيجية. كل المخرجات معلوماتية فقط.", aboutCardDataT: "البيانات التاريخية", aboutCardDataB: "مؤشرات رسوم تاريخية للذهب من 1900، وللعملات الرئيسية من 1930، وللسلع الأخرى من أقدم التواريخ المسجلة حتى 2026.", aboutCardSourcesT: "مصادر البيانات", aboutCardSourcesB: "توفر Finnhub API البيانات الحية. أسعار الفوركس من open.er-api.com. لا تستخدم بروكسيات خارجية.", aboutCardPrivacyT: "الخصوصية", aboutCardPrivacyB: "لا تُرسل بيانات المستخدم إلى خوادم خارجية. تحفظ التفضيلات ومفاتيح API ومعلومات المحفظة في localStorage داخل المتصفح فقط.", footerDesc: "منصة ذكاء مالي صممت لتقديم وضوح عبر الأسواق العالمية.", pricingSub: "الوصول إلى GMA Consensus Engine عبر اشتراك مؤسسي واحد.", payContinue: "اذهب إلى الأسواق →", planActivated: "تم تفعيل الخطة!", payKeyLinkedNote: "هذا المفتاح مرتبط بحسابك. لا تشاركه مع أحد.", sovereignAutoNote: "GMA Sovereign Intelligence · تتم إدارة جميع النماذج تلقائياً. لا تحتاج إلى أي شيء آخر.", footerBrandLine: "Global Market Analytics · 2026 · ذكاء مستقل", footerCompliance: "Global Market Analytics (GMA) منصة رقمية تعرض بيانات السوق المدعومة بالذكاء الاصطناعي. GMA ليست مستشاراً استثمارياً مسجلاً. تتم معالجة جميع المدفوعات بأمان عبر شريكنا Paddle.com.", platform: "المنصة", addToPortfolio: "أضف إلى المحفظة", currentPrice: "السعر الحالي", exchange: "البورصة", quantity: "الكمية", unitPrice: "سعر الوحدة", totalLabel: "الإجمالي", simulatedTransaction: "هذه عملية محاكاة - لا يتم شراء حقيقي"
  },
  zh: {
    feat3t: "历史图表", feat3d: "从成立年份开始的历史图表、危机分析和长期趋势", feat4t: "公司比较", feat4d: "最多比较 5 家公司，并通过 AI 获得更清晰的风险框架", feat5t: "智能提醒", feat5d: "设置目标价格提醒，在上涨和下跌时获得即时通知", feat6t: "8 种语言", feat6d: "支持英语、土耳其语、俄语、阿拉伯语、中文、印地语、德语和西班牙语",
    contactSub: "我们随时回答您的问题并接收反馈。", contactInfo: "联系信息", formName: "姓名", formEmail: "电子邮箱", formSubject: "主题", formMsg: "消息", formSend: "发送", formSending: "发送中...", formSent: "您的消息已发送！", aboutTitle: "关于 Global Market Analytics", aboutSub: "面向全球市场的金融智能平台，提供结构化分析、清晰视角和决策支持。", aboutMission: "我们的使命", aboutMissionText: "通过结构化分析降低不确定性，同时不跨越投资建议边界，建设金融决策基础设施。", aboutVision: "我们的愿景", aboutVisionText: "让更清晰的理解、更低的不确定性和更强的决策纪律在全球市场中触手可及。", aboutCardPlatformT: "平台", aboutCardPlatformB: "Global Market Analytics 是金融信息平台，在一个界面中提供 600+ 全球机构的股票数据、IPO 状态和市场指标。", aboutCardAIT: "AI 集成", aboutCardAIB: "平台由 GMA Consensus Engine 驱动，提供结构化公司分析、风险框架和战略展望。所有输出仅供参考。", aboutCardDataT: "历史数据", aboutCardDataB: "黄金历史图表可追溯至 1900 年，主要货币至 1930 年，其他大宗商品至最早记录日期，并覆盖到 2026 年。", aboutCardSourcesT: "数据来源", aboutCardSourcesB: "实时数据由 Finnhub API 提供。外汇汇率来自 open.er-api.com。不使用外部代理。", aboutCardPrivacyT: "隐私", aboutCardPrivacyB: "用户数据不会发送到外部服务器。偏好、API 密钥和投资组合信息仅存储在浏览器 localStorage 中。", footerDesc: "为全球市场提供清晰视角的金融智能平台。", pricingSub: "通过一个机构级订阅访问 GMA Consensus Engine。", payContinue: "前往市场 →", planActivated: "计划已激活！", payKeyLinkedNote: "此密钥与您的账户绑定。请勿分享给任何人。", sovereignAutoNote: "GMA Sovereign Intelligence · 所有模型自动管理。您无需其他操作。", footerBrandLine: "Global Market Analytics · 2026 · 主权智能", footerCompliance: "Global Market Analytics (GMA) 是提供 AI 驱动市场数据可视化的数字平台。GMA 不是注册投资顾问。所有付款均由合作伙伴 Paddle.com 安全处理。", platform: "平台", addToPortfolio: "添加到投资组合", currentPrice: "当前价格", exchange: "交易所", quantity: "数量", unitPrice: "单价", totalLabel: "总计", simulatedTransaction: "这是模拟交易 - 不会发生真实购买"
  },
  hi: {
    feat3t: "ऐतिहासिक चार्ट", feat3d: "स्थापना वर्ष से ऐतिहासिक चार्ट, संकट विश्लेषण और दीर्घकालिक रुझान", feat4t: "कंपनी तुलना", feat4d: "AI के साथ 5 कंपनियों तक की तुलना और स्पष्ट जोखिम ढांचा", feat5t: "स्मार्ट अलर्ट", feat5d: "लक्ष्य मूल्य अलर्ट सेट करें और बढ़त/गिरावट पर तुरंत सूचनाएँ पाएँ", feat6t: "8 भाषाएँ", feat6d: "अंग्रेज़ी, तुर्की, रूसी, अरबी, चीनी, हिंदी, जर्मन और स्पेनिश अनुभव",
    contactSub: "हम आपके प्रश्नों और प्रतिक्रिया के लिए उपलब्ध हैं।", contactInfo: "संपर्क जानकारी", formName: "पूरा नाम", formEmail: "ईमेल", formSubject: "विषय", formMsg: "संदेश", formSend: "भेजें", formSending: "भेजा जा रहा है...", formSent: "आपका संदेश भेज दिया गया!", aboutTitle: "Global Market Analytics के बारे में", aboutSub: "वैश्विक बाज़ारों में संरचित विश्लेषण, स्पष्टता और निर्णय समर्थन देने वाला वित्तीय इंटेलिजेंस प्लेटफ़ॉर्म।", aboutMission: "हमारा मिशन", aboutMissionText: "निवेश सलाह दिए बिना संरचित विश्लेषण के माध्यम से अनिश्चितता कम करने वाला वित्तीय निर्णय ढांचा बनाना।", aboutVision: "हमारी दृष्टि", aboutVisionText: "ऐसी दुनिया जहाँ स्पष्ट समझ, कम अनिश्चितता और मजबूत निर्णय अनुशासन वैश्विक बाज़ारों में उपलब्ध हों।", aboutCardPlatformT: "प्लेटफ़ॉर्म", aboutCardPlatformB: "Global Market Analytics एक वित्तीय सूचना प्लेटफ़ॉर्म है जो 600+ वैश्विक संगठनों के स्टॉक डेटा, IPO स्थिति और बाज़ार मेट्रिक्स को एक इंटरफ़ेस में देता है।", aboutCardAIT: "AI एकीकरण", aboutCardAIB: "GMA Consensus Engine द्वारा संचालित, प्लेटफ़ॉर्म संरचित कंपनी विश्लेषण, जोखिम फ्रेमिंग और रणनीतिक दृष्टिकोण देता है। सभी आउटपुट केवल जानकारी के लिए हैं।", aboutCardDataT: "ऐतिहासिक डेटा", aboutCardDataB: "सोने के लिए 1900 से, प्रमुख मुद्राओं के लिए 1930 से और अन्य कमोडिटी के लिए उपलब्ध शुरुआती तारीखों से 2026 तक ऐतिहासिक चार्ट।", aboutCardSourcesT: "डेटा स्रोत", aboutCardSourcesB: "लाइव डेटा Finnhub API से आता है। Forex दरें open.er-api.com से ली जाती हैं। बाहरी प्रॉक्सी उपयोग नहीं होते।", aboutCardPrivacyT: "गोपनीयता", aboutCardPrivacyB: "उपयोगकर्ता डेटा बाहरी सर्वरों पर नहीं भेजा जाता। प्राथमिकताएँ, API keys और पोर्टफोलियो जानकारी केवल ब्राउज़र localStorage में रहती है।", footerDesc: "वैश्विक बाज़ारों में स्पष्टता देने के लिए बनाया गया वित्तीय इंटेलिजेंस प्लेटफ़ॉर्म।", pricingSub: "एक संस्थागत-स्तर सदस्यता से GMA Consensus Engine तक पहुँचें।", payContinue: "बाज़ारों पर जाएँ →", planActivated: "योजना सक्रिय!", payKeyLinkedNote: "यह कुंजी आपके खाते से जुड़ी है। इसे किसी से साझा न करें।", sovereignAutoNote: "GMA Sovereign Intelligence · सभी मॉडल स्वतः प्रबंधित होते हैं। आपको और कुछ नहीं चाहिए।", footerBrandLine: "Global Market Analytics · 2026 · स्वतंत्र इंटेलिजेंस", footerCompliance: "Global Market Analytics (GMA) AI-संचालित बाज़ार डेटा विज़ुअलाइज़ेशन देने वाला डिजिटल प्लेटफ़ॉर्म है। GMA पंजीकृत निवेश सलाहकार नहीं है। सभी भुगतान हमारे भागीदार Paddle.com द्वारा सुरक्षित रूप से संसाधित होते हैं।", platform: "प्लेटफ़ॉर्म"
  },
  de: {
    feat1t: "Live-Marktfeed", feat1d: "Verfolgen Sie 600+ Unternehmen, Krypto, Rohstoffe und Währungen in Echtzeit", feat2t: "GMA Triumvirate Analyse", feat2d: "Prüfen Sie institutionelle Signalabstimmung über die GMA Consensus Engine", feat3t: "Historische Charts", feat3d: "Historische Charts ab Gründungsjahr, Krisenanalyse und langfristige Trends", feat4t: "Unternehmensvergleich", feat4d: "Vergleichen Sie bis zu 5 Unternehmen mit AI und klarerem Risikorahmen", feat5t: "Intelligente Alarme", feat5d: "Legen Sie Kursziel-Alarme fest und erhalten Sie sofortige Benachrichtigungen bei Anstiegen und Rückgängen", feat6t: "8 Sprachen", feat6d: "Plattformerlebnis auf Englisch, Türkisch, Russisch, Arabisch, Chinesisch, Hindi, Deutsch und Spanisch",
    contactSub: "Wir sind für Fragen und Feedback da.", contactInfo: "Kontaktinformationen", formName: "VOLLSTÄNDIGER NAME", formEmail: "E-MAIL", formSubject: "BETREFF", formMsg: "NACHRICHT", formSend: "SENDEN", formSending: "SENDEN...", formSent: "Ihre Nachricht wurde gesendet!", subjectPlaceholder: "Betreff", messagePlaceholder: "Ihre Nachricht...", namePlaceholder: "Ihr Name",
    aboutTitle: "Über Global Market Analytics", aboutSub: "Eine Finanzintelligenz-Plattform für strukturierte Analysen, Klarheit und Entscheidungsunterstützung in globalen Märkten.", aboutMission: "Unsere Mission", aboutMissionText: "Finanzielle Entscheidungsinfrastruktur aufzubauen, die Unsicherheit durch strukturierte Analyse reduziert, ohne Anlageberatung zu leisten.", aboutVision: "Unsere Vision", aboutVisionText: "Eine Welt, in der klareres Verständnis, geringere Unsicherheit und stärkere Entscheidungsdisziplin in globalen Märkten zugänglich sind.", aboutCardPlatformT: "Plattform", aboutCardPlatformB: "Global Market Analytics bündelt Aktiendaten, IPO-Status und Marktkennzahlen von 600+ globalen Organisationen in einer Oberfläche.", aboutCardAIT: "AI-Integration", aboutCardAIB: "Angetrieben von der GMA Consensus Engine liefert die Plattform strukturierte Unternehmensanalyse, Risikorahmen und strategische Ausblicke. Alle Ausgaben dienen nur Informationszwecken.", aboutCardDataT: "Historische Daten", aboutCardDataB: "Historische Chart-Indizes ab 1900 für Gold, ab 1930 für wichtige Währungen und ab den frühesten Aufzeichnungen für weitere Rohstoffe bis 2026.", aboutCardSourcesT: "Datenquellen", aboutCardSourcesB: "Live-Daten kommen über Finnhub API. Forex-Kurse stammen von open.er-api.com. Externe Proxys werden nicht genutzt.", aboutCardPrivacyT: "Datenschutz", aboutCardPrivacyB: "Nutzerdaten werden nicht an externe Server gesendet. Präferenzen, API-Schlüssel und Portfoliodaten bleiben ausschließlich im Browser-localStorage.",
    pricingSub: "Zugriff auf die GMA Consensus Engine über ein institutionelles Abonnement.", aiPartners: "Integrierte AI-Partner", pricingNote: "Ein Abonnement schaltet die GMA Consensus Engine frei. GPT, Claude und Gemini dienen als unterstützende Engines; GMA bleibt die analytische Ebene.", paySuccess: "Zugang aktiviert", payKey: "Ihr Plattform-Zugangsschlüssel", payKeyNote: "Dieser Schlüssel ist mit Ihrem Konto verknüpft. Teilen Sie ihn nicht.", payContinue: "Zu Märkten →", planActivated: "Plan aktiviert!", payKeyLinkedNote: "Dieser Schlüssel ist mit Ihrem Konto verknüpft. Teilen Sie ihn nicht.", sovereignAutoNote: "GMA Sovereign Intelligence · Alle Modelle werden automatisch verwaltet. Sie benötigen nichts Weiteres.", footerBrandLine: "Global Market Analytics · 2026 · Souveräne Intelligenz", footerCompliance: "Global Market Analytics (GMA) ist eine digitale Plattform für AI-gestützte Marktdatenvisualisierung. GMA ist kein registrierter Anlageberater. Alle Zahlungen werden sicher über unseren Partner Paddle.com verarbeitet.", platform: "PLATTFORM"
  },
  es: {
    feat1t: "Feed de mercado en vivo", feat1d: "Sigue 600+ compañías, cripto, materias primas y divisas en tiempo real", feat2t: "Análisis GMA Triumvirate", feat2d: "Revisa la alineación institucional de señales desde GMA Consensus Engine", feat3t: "Gráficos históricos", feat3d: "Gráficos desde el año de fundación, análisis de crisis y tendencias de largo plazo", feat4t: "Comparación de empresas", feat4d: "Compara hasta 5 empresas con AI y un marco de riesgo más claro", feat5t: "Alertas inteligentes", feat5d: "Configura alertas de precio objetivo y recibe notificaciones instantáneas de subidas y bajadas", feat6t: "8 idiomas", feat6d: "Experiencia en inglés, turco, ruso, árabe, chino, hindi, alemán y español",
    contactSub: "Estamos aquí para cualquier pregunta y comentario.", contactInfo: "Información de contacto", formName: "NOMBRE COMPLETO", formEmail: "EMAIL", formSubject: "ASUNTO", formMsg: "MENSAJE", formSend: "ENVIAR", formSending: "ENVIANDO...", formSent: "¡Tu mensaje ha sido enviado!", subjectPlaceholder: "Asunto", messagePlaceholder: "Tu mensaje...", namePlaceholder: "Tu nombre",
    aboutTitle: "Acerca de Global Market Analytics", aboutSub: "Una plataforma de inteligencia financiera que ofrece análisis estructurado, claridad y apoyo de decisión en mercados globales.", aboutMission: "Nuestra misión", aboutMissionText: "Construir infraestructura de decisión financiera que reduzca la incertidumbre mediante análisis estructurado sin convertirse en asesoramiento de inversión.", aboutVision: "Nuestra visión", aboutVisionText: "Un mundo donde una comprensión más clara, menor incertidumbre y mayor disciplina de decisión sean accesibles en los mercados globales.", aboutCardPlatformT: "Plataforma", aboutCardPlatformB: "Global Market Analytics reúne datos de acciones, estado IPO y métricas de mercado de 600+ organizaciones globales en una sola interfaz.", aboutCardAIT: "Integración AI", aboutCardAIB: "Impulsada por GMA Consensus Engine, la plataforma entrega análisis estructurado de compañías, marco de riesgo y perspectivas estratégicas. Todos los resultados son solo informativos.", aboutCardDataT: "Datos históricos", aboutCardDataB: "Índices de gráficos históricos desde 1900 para oro, desde 1930 para divisas principales y desde las primeras fechas registradas para otros commodities hasta 2026.", aboutCardSourcesT: "Fuentes de datos", aboutCardSourcesB: "Los datos en vivo se proporcionan vía Finnhub API. Las tasas forex provienen de open.er-api.com. No se usan proxies externos.", aboutCardPrivacyT: "Privacidad", aboutCardPrivacyB: "Los datos de usuario nunca se envían a servidores externos. Preferencias, claves API e información de cartera se guardan solo en localStorage del navegador.",
    pricingSub: "Accede a GMA Consensus Engine mediante una suscripción institucional.", aiPartners: "Partners AI integrados", pricingNote: "Una suscripción desbloquea GMA Consensus Engine. GPT, Claude y Gemini operan como motores de apoyo; GMA sigue siendo la capa analítica.", paySuccess: "Acceso activado", payKey: "Tu clave de acceso", payKeyNote: "Esta clave está vinculada a tu cuenta. No la compartas.", payContinue: "Ir a mercados →", planActivated: "¡Plan activado!", payKeyLinkedNote: "Esta clave está vinculada a tu cuenta. No la compartas.", sovereignAutoNote: "GMA Sovereign Intelligence · Todos los modelos se gestionan automáticamente. No necesitas nada más.", footerBrandLine: "Global Market Analytics · 2026 · Inteligencia soberana", footerCompliance: "Global Market Analytics (GMA) es una plataforma digital que ofrece visualización de datos de mercado impulsada por AI. GMA no es un asesor de inversiones registrado. Todos los pagos son procesados de forma segura por nuestro socio Paddle.com.", platform: "PLATAFORMA"
  }
};
Object.entries(GMA_CONTENT_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_STATIC_UI_I18N = {
  en: {
    founded: "Founded", sectorMeta: "Sector", livePrice: "Live", yearsOfMarketHistory: "years of market history", simulatedHistoricalData: "Simulated historical data · Based on the current live price", keyEvents: "KEY EVENTS", today: "today",
    yearHistoricalChart: "Year Historical Chart", starter: "STARTER", current: "CURRENT", historicalHigh: "HISTORICAL HIGH", historicalLow: "HISTORICAL LOW", totalReturn: "TOTAL RETURN", historicalDataNotice: "Historical data is for reference only and is not investment advice",
    liveCommoditiesForex: "LIVE COMMODITIES & FOREX", metals: "METALS", energy: "ENERGY", forex: "FOREX", fetchingData: "Fetching data...", liveDataStatus: "LIVE DATA", simulated: "SIMULATED", refresh: "REFRESH", refreshTitle: "Refresh", forexSourceNote: "Frankfurter API · ECB data · 1 USD = X units · Change versus previous day", commoditySourceNote: "Finnhub API · Real-time · Live data",
    companyComparisonAnalysis: "COMPANY COMPARISON ANALYSIS", companiesAiComparison: "companies · AI-powered comparison", overview: "OVERVIEW", scoreAnalysis: "SCORE ANALYSIS", recommendation: "RECOMMENDATION", companiesReady: "Companies Ready", startAiComparisonAnalysis: "Start AI Comparison Analysis", comparisonIntro: "GMA Intelligence Layer generates detailed scores and recommendations for each company", aiAnalysisRunning: "AI analysis is running...", companiesBeingCompared: "are being compared", signInRequired: "Sign-in Required", comparisonLoginRequired: "You need to sign in to your account for company comparison analysis.", analysisError: "Analysis Error", tryAgain: "Try Again", previewModeSampleData: "PREVIEW MODE · SAMPLE DATA", recommended: "RECOMMENDED", totalScore: "TOTAL SCORE", growth: "GROWTH", risk: "RISK", growthPotential: "Growth Potential", financialStrength: "Financial Strength", innovationScore: "Innovation Score", marketPosition: "Market Position", riskLevel: "Risk Level", strengths: "STRENGTHS", risks: "RISKS", aiRecommendation: "AI RECOMMENDATION", aiConfidenceRate: "AI CONFIDENCE RATE", globalRiskShare: "GLOBAL RISK SHARE", globalRisk: "Global Risk", aiConfidence: "AI Confidence", alternativeChoice: "ALTERNATIVE CHOICE", scoreRanking: "SCORE RANKING", finalDecisionNotice: "FINAL DECISION BELONGS TO THE INVESTOR - NOT INVESTMENT ADVICE",
    finalBullet1: "This analysis is only an AI-based digital assessment.", finalBullet2: "No recommendation replaces a final investment decision.", finalBullet3: "A 5% global risk allowance is included in the calculations.", finalBullet4: "All trading decisions are the investor's responsibility.", finalBullet5: "Past performance does not guarantee future returns.", finalBullet6: "Consult a licensed financial advisor."
  },
  tr: {
    founded: "Kurulus", sectorMeta: "Sektor", livePrice: "Canli", yearsOfMarketHistory: "yillik piyasa gecmisi", simulatedHistoricalData: "Simule tarihsel veri · Mevcut canli fiyata dayalidir", keyEvents: "ONEMLI OLAYLAR", today: "bugun",
    yearHistoricalChart: "Yillik Tarihsel Grafik", starter: "BASLANGIC", current: "GUNCEL", historicalHigh: "TARIHSEL ZIRVE", historicalLow: "TARIHSEL DIP", totalReturn: "TOPLAM GETIRI", historicalDataNotice: "Tarihsel veri yalnizca referans amaclidir ve yatirim tavsiyesi degildir",
    liveCommoditiesForex: "CANLI EMTIA & FOREX", metals: "METALLER", energy: "ENERJI", forex: "FOREX", fetchingData: "Veri aliniyor...", liveDataStatus: "CANLI VERI", simulated: "SIMULE", refresh: "YENILE", refreshTitle: "Yenile", forexSourceNote: "Frankfurter API · ECB verisi · 1 USD = X birim · Onceki gune gore degisim", commoditySourceNote: "Finnhub API · Gercek zamanli · Canli veri",
    companyComparisonAnalysis: "SIRKET KARSILASTIRMA ANALIZI", companiesAiComparison: "sirket · AI destekli karsilastirma", overview: "GENEL BAKIS", scoreAnalysis: "SKOR ANALIZI", recommendation: "ONERI", companiesReady: "Sirket Hazir", startAiComparisonAnalysis: "AI Karsilastirma Analizini Baslat", comparisonIntro: "GMA Zeka Katmani her sirket icin detayli skorlar ve oneriler uretir", aiAnalysisRunning: "AI analizi calisiyor...", companiesBeingCompared: "karsilastiriliyor", signInRequired: "Giris Gerekli", comparisonLoginRequired: "Sirket karsilastirma analizi icin hesabiniza giris yapmalisiniz.", analysisError: "Analiz Hatasi", tryAgain: "Tekrar Dene", previewModeSampleData: "ONIZLEME MODU · ORNEK VERI", recommended: "ONERILEN", totalScore: "TOPLAM SKOR", growth: "BUYUME", risk: "RISK", growthPotential: "Buyume Potansiyeli", financialStrength: "Finansal Guc", innovationScore: "Inovasyon Skoru", marketPosition: "Piyasa Konumu", riskLevel: "Risk Seviyesi", strengths: "GUCLU YONLER", risks: "RISKLER", aiRecommendation: "AI ONERISI", aiConfidenceRate: "AI GUVEN ORANI", globalRiskShare: "KURESEL RISK PAYI", globalRisk: "Kuresel Risk", aiConfidence: "AI Guveni", alternativeChoice: "ALTERNATIF SECIM", scoreRanking: "SKOR SIRALAMASI", finalDecisionNotice: "NIHAI KARAR YATIRIMCIYA AITTIR - YATIRIM TAVSIYESI DEGILDIR",
    finalBullet1: "Bu analiz yalnizca AI tabanli dijital bir degerlendirmedir.", finalBullet2: "Hicbir oneri nihai yatirim kararinin yerine gecmez.", finalBullet3: "Hesaplamalara %5 kuresel risk payi dahildir.", finalBullet4: "Tum islem kararlari yatirimcinin sorumlulugundadir.", finalBullet5: "Gecmis performans gelecek getirileri garanti etmez.", finalBullet6: "Lisansli bir finansal danismana basvurun."
  },
  ru: {
    founded: "Основано", sectorMeta: "Сектор", livePrice: "Живая цена", yearsOfMarketHistory: "лет рыночной истории", simulatedHistoricalData: "Симулированные исторические данные · На основе текущей цены", keyEvents: "КЛЮЧЕВЫЕ СОБЫТИЯ", today: "сегодня",
    yearHistoricalChart: "Летний исторический график", starter: "СТАРТ", current: "ТЕКУЩЕЕ", historicalHigh: "ИСТОРИЧЕСКИЙ МАКСИМУМ", historicalLow: "ИСТОРИЧЕСКИЙ МИНИМУМ", totalReturn: "ОБЩАЯ ДОХОДНОСТЬ", historicalDataNotice: "Исторические данные только для справки и не являются инвестиционной рекомендацией",
    liveCommoditiesForex: "ЖИВЫЕ ТОВАРЫ И FOREX", metals: "МЕТАЛЛЫ", energy: "ЭНЕРГИЯ", forex: "FOREX", fetchingData: "Загрузка данных...", liveDataStatus: "ЖИВЫЕ ДАННЫЕ", simulated: "СИМУЛЯЦИЯ", refresh: "ОБНОВИТЬ", refreshTitle: "Обновить", forexSourceNote: "Frankfurter API · данные ECB · 1 USD = X единиц · изменение к предыдущему дню", commoditySourceNote: "Finnhub API · реальное время · живые данные",
    companyComparisonAnalysis: "АНАЛИЗ СРАВНЕНИЯ КОМПАНИЙ", companiesAiComparison: "компании · сравнение с AI", overview: "ОБЗОР", scoreAnalysis: "АНАЛИЗ БАЛЛОВ", recommendation: "РЕКОМЕНДАЦИЯ", companiesReady: "Компании готовы", startAiComparisonAnalysis: "Начать AI-сравнение", comparisonIntro: "GMA Intelligence Layer создаёт подробные оценки и рекомендации по каждой компании", aiAnalysisRunning: "AI-анализ выполняется...", companiesBeingCompared: "сравниваются", signInRequired: "Требуется вход", comparisonLoginRequired: "Для анализа сравнения компаний нужно войти в аккаунт.", analysisError: "Ошибка анализа", tryAgain: "Попробовать снова", previewModeSampleData: "РЕЖИМ ПРЕДПРОСМОТРА · ПРИМЕРНЫЕ ДАННЫЕ", recommended: "РЕКОМЕНДУЕТСЯ", totalScore: "ОБЩИЙ БАЛЛ", growth: "РОСТ", risk: "РИСК", growthPotential: "Потенциал роста", financialStrength: "Финансовая сила", innovationScore: "Инновационный балл", marketPosition: "Позиция на рынке", riskLevel: "Уровень риска", strengths: "СИЛЬНЫЕ СТОРОНЫ", risks: "РИСКИ", aiRecommendation: "AI-РЕКОМЕНДАЦИЯ", aiConfidenceRate: "УВЕРЕННОСТЬ AI", globalRiskShare: "ДОЛЯ ГЛОБАЛЬНОГО РИСКА", globalRisk: "Глобальный риск", aiConfidence: "Уверенность AI", alternativeChoice: "АЛЬТЕРНАТИВНЫЙ ВЫБОР", scoreRanking: "РЕЙТИНГ БАЛЛОВ", finalDecisionNotice: "ФИНАЛЬНОЕ РЕШЕНИЕ ПРИНИМАЕТ ИНВЕСТОР - НЕ ИНВЕСТИЦИОННАЯ РЕКОМЕНДАЦИЯ",
    finalBullet1: "Этот анализ является только AI-цифровой оценкой.", finalBullet2: "Ни одна рекомендация не заменяет финальное инвестиционное решение.", finalBullet3: "В расчётах учтено 5% глобального риска.", finalBullet4: "Все торговые решения на ответственности инвестора.", finalBullet5: "Прошлые результаты не гарантируют будущую доходность.", finalBullet6: "Обратитесь к лицензированному финансовому консультанту."
  },
  ar: {
    founded: "تأسست", sectorMeta: "القطاع", livePrice: "السعر المباشر", yearsOfMarketHistory: "سنة من تاريخ السوق", simulatedHistoricalData: "بيانات تاريخية محاكاة · بناء على السعر المباشر الحالي", keyEvents: "أحداث رئيسية", today: "اليوم",
    yearHistoricalChart: "رسم تاريخي بالسنوات", starter: "البداية", current: "الحالي", historicalHigh: "أعلى مستوى تاريخي", historicalLow: "أدنى مستوى تاريخي", totalReturn: "العائد الإجمالي", historicalDataNotice: "البيانات التاريخية للمرجع فقط وليست نصيحة استثمارية",
    liveCommoditiesForex: "السلع والفوركس مباشرة", metals: "المعادن", energy: "الطاقة", forex: "الفوركس", fetchingData: "جار جلب البيانات...", liveDataStatus: "بيانات مباشرة", simulated: "محاكاة", refresh: "تحديث", refreshTitle: "تحديث", forexSourceNote: "Frankfurter API · بيانات ECB · 1 USD = X وحدات · التغير مقابل اليوم السابق", commoditySourceNote: "Finnhub API · وقت حقيقي · بيانات مباشرة",
    companyComparisonAnalysis: "تحليل مقارنة الشركات", companiesAiComparison: "شركات · مقارنة مدعومة بالذكاء الاصطناعي", overview: "نظرة عامة", scoreAnalysis: "تحليل الدرجات", recommendation: "توصية", companiesReady: "شركات جاهزة", startAiComparisonAnalysis: "ابدأ تحليل مقارنة AI", comparisonIntro: "تولد طبقة ذكاء GMA درجات وتوصيات تفصيلية لكل شركة", aiAnalysisRunning: "تحليل AI قيد التشغيل...", companiesBeingCompared: "تتم مقارنتها", signInRequired: "تسجيل الدخول مطلوب", comparisonLoginRequired: "تحتاج إلى تسجيل الدخول لحسابك لتحليل مقارنة الشركات.", analysisError: "خطأ في التحليل", tryAgain: "حاول مرة أخرى", previewModeSampleData: "وضع المعاينة · بيانات نموذجية", recommended: "موصى به", totalScore: "الدرجة الإجمالية", growth: "النمو", risk: "المخاطر", growthPotential: "إمكانات النمو", financialStrength: "القوة المالية", innovationScore: "درجة الابتكار", marketPosition: "الموقع السوقي", riskLevel: "مستوى المخاطر", strengths: "نقاط القوة", risks: "المخاطر", aiRecommendation: "توصية AI", aiConfidenceRate: "معدل ثقة AI", globalRiskShare: "حصة المخاطر العالمية", globalRisk: "المخاطر العالمية", aiConfidence: "ثقة AI", alternativeChoice: "خيار بديل", scoreRanking: "ترتيب الدرجات", finalDecisionNotice: "القرار النهائي يعود للمستثمر - ليست نصيحة استثمارية",
    finalBullet1: "هذا التحليل تقييم رقمي قائم على AI فقط.", finalBullet2: "لا تحل أي توصية محل قرار الاستثمار النهائي.", finalBullet3: "تتضمن الحسابات مخصص مخاطر عالمي بنسبة 5%.", finalBullet4: "كل قرارات التداول مسؤولية المستثمر.", finalBullet5: "الأداء السابق لا يضمن عوائد مستقبلية.", finalBullet6: "استشر مستشارا ماليا مرخصا."
  },
  zh: {
    founded: "成立", sectorMeta: "行业", livePrice: "实时价格", yearsOfMarketHistory: "年市场历史", simulatedHistoricalData: "模拟历史数据 · 基于当前实时价格", keyEvents: "关键事件", today: "今天",
    yearHistoricalChart: "年度历史图表", starter: "起点", current: "当前", historicalHigh: "历史高点", historicalLow: "历史低点", totalReturn: "总回报", historicalDataNotice: "历史数据仅供参考，不构成投资建议",
    liveCommoditiesForex: "实时大宗商品与外汇", metals: "金属", energy: "能源", forex: "外汇", fetchingData: "正在获取数据...", liveDataStatus: "实时数据", simulated: "模拟", refresh: "刷新", refreshTitle: "刷新", forexSourceNote: "Frankfurter API · ECB 数据 · 1 USD = X 单位 · 较前一日变化", commoditySourceNote: "Finnhub API · 实时 · 实时数据",
    companyComparisonAnalysis: "公司比较分析", companiesAiComparison: "家公司 · AI 辅助比较", overview: "概览", scoreAnalysis: "评分分析", recommendation: "推荐", companiesReady: "家公司已准备", startAiComparisonAnalysis: "开始 AI 比较分析", comparisonIntro: "GMA 智能层为每家公司生成详细评分和建议", aiAnalysisRunning: "AI 分析正在运行...", companiesBeingCompared: "正在比较", signInRequired: "需要登录", comparisonLoginRequired: "您需要登录账户才能使用公司比较分析。", analysisError: "分析错误", tryAgain: "重试", previewModeSampleData: "预览模式 · 示例数据", recommended: "推荐", totalScore: "总分", growth: "增长", risk: "风险", growthPotential: "增长潜力", financialStrength: "财务实力", innovationScore: "创新评分", marketPosition: "市场地位", riskLevel: "风险等级", strengths: "优势", risks: "风险", aiRecommendation: "AI 推荐", aiConfidenceRate: "AI 置信度", globalRiskShare: "全球风险占比", globalRisk: "全球风险", aiConfidence: "AI 置信度", alternativeChoice: "备选方案", scoreRanking: "评分排名", finalDecisionNotice: "最终决定属于投资者 - 不构成投资建议",
    finalBullet1: "此分析仅为基于 AI 的数字评估。", finalBullet2: "任何建议都不能替代最终投资决定。", finalBullet3: "计算中包含 5% 的全球风险余量。", finalBullet4: "所有交易决定均由投资者负责。", finalBullet5: "过去表现不保证未来收益。", finalBullet6: "请咨询持牌金融顾问。"
  },
  hi: {
    founded: "स्थापना", sectorMeta: "क्षेत्र", livePrice: "लाइव मूल्य", yearsOfMarketHistory: "वर्ष का बाज़ार इतिहास", simulatedHistoricalData: "सिम्युलेटेड ऐतिहासिक डेटा · वर्तमान लाइव मूल्य पर आधारित", keyEvents: "मुख्य घटनाएँ", today: "आज",
    yearHistoricalChart: "वर्षीय ऐतिहासिक चार्ट", starter: "आरंभ", current: "वर्तमान", historicalHigh: "ऐतिहासिक उच्च", historicalLow: "ऐतिहासिक निम्न", totalReturn: "कुल रिटर्न", historicalDataNotice: "ऐतिहासिक डेटा केवल संदर्भ के लिए है और निवेश सलाह नहीं है",
    liveCommoditiesForex: "लाइव कमोडिटी और फॉरेक्स", metals: "धातु", energy: "ऊर्जा", forex: "फॉरेक्स", fetchingData: "डेटा लाया जा रहा है...", liveDataStatus: "लाइव डेटा", simulated: "सिम्युलेटेड", refresh: "रीफ्रेश", refreshTitle: "रीफ्रेश", forexSourceNote: "Frankfurter API · ECB डेटा · 1 USD = X इकाइयाँ · पिछले दिन की तुलना में बदलाव", commoditySourceNote: "Finnhub API · रीयल-टाइम · लाइव डेटा",
    companyComparisonAnalysis: "कंपनी तुलना विश्लेषण", companiesAiComparison: "कंपनियाँ · AI-सहायता वाली तुलना", overview: "अवलोकन", scoreAnalysis: "स्कोर विश्लेषण", recommendation: "सिफारिश", companiesReady: "कंपनियाँ तैयार", startAiComparisonAnalysis: "AI तुलना विश्लेषण शुरू करें", comparisonIntro: "GMA Intelligence Layer हर कंपनी के लिए विस्तृत स्कोर और सुझाव बनाता है", aiAnalysisRunning: "AI विश्लेषण चल रहा है...", companiesBeingCompared: "की तुलना हो रही है", signInRequired: "साइन-इन आवश्यक", comparisonLoginRequired: "कंपनी तुलना विश्लेषण के लिए आपको अपने खाते में साइन इन करना होगा।", analysisError: "विश्लेषण त्रुटि", tryAgain: "फिर कोशिश करें", previewModeSampleData: "पूर्वावलोकन मोड · नमूना डेटा", recommended: "अनुशंसित", totalScore: "कुल स्कोर", growth: "वृद्धि", risk: "जोखिम", growthPotential: "वृद्धि क्षमता", financialStrength: "वित्तीय मजबूती", innovationScore: "नवाचार स्कोर", marketPosition: "बाज़ार स्थिति", riskLevel: "जोखिम स्तर", strengths: "मजबूतियाँ", risks: "जोखिम", aiRecommendation: "AI सिफारिश", aiConfidenceRate: "AI भरोसा दर", globalRiskShare: "वैश्विक जोखिम हिस्सा", globalRisk: "वैश्विक जोखिम", aiConfidence: "AI भरोसा", alternativeChoice: "वैकल्पिक चयन", scoreRanking: "स्कोर रैंकिंग", finalDecisionNotice: "अंतिम निर्णय निवेशक का है - निवेश सलाह नहीं",
    finalBullet1: "यह विश्लेषण केवल AI-आधारित डिजिटल आकलन है।", finalBullet2: "कोई भी सिफारिश अंतिम निवेश निर्णय की जगह नहीं लेती।", finalBullet3: "गणना में 5% वैश्विक जोखिम भत्ता शामिल है।", finalBullet4: "सभी ट्रेडिंग निर्णय निवेशक की जिम्मेदारी हैं।", finalBullet5: "पिछला प्रदर्शन भविष्य के रिटर्न की गारंटी नहीं देता।", finalBullet6: "लाइसेंस प्राप्त वित्तीय सलाहकार से सलाह लें।"
  },
  de: {
    founded: "Gegrundet", sectorMeta: "Sektor", livePrice: "Live", yearsOfMarketHistory: "Jahre Markthistorie", simulatedHistoricalData: "Simulierte historische Daten · Basierend auf dem aktuellen Live-Preis", keyEvents: "WICHTIGE EREIGNISSE", today: "heute",
    yearHistoricalChart: "Jahres-Historienchart", starter: "START", current: "AKTUELL", historicalHigh: "HISTORISCHES HOCH", historicalLow: "HISTORISCHES TIEF", totalReturn: "GESAMTRENDITE", historicalDataNotice: "Historische Daten dienen nur als Referenz und sind keine Anlageberatung",
    liveCommoditiesForex: "LIVE-ROHSTOFFE & FOREX", metals: "METALLE", energy: "ENERGIE", forex: "FOREX", fetchingData: "Daten werden geladen...", liveDataStatus: "LIVE-DATEN", simulated: "SIMULIERT", refresh: "AKTUALISIEREN", refreshTitle: "Aktualisieren", forexSourceNote: "Frankfurter API · EZB-Daten · 1 USD = X Einheiten · Anderung zum Vortag", commoditySourceNote: "Finnhub API · Echtzeit · Live-Daten",
    companyComparisonAnalysis: "UNTERNEHMENSVERGLEICH-ANALYSE", companiesAiComparison: "Unternehmen · AI-gestutzter Vergleich", overview: "UBERBLICK", scoreAnalysis: "SCORE-ANALYSE", recommendation: "EMPFEHLUNG", companiesReady: "Unternehmen bereit", startAiComparisonAnalysis: "AI-Vergleichsanalyse starten", comparisonIntro: "GMA Intelligence Layer erstellt detaillierte Scores und Empfehlungen fur jedes Unternehmen", aiAnalysisRunning: "AI-Analyse lauft...", companiesBeingCompared: "werden verglichen", signInRequired: "Anmeldung erforderlich", comparisonLoginRequired: "Fur die Unternehmensvergleichsanalyse mussen Sie angemeldet sein.", analysisError: "Analysefehler", tryAgain: "Erneut versuchen", previewModeSampleData: "VORSCHAU-MODUS · BEISPIELDATEN", recommended: "EMPFOHLEN", totalScore: "GESAMTSCORE", growth: "WACHSTUM", risk: "RISIKO", growthPotential: "Wachstumspotenzial", financialStrength: "Finanzielle Starke", innovationScore: "Innovationsscore", marketPosition: "Marktposition", riskLevel: "Risikostufe", strengths: "STARKEN", risks: "RISIKEN", aiRecommendation: "AI-EMPFEHLUNG", aiConfidenceRate: "AI-VERTRAUEN", globalRiskShare: "GLOBALER RISIKOANTEIL", globalRisk: "Globales Risiko", aiConfidence: "AI-Vertrauen", alternativeChoice: "ALTERNATIVE WAHL", scoreRanking: "SCORE-RANKING", finalDecisionNotice: "DIE ENDENTSCHEIDUNG LIEGT BEIM INVESTOR - KEINE ANLAGEBERATUNG",
    finalBullet1: "Diese Analyse ist nur eine AI-basierte digitale Einschatzung.", finalBullet2: "Keine Empfehlung ersetzt eine finale Anlageentscheidung.", finalBullet3: "Ein globaler Risikoaufschlag von 5% ist in den Berechnungen enthalten.", finalBullet4: "Alle Handelsentscheidungen liegen in der Verantwortung des Investors.", finalBullet5: "Vergangene Performance garantiert keine kunftigen Renditen.", finalBullet6: "Konsultieren Sie einen lizenzierten Finanzberater."
  },
  es: {
    founded: "Fundada", sectorMeta: "Sector", livePrice: "En vivo", yearsOfMarketHistory: "anos de historial de mercado", simulatedHistoricalData: "Datos historicos simulados · Basados en el precio actual en vivo", keyEvents: "EVENTOS CLAVE", today: "hoy",
    yearHistoricalChart: "Grafico historico anual", starter: "INICIO", current: "ACTUAL", historicalHigh: "MAXIMO HISTORICO", historicalLow: "MINIMO HISTORICO", totalReturn: "RETORNO TOTAL", historicalDataNotice: "Los datos historicos son solo referencia y no son asesoramiento de inversion",
    liveCommoditiesForex: "COMMODITIES & FOREX EN VIVO", metals: "METALES", energy: "ENERGIA", forex: "FOREX", fetchingData: "Obteniendo datos...", liveDataStatus: "DATOS EN VIVO", simulated: "SIMULADO", refresh: "ACTUALIZAR", refreshTitle: "Actualizar", forexSourceNote: "Frankfurter API · datos ECB · 1 USD = X unidades · cambio frente al dia anterior", commoditySourceNote: "Finnhub API · tiempo real · datos en vivo",
    companyComparisonAnalysis: "ANALISIS DE COMPARACION DE EMPRESAS", companiesAiComparison: "empresas · comparacion con AI", overview: "RESUMEN", scoreAnalysis: "ANALISIS DE PUNTUACION", recommendation: "RECOMENDACION", companiesReady: "Empresas listas", startAiComparisonAnalysis: "Iniciar analisis comparativo AI", comparisonIntro: "GMA Intelligence Layer genera puntuaciones y recomendaciones detalladas para cada empresa", aiAnalysisRunning: "El analisis AI esta en curso...", companiesBeingCompared: "estan siendo comparadas", signInRequired: "Inicio de sesion requerido", comparisonLoginRequired: "Debes iniciar sesion para usar el analisis comparativo de empresas.", analysisError: "Error de analisis", tryAgain: "Intentar de nuevo", previewModeSampleData: "MODO VISTA PREVIA · DATOS DE MUESTRA", recommended: "RECOMENDADA", totalScore: "PUNTUACION TOTAL", growth: "CRECIMIENTO", risk: "RIESGO", growthPotential: "Potencial de crecimiento", financialStrength: "Fortaleza financiera", innovationScore: "Puntuacion de innovacion", marketPosition: "Posicion de mercado", riskLevel: "Nivel de riesgo", strengths: "FORTALEZAS", risks: "RIESGOS", aiRecommendation: "RECOMENDACION AI", aiConfidenceRate: "CONFIANZA AI", globalRiskShare: "CUOTA DE RIESGO GLOBAL", globalRisk: "Riesgo global", aiConfidence: "Confianza AI", alternativeChoice: "OPCION ALTERNATIVA", scoreRanking: "RANKING DE PUNTUACION", finalDecisionNotice: "LA DECISION FINAL PERTENECE AL INVERSOR - NO ES ASESORAMIENTO DE INVERSION",
    finalBullet1: "Este analisis es solo una evaluacion digital basada en AI.", finalBullet2: "Ninguna recomendacion reemplaza la decision final de inversion.", finalBullet3: "Los calculos incluyen una asignacion de riesgo global del 5%.", finalBullet4: "Todas las decisiones de trading son responsabilidad del inversor.", finalBullet5: "El rendimiento pasado no garantiza retornos futuros.", finalBullet6: "Consulta a un asesor financiero autorizado."
  }
};
Object.entries(GMA_STATIC_UI_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_COMPARE_DEMO_I18N = {
  en: {
    demoCompareCompanySummary: "{name} shows solid market positioning with consistent fundamentals and strong competitive moat in its core segments.",
    demoCompareStrength1: "Dominant market share in core segments", demoCompareStrength2: "Strong recurring revenue streams", demoCompareStrength3: "Proven management execution track record",
    demoCompareRisk1: "Market concentration exposure", demoCompareRisk2: "Macro sensitivity in key geographies",
    demoCompareNearFuture: "AI integration and product expansion are expected to sustain the growth trajectory through 2026-2027.",
    demoCompareRationale: "Superior financial metrics combined with the innovation pipeline make this the preferred allocation under current market conditions.",
    demoCompareAlternativeNote: "Strong enterprise positioning and cloud infrastructure provide compelling risk-adjusted returns as a secondary allocation.",
    demoCompareOverall: "The portfolio demonstrates solid diversification across market leaders with complementary business models. The current macro environment favors quality over growth, supporting this allocation strategy."
  },
  tr: {
    demoCompareCompanySummary: "{name}, temel verileri istikrarlı ve ana segmentlerinde rekabet avantajı güçlü bir piyasa konumu gösteriyor.",
    demoCompareStrength1: "Ana segmentlerde baskın pazar payı", demoCompareStrength2: "Güçlü tekrarlayan gelir akışları", demoCompareStrength3: "Kanıtlanmış yönetim uygulama başarısı",
    demoCompareRisk1: "Pazar yoğunlaşması riski", demoCompareRisk2: "Önemli bölgelerde makro hassasiyet",
    demoCompareNearFuture: "AI entegrasyonu ve ürün genişlemesinin 2026-2027 boyunca büyüme çizgisini desteklemesi bekleniyor.",
    demoCompareRationale: "Güçlü finansal göstergeler ve inovasyon hattı, mevcut piyasa koşullarında bu seçimi öne çıkarıyor.",
    demoCompareAlternativeNote: "Güçlü kurumsal konum ve bulut altyapısı, ikincil tercih için cazip risk-getiri dengesi sunuyor.",
    demoCompareOverall: "Portföy, birbirini tamamlayan iş modellerine sahip piyasa liderleri arasında sağlam bir çeşitlendirme gösteriyor. Mevcut makro ortam büyümeden çok kaliteyi destekliyor."
  },
  ru: {
    demoCompareCompanySummary: "{name} демонстрирует устойчивую рыночную позицию, стабильные фундаментальные показатели и сильное конкурентное преимущество в ключевых сегментах.",
    demoCompareStrength1: "Доминирующая доля в ключевых сегментах", demoCompareStrength2: "Сильные повторяющиеся доходы", demoCompareStrength3: "Подтверждённая эффективность управления",
    demoCompareRisk1: "Риск концентрации рынка", demoCompareRisk2: "Макроэкономическая чувствительность в ключевых регионах",
    demoCompareNearFuture: "Интеграция AI и расширение продуктов могут поддержать траекторию роста в 2026-2027 годах.",
    demoCompareRationale: "Сильные финансовые показатели и инновационная дорожная карта делают этот актив предпочтительным в текущих рыночных условиях.",
    demoCompareAlternativeNote: "Сильная корпоративная позиция и облачная инфраструктура дают привлекательную доходность с учётом риска как вторичный вариант.",
    demoCompareOverall: "Портфель показывает хорошую диверсификацию среди лидеров рынка с взаимодополняющими бизнес-моделями. Текущая макросреда поддерживает качество сильнее, чем рост."
  },
  ar: {
    demoCompareCompanySummary: "{name} يظهر تمركزاً سوقياً قوياً مع أساسيات مستقرة وميزة تنافسية واضحة في قطاعاته الأساسية.",
    demoCompareStrength1: "حصة سوقية مهيمنة في القطاعات الأساسية", demoCompareStrength2: "تدفقات إيرادات متكررة قوية", demoCompareStrength3: "سجل تنفيذ إداري مثبت",
    demoCompareRisk1: "تعرض لمخاطر تركّز السوق", demoCompareRisk2: "حساسية ماكرو في مناطق رئيسية",
    demoCompareNearFuture: "من المتوقع أن يدعم تكامل AI وتوسع المنتجات مسار النمو خلال 2026-2027.",
    demoCompareRationale: "المؤشرات المالية القوية مع مسار الابتكار تجعل هذا الخيار مفضلاً في ظروف السوق الحالية.",
    demoCompareAlternativeNote: "الموقع المؤسسي القوي والبنية السحابية يوفران عائداً جذاباً معدلاً بالمخاطر كخيار ثانوي.",
    demoCompareOverall: "تُظهر المحفظة تنويعاً جيداً بين قادة السوق ذوي نماذج أعمال متكاملة. البيئة الكلية الحالية تفضل الجودة على النمو."
  },
  zh: {
    demoCompareCompanySummary: "{name} 展现出稳健的市场定位，基本面稳定，并在核心业务板块具备较强竞争壁垒。",
    demoCompareStrength1: "核心板块市场份额领先", demoCompareStrength2: "经常性收入来源稳健", demoCompareStrength3: "管理层执行记录可靠",
    demoCompareRisk1: "市场集中度风险", demoCompareRisk2: "关键地区的宏观敏感性",
    demoCompareNearFuture: "AI 整合与产品扩展预计将在 2026-2027 年继续支撑增长轨迹。",
    demoCompareRationale: "更强的财务指标叠加创新管线，使其在当前市场环境下成为优先配置。",
    demoCompareAlternativeNote: "稳固的企业级定位与云基础设施，使其作为次优配置具备有吸引力的风险调整回报。",
    demoCompareOverall: "该组合在商业模式互补的市场领导者之间形成了较好的分散配置。当前宏观环境更偏好质量而非单纯增长。"
  },
  hi: {
    demoCompareCompanySummary: "{name} स्थिर मूलभूत आधार और मुख्य क्षेत्रों में मजबूत प्रतिस्पर्धी बढ़त के साथ ठोस बाज़ार स्थिति दिखाता है।",
    demoCompareStrength1: "मुख्य क्षेत्रों में प्रमुख बाज़ार हिस्सेदारी", demoCompareStrength2: "मजबूत आवर्ती राजस्व प्रवाह", demoCompareStrength3: "प्रबंधन के निष्पादन का सिद्ध रिकॉर्ड",
    demoCompareRisk1: "बाज़ार एकाग्रता का जोखिम", demoCompareRisk2: "मुख्य क्षेत्रों में मैक्रो संवेदनशीलता",
    demoCompareNearFuture: "AI एकीकरण और उत्पाद विस्तार से 2026-2027 तक वृद्धि की दिशा को समर्थन मिलने की उम्मीद है।",
    demoCompareRationale: "मजबूत वित्तीय संकेतक और नवाचार पाइपलाइन मौजूदा बाज़ार परिस्थितियों में इसे पसंदीदा आवंटन बनाते हैं।",
    demoCompareAlternativeNote: "मजबूत एंटरप्राइज स्थिति और क्लाउड संरचना द्वितीयक आवंटन के रूप में आकर्षक जोखिम-समायोजित रिटर्न देती है।",
    demoCompareOverall: "यह पोर्टफोलियो पूरक व्यवसाय मॉडल वाले बाज़ार नेताओं में ठोस विविधीकरण दिखाता है। मौजूदा मैक्रो माहौल वृद्धि से अधिक गुणवत्ता को समर्थन देता है।"
  },
  de: {
    demoCompareCompanySummary: "{name} zeigt eine solide Marktposition mit stabilen Fundamentaldaten und starkem Wettbewerbsvorteil in den Kernsegmenten.",
    demoCompareStrength1: "Dominanter Marktanteil in Kernsegmenten", demoCompareStrength2: "Starke wiederkehrende Umsätze", demoCompareStrength3: "Nachgewiesene Umsetzungskraft des Managements",
    demoCompareRisk1: "Risiko durch Marktkonzentration", demoCompareRisk2: "Makro-Sensitivität in wichtigen Regionen",
    demoCompareNearFuture: "AI-Integration und Produktausbau dürften die Wachstumsbahn bis 2026-2027 stützen.",
    demoCompareRationale: "Starke Finanzkennzahlen zusammen mit der Innovationspipeline machen diese Auswahl unter aktuellen Marktbedingungen bevorzugt.",
    demoCompareAlternativeNote: "Starke Unternehmenspositionierung und Cloud-Infrastruktur bieten als Zweitwahl attraktive risikobereinigte Renditen.",
    demoCompareOverall: "Das Portfolio zeigt solide Diversifikation über Marktführer mit ergänzenden Geschäftsmodellen. Das aktuelle Makroumfeld begünstigt Qualität stärker als Wachstum."
  },
  es: {
    demoCompareCompanySummary: "{name} muestra una posición de mercado sólida, fundamentos consistentes y una ventaja competitiva fuerte en sus segmentos principales.",
    demoCompareStrength1: "Cuota de mercado dominante en segmentos clave", demoCompareStrength2: "Flujos sólidos de ingresos recurrentes", demoCompareStrength3: "Historial probado de ejecución directiva",
    demoCompareRisk1: "Exposición a concentración de mercado", demoCompareRisk2: "Sensibilidad macro en geografías clave",
    demoCompareNearFuture: "La integración de AI y la expansión de productos deberían sostener la trayectoria de crecimiento durante 2026-2027.",
    demoCompareRationale: "Las métricas financieras superiores junto con la cartera de innovación hacen que esta sea la asignación preferida en las condiciones actuales.",
    demoCompareAlternativeNote: "Una posición empresarial fuerte y la infraestructura cloud ofrecen retornos ajustados por riesgo atractivos como asignación secundaria.",
    demoCompareOverall: "La cartera muestra una diversificación sólida entre líderes de mercado con modelos de negocio complementarios. El entorno macro actual favorece la calidad sobre el crecimiento."
  }
};
Object.entries(GMA_COMPARE_DEMO_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_MARKET_EXTRA_I18N = {
  en: {
    aiAnalysisDemo: "AI ANALYSIS DEMO", positiveFactors: "POSITIVE FACTORS", negativeFactors: "NEGATIVE FACTORS", riskFactors: "RISK FACTORS", riskOpportunityDemo: "RISK & OPPORTUNITY DEMO", riskSignals: "RISK SIGNALS", opportunitySignals: "OPPORTUNITY SIGNALS", demoContentOnly: "Demo content only. Connect live model output later for company-specific scoring.", companyDemoContentOnly: "demo content only. Connect live model output later for company-specific scoring.", riskAnalysisLoading: "Risk analysis is loading...", aiFeatureLoginRequired: "To use AI analysis features, you need to sign in to your account first.", error: "Error", noAiKey: "GMA AI key configuration required. Contact support.", noCredits: "Your analysis credits are used up. Choose a plan to continue.", loadRiskAnalysis: "Load Risk Analysis", riskAnalysisIntro: "GMA Intelligence Layer analyzes positive and negative factors",
    demoRisk1: "Revenue concentration and macro sensitivity may increase downside volatility.", demoRisk2: "Regulatory, margin, or execution pressure can weaken the near-term setup.", demoRisk3: "Valuation risk rises when price momentum runs ahead of fundamentals.", demoOpp1: "Strong market position can support pricing power and resilient cash flow.", demoOpp2: "AI, automation, or product expansion may create new growth channels.", demoOpp3: "Operational scale can convert demand recovery into margin improvement."
  },
  tr: {
    aiAnalysisDemo: "AI ANALIZ DEMO", positiveFactors: "POZITIF FAKTORLER", negativeFactors: "NEGATIF FAKTORLER", riskFactors: "RISK FAKTORLERI", riskOpportunityDemo: "RISK & FIRSAT DEMO", riskSignals: "RISK SINYALLERI", opportunitySignals: "FIRSAT SINYALLERI", demoContentOnly: "Yalnizca demo iceriktir. Sirkete ozel skor icin canli model ciktisi daha sonra baglanacak.", companyDemoContentOnly: "yalnizca demo iceriktir. Sirkete ozel skor icin canli model ciktisi daha sonra baglanacak.", riskAnalysisLoading: "Risk analizi yukleniyor...", aiFeatureLoginRequired: "AI analiz ozelliklerini kullanmak icin once hesabiniza giris yapmalisiniz.", error: "Hata", noAiKey: "GMA AI anahtar yapilandirmasi gerekli. Destek ekibiyle iletisime gecin.", noCredits: "Analiz kredileriniz bitti. Devam etmek icin bir plan secin.", loadRiskAnalysis: "Risk Analizini Yukle", riskAnalysisIntro: "GMA Zeka Katmani pozitif ve negatif faktorleri analiz eder",
    demoRisk1: "Gelir yogunlasmasi ve makro hassasiyet asagi yonlu oynakligi artirabilir.", demoRisk2: "Regulasyon, marj veya uygulama baskisi yakin vadeli gorunumu zayiflatabilir.", demoRisk3: "Fiyat ivmesi temellerin onune gecerse degerleme riski artar.", demoOpp1: "Guclu piyasa konumu fiyatlama gucunu ve direncli nakit akisini destekleyebilir.", demoOpp2: "AI, otomasyon veya urun genislemesi yeni buyume kanallari yaratabilir.", demoOpp3: "Operasyonel olcek talep toparlanmasini marj iyilesmesine cevirebilir."
  },
  ru: { positiveFactors: "ПОЛОЖИТЕЛЬНЫЕ ФАКТОРЫ", riskFactors: "ФАКТОРЫ РИСКА", riskOpportunityDemo: "РИСК И ВОЗМОЖНОСТИ ДЕМО", riskSignals: "СИГНАЛЫ РИСКА", opportunitySignals: "СИГНАЛЫ ВОЗМОЖНОСТЕЙ", loadRiskAnalysis: "Загрузить анализ риска" },
  ar: { positiveFactors: "عوامل إيجابية", riskFactors: "عوامل المخاطر", riskOpportunityDemo: "عرض المخاطر والفرص", riskSignals: "إشارات المخاطر", opportunitySignals: "إشارات الفرص", loadRiskAnalysis: "تحميل تحليل المخاطر" },
  zh: { positiveFactors: "积极因素", riskFactors: "风险因素", riskOpportunityDemo: "风险与机会演示", riskSignals: "风险信号", opportunitySignals: "机会信号", loadRiskAnalysis: "加载风险分析" },
  hi: { positiveFactors: "सकारात्मक कारक", riskFactors: "जोखिम कारक", riskOpportunityDemo: "जोखिम और अवसर डेमो", riskSignals: "जोखिम संकेत", opportunitySignals: "अवसर संकेत", loadRiskAnalysis: "जोखिम विश्लेषण लोड करें" },
  de: { positiveFactors: "POSITIVE FAKTOREN", riskFactors: "RISIKOFAKTOREN", riskOpportunityDemo: "RISIKO & CHANCE DEMO", riskSignals: "RISIKOSIGNALE", opportunitySignals: "CHANCENSIGNALE", loadRiskAnalysis: "Risikoanalyse laden" },
  es: { positiveFactors: "FACTORES POSITIVOS", riskFactors: "FACTORES DE RIESGO", riskOpportunityDemo: "DEMO DE RIESGO Y OPORTUNIDAD", riskSignals: "SENALES DE RIESGO", opportunitySignals: "SENALES DE OPORTUNIDAD", loadRiskAnalysis: "Cargar analisis de riesgo" }
};
Object.entries(GMA_MARKET_EXTRA_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...GMA_MARKET_EXTRA_I18N.en, ...values };
});
const GMA_TRANSLATION_FIXES = {
  tr: {
    heroBtn1:"PIYASALARI GOR", heroBtn2:"FIYATLARI GOR", heroBtn3:"KAYIT OL", step1t:"Kayit Ol", step1d:"E-posta veya Google ile 30 saniyede hesap olusturun", step2t:"Plan Sec", step2d:"Gunluk $2.99'dan baslayan planlardan secin", step3t:"Analiz Et", step3d:"GMA Consensus Engine ile stratejik netlik", step4t:"Karar Ver", step4d:"Guvenilir veri ve analitik netlikle kendi karar cercevenizi kurun", howSub:"4 Adimda Kuresel Yatirim", ctaTitle:"Karar Netligini Kurumsal Seviyeye Tasiyin", ctaSub:"Gunluk $2.99'dan baslayan planlarla kuresel piyasalari profesyonel seviyede analiz edin.", ctaBtn1:"Plan Sec →", ctaBtn2:"Once Kesfet", ctaFree:"Ucretsiz Basla", ctaFreeSub:"Giris yapmadan piyasalari kesfedin.", sectors:"SEKTOR", autoRefresh:"OTOMATIK YENILE", allShown:"TUM KURULUSLAR GOSTERILDI", clear:"Temizle", accountMgmt:"Hesap Yonetimi", profileInfo:"PROFIL BILGILERI", accountOps:"HESAP ISLEMLERI", apiKeyLabel:"GMA PLATFORM ERISIM ANAHTARI", backToMarkets:"Piyasalara Don", editProfile:"DUZENLE", saveProfile:"PROFILI KAYDET", cancel:"IPTAL", myPlan:"Aktif Planim", credits:"Krediler", upgrade:"Plani Yukselt", copyright:"Tum haklari saklidir.", password:"SIFRE", fullname:"AD SOYAD", city:"SEHIR", phone:"TELEFON", bio:"BIYO", socialMedia:"SOSYAL MEDYA", send:"GONDER", processing:"ISLENIYOR...", or:"VEYA E-POSTA ILE", selectPlan:"Plan Sec →", freePlan:"Ucretsiz Basla", termsNav:"SARTLAR", refundNav:"IADE",
    dnaQ_market_scope:"Analiz kapsaminiz?", dnaOpt_market_scope_global:"Kuresel Piyasalar", dnaOpt_market_scope_emerging:"Gelisen Piyasalar", dnaDetail_market_scope_global:"NASDAQ, NYSE, Avrupa, Asya", dnaDetail_market_scope_emerging:"BIST ve benzer piyasalar", dnaQ_country:"Odak Ulke / Bolge?", dnaOpt_country_na:"Kuzey Amerika", dnaOpt_country_eu:"Avrupa", dnaOpt_country_apac:"Asya & Pasifik", dnaOpt_country_me:"Orta Dogu", dnaQ_sectors:"Oncelikli Ekosistemler (En fazla 3)"
  },
  ru: {
    register:"РЕГИСТРАЦИЯ", logout:"ВЫЙТИ", loginTitle:"Войдите в аккаунт", registerTitle:"Создайте бесплатный аккаунт", viewMarkets:"СМОТРЕТЬ РЫНКИ", loginRegister:"ВХОД / РЕГИСТРАЦИЯ", googleContinue:"Продолжить с Google", heroBtn1:"СМОТРЕТЬ РЫНКИ", heroBtn2:"СМОТРЕТЬ ТАРИФЫ", heroBtn3:"РЕГИСТРАЦИЯ", heroSubtitle:"Снижайте неопределённость с помощью структурированного анализа и более ясной рамки решений", step1t:"Регистрация", step1d:"Создайте аккаунт за 30 секунд через email или Google", step2t:"Выберите план", step2d:"Выберите план от $2.99 в день", step3t:"Анализируйте", step3d:"Стратегическая ясность через GMA Consensus Engine", step4t:"Принимайте решение", step4d:"Стройте собственную рамку решений на надёжных данных", howTitle:"Как это работает", howSub:"Глобальные инвестиции за 4 шага", featTitle:"Возможности платформы", featSub:"Всё в одном месте", ctaTitle:"Поднимите ясность решений до институционального уровня", ctaSub:"Анализируйте глобальные рынки профессионально с планами от $2.99 в день.", ctaBtn1:"Выбрать план →", ctaBtn2:"Сначала изучить", ctaFree:"Начать бесплатно", ctaFreeSub:"Изучайте рынки без входа.", sector:"Сектор", sectors:"СЕКТОРЫ", allSectors:"ВСЕ", gainers:"РОСТ", losers:"ПАДЕНИЕ", live:"LIVE", autoRefresh:"АВТО-ОБНОВЛЕНИЕ", loadMore:"ПОКАЗАТЬ ЕЩЁ", allShown:"ВСЕ ОРГАНИЗАЦИИ ПОКАЗАНЫ", clear:"Очистить", accountMgmt:"Управление аккаунтом", profileInfo:"ДАННЫЕ ПРОФИЛЯ", accountOps:"ДЕЙСТВИЯ АККАУНТА", apiKeyLabel:"КЛЮЧ ДОСТУПА GMA", backToMarkets:"Назад к рынкам", editProfile:"ИЗМЕНИТЬ", saveProfile:"СОХРАНИТЬ ПРОФИЛЬ", cancel:"ОТМЕНА", myPlan:"Мой активный план", credits:"Кредиты", upgrade:"Увеличить план", contactTitle:"Свяжитесь с нами", footerDesc:"Финансовая аналитическая платформа для ясности на глобальных рынках.", copyright:"Все права защищены.", password:"ПАРОЛЬ", fullname:"ПОЛНОЕ ИМЯ", city:"ГОРОД", phone:"ТЕЛЕФОН", bio:"БИО", socialMedia:"СОЦИАЛЬНЫЕ СЕТИ", send:"ОТПРАВИТЬ", processing:"ОБРАБОТКА...", or:"ИЛИ ПО EMAIL", pricingTitle:"AI-сила для глобальных инвестиций", selectPlan:"Выбрать план →", freePlan:"Начать бесплатно", termsNav:"УСЛОВИЯ", refundNav:"ВОЗВРАТ",
    aiAnalysisDemo:"ДЕМО AI-АНАЛИЗА", negativeFactors:"ОТРИЦАТЕЛЬНЫЕ ФАКТОРЫ", demoContentOnly:"Только демо-контент. Живой вывод модели для оценки компании будет подключён позже.", companyDemoContentOnly:"только демо-контент. Живой вывод модели для оценки компании будет подключён позже.", riskAnalysisLoading:"Анализ риска загружается...", aiFeatureLoginRequired:"Для функций AI-анализа нужно сначала войти в аккаунт.", error:"Ошибка", noAiKey:"Нужна конфигурация ключа GMA AI. Обратитесь в поддержку.", noCredits:"Кредиты анализа исчерпаны. Выберите план для продолжения.", riskAnalysisIntro:"GMA Intelligence Layer анализирует положительные и отрицательные факторы", demoRisk1:"Концентрация выручки и макрочувствительность могут повысить волатильность снижения.", demoRisk2:"Регуляторное, маржинальное или исполнительное давление может ослабить ближайший фон.", demoRisk3:"Риски оценки растут, когда ценовой импульс опережает фундамент.", demoOpp1:"Сильная рыночная позиция может поддержать ценовую силу и денежный поток.", demoOpp2:"AI, автоматизация или расширение продукта могут создать новые каналы роста.", demoOpp3:"Операционный масштаб может превратить восстановление спроса в улучшение маржи.",
    dnaQ_market_scope:"Область анализа?", dnaOpt_market_scope_global:"Глобальные рынки", dnaOpt_market_scope_emerging:"Развивающиеся рынки", dnaDetail_market_scope_global:"NASDAQ, NYSE, Европа, Азия", dnaDetail_market_scope_emerging:"BIST и подобные рынки", dnaQ_country:"Фокус-страна / регион?", dnaOpt_country_na:"Северная Америка", dnaOpt_country_eu:"Европа", dnaOpt_country_apac:"Азия и Тихоокеанский регион", dnaOpt_country_me:"Ближний Восток", dnaQ_sectors:"Приоритетные экосистемы (макс. 3)"
  },
  ar: {
    register:"إنشاء حساب", logout:"تسجيل الخروج", loginTitle:"سجّل الدخول إلى حسابك", registerTitle:"أنشئ حسابك المجاني", viewMarkets:"عرض الأسواق", loginRegister:"دخول / تسجيل", googleContinue:"المتابعة باستخدام Google", heroBtn1:"عرض الأسواق", heroBtn2:"عرض الأسعار", heroBtn3:"إنشاء حساب", heroSubtitle:"قلّل عدم اليقين عبر تحليل منظم وإطار قرار أوضح", step1t:"إنشاء حساب", step1d:"أنشئ حسابًا خلال 30 ثانية بالبريد أو Google", step2t:"اختر الخطة", step2d:"اختر من خطط تبدأ من 2.99 دولار يوميًا", step3t:"حلّل", step3d:"وضوح استراتيجي عبر محرك توافق GMA", step4t:"اتخذ القرار", step4d:"ابنِ إطار قرارك الخاص ببيانات موثوقة ووضوح تحليلي", howTitle:"كيف يعمل", howSub:"استثمار عالمي في 4 خطوات", featTitle:"ميزات المنصة", featSub:"كل شيء في مكان واحد", feat1t:"تدفق الأسواق المباشر", feat1d:"تابع أكثر من 600 شركة والعملات الرقمية والسلع والعملات فورياً", feat2t:"تحليل GMA ثلاثي", feat2d:"راجع توافق الإشارات بمستوى مؤسسي عبر محرك توافق GMA", ctaTitle:"ارفع وضوح القرار إلى مستوى مؤسسي", ctaSub:"حلّل الأسواق العالمية باحترافية مع خطط تبدأ من 2.99 دولار يوميًا.", ctaBtn1:"اختر الخطة ←", ctaBtn2:"استكشف أولاً", ctaFree:"ابدأ مجانًا", ctaFreeSub:"استكشف الأسواق دون تسجيل الدخول.", sector:"القطاع", sectors:"القطاع", allSectors:"الكل", gainers:"الرابحون", losers:"الخاسرون", live:"مباشر", autoRefresh:"تحديث تلقائي", loadMore:"عرض المزيد", allShown:"تم عرض جميع المؤسسات", clear:"مسح", accountMgmt:"إدارة الحساب", profileInfo:"معلومات الملف الشخصي", accountOps:"إجراءات الحساب", apiKeyLabel:"مفتاح وصول منصة GMA", backToMarkets:"العودة إلى الأسواق", editProfile:"تعديل", saveProfile:"حفظ الملف", cancel:"إلغاء", myPlan:"خطتي النشطة", credits:"الأرصدة", upgrade:"ترقية الخطة", contactTitle:"تواصل معنا", copyright:"جميع الحقوق محفوظة.", password:"كلمة المرور", fullname:"الاسم الكامل", city:"المدينة", phone:"الهاتف", bio:"نبذة", socialMedia:"وسائل التواصل", send:"إرسال", processing:"جار المعالجة...", or:"أو عبر البريد", pricingTitle:"قوة AI للاستثمار العالمي", selectPlan:"اختر الخطة ←", freePlan:"ابدأ مجانًا", aiPartners:"شركاء AI المدمجون", pricingNote:"اشتراك واحد يفتح محرك توافق GMA. تعمل GPT وClaude وGemini كمحركات داعمة بينما تبقى GMA طبقة التحليل.", paySuccess:"تم تفعيل الوصول", payKey:"مفتاح وصول المنصة", payKeyNote:"هذا المفتاح مرتبط بحسابك. لا تشاركه مع أي شخص.", termsNav:"الشروط", refundNav:"الاسترداد",
    aiAnalysisDemo:"عرض تحليل AI", negativeFactors:"عوامل سلبية", demoContentOnly:"محتوى تجريبي فقط. سيتم ربط مخرجات النموذج الحية لاحقًا لتقييم كل شركة.", companyDemoContentOnly:"محتوى تجريبي فقط. سيتم ربط مخرجات النموذج الحية لاحقًا لتقييم كل شركة.", riskAnalysisLoading:"جار تحميل تحليل المخاطر...", aiFeatureLoginRequired:"لاستخدام ميزات تحليل AI يجب تسجيل الدخول أولاً.", error:"خطأ", noAiKey:"يلزم إعداد مفتاح GMA AI. تواصل مع الدعم.", noCredits:"انتهت أرصدة التحليل لديك. اختر خطة للمتابعة.", riskAnalysisIntro:"تحلل طبقة ذكاء GMA العوامل الإيجابية والسلبية", demoRisk1:"قد يزيد تركّز الإيرادات والحساسية الكلية من تقلبات الهبوط.", demoRisk2:"قد يضعف ضغط التنظيم أو الهوامش أو التنفيذ الصورة قصيرة الأجل.", demoRisk3:"ترتفع مخاطر التقييم عندما يسبق زخم السعر الأساسيات.", demoOpp1:"يمكن للمركز السوقي القوي دعم قوة التسعير والتدفق النقدي.", demoOpp2:"قد يخلق AI أو الأتمتة أو توسع المنتجات قنوات نمو جديدة.", demoOpp3:"يمكن للحجم التشغيلي تحويل تعافي الطلب إلى تحسن في الهوامش.",
    dnaQ_market_scope:"ما نطاق تحليلك؟", dnaOpt_market_scope_global:"الأسواق العالمية", dnaOpt_market_scope_emerging:"الأسواق الناشئة", dnaDetail_market_scope_global:"ناسداك، نيويورك، أوروبا، آسيا", dnaDetail_market_scope_emerging:"بورصة إسطنبول وأسواق مشابهة", dnaQ_country:"بلد / منطقة التركيز؟", dnaOpt_country_na:"أمريكا الشمالية", dnaOpt_country_eu:"أوروبا", dnaOpt_country_apac:"آسيا والمحيط الهادئ", dnaOpt_country_me:"الشرق الأوسط", dnaQ_sectors:"الأنظمة ذات الأولوية (حد أقصى 3)"
  },
  zh: {
    register:"注册", logout:"退出登录", loginTitle:"登录您的账户", registerTitle:"创建免费账户", viewMarkets:"查看市场", loginRegister:"登录 / 注册", googleContinue:"使用 Google 继续", heroBtn1:"查看市场", heroBtn2:"查看价格", heroBtn3:"注册", heroSubtitle:"通过结构化分析和更清晰的决策框架降低不确定性", step1t:"注册", step1d:"用邮箱或 Google 在 30 秒内创建账户", step2t:"选择计划", step2d:"选择每日 2.99 美元起的计划", step3t:"分析", step3d:"通过 GMA 共识引擎获得战略清晰度", step4t:"决策", step4d:"用可靠数据和分析清晰度建立自己的决策框架", howTitle:"工作方式", howSub:"全球投资四步", featTitle:"平台功能", featSub:"一处完成全部", feat1t:"实时市场流", feat1d:"实时跟踪 600+ 公司、加密资产、大宗商品和货币", feat2t:"GMA 三重分析", feat2d:"通过 GMA 共识引擎查看机构级信号一致性", ctaTitle:"将决策清晰度提升到机构级", ctaSub:"使用每日 2.99 美元起的计划专业分析全球市场。", ctaBtn1:"选择计划 →", ctaBtn2:"先探索", ctaFree:"免费开始", ctaFreeSub:"无需登录即可探索市场。", sector:"行业", sectors:"行业", allSectors:"全部", gainers:"上涨", losers:"下跌", live:"实时", autoRefresh:"自动刷新", loadMore:"加载更多", allShown:"已显示所有机构", clear:"清除", accountMgmt:"账户管理", profileInfo:"个人资料", accountOps:"账户操作", apiKeyLabel:"GMA 平台访问密钥", backToMarkets:"返回市场", editProfile:"编辑", saveProfile:"保存资料", cancel:"取消", myPlan:"我的当前计划", credits:"额度", upgrade:"升级计划", contactTitle:"联系我们", copyright:"版权所有。", password:"密码", fullname:"全名", city:"城市", phone:"电话", bio:"简介", socialMedia:"社交媒体", send:"发送", processing:"处理中...", or:"或使用邮箱", pricingTitle:"全球投资的 AI 能力", selectPlan:"选择计划 →", freePlan:"免费开始", aiPartners:"集成 AI 伙伴", pricingNote:"一个订阅即可解锁 GMA 共识引擎。GPT、Claude 和 Gemini 作为辅助引擎，GMA 仍是分析层。", paySuccess:"访问已激活", payKey:"您的平台访问密钥", payKeyNote:"此密钥与您的账户关联，请勿分享。", termsNav:"条款", refundNav:"退款",
    aiAnalysisDemo:"AI 分析演示", negativeFactors:"负面因素", demoContentOnly:"仅为演示内容。稍后将连接实时模型输出以进行公司评分。", companyDemoContentOnly:"仅为演示内容。稍后将连接实时模型输出以进行公司评分。", riskAnalysisLoading:"风险分析加载中...", aiFeatureLoginRequired:"要使用 AI 分析功能，请先登录账户。", error:"错误", noAiKey:"需要配置 GMA AI 密钥。请联系支持。", noCredits:"您的分析额度已用完。请选择计划继续。", riskAnalysisIntro:"GMA 智能层分析积极和消极因素", demoRisk1:"收入集中和宏观敏感性可能增加下行波动。", demoRisk2:"监管、利润率或执行压力可能削弱短期格局。", demoRisk3:"当价格动能领先基本面时，估值风险上升。", demoOpp1:"强劲的市场地位可支持定价能力和现金流韧性。", demoOpp2:"AI、自动化或产品扩展可能创造新的增长渠道。", demoOpp3:"运营规模可将需求复苏转化为利润率改善。",
    dnaQ_market_scope:"您的分析范围？", dnaOpt_market_scope_global:"全球市场", dnaOpt_market_scope_emerging:"新兴市场", dnaDetail_market_scope_global:"NASDAQ、NYSE、欧洲、亚洲", dnaDetail_market_scope_emerging:"BIST 及类似市场", dnaQ_country:"关注国家 / 地区？", dnaOpt_country_na:"北美", dnaOpt_country_eu:"欧洲", dnaOpt_country_apac:"亚太", dnaOpt_country_me:"中东", dnaQ_sectors:"优先生态系统（最多 3 个）"
  },
  hi: {
    register:"साइन अप", logout:"साइन आउट", loginTitle:"अपने खाते में साइन इन करें", registerTitle:"अपना मुफ्त खाता बनाएँ", viewMarkets:"बाज़ार देखें", loginRegister:"साइन इन / साइन अप", googleContinue:"Google के साथ जारी रखें", heroBtn1:"बाज़ार देखें", heroBtn2:"मूल्य देखें", heroBtn3:"साइन अप", heroSubtitle:"संरचित विश्लेषण और स्पष्ट निर्णय ढाँचे से अनिश्चितता घटाएँ", step1t:"साइन अप", step1d:"ईमेल या Google से 30 सेकंड में खाता बनाएँ", step2t:"योजना चुनें", step2d:"$2.99/दिन से शुरू योजनाओं में से चुनें", step3t:"विश्लेषण करें", step3d:"GMA Consensus Engine से रणनीतिक स्पष्टता", step4t:"निर्णय लें", step4d:"विश्वसनीय डेटा और विश्लेषण से अपना निर्णय ढाँचा बनाएँ", howTitle:"यह कैसे काम करता है", howSub:"4 चरणों में वैश्विक निवेश", featTitle:"प्लेटफ़ॉर्म सुविधाएँ", featSub:"सब कुछ एक जगह", feat1t:"लाइव मार्केट फ़ीड", feat1d:"600+ कंपनियों, क्रिप्टो, कमोडिटी और मुद्राओं को रीयल-टाइम में ट्रैक करें", feat2t:"GMA त्रिस्तरीय विश्लेषण", feat2d:"GMA Consensus Engine से संस्थागत स्तर के सिग्नल संरेखण की समीक्षा करें", ctaTitle:"निर्णय स्पष्टता को संस्थागत स्तर तक बढ़ाएँ", ctaSub:"$2.99/दिन से शुरू योजनाओं के साथ वैश्विक बाज़ारों का पेशेवर विश्लेषण करें।", ctaBtn1:"योजना चुनें →", ctaBtn2:"पहले देखें", ctaFree:"मुफ्त शुरू करें", ctaFreeSub:"साइन इन किए बिना बाज़ार देखें।", sector:"क्षेत्र", sectors:"क्षेत्र", allSectors:"सभी", gainers:"बढ़त", losers:"गिरावट", live:"लाइव", autoRefresh:"ऑटो-रिफ्रेश", loadMore:"और लोड करें", allShown:"सभी संगठन दिखाए गए", clear:"साफ़ करें", accountMgmt:"खाता प्रबंधन", profileInfo:"प्रोफ़ाइल जानकारी", accountOps:"खाता क्रियाएँ", apiKeyLabel:"GMA प्लेटफ़ॉर्म एक्सेस कुंजी", backToMarkets:"बाज़ारों पर वापस", editProfile:"संपादित करें", saveProfile:"प्रोफ़ाइल सहेजें", cancel:"रद्द करें", myPlan:"मेरी सक्रिय योजना", credits:"क्रेडिट", upgrade:"योजना अपग्रेड करें", contactTitle:"संपर्क करें", copyright:"सर्वाधिकार सुरक्षित।", password:"पासवर्ड", fullname:"पूरा नाम", city:"शहर", phone:"फ़ोन", bio:"परिचय", socialMedia:"सोशल मीडिया", send:"भेजें", processing:"प्रोसेस हो रहा है...", or:"या ईमेल से", pricingTitle:"वैश्विक निवेश के लिए AI शक्ति", selectPlan:"योजना चुनें →", freePlan:"मुफ्त शुरू करें", aiPartners:"एकीकृत AI भागीदार", pricingNote:"एक सदस्यता GMA Consensus Engine खोलती है। GPT, Claude और Gemini सहायक इंजन हैं, जबकि GMA विश्लेषण परत रहता है।", paySuccess:"एक्सेस सक्रिय", payKey:"आपकी प्लेटफ़ॉर्म एक्सेस कुंजी", payKeyNote:"यह कुंजी आपके खाते से जुड़ी है। इसे साझा न करें।", termsNav:"शर्तें", refundNav:"रिफंड",
    aiAnalysisDemo:"AI विश्लेषण डेमो", negativeFactors:"नकारात्मक कारक", demoContentOnly:"केवल डेमो सामग्री। कंपनी-विशिष्ट स्कोरिंग के लिए लाइव मॉडल आउटपुट बाद में जोड़ा जाएगा।", companyDemoContentOnly:"केवल डेमो सामग्री। कंपनी-विशिष्ट स्कोरिंग के लिए लाइव मॉडल आउटपुट बाद में जोड़ा जाएगा।", riskAnalysisLoading:"जोखिम विश्लेषण लोड हो रहा है...", aiFeatureLoginRequired:"AI विश्लेषण सुविधाओं के लिए पहले खाते में साइन इन करें।", error:"त्रुटि", noAiKey:"GMA AI कुंजी कॉन्फ़िगरेशन आवश्यक है। समर्थन से संपर्क करें।", noCredits:"आपके विश्लेषण क्रेडिट समाप्त हो गए हैं। जारी रखने के लिए योजना चुनें।", riskAnalysisIntro:"GMA इंटेलिजेंस लेयर सकारात्मक और नकारात्मक कारकों का विश्लेषण करता है", demoRisk1:"राजस्व एकाग्रता और मैक्रो संवेदनशीलता गिरावट की अस्थिरता बढ़ा सकती है।", demoRisk2:"नियामकीय, मार्जिन या निष्पादन दबाव निकट अवधि की स्थिति कमजोर कर सकता है।", demoRisk3:"जब कीमत की गति आधारभूत बातों से आगे निकलती है तो मूल्यांकन जोखिम बढ़ता है।", demoOpp1:"मजबूत बाज़ार स्थिति मूल्य निर्धारण शक्ति और नकदी प्रवाह को सहारा दे सकती है।", demoOpp2:"AI, ऑटोमेशन या उत्पाद विस्तार नए विकास चैनल बना सकते हैं।", demoOpp3:"ऑपरेशनल स्केल मांग सुधार को मार्जिन सुधार में बदल सकता है।",
    dnaQ_market_scope:"आपका विश्लेषण दायरा?", dnaOpt_market_scope_global:"वैश्विक बाज़ार", dnaOpt_market_scope_emerging:"उभरते बाज़ार", dnaDetail_market_scope_global:"NASDAQ, NYSE, यूरोप, एशिया", dnaDetail_market_scope_emerging:"BIST और समान बाज़ार", dnaQ_country:"फोकस देश / क्षेत्र?", dnaOpt_country_na:"उत्तरी अमेरिका", dnaOpt_country_eu:"यूरोप", dnaOpt_country_apac:"एशिया और प्रशांत", dnaOpt_country_me:"मध्य पूर्व", dnaQ_sectors:"प्राथमिक पारिस्थितिकी तंत्र (अधिकतम 3)"
  },
  de: {
    register:"REGISTRIEREN", logout:"ABMELDEN", loginTitle:"In Ihr Konto einloggen", registerTitle:"Kostenloses Konto erstellen", viewMarkets:"MARKTE ANSEHEN", loginRegister:"ANMELDEN / REGISTRIEREN", googleContinue:"Mit Google fortfahren", heroBtn1:"MARKTE ANSEHEN", heroBtn2:"PREISE ANSEHEN", heroBtn3:"REGISTRIEREN", heroSubtitle:"Reduzieren Sie Unsicherheit mit strukturierter Analyse und klarerem Entscheidungsrahmen", step1t:"Registrieren", step1d:"Erstellen Sie in 30 Sekunden ein Konto per E-Mail oder Google", step2t:"Plan wahlen", step2d:"Wahlen Sie Plane ab 2,99 $ pro Tag", step3t:"Analysieren", step3d:"Strategische Klarheit durch die GMA Consensus Engine", step4t:"Entscheiden", step4d:"Bauen Sie Ihren Entscheidungsrahmen mit verlasslichen Daten auf", howTitle:"So funktioniert es", howSub:"Global investieren in 4 Schritten", featTitle:"Plattformfunktionen", featSub:"Alles an einem Ort", ctaTitle:"Entscheidungsklarheit auf institutionelles Niveau heben", ctaSub:"Analysieren Sie globale Markte professionell mit Planen ab 2,99 $ pro Tag.", ctaBtn1:"Plan wahlen →", ctaBtn2:"Zuerst erkunden", ctaFree:"Kostenlos starten", ctaFreeSub:"Markte ohne Anmeldung erkunden.", sector:"Sektor", sectors:"SEKTOR", allSectors:"ALLE", gainers:"GEWINNER", losers:"VERLIERER", live:"LIVE", autoRefresh:"AUTO-AKTUALISIERUNG", loadMore:"MEHR LADEN", allShown:"ALLE ORGANISATIONEN ANGEZEIGT", clear:"Loschen", accountMgmt:"Kontoverwaltung", profileInfo:"PROFILINFORMATIONEN", accountOps:"KONTOAKTIONEN", apiKeyLabel:"GMA PLATTFORM-ZUGANGSSCHLUSSEL", backToMarkets:"Zuruck zu Markten", editProfile:"BEARBEITEN", saveProfile:"PROFIL SPEICHERN", cancel:"ABBRECHEN", myPlan:"Mein aktiver Plan", credits:"Credits", upgrade:"Plan upgraden", contactTitle:"Kontakt aufnehmen", footerDesc:"Eine Finanzintelligenz-Plattform fur Klarheit auf globalen Markten.", copyright:"Alle Rechte vorbehalten.", password:"PASSWORT", fullname:"VOLLSTANDIGER NAME", city:"STADT", phone:"TELEFON", bio:"BIO", socialMedia:"SOZIALE MEDIEN", send:"SENDEN", processing:"VERARBEITUNG...", or:"ODER PER E-MAIL", pricingTitle:"AI-Power fur globale Investments", selectPlan:"Plan wahlen →", freePlan:"Kostenlos starten", termsNav:"BEDINGUNGEN", refundNav:"ERSTATTUNG",
    aiAnalysisDemo:"AI-ANALYSE DEMO", negativeFactors:"NEGATIVE FAKTOREN", demoContentOnly:"Nur Demo-Inhalt. Live-Modellausgabe fur unternehmensspezifische Bewertung folgt spater.", companyDemoContentOnly:"nur Demo-Inhalt. Live-Modellausgabe fur unternehmensspezifische Bewertung folgt spater.", riskAnalysisLoading:"Risikoanalyse wird geladen...", aiFeatureLoginRequired:"Fur AI-Analysefunktionen mussen Sie sich zuerst anmelden.", error:"Fehler", noAiKey:"GMA AI-Schlusselkonfiguration erforderlich. Support kontaktieren.", noCredits:"Ihre Analyse-Credits sind aufgebraucht. Wahlen Sie einen Plan.", riskAnalysisIntro:"GMA Intelligence Layer analysiert positive und negative Faktoren", demoRisk1:"Umsatzkonzentration und Makrosensitivitat konnen Abwartsvolatilitat erhohen.", demoRisk2:"Regulierungs-, Margen- oder Ausfuhrungsdruck kann das kurzfristige Bild schwachen.", demoRisk3:"Bewertungsrisiken steigen, wenn Kursmomentum den Fundamentaldaten vorauslauft.", demoOpp1:"Eine starke Marktposition kann Preissetzungsmacht und Cashflow stutzen.", demoOpp2:"AI, Automatisierung oder Produkterweiterung konnen neue Wachstumskanale schaffen.", demoOpp3:"Operative Skalierung kann Nachfrageerholung in Margenverbesserung umwandeln.",
    dnaQ_market_scope:"Ihr Analyseumfang?", dnaOpt_market_scope_global:"Globale Markte", dnaOpt_market_scope_emerging:"Schwellenmarkte", dnaDetail_market_scope_global:"NASDAQ, NYSE, Europa, Asien", dnaDetail_market_scope_emerging:"BIST und ahnliche Markte", dnaQ_country:"Fokusland / Region?", dnaOpt_country_na:"Nordamerika", dnaOpt_country_eu:"Europa", dnaOpt_country_apac:"Asien & Pazifik", dnaOpt_country_me:"Naher Osten", dnaQ_sectors:"Priorisierte Okosysteme (max. 3)"
  },
  es: {
    register:"REGISTRARSE", logout:"CERRAR SESION", loginTitle:"Inicia sesion en tu cuenta", registerTitle:"Crea tu cuenta gratuita", viewMarkets:"VER MERCADOS", loginRegister:"INICIAR SESION / REGISTRO", googleContinue:"Continuar con Google", heroBtn1:"VER MERCADOS", heroBtn2:"VER PRECIOS", heroBtn3:"REGISTRARSE", heroSubtitle:"Reduce la incertidumbre con analisis estructurado y un marco de decision mas claro", step1t:"Registrarse", step1d:"Crea una cuenta en 30 segundos con email o Google", step2t:"Elige plan", step2d:"Elige planes desde 2.99 USD al dia", step3t:"Analiza", step3d:"Claridad estrategica mediante GMA Consensus Engine", step4t:"Decide", step4d:"Construye tu propio marco de decision con datos fiables", howTitle:"Como funciona", howSub:"Inversion global en 4 pasos", featTitle:"Funciones de la plataforma", featSub:"Todo en un solo lugar", ctaTitle:"Eleva la claridad de decision al nivel institucional", ctaSub:"Analiza mercados globales profesionalmente con planes desde 2.99 USD al dia.", ctaBtn1:"Elegir plan →", ctaBtn2:"Explorar primero", ctaFree:"Comenzar gratis", ctaFreeSub:"Explora mercados sin iniciar sesion.", sector:"Sector", sectors:"SECTOR", allSectors:"TODO", gainers:"SUBIDAS", losers:"BAJADAS", live:"EN VIVO", autoRefresh:"AUTOACTUALIZAR", loadMore:"CARGAR MAS", allShown:"TODAS LAS ORGANIZACIONES MOSTRADAS", clear:"Limpiar", accountMgmt:"Gestion de cuenta", profileInfo:"INFORMACION DE PERFIL", accountOps:"ACCIONES DE CUENTA", apiKeyLabel:"CLAVE DE ACCESO GMA", backToMarkets:"Volver a mercados", editProfile:"EDITAR", saveProfile:"GUARDAR PERFIL", cancel:"CANCELAR", myPlan:"Mi plan activo", credits:"Creditos", upgrade:"Mejorar plan", contactTitle:"Contactanos", footerDesc:"Plataforma de inteligencia financiera para aportar claridad en mercados globales.", copyright:"Todos los derechos reservados.", password:"CONTRASENA", fullname:"NOMBRE COMPLETO", city:"CIUDAD", phone:"TELEFONO", bio:"BIO", socialMedia:"REDES SOCIALES", send:"ENVIAR", processing:"PROCESANDO...", or:"O CON EMAIL", pricingTitle:"Poder AI para inversion global", selectPlan:"Elegir plan →", freePlan:"Comenzar gratis", termsNav:"TERMINOS", refundNav:"REEMBOLSO",
    aiAnalysisDemo:"DEMO DE ANALISIS AI", negativeFactors:"FACTORES NEGATIVOS", demoContentOnly:"Solo contenido demo. La salida del modelo en vivo para puntuacion por empresa se conectara despues.", companyDemoContentOnly:"solo contenido demo. La salida del modelo en vivo para puntuacion por empresa se conectara despues.", riskAnalysisLoading:"Cargando analisis de riesgo...", aiFeatureLoginRequired:"Para usar funciones de analisis AI debes iniciar sesion primero.", error:"Error", noAiKey:"Se requiere configuracion de clave GMA AI. Contacta soporte.", noCredits:"Tus creditos de analisis se agotaron. Elige un plan para continuar.", riskAnalysisIntro:"GMA Intelligence Layer analiza factores positivos y negativos", demoRisk1:"La concentracion de ingresos y sensibilidad macro puede aumentar la volatilidad bajista.", demoRisk2:"La presion regulatoria, de margen o ejecucion puede debilitar el escenario cercano.", demoRisk3:"El riesgo de valoracion sube cuando el impulso de precio supera los fundamentos.", demoOpp1:"Una posicion fuerte de mercado puede sostener poder de precios y flujo de caja.", demoOpp2:"AI, automatizacion o expansion de producto pueden crear nuevos canales de crecimiento.", demoOpp3:"La escala operativa puede convertir la recuperacion de demanda en mejora de margenes.",
    dnaQ_market_scope:"Tu alcance de analisis?", dnaOpt_market_scope_global:"Mercados globales", dnaOpt_market_scope_emerging:"Mercados emergentes", dnaDetail_market_scope_global:"NASDAQ, NYSE, Europa, Asia", dnaDetail_market_scope_emerging:"BIST y mercados similares", dnaQ_country:"Pais / region foco?", dnaOpt_country_na:"Norteamerica", dnaOpt_country_eu:"Europa", dnaOpt_country_apac:"Asia y Pacifico", dnaOpt_country_me:"Medio Oriente", dnaQ_sectors:"Ecosistemas prioritarios (max. 3)"
  }
};
Object.entries(GMA_TRANSLATION_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_DNA_TRANSLATION_FIXES = {
  tr: {
    aboutCardPlatformT:"Platform", platform:"PLATFORM", risk:"RISK",
    dnaOpt_sectors_tech:"Teknoloji", dnaOpt_sectors_energy:"Enerji", dnaOpt_sectors_defense:"Savunma", dnaOpt_sectors_food:"Gida", dnaOpt_sectors_health:"Saglik", dnaOpt_sectors_finance:"Finans", dnaQ_risk:"Yatirim stiliniz?", dnaOpt_risk_cube:"Kup", dnaOpt_risk_prism:"Prizma", dnaOpt_risk_pyramid:"Piramit", dnaDetail_risk_cube:"Muhafazakar", dnaDetail_risk_prism:"Dengeli", dnaDetail_risk_pyramid:"Agresif", dnaQ_timeframe:"Yatirim zaman ufkunuz?", dnaOpt_timeframe_short:"Kisa", dnaOpt_timeframe_medium:"Orta", dnaOpt_timeframe_long:"Uzun", dnaDetail_timeframe_short:"0-1 yil", dnaDetail_timeframe_medium:"1-3 yil", dnaDetail_timeframe_long:"3+ yil", dnaQ_tone:"Analiz stili?", dnaOpt_tone_clear:"Net", dnaOpt_tone_technical:"Teknik", dnaDetail_tone_clear:"Basit ve oz", dnaDetail_tone_technical:"Derin ve veri odakli", dnaQ_budget:"Hacim olceginiz?", dnaOpt_budget_micro:"Mikro", dnaOpt_budget_macro:"Makro", dnaOpt_budget_corporate:"Kurumsal"
  },
  ru: {
    bio:"О себе", ipoRadarStatus:"IPO RADAR", liveAutoLabel:"ЖИВО", risk:"РИСК",
    dnaOpt_sectors_tech:"Технологии", dnaOpt_sectors_energy:"Энергетика", dnaOpt_sectors_defense:"Оборона", dnaOpt_sectors_food:"Питание", dnaOpt_sectors_health:"Здравоохранение", dnaOpt_sectors_finance:"Финансы", dnaQ_risk:"Ваш стиль инвестирования?", dnaOpt_risk_cube:"Куб", dnaOpt_risk_prism:"Призма", dnaOpt_risk_pyramid:"Пирамида", dnaDetail_risk_cube:"Консервативный", dnaDetail_risk_prism:"Сбалансированный", dnaDetail_risk_pyramid:"Агрессивный", dnaQ_timeframe:"Ваш инвестиционный горизонт?", dnaOpt_timeframe_short:"Короткий", dnaOpt_timeframe_medium:"Средний", dnaOpt_timeframe_long:"Долгий", dnaDetail_timeframe_short:"0-1 год", dnaDetail_timeframe_medium:"1-3 года", dnaDetail_timeframe_long:"3+ лет", dnaQ_tone:"Стиль анализа?", dnaOpt_tone_clear:"Ясный", dnaOpt_tone_technical:"Технический", dnaDetail_tone_clear:"Просто и кратко", dnaDetail_tone_technical:"Глубоко и по данным", dnaQ_budget:"Ваш масштаб объёма?", dnaOpt_budget_micro:"Микро", dnaOpt_budget_macro:"Макро", dnaOpt_budget_corporate:"Корпоративный"
  },
  ar: {
    heroSub:"أكثر من 600 مؤسسة عالمية، وبيانات سوق فورية، وذكاء منظم عبر محرك توافق GMA.", pricingSub:"الوصول إلى محرك توافق GMA عبر اشتراك مؤسسي واحد.", aboutCardAIB:"مدعومة بمحرك توافق GMA، تقدم المنصة تحليلًا منظمًا للشركات وإطارًا للمخاطر ورؤية استراتيجية. كل النتائج معلوماتية فقط.", sovereignAutoNote:"الذكاء السيادي يترجم تلقائيًا الصفحات القانونية إلى لغتك.", refundHeroText:"غير راضٍ؟ احصل على استرداد كامل خلال 7 أيام. راسل support@globalmarketanalytics.com وسنعالجه خلال 5-7 أيام عمل.",
    dnaOpt_sectors_tech:"التكنولوجيا", dnaOpt_sectors_energy:"الطاقة", dnaOpt_sectors_defense:"الدفاع", dnaOpt_sectors_food:"الغذاء", dnaOpt_sectors_health:"الصحة", dnaOpt_sectors_finance:"التمويل", dnaQ_risk:"ما أسلوبك الاستثماري؟", dnaOpt_risk_cube:"مكعب", dnaOpt_risk_prism:"منشور", dnaOpt_risk_pyramid:"هرم", dnaDetail_risk_cube:"محافظ", dnaDetail_risk_prism:"متوازن", dnaDetail_risk_pyramid:"هجومي", dnaQ_timeframe:"ما أفقك الاستثماري؟", dnaOpt_timeframe_short:"قصير", dnaOpt_timeframe_medium:"متوسط", dnaOpt_timeframe_long:"طويل", dnaDetail_timeframe_short:"0-1 سنة", dnaDetail_timeframe_medium:"1-3 سنوات", dnaDetail_timeframe_long:"3+ سنوات", dnaQ_tone:"أسلوب التحليل؟", dnaOpt_tone_clear:"واضح", dnaOpt_tone_technical:"تقني", dnaDetail_tone_clear:"بسيط ومختصر", dnaDetail_tone_technical:"عميق ومعتمد على البيانات", dnaQ_budget:"ما حجمك الاستثماري؟", dnaOpt_budget_micro:"صغير", dnaOpt_budget_macro:"كبير", dnaOpt_budget_corporate:"مؤسسي"
  },
  zh: {
    heroSub:"600+ 家全球机构、实时市场数据，以及由 GMA 共识引擎提供的结构化智能。", pricingSub:"通过一个机构级订阅访问 GMA 共识引擎。", aboutCardAIB:"平台由 GMA 共识引擎驱动，提供结构化公司分析、风险框架和战略展望。所有输出仅供参考。", sovereignAutoNote:"主权智能会自动将法律页面翻译为您的语言。", refundHeroText:"不满意？7 天内可全额退款。请发送邮件至 support@globalmarketanalytics.com，我们将在 5-7 个工作日内处理。",
    dnaOpt_sectors_tech:"科技", dnaOpt_sectors_energy:"能源", dnaOpt_sectors_defense:"国防", dnaOpt_sectors_food:"食品", dnaOpt_sectors_health:"健康", dnaOpt_sectors_finance:"金融", dnaQ_risk:"您的投资风格？", dnaOpt_risk_cube:"立方", dnaOpt_risk_prism:"棱镜", dnaOpt_risk_pyramid:"金字塔", dnaDetail_risk_cube:"保守", dnaDetail_risk_prism:"均衡", dnaDetail_risk_pyramid:"进取", dnaQ_timeframe:"您的投资周期？", dnaOpt_timeframe_short:"短期", dnaOpt_timeframe_medium:"中期", dnaOpt_timeframe_long:"长期", dnaDetail_timeframe_short:"0-1 年", dnaDetail_timeframe_medium:"1-3 年", dnaDetail_timeframe_long:"3 年以上", dnaQ_tone:"分析风格？", dnaOpt_tone_clear:"清晰", dnaOpt_tone_technical:"技术型", dnaDetail_tone_clear:"简单简洁", dnaDetail_tone_technical:"深入且数据驱动", dnaQ_budget:"您的资金规模？", dnaOpt_budget_micro:"微型", dnaOpt_budget_macro:"宏观", dnaOpt_budget_corporate:"机构"
  },
  hi: {
    heroSub:"600+ वैश्विक संगठन, रीयल-टाइम बाज़ार डेटा और GMA सहमति इंजन से संरचित इंटेलिजेंस।", step3d:"GMA सहमति इंजन से रणनीतिक स्पष्टता", feat2d:"GMA सहमति इंजन से संस्थागत स्तर के सिग्नल संरेखण की समीक्षा करें", pricingSub:"एक संस्थागत सदस्यता से GMA सहमति इंजन तक पहुँचें।", pricingNote:"एक सदस्यता GMA सहमति इंजन खोलती है। GPT, Claude और Gemini सहायक इंजन हैं, जबकि GMA विश्लेषण परत रहता है।", aboutCardAIB:"GMA सहमति इंजन से संचालित, प्लेटफ़ॉर्म संरचित कंपनी विश्लेषण, जोखिम ढाँचा और रणनीतिक दृष्टिकोण देता है।", dnaIntro:"आपकी प्राथमिकताएँ GMA इंटेलिजेंस लेयर का स्वर और दायरा तय करती हैं।", comparisonIntro:"GMA इंटेलिजेंस लेयर हर कंपनी के लिए विस्तृत स्कोर और सुझाव बनाता है",
    dnaOpt_sectors_tech:"तकनीक", dnaOpt_sectors_energy:"ऊर्जा", dnaOpt_sectors_defense:"रक्षा", dnaOpt_sectors_food:"खाद्य", dnaOpt_sectors_health:"स्वास्थ्य", dnaOpt_sectors_finance:"वित्त", dnaQ_risk:"आपकी निवेश शैली?", dnaOpt_risk_cube:"क्यूब", dnaOpt_risk_prism:"प्रिज़्म", dnaOpt_risk_pyramid:"पिरामिड", dnaDetail_risk_cube:"संरक्षित", dnaDetail_risk_prism:"संतुलित", dnaDetail_risk_pyramid:"आक्रामक", dnaQ_timeframe:"आपकी निवेश अवधि?", dnaOpt_timeframe_short:"छोटी", dnaOpt_timeframe_medium:"मध्यम", dnaOpt_timeframe_long:"लंबी", dnaDetail_timeframe_short:"0-1 वर्ष", dnaDetail_timeframe_medium:"1-3 वर्ष", dnaDetail_timeframe_long:"3+ वर्ष", dnaQ_tone:"विश्लेषण शैली?", dnaOpt_tone_clear:"स्पष्ट", dnaOpt_tone_technical:"तकनीकी", dnaDetail_tone_clear:"सरल और संक्षिप्त", dnaDetail_tone_technical:"गहरा और डेटा-आधारित", dnaQ_budget:"आपका वॉल्यूम पैमाना?", dnaOpt_budget_micro:"माइक्रो", dnaOpt_budget_macro:"मैक्रो", dnaOpt_budget_corporate:"कॉर्पोरेट"
  },
  de: {
    bio:"BIO", live:"LIVE", credits:"Credits", liveAutoLabel:"LIVE", autoRefreshShort:"2,5s AUTO", gmaCore:"GMA KERN", livePrice:"Live",
    dnaOpt_sectors_tech:"Technologie", dnaOpt_sectors_energy:"Energie", dnaOpt_sectors_defense:"Verteidigung", dnaOpt_sectors_food:"Lebensmittel", dnaOpt_sectors_health:"Gesundheit", dnaOpt_sectors_finance:"Finanzen", dnaQ_risk:"Ihr Investmentstil?", dnaOpt_risk_cube:"Wurfel", dnaOpt_risk_prism:"Prisma", dnaOpt_risk_pyramid:"Pyramide", dnaDetail_risk_cube:"Konservativ", dnaDetail_risk_prism:"Ausgewogen", dnaDetail_risk_pyramid:"Aggressiv", dnaQ_timeframe:"Ihr Anlagehorizont?", dnaOpt_timeframe_short:"Kurz", dnaOpt_timeframe_medium:"Mittel", dnaOpt_timeframe_long:"Lang", dnaDetail_timeframe_short:"0-1 Jahr", dnaDetail_timeframe_medium:"1-3 Jahre", dnaDetail_timeframe_long:"3+ Jahre", dnaQ_tone:"Analysestil?", dnaOpt_tone_clear:"Klar", dnaOpt_tone_technical:"Technisch", dnaDetail_tone_clear:"Einfach und knapp", dnaDetail_tone_technical:"Tief und datengetrieben", dnaQ_budget:"Ihr Volumenmassstab?", dnaOpt_budget_micro:"Mikro", dnaOpt_budget_macro:"Makro", dnaOpt_budget_corporate:"Unternehmen"
  },
  es: {
    step4t:"Decidir", sector:"Sector", sectors:"SECTOR", bio:"BIO", rumorStatus:"RUMOR", sectorMeta:"Sector", error:"Error",
    dnaOpt_sectors_tech:"Tecnologia", dnaOpt_sectors_energy:"Energia", dnaOpt_sectors_defense:"Defensa", dnaOpt_sectors_food:"Alimentos", dnaOpt_sectors_health:"Salud", dnaOpt_sectors_finance:"Finanzas", dnaQ_risk:"Tu estilo de inversion?", dnaOpt_risk_cube:"Cubo", dnaOpt_risk_prism:"Prisma", dnaOpt_risk_pyramid:"Piramide", dnaDetail_risk_cube:"Conservador", dnaDetail_risk_prism:"Equilibrado", dnaDetail_risk_pyramid:"Agresivo", dnaQ_timeframe:"Tu horizonte de inversion?", dnaOpt_timeframe_short:"Corto", dnaOpt_timeframe_medium:"Medio", dnaOpt_timeframe_long:"Largo", dnaDetail_timeframe_short:"0-1 ano", dnaDetail_timeframe_medium:"1-3 anos", dnaDetail_timeframe_long:"3+ anos", dnaQ_tone:"Estilo de analisis?", dnaOpt_tone_clear:"Claro", dnaOpt_tone_technical:"Tecnico", dnaDetail_tone_clear:"Simple y conciso", dnaDetail_tone_technical:"Profundo y basado en datos", dnaQ_budget:"Tu escala de volumen?", dnaOpt_budget_micro:"Micro", dnaOpt_budget_macro:"Macro", dnaOpt_budget_corporate:"Corporativo"
  }
};
Object.entries(GMA_DNA_TRANSLATION_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_MARKET_ACTION_FIXES = {
  ru: { noApiKey:"Ключ API не задан — добавьте в настройках", liveDataUpdated:"Живые данные обновлены", simulationRunning:"Симуляция работает", cartRemoved:"удалено из корзины", basketAdded:"добавлено в корзину", watchRemoved:"удалено из списка наблюдения", watchAdded:"добавлено в список наблюдения", alertCreated:"уведомление создано", maxCompare:"Можно выбрать не более 5 компаний", addedToComparison:"добавлено к сравнению", chart:"ГРАФИК", add:"ДОБАВИТЬ", watch:"НАБЛЮДАТЬ", alert:"СИГНАЛ", aiAnalysis:"AI-АНАЛИЗ", riskOpportunity:"РИСК И ВОЗМОЖНОСТЬ", historicalChart:"ИСТОРИЧЕСКИЙ ГРАФИК", priceRiseAlert:"СИГНАЛ РОСТА ЦЕНЫ", riseThreshold:"ПОРОГ РОСТА", target:"ЦЕЛЬ", setAlert:"УСТАНОВИТЬ СИГНАЛ", cart:"КОРЗИНА", watchlist:"СПИСОК", cartEmpty:"Корзина пуста", watchlistEmpty:"Список наблюдения пуст", noPurchasesYet:"Покупок пока нет", remove:"удалить", units:"единицы", buyIn:"покупка", currentValue:"Текущая стоимость", cost:"Стоимость", profitLoss:"Прибыль / Убыток" },
  ar: { noApiKey:"لا يوجد مفتاح API — أضفه من الإعدادات", liveDataUpdated:"تم تحديث البيانات المباشرة", simulationRunning:"المحاكاة قيد التشغيل", cartRemoved:"تمت إزالته من السلة", basketAdded:"تمت إضافته إلى السلة", watchRemoved:"تمت إزالته من قائمة المتابعة", watchAdded:"تمت إضافته إلى قائمة المتابعة", alertCreated:"تم إنشاء التنبيه", maxCompare:"يمكن اختيار 5 شركات كحد أقصى", addedToComparison:"تمت إضافته إلى المقارنة", chart:"الرسم", add:"إضافة", watch:"متابعة", alert:"تنبيه", aiAnalysis:"تحليل AI", riskOpportunity:"المخاطر والفرص", historicalChart:"الرسم التاريخي", priceRiseAlert:"تنبيه ارتفاع السعر", riseThreshold:"حد الارتفاع", target:"الهدف", setAlert:"ضبط التنبيه", cart:"السلة", watchlist:"قائمة المتابعة", cartEmpty:"السلة فارغة", watchlistEmpty:"قائمة المتابعة فارغة", noPurchasesYet:"لا توجد مشتريات بعد", remove:"إزالة", units:"وحدات", buyIn:"سعر الشراء", currentValue:"القيمة الحالية", cost:"التكلفة", profitLoss:"الربح / الخسارة" },
  zh: { noApiKey:"没有 API 密钥 — 请在设置中添加", liveDataUpdated:"实时数据已更新", simulationRunning:"模拟正在运行", cartRemoved:"已从购物篮移除", basketAdded:"已加入购物篮", watchRemoved:"已从观察列表移除", watchAdded:"已加入观察列表", alertCreated:"提醒已创建", maxCompare:"最多可选择 5 家公司", addedToComparison:"已加入比较", chart:"图表", add:"添加", watch:"观察", alert:"提醒", aiAnalysis:"AI 分析", riskOpportunity:"风险与机会", historicalChart:"历史图表", priceRiseAlert:"价格上涨提醒", riseThreshold:"上涨阈值", target:"目标", setAlert:"设置提醒", cart:"购物篮", watchlist:"观察列表", cartEmpty:"购物篮为空", watchlistEmpty:"观察列表为空", noPurchasesYet:"暂无买入", remove:"移除", units:"单位", buyIn:"买入价", currentValue:"当前价值", cost:"成本", profitLoss:"盈亏" },
  hi: { noApiKey:"API कुंजी नहीं — सेटिंग्स से जोड़ें", liveDataUpdated:"लाइव डेटा अपडेट हुआ", simulationRunning:"सिम्युलेशन चल रहा है", cartRemoved:"कार्ट से हटाया गया", basketAdded:"कार्ट में जोड़ा गया", watchRemoved:"वॉचलिस्ट से हटाया गया", watchAdded:"वॉचलिस्ट में जोड़ा गया", alertCreated:"अलर्ट बनाया गया", maxCompare:"अधिकतम 5 कंपनियाँ चुनी जा सकती हैं", addedToComparison:"तुलना में जोड़ा गया", chart:"चार्ट", add:"जोड़ें", watch:"देखें", alert:"अलर्ट", aiAnalysis:"AI विश्लेषण", riskOpportunity:"जोखिम और अवसर", historicalChart:"ऐतिहासिक चार्ट", priceRiseAlert:"मूल्य वृद्धि अलर्ट", riseThreshold:"वृद्धि सीमा", target:"लक्ष्य", setAlert:"अलर्ट सेट करें", cart:"कार्ट", watchlist:"वॉचलिस्ट", cartEmpty:"कार्ट खाली है", watchlistEmpty:"वॉचलिस्ट खाली है", noPurchasesYet:"अभी खरीदारी नहीं", remove:"हटाएँ", units:"इकाइयाँ", buyIn:"खरीद मूल्य", currentValue:"वर्तमान मूल्य", cost:"लागत", profitLoss:"लाभ / हानि" },
  de: { noApiKey:"Kein API-Schlussel — in Einstellungen hinzufugen", liveDataUpdated:"Live-Daten aktualisiert", simulationRunning:"Simulation lauft", cartRemoved:"aus Korb entfernt", basketAdded:"zum Korb hinzugefugt", watchRemoved:"aus Watchlist entfernt", watchAdded:"zur Watchlist hinzugefugt", alertCreated:"Alarm erstellt", maxCompare:"Maximal 5 Unternehmen auswahlen", addedToComparison:"zum Vergleich hinzugefugt", chart:"CHART", add:"HINZUFUGEN", watch:"BEOBACHTEN", alert:"ALARM", aiAnalysis:"AI-ANALYSE", riskOpportunity:"RISIKO & CHANCE", historicalChart:"HISTORISCHER CHART", priceRiseAlert:"PREISANSTIEG-ALARM", riseThreshold:"ANSTIEGSSCHWELLE", target:"ZIEL", setAlert:"ALARM SETZEN", cart:"KORB", watchlist:"WATCHLIST", cartEmpty:"Korb ist leer", watchlistEmpty:"Watchlist ist leer", noPurchasesYet:"Noch keine Kaufe", remove:"entfernen", units:"Einheiten", buyIn:"Kaufkurs", currentValue:"Aktueller Wert", cost:"Kosten", profitLoss:"Gewinn / Verlust" },
  es: { noApiKey:"Sin clave API — agregala en Configuracion", liveDataUpdated:"Datos en vivo actualizados", simulationRunning:"La simulacion esta activa", cartRemoved:"eliminado del carrito", basketAdded:"agregado al carrito", watchRemoved:"eliminado de la lista", watchAdded:"agregado a la lista", alertCreated:"alerta creada", maxCompare:"Se pueden seleccionar maximo 5 empresas", addedToComparison:"agregado a comparacion", chart:"GRAFICO", add:"AGREGAR", watch:"SEGUIR", alert:"ALERTA", aiAnalysis:"ANALISIS AI", riskOpportunity:"RIESGO Y OPORTUNIDAD", historicalChart:"GRAFICO HISTORICO", priceRiseAlert:"ALERTA DE SUBIDA", riseThreshold:"UMBRAL DE SUBIDA", target:"OBJETIVO", setAlert:"CREAR ALERTA", cart:"CARRITO", watchlist:"LISTA", cartEmpty:"El carrito esta vacio", watchlistEmpty:"La lista esta vacia", noPurchasesYet:"Aun no hay compras", remove:"eliminar", units:"unidades", buyIn:"compra", currentValue:"Valor actual", cost:"Costo", profitLoss:"Ganancia / Perdida" }
};
Object.entries(GMA_MARKET_ACTION_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_PRICING_LEGAL_FIXES = {
  en: { pricingManagedLine1:"Pay GMA - we manage GMA Triple Consensus for you.", pricingManagedLine2:"One platform, three AI engines.", detailedComparison:"DETAILED COMPARISON", feature:"FEATURE", integratedAiPartners:"INTEGRATED AI PARTNERS", apiCostsManaged:"GMA manages all API costs on your behalf. One subscription, three AI engines.", apiCostsManagedShort:"GMA manages all API costs on your behalf.", pricingLegalWarning:"This platform does not provide investment advice. All decisions remain the responsibility of the investor.", pricingLegalWarningShort:"This platform does not provide investment advice. All decisions remain the responsibility of the investor.", secureCheckoutViaPaddle:"SECURE CHECKOUT via PADDLE", secureCheckoutTitle:"Secure Checkout via Paddle", secureCheckoutBody:"Your payment is securely processed by Paddle.com — our authorized Merchant of Record. GMA never stores your card details. Clicking below opens Paddle's secure hosted checkout.", proceedToCheckout:"Proceed to Checkout", startFreeCheckout:"Start Free", checkoutSecuredNote:"Secured by Paddle.com — card data never stored on GMA servers.", openingPaddle:"Opening Paddle Checkout...", pleaseWait:"Please wait, do not close this page.", planActivatedShort:"plan access activated.", creditsAdded:"credits added to your account.", plan:"Plan", myProfile:"My Profile" },
  tr: { pricingManagedLine1:"GMA'ya odeme yapin - GMA Triple Consensus'u sizin icin yonetiyoruz.", pricingManagedLine2:"Tek platform, uc AI motoru.", detailedComparison:"DETAYLI KARSILASTIRMA", feature:"OZELLIK", integratedAiPartners:"ENTEGRE AI ORTAKLARI", apiCostsManaged:"GMA tum API maliyetlerini sizin adiniza yonetir. Tek abonelik, uc AI motoru.", apiCostsManagedShort:"GMA tüm API maliyetlerini sizin adınıza yönetir.", pricingLegalWarning:"Bu platform yatirim tavsiyesi vermez. Tum kararlar yatirimcinin sorumlulugundadir.", pricingLegalWarningShort:"Bu platform yatırım tavsiyesi vermez. Tüm kararlar yatırımcının sorumluluğundadır.", secureCheckoutViaPaddle:"PADDLE ILE GUVENLI ODEME", secureCheckoutTitle:"Paddle ile Guvenli Odeme", secureCheckoutBody:"Odemeniz yetkili kayitli satici is ortagimiz Paddle.com tarafindan guvenle islenir. GMA kart bilgilerinizi saklamaz. Asagidaki buton Paddle'in guvenli odeme sayfasini acar.", proceedToCheckout:"Odemeye Devam Et", startFreeCheckout:"Ucretsiz Basla", checkoutSecuredNote:"Paddle.com guvencesiyle - kart verileri GMA sunucularinda saklanmaz.", openingPaddle:"Paddle odeme ekrani aciliyor...", pleaseWait:"Lutfen bekleyin, bu sayfayi kapatmayin.", planActivatedShort:"plan erisimi etkinlestirildi.", creditsAdded:"kredi hesabiniza eklendi.", plan:"Plan", myProfile:"Profilim" },
  ru: { pricingManagedLine1:"Оплатите GMA - мы управляем GMA Triple Consensus за вас.", pricingManagedLine2:"Одна платформа, три AI-движка.", detailedComparison:"ПОДРОБНОЕ СРАВНЕНИЕ", feature:"ФУНКЦИЯ", integratedAiPartners:"ИНТЕГРИРОВАННЫЕ AI-ПАРТНЁРЫ", apiCostsManaged:"GMA управляет всеми API-расходами за вас. Одна подписка, три AI-движка.", apiCostsManagedShort:"GMA управляет всеми API-расходами от вашего имени.", pricingLegalWarning:"Платформа не предоставляет инвестиционных рекомендаций. Все решения остаются ответственностью инвестора.", pricingLegalWarningShort:"Эта платформа не предоставляет инвестиционных рекомендаций. Все решения остаются ответственностью инвестора.", secureCheckoutViaPaddle:"БЕЗОПАСНАЯ ОПЛАТА ЧЕРЕЗ PADDLE", secureCheckoutTitle:"Безопасная оплата через Paddle", secureCheckoutBody:"Платёж безопасно обрабатывается Paddle.com, нашим официальным продавцом. GMA не хранит данные карт. Кнопка ниже откроет безопасную страницу Paddle.", proceedToCheckout:"Перейти к оплате", startFreeCheckout:"Начать бесплатно", checkoutSecuredNote:"Защищено Paddle.com — данные карт не хранятся на серверах GMA.", openingPaddle:"Открывается оплата Paddle...", pleaseWait:"Пожалуйста, подождите и не закрывайте страницу.", planActivatedShort:"доступ плана активирован.", creditsAdded:"кредитов добавлено в аккаунт.", plan:"План", myProfile:"Мой профиль" },
  ar: { pricingManagedLine1:"ادفع لـ GMA - نحن ندير توافق GMA الثلاثي نيابة عنك.", pricingManagedLine2:"منصة واحدة، ثلاثة محركات AI.", detailedComparison:"مقارنة تفصيلية", feature:"الميزة", integratedAiPartners:"شركاء AI المدمجون", apiCostsManaged:"تدير GMA كل تكاليف API نيابة عنك. اشتراك واحد، ثلاثة محركات AI.", apiCostsManagedShort:"تدير GMA جميع تكاليف API نيابة عنك.", pricingLegalWarning:"هذه المنصة لا تقدم نصائح استثمارية. تبقى كل القرارات مسؤولية المستثمر.", pricingLegalWarningShort:"هذه المنصة لا تقدم نصائح استثمارية. تبقى كل القرارات مسؤولية المستثمر.", secureCheckoutViaPaddle:"دفع آمن عبر PADDLE", secureCheckoutTitle:"دفع آمن عبر Paddle", secureCheckoutBody:"تتم معالجة دفعتك بأمان عبر Paddle.com، شريكنا المعتمد كسجل تجاري. لا تخزن GMA بيانات بطاقتك. الزر أدناه يفتح صفحة الدفع الآمنة لدى Paddle.", proceedToCheckout:"المتابعة إلى الدفع", startFreeCheckout:"ابدأ مجانًا", checkoutSecuredNote:"محمي بواسطة Paddle.com — لا يتم تخزين بيانات البطاقة على خوادم GMA.", openingPaddle:"جار فتح دفع Paddle...", pleaseWait:"يرجى الانتظار وعدم إغلاق الصفحة.", planActivatedShort:"تم تفعيل وصول الخطة.", creditsAdded:"تمت إضافة الأرصدة إلى حسابك.", plan:"الخطة", myProfile:"ملفي الشخصي", legal:"القانوني", legalNoticeTitle:"إشعار قانوني", legalNotice:"هذه المنصة لا تقدم نصائح استثمارية. تقدم GMA رؤى تحليلية مدعومة بالذكاء الاصطناعي لأغراض معلوماتية فقط. تبقى قرارات الاستثمار النهائية مسؤولية المستثمر بالكامل." },
  zh: { pricingManagedLine1:"支付 GMA - 我们为您管理 GMA 三重共识。", pricingManagedLine2:"一个平台，三个 AI 引擎。", detailedComparison:"详细比较", feature:"功能", integratedAiPartners:"集成 AI 伙伴", apiCostsManaged:"GMA 代表您管理所有 API 成本。一个订阅，三个 AI 引擎。", apiCostsManagedShort:"GMA 代表您管理所有 API 成本。", pricingLegalWarning:"本平台不提供投资建议。所有决策均由投资者负责。", pricingLegalWarningShort:"本平台不提供投资建议。所有决策均由投资者负责。", secureCheckoutViaPaddle:"通过 PADDLE 安全结账", secureCheckoutTitle:"通过 Paddle 安全结账", secureCheckoutBody:"您的付款由授权登记销售方 Paddle.com 安全处理。GMA 永不存储您的银行卡信息。点击下方将打开 Paddle 安全托管结账。", proceedToCheckout:"继续结账", startFreeCheckout:"免费开始", checkoutSecuredNote:"由 Paddle.com 保护 — 银行卡数据不会存储在 GMA 服务器。", openingPaddle:"正在打开 Paddle 结账...", pleaseWait:"请稍候，不要关闭此页面。", planActivatedShort:"计划访问已激活。", creditsAdded:"额度已添加到您的账户。", plan:"计划", myProfile:"我的资料", legal:"法律", legalNoticeTitle:"法律声明", legalNotice:"本平台不提供投资建议。GMA 仅提供用于信息目的的 AI 辅助分析洞察。最终投资决定完全由投资者负责。" },
  hi: { pricingManagedLine1:"GMA को भुगतान करें - हम आपके लिए GMA Triple Consensus प्रबंधित करते हैं।", pricingManagedLine2:"एक प्लेटफ़ॉर्म, तीन AI इंजन।", detailedComparison:"विस्तृत तुलना", feature:"सुविधा", integratedAiPartners:"एकीकृत AI भागीदार", apiCostsManaged:"GMA आपकी ओर से सभी API लागतों का प्रबंधन करता है। एक सदस्यता, तीन AI इंजन।", apiCostsManagedShort:"GMA आपकी ओर से सभी API लागतों का प्रबंधन करता है।", pricingLegalWarning:"यह प्लेटफ़ॉर्म निवेश सलाह नहीं देता। सभी निर्णय निवेशक की जिम्मेदारी हैं।", pricingLegalWarningShort:"यह प्लेटफ़ॉर्म निवेश सलाह नहीं देता। सभी निर्णय निवेशक की जिम्मेदारी हैं।", secureCheckoutViaPaddle:"PADDLE द्वारा सुरक्षित भुगतान", secureCheckoutTitle:"Paddle द्वारा सुरक्षित भुगतान", secureCheckoutBody:"आपका भुगतान Paddle.com द्वारा सुरक्षित रूप से संसाधित होता है, जो हमारा अधिकृत आधिकारिक विक्रेता है। GMA आपके कार्ड विवरण संग्रहीत नहीं करता। नीचे क्लिक करने पर Paddle का सुरक्षित चेकआउट खुलेगा।", proceedToCheckout:"चेकआउट जारी रखें", startFreeCheckout:"मुफ्त शुरू करें", checkoutSecuredNote:"Paddle.com द्वारा सुरक्षित — कार्ड डेटा GMA सर्वर पर संग्रहीत नहीं होता।", openingPaddle:"Paddle चेकआउट खुल रहा है...", pleaseWait:"कृपया प्रतीक्षा करें, यह पेज बंद न करें।", planActivatedShort:"योजना एक्सेस सक्रिय हो गया।", creditsAdded:"क्रेडिट आपके खाते में जोड़े गए।", plan:"योजना", myProfile:"मेरी प्रोफ़ाइल", legal:"कानूनी", legalNoticeTitle:"कानूनी सूचना", legalNotice:"यह प्लेटफ़ॉर्म निवेश सलाह नहीं देता। GMA केवल जानकारी के उद्देश्य से AI-सहायित विश्लेषणात्मक अंतर्दृष्टि देता है। अंतिम निवेश निर्णय पूरी तरह निवेशक की जिम्मेदारी हैं।" },
  de: { pricingManagedLine1:"Zahlen Sie GMA - wir verwalten GMA Triple Consensus fur Sie.", pricingManagedLine2:"Eine Plattform, drei AI-Engines.", detailedComparison:"DETAILLIERTER VERGLEICH", feature:"FUNKTION", integratedAiPartners:"INTEGRIERTE AI-PARTNER", apiCostsManaged:"GMA verwaltet alle API-Kosten in Ihrem Namen. Ein Abo, drei AI-Engines.", apiCostsManagedShort:"GMA verwaltet alle API-Kosten in Ihrem Namen.", pricingLegalWarning:"Diese Plattform bietet keine Anlageberatung. Alle Entscheidungen bleiben Verantwortung des Investors.", pricingLegalWarningShort:"Diese Plattform bietet keine Anlageberatung. Alle Entscheidungen bleiben Verantwortung des Investors.", secureCheckoutViaPaddle:"SICHERER CHECKOUT UBER PADDLE", secureCheckoutTitle:"Sicherer Checkout uber Paddle", secureCheckoutBody:"Ihre Zahlung wird sicher von Paddle.com verarbeitet, unserem autorisierten offiziellen Verkäufer. GMA speichert keine Kartendaten. Der Button offnet den sicheren Paddle-Checkout.", proceedToCheckout:"Weiter zur Zahlung", startFreeCheckout:"Kostenlos starten", checkoutSecuredNote:"Gesichert durch Paddle.com — Kartendaten werden nicht auf GMA-Servern gespeichert.", openingPaddle:"Paddle Checkout wird geoffnet...", pleaseWait:"Bitte warten, diese Seite nicht schliessen.", planActivatedShort:"Planzugang aktiviert.", creditsAdded:"Credits Ihrem Konto hinzugefugt.", plan:"Plan", myProfile:"Mein Profil" },
  es: { pricingManagedLine1:"Paga GMA - gestionamos GMA Triple Consensus por ti.", pricingManagedLine2:"Una plataforma, tres motores AI.", detailedComparison:"COMPARACION DETALLADA", feature:"FUNCION", integratedAiPartners:"SOCIOS AI INTEGRADOS", apiCostsManaged:"GMA gestiona todos los costos API por ti. Una suscripcion, tres motores AI.", apiCostsManagedShort:"GMA gestiona todos los costos API por ti.", pricingLegalWarning:"Esta plataforma no ofrece asesoramiento de inversion. Todas las decisiones son responsabilidad del inversor.", pricingLegalWarningShort:"Esta plataforma no ofrece asesoramiento de inversion. Todas las decisiones son responsabilidad del inversor.", secureCheckoutViaPaddle:"PAGO SEGURO via PADDLE", secureCheckoutTitle:"Pago seguro via Paddle", secureCheckoutBody:"Tu pago se procesa de forma segura por Paddle.com, nuestro vendedor oficial autorizado. GMA nunca almacena datos de tarjeta. El boton abre el checkout seguro de Paddle.", proceedToCheckout:"Continuar al pago", startFreeCheckout:"Comenzar gratis", checkoutSecuredNote:"Protegido por Paddle.com — los datos de tarjeta nunca se guardan en servidores GMA.", openingPaddle:"Abriendo checkout de Paddle...", pleaseWait:"Espera, no cierres esta pagina.", planActivatedShort:"acceso del plan activado.", creditsAdded:"creditos agregados a tu cuenta.", plan:"Plan", myProfile:"Mi perfil" }
};
Object.entries(GMA_PRICING_LEGAL_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_SECTOR_I18N = {
  en: { sectorTech:"TECHNOLOGY", sectorAi:"AI", sectorCrypto:"CRYPTO", sectorFood:"FOOD", sectorAuto:"AUTOMOTIVE", sectorAerospace:"AEROSPACE", sectorDefense:"DEFENSE", sectorChip:"SEMICONDUCTOR", sectorFinance:"FINANCE", sectorMetals:"PRECIOUS METALS", sectorBanking:"BANKING", sectorFashion:"FASHION", sectorHealth:"HEALTH", valuationEstimate:"valuation estimate" },
  tr: { sectorTech:"TEKNOLOJİ", sectorAi:"YZ", sectorCrypto:"KRİPTO", sectorFood:"GIDA", sectorAuto:"OTOMOTİV", sectorAerospace:"HAVACILIK", sectorDefense:"SAVUNMA", sectorChip:"YARI İLETKEN", sectorFinance:"FİNANS", sectorMetals:"DEĞERLİ MADENLER", sectorBanking:"BANKACILIK", sectorFashion:"MODA", sectorHealth:"SAĞLIK", valuationEstimate:"değerleme tahmini" },
  ru: { sectorTech:"ТЕХНОЛОГИИ", sectorAi:"ИИ", sectorCrypto:"КРИПТО", sectorFood:"ПИТАНИЕ", sectorAuto:"АВТОМОБИЛИ", sectorAerospace:"АЭРОКОСМИЧЕСКАЯ", sectorDefense:"ОБОРОНА", sectorChip:"ПОЛУПРОВОДНИКИ", sectorFinance:"ФИНАНСЫ", sectorMetals:"ДРАГОЦЕННЫЕ МЕТАЛЛЫ", sectorBanking:"БАНКИНГ", sectorFashion:"МОДА", sectorHealth:"ЗДРАВООХРАНЕНИЕ", valuationEstimate:"оценка стоимости" },
  ar: { sectorTech:"تقنية", sectorAi:"ذكاء اصطناعي", sectorCrypto:"تشفير", sectorFood:"غذاء", sectorAuto:"سيارات", sectorAerospace:"فضائية", sectorDefense:"دفاع", sectorChip:"أشباه الموصلات", sectorFinance:"تمويل", sectorMetals:"معادن ثمينة", sectorBanking:"مصرفية", sectorFashion:"أزياء", sectorHealth:"صحة", valuationEstimate:"تقدير التقييم" },
  zh: { sectorTech:"科技", sectorAi:"人工智能", sectorCrypto:"加密货币", sectorFood:"食品", sectorAuto:"汽车", sectorAerospace:"航空航天", sectorDefense:"国防", sectorChip:"半导体", sectorFinance:"金融", sectorMetals:"贵金属", sectorBanking:"银行业", sectorFashion:"时尚", sectorHealth:"健康", valuationEstimate:"估值预测" },
  hi: { sectorTech:"प्रौद्योगिकी", sectorAi:"एआई", sectorCrypto:"क्रिप्टो", sectorFood:"खाद्य", sectorAuto:"ऑटोमोटिव", sectorAerospace:"एयरोस्पेस", sectorDefense:"रक्षा", sectorChip:"सेमीकंडक्टर", sectorFinance:"वित्त", sectorMetals:"कीमती धातु", sectorBanking:"बैंकिंग", sectorFashion:"फैशन", sectorHealth:"स्वास्थ्य", valuationEstimate:"मूल्यांकन अनुमान" },
  de: { sectorTech:"TECHNOLOGIE", sectorAi:"KI", sectorCrypto:"KRYPTO", sectorFood:"LEBENSMITTEL", sectorAuto:"AUTOMOBIL", sectorAerospace:"LUFT & RAUMFAHRT", sectorDefense:"VERTEIDIGUNG", sectorChip:"HALBLEITER", sectorFinance:"FINANZEN", sectorMetals:"EDELMETALLE", sectorBanking:"BANKWESEN", sectorFashion:"MODE", sectorHealth:"GESUNDHEIT", valuationEstimate:"Bewertungsschätzung" },
  es: { sectorTech:"TECNOLOGÍA", sectorAi:"IA", sectorCrypto:"CRIPTO", sectorFood:"ALIMENTOS", sectorAuto:"AUTOMOTRIZ", sectorAerospace:"AEROESPACIAL", sectorDefense:"DEFENSA", sectorChip:"SEMICONDUCTORES", sectorFinance:"FINANZAS", sectorMetals:"METALES PRECIOSOS", sectorBanking:"BANCA", sectorFashion:"MODA", sectorHealth:"SALUD", valuationEstimate:"estimación de valoración" }
};
Object.entries(GMA_SECTOR_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_PLAN_I18N_FIXES = {
  en: {
    planFreeLabel:"Free Trial", planExplorerLabel:"Explorer", planStrategistLabel:"Strategist", planProArchitectLabel:"Pro-Architect",
    planFreeBadge:"3 ANALYSES", planExplorerBadge:"STARTER", planStrategistBadge:"MOST POPULAR", planProArchitectBadge:"SOVEREIGN",
    planFreeScope:"1 Sector", planExplorerScope:"1 Sector · 10 Analyses", planStrategistScope:"Unlimited · All Sectors", planProArchitectScope:"Global + Signal DNA · 126 Years",
    planFreeStats:"3 credits · 3 analyses", planExplorerStats:"10 credits · 10 analyses", planStrategistStats:"Unlimited credits · all sectors", planProArchitectStats:"Global access · 126 years", periodMonth:"/mo", accessActivated:"Access Activated"
  },
  tr: {
    planFreeLabel:"Ücretsiz Deneme", planExplorerLabel:"Kaşif", planStrategistLabel:"Stratejist", planProArchitectLabel:"Pro-Mimar",
    planFreeBadge:"3 ANALİZ", planExplorerBadge:"BAŞLANGIÇ", planStrategistBadge:"EN POPÜLER", planProArchitectBadge:"BAĞIMSIZ",
    planFreeScope:"1 Sektör", planExplorerScope:"1 Sektör · 10 Analiz", planStrategistScope:"Sınırsız · Tüm Sektörler", planProArchitectScope:"Küresel + Sinyal DNA · 126 Yıl",
    planFreeStats:"3 kredi · 3 analiz", planExplorerStats:"10 kredi · 10 analiz", planStrategistStats:"Sınırsız kredi · tüm sektörler", planProArchitectStats:"Küresel erişim · 126 yıl", periodMonth:"/ay", accessActivated:"Erişim Aktif"
  },
  ru: {
    planFreeLabel:"Бесплатный пробный доступ", planExplorerLabel:"Исследователь", planStrategistLabel:"Стратег", planProArchitectLabel:"Про-архитектор",
    planFreeBadge:"3 АНАЛИЗА", planExplorerBadge:"СТАРТ", planStrategistBadge:"САМЫЙ ПОПУЛЯРНЫЙ", planProArchitectBadge:"СУВЕРЕННЫЙ",
    planFreeScope:"1 сектор", planExplorerScope:"1 сектор · 10 анализов", planStrategistScope:"Без лимита · все секторы", planProArchitectScope:"Глобально + Signal DNA · 126 лет",
    planFreeStats:"3 кредита · 3 анализа", planExplorerStats:"10 кредитов · 10 анализов", planStrategistStats:"Безлимитные кредиты · все секторы", planProArchitectStats:"Глобальный доступ · 126 лет", periodMonth:"/мес", accessActivated:"Доступ активирован"
  },
  ar: {
    planFreeLabel:"تجربة مجانية", planExplorerLabel:"المستكشف", planStrategistLabel:"الاستراتيجي", planProArchitectLabel:"المهندس المحترف",
    planFreeBadge:"3 تحليلات", planExplorerBadge:"البداية", planStrategistBadge:"الأكثر شيوعاً", planProArchitectBadge:"سيادي",
    planFreeScope:"قطاع واحد", planExplorerScope:"قطاع واحد · 10 تحليلات", planStrategistScope:"غير محدود · كل القطاعات", planProArchitectScope:"عالمي + Signal DNA · 126 سنة",
    planFreeStats:"3 أرصدة · 3 تحليلات", planExplorerStats:"10 أرصدة · 10 تحليلات", planStrategistStats:"أرصدة غير محدودة · كل القطاعات", planProArchitectStats:"وصول عالمي · 126 سنة", periodMonth:"/شهر", accessActivated:"تم تفعيل الوصول"
  },
  zh: {
    planFreeLabel:"免费试用", planExplorerLabel:"探索者", planStrategistLabel:"策略师", planProArchitectLabel:"专业架构师",
    planFreeBadge:"3 次分析", planExplorerBadge:"入门", planStrategistBadge:"最受欢迎", planProArchitectBadge:"主权级",
    planFreeScope:"1 个行业", planExplorerScope:"1 个行业 · 10 次分析", planStrategistScope:"不限次数 · 全部行业", planProArchitectScope:"全球 + Signal DNA · 126 年",
    planFreeStats:"3 个额度 · 3 次分析", planExplorerStats:"10 个额度 · 10 次分析", planStrategistStats:"不限额度 · 全部行业", planProArchitectStats:"全球访问 · 126 年", periodMonth:"/月", accessActivated:"访问已激活"
  },
  hi: {
    planFreeLabel:"मुफ्त परीक्षण", planExplorerLabel:"एक्सप्लोरर", planStrategistLabel:"रणनीतिकार", planProArchitectLabel:"प्रो-आर्किटेक्ट",
    planFreeBadge:"3 विश्लेषण", planExplorerBadge:"आरंभिक", planStrategistBadge:"सबसे लोकप्रिय", planProArchitectBadge:"स्वायत्त",
    planFreeScope:"1 सेक्टर", planExplorerScope:"1 सेक्टर · 10 विश्लेषण", planStrategistScope:"असीमित · सभी सेक्टर", planProArchitectScope:"वैश्विक + Signal DNA · 126 वर्ष",
    planFreeStats:"3 क्रेडिट · 3 विश्लेषण", planExplorerStats:"10 क्रेडिट · 10 विश्लेषण", planStrategistStats:"असीमित क्रेडिट · सभी सेक्टर", planProArchitectStats:"वैश्विक एक्सेस · 126 वर्ष", periodMonth:"/माह", accessActivated:"एक्सेस सक्रिय"
  },
  de: {
    planFreeLabel:"Kostenlose Testversion", planExplorerLabel:"Explorer", planStrategistLabel:"Stratege", planProArchitectLabel:"Pro-Architekt",
    planFreeBadge:"3 ANALYSEN", planExplorerBadge:"START", planStrategistBadge:"BELIEBT", planProArchitectBadge:"SOUVERÄN",
    planFreeScope:"1 Sektor", planExplorerScope:"1 Sektor · 10 Analysen", planStrategistScope:"Unbegrenzt · alle Sektoren", planProArchitectScope:"Global + Signal DNA · 126 Jahre",
    planFreeStats:"3 Credits · 3 Analysen", planExplorerStats:"10 Credits · 10 Analysen", planStrategistStats:"Unbegrenzte Credits · alle Sektoren", planProArchitectStats:"Globaler Zugriff · 126 Jahre", periodMonth:"/Monat", accessActivated:"Zugriff aktiviert"
  },
  es: {
    planFreeLabel:"Prueba gratis", planExplorerLabel:"Explorador", planStrategistLabel:"Estratega", planProArchitectLabel:"Pro-arquitecto",
    planFreeBadge:"3 ANÁLISIS", planExplorerBadge:"INICIAL", planStrategistBadge:"MÁS POPULAR", planProArchitectBadge:"SOBERANO",
    planFreeScope:"1 sector", planExplorerScope:"1 sector · 10 análisis", planStrategistScope:"Ilimitado · todos los sectores", planProArchitectScope:"Global + Signal DNA · 126 años",
    planFreeStats:"3 créditos · 3 análisis", planExplorerStats:"10 créditos · 10 análisis", planStrategistStats:"Créditos ilimitados · todos los sectores", planProArchitectStats:"Acceso global · 126 años", periodMonth:"/mes", accessActivated:"Acceso activado"
  }
};
Object.entries(GMA_PLAN_I18N_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_PAGE_I18N_FIXES = {
  tr: {
    home:"ANA SAYFA", markets:"PİYASALAR", about:"HAKKINDA", contact:"İLETİŞİM", privacy:"GİZLİLİK", pricing:"FİYATLAR", login:"GİRİŞ YAP", register:"KAYIT OL", logout:"ÇIKIŞ YAP",
    viewMarkets:"PİYASALARI GÖR", loginRegister:"GİRİŞ / KAYIT", heroTitle:"Küresel Piyasaları\nDaha Net Görün", heroSub:"600+ küresel kuruluş, gerçek zamanlı piyasa verisi ve GMA Consensus Engine ile yapılandırılmış finansal zeka.", heroSubtitle:"Yapılandırılmış analiz ve daha net karar çerçevesiyle belirsizliği azaltın.", heroBtn1:"PİYASALARI GÖR", heroBtn2:"FİYATLARI GÖR", heroBtn3:"KAYIT OL",
    howTitle:"Nasıl Çalışır", howSub:"4 Adımda Küresel Yatırım", step1t:"Kayıt Ol", step1d:"E-posta veya Google ile 30 saniyede hesap oluşturun", step2t:"Plan Seç", step2d:"Günlük 2.99$'dan başlayan planlardan seçin", step3t:"Analiz Et", step3d:"GMA Consensus Engine ile stratejik netlik kazanın", step4t:"Karar Ver", step4d:"Güvenilir veri ve analitik netlikle kendi karar çerçevenizi kurun",
    featTitle:"Platform Özellikleri", featSub:"Her şey tek yerde", feat1t:"Canlı Piyasa Akışı", feat1d:"600+ şirketi, kriptoyu, emtiayı ve para birimlerini gerçek zamanlı takip edin", feat2t:"GMA Triumvirate Analizi", feat2d:"GMA Consensus Engine üzerinden kurumsal seviye sinyal uyumunu inceleyin", feat3t:"Tarihsel Grafikler", feat3d:"Kuruluş yılından itibaren grafikler, kriz analizleri ve uzun vadeli trendler", feat4t:"Şirket Karşılaştırma", feat4d:"5 şirkete kadar AI destekli karşılaştırma yapın", feat5t:"Akıllı Uyarılar", feat5d:"Fiyat hedefi uyarıları kurun ve değişimleri anında takip edin", feat6t:"8 Dil", feat6d:"İngilizce, Türkçe, Rusça, Arapça, Çince, Hintçe, Almanca ve İspanyolca için yerelleştirilmiş deneyim",
    ctaTitle:"Karar Netliğini Kurumsal Seviyeye Taşıyın", ctaSub:"Günlük 2.99$'dan başlayan planlarla küresel piyasaları profesyonel düzeyde analiz edin.", ctaBtn1:"Plan Seç →", ctaBtn2:"Önce Keşfet", ctaFree:"Ücretsiz Başla", ctaFreeSub:"Giriş yapmadan piyasaları keşfedin.",
    sector:"Sektör", sectors:"SEKTÖR", allSectors:"TÜMÜ", gainers:"YÜKSELENLER", losers:"DÜŞENLER", live:"CANLI", autoRefresh:"OTOMATİK YENİLE", loadMore:"DAHA FAZLA YÜKLE", allShown:"TÜM KURULUŞLAR GÖSTERİLDİ", clear:"Temizle",
    loginTitle:"Hesabınıza giriş yapın", registerTitle:"Ücretsiz hesabınızı oluşturun", googleContinue:"Google ile devam et", contactTitle:"Bize Ulaşın", contactSub:"Sorularınız ve geri bildirimleriniz için buradayız.", contactInfo:"İletişim Bilgileri", formName:"AD SOYAD", formEmail:"E-POSTA", formSubject:"KONU", formMsg:"MESAJ", formSend:"GÖNDER", formSending:"GÖNDERİLİYOR...", formSent:"Mesajınız gönderildi!",
    aboutTitle:"Global Market Analytics Hakkında", aboutSub:"Küresel piyasalarda yapılandırılmış analiz, netlik ve karar desteği sunan finansal zeka platformu.", aboutMission:"Misyonumuz", aboutMissionText:"Yatırım tavsiyesi sınırını aşmadan yapılandırılmış analizle belirsizliği azaltan finansal karar altyapısı kurmak.", aboutVision:"Vizyonumuz", aboutVisionText:"Daha net anlayışın, düşük belirsizliğin ve güçlü karar disiplininin küresel piyasalarda erişilebilir olduğu bir dünya.",
    pricingTitle:"Küresel Yatırım İçin AI Gücü", pricingSub:"GMA Consensus Engine'e tek bir kurumsal abonelikle erişin.", pricingManagedLine1:"GMA'ya ödeme yapın - GMA Triple Consensus'u sizin için yönetiyoruz.", pricingManagedLine2:"Tek platform, üç AI motoru.", detailedComparison:"DETAYLI KARŞILAŞTIRMA", feature:"ÖZELLİK", integratedAiPartners:"ENTEGRE AI ORTAKLARI", apiCostsManaged:"GMA tüm API maliyetlerini sizin adınıza yönetir. Tek abonelik, üç AI motoru.", pricingLegalWarning:"Bu platform yatırım tavsiyesi vermez. Tüm kararlar yatırımcının sorumluluğundadır.", secureCheckoutViaPaddle:"PADDLE İLE GÜVENLİ ÖDEME", secureCheckoutTitle:"Paddle ile Güvenli Ödeme", secureCheckoutBody:"Ödemeniz yetkili kayıtlı satıcı iş ortağımız Paddle.com tarafından güvenle işlenir. GMA kart bilgilerinizi saklamaz. Aşağıdaki buton Paddle'ın güvenli ödeme sayfasını açar.", proceedToCheckout:"Ödemeye Devam Et", startFreeCheckout:"Ücretsiz Başla", checkoutSecuredNote:"Paddle.com güvencesiyle - kart verileri GMA sunucularında saklanmaz.", openingPaddle:"Paddle ödeme ekranı açılıyor...", pleaseWait:"Lütfen bekleyin, bu sayfayı kapatmayın.", planActivatedShort:"plan erişimi etkinleştirildi.", creditsAdded:"kredi hesabınıza eklendi.",
    legal:"YASAL", legalNoticeTitle:"YASAL BİLDİRİM", legalNoticeNotAdvice:"YASAL BİLDİRİM - YATIRIM TAVSİYESİ DEĞİLDİR", legalNotice:"Bu platform yatırım tavsiyesi vermez. GMA yalnızca bilgilendirme amacıyla AI destekli analitik içgörüler sunar. Nihai yatırım kararları tamamen yatırımcının sorumluluğundadır.", footerDesc:"Küresel piyasalarda netlik sağlamak için tasarlanmış finansal zeka platformu.", copyright:"Tüm hakları saklıdır.", termsNav:"ŞARTLAR", refundNav:"İADE"
  },
  ru: {
    home:"ГЛАВНАЯ", markets:"РЫНКИ", about:"О ПРОЕКТЕ", contact:"КОНТАКТЫ", privacy:"КОНФИДЕНЦИАЛЬНОСТЬ", pricing:"ТАРИФЫ", login:"ВОЙТИ", register:"РЕГИСТРАЦИЯ", logout:"ВЫЙТИ",
    viewMarkets:"СМОТРЕТЬ РЫНКИ", loginRegister:"ВХОД / РЕГИСТРАЦИЯ", heroTitle:"Смотрите мировые рынки\nс большей ясностью", heroSub:"600+ глобальных организаций, рыночные данные в реальном времени и структурированная аналитика через GMA Consensus Engine.", heroSubtitle:"Снижайте неопределенность с помощью структурированного анализа.", heroBtn1:"СМОТРЕТЬ РЫНКИ", heroBtn2:"ТАРИФЫ", heroBtn3:"РЕГИСТРАЦИЯ",
    howTitle:"Как это работает", howSub:"Глобальные инвестиции за 4 шага", step1t:"Регистрация", step1d:"Создайте аккаунт за 30 секунд", step2t:"Выберите план", step2d:"Планы от $2.99 в день", step3t:"Анализ", step3d:"Стратегическая ясность через GMA Consensus Engine", step4t:"Решение", step4d:"Создайте собственную рамку принятия решений",
    featTitle:"Возможности платформы", featSub:"Все в одном месте", feat1t:"Живая лента рынка", feat1d:"Отслеживайте компании, крипто, сырье и валюты в реальном времени", feat2t:"Анализ GMA Triumvirate", feat2d:"Проверяйте согласование сигналов через GMA Consensus Engine", feat3t:"Исторические графики", feat3d:"Долгосрочные графики, кризисы и тренды", feat4t:"Сравнение компаний", feat4d:"Сравнивайте до 5 компаний с AI", feat5t:"Умные уведомления", feat5d:"Настраивайте ценовые уведомления", feat6t:"8 языков", feat6d:"Локализованный интерфейс на 8 языках",
    sector:"Сектор", sectors:"СЕКТОРЫ", allSectors:"ВСЕ", gainers:"РОСТ", losers:"ПАДЕНИЕ", live:"LIVE", autoRefresh:"АВТО-ОБНОВЛЕНИЕ", clear:"Очистить",
    noApiKey:"Нет API-ключа — добавьте в настройках", liveDataUpdated:"Живые данные обновлены", simulationRunning:"Симуляция запущена", cartRemoved:"удалён из корзины", basketAdded:"добавлен в корзину", watchRemoved:"удалён из списка наблюдения", watchAdded:"добавлен в список наблюдения", alertCreated:"уведомление создано", maxCompare:"Можно выбрать не более 5 компаний", addedToComparison:"добавлен в сравнение", chart:"ГРАФИК", add:"ДОБАВИТЬ", watch:"СЛЕДИТЬ", alert:"УВЕДОМЛЕНИЕ", aiAnalysis:"AI-АНАЛИЗ", riskOpportunity:"РИСК И ВОЗМОЖНОСТИ", historicalChart:"ИСТОРИЧЕСКИЙ ГРАФИК", priceRiseAlert:"УВЕДОМЛЕНИЕ О РОСТЕ ЦЕНЫ", riseThreshold:"ПОРОГ РОСТА", target:"ЦЕЛЬ", setAlert:"УСТАНОВИТЬ УВЕДОМЛЕНИЕ", cart:"КОРЗИНА", watchlist:"НАБЛЮДЕНИЕ", cartEmpty:"Корзина пуста", watchlistEmpty:"Список наблюдения пуст", noPurchasesYet:"Покупок ещё нет", remove:"удалить", units:"шт", buyIn:"вход", currentValue:"Текущая стоимость", cost:"Стоимость", profitLoss:"Прибыль / Убыток", signInLegalPrefix:"Входя в систему,", signInLegalSuffix:"продолжая.", disclaimer1:"Эта платформа предназначена только для цифрового информирования.", disclaimer2:"Никакой контент или AI-вывод не является инвестиционным советом.", disclaimer3:"Все инвестиционные решения — ответственность инвестора.", disclaimer4:"Прошлые результаты не гарантируют будущих.", disclaimer5:"Перед торговлей проконсультируйтесь с лицензированным финансовым советником.", disclaimer6:"Данные могут быть симулированы и не отражать реальные биржевые данные.", plan:"план", credits:"Кредиты", founded:"Основан", sectorMeta:"Сектор", livePrice:"Цена",
    loadMore:"ЗАГРУЗИТЬ ЕЩЕ", allShown:"ВСЕ ОРГАНИЗАЦИИ ПОКАЗАНЫ", pricingTitle:"AI-мощность для глобальных инвестиций", pricingSub:"Доступ к GMA Consensus Engine по одной подписке.", pricingManagedLine1:"Оплатите GMA - мы управляем GMA Triple Consensus за вас.", pricingManagedLine2:"Одна платформа, три AI-движка.", detailedComparison:"ПОДРОБНОЕ СРАВНЕНИЕ", feature:"ФУНКЦИЯ", integratedAiPartners:"ИНТЕГРИРОВАННЫЕ AI-ПАРТНЕРЫ", apiCostsManaged:"GMA управляет всеми API-расходами от вашего имени. Одна подписка, три AI-движка.", pricingLegalWarning:"Эта платформа не предоставляет инвестиционных рекомендаций. Все решения остаются ответственностью инвестора.", secureCheckoutViaPaddle:"БЕЗОПАСНАЯ ОПЛАТА ЧЕРЕЗ PADDLE", secureCheckoutTitle:"Безопасная оплата через Paddle", proceedToCheckout:"Перейти к оплате", startFreeCheckout:"Начать бесплатно", openingPaddle:"Открывается оплата Paddle...", pleaseWait:"Пожалуйста, подождите и не закрывайте страницу.", planActivatedShort:"доступ к плану активирован.", creditsAdded:"кредитов добавлено в аккаунт.", legal:"ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ", legalNoticeTitle:"ЮРИДИЧЕСКОЕ УВЕДОМЛЕНИЕ", legalNoticeNotAdvice:"ЮРИДИЧЕСКОЕ УВЕДОМЛЕНИЕ - НЕ ИНВЕСТИЦИОННЫЙ СОВЕТ", legalNotice:"Эта платформа не предоставляет инвестиционных рекомендаций. GMA предоставляет аналитические сведения только в информационных целях.", termsNav:"УСЛОВИЯ", refundNav:"ВОЗВРАТ"
  },
  ar: {
    home:"الرئيسية", markets:"الأسواق", about:"حول المنصة", contact:"اتصل بنا", privacy:"الخصوصية", pricing:"الأسعار", login:"تسجيل الدخول", register:"إنشاء حساب", logout:"تسجيل الخروج",
    viewMarkets:"عرض الأسواق", loginRegister:"تسجيل الدخول / إنشاء حساب", heroTitle:"شاهد الأسواق العالمية\nبوضوح أكبر", heroSub:"أكثر من 600 مؤسسة عالمية، وبيانات سوق فورية، وذكاء منظم عبر GMA Consensus Engine.", heroSubtitle:"قلل عدم اليقين عبر تحليل منظم وإطار قرار أوضح.", heroBtn1:"عرض الأسواق", heroBtn2:"عرض الأسعار", heroBtn3:"إنشاء حساب",
    howTitle:"كيف يعمل", howSub:"الاستثمار العالمي في 4 خطوات", step1t:"إنشاء حساب", step1d:"أنشئ حسابًا خلال 30 ثانية", step2t:"اختر الخطة", step2d:"خطط تبدأ من 2.99$ يوميًا", step3t:"حلل", step3d:"وضوح استراتيجي عبر GMA Consensus Engine", step4t:"قرر", step4d:"ابن إطار قرارك الخاص ببيانات موثوقة",
    featTitle:"ميزات المنصة", featSub:"كل شيء في مكان واحد", feat1t:"تدفق سوق مباشر", feat1d:"تابع الشركات والعملات والسلع لحظيًا", feat2t:"تحليل GMA Triumvirate", feat2d:"راجع توافق الإشارات عبر GMA Consensus Engine", feat3t:"رسوم تاريخية", feat3d:"رسوم طويلة المدى وتحليل أزمات واتجاهات", feat4t:"مقارنة الشركات", feat4d:"قارن حتى 5 شركات بدعم AI", feat5t:"تنبيهات ذكية", feat5d:"اضبط تنبيهات السعر والتغيرات", feat6t:"8 لغات", feat6d:"تجربة مترجمة بعناية إلى 8 لغات",
    loadMore:"تحميل المزيد", allShown:"تم عرض كل المؤسسات", legal:"القانوني", legalNoticeTitle:"إشعار قانوني", legalNoticeNotAdvice:"إشعار قانوني - ليست نصيحة استثمارية", pricingTitle:"قوة AI للاستثمار العالمي", pricingSub:"ادخل إلى GMA Consensus Engine عبر اشتراك واحد.", termsNav:"الشروط", refundNav:"الاسترداد"
  },
  zh: {
    home:"首页", markets:"市场", about:"关于", contact:"联系", privacy:"隐私", pricing:"价格", login:"登录", register:"注册", logout:"退出",
    viewMarkets:"查看市场", loginRegister:"登录 / 注册", heroTitle:"以更高清晰度\n观察全球市场", heroSub:"600+ 家全球机构、实时市场数据，以及由 GMA Consensus Engine 提供的结构化智能。", heroSubtitle:"通过结构化分析降低不确定性。", heroBtn1:"查看市场", heroBtn2:"查看价格", heroBtn3:"注册",
    howTitle:"工作方式", howSub:"全球投资 4 步", step1t:"注册", step1d:"用邮箱或 Google 快速创建账户", step2t:"选择计划", step2d:"计划从每天 2.99 美元起", step3t:"分析", step3d:"通过 GMA Consensus Engine 获得战略清晰度", step4t:"决策", step4d:"用可靠数据建立自己的决策框架",
    featTitle:"平台功能", featSub:"一处完成全部", feat1t:"实时市场流", feat1d:"实时跟踪公司、加密资产、大宗商品和货币", feat2t:"GMA Triumvirate 分析", feat2d:"通过 GMA Consensus Engine 查看信号一致性", feat3t:"历史图表", feat3d:"长期图表、危机分析和趋势", feat4t:"公司比较", feat4d:"最多比较 5 家公司", feat5t:"智能提醒", feat5d:"设置价格目标提醒", feat6t:"8 种语言", feat6d:"精心本地化的 8 种语言体验",
    loadMore:"加载更多", allShown:"已显示所有机构", legal:"法律", legalNoticeTitle:"法律声明", legalNoticeNotAdvice:"法律声明 - 非投资建议", pricingTitle:"全球投资的 AI 能力", pricingSub:"通过一个订阅访问 GMA Consensus Engine。", termsNav:"条款", refundNav:"退款"
  },
  hi: {
    home:"होम", markets:"बाज़ार", about:"परिचय", contact:"संपर्क", privacy:"गोपनीयता", pricing:"मूल्य", login:"साइन इन", register:"साइन अप", logout:"साइन आउट",
    viewMarkets:"बाज़ार देखें", loginRegister:"साइन इन / साइन अप", heroTitle:"वैश्विक बाज़ारों को\nअधिक स्पष्टता से देखें", heroSub:"600+ वैश्विक संगठन, रीयल-टाइम बाज़ार डेटा और GMA Consensus Engine द्वारा संरचित इंटेलिजेंस।", heroSubtitle:"संरचित विश्लेषण से अनिश्चितता कम करें।", heroBtn1:"बाज़ार देखें", heroBtn2:"मूल्य देखें", heroBtn3:"साइन अप",
    howTitle:"यह कैसे काम करता है", howSub:"4 चरणों में वैश्विक निवेश", step1t:"साइन अप", step1d:"ईमेल या Google से खाता बनाएं", step2t:"योजना चुनें", step2d:"$2.99/दिन से शुरू योजनाएँ", step3t:"विश्लेषण करें", step3d:"GMA Consensus Engine से रणनीतिक स्पष्टता", step4t:"निर्णय लें", step4d:"विश्वसनीय डेटा से अपना निर्णय ढांचा बनाएं",
    featTitle:"प्लेटफ़ॉर्म सुविधाएँ", featSub:"सब कुछ एक जगह", feat1t:"लाइव मार्केट फ़ीड", feat1d:"कंपनियों, क्रिप्टो, कमोडिटी और मुद्राओं को रीयल-टाइम में ट्रैक करें", feat2t:"GMA Triumvirate विश्लेषण", feat2d:"GMA Consensus Engine से संकेत संरेखण देखें", feat3t:"ऐतिहासिक चार्ट", feat3d:"दीर्घकालिक चार्ट और ट्रेंड", feat4t:"कंपनी तुलना", feat4d:"AI के साथ अधिकतम 5 कंपनियों की तुलना करें", feat5t:"स्मार्ट अलर्ट", feat5d:"मूल्य लक्ष्य अलर्ट सेट करें", feat6t:"8 भाषाएँ", feat6d:"8 भाषाओं में स्थानीयकृत अनुभव",
    loadMore:"और लोड करें", allShown:"सभी संगठन दिखाए गए", legal:"कानूनी", legalNoticeTitle:"कानूनी सूचना", legalNoticeNotAdvice:"कानूनी सूचना - निवेश सलाह नहीं", pricingTitle:"वैश्विक निवेश के लिए AI शक्ति", pricingSub:"एक सदस्यता से GMA Consensus Engine तक पहुंचें।", termsNav:"शर्तें", refundNav:"रिफंड"
  },
  de: {
    home:"START", markets:"MÄRKTE", about:"ÜBER UNS", contact:"KONTAKT", privacy:"DATENSCHUTZ", pricing:"PREISE", login:"ANMELDEN", register:"REGISTRIEREN", logout:"ABMELDEN",
    viewMarkets:"MÄRKTE ANSEHEN", loginRegister:"ANMELDEN / REGISTRIEREN", heroTitle:"Globale Märkte\nmit mehr Klarheit sehen", heroSub:"600+ globale Organisationen, Echtzeit-Marktdaten und strukturierte Intelligenz über die GMA Consensus Engine.", heroSubtitle:"Reduzieren Sie Unsicherheit mit strukturierter Analyse.", heroBtn1:"MÄRKTE ANSEHEN", heroBtn2:"PREISE ANSEHEN", heroBtn3:"REGISTRIEREN",
    howTitle:"So funktioniert es", howSub:"Globale Investitionen in 4 Schritten", step1t:"Registrieren", step1d:"Konto in 30 Sekunden erstellen", step2t:"Plan wählen", step2d:"Pläne ab 2,99 $ pro Tag", step3t:"Analysieren", step3d:"Strategische Klarheit über GMA Consensus Engine", step4t:"Entscheiden", step4d:"Eigene Entscheidungslogik mit verlässlichen Daten aufbauen",
    featTitle:"Plattformfunktionen", featSub:"Alles an einem Ort", feat1t:"Live-Marktdaten", feat1d:"Unternehmen, Krypto, Rohstoffe und Währungen in Echtzeit verfolgen", feat2t:"GMA Triumvirate Analyse", feat2d:"Signalabgleich über GMA Consensus Engine prüfen", feat3t:"Historische Charts", feat3d:"Langfristige Charts, Krisenanalysen und Trends", feat4t:"Unternehmensvergleich", feat4d:"Bis zu 5 Unternehmen mit AI vergleichen", feat5t:"Smarte Alarme", feat5d:"Preisalarme festlegen", feat6t:"8 Sprachen", feat6d:"Lokalisierte Erfahrung in 8 Sprachen",
    loadMore:"MEHR LADEN", allShown:"ALLE ORGANISATIONEN ANGEZEIGT", pricingTitle:"AI-Leistung für globale Investitionen", pricingSub:"Zugriff auf die GMA Consensus Engine mit einem Abo.", pricingManagedLine1:"Zahlen Sie GMA - wir verwalten GMA Triple Consensus für Sie.", pricingManagedLine2:"Eine Plattform, drei AI-Engines.", detailedComparison:"DETAILLIERTER VERGLEICH", feature:"FUNKTION", integratedAiPartners:"INTEGRIERTE AI-PARTNER", apiCostsManaged:"GMA verwaltet alle API-Kosten in Ihrem Namen. Ein Abo, drei AI-Engines.", pricingLegalWarning:"Diese Plattform bietet keine Anlageberatung. Alle Entscheidungen bleiben Verantwortung des Investors.", secureCheckoutViaPaddle:"SICHERER CHECKOUT ÜBER PADDLE", secureCheckoutTitle:"Sicherer Checkout über Paddle", proceedToCheckout:"Weiter zur Zahlung", startFreeCheckout:"Kostenlos starten", openingPaddle:"Paddle Checkout wird geöffnet...", pleaseWait:"Bitte warten, diese Seite nicht schließen.", planActivatedShort:"Planzugang aktiviert.", creditsAdded:"Credits Ihrem Konto hinzugefügt.", legal:"RECHTLICHES", legalNoticeTitle:"RECHTLICHER HINWEIS", legalNoticeNotAdvice:"RECHTLICHER HINWEIS - KEINE ANLAGEBERATUNG", termsNav:"BEDINGUNGEN", refundNav:"ERSTATTUNG"
  },
  es: {
    home:"INICIO", markets:"MERCADOS", about:"ACERCA DE", contact:"CONTACTO", privacy:"PRIVACIDAD", pricing:"PRECIOS", login:"INICIAR SESIÓN", register:"REGISTRARSE", logout:"CERRAR SESIÓN",
    viewMarkets:"VER MERCADOS", loginRegister:"INICIAR SESIÓN / REGISTRARSE", heroTitle:"Vea los mercados globales\ncon mayor claridad", heroSub:"Más de 600 organizaciones globales, datos de mercado en tiempo real e inteligencia estructurada mediante GMA Consensus Engine.", heroSubtitle:"Reduzca la incertidumbre con análisis estructurado.", heroBtn1:"VER MERCADOS", heroBtn2:"VER PRECIOS", heroBtn3:"REGISTRARSE",
    howTitle:"Cómo funciona", howSub:"Inversión global en 4 pasos", step1t:"Regístrese", step1d:"Cree una cuenta en 30 segundos", step2t:"Elija plan", step2d:"Planes desde 2,99 $ al día", step3t:"Analice", step3d:"Claridad estratégica con GMA Consensus Engine", step4t:"Decida", step4d:"Construya su propio marco de decisión con datos fiables",
    featTitle:"Funciones de la plataforma", featSub:"Todo en un lugar", feat1t:"Flujo de mercado en vivo", feat1d:"Siga empresas, cripto, materias primas y divisas en tiempo real", feat2t:"Análisis GMA Triumvirate", feat2d:"Revise la alineación de señales con GMA Consensus Engine", feat3t:"Gráficos históricos", feat3d:"Gráficos de largo plazo, crisis y tendencias", feat4t:"Comparación de empresas", feat4d:"Compare hasta 5 empresas con AI", feat5t:"Alertas inteligentes", feat5d:"Configure alertas de precio", feat6t:"8 idiomas", feat6d:"Experiencia localizada en 8 idiomas",
    loadMore:"CARGAR MÁS", allShown:"TODAS LAS ORGANIZACIONES MOSTRADAS", pricingTitle:"Potencia AI para inversión global", pricingSub:"Acceda a GMA Consensus Engine con una suscripción.", pricingManagedLine1:"Paga GMA - gestionamos GMA Triple Consensus por ti.", pricingManagedLine2:"Una plataforma, tres motores AI.", detailedComparison:"COMPARACIÓN DETALLADA", feature:"FUNCIÓN", integratedAiPartners:"SOCIOS AI INTEGRADOS", apiCostsManaged:"GMA gestiona todos los costos API por ti. Una suscripción, tres motores AI.", pricingLegalWarning:"Esta plataforma no ofrece asesoramiento de inversión. Todas las decisiones son responsabilidad del inversor.", secureCheckoutViaPaddle:"PAGO SEGURO vía PADDLE", secureCheckoutTitle:"Pago seguro vía Paddle", proceedToCheckout:"Continuar al pago", startFreeCheckout:"Comenzar gratis", openingPaddle:"Abriendo checkout de Paddle...", pleaseWait:"Espera, no cierres esta página.", planActivatedShort:"acceso del plan activado.", creditsAdded:"créditos agregados a tu cuenta.", legal:"LEGAL", legalNoticeTitle:"AVISO LEGAL", legalNoticeNotAdvice:"AVISO LEGAL - NO ES ASESORAMIENTO DE INVERSIÓN", termsNav:"TÉRMINOS", refundNav:"REEMBOLSO"
  }
};
Object.entries(GMA_PAGE_I18N_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_AR_LONG_TEXT_FIXES = {
  ar: {
    aboutTitle:"حول Global Market Analytics",
    aboutSub:"منصة ذكاء مالي تساعدك على قراءة الأسواق العالمية بوضوح أكبر عبر بيانات منظمة، وتحليل مدعوم بالذكاء الاصطناعي، وإطار قرار لا يتحول إلى نصيحة استثمارية.",
    aboutMission:"مهمتنا",
    aboutMissionText:"نبني بنية تحليلية للقرارات المالية تقلل عدم اليقين عبر بيانات منظمة، ومقارنة واضحة، ورؤية متعددة الطبقات، مع الالتزام بأن كل المخرجات معلوماتية وليست توصيات شراء أو بيع.",
    aboutVision:"رؤيتنا",
    aboutVisionText:"نريد عالماً يستطيع فيه المستثمر فهم الأسواق العالمية بصورة أوضح، ومقارنة الشركات بوعي أكبر، واتخاذ قراراته الخاصة بناءً على بيانات موثوقة وانضباط تحليلي.",
    aboutCardPlatformT:"المنصة",
    aboutCardPlatformB:"Global Market Analytics هي منصة معلومات مالية تجمع بيانات الأسهم، وحالة الاكتتابات، والمؤشرات السوقية لأكثر من 600 مؤسسة عالمية داخل واجهة واحدة قابلة للقراءة والمقارنة.",
    aboutCardAIT:"تكامل الذكاء الاصطناعي",
    aboutCardAIB:"تعمل المنصة عبر GMA Consensus Engine لتقديم تحليل منظم للشركات، وإطار للمخاطر، ونظرة استراتيجية. كل المخرجات معلوماتية فقط ولا تشكل نصيحة مالية أو استثمارية.",
    aboutCardDataT:"البيانات التاريخية",
    aboutCardDataB:"تغطي الرسوم التاريخية الذهب منذ عام 1900، والعملات الرئيسية منذ عام 1930، وبقية السلع والمؤشرات من أقدم تواريخ مسجلة حتى عام 2026.",
    aboutCardSourcesT:"مصادر البيانات",
    aboutCardSourcesB:"تأتي البيانات الحية من Finnhub API، وتأتي أسعار الصرف من open.er-api.com. لا تعتمد GMA على بروكسيات خارجية لإخفاء مصدر البيانات أو تمريرها.",
    aboutCardPrivacyT:"الخصوصية",
    aboutCardPrivacyB:"لا يتم إرسال تفضيلات المستخدم أو مفاتيح API أو بيانات المحفظة إلى خوادم خارجية تابعة لـ GMA. يتم حفظ هذه البيانات محلياً داخل متصفحك عبر localStorage.",
    contactTitle:"تواصل معنا",
    contactSub:"نحن هنا لأي سؤال، ملاحظة، مشكلة في الحساب، أو استفسار حول الاشتراك والدفع. اكتب رسالتك وسنعود إليك عبر البريد الإلكتروني.",
    contactInfo:"معلومات الاتصال",
    formName:"الاسم الكامل",
    formEmail:"البريد الإلكتروني",
    formSubject:"الموضوع",
    formMsg:"الرسالة",
    formSend:"إرسال",
    formSending:"جار الإرسال...",
    formSent:"تم إرسال رسالتك بنجاح!",
    namePlaceholder:"اسمك",
    subjectPlaceholder:"موضوع الرسالة",
    messagePlaceholder:"اكتب رسالتك هنا...",
    privacyPolicyTitle:"سياسة الخصوصية",
    termsTitle:"شروط الخدمة",
    refundTitle:"سياسة الاسترداد",
    legalEffectiveDate:"تاريخ النفاذ: أبريل 2026",
    legalGdprDate:"تاريخ النفاذ: أبريل 2026 — متوافق مع GDPR",
    legalTranslating:"جار ترجمة المحتوى إلى لغتك...",
    legalNoAdvice:"ليست نصيحة مالية",
    privacyWarning:"Global Market Analytics (GMA) منصة لعرض وتحليل بيانات الأسواق. GMA ليست مستشاراً استثمارياً مسجلاً ولا تقدم نصائح مالية أو استثمارية أو قانونية أو ضريبية. كل المحتوى والتحليلات المدعومة بالذكاء الاصطناعي لأغراض معلوماتية فقط، وتبقى قرارات الاستثمار على مسؤولية المستخدم وحده.",
    termsWarning:"GMA ليست مستشاراً استثمارياً مسجلاً. كل المحتوى المعروض على المنصة معلوماتي فقط. استشر مستشاراً مالياً مرخصاً قبل اتخاذ أي قرار استثماري.",
    refundHeroTitle:"ضمان استرداد خلال 7 أيام",
    refundHeroText:"غير راضٍ؟ يمكنك طلب استرداد كامل خلال 7 أيام من أول عملية شراء. راسل support@globalmarketanalytics.com وسنعالج الطلب خلال 5-7 أيام عمل.",
    footerDesc:"منصة ذكاء مالي صُممت لتقديم قراءة أوضح للأسواق العالمية.",
    footerBrandLine:"Global Market Analytics · 2026 · ذكاء مستقل",
    footerCompliance:"Global Market Analytics (GMA) منصة رقمية تقدم تصوراً وتحليلاً لبيانات السوق بدعم من الذكاء الاصطناعي. GMA ليست مستشاراً استثمارياً مسجلاً. تتم معالجة جميع المدفوعات بأمان عبر شريكنا Paddle.com.",
    legal:"القانوني",
    legalNoticeTitle:"إشعار قانوني",
    legalNoticeNotAdvice:"إشعار قانوني - ليست نصيحة استثمارية",
    legalNotice:"هذه المنصة لا تقدم نصائح استثمارية. تقدم GMA رؤى تحليلية مدعومة بالذكاء الاصطناعي لأغراض معلوماتية فقط. تبقى قرارات الاستثمار النهائية مسؤولية المستثمر بالكامل.",
    pricingManagedLine1:"ادفع لـ GMA - نحن ندير GMA Triple Consensus نيابة عنك.",
    pricingManagedLine2:"منصة واحدة، ثلاثة محركات ذكاء اصطناعي.",
    apiCostsManaged:"تدير GMA جميع تكاليف API نيابة عنك. اشتراك واحد، وثلاثة محركات ذكاء اصطناعي.",
    pricingLegalWarning:"هذه المنصة لا تقدم نصائح استثمارية. تبقى كل القرارات مسؤولية المستثمر.",
    secureCheckoutBody:"تتم معالجة دفعتك بأمان عبر Paddle.com، شريكنا المعتمد كسجل تجاري. لا تخزن GMA بيانات بطاقتك. الزر أدناه يفتح صفحة الدفع الآمنة لدى Paddle."
  }
};
Object.entries(GMA_AR_LONG_TEXT_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});
const GMA_LEGAL_STATIC = {
  tr: {
    privacy: [
      {t:"1. Topladigimiz Bilgiler",b:"GMA istemci tarafli bir web uygulamasi olarak calisir. Yalnizca gerekli minimum verileri toplariz:\n\n• Hesap Bilgileri: e-posta ve gorunen ad, tarayicinizda yerel olarak saklanir (localStorage).\n• API Anahtarlari: yalnizca tarayicinizda saklanir ve dogrudan GMA'ya iletilir.\n• Odeme Verileri: tamamen Paddle.com tarafindan islenir. GMA kart bilgilerini almaz, saklamaz veya islemez.\n• Analitik: kisisel veri icermeyen anonim ve toplu kullanim verileri."},
      {t:"2. Isleme Hukuki Dayanagi (GDPR)",b:"Genel Veri Koruma Tuzugu (GDPR) kapsaminda su hukuki dayanaklara dayaniriz:\n\n• Sozlesmesel Gereklilik — abone olunan hizmeti sunmak icin e-postanizin islenmesi.\n• Mesru Menfaat — anonim analitiklerle platform performansini iyilestirmek.\n• Riza — istege bagli veri toplama icin. Rizanizi istediginiz zaman geri cekebilirsiniz."},
      {t:"3. Paddle ile Odeme Isleme",b:"Tum odemeler kayitli satici is ortagimiz Paddle.com tarafindan islenir. Abone oldugunuzda:\n\n• Paddle'in PCI-DSS uyumlu guvenli odeme ekranina yonlendirilirsiniz.\n• Kart bilgileri yalnizca Paddle altyapisina girilir. GMA odeme bilgilerinizi gormez.\n• Paddle Gizlilik Politikasi: https://www.paddle.com/legal/privacy\n• Faturalama sorulari: support@globalmarketanalytics.com"},
      {t:"4. Cerezler ve Takip",b:"GMA reklam cerezleri, ucuncu taraf takip pikselleri veya davranissal reklam analitigi kullanmaz. Yalnizca kimlik dogrulama icin zorunlu oturum cerezleri kullanilabilir. Kullanici davranisi reklamverenlere satilmaz."},
      {t:"5. Ucuncu Taraf Veri Saglayicilari",b:"GMA, kendi gizlilik politikalarina tabi olan saglayicilarla entegre calisir:\n\n• Finnhub.io — gercek zamanli piyasa verisi saglayicisi\n• Frankfurter API — doviz kuru verileri\n• Paddle.com — odeme isleme\n\nBu saglayicilar normal operasyonlar sirasinda IP adresinizi isleyebilir."},
      {t:"6. Haklariniz (GDPR)",b:"AEA veya Birlesik Krallik'taysanız su haklara sahipsiniz:\n\n• Erisim Hakki — kisisel verilerinizin bir kopyasini talep etme.\n• Duzeltme Hakki — hatali verileri duzeltme.\n• Silme Hakki — verilerinizin silinmesini talep etme.\n• Islemeyi Kisitlama Hakki — verilerinizin nasil islendigini sinirlama.\n• Veri Tasinabilirligi Hakki — makine tarafindan okunabilir formatta veri alma.\n• Itiraz Hakki — mesru menfaate dayali islemeye itiraz etme.\n\nIletisim: support@globalmarketanalytics.com. 30 gun icinde yanit veririz."},
      {t:"7. Veri Saklama",b:"Tarayici localStorage verileri, tarayicinizi temizleyene veya hesabinizi silene kadar saklanir. Faturalama ve yasal uyum icin gerekli olanlar disinda sunucularimizda kisisel veri tutmayiz."},
      {t:"8. Veri Guvenligi",b:"Aktarimdaki tum veriler icin HTTPS/TLS sifreleme kullaniriz. Odeme islemleri tamamen PCI-DSS uyumlu Paddle altyapisina devredilir. Guvenlik uygulamalari duzenli olarak gozden gecirilir."},
      {t:"9. Cocuklarin Gizliligi",b:"GMA 18 yas alti bireylere yonelik degildir. Bilerek reşit olmayanlardan kisisel bilgi toplamayiz. Bir reşit olmayan kisi veri sagladiysa derhal silme icin support@globalmarketanalytics.com adresiyle iletisime gecin."},
      {t:"10. Politikadaki Degisiklikler",b:"Bu Gizlilik Politikasi zaman zaman guncellenebilir. Yururluk tarihi en son revizyonu gosterir. Onemli degisiklikler kayitli kullanicilara e-posta ile bildirilir. Kullanmaya devam etmeniz kabul anlamina gelir."},
      {t:"11. Iletisim ve Veri Sorumlusu",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nYerel veri koruma otoritenize sikayette bulunma hakkiniz vardir."}
    ],
    terms: [
      {t:"1. Sartlarin Kabulu",b:"Global Market Analytics (GMA) platformuna eriserek veya platformu kullanarak bu Hizmet Sartlari'ni ve geçerli tum yasalari kabul edersiniz. Herhangi bir bolume katilmiyorsaniz kullanimi derhal durdurun."},
      {t:"2. Hizmetin Tanimi",b:"GMA; abonelik esasli AI destekli piyasa verisi gorsellestirme, finansal veri toplama ve analiz araclari sunan dijital bir platformdur.\n\nTum piyasa verileri ucuncu taraf saglayicilardan gelir ve yalnizca bilgilendirme amaciyla sunulur."},
      {t:"3. Yatirim Tavsiyesi Degildir",b:"⚠ GMA KAYITLI BIR YATIRIM DANISMANI DEGILDIR.\n\nPlatformdaki hicbir sey finansal, yatirim, hukuki veya vergi tavsiyesi degildir. AI tarafindan uretilen analizler, piyasa ozetleri ve veri gorsellestirmeleri yalnizca bilgilendirme ve egitim amaclidir.\n\nYatirim karari almadan once nitelikli bir finansal danismana basvurun. Platform kullanimindan dogan finansal kayiplardan GMA sorumlu degildir."},
      {t:"4. Kullanici Hesaplari",b:"Kayit icin en az 18 yasinda olmalisiniz. Su konulardan siz sorumlusunuz:\n\n• Hesap bilgilerinizin gizliligini korumak.\n• Hesabiniz altinda gerceklesen tum faaliyetler.\n• Yetkisiz erisim durumunda support@globalmarketanalytics.com adresine derhal bildirim yapmak."},
      {t:"5. Abonelikler ve Paddle ile Faturalama",b:"Tum ucretli abonelikler kayitli satici is ortagimiz Paddle.com tarafindan islenir.\n\n• Abonelikler yenileme tarihinden once iptal edilmedikce otomatik yenilenir.\n• Hesap Ayarlari uzerinden her zaman tek tikla iptal mumkundur.\n• Fiyat degisiklikleri en az 30 gun once bildirilir.\n• Paddle.com sartlari da gecerlidir: https://www.paddle.com/legal"},
      {t:"6. Iptal",b:"Hesap Ayarlari uzerinden istediginiz zaman iptal edebilirsiniz (tek tikla, cezasiz). Iptal mevcut fatura doneminin sonunda gecerli olur. Iade Politikamizda belirtilenler disinda kismi donemler icin oransal iade yapilmaz."},
      {t:"7. Kabul Edilebilir Kullanim",b:"Sunlari yapmamayi kabul edersiniz:\n\n• Platformu hukuka aykiri amaclarla kullanmak.\n• Platform verilerini tersine muhendislik, kazima veya sistematik olarak cikarma girisiminde bulunmak.\n• Hesap bilgilerini ucuncu taraflarla paylasmak.\n• Platform uzerinden yaniltici finansal bilgi uretmek veya dagitmak.\n• Erisim kontrollerini veya abonelik sinirlamalarini asmaya calismak."},
      {t:"8. Fikri Mulkiyet",b:"Tum icerik, marka, yazilim ve islevler Global Market Analytics veya lisans verenlerinin munhasir mulkiyetidir. Size yalnizca kisisel ve ticari olmayan kullanim icin sinirli, munhasir olmayan bir lisans verilir."},
      {t:"9. Sorumlulugun Sinirlandirilmasi",b:"Yasanin izin verdigi azami olcude GMA ve bagli kuruluslari dolayli, arizi, sonucsal veya cezai zararlardan sorumlu olmayacaktir. GMA'nin toplam sorumlulugu, talep tarihinden onceki on iki ayda odediginiz tutari asamaz."},
      {t:"10. Garanti Reddi",b:"PLATFORM 'OLDUGU GIBI' SUNULUR VE HICBIR TUR GARANTI VERILMEZ. GMA HIZMETIN KESINTISIZ VEYA HATASIZ OLACAGINI, PIYASA VERILERININ DOGRULUGUNU VEYA GUNCELLIGINI GARANTI ETMEZ. KULLANIM TAMAMEN KENDI RISKINIZEDIR."},
      {t:"11. Geçerli Hukuk ve Degisiklikler",b:"Bu Sartlar geçerli hukuka tabidir. GMA bu Sartlari istedigi zaman degistirebilir; onemli degisiklikler kayitli kullanicilara e-posta ile bildirilir. Kullanmaya devam etmeniz revize sartlari kabul ettiginiz anlamina gelir."},
      {t:"12. Iletisim",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
    ],
    refund: [
      {t:"1. 7 Gun Para Iade Garantisi",b:"GMA, tum ucretli planlarda (Gunluk, Aylik, Yillik) 7 gun tam para iade garantisi sunar. Herhangi bir nedenle memnun kalmazsaniz ilk satin aliminizdan itibaren 7 gun icinde tam iade talep edebilirsiniz.\n\nBu garanti her plan kademesi icin ilk satin alima uygulanir; sonraki yenilemeler icin geçerli degildir."},
      {t:"2. Iade Talebi Nasil Yapilir",b:"Satin alimdan itibaren 7 gun icinde bizimle iletisime gecin:\n\n• Email: support@globalmarketanalytics.com\n• Konu: Refund Request — [kayitli e-posta adresiniz]\n• Ekleyin: satin alma tarihi ve kullanilan e-posta adresi.\n\nIadeler Paddle.com uzerinden orijinal odeme yonteminize 5-7 is gunu icinde islenir."},
      {t:"3. Tek Tikla Abonelik Iptali",b:"Hesap Ayarlari'ndan istediginiz zaman iptal edebilirsiniz — ceza veya iptal ucreti yoktur.\n\n• Iptal, gelecekteki tum ucretlendirmeleri durdurur.\n• Ucretli ozelliklere erisim mevcut fatura donemi sonuna kadar devam eder.\n• 7 gunluk pencere sonrasi kismi fatura donemleri icin oransal iade yoktur."},
      {t:"4. Yenileme Ucretleri",b:"Abonelik yenilemeleri 7 gun garantisi kapsaminda degildir. Ucretlendirmeden kacınmak icin yenileme tarihinizden once iptal edin. Yenileme itirazlari icin support@globalmarketanalytics.com adresiyle iletisime gecin; durum bazinda degerlendirme yapariz."},
      {t:"5. Istisnalar",b:"Asagidakiler iade icin uygun degildir:\n\n• 7 gunluk pencere sonrasi yapilan talepler.\n• Hizmet Sartlari'ni ihlal ettigi tespit edilen hesaplar.\n• Ucretsiz plan (ucret uygulanmaz).\n• Sahte satin alim veya chargeback kotuye kullanimi."},
      {t:"6. Odeme Isleyici (Paddle)",b:"Tum iadeler Paddle.com uzerinden islenir. Banka isleme sureleri degisebilir (genellikle ekstrenize yansimasi 5-10 is gunu).\n\nPaddle ile dogrudan faturalama sorulari icin: https://www.paddle.com/legal"},
      {t:"7. Iletisim",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nTum iade taleplerine 1 is gunu icinde yanit vermeyi hedefleriz."}
    ]
  }
};
GMA_LEGAL_STATIC.ar = {
  privacy: [
    {t:"1. المعلومات التي نجمعها",b:"تعمل GMA كتطبيق ويب من جهة المتصفح. نجمع الحد الأدنى فقط من البيانات اللازمة لتشغيل الخدمة:\n\n• معلومات الحساب: البريد الإلكتروني واسم العرض، ويتم حفظهما محلياً في متصفحك (localStorage).\n• مفاتيح API: تُحفظ داخل متصفحك فقط وتُرسل مباشرة إلى مزود الذكاء الاصطناعي عند الحاجة. لا تستقبل GMA هذه المفاتيح على خوادمها.\n• بيانات الدفع: تتم معالجتها بالكامل عبر Paddle.com. لا تستقبل GMA بيانات البطاقة ولا تخزنها ولا تعالجها.\n• التحليلات: بيانات استخدام مجمعة ومجهولة الهوية لا تحتوي على معلومات تعريف شخصية."},
    {t:"2. الأساس القانوني للمعالجة (GDPR)",b:"وفقاً للائحة العامة لحماية البيانات (GDPR)، نعتمد على الأسس التالية:\n\n• الضرورة التعاقدية — معالجة البريد الإلكتروني لتقديم الخدمة المشتركة.\n• المصالح المشروعة — تحسين أداء المنصة عبر تحليلات مجهولة ومجمعة.\n• الموافقة — لأي جمع بيانات اختياري. يمكنك سحب موافقتك في أي وقت."},
    {t:"3. معالجة الدفع عبر Paddle",b:"تتم جميع المدفوعات عبر Paddle.com، شريكنا المعتمد كبائع مسجل. عند الاشتراك:\n\n• يتم توجيهك إلى صفحة دفع آمنة ومتوافقة مع PCI-DSS لدى Paddle.\n• تُدخل بيانات البطاقة داخل بنية Paddle فقط. لا ترى GMA بيانات الدفع الخاصة بك.\n• سياسة خصوصية Paddle: https://www.paddle.com/legal/privacy\n• لاستفسارات الفوترة: support@globalmarketanalytics.com"},
    {t:"4. ملفات تعريف الارتباط والتتبع",b:"لا تستخدم GMA ملفات تعريف ارتباط إعلانية، أو بكسلات تتبع خارجية، أو تحليلات إعلانية سلوكية. قد تُستخدم ملفات جلسة ضرورية فقط للمصادقة وتشغيل الحساب. لا نبيع سلوك المستخدمين للمعلنين."},
    {t:"5. مزودو البيانات الخارجيون",b:"تتكامل GMA مع مزودين خارجيين يخضع كل منهم لسياسة خصوصيته الخاصة:\n\n• Finnhub.io — مزود بيانات سوق لحظية\n• Frankfurter API — أسعار صرف العملات\n• Paddle.com — معالجة المدفوعات\n\nقد يعالج هؤلاء المزودون عنوان IP الخاص بك أثناء التشغيل الطبيعي للخدمة."},
    {t:"6. حقوقك (GDPR)",b:"إذا كنت داخل المنطقة الاقتصادية الأوروبية أو المملكة المتحدة، فلديك الحقوق التالية:\n\n• حق الوصول — طلب نسخة من بياناتك الشخصية.\n• حق التصحيح — تصحيح البيانات غير الدقيقة.\n• حق المحو — طلب حذف بياناتك.\n• حق تقييد المعالجة — الحد من كيفية معالجة بياناتك.\n• حق نقل البيانات — استلام البيانات بصيغة قابلة للقراءة آلياً.\n• حق الاعتراض — الاعتراض على المعالجة القائمة على المصالح المشروعة.\n\nللتواصل: support@globalmarketanalytics.com. نرد خلال 30 يوماً."},
    {t:"7. الاحتفاظ بالبيانات",b:"تبقى بيانات localStorage في المتصفح إلى أن تقوم بمسحها أو حذف حسابك. لا نحتفظ ببيانات شخصية على خوادمنا إلا بالقدر المطلوب للفوترة والامتثال القانوني."},
    {t:"8. أمن البيانات",b:"نستخدم تشفير HTTPS/TLS لجميع البيانات أثناء النقل. تتم عمليات الدفع بالكامل عبر بنية Paddle المتوافقة مع PCI-DSS. تتم مراجعة ممارسات الأمان بشكل منتظم."},
    {t:"9. خصوصية الأطفال",b:"GMA غير موجهة للأفراد دون سن 18 عاماً. لا نجمع عمداً معلومات شخصية من القاصرين. إذا قدم قاصر بيانات، يرجى التواصل عبر support@globalmarketanalytics.com لحذفها فوراً."},
    {t:"10. تغييرات هذه السياسة",b:"قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. يوضح تاريخ النفاذ أحدث نسخة. سيتم إخطار المستخدمين المسجلين بالتغييرات الجوهرية عبر البريد الإلكتروني. استمرار استخدامك يعني قبول السياسة المحدّثة."},
    {t:"11. جهة الاتصال ومراقب البيانات",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nلديك الحق في تقديم شكوى إلى سلطة حماية البيانات المحلية في بلدك."}
  ],
  terms: [
    {t:"1. قبول الشروط",b:"بدخولك إلى منصة Global Market Analytics (GMA) أو استخدامها، فإنك توافق على شروط الخدمة هذه وعلى القوانين المعمول بها. إذا لم توافق على أي جزء منها، يجب إيقاف الاستخدام فوراً."},
    {t:"2. وصف الخدمة",b:"GMA منصة رقمية تقدم عرضاً لبيانات السوق، وتجميعاً للبيانات المالية، وأدوات تحليل مدعومة بالذكاء الاصطناعي على أساس الاشتراك.\n\nجميع بيانات السوق تأتي من مزودين خارجيين وتُعرض لأغراض معلوماتية فقط."},
    {t:"3. ليست نصيحة مالية",b:"⚠ GMA ليست مستشاراً استثمارياً مسجلاً.\n\nلا يشكل أي محتوى على هذه المنصة نصيحة مالية أو استثمارية أو قانونية أو ضريبية. جميع التحليلات الناتجة عن الذكاء الاصطناعي وملخصات السوق والرسوم البيانية لأغراض معلوماتية وتعليمية فقط.\n\nاستشر مستشاراً مالياً مؤهلاً قبل اتخاذ قرارات استثمارية. لا تتحمل GMA مسؤولية الخسائر المالية الناتجة عن استخدام المنصة."},
    {t:"4. حسابات المستخدمين",b:"يجب أن يكون عمرك 18 عاماً على الأقل للتسجيل. أنت مسؤول عن:\n\n• الحفاظ على سرية بيانات حسابك.\n• جميع الأنشطة التي تتم عبر حسابك.\n• إبلاغ support@globalmarketanalytics.com فوراً بأي وصول غير مصرح به."},
    {t:"5. الاشتراكات والفوترة عبر Paddle",b:"تتم معالجة جميع الاشتراكات المدفوعة عبر Paddle.com، شريكنا المعتمد كبائع مسجل.\n\n• تتجدد الاشتراكات تلقائياً ما لم يتم إلغاؤها قبل تاريخ التجديد.\n• يتوفر الإلغاء بنقرة واحدة من إعدادات الحساب.\n• يتم إبلاغ المستخدمين بتغييرات الأسعار قبل 30 يوماً على الأقل.\n• تنطبق أيضاً شروط Paddle.com: https://www.paddle.com/legal"},
    {t:"6. الإلغاء",b:"يمكنك الإلغاء في أي وقت من إعدادات الحساب، دون غرامة أو رسوم إلغاء. يسري الإلغاء في نهاية فترة الفوترة الحالية. لا توجد مبالغ مستردة جزئية إلا كما هو موضح في سياسة الاسترداد."},
    {t:"7. الاستخدام المقبول",b:"توافق على عدم القيام بما يلي:\n\n• استخدام المنصة لأي غرض غير قانوني.\n• محاولة الهندسة العكسية أو جمع بيانات المنصة بشكل آلي أو منهجي.\n• مشاركة بيانات الحساب مع أطراف ثالثة.\n• إنشاء أو نشر معلومات مالية مضللة عبر المنصة.\n• تجاوز ضوابط الوصول أو قيود الاشتراك."},
    {t:"8. الملكية الفكرية",b:"جميع المحتويات والعلامات التجارية والبرمجيات والوظائف مملوكة لـ Global Market Analytics أو للجهات المرخصة لها. تحصل فقط على ترخيص محدود وغير حصري للاستخدام الشخصي وغير التجاري."},
    {t:"9. تحديد المسؤولية",b:"إلى أقصى حد يسمح به القانون، لا تتحمل GMA أو الجهات التابعة لها مسؤولية أي أضرار غير مباشرة أو عرضية أو تبعية أو عقابية. لا تتجاوز المسؤولية الإجمالية لـ GMA المبلغ الذي دفعته خلال الاثني عشر شهراً السابقة للمطالبة."},
    {t:"10. إخلاء مسؤولية الضمانات",b:"تُقدم المنصة كما هي دون أي ضمانات. لا تضمن GMA أن الخدمة ستكون بلا انقطاع أو خالية من الأخطاء، ولا تضمن دقة أو حداثة بيانات السوق. يكون الاستخدام على مسؤوليتك الخاصة."},
    {t:"11. القانون الحاكم والتغييرات",b:"تخضع هذه الشروط للقانون المعمول به. قد تعدل GMA هذه الشروط في أي وقت، وسيتم إخطار المستخدمين المسجلين بالتغييرات الجوهرية عبر البريد الإلكتروني. استمرار الاستخدام يعني قبول الشروط المعدلة."},
    {t:"12. الاتصال",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
  ],
  refund: [
    {t:"1. ضمان استرداد خلال 7 أيام",b:"تقدم GMA ضمان استرداد كامل خلال 7 أيام لجميع الخطط المدفوعة (اليومية، الشهرية، السنوية). إذا لم تكن راضياً لأي سبب، يمكنك طلب استرداد كامل خلال 7 أيام من أول عملية شراء.\n\nينطبق هذا الضمان على أول عملية شراء لكل فئة خطة، ولا ينطبق على التجديدات اللاحقة."},
    {t:"2. كيفية طلب الاسترداد",b:"تواصل معنا خلال 7 أيام من الشراء:\n\n• البريد الإلكتروني: support@globalmarketanalytics.com\n• الموضوع: طلب استرداد — [بريدك المسجل]\n• أرفق: تاريخ الشراء والبريد الإلكتروني المستخدم.\n\nتتم معالجة الاسترداد خلال 5-7 أيام عمل إلى وسيلة الدفع الأصلية عبر Paddle.com."},
    {t:"3. إلغاء الاشتراك بنقرة واحدة",b:"يمكنك الإلغاء في أي وقت من إعدادات الحساب، دون غرامة أو رسوم إلغاء.\n\n• يوقف الإلغاء جميع الرسوم المستقبلية فوراً.\n• يستمر الوصول إلى الميزات المدفوعة حتى نهاية فترة الفوترة الحالية.\n• لا توجد مبالغ مستردة جزئية بعد نافذة السبعة أيام."},
    {t:"4. رسوم التجديد",b:"لا يغطي ضمان السبعة أيام رسوم التجديد. لتجنب الرسوم، قم بالإلغاء قبل تاريخ التجديد. إذا كان لديك نزاع حول التجديد، تواصل مع support@globalmarketanalytics.com وسنراجعه حسب الحالة."},
    {t:"5. الاستثناءات",b:"الحالات التالية غير مؤهلة للاسترداد:\n\n• الطلبات المقدمة بعد نافذة السبعة أيام.\n• الحسابات التي يثبت أنها انتهكت شروط الخدمة.\n• الخطة المجانية، إذ لا توجد رسوم.\n• الشراء الاحتيالي أو إساءة استخدام استرداد المدفوعات."},
    {t:"6. معالج الدفع (Paddle)",b:"تتم جميع عمليات الاسترداد عبر Paddle.com. تختلف أوقات معالجة البنوك، وغالباً تظهر في كشف الحساب خلال 5-10 أيام عمل.\n\nلاستفسارات الفوترة مع Paddle مباشرة: https://www.paddle.com/legal"},
    {t:"7. الاتصال",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nنهدف إلى الرد على جميع طلبات الاسترداد خلال يوم عمل واحد."}
  ]
};
Object.assign(GMA_LEGAL_STATIC, {
  ru: {
    privacy: [
      {t:"1. Какую информацию мы собираем",b:"GMA работает как клиентское веб-приложение. Мы собираем только минимальные данные, необходимые для работы сервиса:\n\n• Данные аккаунта: email и отображаемое имя, хранятся локально в вашем браузере (localStorage).\n• API-ключи: хранятся только в вашем браузере и передаются напрямую поставщику AI при необходимости. GMA не получает эти ключи на своих серверах.\n• Платежные данные: полностью обрабатываются Paddle.com. GMA не получает, не хранит и не обрабатывает данные карт.\n• Аналитика: обезличенные агрегированные данные использования без персональной идентификации."},
      {t:"2. Правовое основание обработки (GDPR)",b:"В рамках GDPR мы опираемся на следующие основания:\n\n• Договорная необходимость — обработка email для предоставления подписанного сервиса.\n• Законные интересы — улучшение производительности платформы через обезличенную аналитику.\n• Согласие — для любого необязательного сбора данных. Вы можете отозвать согласие в любое время."},
      {t:"3. Обработка платежей через Paddle",b:"Все платежи обрабатываются нашим официальным продавцом Paddle.com. При подписке:\n\n• Вы перенаправляетесь на безопасную страницу оплаты Paddle, соответствующую PCI-DSS.\n• Данные карты вводятся только в инфраструктуре Paddle. GMA не видит ваши платежные реквизиты.\n• Политика конфиденциальности Paddle: https://www.paddle.com/legal/privacy\n• Вопросы по оплате: support@globalmarketanalytics.com"},
      {t:"4. Cookie и отслеживание",b:"GMA не использует рекламные cookie, сторонние пиксели отслеживания или поведенческую рекламную аналитику. Строго необходимые сессионные cookie могут использоваться только для аутентификации. Поведение пользователей не продается рекламодателям."},
      {t:"5. Сторонние поставщики данных",b:"GMA интегрируется с поставщиками, каждый из которых регулируется собственной политикой конфиденциальности:\n\n• Finnhub.io — поставщик рыночных данных в реальном времени\n• Frankfurter API — курсы валют\n• Paddle.com — обработка платежей\n\nЭти поставщики могут обрабатывать ваш IP-адрес в ходе нормальной работы сервиса."},
      {t:"6. Ваши права (GDPR)",b:"Если вы находитесь в ЕЭЗ или Великобритании, у вас есть следующие права:\n\n• Право доступа — запросить копию персональных данных.\n• Право на исправление — исправить неточные данные.\n• Право на удаление — запросить удаление данных.\n• Право на ограничение обработки — ограничить способ обработки данных.\n• Право на переносимость — получить данные в машиночитаемом формате.\n• Право на возражение — возражать против обработки на основании законных интересов.\n\nКонтакт: support@globalmarketanalytics.com. Мы отвечаем в течение 30 дней."},
      {t:"7. Хранение данных",b:"Данные localStorage в браузере сохраняются до тех пор, пока вы не очистите браузер или не удалите аккаунт. Мы не храним персональные данные на серверах сверх того, что требуется для биллинга и юридического соответствия."},
      {t:"8. Безопасность данных",b:"Мы используем HTTPS/TLS-шифрование для всех данных при передаче. Платежные операции полностью переданы инфраструктуре Paddle, соответствующей PCI-DSS. Практики безопасности регулярно пересматриваются."},
      {t:"9. Конфиденциальность детей",b:"GMA не предназначена для лиц младше 18 лет. Мы сознательно не собираем персональные данные несовершеннолетних. Если несовершеннолетний предоставил данные, свяжитесь с support@globalmarketanalytics.com для немедленного удаления."},
      {t:"10. Изменения этой политики",b:"Мы можем периодически обновлять эту Политику конфиденциальности. Дата вступления в силу отражает последнюю редакцию. О существенных изменениях зарегистрированные пользователи будут уведомлены по email. Продолжение использования означает принятие обновленной политики."},
      {t:"11. Контакт и контролер данных",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nВы имеете право подать жалобу в местный орган по защите данных."}
    ],
    terms: [
      {t:"1. Принятие условий",b:"Получая доступ к платформе Global Market Analytics (GMA) или используя ее, вы соглашаетесь с настоящими Условиями сервиса и применимыми законами. Если вы не согласны с какой-либо частью, немедленно прекратите использование."},
      {t:"2. Описание сервиса",b:"GMA — цифровая платформа, предоставляющая AI-поддержанную визуализацию рыночных данных, агрегирование финансовых данных и аналитические инструменты по подписке.\n\nВсе рыночные данные поступают от сторонних поставщиков и предоставляются только в информационных целях."},
      {t:"3. Не финансовая рекомендация",b:"⚠ GMA НЕ ЯВЛЯЕТСЯ ЗАРЕГИСТРИРОВАННЫМ ИНВЕСТИЦИОННЫМ КОНСУЛЬТАНТОМ.\n\nНичто на платформе не является финансовой, инвестиционной, юридической или налоговой консультацией. Все AI-анализы, рыночные сводки и визуализации данных предназначены только для информации и обучения.\n\nПеред инвестиционными решениями обратитесь к квалифицированному финансовому консультанту. GMA не несет ответственности за финансовые потери от использования платформы."},
      {t:"4. Аккаунты пользователей",b:"Для регистрации вам должно быть не менее 18 лет. Вы отвечаете за:\n\n• Конфиденциальность учетных данных.\n• Все действия в вашем аккаунте.\n• Немедленное уведомление о несанкционированном доступе на support@globalmarketanalytics.com."},
      {t:"5. Подписки и биллинг через Paddle",b:"Все платные подписки обрабатываются нашим официальным продавцом Paddle.com.\n\n• Подписки автоматически продлеваются, если не отменены до даты продления.\n• Отмена в один клик доступна в любое время в настройках аккаунта.\n• Об изменениях цены сообщается минимум за 30 дней.\n• Также применяются условия Paddle.com: https://www.paddle.com/legal"},
      {t:"6. Отмена",b:"Вы можете отменить подписку в любое время в настройках аккаунта, без штрафа и комиссии. Отмена вступает в силу в конце текущего расчетного периода. Пропорциональные возвраты не предоставляются, кроме случаев, указанных в Политике возврата."},
      {t:"7. Допустимое использование",b:"Вы соглашаетесь не:\n\n• Использовать платформу в незаконных целях.\n• Пытаться выполнять реверс-инжиниринг, скрейпинг или систематически извлекать данные платформы.\n• Передавать учетные данные третьим лицам.\n• Создавать или распространять вводящую в заблуждение финансовую информацию.\n• Обходить контроль доступа или ограничения подписки."},
      {t:"8. Интеллектуальная собственность",b:"Весь контент, брендинг, программное обеспечение и функции являются исключительной собственностью Global Market Analytics или ее лицензиаров. Вам предоставляется ограниченная неисключительная лицензия только для личного некоммерческого использования."},
      {t:"9. Ограничение ответственности",b:"В максимальной степени, разрешенной законом, GMA и ее аффилированные лица не несут ответственности за косвенные, случайные, последующие или штрафные убытки. Общая ответственность GMA не превышает сумму, уплаченную вами за 12 месяцев до претензии."},
      {t:"10. Отказ от гарантий",b:"ПЛАТФОРМА ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ» БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ. GMA НЕ ГАРАНТИРУЕТ БЕСПЕРЕБОЙНУЮ ИЛИ БЕЗОШИБОЧНУЮ РАБОТУ, А ТАКЖЕ ТОЧНОСТЬ ИЛИ СВОЕВРЕМЕННОСТЬ РЫНОЧНЫХ ДАННЫХ. ИСПОЛЬЗОВАНИЕ ОСУЩЕСТВЛЯЕТСЯ НА ВАШ РИСК."},
      {t:"11. Применимое право и изменения",b:"Настоящие Условия регулируются применимым правом. GMA может изменять их в любое время; зарегистрированные пользователи будут уведомлены о существенных изменениях по email. Продолжение использования означает принятие обновленных условий."},
      {t:"12. Контакт",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
    ],
    refund: [
      {t:"1. 7-дневная гарантия возврата",b:"GMA предлагает полный возврат средств в течение 7 дней по всем платным планам (Daily, Monthly, Yearly). Если вы не удовлетворены по любой причине, запросите полный возврат в течение 7 дней после первой покупки.\n\nГарантия применяется к первой покупке каждого уровня плана и не распространяется на последующие продления."},
      {t:"2. Как запросить возврат",b:"Свяжитесь с нами в течение 7 дней после покупки:\n\n• Электронная почта: support@globalmarketanalytics.com\n• Тема: Запрос возврата — [ваш зарегистрированный email]\n• Укажите дату покупки и использованный email.\n\nВозвраты обрабатываются через Paddle.com на исходный способ оплаты в течение 5-7 рабочих дней."},
      {t:"3. Отмена подписки в один клик",b:"Отмените подписку в любое время в настройках аккаунта — без штрафа и комиссии.\n\n• Отмена немедленно останавливает будущие списания.\n• Доступ к платным функциям сохраняется до конца текущего периода.\n• После 7-дневного окна пропорциональные возвраты не предоставляются."},
      {t:"4. Платежи за продление",b:"Продления подписки не покрываются 7-дневной гарантией. Отмените подписку до даты продления, чтобы избежать списания. По спорам о продлении пишите на support@globalmarketanalytics.com; мы рассмотрим ситуацию индивидуально."},
      {t:"5. Исключения",b:"Не подлежат возврату:\n\n• Запросы после 7-дневного окна.\n• Аккаунты, нарушившие Условия сервиса.\n• Бесплатный план, так как списаний нет.\n• Мошеннические покупки или злоупотребление chargeback."},
      {t:"6. Платежный процессор (Paddle)",b:"Все возвраты обрабатываются через Paddle.com. Сроки банковской обработки различаются, обычно 5-10 рабочих дней до отображения в выписке.\n\nВопросы по биллингу Paddle: https://www.paddle.com/legal"},
      {t:"7. Контакт",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nМы стремимся отвечать на все запросы возврата в течение 1 рабочего дня."}
    ]
  },
  zh: {
    privacy: [
      {t:"1. 我们收集的信息",b:"GMA 作为客户端网页应用运行。我们只收集提供服务所必需的最低限度数据：\n\n• 账户信息：电子邮箱和显示名称，存储在您的浏览器本地 (localStorage)。\n• API 密钥：仅存储在您的浏览器中，并在需要时直接发送给 AI 提供商。GMA 不会在服务器上接收您的 API 密钥。\n• 付款数据：完全由 Paddle.com 处理。GMA 不接收、存储或处理银行卡信息。\n• 分析数据：匿名、汇总的使用数据，不包含可识别个人身份的信息。"},
      {t:"2. 处理的法律依据 (GDPR)",b:"根据《通用数据保护条例》(GDPR)，我们依赖以下法律依据：\n\n• 合同必要性 — 处理您的电子邮箱以提供订阅服务。\n• 合法利益 — 通过匿名分析改进平台性能。\n• 同意 — 用于任何可选数据收集。您可以随时撤回同意。"},
      {t:"3. 通过 Paddle 处理付款",b:"所有付款均由我们的登记销售方合作伙伴 Paddle.com 处理。订阅时：\n\n• 您会被重定向至 Paddle 符合 PCI-DSS 的安全结账页面。\n• 银行卡信息只输入 Paddle 的基础设施。GMA 不会看到您的支付凭证。\n• Paddle 隐私政策：https://www.paddle.com/legal/privacy\n• 账单咨询：support@globalmarketanalytics.com"},
      {t:"4. Cookie 与跟踪",b:"GMA 不使用广告 Cookie、第三方跟踪像素或行为广告分析。仅可能为身份验证使用严格必要的会话 Cookie。用户行为不会出售给广告商。"},
      {t:"5. 第三方数据提供商",b:"GMA 与后端提供商集成，每个提供商均受其自身隐私政策约束：\n\n• Finnhub.io — 实时市场数据提供商\n• Frankfurter API — 汇率数据\n• Paddle.com — 付款处理\n\n这些提供商可能在正常服务过程中处理您的 IP 地址。"},
      {t:"6. 您的权利 (GDPR)",b:"如果您位于欧洲经济区或英国，您拥有以下权利：\n\n• 访问权 — 请求您的个人数据副本。\n• 更正权 — 更正不准确的数据。\n• 删除权 — 请求删除您的数据。\n• 限制处理权 — 限制我们处理数据的方式。\n• 数据可携权 — 以机器可读格式接收数据。\n• 反对权 — 反对基于合法利益的处理。\n\n联系：support@globalmarketanalytics.com。我们将在 30 天内回复。"},
      {t:"7. 数据保留",b:"浏览器 localStorage 数据会保留到您清理浏览器或删除账户为止。除账单和法律合规所需外，我们不会在服务器上保留个人数据。"},
      {t:"8. 数据安全",b:"我们对传输中的所有数据使用 HTTPS/TLS 加密。付款操作完全交由符合 PCI-DSS 的 Paddle 基础设施处理。安全实践会定期审查。"},
      {t:"9. 儿童隐私",b:"GMA 不面向 18 岁以下个人。我们不会故意收集未成年人的个人信息。如果未成年人提供了数据，请联系 support@globalmarketanalytics.com 以便立即删除。"},
      {t:"10. 本政策的变更",b:"我们可能会不定期更新本隐私政策。生效日期代表最新版本。重大变更将通过电子邮件通知注册用户。继续使用即表示接受更新后的政策。"},
      {t:"11. 联系方式与数据控制者",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\n您有权向当地数据保护机构提出投诉。"}
    ],
    terms: [
      {t:"1. 接受条款",b:"访问或使用 Global Market Analytics (GMA) 平台，即表示您同意本服务条款及所有适用法律。如不同意任何部分，请立即停止使用。"},
      {t:"2. 服务说明",b:"GMA 是一个数字平台，基于订阅提供 AI 辅助市场数据可视化、金融数据聚合和分析工具。\n\n所有市场数据均来自第三方提供商，仅供信息参考。"},
      {t:"3. 非财务建议",b:"⚠ GMA 不是注册投资顾问。\n\n本平台上的任何内容均不构成财务、投资、法律或税务建议。所有 AI 生成的分析、市场摘要和数据可视化仅用于信息和教育目的。\n\n做出投资决定前，请咨询合格的金融顾问。GMA 不对因使用平台产生的财务损失承担责任。"},
      {t:"4. 用户账户",b:"注册需年满 18 岁。您负责：\n\n• 维护账户凭证的保密性。\n• 您账户下发生的所有活动。\n• 如发现未经授权访问，立即通过 support@globalmarketanalytics.com 通知我们。"},
      {t:"5. 通过 Paddle 订阅与计费",b:"所有付费订阅均由我们的登记销售方合作伙伴 Paddle.com 处理。\n\n• 订阅会自动续费，除非在续费日期前取消。\n• 可随时在账户设置中一键取消。\n• 价格变更将至少提前 30 天通知。\n• Paddle.com 条款同样适用：https://www.paddle.com/legal"},
      {t:"6. 取消",b:"您可以随时在账户设置中取消，无罚金、无取消费。取消将在当前计费周期结束时生效。除退款政策所述情况外，不提供按比例退款。"},
      {t:"7. 可接受使用",b:"您同意不会：\n\n• 将平台用于任何非法目的。\n• 尝试逆向工程、抓取或系统性提取平台数据。\n• 与第三方共享账户凭证。\n• 通过平台生成或传播误导性金融信息。\n• 绕过访问控制或订阅限制。"},
      {t:"8. 知识产权",b:"所有内容、品牌、软件和功能均为 Global Market Analytics 或其许可方的专有财产。您仅获得有限、非独占、用于个人非商业用途的许可。"},
      {t:"9. 责任限制",b:"在法律允许的最大范围内，GMA 及其关联方不对间接、偶然、后果性或惩罚性损害承担责任。GMA 的总责任不超过索赔前 12 个月您支付的金额。"},
      {t:"10. 保证免责声明",b:"平台按“现状”提供，不作任何形式的保证。GMA 不保证服务不中断或无错误，也不保证市场数据的准确性或及时性。使用风险完全由您自行承担。"},
      {t:"11. 适用法律与变更",b:"本条款受适用法律管辖。GMA 可随时修改本条款；重大变更将通过电子邮件通知注册用户。继续使用即表示接受修订后的条款。"},
      {t:"12. 联系",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
    ],
    refund: [
      {t:"1. 7 天退款保证",b:"GMA 对所有付费计划（Daily、Monthly、Yearly）提供 7 天全额退款保证。如您因任何原因不满意，可在首次购买后 7 天内申请全额退款。\n\n该保证适用于每个计划层级的首次购买，不适用于后续续费。"},
      {t:"2. 如何申请退款",b:"请在购买后 7 天内联系我们：\n\n• 电子邮箱：support@globalmarketanalytics.com\n• 主题：退款申请 — [您的注册邮箱]\n• 请包含：购买日期和使用的邮箱地址。\n\n退款将通过 Paddle.com 在 5-7 个工作日内退回原支付方式。"},
      {t:"3. 一键取消订阅",b:"您可以随时在账户设置中取消，无罚金、无取消费。\n\n• 取消会立即停止未来收费。\n• 付费功能可使用至当前计费周期结束。\n• 7 天窗口期后，不提供部分周期按比例退款。"},
      {t:"4. 续费费用",b:"订阅续费不包含在 7 天保证内。请在续费日期前取消以避免收费。如对续费有争议，请联系 support@globalmarketanalytics.com，我们将酌情审查。"},
      {t:"5. 例外情况",b:"以下情况不符合退款条件：\n\n• 超过 7 天窗口期后提出的请求。\n• 被发现违反服务条款的账户。\n• 免费计划（无收费）。\n• 欺诈性购买或拒付滥用。"},
      {t:"6. 支付处理方 (Paddle)",b:"所有退款均通过 Paddle.com 处理。银行处理时间可能不同，通常需 5-10 个工作日显示在账单中。\n\nPaddle 账单咨询：https://www.paddle.com/legal"},
      {t:"7. 联系",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\n我们力争在 1 个工作日内回复所有退款请求。"}
    ]
  },
  hi: {
    privacy: [
      {t:"1. हम कौन सी जानकारी एकत्र करते हैं",b:"GMA एक क्लाइंट-साइड वेब ऐप के रूप में काम करता है। हम सेवा चलाने के लिए केवल न्यूनतम आवश्यक डेटा एकत्र करते हैं:\n\n• खाता जानकारी: ईमेल और डिस्प्ले नाम, आपके ब्राउज़र में स्थानीय रूप से संग्रहीत (localStorage)।\n• API कुंजियाँ: केवल आपके ब्राउज़र में संग्रहीत और आवश्यकता होने पर सीधे AI प्रदाता को भेजी जाती हैं। GMA इन्हें अपने सर्वर पर प्राप्त नहीं करता।\n• भुगतान डेटा: पूरी तरह Paddle.com द्वारा संसाधित। GMA कार्ड जानकारी प्राप्त, संग्रहीत या संसाधित नहीं करता।\n• एनालिटिक्स: अज्ञात और समेकित उपयोग डेटा, जिसमें व्यक्तिगत पहचान योग्य जानकारी नहीं होती।"},
      {t:"2. प्रसंस्करण का कानूनी आधार (GDPR)",b:"GDPR के अंतर्गत हम निम्न आधारों पर निर्भर करते हैं:\n\n• संविदात्मक आवश्यकता — सदस्यता सेवा देने के लिए आपका ईमेल संसाधित करना।\n• वैध हित — अज्ञात एनालिटिक्स द्वारा प्लेटफ़ॉर्म प्रदर्शन सुधारना।\n• सहमति — किसी भी वैकल्पिक डेटा संग्रह के लिए। आप किसी भी समय सहमति वापस ले सकते हैं।"},
      {t:"3. Paddle द्वारा भुगतान प्रसंस्करण",b:"सभी भुगतान हमारे आधिकारिक विक्रेता Paddle.com द्वारा संसाधित होते हैं। सदस्यता लेते समय:\n\n• आपको Paddle के PCI-DSS-अनुरूप सुरक्षित भुगतान पृष्ठ पर भेजा जाता है।\n• कार्ड विवरण केवल Paddle की संरचना में दर्ज होते हैं। GMA आपके भुगतान विवरण नहीं देखता।\n• Paddle गोपनीयता नीति: https://www.paddle.com/legal/privacy\n• बिलिंग प्रश्न: support@globalmarketanalytics.com"},
      {t:"4. कुकी और ट्रैकिंग",b:"GMA विज्ञापन कुकी, तृतीय-पक्ष ट्रैकिंग पिक्सेल या व्यवहारिक विज्ञापन एनालिटिक्स का उपयोग नहीं करता। केवल प्रमाणीकरण के लिए आवश्यक सत्र कुकी उपयोग हो सकती हैं। उपयोगकर्ता व्यवहार विज्ञापनदाताओं को नहीं बेचा जाता।"},
      {t:"5. तृतीय-पक्ष डेटा प्रदाता",b:"GMA ऐसे प्रदाताओं से जुड़ता है जिनकी अपनी गोपनीयता नीतियाँ होती हैं:\n\n• Finnhub.io — रीयल-टाइम बाज़ार डेटा प्रदाता\n• Frankfurter API — मुद्रा विनिमय दरें\n• Paddle.com — भुगतान प्रसंस्करण\n\nये प्रदाता सामान्य संचालन में आपका IP पता संसाधित कर सकते हैं।"},
      {t:"6. आपके अधिकार (GDPR)",b:"यदि आप EEA या UK में हैं, तो आपके पास ये अधिकार हैं:\n\n• पहुँच का अधिकार — अपने व्यक्तिगत डेटा की प्रति माँगना।\n• संशोधन का अधिकार — गलत डेटा ठीक कराना।\n• मिटाने का अधिकार — डेटा हटाने का अनुरोध।\n• प्रसंस्करण सीमित करने का अधिकार — डेटा के उपयोग को सीमित करना।\n• डेटा पोर्टेबिलिटी — मशीन-पठनीय प्रारूप में डेटा प्राप्त करना।\n• आपत्ति का अधिकार — वैध हित पर आधारित प्रसंस्करण का विरोध।\n\nसंपर्क: support@globalmarketanalytics.com. हम 30 दिनों में उत्तर देते हैं।"},
      {t:"7. डेटा प्रतिधारण",b:"ब्राउज़र localStorage डेटा तब तक रहता है जब तक आप ब्राउज़र साफ़ नहीं करते या खाता नहीं हटाते। बिलिंग और कानूनी अनुपालन की आवश्यकता से अधिक व्यक्तिगत डेटा हम सर्वर पर नहीं रखते।"},
      {t:"8. डेटा सुरक्षा",b:"हम ट्रांज़िट में सभी डेटा के लिए HTTPS/TLS एन्क्रिप्शन उपयोग करते हैं। भुगतान संचालन पूरी तरह PCI-DSS-अनुरूप Paddle संरचना को सौंपा गया है। सुरक्षा अभ्यास नियमित रूप से समीक्षा किए जाते हैं।"},
      {t:"9. बच्चों की गोपनीयता",b:"GMA 18 वर्ष से कम आयु वालों के लिए लक्षित नहीं है। हम जानबूझकर नाबालिगों से व्यक्तिगत जानकारी नहीं लेते। यदि किसी नाबालिग ने डेटा दिया है, तो तुरंत हटाने के लिए support@globalmarketanalytics.com से संपर्क करें।"},
      {t:"10. इस नीति में बदलाव",b:"हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। प्रभावी तिथि नवीनतम संशोधन दर्शाती है। महत्वपूर्ण बदलावों की सूचना पंजीकृत उपयोगकर्ताओं को ईमेल से दी जाएगी। लगातार उपयोग का अर्थ स्वीकृति है।"},
      {t:"11. संपर्क और डेटा नियंत्रक",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nआपको अपने स्थानीय डेटा संरक्षण प्राधिकरण में शिकायत दर्ज करने का अधिकार है।"}
    ],
    terms: [
      {t:"1. शर्तों की स्वीकृति",b:"Global Market Analytics (GMA) प्लेटफ़ॉर्म तक पहुँचकर या उसका उपयोग करके, आप इन सेवा शर्तों और लागू कानूनों से सहमत होते हैं। यदि आप किसी भाग से असहमत हैं, तो तुरंत उपयोग बंद करें।"},
      {t:"2. सेवा का विवरण",b:"GMA एक डिजिटल प्लेटफ़ॉर्म है जो सदस्यता आधार पर AI-सहायता वाली बाज़ार डेटा विज़ुअलाइज़ेशन, वित्तीय डेटा एकत्रीकरण और विश्लेषण उपकरण देता है.\n\nसभी बाज़ार डेटा तृतीय-पक्ष प्रदाताओं से आता है और केवल जानकारी के लिए है।"},
      {t:"3. वित्तीय सलाह नहीं",b:"⚠ GMA पंजीकृत निवेश सलाहकार नहीं है।\n\nइस प्लेटफ़ॉर्म पर कुछ भी वित्तीय, निवेश, कानूनी या कर सलाह नहीं है। सभी AI-जनित विश्लेषण, बाज़ार सारांश और डेटा विज़ुअलाइज़ेशन केवल जानकारी और शिक्षा के लिए हैं।\n\nनिवेश निर्णय से पहले योग्य वित्तीय सलाहकार से परामर्श करें। प्लेटफ़ॉर्म उपयोग से हुई वित्तीय हानि के लिए GMA उत्तरदायी नहीं है।"},
      {t:"4. उपयोगकर्ता खाते",b:"पंजीकरण के लिए आपकी आयु कम से कम 18 वर्ष होनी चाहिए। आप जिम्मेदार हैं:\n\n• खाते की जानकारी गोपनीय रखने के लिए।\n• खाते के अंतर्गत होने वाली सभी गतिविधियों के लिए।\n• अनधिकृत पहुँच पर तुरंत support@globalmarketanalytics.com को सूचित करने के लिए।"},
      {t:"5. Paddle द्वारा सदस्यता और बिलिंग",b:"सभी भुगतान सदस्यताएँ हमारे आधिकारिक विक्रेता Paddle.com द्वारा संसाधित होती हैं।\n\n• सदस्यताएँ नवीनीकरण तिथि से पहले रद्द न होने पर स्वतः नवीनीकृत होती हैं।\n• खाता सेटिंग्स से कभी भी एक-क्लिक रद्दीकरण उपलब्ध है।\n• मूल्य बदलाव कम से कम 30 दिन पहले बताए जाएँगे।\n• Paddle.com की शर्तें भी लागू हैं: https://www.paddle.com/legal"},
      {t:"6. रद्दीकरण",b:"खाता सेटिंग्स से कभी भी रद्द करें, बिना दंड या शुल्क। रद्दीकरण वर्तमान बिलिंग अवधि के अंत में प्रभावी होता है। रिफंड नीति में बताए मामलों को छोड़कर आंशिक अवधि के लिए अनुपातिक रिफंड नहीं है।"},
      {t:"7. स्वीकार्य उपयोग",b:"आप सहमत हैं कि आप:\n\n• प्लेटफ़ॉर्म का उपयोग गैरकानूनी उद्देश्य से नहीं करेंगे।\n• प्लेटफ़ॉर्म डेटा का reverse-engineer, scrape या व्यवस्थित extraction नहीं करेंगे।\n• खाता जानकारी तीसरे पक्ष से साझा नहीं करेंगे।\n• भ्रामक वित्तीय जानकारी नहीं बनाएँगे या फैलाएँगे।\n• access controls या subscription restrictions को bypass नहीं करेंगे।"},
      {t:"8. बौद्धिक संपदा",b:"सभी सामग्री, ब्रांडिंग, सॉफ़्टवेयर और कार्यक्षमता Global Market Analytics या उसके लाइसेंसदाताओं की विशेष संपत्ति है। आपको केवल व्यक्तिगत और गैर-व्यावसायिक उपयोग के लिए सीमित, गैर-विशेष लाइसेंस दिया जाता है।"},
      {t:"9. दायित्व की सीमा",b:"कानून द्वारा अनुमत अधिकतम सीमा तक, GMA और उसके सहयोगी अप्रत्यक्ष, आकस्मिक, परिणामी या दंडात्मक क्षति के लिए उत्तरदायी नहीं होंगे। GMA की कुल देयता दावा से पहले 12 महीनों में आपके द्वारा भुगतान की गई राशि से अधिक नहीं होगी।"},
      {t:"10. वारंटी अस्वीकरण",b:"प्लेटफ़ॉर्म 'जैसा है' आधार पर बिना किसी वारंटी के दिया जाता है। GMA सेवा के निर्बाध या त्रुटिरहित होने, या बाज़ार डेटा की सटीकता/समयबद्धता की गारंटी नहीं देता। उपयोग पूरी तरह आपके जोखिम पर है।"},
      {t:"11. लागू कानून और बदलाव",b:"ये शर्तें लागू कानून द्वारा नियंत्रित हैं। GMA इन्हें कभी भी बदल सकता है; महत्वपूर्ण बदलावों की सूचना पंजीकृत उपयोगकर्ताओं को ईमेल से दी जाएगी। लगातार उपयोग संशोधित शर्तों की स्वीकृति है।"},
      {t:"12. संपर्क",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
    ],
    refund: [
      {t:"1. 7-दिन मनी-बैक गारंटी",b:"GMA सभी भुगतान योजनाओं (Daily, Monthly, Yearly) पर 7 दिन का पूर्ण मनी-बैक गारंटी देता है। यदि आप किसी भी कारण से संतुष्ट नहीं हैं, तो पहली खरीद के 7 दिनों के भीतर पूर्ण रिफंड माँगें।\n\nयह गारंटी प्रत्येक योजना स्तर की पहली खरीद पर लागू होती है और बाद के नवीनीकरणों पर लागू नहीं होती।"},
      {t:"2. रिफंड कैसे माँगें",b:"खरीद के 7 दिनों के भीतर संपर्क करें:\n\n• ईमेल: support@globalmarketanalytics.com\n• विषय: रिफंड अनुरोध — [आपका पंजीकृत ईमेल]\n• शामिल करें: खरीद तारीख और उपयोग किया गया ईमेल।\n\nरिफंड Paddle.com के माध्यम से मूल भुगतान विधि पर 5-7 व्यावसायिक दिनों में संसाधित होते हैं।"},
      {t:"3. एक-क्लिक सदस्यता रद्दीकरण",b:"खाता सेटिंग्स से कभी भी रद्द करें — कोई दंड नहीं, कोई रद्दीकरण शुल्क नहीं।\n\n• रद्दीकरण भविष्य के सभी शुल्क तुरंत रोकता है।\n• भुगतान सुविधाओं तक पहुँच वर्तमान बिलिंग अवधि के अंत तक रहती है।\n• 7-दिन की अवधि के बाद आंशिक बिलिंग अवधि के लिए अनुपातिक रिफंड नहीं है।"},
      {t:"4. नवीनीकरण शुल्क",b:"सदस्यता नवीनीकरण 7-दिन गारंटी में शामिल नहीं हैं। शुल्क से बचने के लिए नवीनीकरण तिथि से पहले रद्द करें। नवीनीकरण विवादों के लिए support@globalmarketanalytics.com से संपर्क करें; हम मामले के आधार पर समीक्षा करेंगे।"},
      {t:"5. अपवाद",b:"निम्नलिखित रिफंड के पात्र नहीं हैं:\n\n• 7-दिन अवधि के बाद किए गए अनुरोध।\n• सेवा शर्तों का उल्लंघन करने वाले खाते।\n• मुफ्त योजना (कोई शुल्क नहीं)।\n• धोखाधड़ी वाली खरीद या chargeback दुरुपयोग।"},
      {t:"6. भुगतान प्रोसेसर (Paddle)",b:"सभी रिफंड Paddle.com के माध्यम से संसाधित होते हैं। बैंक प्रोसेसिंग समय अलग हो सकता है, आमतौर पर 5-10 व्यावसायिक दिन।\n\nPaddle बिलिंग प्रश्न: https://www.paddle.com/legal"},
      {t:"7. संपर्क",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nहम सभी रिफंड अनुरोधों का उत्तर 1 व्यावसायिक दिन में देने का प्रयास करते हैं।"}
    ]
  },
  de: {
    privacy: [
      {t:"1. Welche Informationen wir sammeln",b:"GMA arbeitet als clientseitige Webanwendung. Wir sammeln nur die minimal notwendigen Daten für den Betrieb des Dienstes:\n\n• Kontoinformationen: E-Mail und Anzeigename, lokal in Ihrem Browser gespeichert (localStorage).\n• API-Schlüssel: nur in Ihrem Browser gespeichert und bei Bedarf direkt an den AI-Anbieter übertragen. GMA erhält diese Schlüssel nicht auf seinen Servern.\n• Zahlungsdaten: vollständig durch Paddle.com verarbeitet. GMA erhält, speichert oder verarbeitet keine Kartendaten.\n• Analytik: anonymisierte, aggregierte Nutzungsdaten ohne personenbezogene Identifikation."},
      {t:"2. Rechtsgrundlage der Verarbeitung (GDPR)",b:"Nach der Datenschutz-Grundverordnung (GDPR/DSGVO) stützen wir uns auf:\n\n• Vertragliche Notwendigkeit — Verarbeitung Ihrer E-Mail zur Bereitstellung des abonnierten Dienstes.\n• Berechtigte Interessen — Verbesserung der Plattformleistung durch anonymisierte Analytik.\n• Einwilligung — für optionale Datenerhebung. Sie können Ihre Einwilligung jederzeit widerrufen."},
      {t:"3. Zahlungsabwicklung über Paddle",b:"Alle Zahlungen werden durch unseren offiziellen Verkäufer Paddle.com verarbeitet. Bei einer Anmeldung:\n\n• Sie werden zur PCI-DSS-konformen sicheren Paddle-Zahlungsseite weitergeleitet.\n• Kartendaten werden nur in der Paddle-Infrastruktur eingegeben. GMA sieht Ihre Zahlungsdaten nicht.\n• Paddle Datenschutzrichtlinie: https://www.paddle.com/legal/privacy\n• Fragen zur Abrechnung: support@globalmarketanalytics.com"},
      {t:"4. Cookies und Tracking",b:"GMA verwendet keine Werbe-Cookies, Tracking-Pixel von Dritten oder verhaltensbasierte Werbeanalytik. Strikt notwendige Session-Cookies können nur zur Authentifizierung genutzt werden. Nutzerverhalten wird nicht an Werbetreibende verkauft."},
      {t:"5. Drittanbieter für Daten",b:"GMA integriert Backend-Anbieter, die jeweils eigenen Datenschutzrichtlinien unterliegen:\n\n• Finnhub.io — Echtzeit-Marktdatenanbieter\n• Frankfurter API — Wechselkurse\n• Paddle.com — Zahlungsabwicklung\n\nDiese Anbieter können Ihre IP-Adresse im normalen Betrieb verarbeiten."},
      {t:"6. Ihre Rechte (GDPR)",b:"Wenn Sie im EWR oder Vereinigten Königreich sind, haben Sie folgende Rechte:\n\n• Auskunftsrecht — Kopie Ihrer personenbezogenen Daten anfordern.\n• Recht auf Berichtigung — unrichtige Daten korrigieren.\n• Recht auf Löschung — Löschung Ihrer Daten verlangen.\n• Recht auf Einschränkung — Verarbeitung begrenzen.\n• Recht auf Datenübertragbarkeit — Daten in maschinenlesbarem Format erhalten.\n• Widerspruchsrecht — Verarbeitung auf Basis berechtigter Interessen widersprechen.\n\nKontakt: support@globalmarketanalytics.com. Wir antworten innerhalb von 30 Tagen."},
      {t:"7. Datenspeicherung",b:"Browser-localStorage-Daten bleiben erhalten, bis Sie Ihren Browser leeren oder Ihr Konto löschen. Wir speichern personenbezogene Daten nicht auf unseren Servern, außer soweit für Abrechnung und rechtliche Pflichten erforderlich."},
      {t:"8. Datensicherheit",b:"Wir verwenden HTTPS/TLS-Verschlüsselung für alle Daten während der Übertragung. Zahlungsprozesse sind vollständig an die PCI-DSS-konforme Paddle-Infrastruktur ausgelagert. Sicherheitspraktiken werden regelmäßig überprüft."},
      {t:"9. Datenschutz von Kindern",b:"GMA richtet sich nicht an Personen unter 18 Jahren. Wir sammeln wissentlich keine personenbezogenen Daten von Minderjährigen. Wenn ein Minderjähriger Daten bereitgestellt hat, kontaktieren Sie support@globalmarketanalytics.com zur sofortigen Löschung."},
      {t:"10. Änderungen dieser Richtlinie",b:"Wir können diese Datenschutzrichtlinie regelmäßig aktualisieren. Das Gültigkeitsdatum zeigt die neueste Fassung. Wesentliche Änderungen werden registrierten Nutzern per E-Mail mitgeteilt. Die weitere Nutzung gilt als Zustimmung."},
      {t:"11. Kontakt und Datenverantwortlicher",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nSie haben das Recht, Beschwerde bei Ihrer lokalen Datenschutzbehörde einzulegen."}
    ],
    terms: [
      {t:"1. Annahme der Bedingungen",b:"Durch Zugriff auf oder Nutzung der Global Market Analytics (GMA)-Plattform akzeptieren Sie diese Nutzungsbedingungen und alle geltenden Gesetze. Wenn Sie einem Teil nicht zustimmen, stellen Sie die Nutzung sofort ein."},
      {t:"2. Beschreibung des Dienstes",b:"GMA ist eine digitale Plattform für AI-gestützte Marktdatenvisualisierung, Finanzdatenaggregation und Analysewerkzeuge auf Abonnementbasis.\n\nAlle Marktdaten stammen von Drittanbietern und dienen nur Informationszwecken."},
      {t:"3. Keine Finanzberatung",b:"⚠ GMA IST KEIN REGISTRIERTER ANLAGEBERATER.\n\nNichts auf dieser Plattform stellt Finanz-, Anlage-, Rechts- oder Steuerberatung dar. Alle AI-generierten Analysen, Marktübersichten und Datenvisualisierungen dienen nur Informations- und Bildungszwecken.\n\nKonsultieren Sie vor Anlageentscheidungen einen qualifizierten Finanzberater. GMA haftet nicht für finanzielle Verluste aus der Nutzung der Plattform."},
      {t:"4. Benutzerkonten",b:"Sie müssen mindestens 18 Jahre alt sein, um sich zu registrieren. Sie sind verantwortlich für:\n\n• Die Vertraulichkeit Ihrer Kontodaten.\n• Alle Aktivitäten unter Ihrem Konto.\n• Sofortige Meldung unbefugten Zugriffs an support@globalmarketanalytics.com."},
      {t:"5. Abos und Abrechnung über Paddle",b:"Alle kostenpflichtigen Abonnements werden durch unseren offiziellen Verkäufer Paddle.com verarbeitet.\n\n• Abonnements verlängern sich automatisch, sofern sie nicht vor dem Verlängerungsdatum gekündigt werden.\n• Ein-Klick-Kündigung ist jederzeit in den Kontoeinstellungen möglich.\n• Preisänderungen werden mindestens 30 Tage im Voraus mitgeteilt.\n• Die Bedingungen von Paddle.com gelten ebenfalls: https://www.paddle.com/legal"},
      {t:"6. Kündigung",b:"Sie können jederzeit über die Kontoeinstellungen kündigen, ohne Strafe oder Kündigungsgebühr. Die Kündigung wird am Ende des aktuellen Abrechnungszeitraums wirksam. Anteilig erstattete Beträge gibt es nur wie in der Rückerstattungsrichtlinie beschrieben."},
      {t:"7. Zulässige Nutzung",b:"Sie verpflichten sich, Folgendes zu unterlassen:\n\n• Nutzung der Plattform für rechtswidrige Zwecke.\n• Reverse Engineering, Scraping oder systematische Extraktion von Plattformdaten.\n• Weitergabe von Kontodaten an Dritte.\n• Erstellung oder Verbreitung irreführender Finanzinformationen.\n• Umgehung von Zugriffskontrollen oder Abonnementbeschränkungen."},
      {t:"8. Geistiges Eigentum",b:"Alle Inhalte, Marken, Software und Funktionen sind ausschließliches Eigentum von Global Market Analytics oder dessen Lizenzgebern. Ihnen wird nur eine beschränkte, nicht-exklusive Lizenz für persönliche, nicht-kommerzielle Nutzung gewährt."},
      {t:"9. Haftungsbeschränkung",b:"Soweit gesetzlich zulässig, haften GMA und verbundene Unternehmen nicht für indirekte, zufällige, Folge- oder Strafschäden. Die Gesamthaftung von GMA überschreitet nicht den Betrag, den Sie in den zwölf Monaten vor dem Anspruch bezahlt haben."},
      {t:"10. Gewährleistungsausschluss",b:"DIE PLATTFORM WIRD „WIE BESEHEN“ OHNE GARANTIEN BEREITGESTELLT. GMA GARANTIERT KEINEN UNUNTERBROCHENEN ODER FEHLERFREIEN DIENST UND NICHT DIE GENAUIGKEIT ODER AKTUALITÄT VON MARKTDATEN. DIE NUTZUNG ERFOLGT AUF EIGENES RISIKO."},
      {t:"11. Geltendes Recht und Änderungen",b:"Diese Bedingungen unterliegen geltendem Recht. GMA kann sie jederzeit ändern; registrierte Nutzer werden über wesentliche Änderungen per E-Mail informiert. Die weitere Nutzung gilt als Annahme der geänderten Bedingungen."},
      {t:"12. Kontakt",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
    ],
    refund: [
      {t:"1. 7-Tage-Geld-zurück-Garantie",b:"GMA bietet eine vollständige 7-Tage-Geld-zurück-Garantie für alle kostenpflichtigen Pläne (Daily, Monthly, Yearly). Wenn Sie aus irgendeinem Grund nicht zufrieden sind, fordern Sie innerhalb von 7 Tagen nach Ihrem ersten Kauf eine volle Rückerstattung an.\n\nDiese Garantie gilt für den ersten Kauf je Planstufe und nicht für spätere Verlängerungen."},
      {t:"2. So beantragen Sie eine Erstattung",b:"Kontaktieren Sie uns innerhalb von 7 Tagen nach dem Kauf:\n\n• E-Mail: support@globalmarketanalytics.com\n• Betreff: Rückerstattungsanfrage — [Ihre registrierte E-Mail]\n• Geben Sie Kaufdatum und verwendete E-Mail-Adresse an.\n\nRückerstattungen werden über Paddle.com innerhalb von 5-7 Werktagen auf die ursprüngliche Zahlungsmethode verarbeitet."},
      {t:"3. Abo-Kündigung mit einem Klick",b:"Kündigen Sie jederzeit in den Kontoeinstellungen — ohne Strafe und ohne Kündigungsgebühr.\n\n• Die Kündigung stoppt zukünftige Belastungen sofort.\n• Zugriff auf bezahlte Funktionen bleibt bis zum Ende des aktuellen Abrechnungszeitraums.\n• Nach dem 7-Tage-Fenster gibt es keine anteilige Rückerstattung für Teilzeiträume."},
      {t:"4. Verlängerungsgebühren",b:"Abo-Verlängerungen sind nicht von der 7-Tage-Garantie abgedeckt. Kündigen Sie vor dem Verlängerungsdatum, um Gebühren zu vermeiden. Bei Streitigkeiten zu Verlängerungen kontaktieren Sie support@globalmarketanalytics.com; wir prüfen nach Ermessen."},
      {t:"5. Ausnahmen",b:"Nicht erstattungsfähig sind:\n\n• Anfragen nach Ablauf des 7-Tage-Fensters.\n• Konten, die gegen die Nutzungsbedingungen verstoßen haben.\n• Kostenloser Plan, da keine Gebühren anfallen.\n• Betrügerische Käufe oder Chargeback-Missbrauch."},
      {t:"6. Zahlungsabwickler (Paddle)",b:"Alle Rückerstattungen werden über Paddle.com verarbeitet. Bankbearbeitungszeiten variieren, typischerweise 5-10 Werktage bis zur Anzeige auf Ihrem Kontoauszug.\n\nAbrechnungsfragen direkt an Paddle: https://www.paddle.com/legal"},
      {t:"7. Kontakt",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nWir bemühen uns, alle Erstattungsanfragen innerhalb eines Werktages zu beantworten."}
    ]
  },
  es: {
    privacy: [
      {t:"1. Información que recopilamos",b:"GMA funciona como una aplicación web del lado del cliente. Recopilamos solo los datos mínimos necesarios para operar el servicio:\n\n• Información de cuenta: email y nombre visible, almacenados localmente en tu navegador (localStorage).\n• Claves API: almacenadas solo en tu navegador y transmitidas directamente al proveedor AI cuando sea necesario. GMA nunca recibe tu clave API en sus servidores.\n• Datos de pago: procesados completamente por Paddle.com. GMA no recibe, almacena ni procesa datos de tarjeta.\n• Analítica: datos de uso anónimos y agregados sin información personal identificable."},
      {t:"2. Base legal del tratamiento (GDPR)",b:"Bajo el Reglamento General de Protección de Datos (GDPR), nos basamos en:\n\n• Necesidad contractual — procesar tu email para entregar el servicio suscrito.\n• Intereses legítimos — mejorar el rendimiento de la plataforma mediante analítica anónima.\n• Consentimiento — para cualquier recopilación opcional de datos. Puedes retirar el consentimiento en cualquier momento."},
      {t:"3. Procesamiento de pagos vía Paddle",b:"Todos los pagos son procesados por nuestro vendedor oficial Paddle.com. Al suscribirte:\n\n• Serás redirigido al pago seguro de Paddle compatible con PCI-DSS.\n• Los datos de tarjeta se introducen solo en la infraestructura de Paddle. GMA nunca ve tus credenciales de pago.\n• Política de privacidad de Paddle: https://www.paddle.com/legal/privacy\n• Consultas de facturación: support@globalmarketanalytics.com"},
      {t:"4. Cookies y seguimiento",b:"GMA no utiliza cookies publicitarias, píxeles de seguimiento de terceros ni analítica publicitaria conductual. Solo pueden usarse cookies de sesión estrictamente necesarias para autenticación. El comportamiento de usuarios no se vende a anunciantes."},
      {t:"5. Proveedores de datos externos",b:"GMA se integra con proveedores externos, cada uno sujeto a sus propias políticas de privacidad:\n\n• Finnhub.io — proveedor de datos de mercado en tiempo real\n• Frankfurter API — tipos de cambio\n• Paddle.com — procesamiento de pagos\n\nEstos proveedores pueden procesar tu dirección IP durante operaciones normales."},
      {t:"6. Tus derechos (GDPR)",b:"Si estás en el EEE o Reino Unido, tienes los siguientes derechos:\n\n• Derecho de acceso — solicitar una copia de tus datos personales.\n• Derecho de rectificación — corregir datos inexactos.\n• Derecho de supresión — solicitar eliminación de datos.\n• Derecho de limitación — limitar cómo procesamos tus datos.\n• Derecho de portabilidad — recibir datos en formato legible por máquina.\n• Derecho de oposición — oponerte al tratamiento basado en intereses legítimos.\n\nContacto: support@globalmarketanalytics.com. Respondemos en un plazo de 30 días."},
      {t:"7. Retención de datos",b:"Los datos de localStorage del navegador se conservan hasta que limpies tu navegador o elimines tu cuenta. No conservamos datos personales en nuestros servidores más allá de lo requerido para facturación y cumplimiento legal."},
      {t:"8. Seguridad de datos",b:"Implementamos cifrado HTTPS/TLS para todos los datos en tránsito. Las operaciones de pago se delegan completamente a la infraestructura de Paddle compatible con PCI-DSS. Las prácticas de seguridad se revisan periódicamente."},
      {t:"9. Privacidad infantil",b:"GMA no está dirigida a menores de 18 años. No recopilamos conscientemente información personal de menores. Si un menor ha proporcionado datos, contacta support@globalmarketanalytics.com para eliminación inmediata."},
      {t:"10. Cambios a esta política",b:"Podemos actualizar esta Política de privacidad periódicamente. La fecha de vigencia refleja la última revisión. Los cambios materiales se notificarán por email a usuarios registrados. El uso continuado constituye aceptación."},
      {t:"11. Contacto y responsable de datos",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nTienes derecho a presentar una reclamación ante tu autoridad local de protección de datos."}
    ],
    terms: [
      {t:"1. Aceptación de términos",b:"Al acceder o usar la plataforma Global Market Analytics (GMA), aceptas estos Términos de servicio y todas las leyes aplicables. Si no estás de acuerdo con alguna parte, deja de usarla inmediatamente."},
      {t:"2. Descripción del servicio",b:"GMA es una plataforma digital que proporciona visualización de datos de mercado asistida por AI, agregación de datos financieros y herramientas de análisis bajo suscripción.\n\nTodos los datos de mercado provienen de proveedores externos y se ofrecen solo con fines informativos."},
      {t:"3. No es asesoramiento financiero",b:"⚠ GMA NO ES UN ASESOR DE INVERSIONES REGISTRADO.\n\nNada en esta plataforma constituye asesoramiento financiero, de inversión, legal o fiscal. Todos los análisis generados por AI, resúmenes de mercado y visualizaciones de datos son solo informativos y educativos.\n\nConsulta a un asesor financiero cualificado antes de tomar decisiones de inversión. GMA no acepta responsabilidad por pérdidas financieras derivadas del uso de la plataforma."},
      {t:"4. Cuentas de usuario",b:"Debes tener al menos 18 años para registrarte. Eres responsable de:\n\n• Mantener la confidencialidad de tus credenciales.\n• Todas las actividades que ocurran bajo tu cuenta.\n• Notificar inmediatamente accesos no autorizados a support@globalmarketanalytics.com."},
      {t:"5. Suscripciones y facturación vía Paddle",b:"Todas las suscripciones pagadas son procesadas por nuestro vendedor oficial, Paddle.com.\n\n• Las suscripciones se renuevan automáticamente salvo cancelación antes de la fecha de renovación.\n• La cancelación en un clic está disponible en la configuración de la cuenta.\n• Los cambios de precio se comunicarán con al menos 30 días de antelación.\n• También aplican los términos de Paddle.com: https://www.paddle.com/legal"},
      {t:"6. Cancelación",b:"Cancela en cualquier momento desde la configuración de la cuenta, sin penalización ni cargo de cancelación. La cancelación entra en vigor al final del período de facturación actual. No hay reembolsos prorrateados salvo lo descrito en nuestra Política de reembolso."},
      {t:"7. Uso aceptable",b:"Aceptas no:\n\n• Usar la plataforma para fines ilegales.\n• Intentar hacer ingeniería inversa, scraping o extracción sistemática de datos.\n• Compartir credenciales de cuenta con terceros.\n• Generar o distribuir información financiera engañosa.\n• Eludir controles de acceso o restricciones de suscripción."},
      {t:"8. Propiedad intelectual",b:"Todo el contenido, marca, software y funcionalidad son propiedad exclusiva de Global Market Analytics o sus licenciantes. Se te concede una licencia limitada y no exclusiva solo para uso personal y no comercial."},
      {t:"9. Limitación de responsabilidad",b:"En la máxima medida permitida por la ley, GMA y sus afiliados no serán responsables por daños indirectos, incidentales, consecuentes o punitivos. La responsabilidad total de GMA no excederá el importe pagado por ti en los doce meses anteriores al reclamo."},
      {t:"10. Renuncia de garantías",b:"LA PLATAFORMA SE PROPORCIONA 'TAL CUAL' SIN GARANTÍAS DE NINGÚN TIPO. GMA NO GARANTIZA SERVICIO ININTERRUMPIDO O SIN ERRORES, NI LA EXACTITUD O ACTUALIDAD DE LOS DATOS DE MERCADO. EL USO ES BAJO TU PROPIO RIESGO."},
      {t:"11. Ley aplicable y cambios",b:"Estos Términos se rigen por la ley aplicable. GMA puede modificarlos en cualquier momento; los usuarios registrados serán notificados de cambios materiales por email. El uso continuado constituye aceptación de los términos revisados."},
      {t:"12. Contacto",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com"}
    ],
    refund: [
      {t:"1. Garantía de reembolso de 7 días",b:"GMA ofrece una garantía completa de reembolso de 7 días en todos los planes pagos (Daily, Monthly, Yearly). Si no estás satisfecho por cualquier razón, solicita un reembolso completo dentro de los 7 días de tu primera compra.\n\nEsta garantía aplica a la primera compra por nivel de plan y no aplica a renovaciones posteriores."},
      {t:"2. Cómo solicitar un reembolso",b:"Contáctanos dentro de los 7 días de la compra:\n\n• Correo: support@globalmarketanalytics.com\n• Asunto: Solicitud de reembolso — [tu correo registrado]\n• Incluye: fecha de compra y correo utilizado.\n\nLos reembolsos se procesan vía Paddle.com al método de pago original en 5-7 días hábiles."},
      {t:"3. Cancelación de suscripción en un clic",b:"Cancela en cualquier momento desde la configuración de la cuenta — sin penalización ni cargo de cancelación.\n\n• La cancelación detiene todos los cargos futuros inmediatamente.\n• El acceso a funciones pagadas se mantiene hasta el final del período actual.\n• No hay reembolsos prorrateados para períodos parciales después de la ventana de 7 días."},
      {t:"4. Cargos de renovación",b:"Las renovaciones de suscripción no están cubiertas por la garantía de 7 días. Cancela antes de la fecha de renovación para evitar cargos. Para disputas de renovación, contacta support@globalmarketanalytics.com y revisaremos caso por caso."},
      {t:"5. Excepciones",b:"No son elegibles para reembolso:\n\n• Solicitudes hechas después de la ventana de 7 días.\n• Cuentas que hayan violado los Términos de servicio.\n• Plan gratuito, porque no hay cargos.\n• Compra fraudulenta o abuso de chargeback."},
      {t:"6. Procesador de pago (Paddle)",b:"Todos los reembolsos se procesan a través de Paddle.com. Los tiempos bancarios varían, normalmente 5-10 días hábiles para aparecer en el extracto.\n\nConsultas de facturación con Paddle: https://www.paddle.com/legal"},
      {t:"7. Contacto",b:"Global Market Analytics\nEmail: support@globalmarketanalytics.com\nWebsite: https://globalmarketanalytics.com\n\nIntentamos responder a todas las solicitudes de reembolso dentro de 1 día hábil."}
    ]
  }
});

const GMA_TR_FINAL_REPAIR = {
  home: "ANA SAYFA",
  markets: "PİYASALAR",
  about: "HAKKINDA",
  contact: "İLETİŞİM",
  privacy: "GİZLİLİK",
  pricing: "FİYATLAR",
  login: "GİRİŞ YAP",
  register: "KAYIT OL",
  logout: "ÇIKIŞ YAP",
  loginTitle: "Hesabınıza giriş yapın",
  registerTitle: "Ücretsiz hesabınızı oluşturun",
  viewMarkets: "PİYASALARI GÖR",
  loginRegister: "GİRİŞ / KAYIT",
  googleContinue: "Google ile devam et",
  heroTitle: "Küresel Piyasaları\nDaha Net Görün",
  heroSub: "600+ küresel kuruluş, gerçek zamanlı piyasa verisi ve GMA Consensus Engine ile yapılandırılmış finansal zeka.",
  heroSubtitle: "Yapılandırılmış analiz ve daha net karar çerçevesiyle belirsizliği azaltın.",
  heroBtn1: "PİYASALARI GÖR",
  heroBtn2: "FİYATLARI GÖR",
  heroBtn3: "KAYIT OL",
  howTitle: "Nasıl Çalışır",
  howSub: "4 Adımda Küresel Yatırım",
  step1t: "Kayıt Ol",
  step1d: "E-posta veya Google ile 30 saniyede hesap oluşturun",
  step2t: "Plan Seç",
  step2d: "Günlük 2.99$'dan başlayan planlardan seçin",
  step3t: "Analiz Et",
  step3d: "GMA Consensus Engine ile stratejik netlik kazanın",
  step4t: "Karar Ver",
  step4d: "Güvenilir veri ve analitik netlikle kendi karar çerçevenizi kurun",
  featTitle: "Platform Özellikleri",
  featSub: "Her şey tek yerde",
  feat1t: "Canlı Piyasa Akışı",
  feat1d: "600+ şirketi, kriptoyu, emtiayı ve para birimlerini gerçek zamanlı takip edin",
  feat2t: "GMA Triumvirate Analizi",
  feat2d: "GMA Consensus Engine üzerinden kurumsal seviye sinyal uyumunu inceleyin",
  feat3t: "Tarihsel Grafikler",
  feat3d: "Kuruluş yılından itibaren grafikler, kriz analizleri ve uzun vadeli trendler",
  feat4t: "Şirket Karşılaştırma",
  feat4d: "5 şirkete kadar AI destekli karşılaştırma yapın ve risk çerçevesini daha net görün",
  feat5t: "Akıllı Uyarılar",
  feat5d: "Fiyat hedefi uyarıları kurun; yükseliş ve düşüşleri anında takip edin",
  feat6t: "8 Dil",
  feat6d: "İngilizce, Türkçe, Rusça, Arapça, Çince, Hintçe, Almanca ve İspanyolca için yerelleştirilmiş deneyim",
  ctaTitle: "Karar Netliğini Kurumsal Seviyeye Taşıyın",
  ctaSub: "Günlük 2.99$'dan başlayan planlarla küresel piyasaları profesyonel düzeyde analiz edin.",
  ctaBtn1: "Plan Seç →",
  ctaBtn2: "Önce Keşfet",
  ctaFree: "Ücretsiz Başla",
  ctaFreeSub: "Giriş yapmadan piyasaları keşfedin.",
  sector: "Sektör",
  sectors: "SEKTÖR",
  allSectors: "TÜMÜ",
  gainers: "YÜKSELENLER",
  losers: "DÜŞENLER",
  live: "CANLI",
  autoRefresh: "OTOMATİK YENİLE",
  loadMore: "DAHA FAZLA YÜKLE",
  allShown: "TÜM KURULUŞLAR GÖSTERİLDİ",
  compare: "KARŞILAŞTIR",
  analyzeAI: "AI ANALİZ",
  chart: "GRAFİK",
  add: "EKLE",
  watch: "İZLE",
  alert: "UYARI",
  aiAnalysis: "AI ANALİZ",
  riskOpportunity: "RİSK & FIRSAT",
  historicalChart: "TARİHSEL GRAFİK",
  priceRiseAlert: "FİYAT YÜKSELİŞ UYARISI",
  riseThreshold: "YÜKSELİŞ EŞİĞİ",
  target: "HEDEF",
  setAlert: "UYARI KUR",
  cart: "SEPET",
  watchlist: "İZLEME",
  cartEmpty: "Sepet boş",
  watchlistEmpty: "İzleme listesi boş",
  noPurchasesYet: "Henüz alım yok",
  remove: "kaldır",
  units: "adet",
  buyIn: "alış",
  currentValue: "Güncel Değer",
  cost: "Maliyet",
  profitLoss: "Kâr / Zarar",
  noApiKey: "API anahtarı yok — Ayarlar'dan ekleyin",
  liveDataUpdated: "Canlı veri güncellendi",
  simulationRunning: "Simülasyon çalışıyor",
  cartRemoved: "sepetten çıkarıldı",
  basketAdded: "sepete eklendi",
  watchRemoved: "izleme listesinden çıkarıldı",
  watchAdded: "izleme listesine eklendi",
  alertCreated: "uyarı oluşturuldu",
  maxCompare: "En fazla 5 şirket seçilebilir",
  addedToComparison: "karşılaştırmaya eklendi",
  contactTitle: "Bize Ulaşın",
  contactSub: "Sorularınız ve geri bildirimleriniz için buradayız.",
  contactInfo: "İletişim Bilgileri",
  formName: "AD SOYAD",
  formEmail: "E-POSTA",
  formSubject: "KONU",
  formMsg: "MESAJ",
  formSend: "GÖNDER",
  formSending: "GÖNDERİLİYOR...",
  formSent: "Mesajınız gönderildi!",
  namePlaceholder: "Adınız",
  subjectPlaceholder: "Konu",
  messagePlaceholder: "Mesajınız...",
  aboutTitle: "Global Market Analytics Hakkında",
  aboutSub: "Küresel piyasalarda yapılandırılmış analiz, netlik ve karar desteği sunan finansal zeka platformu.",
  aboutMission: "Misyonumuz",
  aboutMissionText: "Yatırım tavsiyesi sınırını aşmadan yapılandırılmış analizle belirsizliği azaltan finansal karar altyapısı kurmak.",
  aboutVision: "Vizyonumuz",
  aboutVisionText: "Daha net anlayışın, düşük belirsizliğin ve güçlü karar disiplininin küresel piyasalarda erişilebilir olduğu bir dünya.",
  aboutCardPlatformT: "Platform",
  aboutCardPlatformB: "Global Market Analytics; 600+ küresel kuruluşun hisse verisini, IPO durumunu ve piyasa metriklerini tek arayüzde sunmak için tasarlanmış finansal bilgi platformudur.",
  aboutCardAIT: "AI Entegrasyonu",
  aboutCardAIB: "GMA Consensus Engine tarafından desteklenen platform; yapılandırılmış şirket analizi, risk çerçevesi ve stratejik görünüm sunar. Tüm çıktılar yalnızca bilgilendirme amaçlıdır ve yatırım tavsiyesi değildir.",
  aboutCardDataT: "Tarihsel Veri",
  aboutCardDataB: "Altın için 1900'den, başlıca para birimleri için 1930'dan ve diğer emtialar için kayıtlı en erken tarihlerden 2026'ya uzanan tarihsel grafik endeksleri.",
  aboutCardSourcesT: "Veri Kaynakları",
  aboutCardSourcesB: "Canlı veriler Finnhub API ile sağlanır. Forex oranları open.er-api.com kaynaklıdır. Harici proxy kullanılmaz.",
  aboutCardPrivacyT: "Gizlilik",
  aboutCardPrivacyB: "Kullanıcı verileri harici sunuculara gönderilmez. Tercihler, API anahtarları ve portföy bilgileri yalnızca tarayıcınızın localStorage alanında saklanır.",
  pricingTitle: "Küresel Yatırım İçin AI Gücü",
  pricingSub: "GMA Consensus Engine'e tek bir kurumsal abonelikle erişin.",
  pricingManagedLine1: "GMA'ya ödeme yapın - GMA Triple Consensus'u sizin için yönetiyoruz.",
  pricingManagedLine2: "Tek platform, üç AI motoru.",
  detailedComparison: "DETAYLI KARŞILAŞTIRMA",
  feature: "ÖZELLİK",
  integratedAiPartners: "ENTEGRE AI ORTAKLARI",
  apiCostsManaged: "GMA tüm API maliyetlerini sizin adınıza yönetir. Tek abonelik, üç AI motoru.",
  pricingLegalWarning: "Bu platform yatırım tavsiyesi vermez. Tüm kararlar yatırımcının sorumluluğundadır.",
  secureCheckoutViaPaddle: "PADDLE İLE GÜVENLİ ÖDEME",
  secureCheckoutTitle: "Paddle ile Güvenli Ödeme",
  secureCheckoutBody: "Ödemeniz yetkili kayıtlı satıcı iş ortağımız Paddle.com tarafından güvenle işlenir. GMA kart bilgilerinizi saklamaz. Aşağıdaki buton Paddle'ın güvenli ödeme sayfasını açar.",
  proceedToCheckout: "Ödemeye Devam Et",
  startFreeCheckout: "Ücretsiz Başla",
  checkoutSecuredNote: "Paddle.com güvencesiyle - kart verileri GMA sunucularında saklanmaz.",
  openingPaddle: "Paddle ödeme ekranı açılıyor...",
  pleaseWait: "Lütfen bekleyin, bu sayfayı kapatmayın.",
  planActivatedShort: "plan erişimi etkinleştirildi.",
  creditsAdded: "kredi hesabınıza eklendi.",
  plan: "Plan",
  myProfile: "Profilim",
  legal: "YASAL",
  legalNoticeTitle: "YASAL BİLDİRİM",
  legalNoticeNotAdvice: "YASAL BİLDİRİM - YATIRIM TAVSİYESİ DEĞİLDİR",
  legalNotice: "Bu platform yatırım tavsiyesi vermez. GMA yalnızca bilgilendirme amacıyla AI destekli analitik içgörüler sunar. Nihai yatırım kararları tamamen yatırımcının sorumluluğundadır.",
  legalEffectiveDate: "Yürürlük Tarihi: Nisan 2026",
  legalGdprDate: "Yürürlük Tarihi: Nisan 2026 — GDPR Uyumlu",
  legalTranslating: "İçerik dilinize çevriliyor...",
  legalNoAdvice: "YATIRIM TAVSİYESİ DEĞİLDİR",
  privacyPolicyTitle: "Gizlilik Politikası",
  termsTitle: "Hizmet Şartları",
  refundTitle: "İade Politikası",
  privacyWarning: "Global Market Analytics (GMA) bir veri görselleştirme platformudur. GMA kayıtlı bir yatırım danışmanı değildir; finansal, yatırım, hukuki veya vergi tavsiyesi sunmaz. Tüm içerik ve AI analizleri yalnızca bilgilendirme amaçlıdır. Yatırım kararları tamamen kullanıcının kendi sorumluluğundadır.",
  termsWarning: "GMA kayıtlı bir yatırım danışmanı değildir. Tüm içerik yalnızca bilgilendirme amaçlıdır. Yatırım kararı almadan önce bağımsız profesyonel finansal danışmanlık alın.",
  refundHeroTitle: "7 Gün Para İade Garantisi",
  refundHeroText: "Memnun kalmadınız mı? İlk 7 gün içinde koşulsuz tam iade talep edin. support@globalmarketanalytics.com adresine yazın; 5-7 iş günü içinde işleme alalım.",
  paddleSecured: "Paddle Güvenceli",
  oneClickCancel: "Tek Tıkla İptal",
  noLockIn: "Bağlayıcılık Yok",
  sevenDayGuarantee: "7 Gün Garanti",
  footerDesc: "Küresel piyasalarda netlik sağlamak için tasarlanmış finansal zeka platformu.",
  footerBrandLine: "Global Market Analytics · 2026 · Bağımsız Zeka",
  footerCompliance: "Global Market Analytics (GMA), AI destekli piyasa verisi görselleştirmesi sunan dijital bir platformdur. GMA kayıtlı bir yatırım danışmanı değildir. Tüm ödemeler iş ortağımız Paddle.com tarafından güvenli şekilde işlenir.",
  platform: "PLATFORM",
  addToPortfolio: "PORTFÖYE EKLE",
  currentPrice: "GÜNCEL FİYAT",
  exchange: "BORSA",
  quantity: "ADET",
  unitPrice: "Birim Fiyat",
  totalLabel: "TOPLAM",
  simulatedTransaction: "Bu simüle edilmiş bir işlemdir - gerçek alım yapılmaz"
};

const GMA_TR_TEXT_REPAIRS = [
  ["Yururluk", "Yürürlük"], ["Icerik", "İçerik"], ["cevriliyor", "çevriliyor"], ["TAVSIYESI", "TAVSİYESİ"], ["DEGILDIR", "DEĞİLDİR"],
  ["Gizlilik Politikasi", "Gizlilik Politikası"], ["Hizmet Sartlari", "Hizmet Şartları"], ["Iade Politikasi", "İade Politikası"],
  ["kayitli", "kayıtlı"], ["yatirim", "yatırım"], ["danismani", "danışmanı"], ["gorsellestirme", "görselleştirme"], ["Tum", "Tüm"], ["tum", "tüm"],
  ["yalnizca", "yalnızca"], ["bilgilendirme amaclidir", "bilgilendirme amaçlıdır"], ["kullanicinin", "kullanıcının"], ["sorumlulugundadir", "sorumluluğundadır"],
  ["Gun", "Gün"], ["Iade", "İade"], ["kosulsuz", "koşulsuz"], ["is gunu", "iş günü"], ["isleme", "işleme"], ["Guvenceli", "Güvenceli"],
  ["Tikla", "Tıkla"], ["Iptal", "İptal"], ["Baglayicilik", "Bağlayıcılık"], ["Canli", "Canlı"], ["Akisi", "Akışı"], ["sirket", "şirket"],
  ["gercek", "gerçek"], ["zamanli", "zamanlı"], ["Sirket", "Şirket"], ["Karsilastirma", "Karşılaştırma"], ["yukselis", "yükseliş"], ["dusus", "düşüş"],
  ["aninda", "anında"], ["Ingilizce", "İngilizce"], ["Turkce", "Türkçe"], ["Rusca", "Rusça"], ["Arapca", "Arapça"], ["Cince", "Çince"],
  ["Hintce", "Hintçe"], ["Ispanyolca", "İspanyolca"], ["Kuresel", "Küresel"], ["Piyasalari", "Piyasaları"], ["Gorun", "Görün"],
  ["kurulus", "kuruluş"], ["yapilandirilmis", "yapılandırılmış"], ["cercevesi", "çerçevesi"], ["belirsizligi", "belirsizliği"],
  ["Nasil", "Nasıl"], ["Calisir", "Çalışır"], ["Ozellikleri", "Özellikleri"], ["Ucretsiz", "Ücretsiz"], ["Basla", "Başla"],
  ["Giris", "Giriş"], ["Sektor", "Sektör"], ["TUMU", "TÜMÜ"], ["YUKSELENLER", "YÜKSELENLER"], ["DUSENLER", "DÜŞENLER"],
  ["YUKLE", "YÜKLE"], ["GRAFIK", "GRAFİK"], ["ANALIZ", "ANALİZ"], ["TARIHSEL", "TARİHSEL"], ["FIYAT", "FİYAT"],
  ["YUKSELIS", "YÜKSELİŞ"], ["ESIGI", "EŞİĞİ"], ["Guncel", "Güncel"], ["Deger", "Değer"], ["Kar / Zarar", "Kâr / Zarar"],
  ["PORTFOY", "PORTFÖY"], ["PORTFOYE", "PORTFÖYE"], ["ODEME", "ÖDEME"], ["Odeme", "Ödeme"], ["Erisim", "Erişim"],
  ["Guvenli", "Güvenli"], ["guvenli", "güvenli"], ["guvencesiyle", "güvencesiyle"], ["Lutfen", "Lütfen"], ["erisim", "erişim"],
  ["etkinlestirildi", "etkinleştirildi"], ["hesabiniza", "hesabınıza"], ["eklendi", "eklendi"], ["Bagimsiz", "Bağımsız"], ["Zeka", "Zeka"]
];

function repairTurkishText(value) {
  if (typeof value === "string") {
    return GMA_TR_TEXT_REPAIRS.reduce((text, pair) => text.split(pair[0]).join(pair[1]), value);
  }
  if (Array.isArray(value)) return value.map(repairTurkishText);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairTurkishText(item)]));
  }
  return value;
}

T.tr = repairTurkishText({ ...(T.tr || EN), ...GMA_TR_FINAL_REPAIR });
if (GMA_LEGAL_STATIC.tr) GMA_LEGAL_STATIC.tr = repairTurkishText(GMA_LEGAL_STATIC.tr);
const GMA_AI_LAYER_I18N = {
  en: { aiLayerAnalytic:'Analytic Layer', aiLayerStrategy:'Deep Strategy', aiLayerHistorical:'Historical Filter' },
  tr: { aiLayerAnalytic:'Analitik Katman', aiLayerStrategy:'Derin Strateji', aiLayerHistorical:'Tarihsel Filtre' },
  ru: { aiLayerAnalytic:'Аналитический слой', aiLayerStrategy:'Глубокая стратегия', aiLayerHistorical:'Исторический фильтр' },
  ar: { aiLayerAnalytic:'الطبقة التحليلية', aiLayerStrategy:'الاستراتيجية العميقة', aiLayerHistorical:'المرشح التاريخي' },
  zh: { aiLayerAnalytic:'分析层', aiLayerStrategy:'深度策略', aiLayerHistorical:'历史过滤' },
  hi: { aiLayerAnalytic:'विश्लेषण परत', aiLayerStrategy:'गहन रणनीति', aiLayerHistorical:'ऐतिहासिक फ़िल्टर' },
  de: { aiLayerAnalytic:'Analyseebene', aiLayerStrategy:'Tiefe Strategie', aiLayerHistorical:'Historischer Filter' },
  es: { aiLayerAnalytic:'Capa analítica', aiLayerStrategy:'Estrategia profunda', aiLayerHistorical:'Filtro histórico' }
};
Object.entries(GMA_AI_LAYER_I18N).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});

const GMA_CHART_MODAL_I18N_FIXES = {
  en: {
    chart: 'Chart',
    historicalChart: 'Historical Chart',
    aiAnalysis: 'AI Analysis',
    aiAnalysisDemo: 'AI Analysis Preview',
    demoLayerLabel: 'preview layer',
    demoContentOnly: 'Preview content only. Live model output will be connected later for company-specific scoring.',
    companyDemoContentOnly: 'preview content only. Live model output will be connected later for company-specific scoring.',
    demoAnalysisSummary: 'Apple Inc. demonstrates exceptional financial resilience with consistent revenue growth across its diversified product and services ecosystem. The company transition to recurring services revenue provides stable high-margin income, while premium brand positioning maintains strong pricing power against competitors.',
    demoPositive1: 'Services segment growing 14% YoY - now 22% of total revenue with 72% gross margins',
    demoPositive2: 'Strong balance sheet: $162B cash reserves enabling R&D investment and buybacks',
    demoPositive3: 'Ecosystem lock-in drives 95%+ customer retention and cross-product adoption rates',
    demoInnovation1: 'Vision Pro spatial computing positions the company for the next computing cycle',
    demoInnovation2: 'Custom silicon delivers industry-leading performance-per-watt ratios',
    demoShortTimeframe: 'Strong Q4 earnings forecast and the new iPhone cycle are expected to support near-term price appreciation. Services revenue growth provides a consistent upside catalyst.',
    demoLongTimeframe: 'Sustained services expansion, Vision Pro ecosystem maturation, and continued buybacks position AAPL for long-term value appreciation through 2027.'
  },
  tr: {
    chart: 'Grafik',
    historicalChart: 'Tarihsel Grafik',
    aiAnalysis: 'Yapay Zeka Analizi',
    aiAnalysisDemo: 'Yapay Zeka Analiz Onizlemesi',
    demoLayerLabel: 'onizleme katmani',
    demoContentOnly: 'Yalnizca onizleme icerigidir. Sirkete ozel skor icin canli model ciktisi daha sonra baglanacak.',
    companyDemoContentOnly: 'yalnizca onizleme icerigidir. Sirkete ozel skor icin canli model ciktisi daha sonra baglanacak.',
    demoAnalysisSummary: 'Apple Inc., cesitlendirilmis urun ve servis ekosisteminde istikrarli gelir buyumesiyle guclu finansal dayaniklilik gosterir. Sirketin tekrarlayan servis gelirlerine gecisi yuksek marjli istikrarli gelir saglarken, premium marka konumu rakiplere karsi guclu fiyatlama gucunu korur.',
    demoPositive1: 'Servis segmenti yillik %14 buyuyor - toplam gelirin %22 si ve %72 brut marj',
    demoPositive2: 'Guclu bilanco: Ar-Ge yatirimi ve geri alimlara imkan veren 162 milyar dolar nakit rezervi',
    demoPositive3: 'Ekosistem bagliligi %95 uzeri musteri tutma ve capraz urun kullanimini destekler',
    demoInnovation1: 'Vision Pro uzamsal bilgisayar alani sirketi yeni nesil bilgisayar dongusune konumlandirir',
    demoInnovation2: 'Ozel silikon mimarisi watt basina sektorde lider performans sunar',
    demoShortTimeframe: 'Guclu 4. ceyrek beklentisi ve yeni iPhone dongusunun yakin vadeli fiyat artisini desteklemesi bekleniyor. Servis gelirlerindeki buyume duzenli yukari yonlu katalizor saglar.',
    demoLongTimeframe: 'Servis segmentinin suren genislemesi, Vision Pro ekosisteminin olgunlasmasi ve geri alim programi AAPL icin 2027 ye kadar uzun vadeli deger artisi zemini olusturur.'
  },
  ru: {
    chart: 'График',
    historicalChart: 'Исторический график',
    aiAnalysis: 'AI-анализ',
    aiAnalysisDemo: 'Предпросмотр AI-анализа',
    demoLayerLabel: 'слой предпросмотра',
    demoContentOnly: 'Это только предпросмотр. Живой вывод модели для оценки компании будет подключен позже.',
    companyDemoContentOnly: 'только предпросмотр. Живой вывод модели для оценки компании будет подключен позже.',
    demoAnalysisSummary: 'Apple Inc. демонстрирует высокую финансовую устойчивость благодаря стабильному росту выручки в диверсифицированной экосистеме продуктов и сервисов. Переход к повторяющейся сервисной выручке обеспечивает стабильный высокомаржинальный доход, а премиальный бренд сохраняет сильную ценовую власть.',
    demoPositive1: 'Сервисный сегмент растет на 14% г/г - уже 22% выручки при валовой марже 72%',
    demoPositive2: 'Сильный баланс: $162 млрд денежных резервов для R&D и обратных выкупов',
    demoPositive3: 'Экосистема удерживает более 95% клиентов и стимулирует использование нескольких продуктов',
    demoInnovation1: 'Vision Pro позиционирует компанию в следующем цикле вычислений',
    demoInnovation2: 'Собственные чипы дают лидирующую производительность на ватт',
    demoShortTimeframe: 'Сильный прогноз на Q4 и новый цикл iPhone могут поддержать краткосрочный рост цены. Рост сервисной выручки остается устойчивым позитивным катализатором.',
    demoLongTimeframe: 'Расширение сервисов, развитие экосистемы Vision Pro и программа обратного выкупа поддерживают долгосрочный потенциал AAPL до 2027 года.'
  },
  ar: {
    chart: 'الرسم البياني',
    historicalChart: 'الرسم التاريخي',
    aiAnalysis: 'تحليل AI',
    aiAnalysisDemo: 'معاينة تحليل AI',
    demoLayerLabel: 'طبقة المعاينة',
    demoContentOnly: 'هذا محتوى معاينة فقط. سيتم ربط مخرجات النموذج الحية لاحقا لتقييم كل شركة.',
    companyDemoContentOnly: 'محتوى معاينة فقط. سيتم ربط مخرجات النموذج الحية لاحقا لتقييم كل شركة.',
    demoAnalysisSummary: 'تظهر Apple Inc. مرونة مالية قوية بفضل نمو إيرادات مستقر داخل منظومة منتجات وخدمات متنوعة. انتقال الشركة إلى إيرادات خدمات متكررة يوفر دخلا مستقرا عالي الهامش، بينما يحافظ موقع العلامة الممتاز على قوة التسعير أمام المنافسين.',
    demoPositive1: 'قطاع الخدمات ينمو 14% سنويا - يمثل الآن 22% من الإيرادات بهامش إجمالي 72%',
    demoPositive2: 'ميزانية قوية: احتياطي نقدي 162 مليار دولار يدعم البحث والتطوير وإعادة شراء الأسهم',
    demoPositive3: 'قوة المنظومة تدعم احتفاظا بالعملاء فوق 95% واعتمادا متبادلا للمنتجات',
    demoInnovation1: 'Vision Pro يضع الشركة في موقع قوي لدورة الحوسبة التالية',
    demoInnovation2: 'الشرائح المخصصة تقدم أداء رائدا لكل واط',
    demoShortTimeframe: 'من المتوقع أن يدعم توقع أرباح الربع الرابع القوي ودورة iPhone الجديدة ارتفاع السعر قصير الأجل. نمو إيرادات الخدمات يوفر محفزا إيجابيا مستمرا.',
    demoLongTimeframe: 'استمرار توسع الخدمات ونضج منظومة Vision Pro وبرنامج إعادة الشراء يدعمون قيمة AAPL على المدى الطويل حتى 2027.'
  },
  zh: {
    chart: '图表',
    historicalChart: '历史图表',
    aiAnalysis: 'AI 分析',
    aiAnalysisDemo: 'AI 分析预览',
    demoLayerLabel: '预览层',
    demoContentOnly: '仅为预览内容。稍后将连接实时模型输出以进行公司评分。',
    companyDemoContentOnly: '仅为预览内容。稍后将连接实时模型输出以进行公司评分。',
    demoAnalysisSummary: 'Apple Inc. 通过多元化产品和服务生态的稳定收入增长，展现出卓越的财务韧性。公司向经常性服务收入转型带来稳定的高利润收入，同时高端品牌定位维持了强劲的定价能力。',
    demoPositive1: '服务业务同比增长 14% - 已占总收入 22%，毛利率 72%',
    demoPositive2: '资产负债表强劲：1620 亿美元现金储备支持研发和回购',
    demoPositive3: '生态锁定推动 95% 以上客户留存和跨产品采用',
    demoInnovation1: 'Vision Pro 空间计算使公司面向下一代计算周期',
    demoInnovation2: '自研芯片带来行业领先的每瓦性能',
    demoShortTimeframe: '强劲的第四季度盈利预期和新 iPhone 周期有望支持短期价格上涨。服务收入增长提供持续的上行催化。',
    demoLongTimeframe: '服务业务持续扩张、Vision Pro 生态成熟以及持续回购，使 AAPL 到 2027 年具备长期增值潜力。'
  },
  hi: {
    chart: 'चार्ट',
    historicalChart: 'ऐतिहासिक चार्ट',
    aiAnalysis: 'AI विश्लेषण',
    aiAnalysisDemo: 'AI विश्लेषण पूर्वावलोकन',
    demoLayerLabel: 'पूर्वावलोकन परत',
    demoContentOnly: 'यह केवल पूर्वावलोकन सामग्री है। कंपनी-विशिष्ट स्कोरिंग के लिए लाइव मॉडल आउटपुट बाद में जोड़ा जाएगा।',
    companyDemoContentOnly: 'केवल पूर्वावलोकन सामग्री। कंपनी-विशिष्ट स्कोरिंग के लिए लाइव मॉडल आउटपुट बाद में जोड़ा जाएगा।',
    demoAnalysisSummary: 'Apple Inc. अपने विविध उत्पाद और सेवा इकोसिस्टम में लगातार राजस्व वृद्धि के साथ मजबूत वित्तीय लचीलापन दिखाती है। आवर्ती सेवा राजस्व की ओर बदलाव स्थिर उच्च-मार्जिन आय देता है, जबकि प्रीमियम ब्रांड स्थिति प्रतिस्पर्धियों के विरुद्ध मजबूत मूल्य निर्धारण शक्ति बनाए रखती है।',
    demoPositive1: 'सेवा खंड 14% वार्षिक बढ़ रहा है - कुल राजस्व का 22% और 72% सकल मार्जिन',
    demoPositive2: 'मजबूत बैलेंस शीट: R&D और बायबैक के लिए $162B नकद भंडार',
    demoPositive3: 'इकोसिस्टम लॉक-इन 95%+ ग्राहक प्रतिधारण और क्रॉस-प्रोडक्ट अपनाने को बढ़ाता है',
    demoInnovation1: 'Vision Pro कंपनी को अगली कंप्यूटिंग लहर के लिए स्थापित करता है',
    demoInnovation2: 'कस्टम सिलिकॉन प्रति-वाट प्रदर्शन में उद्योग-अग्रणी दक्षता देता है',
    demoShortTimeframe: 'मजबूत Q4 आय पूर्वानुमान और नया iPhone चक्र निकट अवधि में कीमत समर्थन दे सकते हैं। सेवा राजस्व वृद्धि स्थिर सकारात्मक उत्प्रेरक देती है।',
    demoLongTimeframe: 'सेवाओं का विस्तार, Vision Pro इकोसिस्टम की परिपक्वता और बायबैक कार्यक्रम AAPL को 2027 तक दीर्घकालिक मूल्य वृद्धि के लिए समर्थन देते हैं।'
  },
  de: {
    chart: 'Diagramm',
    historicalChart: 'Historisches Diagramm',
    aiAnalysis: 'KI-Analyse',
    aiAnalysisDemo: 'Vorschau der KI-Analyse',
    demoLayerLabel: 'Vorschau-Ebene',
    demoContentOnly: 'Nur Vorschauinhalt. Live-Modellausgaben fur unternehmensspezifische Bewertungen werden spater verbunden.',
    companyDemoContentOnly: 'nur Vorschauinhalt. Live-Modellausgaben fur unternehmensspezifische Bewertungen werden spater verbunden.',
    demoAnalysisSummary: 'Apple Inc. zeigt aussergewoehnliche finanzielle Widerstandsfaehigkeit mit konstantem Umsatzwachstum in einem diversifizierten Produkt- und Service-Oekosystem. Der Uebergang zu wiederkehrenden Serviceerloesen schafft stabile margenstarke Einnahmen, waehrend die Premium-Marke starke Preissetzungsmacht sichert.',
    demoPositive1: 'Services wachsen 14% YoY - nun 22% des Umsatzes mit 72% Bruttomarge',
    demoPositive2: 'Starke Bilanz: $162 Mrd. Cash fuer F&E-Investitionen und Rueckkaeufe',
    demoPositive3: 'Oekosystembindung treibt 95%+ Kundenbindung und Cross-Product-Nutzung',
    demoInnovation1: 'Vision Pro positioniert das Unternehmen fuer den naechsten Computing-Zyklus',
    demoInnovation2: 'Eigene Chips liefern fuehrende Performance pro Watt',
    demoShortTimeframe: 'Starke Q4-Erwartungen und der neue iPhone-Zyklus duerften kurzfristige Kurssteigerungen unterstuetzen. Servicewachstum bleibt ein positiver Katalysator.',
    demoLongTimeframe: 'Anhaltende Serviceexpansion, Reifung des Vision-Pro-Oekosystems und Rueckkaeufe positionieren AAPL fuer langfristige Wertsteigerung bis 2027.'
  },
  es: {
    chart: 'Grafico',
    historicalChart: 'Grafico historico',
    aiAnalysis: 'Analisis AI',
    aiAnalysisDemo: 'Vista previa del analisis AI',
    demoLayerLabel: 'capa de vista previa',
    demoContentOnly: 'Solo contenido de vista previa. La salida del modelo en vivo para puntuacion por empresa se conectara despues.',
    companyDemoContentOnly: 'solo contenido de vista previa. La salida del modelo en vivo para puntuacion por empresa se conectara despues.',
    demoAnalysisSummary: 'Apple Inc. demuestra una resiliencia financiera excepcional con crecimiento constante de ingresos en su ecosistema diversificado de productos y servicios. La transicion hacia ingresos recurrentes de servicios aporta ingresos estables de alto margen, mientras la marca premium mantiene poder de precios frente a competidores.',
    demoPositive1: 'El segmento de servicios crece 14% interanual - ya es 22% de ingresos con 72% de margen bruto',
    demoPositive2: 'Balance solido: $162B en efectivo para I+D y recompras',
    demoPositive3: 'El ecosistema impulsa retencion superior al 95% y adopcion cruzada de productos',
    demoInnovation1: 'Vision Pro posiciona a la empresa para el proximo ciclo de computacion',
    demoInnovation2: 'El silicio propio ofrece rendimiento por vatio lider en la industria',
    demoShortTimeframe: 'Una fuerte prevision de Q4 y el nuevo ciclo de iPhone pueden apoyar la apreciacion de corto plazo. El crecimiento de servicios aporta un catalizador positivo constante.',
    demoLongTimeframe: 'La expansion de servicios, la maduracion de Vision Pro y las recompras posicionan a AAPL para apreciacion de valor a largo plazo hasta 2027.'
  }
};
Object.entries(GMA_CHART_MODAL_I18N_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});

Object.keys(T).forEach(code => {
  Object.keys(T.en).forEach(key => {
    if (!T[code][key]) T[code][key] = T.en[key];
  });
});
T.tr = repairTurkishText({ ...(T.tr || EN), ...GMA_TR_FINAL_REPAIR });
if (GMA_LEGAL_STATIC.tr) GMA_LEGAL_STATIC.tr = repairTurkishText(GMA_LEGAL_STATIC.tr);
const CORE_LANGS = ['en', 'tr', 'ru', 'ar', 'zh', 'hi', 'de', 'es'];
Object.keys(T).forEach(lang => {
  Object.keys(EN).forEach(k => {
    if (!T[lang][k]) T[lang][k] = EN[k];
  });
});
Object.entries(GMA_CHART_MODAL_I18N_FIXES).forEach(([code, values]) => {
  T[code] = { ...(T[code] || EN), ...values };
});

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
const COMPANIES = [
// ── TECHNOLOGY ──
// — Platform, Yazilim & Tuketici Technologysi —
{
  ticker: "AAPL",
  name: "Apple",
  full: "Apple Inc.",
  sector: "tech",
  price: 259.20,
  change: 1.34
}, {
  ticker: "MSFT",
  name: "Microsoft",
  full: "Microsoft Corp.",
  sector: "tech",
  price: 385.90,
  change: 0.87
}, {
  ticker: "AMZN",
  name: "Amazon",
  full: "Amazon.com Inc.",
  sector: "tech",
  price: 242.60,
  change: 0.56
}, {
  ticker: "NFLX",
  name: "Netflix",
  full: "Netflix Inc.",
  sector: "tech",
  price: 1038.50,
  change: 2.34
}, {
  ticker: "ORCL",
  name: "Oracle",
  full: "Oracle Corporation",
  sector: "tech",
  price: 202.30,
  change: 0.75
}, {
  ticker: "CRM",
  name: "Salesforce",
  full: "Salesforce Inc.",
  sector: "tech",
  price: 311.40,
  change: 0.98
}, {
  ticker: "ADBE",
  name: "Adobe",
  full: "Adobe Inc.",
  sector: "tech",
  price: 376.80,
  change: -0.34
}, {
  ticker: "SAP",
  name: "SAP",
  full: "SAP SE",
  sector: "tech",
  price: 264.70,
  change: 0.55
}, {
  ticker: "NOW",
  name: "ServiceNow",
  full: "ServiceNow Inc.",
  sector: "tech",
  price: 1076.20,
  change: 1.23
}, {
  ticker: "SHOP",
  name: "Shopify",
  full: "Shopify Inc.",
  sector: "tech",
  price: 96.80,
  change: 2.10
}, {
  ticker: "TCEHY",
  name: "Tencent",
  full: "Tencent Holdings Ltd.",
  sector: "tech",
  price: 58.40,
  change: 0.88
},
// — Otomasyon & Gelecek Konseptleri —
{
  ticker: "AAGNT",
  name: "Auto. Agents",
  full: "Autonomous Agents (Emerging)",
  sector: "tech",
  price: 18.40,
  change: 6.20,
  isPrivate: true
}, {
  ticker: "SLSVR",
  name: "Silicon Sov.",
  full: "Silicon Sovereignty Ltd.",
  sector: "tech",
  price: 12.80,
  change: 4.15,
  isPrivate: true
},
// — 3D / CAD / BIM / Design Yazilim —
{
  ticker: "ADSK",
  name: "Autodesk",
  full: "Autodesk Inc.",
  sector: "tech",
  price: 284.50,
  change: 0.44
}, {
  ticker: "DASTY",
  name: "Dassault Sys.",
  full: "Dassault Systèmes SE",
  sector: "tech",
  price: 38.40,
  change: 0.21
}, {
  ticker: "SIEGY",
  name: "Siemens Dig.",
  full: "Siemens Digital Industries",
  sector: "tech",
  price: 96.20,
  change: 0.67,
  isPrivate: true
}, {
  ticker: "PTC",
  name: "PTC",
  full: "PTC Inc.",
  sector: "tech",
  price: 196.80,
  change: 0.88
}, {
  ticker: "TRMB",
  name: "Trimble",
  full: "Trimble Inc.",
  sector: "tech",
  price: 65.40,
  change: -0.22
}, {
  ticker: "NEMKY",
  name: "Nemetschek",
  full: "Nemetschek Group SE",
  sector: "tech",
  price: 98.40,
  change: 1.05
}, {
  ticker: "BSY",
  name: "Bentley Sys.",
  full: "Bentley Systems Inc.",
  sector: "tech",
  price: 51.60,
  change: 0.63
}, {
  ticker: "GRPH",
  name: "Graphisoft",
  full: "Graphisoft SE (Nemetschek)",
  sector: "tech",
  price: 98.40,
  change: 0.90,
  isPrivate: true
}, {
  ticker: "CHAOS",
  name: "Chaos Group",
  full: "Chaos Group (V-Ray / Corona)",
  sector: "tech",
  price: 24.50,
  change: 1.40,
  isPrivate: true
}, {
  ticker: "EPIC",
  name: "Epic Games",
  full: "Epic Games (Unreal Engine)",
  sector: "tech",
  price: 82.00,
  change: 2.20,
  isPrivate: true
}, {
  ticker: "MCNL",
  name: "McNeel",
  full: "McNeel & Assoc. (Rhino3D)",
  sector: "tech",
  price: 8.60,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "SH3D",
  name: "Shapr3D",
  full: "Shapr3D / Bentley Systems",
  sector: "tech",
  price: 14.20,
  change: 3.10,
  isPrivate: true
},
// — Large Platform & Hardware Companies —
{
  ticker: "NVDA",
  name: "NVIDIA",
  full: "NVIDIA Corporation (GPU · Hardware)",
  sector: "tech",
  price: 109.40,
  change: 2.15
}, {
  ticker: "GOOGL",
  name: "Google",
  full: "Alphabet / Google",
  sector: "tech",
  price: 162.90,
  change: -0.43
}, {
  ticker: "META",
  name: "Meta",
  full: "Meta Platforms Inc.",
  sector: "tech",
  price: 564.80,
  change: 1.12
}, {
  ticker: "PLTR",
  name: "Palantir",
  full: "Palantir Technologies (Veri · Analitik)",
  sector: "tech",
  price: 88.60,
  change: 3.42
},
// ── AI ──
{
  ticker: "OPENAI",
  name: "OpenAI",
  full: "OpenAI Inc. (GPT-4 · Sora · o1)",
  sector: "ai",
  price: 157.00,
  change: 4.20,
  ipoStatus: "ipo_rumor",
  ipoYear: 2026,
  ipoNote: "2026 IPO rumors are strong — Sam Altman occasionally denies it, but investor pressure is increasing",
  ipoVal: "$300B+"
}, {
  ticker: "ANTHR",
  name: "Anthropic",
  full: "Anthropic PBC (Claude)",
  sector: "ai",
  price: 61.50,
  change: 2.87,
  ipoStatus: "private",
  ipoNote: "Amazon & Google investors. IPO is still early — focus is on safe AI research",
  ipoVal: "$61B"
}, {
  ticker: "PERPL",
  name: "Perplexity",
  full: "Perplexity AI (AI Search Engine)",
  sector: "ai",
  price: 32.40,
  change: 5.80,
  ipoStatus: "ipo_rumor",
  ipoYear: 2026,
  ipoNote: "Rapid growth, the groundwork for an IPO is forming",
  ipoVal: "$14B"
}, {
  ticker: "COHR",
  name: "Cohere",
  full: "Cohere Inc. (Corporate LLM)",
  sector: "ai",
  price: 24.80,
  change: 3.10,
  ipoStatus: "private",
  ipoNote: "Corporate-focused, IPO probability 2027+",
  ipoVal: "$5B"
}, {
  ticker: "HGF",
  name: "Hugging Face",
  full: "Hugging Face (AI Hub & Tools)",
  sector: "ai",
  price: 44.50,
  change: 2.65,
  ipoStatus: "ipo_rumor",
  ipoYear: 2027,
  ipoNote: "Critical infrastructure for the AI ecosystem — IPO looks inevitable",
  ipoVal: "$4.5B"
}, {
  ticker: "GLEAN",
  name: "Glean",
  full: "Glean (Corporate AI Search)",
  sector: "ai",
  price: 18.60,
  change: 4.40,
  ipoStatus: "ipo_prep",
  ipoYear: 2026,
  ipoNote: "Reported start of IPO preparation at the end of 2025",
  ipoVal: "$4.6B"
}, {
  ticker: "MISTR",
  name: "Mistral AI",
  full: "Mistral AI (Open Source LLM · FR)",
  sector: "ai",
  price: 28.20,
  change: 3.75,
  ipoStatus: "private",
  ipoNote: "A symbol of Europe’s AI independence. IPO is still early",
  ipoVal: "$6B"
}, {
  ticker: "DEEPSK",
  name: "DeepSeek",
  full: "DeepSeek (R1 · V3 · China AI Lab)",
  sector: "ai",
  price: 38.80,
  change: 6.90,
  ipoStatus: "private",
  ipoNote: "State-linked China structure — international IPO probability is very low",
  ipoVal: "N/A"
}, {
  ticker: "BAICHN",
  name: "Baichuan AI",
  full: "Baichuan AI (Baichuan-2 · LLM)",
  sector: "ai",
  price: 14.60,
  change: 2.30,
  ipoStatus: "ipo_rumor",
  ipoYear: 2027,
  ipoNote: "Planning a listing on China’s stock exchange",
  ipoVal: "$2B+"
}, {
  ticker: "ZHIPU",
  name: "Zhipu AI",
  full: "Zhipu AI (GLM-4 · ChatGLM)",
  sector: "ai",
  price: 12.40,
  change: 1.95,
  ipoStatus: "ipo_prep",
  ipoYear: 2026,
  ipoNote: "STAR Market (Shanghai) IPO application preparation stage",
  ipoVal: "$2.5B"
}, {
  ticker: "KIMI",
  name: "Moonshot AI",
  full: "Moonshot AI (Kimi Assistant)",
  sector: "ai",
  price: 22.80,
  change: 4.15,
  ipoStatus: "private",
  ipoNote: "China’s fastest-growing AI startup, not yet IPO — not on the agenda",
  ipoVal: "$3.3B"
}, {
  ticker: "XAI",
  name: "xAI",
  full: "xAI Corp. (Grok · Elon Musk)",
  sector: "ai",
  price: 44.80,
  change: 5.13,
  ipoStatus: "ipo_rumor",
  ipoYear: 2027,
  ipoNote: "Elon Musk IPO'yu surekli keeps delaying — X ile birlesme senaryolari var",
  ipoVal: "$50B"
},
// ── KRIPTO & BLOCKCHAIN ECOSYSTEM ──
// — Exchanges & Trading Platforms —
{
  ticker: "COIN",
  name: "Coinbase",
  full: "Coinbase Global Inc.",
  sector: "crypto",
  price: 276.80,
  change: -2.14
}, {
  ticker: "BNB",
  name: "Binance",
  full: "Binance Holdings Ltd.",
  sector: "crypto",
  price: 92.40,
  change: 1.85,
  isPrivate: true
}, {
  ticker: "OKX",
  name: "OKX",
  full: "OKX (OKCoin / OKGroup)",
  sector: "crypto",
  price: 48.60,
  change: 0.92,
  isPrivate: true
}, {
  ticker: "BYBIT",
  name: "Bybit",
  full: "Bybit (ByteTrade Lab)",
  sector: "crypto",
  price: 38.20,
  change: 1.44,
  isPrivate: true
}, {
  ticker: "KRKN",
  name: "Kraken",
  full: "Payward Inc. (Kraken)",
  sector: "crypto",
  price: 28.50,
  change: 0.73,
  isPrivate: true
},
// — Altyapi & Odeme —
{
  ticker: "SQ",
  name: "Block",
  full: "Block Inc. (Square/Cash App)",
  sector: "crypto",
  price: 68.40,
  change: 1.22
}, {
  ticker: "BITPAY",
  name: "BitPay",
  full: "BitPay Inc.",
  sector: "crypto",
  price: 14.80,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "MOONP",
  name: "MoonPay",
  full: "MoonPay International",
  sector: "crypto",
  price: 22.60,
  change: 2.30,
  isPrivate: true
},
// — Stablecoin & Para —
{
  ticker: "USDT",
  name: "Tether",
  full: "Tether Holdings Ltd.",
  sector: "crypto",
  price: 1.00,
  change: 0.01,
  isPrivate: true
}, {
  ticker: "USDC",
  name: "Circle",
  full: "Circle Internet Group",
  sector: "crypto",
  price: 18.40,
  change: 0.88,
  isPrivate: true
},
// — Ag / Protokol —
{
  ticker: "XRP",
  name: "Ripple",
  full: "Ripple Labs Inc.",
  sector: "crypto",
  price: 2.48,
  change: 3.12,
  isPrivate: true
}, {
  ticker: "LINK",
  name: "Chainlink",
  full: "Chainlink (SmartContract Labs)",
  sector: "crypto",
  price: 14.20,
  change: 2.45
}, {
  ticker: "MATIC",
  name: "Polygon",
  full: "Polygon Labs (MATIC)",
  sector: "crypto",
  price: 0.42,
  change: -1.80,
  isPrivate: true
}, {
  ticker: "AVAX",
  name: "Ava Labs",
  full: "Ava Labs (Avalanche)",
  sector: "crypto",
  price: 22.80,
  change: 1.95,
  isPrivate: true
},
// — Corporate & Analitik —
{
  ticker: "MSTR",
  name: "MicroStrat.",
  full: "MicroStrategy (Strategy Inc.)",
  sector: "crypto",
  price: 348.20,
  change: -3.15
}, {
  ticker: "ALCMY",
  name: "Alchemy",
  full: "Alchemy Insights Inc.",
  sector: "crypto",
  price: 32.50,
  change: 2.80,
  isPrivate: true
}, {
  ticker: "FBLKS",
  name: "Fireblocks",
  full: "Fireblocks Ltd.",
  sector: "crypto",
  price: 48.00,
  change: 1.60,
  isPrivate: true
}, {
  ticker: "CHAIN",
  name: "Chainalysis",
  full: "Chainalysis Inc.",
  sector: "crypto",
  price: 36.80,
  change: 0.95,
  isPrivate: true
},
// — Donanim Cuzdan —
{
  ticker: "LEDGR",
  name: "Ledger",
  full: "Ledger SAS",
  sector: "crypto",
  price: 26.40,
  change: 1.15,
  isPrivate: true
},
// — Web3 Developer Ecosystem —
{
  ticker: "CNSYS",
  name: "ConsenSys",
  full: "ConsenSys (MetaMask / Infura)",
  sector: "crypto",
  price: 42.30,
  change: 3.40,
  isPrivate: true
},
// ── FOOD & ICECEK & RESTORAN ECOSYSTEM ──
// — Global Food Devleri —
{
  ticker: "NSRGY",
  name: "Nestlé",
  full: "Nestlé S.A.",
  sector: "food",
  price: 88.50,
  change: -0.31
}, {
  ticker: "UL",
  name: "Unilever",
  full: "Unilever PLC",
  sector: "food",
  price: 54.80,
  change: 0.42
}, {
  ticker: "KO",
  name: "Coca-Cola",
  full: "The Coca-Cola Company",
  sector: "food",
  price: 71.60,
  change: 0.18
}, {
  ticker: "PEP",
  name: "PepsiCo",
  full: "PepsiCo Inc.",
  sector: "food",
  price: 144.20,
  change: -0.55
}, {
  ticker: "MDLZ",
  name: "Mondelez",
  full: "Mondelez International Inc.",
  sector: "food",
  price: 52.40,
  change: -0.28
}, {
  ticker: "DANOY",
  name: "Danone",
  full: "Danone S.A.",
  sector: "food",
  price: 13.80,
  change: 0.35
}, {
  ticker: "HEINY",
  name: "Heineken",
  full: "Heineken N.V.",
  sector: "food",
  price: 34.60,
  change: -0.44
}, {
  ticker: "BUD",
  name: "AB InBev",
  full: "Anheuser-Busch InBev SA/NV",
  sector: "food",
  price: 54.90,
  change: 0.62
}, {
  ticker: "KHC",
  name: "Kraft Heinz",
  full: "The Kraft Heinz Company",
  sector: "food",
  price: 27.80,
  change: -0.90
}, {
  ticker: "GIS",
  name: "Gen. Mills",
  full: "General Mills Inc.",
  sector: "food",
  price: 54.20,
  change: -0.15
}, {
  ticker: "K",
  name: "Kellanova",
  full: "Kellanova (fmr. Kellogg's)",
  sector: "food",
  price: 80.40,
  change: 0.33
}, {
  ticker: "TSN",
  name: "Tyson Foods",
  full: "Tyson Foods Inc.",
  sector: "food",
  price: 57.30,
  change: 0.78
},
// — Tarim & Emtia —
{
  ticker: "ADM",
  name: "ADM",
  full: "Archer Daniels Midland Co.",
  sector: "food",
  price: 44.60,
  change: -1.12
}, {
  ticker: "BG",
  name: "Bunge",
  full: "Bunge Global SA",
  sector: "food",
  price: 75.80,
  change: 0.44
}, {
  ticker: "WLMIY",
  name: "Wilmar",
  full: "Wilmar International Ltd.",
  sector: "food",
  price: 3.20,
  change: 0.55
}, {
  ticker: "ASBFY",
  name: "ABF",
  full: "Associated British Foods PLC",
  sector: "food",
  price: 27.40,
  change: 0.22
}, {
  ticker: "JBSAY",
  name: "JBS",
  full: "JBS S.A.",
  sector: "food",
  price: 9.10,
  change: 1.05
}, {
  ticker: "CARL",
  name: "Cargill",
  full: "Cargill Incorporated",
  sector: "food",
  price: 148.00,
  change: 0.30,
  isPrivate: true
}, {
  ticker: "MARS",
  name: "Mars Inc.",
  full: "Mars, Incorporated",
  sector: "food",
  price: 92.00,
  change: 0.45,
  isPrivate: true
}, {
  ticker: "LACT",
  name: "Lactalis",
  full: "Groupe Lactalis",
  sector: "food",
  price: 38.00,
  change: -0.20,
  isPrivate: true
}, {
  ticker: "LDCO",
  name: "L. Dreyfus",
  full: "Louis Dreyfus Company",
  sector: "food",
  price: 56.00,
  change: 0.18,
  isPrivate: true
}, {
  ticker: "OLAM",
  name: "Olam",
  full: "Olam International Ltd.",
  sector: "food",
  price: 1.42,
  change: 0.67,
  isPrivate: true
}, {
  ticker: "VITR",
  name: "Viterra",
  full: "Viterra / Glencore Agriculture",
  sector: "food",
  price: 24.50,
  change: 0.40,
  isPrivate: true
}, {
  ticker: "BCLN",
  name: "Barry Cal.",
  full: "Barry Callebaut AG",
  sector: "food",
  price: 1240.00,
  change: -0.60
}, {
  ticker: "CPFTH",
  name: "CP Foods",
  full: "Charoen Pokphand Foods PCL",
  sector: "food",
  price: 1.18,
  change: 0.92
},
// — Fast Food & Restoran Zincirleri —
{
  ticker: "MCD",
  name: "McDonald's",
  full: "McDonald's Corp.",
  sector: "food",
  price: 293.40,
  change: 0.23
}, {
  ticker: "SBUX",
  name: "Starbucks",
  full: "Starbucks Corporation",
  sector: "food",
  price: 87.60,
  change: 0.55
}, {
  ticker: "YUM",
  name: "Yum! Brands",
  full: "Yum! Brands (KFC·PizzaHut·Taco)",
  sector: "food",
  price: 131.80,
  change: 0.38
}, {
  ticker: "QSR",
  name: "RBI",
  full: "Restaurant Brands Intl. (BK·Pop.)",
  sector: "food",
  price: 64.20,
  change: -0.22
}, {
  ticker: "CMG",
  name: "Chipotle",
  full: "Chipotle Mexican Grill Inc.",
  sector: "food",
  price: 51.40,
  change: 1.45
}, {
  ticker: "DRI",
  name: "Darden",
  full: "Darden Restaurants Inc.",
  sector: "food",
  price: 157.80,
  change: 0.67
}, {
  ticker: "SUBWY",
  name: "Subway",
  full: "Subway Restaurants",
  sector: "food",
  price: 18.00,
  change: 0.10,
  isPrivate: true
},
// — B2B Yemek & Catering —
{
  ticker: "CMPGY",
  name: "Compass",
  full: "Compass Group PLC",
  sector: "food",
  price: 27.80,
  change: 0.30
}, {
  ticker: "SDXAY",
  name: "Sodexo",
  full: "Sodexo S.A.",
  sector: "food",
  price: 10.90,
  change: -0.18
}, {
  ticker: "ARMK",
  name: "Aramark",
  full: "Aramark Holdings Corp.",
  sector: "food",
  price: 31.60,
  change: 0.44
},
// —  TURKISH FOOD SECTOR (BIST & Private) —
{
  ticker: "ULKER",
  name: "Yeardiz/Countriesr",
  full: "Yeardiz Holding (Countriesr)",
  sector: "food",
  price: 6.20,
  change: 1.35,
  isPrivate: true
}, {
  ticker: "AGHOL",
  name: "Anadolu Gr.",
  full: "Anadolu Group Holding",
  sector: "food",
  price: 8.40,
  change: 0.88
}, {
  ticker: "ETIGD",
  name: "Eti Food",
  full: "Eti Food Industry ve Ticaret",
  sector: "food",
  price: 4.80,
  change: 0.65,
  isPrivate: true
}, {
  ticker: "TORKU",
  name: "Torku",
  full: "Konya Seker / Torku",
  sector: "food",
  price: 3.10,
  change: 0.42
}, {
  ticker: "SUTAS",
  name: "Sutas",
  full: "Sutas Sut Urunleri A.S.",
  sector: "food",
  price: 2.90,
  change: 0.78,
  isPrivate: true
}, {
  ticker: "PNSUT",
  name: "Pinar",
  full: "Yasar Holding / Pinar",
  sector: "food",
  price: 3.60,
  change: 1.10
}, {
  ticker: "ULUUN",
  name: "Ulusoy Un",
  full: "Ulusoy Un Industryi A.S.",
  sector: "food",
  price: 1.80,
  change: 0.55
}, {
  ticker: "BANVT",
  name: "Banvit",
  full: "Banvit Bandirma Vitaminli Yem",
  sector: "food",
  price: 2.40,
  change: 0.33
}, {
  ticker: "DOGCAY",
  name: "Dogus Cay",
  full: "Dogus Cay ve Food Group",
  sector: "food",
  price: 3.20,
  change: 0.70,
  isPrivate: true
}, {
  ticker: "SOLEN",
  name: "Solen",
  full: "Solen Cikolata Food Industry",
  sector: "food",
  price: 2.10,
  change: 0.48,
  isPrivate: true
}, {
  ticker: "TATGD",
  name: "Tat Food",
  full: "Tat Food Industry A.S.",
  sector: "food",
  price: 1.92,
  change: -0.30
}, {
  ticker: "TRBSA",
  name: "Trakya Bir.",
  full: "Trakya Birlik Yagli Tohumlar",
  sector: "food",
  price: 1.65,
  change: 0.22
}, {
  ticker: "ABAL",
  name: "Abalioglu",
  full: "Abalioglu Yag ve Sabun Industry",
  sector: "food",
  price: 1.48,
  change: 0.18
}, {
  ticker: "NAMET",
  name: "Namet",
  full: "Namet Food Industry ve Tic. A.S.",
  sector: "food",
  price: 2.30,
  change: 0.60,
  isPrivate: true
}, {
  ticker: "HSTVK",
  name: "Hastavuk",
  full: "Hastavuk Tavukculuk",
  sector: "food",
  price: 1.75,
  change: 0.40,
  isPrivate: true
}, {
  ticker: "SARKY",
  name: "Saray Bisk.",
  full: "Saray Biskuvi ve Food Industry",
  sector: "food",
  price: 1.55,
  change: 0.28
}, {
  ticker: "KSKNG",
  name: "Keskinoglu",
  full: "Keskinoglu Tavukculuk",
  sector: "food",
  price: 2.05,
  change: 0.52,
  isPrivate: true
}, {
  ticker: "ERISUN",
  name: "Eris Un",
  full: "Eris Un Industry ve Ticaret",
  sector: "food",
  price: 1.40,
  change: 0.15,
  isPrivate: true
}, {
  ticker: "BUNGTR",
  name: "Bunge Food",
  full: "Bunge Food (Bunge Global TR)",
  sector: "food",
  price: 2.60,
  change: 0.38,
  isPrivate: true
}, {
  ticker: "TABGD",
  name: "TAB Food",
  full: "TAB Food (Burger King TR op.)",
  sector: "food",
  price: 4.10,
  change: 0.95,
  isPrivate: true
},
// —  TURKISH COOPERATIVES & PUBLIC ORGANIZATIONS —
{
  ticker: "TARIS",
  name: "Taris",
  full: "Taris Zeytin ve Incir Co-op",
  sector: "food",
  price: 1.85,
  change: 0.32,
  isPrivate: true
}, {
  ticker: "CAYKR",
  name: "Caykur",
  full: "Caykur (Cay Operations Kur.)",
  sector: "food",
  price: 2.20,
  change: 0.28,
  isPrivate: true
}, {
  ticker: "MRMRB",
  name: "Marmarabirlik",
  full: "Marmarabirlik Zeytin Co-op",
  sector: "food",
  price: 1.60,
  change: 0.44,
  isPrivate: true
}, {
  ticker: "FISKO",
  name: "Fiskobirlik",
  full: "Fiskobirlik Findik Co-op",
  sector: "food",
  price: 1.95,
  change: 0.58,
  isPrivate: true
}, {
  ticker: "GULBR",
  name: "Gulbirlik",
  full: "Gulbirlik Gul & Gulyagi Co-op",
  sector: "food",
  price: 1.30,
  change: 0.22,
  isPrivate: true
}, {
  ticker: "KYSRSK",
  name: "Kayseri Sek.",
  full: "Kayseri Seker Fabrikasi A.S.",
  sector: "food",
  price: 2.45,
  change: 0.36
}, {
  ticker: "PANKB",
  name: "Pankobirlik",
  full: "Pankobirlik Seker Pancari Co-op",
  sector: "food",
  price: 1.75,
  change: 0.18,
  isPrivate: true
}, {
  ticker: "AOC",
  name: "AOC",
  full: "Ataturk Orman Ciftligi",
  sector: "food",
  price: 1.00,
  change: 0.00,
  isPrivate: true
}, {
  ticker: "ESK",
  name: "Et ve Sut K.",
  full: "Et ve Sut Institution (ESK)",
  sector: "food",
  price: 1.20,
  change: 0.05,
  isPrivate: true
}, {
  ticker: "TARKR",
  name: "Tarim Kredi",
  full: "Tarim Kredi Cooperatives",
  sector: "food",
  price: 1.40,
  change: 0.12,
  isPrivate: true
}, {
  ticker: "ANTBR",
  name: "Antbirlik",
  full: "Antbirlik Narenciye Co-op",
  sector: "food",
  price: 1.55,
  change: 0.30,
  isPrivate: true
},
// ══════════════════════════════════════
// ──  AEROSPACE (Airline + Producer) ──
// ══════════════════════════════════════

// — TICARI HAVAYOLLARI / AMERICA —
{
  ticker: "DAL",
  name: "Delta",
  full: "Delta Air Lines Inc.",
  sector: "aerospace",
  price: 48.20,
  change: 1.14
}, {
  ticker: "UAL",
  name: "United",
  full: "United Airlines Holdings",
  sector: "aerospace",
  price: 82.40,
  change: 0.78
}, {
  ticker: "AAL",
  name: "American",
  full: "American Airlines Group",
  sector: "aerospace",
  price: 12.60,
  change: -0.92
}, {
  ticker: "LUV",
  name: "Southwest",
  full: "Southwest Airlines Co.",
  sector: "aerospace",
  price: 28.40,
  change: 0.35
},
// — TICARI HAVAYOLLARI / EUROPE —
{
  ticker: "DLAKY",
  name: "Lufthansa",
  full: "Lufthansa Group",
  sector: "aerospace",
  price: 8.20,
  change: 0.52
}, {
  ticker: "AFKL",
  name: "Air France",
  full: "Air France-KLM Group",
  sector: "aerospace",
  price: 9.10,
  change: -0.33
}, {
  ticker: "ICAGY",
  name: "IAG",
  full: "IAG (British Airways & Iberia)",
  sector: "aerospace",
  price: 3.80,
  change: 0.67
}, {
  ticker: "RYAAY",
  name: "Ryanair",
  full: "Ryanair Holdings PLC",
  sector: "aerospace",
  price: 148.20,
  change: 1.22
},
// — COMMERCIAL AIRLINES / MIDDLE EAST & ASIA —
{
  ticker: "EMIRA",
  name: "Emirates",
  full: "Emirates Group",
  sector: "aerospace",
  price: 34.80,
  change: 0.90,
  isPrivate: true
}, {
  ticker: "THYAO",
  name: "Turkish H.Y.",
  full: "Turkish Hava Yollari A.O.",
  sector: "aerospace",
  price: 8.60,
  change: 1.45
}, {
  ticker: "QATAW",
  name: "Qatar A/W",
  full: "Qatar Airways",
  sector: "aerospace",
  price: 22.40,
  change: 0.44,
  isPrivate: true
}, {
  ticker: "CJNSY",
  name: "China South.",
  full: "China Southern Airlines",
  sector: "aerospace",
  price: 5.20,
  change: -0.28
}, {
  ticker: "AICHY",
  name: "Air China",
  full: "Air China Limited",
  sector: "aerospace",
  price: 5.80,
  change: 0.18
}, {
  ticker: "CHEAY",
  name: "China East.",
  full: "China Eastern Airlines",
  sector: "aerospace",
  price: 4.90,
  change: -0.15
}, {
  ticker: "LTM",
  name: "LATAM",
  full: "LATAM Airlines Group S.A.",
  sector: "aerospace",
  price: 9.40,
  change: 0.62
}, {
  ticker: "ALNPY",
  name: "ANA",
  full: "ANA Holdings (All Nippon A/W)",
  sector: "aerospace",
  price: 10.20,
  change: 0.30
}, {
  ticker: "SINGY",
  name: "Singapore A.",
  full: "Singapore Airlines Ltd.",
  sector: "aerospace",
  price: 14.60,
  change: 0.48
}, {
  ticker: "CPCAY",
  name: "Cathay Pac.",
  full: "Cathay Pacific Airways",
  sector: "aerospace",
  price: 8.90,
  change: 0.22
}, {
  ticker: "INDIG",
  name: "IndiGo",
  full: "InterGlobe Aviation (IndiGo)",
  sector: "aerospace",
  price: 28.40,
  change: 1.35
}, {
  ticker: "QUBSF",
  name: "Qantas",
  full: "Qantas Airways Limited",
  sector: "aerospace",
  price: 5.10,
  change: 0.44
},
// — UCAK & MOTOR PRODUCERSI —
{
  ticker: "EADSY2",
  name: "Airbus Tic.",
  full: "Airbus SE (Commercial Aircraft)",
  sector: "aerospace",
  price: 188.60,
  change: 0.82
}, {
  ticker: "BA2",
  name: "Boeing Tic.",
  full: "Boeing (Commercial Aircraft)",
  sector: "aerospace",
  price: 174.60,
  change: 1.05
}, {
  ticker: "ERBR",
  name: "Embraer",
  full: "Embraer S.A.",
  sector: "aerospace",
  price: 26.40,
  change: 1.28
}, {
  ticker: "BDRBF",
  name: "Bombardier",
  full: "Bombardier Inc.",
  sector: "aerospace",
  price: 96.20,
  change: 0.65
}, {
  ticker: "COMAC",
  name: "COMAC",
  full: "COMAC C919 (China)",
  sector: "aerospace",
  price: 18.00,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "TXT",
  name: "Textron Av.",
  full: "Textron Aviation (Cessna & Beech)",
  sector: "aerospace",
  price: 82.40,
  change: 0.40
}, {
  ticker: "GLFST",
  name: "Gulfstream",
  full: "Gulfstream Aerospace",
  sector: "aerospace",
  price: 282.60,
  change: 0.38,
  isPrivate: true
}, {
  ticker: "PILTS",
  name: "Pilatus",
  full: "Pilatus Aircraft Ltd.",
  sector: "aerospace",
  price: 36.80,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "DFLCN",
  name: "Dassault Fal.",
  full: "Dassault Falcon Jet",
  sector: "aerospace",
  price: 248.40,
  change: 0.42,
  isPrivate: true
}, {
  ticker: "GEAD",
  name: "GE Aerospace",
  full: "GE Aerospace (Engine)",
  sector: "aerospace",
  price: 222.40,
  change: 1.10
}, {
  ticker: "SAFRY2",
  name: "Safran Eng.",
  full: "Safran S.A. (Motor / CFM56)",
  sector: "aerospace",
  price: 240.80,
  change: 0.92
}, {
  ticker: "RYCEY2",
  name: "Rolls-Royce",
  full: "Rolls-Royce Holdings (Motor)",
  sector: "aerospace",
  price: 7.80,
  change: 1.20
}, {
  ticker: "PRTWY",
  name: "Pratt & Wh.",
  full: "Pratt & Whitney (RTX Group)",
  sector: "aerospace",
  price: 134.20,
  change: 0.68,
  isPrivate: true
},
// — UZAY / NEW SPACE —
{
  ticker: "SPACEX3",
  name: "SpaceX",
  full: "SpaceX (Starlink & Starship)",
  sector: "aerospace",
  price: 210.00,
  change: 3.50,
  isPrivate: true
}, {
  ticker: "BORIGN",
  name: "Blue Origin",
  full: "Blue Origin LLC (Jeff Bezos)",
  sector: "aerospace",
  price: 42.00,
  change: 1.80,
  isPrivate: true
},
// ══════════════════════════════════
// ──  DEFENSE (Global Defense) ──
// ══════════════════════════════════

// — AMERICA —
{
  ticker: "BA",
  name: "Boeing Def.",
  full: "Boeing Defense, Space & Security",
  sector: "defense",
  price: 174.60,
  change: 1.05
}, {
  ticker: "LMT",
  name: "Lockheed",
  full: "Lockheed Martin Corp.",
  sector: "defense",
  price: 476.30,
  change: 0.67
}, {
  ticker: "RTX",
  name: "RTX / Ray.",
  full: "RTX Corp. (Raytheon & P&W)",
  sector: "defense",
  price: 134.20,
  change: 0.78
}, {
  ticker: "NOC",
  name: "Northrop",
  full: "Northrop Grumman Corp.",
  sector: "defense",
  price: 498.40,
  change: 0.55
}, {
  ticker: "GD",
  name: "Gen. Dynam.",
  full: "General Dynamics Corp.",
  sector: "defense",
  price: 282.60,
  change: 0.38
}, {
  ticker: "LHX",
  name: "L3Harris",
  full: "L3Harris Technologies Inc.",
  sector: "defense",
  price: 210.80,
  change: 0.72
}, {
  ticker: "HII",
  name: "Hunt. Ingalls",
  full: "Huntington Ingalls Industries",
  sector: "defense",
  price: 238.40,
  change: 0.44
}, {
  ticker: "LDOS",
  name: "Leidos",
  full: "Leidos Holdings Inc.",
  sector: "defense",
  price: 154.60,
  change: 0.88
}, {
  ticker: "BAH",
  name: "Booz Allen",
  full: "Booz Allen Hamilton Holding",
  sector: "defense",
  price: 148.20,
  change: 0.60
}, {
  ticker: "AVAV",
  name: "AeroVironment",
  full: "AeroVironment Inc.",
  sector: "defense",
  price: 178.40,
  change: 1.95
}, {
  ticker: "KTOS",
  name: "Kratos Def.",
  full: "Kratos Defense & Security",
  sector: "defense",
  price: 24.80,
  change: 2.15
}, {
  ticker: "CW",
  name: "Curtiss-Wright",
  full: "Curtiss-Wright Corporation",
  sector: "defense",
  price: 288.60,
  change: 0.72
}, {
  ticker: "TXT",
  name: "Textron Def.",
  full: "Textron Inc. (Defense & Aviation)",
  sector: "defense",
  price: 82.40,
  change: 0.40
}, {
  ticker: "PSN",
  name: "Parsons",
  full: "Parsons Corporation",
  sector: "defense",
  price: 82.10,
  change: 1.10
}, {
  ticker: "ANDR",
  name: "Anduril",
  full: "Anduril Industries",
  sector: "defense",
  price: 28.50,
  change: 3.40,
  isPrivate: true
},
// — EUROPE —
{
  ticker: "EADSY",
  name: "Airbus Def.",
  full: "Airbus Defence and Space",
  sector: "defense",
  price: 188.60,
  change: 0.82
}, {
  ticker: "BAESY",
  name: "BAE Systems",
  full: "BAE Systems PLC",
  sector: "defense",
  price: 16.40,
  change: 0.55
}, {
  ticker: "DASTY2",
  name: "Dassault Av.",
  full: "Dassault Aviation SA",
  sector: "defense",
  price: 248.40,
  change: 0.44
}, {
  ticker: "FINMY",
  name: "Leonardo",
  full: "Leonardo S.p.A.",
  sector: "defense",
  price: 32.60,
  change: 0.68
}, {
  ticker: "SAABF",
  name: "Saab",
  full: "Saab Group AB",
  sector: "defense",
  price: 36.20,
  change: 1.05
}, {
  ticker: "THLEF",
  name: "Thales",
  full: "Thales Group S.A.",
  sector: "defense",
  price: 18.40,
  change: 0.30
}, {
  ticker: "RNMBY",
  name: "Rheinmetall",
  full: "Rheinmetall AG",
  sector: "defense",
  price: 212.80,
  change: 2.45
}, {
  ticker: "HENS",
  name: "Hensoldt",
  full: "Hensoldt AG",
  sector: "defense",
  price: 44.60,
  change: 1.30
}, {
  ticker: "KOGS",
  name: "Kongsberg",
  full: "Kongsberg Gruppen AS",
  sector: "defense",
  price: 94.20,
  change: 1.80
}, {
  ticker: "ISDR",
  name: "Indra",
  full: "Indra Sistemas S.A.",
  sector: "defense",
  price: 21.80,
  change: 0.55
}, {
  ticker: "MTUAY",
  name: "MTU Aero",
  full: "MTU Aero Engines AG",
  sector: "defense",
  price: 278.40,
  change: 0.88
}, {
  ticker: "RYCEY",
  name: "Rolls-Royce",
  full: "Rolls-Royce Holdings (Defense)",
  sector: "defense",
  price: 7.80,
  change: 1.20
},
// — MIDDLE EAST & ASIA —
{
  ticker: "IAI",
  name: "IAI",
  full: "Israel Aerospace Industries",
  sector: "defense",
  price: 48.60,
  change: 0.88,
  isPrivate: true
}, {
  ticker: "ESLT",
  name: "Elbit Systems",
  full: "Elbit Systems Ltd.",
  sector: "defense",
  price: 278.40,
  change: 1.15
}, {
  ticker: "HNWHA",
  name: "Hanwha Aero.",
  full: "Hanwha Aerospace Co.",
  sector: "defense",
  price: 88.40,
  change: 2.10
}, {
  ticker: "MHVYF",
  name: "Mitsubishi H.",
  full: "Mitsubishi Heavy Industries",
  sector: "defense",
  price: 14.60,
  change: 0.75
}, {
  ticker: "KWHIY",
  name: "Kawasaki H.",
  full: "Kawasaki Heavy Industries",
  sector: "defense",
  price: 34.80,
  change: 0.65
}, {
  ticker: "BEL",
  name: "Bharat Elec.",
  full: "Bharat Electronics Ltd. (BEL)",
  sector: "defense",
  price: 2.92,
  change: 1.42
}, {
  ticker: "SGGKF",
  name: "ST Eng.",
  full: "ST Engineering (Singapore)",
  sector: "defense",
  price: 2.78,
  change: 0.55
}, {
  ticker: "IRKUT",
  name: "UAC/Sukhoi",
  full: "United Aircraft Corp. (UAC/MiG)",
  sector: "defense",
  price: 4.20,
  change: -0.45,
  isPrivate: true
},
// —  TURKISH DEFENSE INDUSTRY —
{
  ticker: "TUSAS",
  name: "TUSAS",
  full: "Turkish Aviation ve Space Industry",
  sector: "defense",
  price: 12.80,
  change: 2.40,
  isPrivate: true
}, {
  ticker: "BAYKT",
  name: "Baykar",
  full: "Baykar Technology (Bayraktar TB2)",
  sector: "defense",
  price: 18.60,
  change: 3.10,
  isPrivate: true
}, {
  ticker: "ASELS",
  name: "Aselsan",
  full: "Aselsan A.S.",
  sector: "defense",
  price: 4.48,
  change: 1.65
}, {
  ticker: "OTKAR",
  name: "Otokar",
  full: "Otokar Otomotiv ve Defense Industry",
  sector: "defense",
  price: 28.20,
  change: 0.88
}, {
  ticker: "SDTUZ",
  name: "SDT Space",
  full: "SDT Space ve Defense A.S.",
  sector: "defense",
  price: 6.40,
  change: 2.20,
  isPrivate: true
}, {
  ticker: "KATMR",
  name: "Katmerciler",
  full: "Katmerciler Vehicle-Mounted Equipment",
  sector: "defense",
  price: 3.85,
  change: 1.45
}, {
  ticker: "PAPIL",
  name: "Papilon",
  full: "Papilon Defense Industry ve Tic.",
  sector: "defense",
  price: 2.60,
  change: 1.80,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  SEMICONDUCTOR ECOSYSTEM (Semiconductor Global) ──
// ══════════════════════════════════════════════════════

// —  FOUNDRY / PRODUCERS (Factory Owners) —
// Chip tasarlamaz, sadece uretir. En kritik halka.
{
  ticker: "TSM",
  name: "TSMC",
  full: "Taiwan Semiconductor Mfg. (N2/N3)",
  sector: "chip",
  price: 202.30,
  change: 1.78
}, {
  ticker: "SSNLF2",
  name: "Samsung Semi.",
  full: "Samsung Electronics (Memory+Foundry)",
  sector: "chip",
  price: 44.80,
  change: -0.62
},
// — ·  FABLESS TASARIMCILAR (Production yapmaz, tasarlar) —
// Sadece IP ve tasarim — en high marjli is modeli.
{
  ticker: "AVGO2",
  name: "Broadcom",
  full: "Broadcom Inc. (Network · RF · DSP)",
  sector: "chip",
  price: 248.60,
  change: 1.87
}, {
  ticker: "AMD3",
  name: "AMD",
  full: "AMD (CPU · GPU · EPYC Server)",
  sector: "chip",
  price: 142.50,
  change: 1.93
}, {
  ticker: "QCOM",
  name: "Qualcomm",
  full: "Qualcomm (Snapdragon · 5G Modem)",
  sector: "chip",
  price: 162.40,
  change: 0.88
}, {
  ticker: "ARM",
  name: "Arm Holdings",
  full: "Arm Holdings PLC (CPU Mimarisi)",
  sector: "chip",
  price: 98.60,
  change: 2.44
}, {
  ticker: "MRVL",
  name: "Marvell Tech.",
  full: "Marvell Technology (Data Infra.)",
  sector: "chip",
  price: 72.40,
  change: 1.55
}, {
  ticker: "MTKY",
  name: "MediaTek",
  full: "MediaTek Inc. (Mobil SoC)",
  sector: "chip",
  price: 28.60,
  change: 1.20
},
// —  EDA SOFTWARE (Chip Design Tools) —
// Chip tasarlanmadan once bu yazilimlar olmak zorunda.
// Oligopoly market - only 2 dominant players.
{
  ticker: "CDNS",
  name: "Cadence",
  full: "Cadence Design Systems (Virtuoso)",
  sector: "chip",
  price: 298.40,
  change: 0.75
}, {
  ticker: "SNPS",
  name: "Synopsys",
  full: "Synopsys Inc. (Design Compiler)",
  sector: "chip",
  price: 488.20,
  change: 0.62
},
// — ⚙️ EKIPMAN PRODUCERSI (Chip Fabrikasinin Aletleri) —
// Chip factories use these companies’ machines.
// ASML = tek EUV litografi kaynagi → global tekel.
{
  ticker: "ASML",
  name: "ASML",
  full: "ASML Holding (EUV Litografi)",
  sector: "chip",
  price: 742.50,
  change: 1.12
}, {
  ticker: "AMAT",
  name: "Appl. Materials",
  full: "Applied Materials (CVD · PVD · Etch)",
  sector: "chip",
  price: 198.60,
  change: 1.34
}, {
  ticker: "LRCX",
  name: "Lam Research",
  full: "Lam Research (Etch · Deposition)",
  sector: "chip",
  price: 982.40,
  change: 1.05
}, {
  ticker: "KLAC",
  name: "KLA Corp.",
  full: "KLA Corporation (Muayene Sistemleri)",
  sector: "chip",
  price: 888.20,
  change: 0.92
}, {
  ticker: "TOELY",
  name: "Tokyo Electron",
  full: "Tokyo Electron Ltd. (TEL)",
  sector: "chip",
  price: 148.60,
  change: 0.78
}, {
  ticker: "LSRCY",
  name: "Lasertec",
  full: "Lasertec Corp. (EUV Maske Muayene)",
  sector: "chip",
  price: 92.40,
  change: 1.45
}, {
  ticker: "ENTG",
  name: "Entegris",
  full: "Entegris Inc. (Chemical Materials)",
  sector: "chip",
  price: 98.20,
  change: 0.88
},
// —  TEST & MEASUREMENT EQUIPMENT —
// Uretilen cipin test edilmesi — kalite kontrol halkasi.
{
  ticker: "AEIS2",
  name: "Advantest",
  full: "Advantest Corp. (SoC Test Sistemleri)",
  sector: "chip",
  price: 62.40,
  change: 1.88
}, {
  ticker: "TER",
  name: "Teradyne",
  full: "Teradyne Inc. (Automated Test Equipment)",
  sector: "chip",
  price: 118.80,
  change: 0.55
},
// —  MEMORY / STORAGE (Memory & Storage) —
// En dongusel alt sector — arz/talep dengesi fiyati ucurur.
{
  ticker: "MU",
  name: "Micron",
  full: "Micron Technology (DRAM · NAND)",
  sector: "chip",
  price: 98.40,
  change: 1.42
}, {
  ticker: "HXSCL",
  name: "SK Hynix",
  full: "SK Hynix (HBM · DRAM · NAND)",
  sector: "chip",
  price: 38.20,
  change: 2.10
}, {
  ticker: "WDC",
  name: "Western Dig.",
  full: "Western Digital (NAND · HDD)",
  sector: "chip",
  price: 48.60,
  change: -0.88
}, {
  ticker: "KIOXIA",
  name: "Kioxia",
  full: "Kioxia Holdings (NAND Flash)",
  sector: "chip",
  price: 18.40,
  change: 1.20,
  isPrivate: true
},
// —  ANALOG & MIXED SIGNAL (Power + Sensor + Otomotiv) —
// Digital cipler kadar goz alici degil ama her yerde var.
// Privatelikle EV, IoT, endustri icin kritik.
{
  ticker: "TXN",
  name: "Texas Instr.",
  full: "Texas Instruments (Analog · Embedded)",
  sector: "chip",
  price: 188.40,
  change: 0.44
}, {
  ticker: "ADI",
  name: "Analog Devices",
  full: "Analog Devices Inc. (ADC · DAC · RF)",
  sector: "chip",
  price: 218.60,
  change: 0.62
}, {
  ticker: "MCHP",
  name: "Microchip Tech.",
  full: "Microchip Technology (MCU · FPGA)",
  sector: "chip",
  price: 62.80,
  change: -0.55
}, {
  ticker: "IFNNY",
  name: "Infineon",
  full: "Infineon Technologies (SiC · IGBT)",
  sector: "chip",
  price: 38.40,
  change: 0.78
}, {
  ticker: "NXPI",
  name: "NXP Semi.",
  full: "NXP Semiconductors (Otomotiv · IoT)",
  sector: "chip",
  price: 208.40,
  change: 0.55
}, {
  ticker: "STM",
  name: "STMicro.",
  full: "STMicroelectronics N.V.",
  sector: "chip",
  price: 28.60,
  change: -0.42
}, {
  ticker: "ON",
  name: "Onsemi",
  full: "Onsemi (SiC · IGBT · Power Electronics)",
  sector: "chip",
  price: 42.80,
  change: 1.15
}, {
  ticker: "RNEZY",
  name: "Renesas",
  full: "Renesas Electronics (MCU · SoC)",
  sector: "chip",
  price: 22.40,
  change: 0.38
}, {
  ticker: "WOLF",
  name: "Wolfspeed",
  full: "Wolfspeed Inc. (SiC Wide Bandgap)",
  sector: "chip",
  price: 8.20,
  change: -2.40
},
// ══════════════════════════════════════════════════════
// ──  FINANCE ECOSYSTEM (Banking · Asset Mgmt · Payments · Insurance) ──
// ══════════════════════════════════════════════════════

// —  GLOBAL BANKING / AMERICA —
{
  ticker: "JPM",
  name: "JPMorgan",
  full: "JPMorgan Chase & Co.",
  sector: "finance",
  price: 238.40,
  change: 0.72
}, {
  ticker: "BAC",
  name: "Bank of Am.",
  full: "Bank of America Corp.",
  sector: "finance",
  price: 42.80,
  change: 0.55
}, {
  ticker: "WFC",
  name: "Wells Fargo",
  full: "Wells Fargo & Company",
  sector: "finance",
  price: 72.40,
  change: 0.38
}, {
  ticker: "C",
  name: "Citigroup",
  full: "Citigroup Inc.",
  sector: "finance",
  price: 68.20,
  change: -0.44
},
// —  GLOBAL BANKING / EUROPE —
{
  ticker: "HSBC",
  name: "HSBC",
  full: "HSBC Holdings PLC",
  sector: "finance",
  price: 48.60,
  change: 0.62
}, {
  ticker: "BNPQY",
  name: "BNP Paribas",
  full: "BNP Paribas S.A.",
  sector: "finance",
  price: 34.80,
  change: 0.28
}, {
  ticker: "SAN",
  name: "Santander",
  full: "Banco Santander S.A.",
  sector: "finance",
  price: 5.92,
  change: 0.88
}, {
  ticker: "UBSG",
  name: "UBS Group",
  full: "UBS Group AG",
  sector: "finance",
  price: 28.40,
  change: 0.44
}, {
  ticker: "RY",
  name: "RBC",
  full: "Royal Bank of Canada",
  sector: "finance",
  price: 122.40,
  change: 0.35
},
// —  GLOBAL BANKING / ASIA —
{
  ticker: "IDCBY",
  name: "ICBC",
  full: "ICBC (Ind. & Commercial Bank China)",
  sector: "finance",
  price: 9.20,
  change: 0.30
}, {
  ticker: "CICHY",
  name: "CCB",
  full: "China Construction Bank Corp.",
  sector: "finance",
  price: 7.80,
  change: 0.22
}, {
  ticker: "ACGBY",
  name: "Agri. Bank",
  full: "Agricultural Bank of China",
  sector: "finance",
  price: 6.40,
  change: 0.18
}, {
  ticker: "BACHF",
  name: "Bank of China",
  full: "Bank of China Limited",
  sector: "finance",
  price: 5.10,
  change: 0.15
}, {
  ticker: "MUFGY",
  name: "MUFG",
  full: "Mitsubishi UFJ Financial Group",
  sector: "finance",
  price: 11.80,
  change: 0.42
},
// —  INVESTMENT BANKING —
{
  ticker: "GS",
  name: "Goldman Sachs",
  full: "The Goldman Sachs Group Inc.",
  sector: "finance",
  price: 582.40,
  change: 0.95
}, {
  ticker: "MS",
  name: "Morgan Stanley",
  full: "Morgan Stanley",
  sector: "finance",
  price: 98.60,
  change: 0.68
},
// —  ASSET MANAGEMENT (Asset Management) —
{
  ticker: "BRK.B",
  name: "Berkshire",
  full: "Berkshire Hathaway Inc.",
  sector: "finance",
  price: 472.80,
  change: 0.12
}, {
  ticker: "BLK",
  name: "BlackRock",
  full: "BlackRock Inc. (iShares · Aladdin)",
  sector: "finance",
  price: 982.40,
  change: 0.88
}, {
  ticker: "STT",
  name: "State Street",
  full: "State Street Corporation (SSGA)",
  sector: "finance",
  price: 88.40,
  change: 0.44
}, {
  ticker: "NTRS",
  name: "Northern Trust",
  full: "Northern Trust Corporation",
  sector: "finance",
  price: 98.20,
  change: 0.30
}, {
  ticker: "BK",
  name: "BNY Mellon",
  full: "Bank of New York Mellon Corp.",
  sector: "finance",
  price: 72.80,
  change: 0.55
}, {
  ticker: "BEN",
  name: "Franklin Tem.",
  full: "Franklin Templeton (Franklin Res.)",
  sector: "finance",
  price: 22.40,
  change: -0.28
}, {
  ticker: "IVZ",
  name: "Invesco",
  full: "Invesco Ltd.",
  sector: "finance",
  price: 14.80,
  change: -0.44
}, {
  ticker: "TROW",
  name: "T. Rowe Price",
  full: "T. Rowe Price Group Inc.",
  sector: "finance",
  price: 112.40,
  change: 0.38
},
// —  PRIVATE EQUITY (Private Equity) —
{
  ticker: "BX",
  name: "Blackstone",
  full: "Blackstone Group Inc.",
  sector: "finance",
  price: 148.60,
  change: 1.22
}, {
  ticker: "KKR",
  name: "KKR & Co.",
  full: "KKR & Co. Inc.",
  sector: "finance",
  price: 128.40,
  change: 1.45
}, {
  ticker: "BAM",
  name: "Brookfield",
  full: "Brookfield Asset Management",
  sector: "finance",
  price: 52.80,
  change: 0.78
},
// —  PAYMENT SYSTEMS & FINTECH —
{
  ticker: "V",
  name: "Visa",
  full: "Visa Inc.",
  sector: "finance",
  price: 338.40,
  change: 0.55
}, {
  ticker: "MA",
  name: "Mastercard",
  full: "Mastercard Incorporated",
  sector: "finance",
  price: 548.60,
  change: 0.72
}, {
  ticker: "AXP",
  name: "Amex",
  full: "American Express Company",
  sector: "finance",
  price: 282.40,
  change: 0.44
}, {
  ticker: "PYPL",
  name: "PayPal",
  full: "PayPal Holdings Inc.",
  sector: "finance",
  price: 68.20,
  change: -0.55
}, {
  ticker: "FISV",
  name: "Fiserv",
  full: "Fiserv Inc.",
  sector: "finance",
  price: 188.40,
  change: 0.62
}, {
  ticker: "FIS",
  name: "FIS",
  full: "Fidelity National Info. Services",
  sector: "finance",
  price: 78.40,
  change: 0.35
}, {
  ticker: "ADYEN",
  name: "Adyen",
  full: "Adyen N.V.",
  sector: "finance",
  price: 188.20,
  change: 1.05
},
// —  FINANCIAL DATA & ANALYTICS —
{
  ticker: "SPGI",
  name: "S&P Global",
  full: "S&P Global Inc.",
  sector: "finance",
  price: 488.40,
  change: 0.68
}, {
  ticker: "MCO",
  name: "Moody's",
  full: "Moody's Corporation",
  sector: "finance",
  price: 488.80,
  change: 0.72
},
// —  INSURANCE —
{
  ticker: "ALV",
  name: "Allianz",
  full: "Allianz SE",
  sector: "finance",
  price: 312.40,
  change: 0.44
}, {
  ticker: "AXAHY",
  name: "AXA",
  full: "AXA S.A.",
  sector: "finance",
  price: 38.80,
  change: 0.28
}, {
  ticker: "PNGAY",
  name: "Ping An",
  full: "Ping An Insurance Group (China)",
  sector: "finance",
  price: 22.40,
  change: 0.55
}, {
  ticker: "CB",
  name: "Chubb",
  full: "Chubb Limited",
  sector: "finance",
  price: 282.40,
  change: 0.38
}, {
  ticker: "MET",
  name: "MetLife",
  full: "MetLife Inc.",
  sector: "finance",
  price: 72.80,
  change: 0.22
}, {
  ticker: "PRU",
  name: "Prudential",
  full: "Prudential Financial Inc.",
  sector: "finance",
  price: 98.40,
  change: 0.18
}, {
  ticker: "MMC",
  name: "Marsh & McL.",
  full: "Marsh & McLennan Companies",
  sector: "finance",
  price: 232.40,
  change: 0.55
}, {
  ticker: "MURGY",
  name: "Munich Re",
  full: "Munich Re (Munchener Ruck AG)",
  sector: "finance",
  price: 542.80,
  change: 0.62
},
// ══════════════════════════════════════
// ── OTOMOTIV SECTOR (GLOBAL) ──
// ══════════════════════════════════════

// — AMERICA —
{
  ticker: "TSLA",
  name: "Tesla",
  full: "Tesla Inc.",
  sector: "auto",
  price: 342.15,
  change: -1.87
}, {
  ticker: "GM",
  name: "Gen. Motors",
  full: "General Motors Co.",
  sector: "auto",
  price: 47.30,
  change: 0.54
}, {
  ticker: "F",
  name: "Ford",
  full: "Ford Motor Company",
  sector: "auto",
  price: 10.80,
  change: -0.92
}, {
  ticker: "RIVN",
  name: "Rivian",
  full: "Rivian Automotive",
  sector: "auto",
  price: 12.40,
  change: 2.11
}, {
  ticker: "FFIE",
  name: "Faraday Fut.",
  full: "Faraday Future EV",
  sector: "auto",
  price: 0.48,
  change: -4.30
}, {
  ticker: "RIDE",
  name: "Lordstown",
  full: "Lordstown Motors (delist)",
  sector: "auto",
  price: 0.12,
  change: -1.50,
  isPrivate: true
}, {
  ticker: "CADDY",
  name: "Cadillac",
  full: "Cadillac (GM Group)",
  sector: "auto",
  price: 52.10,
  change: 0.60,
  isPrivate: true
}, {
  ticker: "CHEVY",
  name: "Chevrolet",
  full: "Chevrolet (GM Group)",
  sector: "auto",
  price: 47.30,
  change: 0.54,
  isPrivate: true
}, {
  ticker: "GMC",
  name: "GMC",
  full: "GMC (GM Group)",
  sector: "auto",
  price: 47.30,
  change: 0.48,
  isPrivate: true
}, {
  ticker: "LINC",
  name: "Lincoln",
  full: "Lincoln (Ford Group)",
  sector: "auto",
  price: 10.80,
  change: -0.80,
  isPrivate: true
}, {
  ticker: "JEEP",
  name: "Jeep",
  full: "Jeep (Stellantis Group)",
  sector: "auto",
  price: 14.20,
  change: -1.10,
  isPrivate: true
},
// — EUROPE —
{
  ticker: "BMWYY",
  name: "BMW",
  full: "BMW Group",
  sector: "auto",
  price: 29.40,
  change: 0.33
}, {
  ticker: "MBGYY",
  name: "Mercedes",
  full: "Mercedes-Benz Group",
  sector: "auto",
  price: 12.80,
  change: -0.67
}, {
  ticker: "VWAGY",
  name: "Volkswagen",
  full: "Volkswagen AG",
  sector: "auto",
  price: 9.90,
  change: -1.23
}, {
  ticker: "RACE",
  name: "Ferrari",
  full: "Ferrari N.V.",
  sector: "auto",
  price: 422.60,
  change: 1.45
}, {
  ticker: "DRPRY",
  name: "Porsche",
  full: "Porsche AG",
  sector: "auto",
  price: 11.50,
  change: -0.42
}, {
  ticker: "RNLSY",
  name: "Renault",
  full: "Renault Group",
  sector: "auto",
  price: 12.10,
  change: 0.78
}, {
  ticker: "VLVLY",
  name: "Volvo",
  full: "Volvo Car AB",
  sector: "auto",
  price: 19.30,
  change: -0.55
}, {
  ticker: "ARGGY",
  name: "Aston Martin",
  full: "Aston Martin Lagonda",
  sector: "auto",
  price: 4.80,
  change: -2.10
}, {
  ticker: "AUDI",
  name: "Audi",
  full: "Audi AG (VW Group)",
  sector: "auto",
  price: 9.90,
  change: -1.15,
  isPrivate: true
}, {
  ticker: "LAMBO",
  name: "Lamborghini",
  full: "Lamborghini (VW/Audi)",
  sector: "auto",
  price: 9.90,
  change: -0.90,
  isPrivate: true
}, {
  ticker: "BENT",
  name: "Bentley",
  full: "Bentley (VW Group)",
  sector: "auto",
  price: 9.90,
  change: -0.75,
  isPrivate: true
}, {
  ticker: "RR",
  name: "Rolls Royce",
  full: "Rolls-Royce (BMW Group)",
  sector: "auto",
  price: 29.40,
  change: 0.28,
  isPrivate: true
}, {
  ticker: "OPEL",
  name: "Opel",
  full: "Opel (Stellantis Group)",
  sector: "auto",
  price: 14.20,
  change: -0.90,
  isPrivate: true
}, {
  ticker: "PEUG",
  name: "Peugeot",
  full: "Peugeot (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -1.05,
  isPrivate: true
}, {
  ticker: "CITR",
  name: "CitroÏ«n",
  full: "CitroÏ«n (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -0.88,
  isPrivate: true
}, {
  ticker: "FIAT",
  name: "Fiat",
  full: "Fiat (Stellantis Group)",
  sector: "auto",
  price: 14.20,
  change: -1.20,
  isPrivate: true
}, {
  ticker: "ALFA",
  name: "Alfa Romeo",
  full: "Alfa Romeo (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -0.65,
  isPrivate: true
}, {
  ticker: "MASR",
  name: "Maserati",
  full: "Maserati (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -1.80,
  isPrivate: true
}, {
  ticker: "LANC",
  name: "Lancia",
  full: "Lancia (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -0.40,
  isPrivate: true
}, {
  ticker: "SKOD",
  name: "Skoda",
  full: "Skoda Auto (VW Group)",
  sector: "auto",
  price: 9.90,
  change: -0.50,
  isPrivate: true
}, {
  ticker: "CUPR",
  name: "Cupra",
  full: "Cupra (VW/SEAT)",
  sector: "auto",
  price: 9.90,
  change: 0.30,
  isPrivate: true
}, {
  ticker: "DACI",
  name: "Dacia",
  full: "Dacia (Renault Group)",
  sector: "auto",
  price: 12.10,
  change: 0.60,
  isPrivate: true
}, {
  ticker: "BUGA",
  name: "Bugatti",
  full: "Bugatti (Rimac-Porsche)",
  sector: "auto",
  price: 11.50,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "KOEN",
  name: "Koenigsegg",
  full: "Koenigsegg Automotive",
  sector: "auto",
  price: 38.00,
  change: 1.10,
  isPrivate: true
}, {
  ticker: "PAGA",
  name: "Pagani",
  full: "Pagani Automobili",
  sector: "auto",
  price: 42.00,
  change: 0.75,
  isPrivate: true
}, {
  ticker: "MCLA",
  name: "McLaren",
  full: "McLaren Automotive",
  sector: "auto",
  price: 28.50,
  change: -0.60,
  isPrivate: true
}, {
  ticker: "LOTC",
  name: "Lotus",
  full: "Lotus Cars (Geely)",
  sector: "auto",
  price: 3.10,
  change: 0.45,
  isPrivate: true
},
// — ASIA / JAPONYA & KORE —
{
  ticker: "TM",
  name: "Toyota",
  full: "Toyota Motor Corp.",
  sector: "auto",
  price: 198.70,
  change: -0.89
}, {
  ticker: "HYMTF",
  name: "Hyundai",
  full: "Hyundai Motor Co.",
  sector: "auto",
  price: 44.80,
  change: 0.72
}, {
  ticker: "KIMTF",
  name: "Kia",
  full: "Kia Corporation",
  sector: "auto",
  price: 52.30,
  change: 0.88
}, {
  ticker: "NSANY",
  name: "Nissan",
  full: "Nissan Motor Co.",
  sector: "auto",
  price: 6.90,
  change: -1.34
}, {
  ticker: "MZDAY",
  name: "Mazda",
  full: "Mazda Motor Corp.",
  sector: "auto",
  price: 7.80,
  change: 0.21
}, {
  ticker: "FUJHY",
  name: "Subaru",
  full: "Subaru Corporation",
  sector: "auto",
  price: 14.60,
  change: -0.43
}, {
  ticker: "ISUZY",
  name: "Isuzu",
  full: "Isuzu Motors Ltd.",
  sector: "auto",
  price: 14.20,
  change: 0.35
}, {
  ticker: "MSBHY",
  name: "Mitsubishi",
  full: "Mitsubishi Motors",
  sector: "auto",
  price: 9.50,
  change: -0.67
}, {
  ticker: "GNSS",
  name: "Genesis",
  full: "Genesis (Hyundai Group)",
  sector: "auto",
  price: 44.80,
  change: 0.65,
  isPrivate: true
}, {
  ticker: "LEXS",
  name: "Lexus",
  full: "Lexus (Toyota Group)",
  sector: "auto",
  price: 198.70,
  change: -0.80,
  isPrivate: true
}, {
  ticker: "ACUR",
  name: "Acura",
  full: "Acura (Honda Group)",
  sector: "auto",
  price: 36.40,
  change: 0.30,
  isPrivate: true
}, {
  ticker: "INFI",
  name: "Infiniti",
  full: "Infiniti (Nissan/Renault)",
  sector: "auto",
  price: 6.90,
  change: -1.10,
  isPrivate: true
}, {
  ticker: "MSTU",
  name: "Maruti Suzuki",
  full: "Maruti Suzuki India",
  sector: "auto",
  price: 140.50,
  change: 0.95
}, {
  ticker: "MAHM",
  name: "Mahindra",
  full: "Mahindra & Mahindra",
  sector: "auto",
  price: 34.80,
  change: 1.42
}, {
  ticker: "JLRTY",
  name: "Land Rover",
  full: "Land Rover (Tata JLR)",
  sector: "auto",
  price: 21.40,
  change: -0.55,
  isPrivate: true
}, {
  ticker: "JGRY",
  name: "Jaguar",
  full: "Jaguar (Tata JLR)",
  sector: "auto",
  price: 21.40,
  change: -0.70,
  isPrivate: true
}, {
  ticker: "SMRT",
  name: "Smart",
  full: "Smart (Daimler+Geely JV)",
  sector: "auto",
  price: 3.10,
  change: 1.80,
  isPrivate: true
},
// — CIN & ASIA ELEKTRIKLI ──
{
  ticker: "BYDDF",
  name: "BYD",
  full: "BYD Co. Ltd.",
  sector: "auto",
  price: 36.20,
  change: 2.45
}, {
  ticker: "XIOMI",
  name: "Xiaomi",
  full: "Xiaomi Auto (EV)",
  sector: "auto",
  price: 3.20,
  change: 3.78
}, {
  ticker: "SERES",
  name: "Seres",
  full: "Seres Group (AITO)",
  sector: "auto",
  price: 18.40,
  change: 1.95
}, {
  ticker: "GELYY",
  name: "Geely",
  full: "Geely Automobile",
  sector: "auto",
  price: 3.10,
  change: 0.87
}, {
  ticker: "ZK",
  name: "Zeekr",
  full: "Zeekr (Geely Group)",
  sector: "auto",
  price: 24.80,
  change: 4.12
}, {
  ticker: "LEAP",
  name: "Leapmotor",
  full: "Leapmotor (Stellantis+)",
  sector: "auto",
  price: 8.30,
  change: 2.60
}, {
  ticker: "LCID",
  name: "Lucid Motors",
  full: "Lucid Group Inc.",
  sector: "auto",
  price: 2.48,
  change: -1.90
}, {
  ticker: "GWLLY",
  name: "GWM",
  full: "Great Wall Motor Co.",
  sector: "auto",
  price: 2.10,
  change: 1.15
}, {
  ticker: "AVTR",
  name: "Avatr",
  full: "Avatr (Changan+Huawei)",
  sector: "auto",
  price: 26.50,
  change: 3.30,
  isPrivate: true
}, {
  ticker: "IMMOT",
  name: "IM Motors",
  full: "IM Motors (SAIC+Alibaba)",
  sector: "auto",
  price: 14.80,
  change: 1.75,
  isPrivate: true
}, {
  ticker: "CHERY",
  name: "Chery",
  full: "Chery Automobile",
  sector: "auto",
  price: 22.30,
  change: 0.65,
  isPrivate: true
}, {
  ticker: "CHANG",
  name: "Changan",
  full: "Changan Automobile",
  sector: "auto",
  price: 12.60,
  change: 0.90,
  isPrivate: true
}, {
  ticker: "MGMC",
  name: "MG",
  full: "MG Morris Garages (SAIC)",
  sector: "auto",
  price: 8.90,
  change: 1.20,
  isPrivate: true
}, {
  ticker: "HAVL",
  name: "Haval",
  full: "Haval (GWM Group)",
  sector: "auto",
  price: 2.10,
  change: 1.00,
  isPrivate: true
}, {
  ticker: "TANK",
  name: "Tank",
  full: "Tank (GWM Group)",
  sector: "auto",
  price: 2.10,
  change: 1.35,
  isPrivate: true
}, {
  ticker: "ORA",
  name: "Ora",
  full: "Ora (GWM Group)",
  sector: "auto",
  price: 2.10,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "VOYA",
  name: "Voyah",
  full: "Voyah (Dongfeng Group)",
  sector: "auto",
  price: 16.40,
  change: 2.10,
  isPrivate: true
}, {
  ticker: "HQFAW",
  name: "Hongqi",
  full: "Hongqi (FAW Group)",
  sector: "auto",
  price: 18.70,
  change: 1.65,
  isPrivate: true
}, {
  ticker: "WULI",
  name: "Wuling",
  full: "Wuling (SAIC-GM-Wuling)",
  sector: "auto",
  price: 4.50,
  change: 1.40,
  isPrivate: true
}, {
  ticker: "BAOJ",
  name: "Baojun",
  full: "Baojun (SAIC-GM-Wuling)",
  sector: "auto",
  price: 4.50,
  change: 0.95,
  isPrivate: true
}, {
  ticker: "JETO",
  name: "Jetour",
  full: "Jetour (Chery Group)",
  sector: "auto",
  price: 22.30,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "JAEC",
  name: "Jaecoo",
  full: "Jaecoo (Chery Group)",
  sector: "auto",
  price: 22.30,
  change: 0.70,
  isPrivate: true
},
// — TOGG (TURKIYE) —
{
  ticker: "TOGG",
  name: "Togg",
  full: "Togg (Turkey EV)",
  sector: "auto",
  price: 8.20,
  change: 2.80,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  PRECIOUS & SEMIPRECIOUS METALS (Metals & Mining) ──
// ══════════════════════════════════════════════════════

// —  GOLD (Gold) —
{
  ticker: "NEM",
  name: "Newmont",
  full: "Newmont Corporation (Gold Miningcisi · #1 Global)",
  sector: "metals",
  price: 42.80,
  change: 1.24
}, {
  ticker: "GOLD",
  name: "Barrick Gold",
  full: "Barrick Gold Corporation (Canada · 2. Large)",
  sector: "metals",
  price: 18.20,
  change: 0.92
}, {
  ticker: "AU",
  name: "AngloGold",
  full: "AngloGold Ashanti (G. Afrika · Global Gold)",
  sector: "metals",
  price: 28.40,
  change: 1.55
}, {
  ticker: "AEM",
  name: "Agnico Eagle",
  full: "Agnico Eagle Mines (Canada · Premium Gold)",
  sector: "metals",
  price: 82.40,
  change: 0.88
}, {
  ticker: "KGC",
  name: "Kinross Gold",
  full: "Kinross Gold Corporation (Canada)",
  sector: "metals",
  price: 9.80,
  change: 1.42
}, {
  ticker: "GFI",
  name: "Gold Fields",
  full: "Gold Fields Limited (G. Afrika · Global Mining)",
  sector: "metals",
  price: 18.60,
  change: 1.18
}, {
  ticker: "EGO",
  name: "Eldorado Gold",
  full: "Eldorado Gold Corporation (Turkey & Canada)",
  sector: "metals",
  price: 15.40,
  change: 1.80
}, {
  ticker: "AUYAF",
  name: "Alamos Gold",
  full: "Alamos Gold Inc. (North America Gold Miningi)",
  sector: "metals",
  price: 18.80,
  change: 1.32
}, {
  ticker: "BTG",
  name: "B2Gold",
  full: "B2Gold Corp. (Canada · Afrika & Filipinler)",
  sector: "metals",
  price: 3.20,
  change: 2.14
},
// —  SILVER (Silver) —
{
  ticker: "WPM",
  name: "Wheaton Prec.",
  full: "Wheaton Precious Metals Corp. (Silver & Gold Stream)",
  sector: "metals",
  price: 64.20,
  change: 1.67
}, {
  ticker: "AG",
  name: "First Majestic",
  full: "First Majestic Silver Corp. (Meksika & ABD)",
  sector: "metals",
  price: 8.40,
  change: 2.80
}, {
  ticker: "PAAS",
  name: "Pan Am Silver",
  full: "Pan American Silver Corp. (Amerika'nin En Buyugu)",
  sector: "metals",
  price: 18.80,
  change: 1.44
}, {
  ticker: "SVM",
  name: "Silvercorp",
  full: "Silvercorp Metals Inc. (China Silver Miningi)",
  sector: "metals",
  price: 4.80,
  change: 1.92
}, {
  ticker: "MAG",
  name: "MAG Silver",
  full: "MAG Silver Corp. (Meksika · Juanicipio Projesi)",
  sector: "metals",
  price: 14.20,
  change: 2.10
},
// — ⚪ PLATIN & PALADIUM (Platinumum & Palladium) —
{
  ticker: "SBSW",
  name: "Sibanye S.W.",
  full: "Sibanye Stillwater (Platinum · Palladium · Gold)",
  sector: "metals",
  price: 7.20,
  change: -0.88
}, {
  ticker: "ANGPY",
  name: "Anglo Plat.",
  full: "Anglo American Platinumum (Amplats · World #1 Platinum)",
  sector: "metals",
  price: 52.40,
  change: 0.44
}, {
  ticker: "IPPLF",
  name: "Impala Plat.",
  full: "Impala Platinumum Holdings (G. Afrika · Platinum Group)",
  sector: "metals",
  price: 3.80,
  change: -0.55
}, {
  ticker: "NMPNF",
  name: "Northam Plat.",
  full: "Northam Platinumum Holdings (G. Afrika)",
  sector: "metals",
  price: 8.60,
  change: 0.32
},
// — ·  BAKIR (Copper) —
{
  ticker: "FCX",
  name: "Freeport-McM.",
  full: "Freeport-McMoRan Inc. (Copper · Gold · ABD #1)",
  sector: "metals",
  price: 44.80,
  change: 1.85
}, {
  ticker: "ANFGF",
  name: "Antofagasta",
  full: "Antofagasta PLC (Chile Copper · London Listed)",
  sector: "metals",
  price: 22.40,
  change: 0.92
}, {
  ticker: "TECK",
  name: "Teck Res.",
  full: "Teck Resources Ltd. (Copper · Chinako · Canada)",
  sector: "metals",
  price: 38.40,
  change: 1.22
}, {
  ticker: "IVN",
  name: "Ivanhoe Mines",
  full: "Ivanhoe Mines Ltd. (DRC · Kamoa-Kakula Copper)",
  sector: "metals",
  price: 14.20,
  change: 2.40
}, {
  ticker: "GLNCY",
  name: "Glencore",
  full: "Glencore PLC (Global Emtia Devi · Copper & Coal)",
  sector: "metals",
  price: 8.20,
  change: 0.68
},
// —  ZINC, NICKEL & OTHERS (Zinc, Nickel & Others) —
{
  ticker: "MBII",
  name: "Metals & Min.",
  full: "Metals & Mining (ETF Tracker) — Global Basket",
  sector: "metals",
  price: 28.40,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "NCPKF",
  name: "Norilsk Nick.",
  full: "Norilsk Nickel (Russia · World #1 Nikel & Palladium)",
  sector: "metals",
  price: 14.60,
  change: -0.42,
  isPrivate: true
}, {
  ticker: "VALE",
  name: "Vale",
  full: "Vale S.A. (Brazil · Iron Cevheri & Nikel)",
  sector: "metals",
  price: 12.40,
  change: 0.88
},
// —  LITHIUM & RARE EARTH (Lithium & Rare Earth) —
{
  ticker: "ALB",
  name: "Albemarle",
  full: "Albemarle Corporation (Lithium · ABD #1)",
  sector: "metals",
  price: 82.40,
  change: -1.44
}, {
  ticker: "SQM",
  name: "SQM",
  full: "Sociedad Química y Minera (Chile Lithium · Atacama)",
  sector: "metals",
  price: 38.60,
  change: -0.88
}, {
  ticker: "PLL",
  name: "Piedmont Li.",
  full: "Piedmont Lithium Inc. (ABD Lithium · EV Tedarik)",
  sector: "metals",
  price: 6.80,
  change: 1.92
}, {
  ticker: "LAC",
  name: "Lithium Am.",
  full: "Lithium Americas Corp. (Thacker Pass · Nevada)",
  sector: "metals",
  price: 4.20,
  change: 2.44
}, {
  ticker: "MP",
  name: "MP Materials",
  full: "MP Materials Corp. (ABD · Mountain Pass Nadir Toprak)",
  sector: "metals",
  price: 22.40,
  change: 3.12
}, {
  ticker: "LYSDY",
  name: "Lynas Rare E.",
  full: "Lynas Rare Earths Ltd. (Australia · #1 Bati Worldsi)",
  sector: "metals",
  price: 8.20,
  change: 1.68
}, {
  ticker: "UUUU",
  name: "Energy Fuels",
  full: "Energy Fuels Inc. (Uranyum & Nadir Toprak)",
  sector: "metals",
  price: 6.40,
  change: 2.88
},
// —  DIAMOND & GEMSTONE (Diamond & Gemstone) —
{
  ticker: "DEERS",
  name: "De Beers",
  full: "De Beers Group (Anglo American · Diamond #1 Global)",
  sector: "metals",
  price: 18.40,
  change: 0.22,
  isPrivate: true
}, {
  ticker: "ALRS",
  name: "ALROSA",
  full: "ALROSA (Russia · Global Ham Diamond #1 Producer)",
  sector: "metals",
  price: 12.60,
  change: -0.35,
  isPrivate: true
}, {
  ticker: "LUC",
  name: "Lucara Diam.",
  full: "Lucara Diamond Corp. (Botsvana · Large Diamond Uzmani)",
  sector: "metals",
  price: 0.92,
  change: 1.10
}, {
  ticker: "PDL",
  name: "Petra Diam.",
  full: "Petra Diamonds Ltd. (G. Afrika & Tanzanya)",
  sector: "metals",
  price: 0.18,
  change: -1.80
}, {
  ticker: "GEMCO",
  name: "Gemfields",
  full: "Gemfields Group (Emerald · Ruby · Afrika)",
  sector: "metals",
  price: 0.48,
  change: 0.88
},
// —  MAJOR MINERS (Diversified Major Miners) —
{
  ticker: "BHP",
  name: "BHP",
  full: "BHP Group Limited (Australia · Diversifiye Dev)",
  sector: "metals",
  price: 58.20,
  change: 0.72
}, {
  ticker: "RIO",
  name: "Rio Tinto",
  full: "Rio Tinto Group (UK/Australia · Aluminum & Iron)",
  sector: "metals",
  price: 64.80,
  change: 0.55
}, {
  ticker: "AAUKF",
  name: "Anglo American",
  full: "Anglo American PLC (London · Platinum & Copper & Diamond)",
  sector: "metals",
  price: 22.80,
  change: 0.88
}, {
  ticker: "S32",
  name: "South32",
  full: "South32 Ltd. (BHP Spin-off · Aluminum & Chinako)",
  sector: "metals",
  price: 3.40,
  change: 1.05
}, {
  ticker: "FSUMF",
  name: "Fortescue",
  full: "Fortescue Ltd. (Australia · Iron Cevheri & Green H2)",
  sector: "metals",
  price: 18.80,
  change: 0.62
}, {
  ticker: "WDS",
  name: "Woodside",
  full: "Woodside Energy Group (Australia · LNG & Energy)",
  sector: "metals",
  price: 24.40,
  change: 0.38
},
// —  TURKISH MINING COMPANIES —
{
  ticker: "KCHOL",
  name: "Koc Mad.",
  full: "Koc Holding Mining (Steel & Mining Investmentlari)",
  sector: "metals",
  price: 4.20,
  change: 1.15,
  isPrivate: true
}, {
  ticker: "ERGLI",
  name: "Erdemir",
  full: "Eregli Iron Steel (Erdemir · Turkey Steel #1)",
  sector: "metals",
  price: 2.80,
  change: 0.88
}, {
  ticker: "ISDMR",
  name: "Isdemir",
  full: "Iskenderun Iron Steel (Isdemir · Erdemir Group)",
  sector: "metals",
  price: 2.40,
  change: 0.72
}, {
  ticker: "KOZAL",
  name: "Koza Gold",
  full: "Koza Gold Operations A.S. (Turkey Gold Miningi)",
  sector: "metals",
  price: 6.80,
  change: 1.44
}, {
  ticker: "KOZAA",
  name: "Koza Anadolu",
  full: "Koza Anadolu Metal Mining A.S.",
  sector: "metals",
  price: 1.60,
  change: 0.92
}, {
  ticker: "GOLTS",
  name: "Gubre Fab.",
  full: "Gubre Fabrikalari T.A.S. (Fosfat & Kimya Miningciligi)",
  sector: "metals",
  price: 1.40,
  change: 0.55
},
// ══════════════════════════════════════════════════════
// ──  BANKING (Global Banking Sector) ──
// ══════════════════════════════════════════════════════

// —  EUROPEAN BANKING —
{
  ticker: "DB",
  name: "Deutsche Bank",
  full: "Deutsche Bank AG (Germany · Europe Investment Banksi)",
  sector: "banking",
  price: 14.40,
  change: 1.22
}, {
  ticker: "SCGLY",
  name: "Soc. Générale",
  full: "Société Générale S.A. (France · Global Bank)",
  sector: "banking",
  price: 32.80,
  change: 0.68
}, {
  ticker: "ING",
  name: "ING Group",
  full: "ING Groep N.V. (Netherlands · Digital Bankcilik Pioneer)",
  sector: "banking",
  price: 18.20,
  change: 0.92
}, {
  ticker: "BCS",
  name: "Barclays",
  full: "Barclays PLC (United Kingdom · Global Investment & Retail)",
  sector: "banking",
  price: 12.40,
  change: 1.05
}, {
  ticker: "LYG",
  name: "Lloyds",
  full: "Lloyds Banking Group PLC (United Kingdom · Retail #1)",
  sector: "banking",
  price: 3.20,
  change: 0.44
}, {
  ticker: "SCBFF",
  name: "Std. Chartered",
  full: "Standard Chartered PLC (Asya-Afrika-Middle East Focused)",
  sector: "banking",
  price: 22.40,
  change: 1.18
}, {
  ticker: "UNCRY",
  name: "UniCredit",
  full: "UniCredit S.p.A. (Italy & Europe · Pan-Europe Bank)",
  sector: "banking",
  price: 48.40,
  change: 1.44
}, {
  ticker: "IITSF",
  name: "Intesa SP",
  full: "Intesa Sanpaolo S.p.A. (Italy · Eurozone Large Bank)",
  sector: "banking",
  price: 4.80,
  change: 0.88
}, {
  ticker: "CRARY",
  name: "Crédit Agric.",
  full: "Crédit Agricole S.A. (France · Kooperatif Bank Devi)",
  sector: "banking",
  price: 14.80,
  change: 0.62
}, {
  ticker: "CRZBY",
  name: "Commerzbank",
  full: "Commerzbank AG (Germany · SME & Corporate Bankcilik)",
  sector: "banking",
  price: 8.40,
  change: 1.92
}, {
  ticker: "AAVMY",
  name: "ABN AMRO",
  full: "ABN AMRO Bank N.V. (Netherlands · Private & Commercial Bank)",
  sector: "banking",
  price: 18.60,
  change: 0.55
}, {
  ticker: "SWEDY",
  name: "Swedbank",
  full: "Swedbank AB (Sweden · Iskandinavya Bankciligi)",
  sector: "banking",
  price: 22.80,
  change: 0.72
}, {
  ticker: "NDEAY",
  name: "Nordea",
  full: "Nordea Bank Abp (Finlandiya · Kuzey Europe #1)",
  sector: "banking",
  price: 12.20,
  change: 0.48
}, {
  ticker: "DNBBY",
  name: "DNB Bank",
  full: "DNB ASA (Norway · Iskandinav Financeal Dev)",
  sector: "banking",
  price: 26.40,
  change: 0.38
},
// —  ASIA-PACIFIC BANKING —
{
  ticker: "DBSDY",
  name: "DBS Group",
  full: "DBS Group Holdings (Singapur · Asya #1 Digital Bank)",
  sector: "banking",
  price: 82.40,
  change: 0.88
}, {
  ticker: "OVCHY",
  name: "OCBC",
  full: "Oversea-Chinese Banking Corp. (Singapur & Asya)",
  sector: "banking",
  price: 14.80,
  change: 0.55
}, {
  ticker: "KB",
  name: "KB Financial",
  full: "KB Financial Group (South Korea · #1 Bank)",
  sector: "banking",
  price: 52.40,
  change: 1.12
}, {
  ticker: "SHG",
  name: "Shinhan Fin.",
  full: "Shinhan Financial Group (South Korea · #2 Bank)",
  sector: "banking",
  price: 28.40,
  change: 0.92
}, {
  ticker: "HDB",
  name: "HDFC Bank",
  full: "HDFC Bank Ltd. (India · Market Value #1 Bank)",
  sector: "banking",
  price: 68.40,
  change: 1.22
}, {
  ticker: "IBN",
  name: "ICICI Bank",
  full: "ICICI Bank Ltd. (India · Digital Bankcilik Leader)",
  sector: "banking",
  price: 22.40,
  change: 1.44
}, {
  ticker: "SBKFF",
  name: "SBI",
  full: "State Bank of India (India · State Banksi #1)",
  sector: "banking",
  price: 8.40,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "AXBKY",
  name: "Axis Bank",
  full: "Axis Bank Ltd. (India · #3 Private Sector Bank)",
  sector: "banking",
  price: 14.20,
  change: 1.05
}, {
  ticker: "CBAUF",
  name: "Commonwealth",
  full: "Commonwealth Bank of Australia (Australia · #1)",
  sector: "banking",
  price: 98.40,
  change: 0.44
}, {
  ticker: "ANZBY",
  name: "ANZ Bank",
  full: "ANZ Banking Group (Australia & New Zealand)",
  sector: "banking",
  price: 18.40,
  change: 0.38
}, {
  ticker: "WBKGF",
  name: "Westpac",
  full: "Westpac Banking Corp. (Australia · 1817'den Beri)",
  sector: "banking",
  price: 14.80,
  change: 0.22
}, {
  ticker: "NABZY",
  name: "NAB",
  full: "National Australia Bank (Australia · Commercial Odak)",
  sector: "banking",
  price: 22.40,
  change: 0.35
}, {
  ticker: "SMFG",
  name: "SMFG",
  full: "Sumitomo Mitsui Financial Group (Japonya · #3 Bank)",
  sector: "banking",
  price: 12.40,
  change: 0.55
}, {
  ticker: "MFNSY",
  name: "Mizuho",
  full: "Mizuho Financial Group Inc. (Japonya · Global Bank)",
  sector: "banking",
  price: 4.80,
  change: 0.42
},
// —  MIDDLE EAST BANKING —
{
  ticker: "FABAD",
  name: "FAB",
  full: "First Abu Dhabi Bank (BAE · Middle East En Large Bank)",
  sector: "banking",
  price: 4.20,
  change: 0.88
}, {
  ticker: "RAJHI",
  name: "Al Rajhi",
  full: "Al Rajhi Bank (S. Arabistan · World’s #1 Islamic Banksi)",
  sector: "banking",
  price: 28.40,
  change: 1.22,
  isPrivate: true
}, {
  ticker: "RIBLF",
  name: "Riyad Bank",
  full: "Riyad Bank (S. Arabistan · Large Commercial Bank)",
  sector: "banking",
  price: 14.60,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "NCKBY",
  name: "NCB",
  full: "Saudi National Bank (S. Arabistan · SNB · En Large)",
  sector: "banking",
  price: 18.80,
  change: 0.92,
  isPrivate: true
}, {
  ticker: "QIBK",
  name: "QIB",
  full: "Qatar Islamic Bank (Katar · Islamici Finance Leader)",
  sector: "banking",
  price: 22.40,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "NBAD",
  name: "ADCB",
  full: "Abu Dhabi Commercial Bank (BAE · Retail & Corporate)",
  sector: "banking",
  price: 5.60,
  change: 0.72
}, {
  ticker: "TGABF",
  name: "Gulf Bank",
  full: "Gulf Bank K.S.C. (Kuveyt · Regional Bankcilik)",
  sector: "banking",
  price: 0.88,
  change: 0.44,
  isPrivate: true
},
// —  LATIN AMERICA BANKING —
{
  ticker: "ITUB",
  name: "Itaú Unibanco",
  full: "Itaú Unibanco Holding (Brazil & L. Amerika #1)",
  sector: "banking",
  price: 6.40,
  change: 1.44
}, {
  ticker: "BBD",
  name: "Bradesco",
  full: "Banco Bradesco S.A. (Brazil · #2 Private Bank)",
  sector: "banking",
  price: 3.80,
  change: 1.12
}, {
  ticker: "BSBR",
  name: "Santander BR.",
  full: "Banco Santander Brasil (Brazil Branch · Listed)",
  sector: "banking",
  price: 5.20,
  change: 0.88
}, {
  ticker: "BPAC",
  name: "BTG Pactual",
  full: "Banco BTG Pactual (Brazil · Investment Banksi #1)",
  sector: "banking",
  price: 14.80,
  change: 1.68
},
// —  TURKISH BANKING —
{
  ticker: "ZIRTB",
  name: "Ziraat Bank.",
  full: "T.C. Ziraat Banksi A.S. (Turkey #1 · State Banksi · 1863)",
  sector: "banking",
  price: 3.20,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "HALKB",
  name: "Halkbank",
  full: "Turkey Halk Banksi A.S. (State · SME Focused)",
  sector: "banking",
  price: 2.80,
  change: 1.22
}, {
  ticker: "VAKBN",
  name: "Vakifbank",
  full: "Turkey Vakiflar Banksi T.A.O. (State · Vakif Banksi)",
  sector: "banking",
  price: 1.90,
  change: 0.88
}, {
  ticker: "GARAN",
  name: "Garanti BBVA",
  full: "Turkey Garanti Banksi A.S. (BBVA Partnered · BIST)",
  sector: "banking",
  price: 4.20,
  change: 1.44
}, {
  ticker: "ISCTR",
  name: "Is Banksi",
  full: "Turkey Is Banksi A.S. (BIST · Turkey'nin En Koklu Banksi · 1924)",
  sector: "banking",
  price: 3.60,
  change: 1.05
}, {
  ticker: "YKBNK",
  name: "Yapi Kredi",
  full: "Yapi ve Kredi Banksi A.S. (Koc-UniCredit · BIST)",
  sector: "banking",
  price: 2.80,
  change: 1.18
}, {
  ticker: "AKBNK",
  name: "Akbank",
  full: "Akbank T.A.S. (Sabanci Group · BIST · Digital Leader)",
  sector: "banking",
  price: 3.40,
  change: 1.32
}, {
  ticker: "QNBFB",
  name: "QNB Financebank",
  full: "QNB Financebank A.S. (Katar NBD Subsidiary · Turkey)",
  sector: "banking",
  price: 2.20,
  change: 0.92,
  isPrivate: true
}, {
  ticker: "DENZB",
  name: "Denizbank",
  full: "DenizBank A.S. (Emirates NBD Group · Turkey)",
  sector: "banking",
  price: 2.40,
  change: 0.78,
  isPrivate: true
}, {
  ticker: "TEBNK",
  name: "TEB",
  full: "Turkish Ekonomi Banksi A.S. (BNP Paribas Partnered)",
  sector: "banking",
  price: 1.80,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "SKBNK",
  name: "Sekerbank",
  full: "Sekerbank T.A.S. (BIST · Kooperatif Rooted Bank)",
  sector: "banking",
  price: 0.92,
  change: 0.44
}, {
  ticker: "KTFTK",
  name: "Kuveyt Turkish",
  full: "Kuveyt Turkish Participation Banksi A.S. (Islamici Finance)",
  sector: "banking",
  price: 1.60,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "TFINK",
  name: "Turkey Finance",
  full: "Turkey Finance Participation Banksi (NCB Saudi Partnered)",
  sector: "banking",
  price: 1.40,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "ALBKTR",
  name: "Alternatifbank",
  full: "Alternatifbank A.S. (Commercial Bank of Qatar Subsidiary)",
  sector: "banking",
  price: 1.20,
  change: 0.42,
  isPrivate: true
}, {
  ticker: "FIBAB",
  name: "Fibabanka",
  full: "Fibabanka A.S. (Fiba Group · BIST · Digital Bank)",
  sector: "banking",
  price: 1.10,
  change: 0.88
}, {
  ticker: "ODEAB",
  name: "Odeabank",
  full: "Odeabank A.S. (Bank Audi Lebanon Subsidiary · Istanbul)",
  sector: "banking",
  price: 1.20,
  change: 0.35,
  isPrivate: true
}, {
  ticker: "INGTR",
  name: "ING Turkey",
  full: "ING Bank A.S. (ING Group · Netherlands · Turkey Branch)",
  sector: "banking",
  price: 2.80,
  change: 0.72,
  isPrivate: true
}, {
  ticker: "HSBTK",
  name: "HSBC Turkey",
  full: "HSBC Bank A.S. (HSBC Group · Turkey Branch)",
  sector: "banking",
  price: 3.60,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "BURVA",
  name: "Burgan Bank",
  full: "Burgan Bank A.S. (Kuveyt Burgan Financial · Turkey)",
  sector: "banking",
  price: 0.80,
  change: 0.28,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  APPAREL & FASHION SECTOR ──
// ══════════════════════════════════════════════════════
{
  ticker: "LVMUY",
  name: "LVMH",
  full: "LVMH (Louis Vuitton, Dior, Givenchy, Bulgari, Tiffany · Luxury #1)",
  sector: "fashion",
  price: 138.40,
  change: 0.88
}, {
  ticker: "CFRUY",
  name: "Richemont",
  full: "Richemont (Cartier, Van Cleef & Arpels, IWC, Panerai · Switzerland)",
  sector: "fashion",
  price: 14.80,
  change: 0.65
}, {
  ticker: "PPRUY",
  name: "Kering",
  full: "Kering (Gucci, Saint Laurent, Balenciaga, Bottega Veneta · France)",
  sector: "fashion",
  price: 28.60,
  change: -0.44
}, {
  ticker: "HESAY",
  name: "Hermès",
  full: "Hermès International (Birkin & Kelly Bag · En Valuable Luxury Brand)",
  sector: "fashion",
  price: 244.80,
  change: 1.22
}, {
  ticker: "PRDSY",
  name: "Prada Group",
  full: "Prada S.p.A. (Prada, Miu Miu, Church's · Italy · HK Exchange)",
  sector: "fashion",
  price: 8.20,
  change: 0.78
}, {
  ticker: "MONRY",
  name: "Moncler",
  full: "Moncler S.p.A. (Ultra-Premium Outdoor Luxury · Stone Island · Italy)",
  sector: "fashion",
  price: 48.40,
  change: 0.55
}, {
  ticker: "BURBY",
  name: "Burberry",
  full: "Burberry Group PLC (Iconic Ingiliz Luxury Brandsi · 1856 · Londra)",
  sector: "fashion",
  price: 9.40,
  change: -0.88
}, {
  ticker: "CHANEL",
  name: "Chanel",
  full: "Chanel S.A. (Coco Chanel Heritage · No5 Perfume · Haute Couture · Private)",
  sector: "fashion",
  price: 580.00,
  change: 1.10,
  isPrivate: true
}, {
  ticker: "VERSAC",
  name: "Versace",
  full: "Gianni Versace (Capri Holdings · Medusa Icon · 1978 · Italy)",
  sector: "fashion",
  price: 82.00,
  change: 0.44,
  isPrivate: true
}, {
  ticker: "ARMANI",
  name: "Giorgio Armani",
  full: "Giorgio Armani S.p.A. (Emporio Armani, AX · Family Company · 1975)",
  sector: "fashion",
  price: 120.00,
  change: 0.35,
  isPrivate: true
}, {
  ticker: "IDEXY",
  name: "Inditex",
  full: "Inditex (Zara, Pull&Bear, Massimo Dutti, Bershka · Moda Perak. #1)",
  sector: "fashion",
  price: 48.60,
  change: 0.92
}, {
  ticker: "HNNMY",
  name: "H&M Group",
  full: "H&M Hennes & Mauritz (H&M, COS, ARKET · Sweden · 77 Countries)",
  sector: "fashion",
  price: 18.20,
  change: -0.35
}, {
  ticker: "FRCOY",
  name: "Fast Retailing",
  full: "Fast Retailing (Uniqlo, GU, Theory · Japonya · Asya Moda #1)",
  sector: "fashion",
  price: 288.40,
  change: 1.44
}, {
  ticker: "GAP",
  name: "Gap Inc.",
  full: "Gap Inc. (Gap, Old Navy, Banana Republic, Athleta · ABD)",
  sector: "fashion",
  price: 18.80,
  change: 0.68
}, {
  ticker: "PVH",
  name: "PVH Corp.",
  full: "PVH Corp. (Calvin Klein, Tommy Hilfiger · Global Lisans Impar.)",
  sector: "fashion",
  price: 68.40,
  change: 0.88
}, {
  ticker: "RL",
  name: "Ralph Lauren",
  full: "Ralph Lauren (Polo Ralph Lauren · Amerikan Tarzinin Simgesi · 1967)",
  sector: "fashion",
  price: 198.40,
  change: 1.12
}, {
  ticker: "BOSSY",
  name: "Hugo Boss",
  full: "Hugo Boss AG (BOSS, HUGO · Global Erkek Apparel · DAX · 1924)",
  sector: "fashion",
  price: 32.40,
  change: 0.55
}, {
  ticker: "NKE",
  name: "Nike",
  full: "Nike Inc. (World’s #1 Sportststststststs Brandsi · Air Jordan · 1964 · NYSE)",
  sector: "fashion",
  price: 72.40,
  change: 0.78
}, {
  ticker: "ADDYY",
  name: "Adidas",
  full: "Adidas AG (Uc Serit Icon · Yeezy, Stan Smith · 1949 · DAX)",
  sector: "fashion",
  price: 128.80,
  change: 1.22
}, {
  ticker: "PMMAF",
  name: "Puma",
  full: "Puma SE (Kering Subsidiary · Sportststststststs & Lifestyle Footwear · 1948)",
  sector: "fashion",
  price: 38.40,
  change: 0.44
}, {
  ticker: "ONON",
  name: "On Running",
  full: "On Holding AG (CloudTec · Premium Running · Roger Federer · Switzerland)",
  sector: "fashion",
  price: 44.80,
  change: 2.80
}, {
  ticker: "CROX",
  name: "Crocs",
  full: "Crocs Inc. (Worldca Unlu Sandals · HeyDude Sahibi · NASDAQ)",
  sector: "fashion",
  price: 92.40,
  change: 1.65
}, {
  ticker: "SKX",
  name: "Skechers",
  full: "Skechers U.S.A. (Konfor Footwearsi · Global Sportststststststs Footwear #3)",
  sector: "fashion",
  price: 58.40,
  change: 0.88
}, {
  ticker: "NB",
  name: "New Balance",
  full: "New Balance Athletics (Boston · 1906 · Made in USA · Private Company)",
  sector: "fashion",
  price: 62.00,
  change: 1.10,
  isPrivate: true
}, {
  ticker: "ESLOY",
  name: "EssilorLuxottica",
  full: "EssilorLuxottica (Ray-Ban, Oakley, Persol · Eyewear World #1)",
  sector: "fashion",
  price: 258.80,
  change: 0.72
}, {
  ticker: "SWGAY",
  name: "Swatch Group",
  full: "Swatch Group (Swatch, Omega, Longines, Tissot, Rado · Switzerland)",
  sector: "fashion",
  price: 22.40,
  change: -0.28
}, {
  ticker: "PANDY",
  name: "Pandora",
  full: "Pandora A/S (World’s #1 Jewelry Brandsi · Charm Bracelet · DK)",
  sector: "fashion",
  price: 82.40,
  change: 1.44
}, {
  ticker: "SIG",
  name: "Signet Jewelers",
  full: "Signet Jewelers (Kay, Zales, Jared · North America Jewelry #1)",
  sector: "fashion",
  price: 68.80,
  change: 0.88
}, {
  ticker: "TIF",
  name: "Tiffany & Co.",
  full: "Tiffany & Co. (LVMH Owned by · Mavi Kutu Icon · 1837 · NYC)",
  sector: "fashion",
  price: 148.00,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "CART",
  name: "Cartier",
  full: "Cartier (Richemont Owned by · Love Bracelet · Kral Jewelrycisi)",
  sector: "fashion",
  price: 320.00,
  change: 0.72,
  isPrivate: true
}, {
  ticker: "BVLG",
  name: "Bulgari",
  full: "Bulgari (LVMH Owned by · Serpenti · Roma Jewelryi · 1884)",
  sector: "fashion",
  price: 180.00,
  change: 0.48,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  HEALTHCARE SECTOR ──
// ══════════════════════════════════════════════════════
{
  ticker: "LLY",
  name: "Eli Lilly",
  full: "Eli Lilly (Mounjaro/Tirzepatide · Alzheimer · 1876 · Pharma Valuei #1)",
  sector: "health",
  price: 788.40,
  change: 2.44
}, {
  ticker: "NVO",
  name: "Novo Nordisk",
  full: "Novo Nordisk (Ozempic, Wegovy · Diyabet & Obezite · Danimarka)",
  sector: "health",
  price: 122.80,
  change: 1.88
}, {
  ticker: "JNJ",
  name: "J&J",
  full: "Johnson & Johnson (Farmasotik + Medikal · Band-Aid · 1886 · NYSE)",
  sector: "health",
  price: 162.40,
  change: 0.44
}, {
  ticker: "MRK",
  name: "Merck & Co.",
  full: "Merck & Co. (Keytruda Cancer Ilaci · HPV Vaccine Gardasil · 1891)",
  sector: "health",
  price: 108.40,
  change: 0.78
}, {
  ticker: "PFE",
  name: "Pfizer",
  full: "Pfizer (COVID-19 mRNA Vaccine · Paxlovid · 1849 · NYSE)",
  sector: "health",
  price: 24.80,
  change: -0.55
}, {
  ticker: "RHHBY",
  name: "Roche",
  full: "Roche Holding (Cancer & Diagnostics · Avastin, Herceptin · 1896 · Switzerland)",
  sector: "health",
  price: 28.40,
  change: 0.35
}, {
  ticker: "NVS",
  name: "Novartis",
  full: "Novartis (Zolgensma Gen Terapisi · Cosentyx · 1996 · NYSE & SIX)",
  sector: "health",
  price: 102.80,
  change: 0.68
}, {
  ticker: "AZN",
  name: "AstraZeneca",
  full: "AstraZeneca (Oxford COVID Vaccine · Tagrisso · 1999 · NASDAQ)",
  sector: "health",
  price: 78.40,
  change: 1.22
}, {
  ticker: "SNY",
  name: "Sanofi",
  full: "Sanofi (Dupixent · Sanofi Pasteur Asi · CAC 40 · France)",
  sector: "health",
  price: 46.80,
  change: 0.44
}, {
  ticker: "GSK",
  name: "GSK",
  full: "GSK PLC (GlaxoSmithKline · Shingrix, HIV Tedavisi · Londra & NYSE)",
  sector: "health",
  price: 38.40,
  change: 0.35
}, {
  ticker: "BAYRY",
  name: "Bayer AG",
  full: "Bayer AG (Aspirin 1899 · Xarelto, Eylea · Monsanto · DAX)",
  sector: "health",
  price: 10.40,
  change: -0.88
}, {
  ticker: "MRNA",
  name: "Moderna",
  full: "Moderna (mRNA Technology Pioneer · COVID Vaccine · Cancer Vaccine · 2010)",
  sector: "health",
  price: 38.80,
  change: 1.65
}, {
  ticker: "BNTX",
  name: "BioNTech",
  full: "BioNTech (Pfizer Partnered mRNA Vaccine · Cancer Immunoterapi · 2008)",
  sector: "health",
  price: 98.40,
  change: 0.92
}, {
  ticker: "REGN",
  name: "Regeneron",
  full: "Regeneron Pharma (Eylea · Dupixent Mediumk · Kevzara · 1988 · NASDAQ)",
  sector: "health",
  price: 682.40,
  change: 1.12
}, {
  ticker: "ABBV",
  name: "AbbVie",
  full: "AbbVie (Humira · Skyrizi, Rinvoq · Abbott Spin-off · NYSE)",
  sector: "health",
  price: 188.40,
  change: 0.88
}, {
  ticker: "AMGN",
  name: "Amgen",
  full: "Amgen (Biyofarmasotik Pioneer · Enbrel, Prolia · 1980 · NASDAQ)",
  sector: "health",
  price: 282.40,
  change: 0.55
}, {
  ticker: "GILD",
  name: "Gilead Sciences",
  full: "Gilead Sciences (HIV Tedavisi Leader · Biktarvy · 1987 · NASDAQ)",
  sector: "health",
  price: 82.40,
  change: 0.68
}, {
  ticker: "UNH",
  name: "UnitedHealth",
  full: "UnitedHealth Group (Optum · Healthcare Insurance & Services World #1)",
  sector: "health",
  price: 524.80,
  change: 0.44
}, {
  ticker: "CVS",
  name: "CVS Health",
  full: "CVS Health (Eczane + Aetna Healthcare Insurancesi · 9.000+ Eczane)",
  sector: "health",
  price: 58.40,
  change: 0.35
}, {
  ticker: "HCA",
  name: "HCA Healthcare",
  full: "HCA Healthcare (World’s En Large Private Hospital Zinciri · 180+ Hast.)",
  sector: "health",
  price: 338.40,
  change: 0.88
}, {
  ticker: "MDT",
  name: "Medtronic",
  full: "Medtronic (Kalp Pili · Seker Monitoru · Medikal Cihaz #1 · 1949)",
  sector: "health",
  price: 84.40,
  change: 0.44
}, {
  ticker: "ABT",
  name: "Abbott Labs",
  full: "Abbott Laboratories (FreeStyle Libre · Pacemaker · 1888 · NYSE)",
  sector: "health",
  price: 128.40,
  change: 0.88
}, {
  ticker: "ISRG",
  name: "Intuitive Surg.",
  full: "Intuitive Surgical (Da Vinci Robotik Cerrahi #1 · 1995 · NASDAQ)",
  sector: "health",
  price: 488.40,
  change: 1.44
}, {
  ticker: "SYK",
  name: "Stryker",
  full: "Stryker (Ortopedik Implant & MAKO Cerrahi Robot · 1941 · NYSE)",
  sector: "health",
  price: 388.40,
  change: 0.68
}, {
  ticker: "BSX",
  name: "Boston Scientific",
  full: "Boston Scientific (Kalp Ritim, Stent, Endoskopi · 1979 · NYSE)",
  sector: "health",
  price: 98.40,
  change: 1.12
}, {
  ticker: "SMMNY",
  name: "Siemens Health.",
  full: "Siemens Healthineers (MRI, CT, PET Scanner · Diagnostics Imaging #1)",
  sector: "health",
  price: 52.40,
  change: 0.72
}, {
  ticker: "VRTX",
  name: "Vertex Pharma.",
  full: "Vertex Pharma (Cystic Fibrosis Trikafta #1 · CRISPR Mediumk · NASDAQ)",
  sector: "health",
  price: 472.40,
  change: 1.22
}, {
  ticker: "CRSP",
  name: "CRISPR Therap.",
  full: "CRISPR Therapeutics (Gene Editing · FDA Approved Casgevy · NASDAQ)",
  sector: "health",
  price: 48.40,
  change: 3.14
}, {
  ticker: "ACIBM",
  name: "Acibadem",
  full: "Acibadem Healthcare Group (IHH Healthcare Subsidiary · 23 Hospital · TR)",
  sector: "health",
  price: 8.40,
  change: 1.22,
  isPrivate: true
}, {
  ticker: "MEMHSP",
  name: "Memorial",
  full: "Memorial Healthcare Group (14 Hospital · Istanbul, Ankara · TR)",
  sector: "health",
  price: 6.80,
  change: 0.88,
  isPrivate: true
}, {
  ticker: "ECILC",
  name: "Eczacibasi",
  full: "Eczacibasi Pharma Industry (Pharma Production & Cosmetics · BIST · TR)",
  sector: "health",
  price: 3.20,
  change: 0.92
}];

// Normalize: companies without ipoStatus get assigned based on isPrivate flag
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
const COMPANY_EVENTS = {
  AAPL: [{
    y: 1984,
    l: "Macintosh"
  }, {
    y: 1997,
    l: "Jobs Returned"
  }, {
    y: 2001,
    l: "iPod"
  }, {
    y: 2007,
    l: "iPhone"
  }, {
    y: 2010,
    l: "iPad"
  }, {
    y: 2018,
    l: "$1T"
  }, {
    y: 2020,
    l: "M1 Chip"
  }, {
    y: 2023,
    l: "Vision Pro"
  }],
  MSFT: [{
    y: 1986,
    l: "IPO"
  }, {
    y: 1995,
    l: "Windows 95"
  }, {
    y: 2000,
    l: "Dot-com Crisis"
  }, {
    y: 2014,
    l: "Nadella CEO"
  }, {
    y: 2021,
    l: "Teams Boom"
  }, {
    y: 2023,
    l: "OpenAI Investment"
  }],
  NVDA: [{
    y: 1999,
    l: "IPO"
  }, {
    y: 2006,
    l: "CUDA"
  }, {
    y: 2016,
    l: "AI Era"
  }, {
    y: 2022,
    l: "ChatGPT Impact"
  }, {
    y: 2023,
    l: "H100 Demand"
  }, {
    y: 2024,
    l: "$3T Value"
  }],
  GOOGL: [{
    y: 2004,
    l: "IPO $85"
  }, {
    y: 2006,
    l: "YouTube $1.65B"
  }, {
    y: 2008,
    l: "Android"
  }, {
    y: 2015,
    l: "Alphabet"
  }, {
    y: 2023,
    l: "Gemini"
  }, {
    y: 2024,
    l: "Gemini Ultra"
  }],
  META: [{
    y: 2012,
    l: "IPO + Instagram"
  }, {
    y: 2014,
    l: "WhatsApp $19B"
  }, {
    y: 2021,
    l: "Meta Rebranding"
  }, {
    y: 2022,
    l: "Metaverse Crisis"
  }, {
    y: 2023,
    l: "Threads"
  }, {
    y: 2024,
    l: "Llama 3"
  }],
  TSLA: [{
    y: 2010,
    l: "IPO $17"
  }, {
    y: 2013,
    l: "Model S"
  }, {
    y: 2020,
    l: "S&P 500 Entry"
  }, {
    y: 2021,
    l: "$1T"
  }, {
    y: 2022,
    l: "Twitter Dikkat"
  }, {
    y: 2024,
    l: "Cybertruck"
  }],
  AMZN: [{
    y: 1997,
    l: "IPO $18"
  }, {
    y: 2006,
    l: "AWS Started"
  }, {
    y: 2017,
    l: "Whole Foods"
  }, {
    y: 2020,
    l: "COVID Boom"
  }, {
    y: 2021,
    l: "Bezos Stepped Down"
  }, {
    y: 2023,
    l: "Bedrock AI"
  }],
  NFLX: [{
    y: 2002,
    l: "IPO"
  }, {
    y: 2007,
    l: "Streaming Started"
  }, {
    y: 2013,
    l: "House of Cards"
  }, {
    y: 2020,
    l: "COVID +200%"
  }, {
    y: 2022,
    l: "Subscriber Loss"
  }, {
    y: 2023,
    l: "Password Sharing Ends"
  }],
  OPENAI: [{
    y: 2020,
    l: "GPT-3"
  }, {
    y: 2022,
    l: "ChatGPT 100M"
  }, {
    y: 2023,
    l: "GPT-4"
  }, {
    y: 2024,
    l: "o1 Modeli"
  }, {
    y: 2025,
    l: "Operator/Sora"
  }],
  JPM: [{
    y: 2008,
    l: "Financeal Kriz"
  }, {
    y: 2012,
    l: "London Whale"
  }, {
    y: 2020,
    l: "COVID Wave"
  }, {
    y: 2023,
    l: "SVB Acquired"
  }],
  BLK: [{
    y: 1999,
    l: "IPO"
  }, {
    y: 2008,
    l: "Merrill Lynch"
  }, {
    y: 2020,
    l: "$8T AUM"
  }, {
    y: 2024,
    l: "Bitcoin ETF"
  }],
  THYAO: [{
    y: 2000,
    l: "BIST Entry"
  }, {
    y: 2013,
    l: "Best Airline"
  }, {
    y: 2020,
    l: "COVID -50%"
  }, {
    y: 2023,
    l: "Rekor Yolcu"
  }, {
    y: 2024,
    l: "257 Countries"
  }],
  TSM: [{
    y: 1994,
    l: "IPO"
  }, {
    y: 2020,
    l: "5nm Production"
  }, {
    y: 2022,
    l: "Chip Crisis"
  }, {
    y: 2024,
    l: "Arizona Fab"
  }, {
    y: 2025,
    l: "2nm Started"
  }],
  BAYKT: [{
    y: 2014,
    l: "Bayraktar TB2"
  }, {
    y: 2020,
    l: "Karabakh War"
  }, {
    y: 2022,
    l: "Ukraine War"
  }, {
    y: 2023,
    l: "TB3 & Akinci"
  }, {
    y: 2024,
    l: "Export Record"
  }],
  ASELS: [{
    y: 1987,
    l: "Halka Arz"
  }, {
    y: 2010,
    l: "Defense Donusumu"
  }, {
    y: 2018,
    l: "International Sale"
  }, {
    y: 2023,
    l: "Rekor Gelir"
  }]
};

// Historical simulated data generator - corrected version
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
    rationale: txt("demoCompareRationale", "Superior financial metrics combined with the innovation pipeline make this the preferred allocation under current market conditions."),
    alternatif: companies[1]?.ticker || "MSFT",
    alternativeNote: txt("demoCompareAlternativeNote", "Strong enterprise positioning and cloud infrastructure provide compelling risk-adjusted returns as a secondary allocation.")
  },
  overallAssessment: txt("demoCompareOverall", "The portfolio demonstrates solid diversification across market leaders with complementary business models. The current macro environment favors quality over growth, supporting this allocation strategy."),
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
      const promptContent = `${co.length} compare companies and create an investment analysis in ${outputLanguage}: ${companyDetails}

Fill only the JSON template below. Do not write any extra explanation. Make all scores whole numbers from 0 to 100:

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

const COMMODITY_HISTORY = {
  'GC=F': {
    // Gold — 1900'den itibaren
    label: 'Gold (XAU/USD)',
    color: '#fbbf24',
    unit: '$/oz',
    note: '1900-1933 gold standard · 1971 Nixon shock · 1980 peak · 2011 new high · 2024-2026 record',
    data: [{
      year: 1900,
      price: 20.67
    }, {
      year: 1910,
      price: 20.67
    }, {
      year: 1920,
      price: 20.67
    }, {
      year: 1930,
      price: 20.67
    }, {
      year: 1934,
      price: 35.00
    }, {
      year: 1940,
      price: 35.00
    }, {
      year: 1950,
      price: 35.00
    }, {
      year: 1960,
      price: 35.00
    }, {
      year: 1970,
      price: 35.00
    }, {
      year: 1971,
      price: 44.60
    }, {
      year: 1972,
      price: 63.90
    }, {
      year: 1973,
      price: 106.7
    }, {
      year: 1974,
      price: 185.0
    }, {
      year: 1975,
      price: 161.0
    }, {
      year: 1976,
      price: 124.8
    }, {
      year: 1977,
      price: 147.7
    }, {
      year: 1978,
      price: 193.4
    }, {
      year: 1979,
      price: 306.7
    }, {
      year: 1980,
      price: 615.0
    }, {
      year: 1981,
      price: 460.0
    }, {
      year: 1982,
      price: 376.0
    }, {
      year: 1983,
      price: 424.4
    }, {
      year: 1985,
      price: 317.3
    }, {
      year: 1987,
      price: 446.5
    }, {
      year: 1990,
      price: 383.5
    }, {
      year: 1993,
      price: 359.8
    }, {
      year: 1995,
      price: 384.1
    }, {
      year: 1998,
      price: 294.2
    }, {
      year: 2000,
      price: 279.1
    }, {
      year: 2002,
      price: 310.0
    }, {
      year: 2004,
      price: 409.7
    }, {
      year: 2006,
      price: 636.0
    }, {
      year: 2007,
      price: 836.5
    }, {
      year: 2008,
      price: 872.0
    }, {
      year: 2009,
      price: 1087.5
    }, {
      year: 2010,
      price: 1421.0
    }, {
      year: 2011,
      price: 1571.5
    }, {
      year: 2012,
      price: 1668.9
    }, {
      year: 2013,
      price: 1204.5
    }, {
      year: 2014,
      price: 1266.4
    }, {
      year: 2015,
      price: 1060.0
    }, {
      year: 2016,
      price: 1145.9
    }, {
      year: 2017,
      price: 1257.2
    }, {
      year: 2018,
      price: 1268.5
    }, {
      year: 2019,
      price: 1481.2
    }, {
      year: 2020,
      price: 1770.6
    }, {
      year: 2021,
      price: 1798.6
    }, {
      year: 2022,
      price: 1800.1
    }, {
      year: 2023,
      price: 1940.5
    }, {
      year: 2024,
      price: 2386.4
    }, {
      year: 2025,
      price: 2950.0
    }, {
      year: 2026,
      price: 3125.0
    }]
  },
  'SI=F': {
    // Silver — 1900'den
    label: 'Silver (XAG/USD)',
    color: '#94a3b8',
    unit: '$/oz',
    note: '1980 Hunt Brothers koseye sikistirma · 2011 spekulatif zirve · 2020 GameStop benzeri rally',
    data: [{
      year: 1900,
      price: 0.65
    }, {
      year: 1910,
      price: 0.54
    }, {
      year: 1920,
      price: 1.01
    }, {
      year: 1930,
      price: 0.38
    }, {
      year: 1940,
      price: 0.35
    }, {
      year: 1950,
      price: 0.74
    }, {
      year: 1960,
      price: 0.91
    }, {
      year: 1970,
      price: 1.63
    }, {
      year: 1973,
      price: 2.56
    }, {
      year: 1976,
      price: 4.35
    }, {
      year: 1979,
      price: 21.79
    }, {
      year: 1980,
      price: 20.98
    }, {
      year: 1981,
      price: 10.52
    }, {
      year: 1985,
      price: 6.14
    }, {
      year: 1990,
      price: 4.82
    }, {
      year: 1995,
      price: 5.21
    }, {
      year: 1998,
      price: 5.54
    }, {
      year: 2000,
      price: 4.95
    }, {
      year: 2003,
      price: 4.88
    }, {
      year: 2006,
      price: 11.55
    }, {
      year: 2008,
      price: 15.00
    }, {
      year: 2009,
      price: 14.67
    }, {
      year: 2010,
      price: 20.19
    }, {
      year: 2011,
      price: 35.12
    }, {
      year: 2012,
      price: 31.15
    }, {
      year: 2013,
      price: 23.79
    }, {
      year: 2015,
      price: 15.68
    }, {
      year: 2016,
      price: 17.14
    }, {
      year: 2018,
      price: 15.71
    }, {
      year: 2019,
      price: 16.21
    }, {
      year: 2020,
      price: 20.55
    }, {
      year: 2021,
      price: 25.14
    }, {
      year: 2022,
      price: 21.73
    }, {
      year: 2023,
      price: 23.35
    }, {
      year: 2024,
      price: 28.64
    }, {
      year: 2025,
      price: 31.80
    }, {
      year: 2026,
      price: 34.80
    }]
  },
  'CL=F': {
    // Ham Petrol WTI — 1900'den
    label: 'Ham Petrol WTI ($/barrel)',
    color: '#f97316',
    unit: '$/barrel',
    note: '1973 OPEC embargo · 2008 global crisis · 2020 COVID negative price · 2022 Russia-Ukraine',
    data: [{
      year: 1900,
      price: 1.19
    }, {
      year: 1910,
      price: 0.61
    }, {
      year: 1920,
      price: 3.07
    }, {
      year: 1930,
      price: 1.19
    }, {
      year: 1940,
      price: 1.02
    }, {
      year: 1950,
      price: 2.51
    }, {
      year: 1960,
      price: 2.88
    }, {
      year: 1970,
      price: 3.39
    }, {
      year: 1973,
      price: 3.29
    }, {
      year: 1974,
      price: 11.58
    }, {
      year: 1978,
      price: 14.55
    }, {
      year: 1980,
      price: 37.42
    }, {
      year: 1982,
      price: 32.97
    }, {
      year: 1986,
      price: 14.44
    }, {
      year: 1990,
      price: 23.19
    }, {
      year: 1994,
      price: 17.20
    }, {
      year: 1998,
      price: 11.28
    }, {
      year: 2000,
      price: 30.38
    }, {
      year: 2004,
      price: 41.51
    }, {
      year: 2006,
      price: 66.25
    }, {
      year: 2007,
      price: 72.39
    }, {
      year: 2008,
      price: 99.67
    }, {
      year: 2009,
      price: 61.92
    }, {
      year: 2010,
      price: 79.55
    }, {
      year: 2011,
      price: 95.11
    }, {
      year: 2012,
      price: 94.15
    }, {
      year: 2014,
      price: 93.17
    }, {
      year: 2015,
      price: 48.79
    }, {
      year: 2016,
      price: 43.24
    }, {
      year: 2017,
      price: 50.88
    }, {
      year: 2018,
      price: 65.00
    }, {
      year: 2019,
      price: 57.10
    }, {
      year: 2020,
      price: 41.47
    }, {
      year: 2021,
      price: 68.03
    }, {
      year: 2022,
      price: 94.53
    }, {
      year: 2023,
      price: 77.62
    }, {
      year: 2024,
      price: 76.96
    }, {
      year: 2025,
      price: 70.20
    }, {
      year: 2026,
      price: 68.40
    }]
  },
  'BZ=F': {
    // Brent
    label: 'Brent Oil ($/barrel)',
    color: '#fb923c',
    unit: '$/barrel',
    note: "Kuzey Denizi ham petrolu, WTI'den genellikle 2-5 dolar high",
    data: [{
      year: 1988,
      price: 14.92
    }, {
      year: 1990,
      price: 23.70
    }, {
      year: 1994,
      price: 15.82
    }, {
      year: 1998,
      price: 12.72
    }, {
      year: 2000,
      price: 28.50
    }, {
      year: 2004,
      price: 38.27
    }, {
      year: 2006,
      price: 65.16
    }, {
      year: 2008,
      price: 96.94
    }, {
      year: 2009,
      price: 61.67
    }, {
      year: 2011,
      price: 111.26
    }, {
      year: 2012,
      price: 111.67
    }, {
      year: 2014,
      price: 98.97
    }, {
      year: 2015,
      price: 52.32
    }, {
      year: 2016,
      price: 43.55
    }, {
      year: 2018,
      price: 71.69
    }, {
      year: 2020,
      price: 41.96
    }, {
      year: 2021,
      price: 70.68
    }, {
      year: 2022,
      price: 99.04
    }, {
      year: 2023,
      price: 82.17
    }, {
      year: 2024,
      price: 80.80
    }, {
      year: 2025,
      price: 73.50
    }, {
      year: 2026,
      price: 72.10
    }]
  },
  'NG=F': {
    // Natural Gas
    label: 'Natural Gas ($/MMBtu)',
    color: '#34d399',
    unit: '$/MMBtu',
    note: "1980s deregulation, 2005 Hurricane Katrina, 2022 Russia-Ukraine energy crisis",
    data: [{
      year: 1990,
      price: 1.71
    }, {
      year: 1992,
      price: 1.74
    }, {
      year: 1994,
      price: 1.88
    }, {
      year: 1996,
      price: 2.52
    }, {
      year: 1998,
      price: 2.08
    }, {
      year: 2000,
      price: 4.23
    }, {
      year: 2001,
      price: 4.07
    }, {
      year: 2003,
      price: 5.63
    }, {
      year: 2004,
      price: 5.63
    }, {
      year: 2005,
      price: 8.69
    }, {
      year: 2006,
      price: 6.73
    }, {
      year: 2008,
      price: 8.86
    }, {
      year: 2009,
      price: 3.94
    }, {
      year: 2010,
      price: 4.37
    }, {
      year: 2012,
      price: 2.75
    }, {
      year: 2014,
      price: 4.37
    }, {
      year: 2016,
      price: 2.62
    }, {
      year: 2018,
      price: 3.15
    }, {
      year: 2020,
      price: 2.05
    }, {
      year: 2021,
      price: 3.72
    }, {
      year: 2022,
      price: 6.45
    }, {
      year: 2023,
      price: 2.74
    }, {
      year: 2024,
      price: 2.18
    }, {
      year: 2025,
      price: 3.50
    }, {
      year: 2026,
      price: 4.12
    }]
  },
  'PL=F': {
    // Platinum
    label: 'Platinum ($/oz)',
    color: '#e2e8f0',
    unit: '$/oz',
    note: 'Endustriyel kullanim agirlikli · Otomobil egzoz katalizoru · Palladiumun yerini alabilir',
    data: [{
      year: 1980,
      price: 330.0
    }, {
      year: 1985,
      price: 280.0
    }, {
      year: 1990,
      price: 470.0
    }, {
      year: 1995,
      price: 425.0
    }, {
      year: 1998,
      price: 380.0
    }, {
      year: 2000,
      price: 545.0
    }, {
      year: 2002,
      price: 540.0
    }, {
      year: 2004,
      price: 845.0
    }, {
      year: 2006,
      price: 1148.0
    }, {
      year: 2008,
      price: 1577.0
    }, {
      year: 2009,
      price: 1200.0
    }, {
      year: 2010,
      price: 1604.0
    }, {
      year: 2011,
      price: 1723.0
    }, {
      year: 2013,
      price: 1487.0
    }, {
      year: 2015,
      price: 1053.0
    }, {
      year: 2018,
      price: 880.0
    }, {
      year: 2020,
      price: 875.0
    }, {
      year: 2021,
      price: 1094.0
    }, {
      year: 2022,
      price: 974.0
    }, {
      year: 2023,
      price: 974.0
    }, {
      year: 2024,
      price: 975.0
    }, {
      year: 2025,
      price: 970.0
    }, {
      year: 2026,
      price: 975.0
    }]
  },
  'HG=F': {
    // Copper
    label: 'Copper ($/lb)',
    color: '#f97316',
    unit: '$/lb',
    note: 'Global economic indicator · Chinese demand is decisive · EV revolution boosts demand',
    data: [{
      year: 1980,
      price: 0.98
    }, {
      year: 1985,
      price: 0.64
    }, {
      year: 1990,
      price: 1.22
    }, {
      year: 1995,
      price: 1.35
    }, {
      year: 1998,
      price: 0.76
    }, {
      year: 2000,
      price: 0.82
    }, {
      year: 2004,
      price: 1.29
    }, {
      year: 2006,
      price: 3.05
    }, {
      year: 2008,
      price: 3.15
    }, {
      year: 2009,
      price: 2.34
    }, {
      year: 2010,
      price: 3.42
    }, {
      year: 2011,
      price: 4.00
    }, {
      year: 2012,
      price: 3.61
    }, {
      year: 2015,
      price: 2.49
    }, {
      year: 2018,
      price: 2.97
    }, {
      year: 2020,
      price: 2.80
    }, {
      year: 2021,
      price: 4.23
    }, {
      year: 2022,
      price: 3.81
    }, {
      year: 2023,
      price: 3.85
    }, {
      year: 2024,
      price: 4.36
    }, {
      year: 2025,
      price: 4.80
    }, {
      year: 2026,
      price: 5.12
    }]
  }
};

// Currency historical data (1 USD = X units)
const FOREX_HISTORY = {
  'TRY': {
    label: 'Turkish Lira / USD',
    color: '#ef4444',
    unit: 'TRY',
    note: '1930-2004 old lira normalized / 2005 YTL-TL / 96-year devaluation',
    data: [{
      year: 1930,
      price: 0.0000021
    }, {
      year: 1946,
      price: 0.0000028
    }, {
      year: 1958,
      price: 0.0000090
    }, {
      year: 1970,
      price: 0.0000090
    }, {
      year: 1973,
      price: 0.0000140
    }, {
      year: 1978,
      price: 0.0000247
    }, {
      year: 1980,
      price: 0.0000764
    }, {
      year: 1983,
      price: 0.000225
    }, {
      year: 1985,
      price: 0.000522
    }, {
      year: 1988,
      price: 0.001422
    }, {
      year: 1990,
      price: 0.002924
    }, {
      year: 1992,
      price: 0.008556
    }, {
      year: 1994,
      price: 0.029700
    }, {
      year: 1996,
      price: 0.081405
    }, {
      year: 1998,
      price: 0.260724
    }, {
      year: 2000,
      price: 0.625219
    }, {
      year: 2001,
      price: 1.228020
    }, {
      year: 2003,
      price: 1.492000
    }, {
      year: 2005,
      price: 1.340
    }, {
      year: 2007,
      price: 1.302
    }, {
      year: 2009,
      price: 1.549
    }, {
      year: 2011,
      price: 1.675
    }, {
      year: 2013,
      price: 1.904
    }, {
      year: 2015,
      price: 2.720
    }, {
      year: 2017,
      price: 3.648
    }, {
      year: 2018,
      price: 4.819
    }, {
      year: 2019,
      price: 5.674
    }, {
      year: 2020,
      price: 7.344
    }, {
      year: 2021,
      price: 8.520
    }, {
      year: 2022,
      price: 16.570
    }, {
      year: 2023,
      price: 26.560
    }, {
      year: 2024,
      price: 33.000
    }, {
      year: 2025,
      price: 36.400
    }, {
      year: 2026,
      price: 38.400
    }]
  },
  'EUR': {
    label: 'Euro / USD',
    color: '#3b82f6',
    unit: 'EUR',
    note: '1999 founding / ECB governance / global reserve currency #2',
    data: [{
      year: 1999,
      price: 1.065
    }, {
      year: 2001,
      price: 1.118
    }, {
      year: 2003,
      price: 0.886
    }, {
      year: 2005,
      price: 0.805
    }, {
      year: 2007,
      price: 0.731
    }, {
      year: 2008,
      price: 0.683
    }, {
      year: 2009,
      price: 0.719
    }, {
      year: 2011,
      price: 0.719
    }, {
      year: 2013,
      price: 0.753
    }, {
      year: 2015,
      price: 0.902
    }, {
      year: 2016,
      price: 0.948
    }, {
      year: 2017,
      price: 0.887
    }, {
      year: 2019,
      price: 0.893
    }, {
      year: 2020,
      price: 0.877
    }, {
      year: 2021,
      price: 0.845
    }, {
      year: 2022,
      price: 0.950
    }, {
      year: 2023,
      price: 0.925
    }, {
      year: 2024,
      price: 0.920
    }, {
      year: 2025,
      price: 0.915
    }, {
      year: 2026,
      price: 0.918
    }]
  },
  'GBP': {
    label: 'British Pound Sterling / USD',
    color: '#a78bfa',
    unit: 'GBP',
    note: 'World’s oldest active currency / Brexit 2016 / 1992 Black Wednesday',
    data: [{
      year: 1900,
      price: 0.205
    }, {
      year: 1930,
      price: 0.205
    }, {
      year: 1950,
      price: 0.357
    }, {
      year: 1967,
      price: 0.418
    }, {
      year: 1975,
      price: 0.450
    }, {
      year: 1985,
      price: 0.779
    }, {
      year: 1990,
      price: 0.563
    }, {
      year: 1992,
      price: 0.632
    }, {
      year: 2000,
      price: 0.661
    }, {
      year: 2005,
      price: 0.550
    }, {
      year: 2008,
      price: 0.544
    }, {
      year: 2009,
      price: 0.641
    }, {
      year: 2013,
      price: 0.640
    }, {
      year: 2015,
      price: 0.655
    }, {
      year: 2016,
      price: 0.743
    }, {
      year: 2018,
      price: 0.750
    }, {
      year: 2019,
      price: 0.782
    }, {
      year: 2020,
      price: 0.779
    }, {
      year: 2022,
      price: 0.813
    }, {
      year: 2023,
      price: 0.804
    }, {
      year: 2024,
      price: 0.789
    }, {
      year: 2025,
      price: 0.782
    }, {
      year: 2026,
      price: 0.788
    }]
  },
  'JPY': {
    label: 'Japanese Yen / USD',
    color: '#f59e0b',
    unit: 'JPY',
    note: '1949 fixed 360 JPY / 1971 Bretton Woods / Plaza 1985 / 2022-24 historic weakening',
    data: [{
      year: 1949,
      price: 360.0
    }, {
      year: 1970,
      price: 360.0
    }, {
      year: 1971,
      price: 308.0
    }, {
      year: 1975,
      price: 296.8
    }, {
      year: 1978,
      price: 210.4
    }, {
      year: 1980,
      price: 226.7
    }, {
      year: 1985,
      price: 238.5
    }, {
      year: 1986,
      price: 168.5
    }, {
      year: 1990,
      price: 144.8
    }, {
      year: 1995,
      price: 94.1
    }, {
      year: 1998,
      price: 130.9
    }, {
      year: 2000,
      price: 107.8
    }, {
      year: 2004,
      price: 108.1
    }, {
      year: 2007,
      price: 117.8
    }, {
      year: 2008,
      price: 103.4
    }, {
      year: 2009,
      price: 93.6
    }, {
      year: 2011,
      price: 79.7
    }, {
      year: 2013,
      price: 97.6
    }, {
      year: 2015,
      price: 121.0
    }, {
      year: 2016,
      price: 108.8
    }, {
      year: 2019,
      price: 109.0
    }, {
      year: 2020,
      price: 106.8
    }, {
      year: 2022,
      price: 131.5
    }, {
      year: 2023,
      price: 140.5
    }, {
      year: 2024,
      price: 151.0
    }, {
      year: 2025,
      price: 149.0
    }, {
      year: 2026,
      price: 148.6
    }]
  },
  'CNY': {
    label: 'Chinese Yuan / USD',
    color: '#ef4444',
    unit: 'CNY',
    note: '1994 major devaluation / 2005 managed float / SDR 2016',
    data: [{
      year: 1980,
      price: 1.50
    }, {
      year: 1985,
      price: 2.94
    }, {
      year: 1990,
      price: 4.78
    }, {
      year: 1994,
      price: 8.62
    }, {
      year: 2000,
      price: 8.28
    }, {
      year: 2005,
      price: 8.19
    }, {
      year: 2008,
      price: 6.95
    }, {
      year: 2010,
      price: 6.77
    }, {
      year: 2013,
      price: 6.19
    }, {
      year: 2015,
      price: 6.49
    }, {
      year: 2017,
      price: 6.75
    }, {
      year: 2019,
      price: 6.91
    }, {
      year: 2021,
      price: 6.45
    }, {
      year: 2022,
      price: 6.73
    }, {
      year: 2023,
      price: 7.08
    }, {
      year: 2024,
      price: 7.24
    }, {
      year: 2025,
      price: 7.26
    }, {
      year: 2026,
      price: 7.28
    }]
  },
  'CHF': {
    label: 'Swiss Franc / USD',
    color: '#10b981',
    unit: 'CHF',
    note: 'Global safe haven / 2011 SNB minimum rate / 2015 sudden free float',
    data: [{
      year: 1970,
      price: 4.32
    }, {
      year: 1975,
      price: 2.58
    }, {
      year: 1980,
      price: 1.82
    }, {
      year: 1985,
      price: 2.46
    }, {
      year: 1990,
      price: 1.39
    }, {
      year: 1995,
      price: 1.18
    }, {
      year: 2000,
      price: 1.69
    }, {
      year: 2006,
      price: 1.25
    }, {
      year: 2008,
      price: 1.08
    }, {
      year: 2011,
      price: 0.89
    }, {
      year: 2015,
      price: 1.00
    }, {
      year: 2017,
      price: 0.98
    }, {
      year: 2020,
      price: 0.94
    }, {
      year: 2022,
      price: 0.96
    }, {
      year: 2023,
      price: 0.90
    }, {
      year: 2025,
      price: 0.895
    }, {
      year: 2026,
      price: 0.898
    }]
  },
  'AUD': {
    label: 'Australian Dollar / USD',
    color: '#f97316',
    unit: 'AUD',
    note: '1966 decimalization / commodity-dependent currency / correlated with Chinese demand',
    data: [{
      year: 1966,
      price: 1.12
    }, {
      year: 1974,
      price: 0.82
    }, {
      year: 1983,
      price: 1.10
    }, {
      year: 1985,
      price: 1.43
    }, {
      year: 1990,
      price: 1.28
    }, {
      year: 1995,
      price: 1.35
    }, {
      year: 2001,
      price: 1.93
    }, {
      year: 2003,
      price: 1.54
    }, {
      year: 2007,
      price: 1.20
    }, {
      year: 2009,
      price: 1.27
    }, {
      year: 2011,
      price: 0.97
    }, {
      year: 2013,
      price: 1.04
    }, {
      year: 2015,
      price: 1.33
    }, {
      year: 2018,
      price: 1.34
    }, {
      year: 2020,
      price: 1.45
    }, {
      year: 2022,
      price: 1.44
    }, {
      year: 2023,
      price: 1.50
    }, {
      year: 2024,
      price: 1.53
    }, {
      year: 2025,
      price: 1.58
    }, {
      year: 2026,
      price: 1.582
    }]
  },
  'CAD': {
    label: 'Canadian Dollar / USD',
    color: '#dc2626',
    unit: 'CAD',
    note: 'Correlation with oil prices / NAFTA-USMCA effect',
    data: [{
      year: 1950,
      price: 1.06
    }, {
      year: 1970,
      price: 1.01
    }, {
      year: 1980,
      price: 1.17
    }, {
      year: 1985,
      price: 1.37
    }, {
      year: 1990,
      price: 1.17
    }, {
      year: 1995,
      price: 1.37
    }, {
      year: 2000,
      price: 1.49
    }, {
      year: 2004,
      price: 1.30
    }, {
      year: 2007,
      price: 1.07
    }, {
      year: 2009,
      price: 1.14
    }, {
      year: 2011,
      price: 0.99
    }, {
      year: 2015,
      price: 1.28
    }, {
      year: 2018,
      price: 1.30
    }, {
      year: 2020,
      price: 1.34
    }, {
      year: 2021,
      price: 1.25
    }, {
      year: 2022,
      price: 1.30
    }, {
      year: 2023,
      price: 1.35
    }, {
      year: 2024,
      price: 1.36
    }, {
      year: 2025,
      price: 1.42
    }, {
      year: 2026,
      price: 1.438
    }]
  },
  'KRW': {
    label: 'South Korean Won / USD',
    color: '#8b5cf6',
    unit: 'KRW',
    note: '1997-98 Asian crisis dramatic plunge / recovery driven by strong export economy',
    data: [{
      year: 1964,
      price: 130.0
    }, {
      year: 1970,
      price: 317.0
    }, {
      year: 1980,
      price: 607.0
    }, {
      year: 1985,
      price: 870.0
    }, {
      year: 1990,
      price: 707.0
    }, {
      year: 1995,
      price: 774.0
    }, {
      year: 1997,
      price: 951.0
    }, {
      year: 1998,
      price: 1401.0
    }, {
      year: 2000,
      price: 1131.0
    }, {
      year: 2005,
      price: 1024.0
    }, {
      year: 2007,
      price: 929.0
    }, {
      year: 2009,
      price: 1277.0
    }, {
      year: 2012,
      price: 1126.0
    }, {
      year: 2015,
      price: 1130.0
    }, {
      year: 2018,
      price: 1100.0
    }, {
      year: 2020,
      price: 1180.0
    }, {
      year: 2022,
      price: 1292.0
    }, {
      year: 2023,
      price: 1305.0
    }, {
      year: 2024,
      price: 1363.0
    }, {
      year: 2025,
      price: 1382.0
    }, {
      year: 2026,
      price: 1388.0
    }]
  },
  'INR': {
    label: 'Indian Rupee / USD',
    color: '#f97316',
    unit: 'INR',
    note: '1966 major devaluation / 1991 liberalization / steady depreciation trend',
    data: [{
      year: 1947,
      price: 3.30
    }, {
      year: 1966,
      price: 7.50
    }, {
      year: 1975,
      price: 8.41
    }, {
      year: 1985,
      price: 12.37
    }, {
      year: 1990,
      price: 17.50
    }, {
      year: 1991,
      price: 22.74
    }, {
      year: 1995,
      price: 32.43
    }, {
      year: 2000,
      price: 43.62
    }, {
      year: 2005,
      price: 44.10
    }, {
      year: 2008,
      price: 43.51
    }, {
      year: 2011,
      price: 46.67
    }, {
      year: 2013,
      price: 60.10
    }, {
      year: 2015,
      price: 65.46
    }, {
      year: 2018,
      price: 68.36
    }, {
      year: 2020,
      price: 73.10
    }, {
      year: 2022,
      price: 78.60
    }, {
      year: 2023,
      price: 82.60
    }, {
      year: 2024,
      price: 83.90
    }, {
      year: 2025,
      price: 85.50
    }, {
      year: 2026,
      price: 86.20
    }]
  },
  'BRL': {
    label: 'Brazilian Real / USD',
    color: '#34d399',
    unit: 'BRL',
    note: '1994 Plano Real (end of hyperinflation) / political instability',
    data: [{
      year: 1994,
      price: 0.85
    }, {
      year: 1997,
      price: 1.08
    }, {
      year: 1999,
      price: 1.81
    }, {
      year: 2002,
      price: 2.92
    }, {
      year: 2005,
      price: 2.43
    }, {
      year: 2008,
      price: 1.83
    }, {
      year: 2011,
      price: 1.67
    }, {
      year: 2015,
      price: 3.33
    }, {
      year: 2018,
      price: 3.86
    }, {
      year: 2020,
      price: 5.39
    }, {
      year: 2021,
      price: 5.40
    }, {
      year: 2022,
      price: 5.16
    }, {
      year: 2023,
      price: 4.99
    }, {
      year: 2024,
      price: 5.10
    }, {
      year: 2025,
      price: 5.75
    }, {
      year: 2026,
      price: 5.72
    }]
  },
  'SAR': {
    label: 'Saudi Riyal / USD',
    color: '#fbbf24',
    unit: 'SAR',
    note: 'Fixed 3.75 rate since 1986 / petrodollar system',
    data: [{
      year: 1975,
      price: 3.52
    }, {
      year: 1980,
      price: 3.33
    }, {
      year: 1986,
      price: 3.75
    }, {
      year: 1995,
      price: 3.75
    }, {
      year: 2000,
      price: 3.75
    }, {
      year: 2010,
      price: 3.75
    }, {
      year: 2020,
      price: 3.75
    }, {
      year: 2024,
      price: 3.75
    }, {
      year: 2026,
      price: 3.75
    }]
  },
  'AED': {
    label: 'UAE Dirham / USD',
    color: '#f97316',
    unit: 'AED',
    note: 'Fixed 3.6725 rate since 1997 / Dubai financial center',
    data: [{
      year: 1978,
      price: 3.94
    }, {
      year: 1985,
      price: 3.67
    }, {
      year: 1990,
      price: 3.67
    }, {
      year: 1997,
      price: 3.6725
    }, {
      year: 2000,
      price: 3.6725
    }, {
      year: 2010,
      price: 3.6725
    }, {
      year: 2020,
      price: 3.6725
    }, {
      year: 2024,
      price: 3.6725
    }, {
      year: 2026,
      price: 3.673
    }]
  },
  'RUB': {
    label: 'Russian Ruble / USD',
    color: '#94a3b8',
    unit: 'RUB',
    note: '1998 default / 2014 Crimea sanctions / 2022 Ukraine war',
    data: [{
      year: 1992,
      price: 0.414
    }, {
      year: 1995,
      price: 4.640
    }, {
      year: 1998,
      price: 9.705
    }, {
      year: 1999,
      price: 27.00
    }, {
      year: 2000,
      price: 28.13
    }, {
      year: 2005,
      price: 28.28
    }, {
      year: 2008,
      price: 24.86
    }, {
      year: 2009,
      price: 31.72
    }, {
      year: 2013,
      price: 31.84
    }, {
      year: 2014,
      price: 38.42
    }, {
      year: 2015,
      price: 61.07
    }, {
      year: 2018,
      price: 62.71
    }, {
      year: 2020,
      price: 72.13
    }, {
      year: 2022,
      price: 64.39
    }, {
      year: 2023,
      price: 85.24
    }, {
      year: 2024,
      price: 88.00
    }, {
      year: 2025,
      price: 88.00
    }, {
      year: 2026,
      price: 88.60
    }]
  },
  'SGD': {
    label: 'Singapore Dollar / USD',
    color: '#06b6d4',
    unit: 'SGD',
    note: 'MAS active management / one of Asia’s strongest currencies / resilient since the 1997 crisis',
    data: [{
      year: 1967,
      price: 3.06
    }, {
      year: 1975,
      price: 2.37
    }, {
      year: 1980,
      price: 2.14
    }, {
      year: 1985,
      price: 2.20
    }, {
      year: 1990,
      price: 1.81
    }, {
      year: 1995,
      price: 1.42
    }, {
      year: 1998,
      price: 1.67
    }, {
      year: 2000,
      price: 1.72
    }, {
      year: 2005,
      price: 1.66
    }, {
      year: 2007,
      price: 1.51
    }, {
      year: 2009,
      price: 1.45
    }, {
      year: 2011,
      price: 1.26
    }, {
      year: 2015,
      price: 1.42
    }, {
      year: 2018,
      price: 1.35
    }, {
      year: 2020,
      price: 1.38
    }, {
      year: 2022,
      price: 1.38
    }, {
      year: 2023,
      price: 1.34
    }, {
      year: 2024,
      price: 1.34
    }, {
      year: 2025,
      price: 1.35
    }, {
      year: 2026,
      price: 1.352
    }]
  },
  'HKD': {
    label: 'Hong Kong Dollar / USD',
    color: '#f43f5e',
    unit: 'HKD',
    note: '7.75-7.85 band since 1983 / pegged system / global financial center',
    data: [{
      year: 1974,
      price: 5.07
    }, {
      year: 1980,
      price: 4.98
    }, {
      year: 1983,
      price: 7.78
    }, {
      year: 1990,
      price: 7.79
    }, {
      year: 1995,
      price: 7.73
    }, {
      year: 1998,
      price: 7.74
    }, {
      year: 2000,
      price: 7.79
    }, {
      year: 2010,
      price: 7.77
    }, {
      year: 2018,
      price: 7.84
    }, {
      year: 2020,
      price: 7.76
    }, {
      year: 2022,
      price: 7.85
    }, {
      year: 2024,
      price: 7.79
    }, {
      year: 2025,
      price: 7.77
    }, {
      year: 2026,
      price: 7.765
    }]
  },
  'MXN': {
    label: 'Mexican Peso / USD',
    color: '#84cc16',
    unit: 'MXN',
    note: '1994 Tequila crisis / NAFTA-USMCA / strong correlation with the U.S.',
    data: [{
      year: 1976,
      price: 20.5
    }, {
      year: 1985,
      price: 371.0
    }, {
      year: 1988,
      price: 2298.0
    }, {
      year: 1994,
      price: 3.4
    }, {
      year: 1995,
      price: 6.42
    }, {
      year: 2000,
      price: 9.46
    }, {
      year: 2005,
      price: 10.90
    }, {
      year: 2008,
      price: 13.16
    }, {
      year: 2011,
      price: 13.93
    }, {
      year: 2015,
      price: 15.87
    }, {
      year: 2017,
      price: 18.93
    }, {
      year: 2019,
      price: 19.26
    }, {
      year: 2020,
      price: 21.49
    }, {
      year: 2023,
      price: 17.18
    }, {
      year: 2024,
      price: 17.80
    }, {
      year: 2025,
      price: 20.50
    }, {
      year: 2026,
      price: 20.14
    }]
  },
  'SEK': {
    label: 'Swedish Krona / USD',
    color: '#38bdf8',
    unit: 'SEK',
    note: '1992 currency crisis / Riksbank negative rates / Scandinavian economy',
    data: [{
      year: 1970,
      price: 5.17
    }, {
      year: 1980,
      price: 4.23
    }, {
      year: 1985,
      price: 8.60
    }, {
      year: 1990,
      price: 5.92
    }, {
      year: 1992,
      price: 7.78
    }, {
      year: 1995,
      price: 7.13
    }, {
      year: 2000,
      price: 9.17
    }, {
      year: 2005,
      price: 7.47
    }, {
      year: 2009,
      price: 7.65
    }, {
      year: 2011,
      price: 6.49
    }, {
      year: 2015,
      price: 8.43
    }, {
      year: 2018,
      price: 8.69
    }, {
      year: 2020,
      price: 9.21
    }, {
      year: 2022,
      price: 10.12
    }, {
      year: 2023,
      price: 10.62
    }, {
      year: 2024,
      price: 10.42
    }, {
      year: 2025,
      price: 10.75
    }, {
      year: 2026,
      price: 10.82
    }]
  },
  'NOK': {
    label: 'Norwegian Krone / USD',
    color: '#22d3ee',
    unit: 'NOK',
    note: 'Petrol fonu destekli ekonomi / Kroner petrol fiyatlariyla korelasyon',
    data: [{
      year: 1970,
      price: 7.14
    }, {
      year: 1980,
      price: 4.94
    }, {
      year: 1985,
      price: 8.60
    }, {
      year: 1990,
      price: 6.26
    }, {
      year: 1995,
      price: 6.34
    }, {
      year: 2000,
      price: 8.80
    }, {
      year: 2005,
      price: 6.44
    }, {
      year: 2009,
      price: 6.29
    }, {
      year: 2011,
      price: 5.60
    }, {
      year: 2015,
      price: 8.06
    }, {
      year: 2018,
      price: 8.13
    }, {
      year: 2020,
      price: 9.42
    }, {
      year: 2022,
      price: 9.72
    }, {
      year: 2023,
      price: 10.56
    }, {
      year: 2024,
      price: 10.58
    }, {
      year: 2025,
      price: 10.88
    }, {
      year: 2026,
      price: 10.94
    }]
  },
  'ZAR': {
    label: 'South African Rand / USD',
    color: '#22c55e',
    unit: 'ZAR',
    note: 'End of apartheid 1994 / gold-platinum economy / political instability',
    data: [{
      year: 1970,
      price: 0.72
    }, {
      year: 1980,
      price: 0.78
    }, {
      year: 1985,
      price: 2.23
    }, {
      year: 1990,
      price: 2.59
    }, {
      year: 1994,
      price: 3.55
    }, {
      year: 1998,
      price: 5.53
    }, {
      year: 2002,
      price: 10.54
    }, {
      year: 2006,
      price: 6.77
    }, {
      year: 2009,
      price: 8.43
    }, {
      year: 2011,
      price: 7.26
    }, {
      year: 2016,
      price: 15.68
    }, {
      year: 2019,
      price: 14.45
    }, {
      year: 2020,
      price: 16.46
    }, {
      year: 2022,
      price: 16.37
    }, {
      year: 2023,
      price: 18.45
    }, {
      year: 2024,
      price: 18.30
    }, {
      year: 2025,
      price: 18.30
    }, {
      year: 2026,
      price: 18.42
    }]
  }
};

// ── Commodity/Forex historical chart component ──
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

const LMP_METALS = [{
  sym: 'GC=F',
  name: 'Gold',
  icon: '◆',
  unit: '$/oz',
  fb: {
    p: 3125,
    q: 3098
  }
}, {
  sym: 'SI=F',
  name: 'Silver',
  icon: '◆',
  unit: '$/oz',
  fb: {
    p: 34.80,
    q: 34.20
  }
}, {
  sym: 'PL=F',
  name: 'Platinum',
  icon: '⚪',
  unit: '$/oz',
  fb: {
    p: 975,
    q: 968
  }
}, {
  sym: 'PA=F',
  name: 'Palladium',
  icon: '◆',
  unit: '$/oz',
  fb: {
    p: 1020,
    q: 1008
  }
}, {
  sym: 'HG=F',
  name: 'Copper',
  icon: '· ',
  unit: '$/lb',
  fb: {
    p: 5.12,
    q: 5.08
  }
}, {
  sym: 'ALI=F',
  name: 'Aluminum',
  icon: '⬜',
  unit: '$/MT',
  fb: {
    p: 2480,
    q: 2440
  }
}, {
  sym: 'GLD',
  name: 'Gold ETF(GLD)',
  icon: '◆',
  unit: '$/share',
  fb: {
    p: 285,
    q: 282
  }
}, {
  sym: 'SLV',
  name: 'Silver ETF(SLV)',
  icon: '◆',
  unit: '$/share',
  fb: {
    p: 31.5,
    q: 31.1
  }
}];
const LMP_ENERGY = [{
  sym: 'CL=F',
  name: 'Crude Oil (WTI)',
  icon: '◆',
  unit: '$/barrel',
  fb: {
    p: 68.40,
    q: 67.80
  }
}, {
  sym: 'BZ=F',
  name: 'Brent Oil',
  icon: '◆',
  unit: '$/barrel',
  fb: {
    p: 72.10,
    q: 71.40
  }
}, {
  sym: 'NG=F',
  name: 'Natural Gas',
  icon: '◆',
  unit: '$/MMBtu',
  fb: {
    p: 4.12,
    q: 4.05
  }
}, {
  sym: 'RB=F',
  name: 'Gasoline (RBOB)',
  icon: '⛽',
  unit: '$/gal',
  fb: {
    p: 2.18,
    q: 2.14
  }
}, {
  sym: 'HO=F',
  name: 'Heating Oil/Diesel',
  icon: '⛽',
  unit: '$/gal',
  fb: {
    p: 2.42,
    q: 2.38
  }
}, {
  sym: 'EB=F',
  name: 'Ethanol',
  icon: '◆',
  unit: '$/gal',
  fb: {
    p: 1.62,
    q: 1.59
  }
}, {
  sym: 'USO',
  name: 'Oil ETF (USO)',
  icon: '◆',
  unit: '$/share',
  fb: {
    p: 68.80,
    q: 68.10
  }
}, {
  sym: 'UNG',
  name: 'Gas ETF (UNG)',
  icon: '◆',
  unit: '$/share',
  fb: {
    p: 15.40,
    q: 15.10
  }
}];
const LMP_FOREX = [{
  code: 'EUR',
  name: 'Euro',
  flag: '◆',
  fb: 0.9180
}, {
  code: 'GBP',
  name: 'British Pound',
  flag: '◆',
  fb: 0.7880
}, {
  code: 'JPY',
  name: 'Japanese Yen',
  flag: '◆',
  fb: 148.60
}, {
  code: 'CNY',
  name: 'Chinese Yuan',
  flag: '◆',
  fb: 7.2800
}, {
  code: 'CHF',
  name: 'Swiss Franc',
  flag: '◆',
  fb: 0.8980
}, {
  code: 'AUD',
  name: 'Australian Dollar',
  flag: '◆',
  fb: 1.5820
}, {
  code: 'CAD',
  name: 'Canadian Dollar',
  flag: '◆',
  fb: 1.4380
}, {
  code: 'TRY',
  name: 'Turkish Lira',
  flag: '◆',
  fb: 38.400
}, {
  code: 'KRW',
  name: 'Korean Won',
  flag: '◆',
  fb: 1388.0
}, {
  code: 'INR',
  name: 'Indian Rupee',
  flag: '◆',
  fb: 86.200
}, {
  code: 'BRL',
  name: 'Brazilian Real',
  flag: '◆',
  fb: 5.7200
}, {
  code: 'SAR',
  name: 'Saudi Riyal',
  flag: '◆',
  fb: 3.7500
}, {
  code: 'AED',
  name: 'UAE Dirham',
  flag: '◆',
  fb: 3.6730
}, {
  code: 'RUB',
  name: 'Russian Ruble',
  flag: '◆',
  fb: 88.600
}, {
  code: 'SGD',
  name: 'Singapore Dollar',
  flag: '◆',
  fb: 1.3520
}, {
  code: 'HKD',
  name: 'Hong Kong Dollar',
  flag: '◆',
  fb: 7.7650
}, {
  code: 'MXN',
  name: 'Mexican Peso',
  flag: '◆',
  fb: 20.140
}, {
  code: 'ZAR',
  name: 'South African Rand',
  flag: '◆',
  fb: 18.420
}, {
  code: 'SEK',
  name: 'Swedish Krona',
  flag: '◆',
  fb: 10.820
}, {
  code: 'NOK',
  name: 'Norwegian Krone',
  flag: '◆',
  fb: 10.940
}];



// ======================================================================
// REAL-TIME PRICE ENGINE - Finnhub v2 (sequential + 429 handling)

// ======================================================================
// REAL-TIME PRICE ENGINE — Finnhub ONLY
// ======================================================================

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
  console.log('[Finnhub] Sequential fetch: ' + tickers.length + ' symbols @ 2s/req');
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
  console.log('[Finnhub] Done: ' + Object.keys(results).length + '/' + tickers.length);
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
    addToast(`${c.name} · ${qty} units bought · $${total}`, "success", "◆");
  }, [addToast]);
  const toggleCart = useCallback((ticker, name) => {
    setCart(s => {
      const n = new Set(s);
      const wasIn = n.has(ticker);
      wasIn ? n.delete(ticker) : n.add(ticker);
      // Fix 3: Toast mesaji closure'daki eski `cart` degil, guncel `wasIn` uzerinden turetiliyor
      addToast(wasIn ? `${name} ${t('cartRemoved')}` : `${name} ${t('basketAdded')}`, "success", "◆");
      return n;
    });
  }, [addToast]);
  const toggleWatch = useCallback((ticker, name) => {
    setWatchlist(s => {
      const n = new Set(s);
      const wasIn = n.has(ticker);
      wasIn ? n.delete(ticker) : n.add(ticker);
      // Fix 3: Toast mesaji closure'daki eski `watchlist` degil, guncel `wasIn` uzerinden turetiliyor
      addToast(wasIn ? `${name} ${t('watchRemoved')}` : `${name} ${t('watchAdded')}`, "success", "◆");
      return n;
    });
  }, [addToast]);
  const handleSetAlert = useCallback((c, pct) => {
    setAlerts(a => ({
      ...a,
      [c.ticker]: pct
    }));
    setAlertModal(null);
    addToast(`${c.name} +%${pct} ${t('alertCreated')}`, "warn", "◆");
  }, [addToast]);
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
  }, [addToast]);
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
  var _pe = React.useState(localStorage.getItem('gma_paddle_env')||'production'); var paddleEnv=_pe[0]; var setPaddleEnv=_pe[1];
  var _pd = React.useState(localStorage.getItem('gma_price_daily')||''); var priceD=_pd[0]; var setPriceD=_pd[1];
  var _pm = React.useState(localStorage.getItem('gma_price_monthly')||''); var priceM=_pm[0]; var setPriceM=_pm[1];
  var _py = React.useState(localStorage.getItem('gma_price_yearly')||''); var priceY=_py[0]; var setPriceY=_py[1];
  var _sv = React.useState(false); var saved=_sv[0]; var setSaved=_sv[1];

  function save() {
    if (finnhubKey.trim()) localStorage.setItem('gma_finnhub_key', finnhubKey.trim());
    if (apiKey.trim()) localStorage.setItem('gma_platform_key', apiKey.trim());
    if (googleId.trim()) localStorage.setItem('gma_google_client_id', googleId.trim());
    if (paddleVid.trim()) localStorage.setItem('gma_paddle_vendor_id', paddleVid.trim());
    localStorage.setItem('gma_paddle_env', paddleEnv);
    if (priceD.trim()) localStorage.setItem('gma_price_daily', priceD.trim());
    if (priceM.trim()) localStorage.setItem('gma_price_monthly', priceM.trim());
    if (priceY.trim()) localStorage.setItem('gma_price_yearly', priceY.trim());
    setSaved(true);
    setTimeout(function(){setSaved(false);}, 2500);
  }

  function clearAll() {
    if (!window.confirm('Clear all saved keys?')) return;
    ['gma_finnhub_key','gma_platform_key','gma_google_client_id','gma_paddle_vendor_id','gma_paddle_env',
     'gma_price_daily','gma_price_monthly','gma_price_yearly'].forEach(function(k){localStorage.removeItem(k);});
    setFinnhubKey(''); setApiKey(''); setGoogleId(''); setPaddleVid(''); setPaddleEnv('production');
    setPriceD(''); setPriceM(''); setPriceY('');
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
      React.createElement("div",{style:S.label},"VENDOR ID"),
      React.createElement("input",{type:"text",value:paddleVid,onChange:function(e){setPaddleVid(e.target.value);},placeholder:"123456",style:S.input}),
      React.createElement("div",{style:S.label},"ENVIRONMENT"),
      React.createElement("select",{value:paddleEnv,onChange:function(e){setPaddleEnv(e.target.value);},style:S.select},
        React.createElement("option",{value:"production"},"production"),
        React.createElement("option",{value:"sandbox"},"sandbox (test)")
      ),
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
    id: 'strategist', label: 'Strategist', labelKey: 'planStrategistLabel', price: 49.99, period: '/mo', periodKey: 'periodMonth',
    credits: 999, color: '#b6c2d0', multiAI: true,
    badge: 'MOST POPULAR', badgeKey: 'planStrategistBadge', scope: 'Unlimited · All Sectors', scopeKey: 'planStrategistScope', statsKey: 'planStrategistStats'
  },
  pro_architect: {
    id: 'pro_architect', label: 'Pro-Architect', labelKey: 'planProArchitectLabel', price: 99.99, period: '/mo', periodKey: 'periodMonth',
    credits: 999, color: '#c2a15a', multiAI: true,
    badge: 'SOVEREIGN', badgeKey: 'planProArchitectBadge', scope: 'Global + Signal DNA · 126 Years', scopeKey: 'planProArchitectScope', statsKey: 'planProArchitectStats'
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
    var vendorId = PADDLE_VENDOR_ID();
    setStep('processing');
    if (!vendorId) { setTimeout(function(){setStep('success');onSuccess&&onSuccess(plan.id);},1200); return; }
    if (!window.Paddle) {
      var s=document.createElement('script'); s.src='https://cdn.paddle.com/paddle/paddle.js';
      s.onload=function(){openPaddle(vendorId,priceId)};
      s.onerror=function(){setErrMsg('Paddle.js could not be loaded.');setStep('error')};
      document.head.appendChild(s);
    } else { openPaddle(vendorId, priceId); }
  }
  function openPaddle(vendorId, priceId) {
    try {
      window.Paddle.Environment.set(PADDLE_ENV());
      window.Paddle.Setup({vendor:parseInt(vendorId,10)});
      window.Paddle.Checkout.open({
        product: priceId||plan.id, email: user&&user.email?user.email:'',
        successCallback:function(){setStep('success');onSuccess&&onSuccess(plan.id)},
        closeCallback:function(){setStep('confirm')}
      });
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
    style: {
      minHeight: '100vh',
      background: '#060912',
      color: '#e2e8f0',
      fontFamily: "'Courier New',monospace",
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
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
    style: {
      fontSize: '17px',
      color: '#d6b46f',
      letterSpacing: '0.12em',
      marginBottom: '18px'
    }
  }, "\u25C8 GLOBAL MARKET ANALYTICS \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
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
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
      gap: '16px'
    }
  }, features.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.title,
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

  var inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid #1e293b',
    borderRadius:'8px', padding:'9px 12px', color:'#e2e8f0', fontSize:'15px',
    fontFamily:"'Courier New',monospace", outline:'none', boxSizing:'border-box', marginBottom:'8px' };
  var card = { background:'linear-gradient(145deg,#0c1220,#080d18)', border:'1px solid #1a2744',
    borderRadius:'14px', padding:'20px', marginBottom:'14px' };
  var lbl = { fontSize:'13px', color:'#64748b', letterSpacing:'0.07em', display:'block', marginBottom:'4px' };

  return React.createElement(React.Fragment, null,
    editDNAField && React.createElement(OnboardingOverlay, {
      user: user,
      editOnlyId: editDNAField,
      initialAnswers: (function(){ try { return JSON.parse(localStorage.getItem('gma_user_dna_'+user.email))||{}; } catch { return {}; } })(),
      onSingleEditDone: function(newAns){ setEditDNAField(null); }
    }),
    React.createElement("div",
    {style:{minHeight:'100vh',background:'linear-gradient(160deg,#060912,#080e1e)',color:'#e2e8f0',fontFamily:"'Courier New',monospace",padding:'28px 20px'}},
    React.createElement("div",{style:{maxWidth:'740px',margin:'0 auto'}},

      React.createElement("div",{style:{fontSize:'13px',color:'#38bdf8',letterSpacing:'0.10em',marginBottom:'6px'}},"\u25c8 GLOBAL MARKET ANALYTICS"),
      React.createElement("h1",{style:{fontSize:'22px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'22px'}},t('accountMgmt')),

      /* Profile Card */
      React.createElement("div",{style:card},
        React.createElement("div",{style:{display:'flex',alignItems:'center',gap:'18px',marginBottom:'18px'}},
          React.createElement("div",{
            onClick:function(){fileRef.current&&fileRef.current.click();},
            style:{width:'76px',height:'76px',borderRadius:'14px',cursor:'pointer',overflow:'hidden',
              border:'2px solid rgba(56,189,248,0.3)',flexShrink:0,position:'relative',
              background:photo?'transparent':'linear-gradient(135deg,#0ea5e9,#6366f1)',
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
                background:editProf?'rgba(248,113,113,0.12)':'rgba(56,189,248,0.1)',
                border:'1px solid '+(editProf?'rgba(248,113,113,0.3)':'rgba(56,189,248,0.3)'),
                borderRadius:'9px',color:editProf?'#f87171':'#38bdf8',
                cursor:'pointer',fontSize:'14px',fontFamily:'inherit',fontWeight:'bold'}},
              editProf?'\u2715 ' + t('cancel'):'\u270f ' + t('edit'))
          )
        ),
        !editProf&&prof.bio&&React.createElement("div",{style:{fontSize:'14px',color:'#94a3b8',lineHeight:1.7,padding:'10px',background:'rgba(255,255,255,0.03)',borderRadius:'8px',marginBottom:'12px'}},prof.bio),
        editProf&&React.createElement("div",null,
          React.createElement("div",{style:{fontSize:'13px',color:'#38bdf8',letterSpacing:'0.07em',marginBottom:'12px',borderBottom:'1px solid #0f172a',paddingBottom:'8px'}},"\ud83d\udc64 ", t('personalInfo')),
          React.createElement("div",{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'8px'}},
            React.createElement("div",null,React.createElement("span",{style:lbl},t('fullname')),React.createElement("input",{value:prof.name,onChange:function(e){setProf(function(p){return Object.assign({},p,{name:e.target.value});});},placeholder:t('namePlaceholder'),style:inp})),
            React.createElement("div",null,React.createElement("span",{style:lbl},t('city')),React.createElement("input",{value:prof.city,onChange:function(e){setProf(function(p){return Object.assign({},p,{city:e.target.value});});},placeholder:"Tashkent",style:inp})),
            React.createElement("div",null,React.createElement("span",{style:lbl},t('email')),React.createElement("input",{value:prof.email,onChange:function(e){setProf(function(p){return Object.assign({},p,{email:e.target.value});});},type:"email",style:inp})),
            React.createElement("div",null,React.createElement("span",{style:lbl},t('phone')),React.createElement("input",{value:prof.phone,onChange:function(e){setProf(function(p){return Object.assign({},p,{phone:e.target.value});});},placeholder:"+998 90 000 00 00",style:inp}))
          ),
          React.createElement("div",{style:{display:'flex',gap:'10px'}},
            React.createElement("button",{onClick:handleSaveProf,style:{flex:2,padding:'10px',background:'linear-gradient(135deg,#0ea5e9,#6366f1)',border:'none',borderRadius:'9px',color:'#fff',cursor:'pointer',fontSize:'15px',fontFamily:'inherit',fontWeight:'bold'}},"💾 ", t('saveProfile')),
            React.createElement("button",{onClick:function(){setEditProf(false);},style:{flex:1,padding:'10px',background:'transparent',border:'1px solid #1e293b',borderRadius:'9px',color:'#64748b',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}},t('cancel'))
          ),
          profSaved&&React.createElement("div",{style:{marginTop:'8px',fontSize:'14px',color:'#34d399'}},"✔ ", t('profileSaved'))
        )
      ),

      /* GMA DNA Card */
      React.createElement(GMA_DNA_Card, {user:user, onEditField:function(k){ setEditDNAField(k); }}),

      /* Status pill - top right */
      React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:"8px"}},
        React.createElement("div",{style:{
          padding:"4px 12px",
          background:"rgba(251,191,36,0.08)",
          border:"1px solid rgba(251,191,36,0.25)",
          borderRadius:"999px",fontSize:"11px",color:"#fbbf24",
          letterSpacing:"0.05em",fontWeight:"500"
        }}, planData ? ((GMA_PLANS[planData.planId]||{}).label||planData.planId) + " " + t('member') : t('freeMember'))
      ),
      /* GMA Core Card */
      React.createElement("div",{style:Object.assign({},card,{border:"1px solid rgba(167,139,250,0.2)",textAlign:"center",padding:"28px 20px"})},
        React.createElement("div",{style:{fontSize:"11px",color:"#64748b",letterSpacing:"0.15em",marginBottom:"8px"}},"\u25c8 ", t('gmaCore')),
        React.createElement("div",{style:{fontSize:"22px",fontWeight:"300",color:"#e2e8f0",marginBottom:"6px",letterSpacing:"0.02em"}},t('intelligenceLayerActive')),
        React.createElement("div",{style:{fontSize:"11px",color:"#38bdf8",letterSpacing:"0.08em"}},t('consensusSystem'))
      ),
      /* Kredi & Plan Card */
      React.createElement("div",{style:Object.assign({},card,{border:'1px solid rgba(167,139,250,0.2)'})},
        React.createElement("div",{style:{fontSize:'13px',color:'#a78bfa',letterSpacing:'0.08em',marginBottom:'14px'}},"\ud83d\udcca ", t('analysisCredits')),
        React.createElement("div",{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',letterSpacing:'0.05em',marginBottom:'4px'}},t('strategicAnalysis')),
            React.createElement("div",{style:{fontSize:'28px',fontWeight:'300',color:creditsColor,letterSpacing:'0.02em'}}, credits + ' / ' + creditTotal),
            React.createElement("div",{style:{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}, credits === 0 ? t('accessExhausted') : t('creditsRemaining'))
          ),
          React.createElement("button",{
            onClick:function(){onNavigate('pricing');},
            style:{padding:'8px 16px',background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.3)',
              borderRadius:'8px',color:'#a78bfa',cursor:'pointer',fontSize:'12px',fontFamily:'inherit',fontWeight:'bold'}},
            "🚀 ", t('upgrade'))
        ),
        React.createElement("div",{style:{
          background:'linear-gradient(135deg,rgba(251,191,36,0.06),rgba(56,189,248,0.04))',
          border:'1px solid rgba(251,191,36,0.15)',
          borderRadius:'10px',padding:'12px 14px',marginBottom:'10px',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'
        }},
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:'11px',color:'#64748b',letterSpacing:'0.08em',marginBottom:'2px'}},'\u25c8 ', t('accuracyIndex')),
            React.createElement('div',{style:{fontSize:'20px',fontWeight:'300',color:'#fbbf24',letterSpacing:'0.02em'}},'84%')
          ),
          React.createElement('div',{style:{fontSize:'10px',color:'#94a3b8',textAlign:'right',lineHeight:1.4}},
            React.createElement('div',null,t('verifiedBy')),
            React.createElement('div',{style:{color:'#38bdf8'}},t('yearsOfData'))
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
            style:{padding:'9px 16px',background:'rgba(56,189,248,0.1)',border:'1px solid rgba(56,189,248,0.3)',
              borderRadius:'9px',color:'#38bdf8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit',fontWeight:'bold'}},
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
    id: 'risk', label: 'Your Investment Style?',
    options: [
      {v:'cube',    l:'Cube',    icon:'\u25a0', detail:'Conservative'},
      {v:'prism',   l:'Prism',      icon:'\u25c6', detail:'Balanced'},
      {v:'pyramid', l:'Pyramid',     icon:'\u25b2', detail:'Aggressive'}
    ]
  },
  {
    id: 'timeframe', label: 'Your Investment Timeframe?',
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

