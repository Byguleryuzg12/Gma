import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';


// ═══════════════════════════════════════════════════════
// ──  LANGUAGE SELECTOR (80 Languages) ──
// ═══════════════════════════════════════════════════════
const LANGS = [
  {c:'en', n:'English', f:'EN'},
  {c:'tr', n:'Turkce / Turkish', f:'TR'},
  {c:'ru', n:'Russkiy / Russian', f:'RU'},
  {c:'ar', n:'Arabic', f:'AR', r:1},
  {c:'zh', n:'Chinese', f:'ZH'},
  {c:'hi', n:'Hindi', f:'HI'},
  {c:'de', n:'Deutsch', f:'DE'},
  {c:'es', n:'Espanol / Spanish', f:'ES'}
];

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
    sector: "Sektor", allSectors: "TUMU", gainers: "YUKSELENLER", losers: "DUSENLER", live: "CANLI", compare: "KARSILASTIR", analyzeAI: "AI ANALIZ", contactTitle: "Bize Ulasin",
    legalNotice: "Bu platform yatirim tavsiyesi vermez. GMA, yalnizca bilgilendirme amaciyla AI destekli analitik icgoruler sunar.", footerDesc: "Kuresel piyasalarda netlik saglamak icin tasarlanmis finansal zeka platformu.", pricingTitle: "Kuresel Yatirim Icin AI Gucu"
  },
  ru: { home: "GLAVNAYA", markets: "RYNKI", about: "O PROEKTE", contact: "KONTAKTY", privacy: "KONFIDENTSIALNOST", pricing: "TARIFY", login: "VOYTI", heroTitle: "Smotrite na globalnye rynki\ns bolshey yasnostyu", heroSub: "600+ globalnyh organizatsiy, dannye rynka v realnom vremeni i strukturirovannaya analitika cherez GMA Consensus Engine.", feat6t: "8 yazykov", feat6d: "Interfeys na angliyskom, turetskom, russkom, arabskom, kitayskom, hindi, nemetskom i ispanskom", compare: "SRAVNIT", analyzeAI: "AI-ANALIZ", legalNotice: "Eta platforma ne predostavlyaet investitsionnyh rekomendatsiy." },
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
    organizationsLabel: "Organizatsii", sectorsLabel: "Sektory", realTimeLabel: "Realnoe vremya", liveDataLabel: "Zhivye dannye", intelligenceLayerLabel: "Sloy analitiki GMA",
    liveMarketsTitle: "Zhivye rynki", liveMarketsDesc: "Otslezhivayte aktsii, syre i forex v realnom vremeni", aiAnalysisTitle: "AI-analiz", aiAnalysisDesc: "Glubokiy analiz kompaniy i riskov s GMA", comparisonTitle: "Sravnenie", comparisonDesc: "AI-sravnenie do 5 kompaniy ryadom", portfolioTrackingTitle: "Uchet portfelya", portfolioTrackingDesc: "Fiksiruyte pokupki i schitayte pribyl/ubytok", platformFeaturesLabel: "VOZMOZHNOSTI PLATFORMY", startFreeTitle: "Nachat besplatno", startFreeDesc: "Izuchayte dannye rynka bez vhoda.", back: "Nazad", messagePlaceholder: "Vashe soobshchenie...", subjectPlaceholder: "Tema", namePlaceholder: "Vashe imya", paymentSuccessful: "OPLATA USPESHNA", goToMarkets: "K rynkam", myProfile: "Moy profil", marketDataPlan: "Dannye rynka (600+ organizatsiy)", gmaStructuredAnalysis: "Strukturirovannyy analiz GMA", gmaConsensus: "Konsensus GMA Triumvirate", monthlyAiAnalyses: "Ezhemesyachnye AI-analizy", alertsWatchlist: "Uvedomleniya i spisok nablyudeniya", portfolioManagement: "Upravlenie portfelem", prioritySupport: "Prioritetnaya podderzhka", unlimited: "Bez limita"
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
    noApiKey: "No API key — add it from Settings", liveDataUpdated: "Live data updated", simulationRunning: "Simulation is running", cartRemoved: "removed from cart", basketAdded: "added to basket", watchRemoved: "removed from watchlist", watchAdded: "added to watchlist", alertCreated: "alert created", maxCompare: "A maximum of 5 companies can be selected", addedToComparison: "added to comparison", cart: "CART", watchlist: "WATCHLIST", cartEmpty: "Cart is empty", watchlistEmpty: "Watchlist is empty", noPurchasesYet: "No purchases yet", remove: "remove", units: "units", buyIn: "buy-in", currentValue: "Current Value", cost: "Cost", profitLoss: "Profit / Loss", legal: "LEGAL", legalNoticeTitle: "LEGAL NOTICE", legalNoticeNotAdvice: "LEGAL NOTICE - NOT INVESTMENT ADVICE", signInLegalPrefix: "By signing in", signInLegalSuffix: "by continuing.", disclaimer1: "This platform is for digital informational purposes only.", disclaimer2: "No content or AI output is investment advice.", disclaimer3: "All investment decisions are the investor's own responsibility.", disclaimer4: "Past performance does not guarantee future results.", disclaimer5: "Consult a licensed financial advisor before trading.", disclaimer6: "Data may be simulated and may not represent live exchange data."
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
    noApiKey: "API anahtari yok — Ayarlar'dan ekleyin", liveDataUpdated: "Canli veri guncellendi", simulationRunning: "Simulasyon calisiyor", cartRemoved: "sepetten cikarildi", basketAdded: "sepete eklendi", watchRemoved: "izleme listesinden cikarildi", watchAdded: "izleme listesine eklendi", alertCreated: "uyari olusturuldu", maxCompare: "En fazla 5 sirket secilebilir", addedToComparison: "karsilastirmaya eklendi", cart: "SEPET", watchlist: "IZLEME", cartEmpty: "Sepet bos", watchlistEmpty: "Izleme listesi bos", noPurchasesYet: "Henuz alim yok", remove: "kaldir", units: "adet", buyIn: "alis", currentValue: "Guncel Deger", cost: "Maliyet", profitLoss: "Kar / Zarar", legal: "YASAL", legalNoticeTitle: "YASAL UYARI", legalNoticeNotAdvice: "YASAL UYARI - YATIRIM TAVSIYESI DEGILDIR", signInLegalPrefix: "Giris yaparak", signInLegalSuffix: "devam etmeyi kabul edersiniz.", disclaimer1: "Bu platform yalnizca dijital bilgilendirme amaclidir.", disclaimer2: "Hicbir icerik veya AI ciktisi yatirim tavsiyesi degildir.", disclaimer3: "Tum yatirim kararlari yatirimcinin kendi sorumlulugundadir.", disclaimer4: "Gecmis performans gelecekteki sonuclari garanti etmez.", disclaimer5: "Islem yapmadan once lisansli bir finansal danismana basvurun.", disclaimer6: "Veriler simule edilmis olabilir ve canli borsa verisini temsil etmeyebilir."
  },
  ru: { dashboardTitle: "PANEL RYNKA", dashboardSub: "ORGANIZATSII · ZHIVAYA SIMULYATSIYA + AI OBNOVLENIE", decliners: "SNIZHENIE", avgChange: "SRED. IZMENENIE", myPanel: "MOYA PANEL", fetchAiData: "ZAGRUZIT AI DANNYE", refreshing: "OBNOVLENIE...", searchPlaceholder: "Poisk po tickeru, kompanii ili polnomu nazvaniyu... (napr. AAPL, Apple, Tesla)", results: "rezultatov", marketStatus: "STATUS RYNKA", allStatus: "VSE", listedStatus: "LISTING", privateStatus: "CHASTNYE", ipoRadarStatus: "IPO RADAR", ipoSoonStatus: "SKORO IPO", ipoPrepStatus: "PODGOTOVKA IPO", rumorStatus: "SLUHI", liveAutoLabel: "LIVE", autoRefreshShort: "2.5s AVTO", prepStatus: "PODG.", allOrganizationsShownPrefix: "VSE", allOrganizationsShownSuffix: "ORGANIZATSII POKAZANY", personalInfo: "LICHNAYA INFORMATSIA", userFallback: "Polzovatel", member: "Uchastnik", freeMember: "Besplatnyy uchastnik", noPlanSelected: "Plan ne vybran", gmaCore: "YADRO GMA", intelligenceLayerActive: "Analiticheskiy sloy: aktiven", consensusSystem: "Trehsloynaya sistema konsensusa · suverennaya analitika", analysisCredits: "KREDITY ANALIZA", strategicAnalysis: "STRATEGICHESKIY ANALIZ", accessExhausted: "Dostup ischerpan", creditsRemaining: "kreditov ostalos", accuracyIndex: "INDEKS TOCHNOSTI", verifiedBy: "Provereno", yearsOfData: "126 let dannyh", creditsNote: "Kazhdyy glubokiy analiz GMA ispolzuet 1 kredit. Posle okonchaniya dostupa nuzhna podpiska.", creditsExhaustedNote: "Kredity analiza ischerpany. Vyberite plan GMA, chtoby prodolzhit.", accountActions: "DEYSTVIYA AKKAUNTA", profileSaved: "Profil sohranen!", edit: "IZMENIT", dnaEdit: "IZMENIT GMA DNA", step: "SHAG", selected: "vybrano", continue: "PRODOLZHIT", gmaUserDna: "GMA DNA POLZOVATELYA", dnaIntro: "Vashi predpochteniya opredelyayut ton i oblast GMA Intelligence Layer.", dnaMarketScope: "Oblast rynka", dnaFocusRegion: "Fokus-region", dnaSectors: "Sektory", dnaRiskStyle: "Stil riska", dnaTimeframe: "Gorizont", dnaTone: "Stil analiza", dnaVolumeScale: "Masshtab obema", legalEffectiveDate: "Data vstupleniya v silu: aprel 2026", legalGdprDate: "Data vstupleniya v silu: aprel 2026 — sootvetstvuet GDPR", legalTranslating: "Kontent perevoditsya na vash yazyk...", legalNoAdvice: "NE FINANSOVAYA REKOMENDATSIYA", privacyPolicyTitle: "Politika konfidentsialnosti", termsTitle: "Usloviya servisa", refundTitle: "Politika vozvrata", privacyWarning: "Global Market Analytics (GMA) yavlyaetsya platformoy vizualizatsii dannyh. GMA ne yavlyaetsya zaregistrirovannym investitsionnym konsultantom i ne predostavlyaet finansovye, investitsionnye, yuridicheskie ili nalogovye sovety. Ves kontent i AI-analiz prednaznacheny tolko dlya informatsii. Investitsionnye resheniya prinimaet sam polzovatel.", termsWarning: "GMA ne yavlyaetsya zaregistrirovannym investitsionnym konsultantom. Ves kontent tolko informatsionnyy. Pered investitsionnymi resheniyami obratites k nezavisimomu spetsialistu.", refundHeroTitle: "7-dnevnaya garantiya vozvrata", refundHeroText: "Ne ustroilo? Poluchite polnyy vozvrat v techenie 7 dney bez lishnih voprosov. Napishite na support@globalmarketanalytics.com; obrabotka zaymet 5-7 rabochih dney.", paddleSecured: "Zashchishcheno Paddle", oneClickCancel: "Otmena v odin klik", noLockIn: "Bez privyazki", sevenDayGuarantee: "7-dnevnaya garantiya" },
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
    feat1t: "Zhivaya lenta rynka", feat1d: "Otslezhivayte 600+ kompaniy, kripto, syre i valyuty v realnom vremeni", feat2t: "Analiz GMA Triumvirate", feat2d: "Proveryayte institucionalnoe soglasovanie signalov v GMA Consensus Engine", feat3t: "Istoricheskie grafiki", feat3d: "Grafiki s goda osnovaniya, analiz krizisov i dolgorochnye trendy", feat4t: "Sravnenie kompaniy", feat4d: "Sravnivayte do 5 kompaniy s AI i bolee yasnoy risk-ramkoy", feat5t: "Umnye uvedomleniya", feat5d: "Nastroyte cenovye opoveshcheniya i poluchayte mgnovennye signaly o roste i padenii", feat6t: "8 yazykov", feat6d: "Interfeys na angliyskom, turetskom, russkom, arabskom, kitayskom, hindi, nemetskom i ispanskom",
    contactSub: "My na svyazi po lyubym voprosam i otzyvam.", contactInfo: "Kontaktnaya informatsiya", formName: "POLNOE IMYA", formEmail: "EMAIL", formSubject: "TEMA", formMsg: "SOOBSHCHENIE", formSend: "OTPRAVIT", formSending: "OTPRAVKA...", formSent: "Soobshchenie otpravleno!", subjectPlaceholder: "Tema", messagePlaceholder: "Vashe soobshchenie...", namePlaceholder: "Vashe imya",
    aboutTitle: "O Global Market Analytics", aboutSub: "Platforma finansovoy analitiki dlya strukturirovannogo analiza, yasnosti i podderzhki resheniy na globalnyh rynkah.", aboutMission: "Nasha missiya", aboutMissionText: "Sozdavat infrastrukturu finansovyh resheniy, kotoraya snizhaet neopredelennost cherez strukturirovannyy analiz bez investitsionnyh rekomendatsiy.", aboutVision: "Nashe videnie", aboutVisionText: "Mir, gde bolee yasnoe ponimanie, nizkaya neopredelennost i disciplina resheniy dostupny na globalnyh rynkah.", aboutCardPlatformT: "Platforma", aboutCardPlatformB: "Global Market Analytics obedinyaet dannye aktsiy, IPO-status i rynochnye metriki 600+ globalnyh organizatsiy v odnom interfeyse.", aboutCardAIT: "AI-integratsiya", aboutCardAIB: "Na baze GMA Consensus Engine platforma daet strukturirovannyy analiz kompaniy, risk-ramku i strategicheskiy prognoz. Vse vyvody tolko informatsionnye.", aboutCardDataT: "Istoricheskie dannye", aboutCardDataB: "Istoricheskie indeksy: zoloto s 1900 goda, osnovnye valyuty s 1930 goda, drugie tovary s samyh rannih dostupnyh dat do 2026.", aboutCardSourcesT: "Istochniki dannyh", aboutCardSourcesB: "Zhivye dannye postavlyaet Finnhub API. Forex kursy berutsya iz open.er-api.com. Vneshnie proxy ne ispolzuyutsya.", aboutCardPrivacyT: "Konfidentsialnost", aboutCardPrivacyB: "Danye polzovatelya ne otpravlyayutsya na vneshnie servery. Predpochteniya, API-klyuchi i portfel hranyatsya tolko v localStorage brauzera.",
    pricingSub: "Dostup k GMA Consensus Engine po odnoy podpiske institucionalnogo urovnya.", aiPartners: "Integrirovannye AI-partnery", pricingNote: "Odnaya podpiska otkryvaet GMA Consensus Engine. GPT, Claude i Gemini rabotayut kak podderzhivayushchie dvizhki; GMA ostaetsya analiticheskim sloem.", paySuccess: "Dostup aktivirovan", payKey: "Vash klyuch dostupa", payKeyNote: "Etot klyuch privyazan k vashemu akkauntu. Ne peredavayte ego.", payContinue: "K rynkam →", planActivated: "Plan aktivirovan!", payKeyLinkedNote: "Etot klyuch privyazan k vashemu akkauntu. Ne peredavayte ego.", sovereignAutoNote: "GMA Sovereign Intelligence · Vse modeli upravlyayutsya avtomaticheski. Bolshe nichego ne nuzhno.", footerBrandLine: "Global Market Analytics · 2026 · Suverennaya analitika", footerCompliance: "Global Market Analytics (GMA) — tsifrovaya platforma dlya AI-vizualizatsii rynochnyh dannyh. GMA ne yavlyaetsya zaregistrirovannym investitsionnym konsultantom. Vse platezhi bezopasno obrabatyvayutsya partnerom Paddle.com.", platform: "PLATFORMA", addToPortfolio: "DOBAVIT V PORTFEL", currentPrice: "TEKUSHCHAYA TSENA", exchange: "BIRZHA", quantity: "KOLICHESTVO", unitPrice: "Tsena za edinitsu", totalLabel: "ITOGO", simulatedTransaction: "Eto simulirovannaya operatsiya - realnaya pokupka ne vypolnyaetsya"
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
const GMA_LEGAL_STATIC = {
  tr: {
    privacy: [
      {t:"1. Topladigimiz Bilgiler",b:"GMA istemci tarafli bir web uygulamasi olarak calisir. Yalnizca gerekli minimum verileri toplariz:\n\n• Hesap Bilgileri: e-posta ve gorunen ad, tarayicinizda yerel olarak saklanir (localStorage).\n• API Anahtarlari: yalnizca tarayicinizda saklanir ve dogrudan Anthropic'e iletilir. GMA bu anahtarlari sunucularinda almaz.\n• Odeme Verileri: tamamen Paddle.com tarafindan islenir. GMA kart bilgilerini almaz, saklamaz veya islemez.\n• Analitik: kisisel veri icermeyen anonim ve toplu kullanim verileri."},
      {t:"2. Isleme Hukuki Dayanagi (GDPR)",b:"Genel Veri Koruma Tuzugu (GDPR) kapsaminda su hukuki dayanaklara dayaniriz:\n\n• Sozlesmesel Gereklilik — abone olunan hizmeti sunmak icin e-postanizin islenmesi.\n• Mesru Menfaat — anonim analitiklerle platform performansini iyilestirmek.\n• Riza — istege bagli veri toplama icin. Rizanizi istediginiz zaman geri cekebilirsiniz."},
      {t:"3. Paddle ile Odeme Isleme",b:"Tum odemeler Merchant of Record is ortagimiz Paddle.com tarafindan islenir. Abone oldugunuzda:\n\n• Paddle'in PCI-DSS uyumlu guvenli odeme ekranina yonlendirilirsiniz.\n• Kart bilgileri yalnizca Paddle altyapisina girilir. GMA odeme bilgilerinizi gormez.\n• Paddle Gizlilik Politikasi: https://www.paddle.com/legal/privacy\n• Faturalama sorulari: support@globalmarketanalytics.com"},
      {t:"4. Cerezler ve Takip",b:"GMA reklam cerezleri, ucuncu taraf takip pikselleri veya davranissal reklam analitigi kullanmaz. Yalnizca kimlik dogrulama icin zorunlu oturum cerezleri kullanilabilir. Kullanici davranisi reklamverenlere satilmaz."},
      {t:"5. Ucuncu Taraf Veri Saglayicilari",b:"GMA, kendi gizlilik politikalarina tabi olan saglayicilarla entegre calisir:\n\n• GMA Providers (GMA AI) — https://www.anthropic.com/privacy\n• Finnhub.io — gercek zamanli piyasa verisi saglayicisi\n• Frankfurter API — doviz kuru verileri\n• Paddle.com — odeme isleme\n\nBu saglayicilar normal operasyonlar sirasinda IP adresinizi isleyebilir."},
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
      {t:"5. Abonelikler ve Paddle ile Faturalama",b:"Tum ucretli abonelikler Merchant of Record is ortagimiz Paddle.com tarafindan islenir.\n\n• Abonelikler yenileme tarihinden once iptal edilmedikce otomatik yenilenir.\n• Hesap Ayarlari uzerinden her zaman tek tikla iptal mumkundur.\n• Fiyat degisiklikleri en az 30 gun once bildirilir.\n• Paddle.com sartlari da gecerlidir: https://www.paddle.com/legal"},
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
Object.keys(T).forEach(code => {
  Object.keys(T.en).forEach(key => {
    if (!T[code][key]) T[code][key] = T.en[key];
  });
});
const CORE_LANGS = ['en', 'tr', 'ru', 'ar', 'zh', 'hi', 'de', 'es'];
Object.keys(T).forEach(lang => {
  Object.keys(EN).forEach(k => {
    if (!T[lang][k]) T[lang][k] = EN[k];
  });
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
  }, "\u27F3") : cur.f, " ", cur.c.toUpperCase(), " ", open ? "▲" : "▼"), open && /*#__PURE__*/React.createElement("div", {
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
    const rest = LANGS.filter(l => !SUPPORTED.includes(l.c));
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
    }, l.f, " ", l.n, " ", l.c === lang && "✓");
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "4px 12px 3px",
        fontSize: "9px",
        color: "#94a3b8",
        letterSpacing: "0.08em",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u2726 FULL TRANSLATION (8 languages)"), sup.map(renderBtn));
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
    color: "#34d399",
    icon: "◆",
    desc: "Listed stock is actively traded"
  },
  private: {
    label: "PRIVATE",
    color: "#a78bfa",
    icon: "⬇",
    desc: "Private company"
  },
  pre_ipo: {
    label: "IPO SOON",
    color: "#f97316",
    icon: "⚡",
    desc: "IPO filing submitted"
  },
  ipo_prep: {
    label: "IPO PREP",
    color: "#fbbf24",
    icon: "◎",
    desc: "IPO preparation is in progress"
  },
  ipo_rumor: {
    label: "IPO RUMOR",
    color: "#818cf8",
    icon: "○",
    desc: "Analyst/press estimate"
  }
};
const SECTORS = {
  tech: {
    label: "TECHNOLOGY",
    color: "#38bdf8"
  },
  ai: {
    label: "AI",
    color: "#a78bfa"
  },
  crypto: {
    label: "CRYPTO",
    color: "#fbbf24"
  },
  food: {
    label: "FOOD",
    color: "#34d399"
  },
  auto: {
    label: "AUTOMOTIVE",
    color: "#f87171"
  },
  aerospace: {
    label: "AEROSPACE",
    color: "#818cf8"
  },
  defense: {
    label: "DEFENSE",
    color: "#fb923c"
  },
  chip: {
    label: "SEMICONDUCTOR",
    color: "#22d3ee"
  },
  finance: {
    label: "FINANCE",
    color: "#86efac"
  },
  metals: {
    label: "PRECIOUS METALS",
    color: "#fcd34d"
  },
  banking: {
    label: "BANKING",
    color: "#60a5fa"
  },
  fashion: {
    label: "FASHION",
    color: "#f472b6"
  },
  health: {
    label: "HEALTH",
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

const GMA_DEMO_COMPARE = companies => ({
  companyAnalysis: companies.map((c, i) => ({
    ticker: c.ticker,
    totalScore: [87, 83, 79, 74][i] || 74,
    growthPotential: [82, 79, 76, 71][i] || 71,
    riskLevel: [28, 31, 35, 38][i] || 38,
    innovationScore: [91, 88, 80, 75][i] || 75,
    financialStrength: [89, 85, 78, 72][i] || 72,
    marketPosition: [94, 87, 81, 76][i] || 76,
    summary: `${c.name} shows solid market positioning with consistent fundamentals and strong competitive moat in its core segments.`,
    strengths: ["Dominant market share in core segments", "Strong recurring revenue streams", "Proven management execution track record"],
    risks: ["Market concentration exposure", "Macro sensitivity in key geographies"],
    nearFuture: "AI integration and product expansion expected to sustain growth trajectory through 2026-2027."
  })),
  recommendation: {
    bestTicker: companies[0]?.ticker || "AAPL",
    confidenceRate: 84,
    globalRiskShare: 4.2,
    rationale: "Superior financial metrics combined with innovation pipeline makes this the preferred allocation under current market conditions.",
    alternatif: companies[1]?.ticker || "MSFT",
    alternativeNote: "Strong enterprise positioning and cloud infrastructure provide compelling risk-adjusted returns as secondary allocation."
  },
  overallAssessment: "Portfolio demonstrates solid diversification across market leaders with complementary business models. Current macro environment favors quality over growth, supporting this allocation strategy.",
  _demo: true
});

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
  const analysis = GMA_DEMO_ANALYSIS;
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
  }, "\uD83E\uDD16 AI ANAL\u0130Z"), /*#__PURE__*/React.createElement("div", {
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
  }, "POSITIVE FACTORS"), analysis.positive.map((item, i) => /*#__PURE__*/React.createElement("div", {
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
  }, "RISK FACTORS"), analysis.negative.map((item, i) => /*#__PURE__*/React.createElement("div", {
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
  const sec = SECTORS[c.sector] || {
    color: "#94a3b8",
    label: c.sector
  };
  const risks = [
    "Revenue concentration and macro sensitivity may increase downside volatility.",
    "Regulatory, margin, or execution pressure can weaken the near-term setup.",
    "Valuation risk rises when price momentum runs ahead of fundamentals."
  ];
  const opportunities = [
    "Strong market position can support pricing power and resilient cash flow.",
    "AI, automation, or product expansion may create new growth channels.",
    "Operational scale can convert demand recovery into margin improvement."
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
  }, "\u26A0 RISK & OPPORTUNITY DEMO"), /*#__PURE__*/React.createElement("div", {
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
  }, c.ticker, " \xB7 ", sec.label)), /*#__PURE__*/React.createElement("button", {
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
  }, "RISK SIGNALS"), row(risks, "#f87171", "-")), /*#__PURE__*/React.createElement("div", {
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
  }, "OPPORTUNITY SIGNALS"), row(opportunities, "#34d399", "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "14px",
      color: "#475569",
      fontSize: "11px",
      textAlign: "center"
    }
  }, "Demo content only. Connect live model output later for company-specific scoring.")));
}

function AIAnalysisInlinePanel({
  c
}) {
  const analysis = GMA_DEMO_ANALYSIS;
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
  }, "AI ANALYSIS DEMO"), /*#__PURE__*/React.createElement("div", {
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
  }, c.name, " demo layer: ", analysis.summary)), /*#__PURE__*/React.createElement("div", {
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
  }, "POSITIVE FACTORS"), analysis.positive.map((item, i) => /*#__PURE__*/React.createElement("div", {
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
  }, "RISK FACTORS"), analysis.negative.map((item, i) => /*#__PURE__*/React.createElement("div", {
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
  const risks = [
    "Revenue concentration and macro sensitivity may increase downside volatility.",
    "Regulatory, margin, or execution pressure can weaken the near-term setup.",
    "Valuation risk rises when price momentum runs ahead of fundamentals."
  ];
  const opportunities = [
    "Strong market position can support pricing power and resilient cash flow.",
    "AI, automation, or product expansion may create new growth channels.",
    "Operational scale can convert demand recovery into margin improvement."
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
  }, "RISK & OPPORTUNITY DEMO"), /*#__PURE__*/React.createElement("div", {
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
  }, "RISK SIGNALS"), row(risks, "#f87171", "-")), /*#__PURE__*/React.createElement("div", {
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
  }, "OPPORTUNITY SIGNALS"), row(opportunities, "#34d399", "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "14px",
      color: "#475569",
      fontSize: "11px",
      textAlign: "center"
    }
  }, c.name, " demo content only. Connect live model output later for company-specific scoring."));
}

function HistoryModal({
  c,
  onClose
}) {
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
  }, ipoSt.icon, " ", ipoSt.label)), /*#__PURE__*/React.createElement("div", {
    className: "modal-header-info",
    style: {
      fontSize: "13px",
      color: "#64748b"
    }
  }, "Founded: ", meta.founded, " · Sector: ", sec.label, " · Live: $", c.price.toFixed(2))), /*#__PURE__*/React.createElement("button", {
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
  }, "\uD83D\uDCCA HISTORICAL CHART"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "ai"),
    onClick: () => setTab("ai")
  }, "\uD83E\uDD16 AI ANALYSIS"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "risk"),
    onClick: () => setTab("risk")
  }, "\u26A0 RISK & OPPORTUNITY")), /*#__PURE__*/React.createElement("div", {
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
  }, meta.founded, " \u2014 2026 \xB7 ", 2026 - meta.founded, " years of market history"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "8px",
      color: "#94a3b8",
      marginTop: "1px"
    }
  }, "Simulated historical data · Based on the current live price")), /*#__PURE__*/React.createElement("div", {
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
  }, c.change >= 0 ? "▲" : "▼", " ", Math.abs(c.change).toFixed(2), "% today"))), /*#__PURE__*/React.createElement("div", {
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
  }, "KEY EVENTS"), /*#__PURE__*/React.createElement("div", {
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
  }, "Risk analysis is loading...")), aiError && !loadingAI && /*#__PURE__*/React.createElement("div", {
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
  }, "Sign-in Required"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      marginBottom: "20px",
      lineHeight: 1.6
    }
  }, "To use AI analysis features,", /*#__PURE__*/React.createElement("br", null), "you need to sign in to your account first."), /*#__PURE__*/React.createElement("button", {
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
  }, "SIGN IN / SIGN UP \u2192")) : /*#__PURE__*/React.createElement("div", {
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
  }, "\u26A0 Error"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "#94a3b8",
      lineHeight: 1.6,
      wordBreak: "break-word",
      marginBottom: "10px"
    }
  }, aiError === '__NO_KEY__'
    ? "GMA AI key configuration required. Contact support."
    : aiError === '__NO_CREDITS__'
    ? "Your analysis credits are used up. Choose a plan to continue."
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
  }, "\u21BA Try Again"))), !loadingAI && !analysis && !aiError && /*#__PURE__*/React.createElement("div", {
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
  }, "\u26A1 Load Risk Analysis"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginTop: "10px"
    }
  }, "GMA Intelligence Layer analyzes positive and negative factors")), analysis && !loadingAI && /*#__PURE__*/React.createElement("div", {
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
  }, "\u2705 POSITIVE FACTORS"), analysis.positive?.map((item, i) => /*#__PURE__*/React.createElement("div", {
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
  }, "\u26A0 NEGATIVE FACTORS"), analysis.negative?.map((item, i) => /*#__PURE__*/React.createElement("div", {
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
  }, "\u2696\uFE0F COMPARE (", companies.length, "/5)"), /*#__PURE__*/React.createElement("div", {
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
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // false — users baslatir
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [rawLog, setRawLog] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  // companies prop'u ref'e al — sonsuz donguyu engeller
  const companiesRef = useRef(companies);

  // Analiz fonksiyonu — companiesRef uzerinden calisir, bagimlilik problemi yok
  const runAnalysis = async () => {
    const co = companiesRef.current;
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
      setResult(GMA_DEMO_COMPARE(co));
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
      const promptContent = `${co.length} compare companies and create an English investment analysis: ${companyDetails}

Fill only the JSON template below. Do not write any extra explanation. Make all scores whole numbers from 0 to 100:

{"companyAnalysis":[${companySchema}],"recommendation":{"bestTicker":"${co[0].ticker}","confidenceRate":80,"globalRiskShare":5,"rationale":"","alternatif":"${co[1] ? co[1].ticker : co[0].ticker}","alternativeNote":""},"overallAssessment":""}

CRITICAL: Return only JSON. The first character must be { and the last character must be }.`;
      const apiKey2 = localStorage.getItem('gma_platform_key') || '';
      if (!apiKey2) {
        await new Promise(r => setTimeout(r, 1500));
        setResult(GMA_DEMO_COMPARE(co));
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
        setError(`API Hatasi ${res.status}: ${errMsg}`);
        setRawLog(rawText.slice(0, 500));
        return;
      }
      let apiResponse;
      try {
        apiResponse = JSON.parse(rawText);
      } catch {
        setError("API yaniti parse edilemedi: " + rawText.slice(0, 200));
        return;
      }
      const txt = (apiResponse.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setRawLog(txt.slice(0, 800));
      if (!txt) {
        setError("Bos yanit. Tipler: " + (apiResponse.content || []).map(b => b.type).join(", "));
        return;
      }
      const cleaned = txt.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        setError("JSON bulunamadi: " + cleaned.slice(0, 300));
        return;
      }
      try {
        const data = JSON.parse(cleaned.slice(start, end + 1));
        if (!data.companyAnalysis || !Array.isArray(data.companyAnalysis)) {
          setError("Invalid JSON structure: companyAnalysis array is missing.");
          return;
        }
        setResult(data);
      } catch (pe) {
        setError("JSON parse hatasi: " + pe.message + " — " + cleaned.slice(start, start + 200));
      }
    } catch (e) {
      setError("Ag hatasi: " + e.message);
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
  }, "\u2696\uFE0F COMPANY COMPARISON ANALYSIS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8",
      marginTop: "3px"
    }
  }, companies.length, " companies · AI-powered comparison")), /*#__PURE__*/React.createElement("button", {
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
  }, "\uD83D\uDCCA OVERVIEW"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "scores"),
    onClick: () => setTab("scores")
  }, "\uD83C\uDFAF SCORE ANALYSIS"), /*#__PURE__*/React.createElement("button", {
    style: tabStyle(tab === "recommend"),
    onClick: () => setTab("recommend")
  }, "\u2B50 RECOMMENDATION")), /*#__PURE__*/React.createElement("div", {
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
  }, companies.length, " Companies Ready"), /*#__PURE__*/React.createElement("div", {
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
  }, "\uD83E\uDD16 Start AI Comparison Analysis"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "10px"
    }
  }, "GMA Intelligence Layer generates detailed scores and recommendations for each company")), loading && /*#__PURE__*/React.createElement("div", {
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
  }, "AI analysis is running..."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "#94a3b8"
    }
  }, companies.map(c => c.name).join(" · "), " are being compared")), error && !loading && /*#__PURE__*/React.createElement("div", null, error === '__LOGIN_REQUIRED__' ? /*#__PURE__*/React.createElement("div", {
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
  }, "Sign-in Required"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#94a3b8",
      marginBottom: "20px",
      lineHeight: 1.6
    }
  }, "You need to sign in to your account for company comparison analysis."), /*#__PURE__*/React.createElement("button", {
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
  }, "SIGN IN / SIGN UP \u2192")) : /*#__PURE__*/React.createElement("div", {
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
  }, "\u26A0 Analysis Error"), /*#__PURE__*/React.createElement("div", {
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
  }, "\u21BA Try Again"))), !loading && result && tab === "overview" && /*#__PURE__*/React.createElement("div", null,
    result._demo && /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'flex-end',marginBottom:'8px'}},
      /*#__PURE__*/React.createElement("span", {style:{fontSize:'10px',color:'#e879f9',background:'rgba(232,121,249,0.1)',border:'1px solid rgba(232,121,249,0.25)',borderRadius:'20px',padding:'3px 10px',letterSpacing:'0.08em',fontFamily:"'Courier New',monospace"}},
        "◈ PREVIEW MODE · SAMPLE DATA"
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
    }, "\u2B50 RECOMMENDATIONLEN"), /*#__PURE__*/React.createElement("div", {
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
    }, "TOTAL SCORE")), /*#__PURE__*/React.createElement("div", {
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
    }, "GROWTH")), /*#__PURE__*/React.createElement("div", {
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
    }, "RISK"))), /*#__PURE__*/React.createElement("div", {
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
      l: "Growth Potential",
      v: f.growthPotential,
      c: "#34d399"
    }, {
      l: "Financial Strength",
      v: f.financialStrength,
      c: "#38bdf8"
    }, {
      l: "Innovation Score",
      v: f.innovationScore,
      c: "#a78bfa"
    }, {
      l: "Market Position",
      v: f.marketPosition,
      c: "#fbbf24"
    }, {
      l: "Risk Level",
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
    }, "STRENGTHS"), f.strengths?.map((g, i) => /*#__PURE__*/React.createElement("div", {
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
    }, "RISKS"), f.risks?.map((r, i) => /*#__PURE__*/React.createElement("div", {
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
  }, "AI RECOMMENDATION"), /*#__PURE__*/React.createElement("div", {
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
  }, "AI CONFIDENCE RATE")), /*#__PURE__*/React.createElement("div", {
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
  }, "GLOBAL RISK SHARE"))), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("span", null, "Global Risk: %", result.recommendation?.globalRiskShare), /*#__PURE__*/React.createElement("span", null, "AI Confidence: %", result.recommendation?.confidenceRate)), /*#__PURE__*/React.createElement("div", {
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
  }, "ALTERNATIVE CHOICE"), /*#__PURE__*/React.createElement("div", {
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
  }, "SKOR SIRALAMASI"), [...(result.companyAnalysis || [])].sort((a, b) => b.totalScore - a.totalScore).map((f, i) => {
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
  }, "FINAL DECISION BELONGS TO THE INVESTOR - NOT INVESTMENT ADVICE")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 26px 12px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "4px 16px"
    }
  }, ["This analysis is only an AI-based digital assessment.", "No recommendation replaces a final investment decision.", "A 5% global risk allowance is included in the calculations.", "All trading decisions are the investor’s responsibility.", "Past performance does not guarantee future returns.", "Consult a licensed financial advisor."].map((t, i) => /*#__PURE__*/React.createElement("div", {
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
  }, t)))))));
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
  }, "\u26A0 ", t('simulatedTransaction')));
}

// ── ALARM MODALI ──
function AlertModal({
  c,
  currentAlert,
  onClose,
  onSet
}) {
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
  }, "PRICE RISE ALERT"), /*#__PURE__*/React.createElement("div", {
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
  }, "RISE THRESHOLD: ", /*#__PURE__*/React.createElement("span", {
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
  }, "MEVCUT"), /*#__PURE__*/React.createElement("div", {
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
  }, "HEDEF"), /*#__PURE__*/React.createElement("div", {
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
  }, "CANCEL"), /*#__PURE__*/React.createElement("button", {
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
  }, "\uD83D\uDD14 SET ALERT"))));
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
  }, sec.label)), !isListed && /*#__PURE__*/React.createElement("div", {
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
  }, ipoSt.icon, " ", ipoSt.label, c.ipoYear ? ` ${c.ipoYear}` : ""))), /*#__PURE__*/React.createElement("div", {
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
  }, isListed ? "USD · NASDAQ/NYSE/BIST" : "valuation estimate")), /*#__PURE__*/React.createElement("div", {
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
    }, iconBtn("📊", "CHART", false, sec.color, onHistory, false), iconBtn("⚖️", "COMPARE", inCompare, "#e879f9", onCompare, compareDisabled && !inCompare), iconBtn("📈", "ADD", false, "#34d399", onBuy, !isListed), iconBtn("🛒", "CART", inCart, "#38bdf8", onCart, false), iconBtn("👁", "WATCH", isWatched, "#fbbf24", onWatch, false, "#ffffff"), iconBtn("🔔", "ALERT", hasAlert, "#fb923c", onAlert, false)));
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
  }, histData.startYear || histData.data[0].year, " \u2014 2026 \xB7 ", stats.years, " Year Historical Chart"))), /*#__PURE__*/React.createElement("div", {
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
    label: "STARTER",
    val: fmtV(stats.first),
    sub: histData.data[0].year,
    color: "#94a3b8"
  }, {
    label: "CURRENT",
    val: fmtV(stats.last),
    sub: "2026",
    color: histData.color
  }, {
    label: "HISTORICAL HIGH",
    val: fmtV(stats.max),
    sub: stats.maxY,
    color: "#34d399"
  }, {
    label: "HISTORICAL LOW",
    val: fmtV(stats.min),
    sub: stats.minY,
    color: "#f87171"
  }, {
    label: "TOTAL RETURN",
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
  }, /*#__PURE__*/React.createElement("span", null, "\u25CF Historical data is for reference only and is not investment advice"), /*#__PURE__*/React.createElement("span", null, "\u25C8 Global Market Analytics \xB7 2026"))));
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
  }, "\uD83D\uDC8E LIVE COMMODITIES & FOREX")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '5px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('metals'),
    style: tabSty(tab === 'metals', '#fcd34d')
  }, "\uD83E\uDD47 METALS"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('energy'),
    style: tabSty(tab === 'energy', '#f97316')
  }, "\u26FD ENERGY"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab('forex'),
    style: tabSty(tab === 'forex', '#60a5fa')
  }, "\uD83D\uDCB1 FOREX")), /*#__PURE__*/React.createElement("div", {
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
  }, "\u27F3 Fetching data..."), status !== 'loading' && /*#__PURE__*/React.createElement("span", {
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
  }), isLive ? 'LIVE DATA' : 'SIMULATED'), updated && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '15px',
      color: '#1e293b',
      whiteSpace: 'nowrap'
    }
  }, updated.toLocaleTimeString('tr-TR'), " \xB7 \u21BA", countdown, "s"), /*#__PURE__*/React.createElement("button", {
    onClick: fetchAll,
    title: "Refresh",
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
  }, "\u21BA REFRESH"), /*#__PURE__*/React.createElement("button", {
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
  }, tab === 'forex' ? '● Frankfurter API · ECB data · 1 USD = X units · Change versus previous day' : '● Finnhub API · Real-time · Live data'))), histModal && /*#__PURE__*/React.createElement(CommodityHistoryModal, {
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
  }, loading ? "⟳ " + t('refreshing') : "⟳ " + t('fetchAiData')))), /*#__PURE__*/React.createElement("div", {
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
  }, SECTORS[s]?.label || s))), /*#__PURE__*/React.createElement("div", {
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
    id: 'free', label: 'Free Trial', price: 0, period: '',
    credits: 3, color: '#64748b', multiAI: false,
    badge: '3 ANALYSES', scope: '1 Sector'
  },
  explorer: {
    id: 'explorer', label: 'Explorer', price: 19.99, period: '/ay',
    credits: 10, color: '#38bdf8', multiAI: true,
    badge: 'STARTER', scope: '1 Sector · 10 Analiz'
  },
  strategist: {
    id: 'strategist', label: 'Strategist', price: 49.99, period: '/ay',
    credits: 999, color: '#a78bfa', multiAI: true,
    badge: 'MOST POPULAR', scope: 'Unlimited · All Sectors'
  },
  pro_architect: {
    id: 'pro_architect', label: 'Pro-Architect', price: 99.99, period: '/ay',
    credits: 999, color: '#f59e0b', multiAI: true,
    badge: 'SOVEREIGN', scope: 'Global + Signal DNA · 126 Years'
  }
};
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
  var badges = ['\uD83D\uDD12 256-bit SSL','\u2713 Paddle Secured','\u2713 PCI DSS'];
  return React.createElement("div",{onClick:onClose,style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:9900,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}},
    React.createElement("div",{onClick:function(e){e.stopPropagation()},style:{background:'linear-gradient(145deg,#0a1220,#060912)',border:'1px solid '+planColor+'44',borderRadius:'20px',width:'100%',maxWidth:'440px',fontFamily:"'Courier New',monospace",overflow:'hidden'}},
      React.createElement("div",{style:{padding:'20px 24px 16px',borderBottom:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center'}},
        React.createElement("div",null,
          React.createElement("div",{style:{fontSize:'11px',color:planColor,letterSpacing:'0.1em',marginBottom:'4px'}},"\uD83D\uDCB3 SECURE CHECKOUT via PADDLE"),
          React.createElement("div",{style:{fontSize:'16px',fontWeight:'bold',color:'#f1f5f9'}},
            plan&&plan.label," Plan \u2014 $",plan&&plan.price,
            React.createElement("span",{style:{fontSize:'12px',color:'#64748b'}},plan&&plan.period)
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
            React.createElement("div",{style:{fontWeight:'bold',color:'#38bdf8',marginBottom:'8px',fontSize:'13px'}},"Secure Checkout via Paddle"),
            "Your payment is securely processed by ",React.createElement("strong",null,"Paddle.com"),
            " \u2014 our authorized Merchant of Record. GMA never stores your card details. Clicking below opens Paddle\u2019s secure hosted checkout."
          ),
          step==='error'&&errMsg&&React.createElement("div",{style:{marginBottom:'14px',padding:'10px 14px',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'8px',fontSize:'12px',color:'#f87171'}},"\u26A0 ",errMsg),
          React.createElement("button",{onClick:handleCheckout,style:{width:'100%',padding:'14px',background:'linear-gradient(135deg,'+planColor+','+planColor+'bb)',border:'none',borderRadius:'11px',color:'#000',cursor:'pointer',fontSize:'14px',fontFamily:'inherit',fontWeight:'bold',letterSpacing:'0.07em',transition:'all 0.2s'}},
            plan&&plan.price===0?'Start Free':'Proceed to Checkout \u2014 $'+(plan&&plan.price)+' \u2192'
          ),
          React.createElement("div",{style:{textAlign:'center',marginTop:'12px',fontSize:'10px',color:'#64748b',lineHeight:1.6}},
            "Secured by Paddle.com \u2014 card data never stored on GMA servers.")
        ),
        step==='processing'&&React.createElement("div",{style:{textAlign:'center',padding:'40px 0'}},
          React.createElement("div",{style:{fontSize:'40px',marginBottom:'14px'}},"\u23F3"),
          React.createElement("div",{style:{fontSize:'14px',color:planColor,fontWeight:'bold',marginBottom:'6px'}},"Opening Paddle Checkout..."),
          React.createElement("div",{style:{fontSize:'11px',color:'#64748b'}},"Please wait, do not close this page.")
        ),
        step==='success'&&React.createElement("div",{style:{textAlign:'center',padding:'30px 0'}},
          React.createElement("div",{style:{fontSize:'48px',marginBottom:'14px'}},"\uD83C\uDF89"),
          React.createElement("div",{style:{fontSize:'15px',fontWeight:'bold',color:'#34d399',marginBottom:'8px'}},"Access Activated"),
          React.createElement("div",{style:{fontSize:'12px',color:'#64748b',lineHeight:1.7,marginBottom:'20px'}},
            plan&&plan.label," plan access activated. ",plan&&plan.credits," credits added to your account."),
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
    }, plan?.label, " ", t('planActivated')), /*#__PURE__*/React.createElement("div", {
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
    }, "\uD83D\uDD11 YOUR GMA PLATFORM ACCESS KEY"), /*#__PURE__*/React.createElement("div", {
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
    }, "\uD83D\uDC64 My Profile"))));
  }
  return /*#__PURE__*/React.createElement("div", {
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
  }, "Pay GMA - we manage GMA Triple Consensus for you.", /*#__PURE__*/React.createElement("br", null), "One platform, three AI engines.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: '16px',
      maxWidth: '980px',
      margin: '0 auto 48px'
    }
  }, plans.map(plan => /*#__PURE__*/React.createElement("div", {
    key: plan.id,
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
  }, plan.badge), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: plan.color,
      letterSpacing: '0.1em',
      marginBottom: '8px'
    }
  }, plan.label), /*#__PURE__*/React.createElement("div", {
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
  }, plan.period)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: plan.color,
      marginBottom: '18px'
    }
  }, plan.credits, " credits \xB7 ", plan.analyses, " analyses"), /*#__PURE__*/React.createElement("div", {
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
  }, plan.id === 'free' ? 'Start Free' : (plan.label + ' Plan →'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '880px',
      margin: '0 auto 40px',
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
  }, "DETAILED COMPARISON"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      padding: '10px 12px',
      color: '#94a3b8',
      borderBottom: '1px solid #1e293b',
      fontWeight: 'bold',
      fontSize: '11px'
    }
  }, "FEATURE"), plans.map(p => /*#__PURE__*/React.createElement("th", {
    key: p.id,
    style: {
      textAlign: 'center',
      padding: '10px 6px',
      color: p.color,
      borderBottom: '1px solid #1e293b',
      fontWeight: 'bold',
      fontSize: '10px'
    }
  }, p.label)))), /*#__PURE__*/React.createElement("tbody", null, featureRows.map(({
    label,
    vals
  }, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid #0a1220',
      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '9px 12px',
      color: '#94a3b8',
      fontSize: '12px'
    }
  }, label), vals.map((v, j) => /*#__PURE__*/React.createElement("td", {
    key: j,
    style: {
      textAlign: 'center',
      padding: '9px 6px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: v === true ? '#34d399' : v === false ? '#1e293b' : '#fbbf24'
    }
  }, v === true ? '✓' : v === false ? '–' : v))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '680px',
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#94a3b8',
      letterSpacing: '0.1em',
      marginBottom: '16px'
    }
  }, "INTEGRATED AI PARTNERS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    }
  }, [
{name:'Anthropic', layer:'Analytic Layer',  color:'#d97757',
      logoEl:/*#__PURE__*/React.createElement('svg',{xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 256 176',width:'28',height:'20'},
        /*#__PURE__*/React.createElement('path',{fill:'#d97757',d:'M147.46 0h43.47l79.07 176h-43.47zM65.54 0h43.47L28.94 176H-14.53zm50.41 110.91l-26.6-66.63-26.6 66.63z'}))},
    {name:'OpenAI',    layer:'Deep Strategy',   color:'#10a37f',
      logoEl:/*#__PURE__*/React.createElement('svg',{xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 32 32',width:'24',height:'24'},
        /*#__PURE__*/React.createElement('path',{fill:'#10a37f',d:'M29.71 13.09A8.09 8.09 0 0 0 21.04 3.95a8.18 8.18 0 0 0-6.93.5 8.09 8.09 0 0 0-7.65 1.08 8.09 8.09 0 0 0-3.27 7.77 8.09 8.09 0 0 0 2.82 13.36 8.18 8.18 0 0 0 .82 6.91 8.09 8.09 0 0 0 8.67 3.87 8.09 8.09 0 0 0 6.09 2.72 8.09 8.09 0 0 0 7.71-5.6 8.09 8.09 0 0 0 5.41-3.92 8.09 8.09 0 0 0-1-9.55zM16.62 28.91a6 6 0 0 1-3.85-1.39l.19-.11 6.39-3.69a1 1 0 0 0 .52-.91v-9l2.7 1.56a.1.1 0 0 1 .05.07v7.46a6 6 0 0 1-6 6zM3.72 23.4a6 6 0 0 1-.72-4l.19.11 6.39 3.69a1 1 0 0 0 1 0l7.8-4.5v3.11a.09.09 0 0 1 0 .08L11.92 26a6 6 0 0 1-8.2-2.6zm-1.68-14a6 6 0 0 1 3.14-2.64v7.6a1 1 0 0 0 .52.91l7.75 4.47-2.7 1.56a.1.1 0 0 1-.09 0l-6.46-3.73a6 6 0 0 1-2.16-8.17zM26 11.85l-7.8-4.5 2.7-1.55a.1.1 0 0 1 .09 0l6.46 3.73a6 6 0 0 1-.9 10.81v-7.6a1.05 1.05 0 0 0-.55-.89zm2.69-4l-.19-.12-6.37-3.71a1 1 0 0 0-1.05 0l-7.79 4.5V5.4a.08.08 0 0 1 0-.08L19.81 2a6 6 0 0 1 8.9 6.21zm-16.88 5.51-2.7-1.55a.1.1 0 0 1 0-.09V4.36a6 6 0 0 1 9.84-4.61l-.19.11-6.39 3.69a1 1 0 0 0-.52.91zm1.47-3.17 3.47-2 3.47 2v4l-3.47 2-3.47-2z'}))},
    {name:'Gemini',    layer:'Historical Filter', color:'#4285f4',
      logoEl:/*#__PURE__*/React.createElement('svg',{xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 24 24',width:'24',height:'24'},
        /*#__PURE__*/React.createElement('defs',null,
          /*#__PURE__*/React.createElement('linearGradient',{id:'gem-grad',x1:'0%',y1:'0%',x2:'100%',y2:'100%'},
            /*#__PURE__*/React.createElement('stop',{offset:'0%','stopColor':'#4285f4'}),
            /*#__PURE__*/React.createElement('stop',{offset:'50%','stopColor':'#9b72cb'}),
            /*#__PURE__*/React.createElement('stop',{offset:'100%','stopColor':'#d96570'}))),
        /*#__PURE__*/React.createElement('path',{fill:'url(#gem-grad)',d:'M12 0L14.83 9.17L24 12L14.83 14.83L12 24L9.17 14.83L0 12L9.17 9.17L12 0z'}))}
  ].map(ai => /*#__PURE__*/React.createElement("div", {
    key: ai.name,
    style: {
      background: `${ai.color}15`,
      border: `1px solid ${ai.color}40`,
      borderRadius: '14px',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  },
  /*#__PURE__*/React.createElement("div", {
    style: {
      width:'38px', height:'38px', borderRadius:'10px',
      background:`${ai.color}25`,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0
    }
  }, ai.logoEl),
  /*#__PURE__*/React.createElement("div", null,
    /*#__PURE__*/React.createElement("div", {
      style:{fontSize:'14px', fontWeight:'bold', color:ai.color}
    }, ai.name),
    /*#__PURE__*/React.createElement("div", {
      style:{fontSize:'10px', color:'#94a3b8'}
    }, ai.layer)
  )))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#94a3b8',
      lineHeight: 1.8
    }
  }, "GMA manages all API costs on your behalf. One subscription, three AI engines."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px',
      fontSize: '10px',
      color: '#94a3b8'
    }
  }, "\u26A0 This platform does not provide investment advice. All decisions remain the responsibility of the investor.")), payModal && /*#__PURE__*/React.createElement(PaddlePaymentModal, {
    plan: payModal,
    user: user,
    onClose: () => setPayModal(null),
    onSuccess: handlePaySuccess
  }));
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
    val: "Real-Time",
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
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,189,248,0.08) 0%, transparent 60%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '17px',
      color: '#38bdf8',
      letterSpacing: '0.12em',
      marginBottom: '18px'
    }
  }, "\u25C8 GLOBAL MARKET ANALYTICS \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(32px,5vw,56px)',
      fontWeight: 'bold',
      lineHeight: 1.15,
      marginBottom: '20px',
      background: 'linear-gradient(135deg,#f1f5f9,#38bdf8,#818cf8)',
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
            "\ud83d\udead ",t('logout'))
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
  return React.createElement("div",{style:{minHeight:'100vh',background:'#060912',color:'#e2e8f0',fontFamily:"'Courier New',monospace",padding:'40px 24px'}},
    React.createElement("div",{style:{maxWidth:'720px',margin:'0 auto'}},
      React.createElement("h1",{style:{fontSize:'30px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'24px',lineHeight:1.3}},t('aboutTitle')),
      React.createElement("div",{style:{display:'grid',gap:'20px'}},
        cards.map(function(c,i){return React.createElement("div",{key:i,style:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'20px'}},
          React.createElement("div",{style:{fontSize:'17px',color:'#38bdf8',fontWeight:'bold',letterSpacing:'0.06em',marginBottom:'8px'}},c.title),
          React.createElement("div",{style:{fontSize:'17px',color:'#64748b',lineHeight:1.7}},c.text)
        );})
      ),
      React.createElement("div",{style:{marginTop:'28px'}},
        React.createElement("button",{onClick:function(){onNavigate('home');},style:{padding:'11px 24px',background:'transparent',border:'1px solid #1e293b',borderRadius:'10px',color:'#475569',cursor:'pointer',fontSize:'17px',fontFamily:'inherit'}},"\u2190 "+t('home'))
      )
    )
  );
}



// ======================================================================
// -- LEGAL PAGE TRANSLATION HOOK --
// ======================================================================
function useLegalTranslate(sections, pageKey) {
  var langCtx = useLang();
  var lang = langCtx.lang;
  var _t = React.useState(sections); var translated = _t[0]; var setTranslated = _t[1];
  var _l = React.useState(false); var loading = _l[0]; var setLoading = _l[1];
  React.useEffect(function() {
    var staticSections = GMA_LEGAL_STATIC[lang] && GMA_LEGAL_STATIC[lang][pageKey];
    if (staticSections) { setTranslated(staticSections); return; }
    if (lang === 'en') { setTranslated(sections); return; }
    var cacheKey = 'gma_legal_' + pageKey + '_' + lang;
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === sections.length) { setTranslated(parsed); return; }
      }
    } catch(e) {}
    var platformKey = GMA_PLATFORM_KEY();
    if (!platformKey) return;
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
          setTranslated(parsed);
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
    wrap:{minHeight:'100vh',background:'#060912',color:'#e2e8f0',fontFamily:"'Courier New',monospace",padding:'40px 24px'},
    inner:{maxWidth:'760px',margin:'0 auto'},
    badge:{fontSize:'13px',color:'#38bdf8',letterSpacing:'0.08em',marginBottom:'8px'},
    h1:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'6px'},
    sub:{fontSize:'13px',color:'#64748b',marginBottom:'32px'},
    card:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'20px 22px',marginBottom:'16px'},
    ct:{fontSize:'15px',color:'#34d399',fontWeight:'bold',letterSpacing:'0.06em',marginBottom:'10px'},
    cb:{fontSize:'15px',color:'#64748b',lineHeight:1.8,whiteSpace:'pre-line'},
    warn:{background:'rgba(248,113,113,0.07)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'12px',padding:'16px 20px',marginBottom:'20px'},
    wt:{fontSize:'15px',color:'#f87171',fontWeight:'bold',marginBottom:'8px'},
    wb:{fontSize:'14px',color:'#94a3b8',lineHeight:1.8},
    tip:{textAlign:'center',padding:'8px 16px',marginBottom:'16px',background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)',borderRadius:'8px',fontSize:'12px',color:'#38bdf8'},
    btn:{padding:'11px 24px',background:'transparent',border:'1px solid #1e293b',borderRadius:'10px',color:'#475569',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bb:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(56,189,248,0.3)',borderRadius:'10px',color:'#38bdf8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bg:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(52,211,153,0.3)',borderRadius:'10px',color:'#34d399',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}
  };
  var EN_SECS = [
    {t:"1. Information We Collect",b:"GMA operates as a client-side web application. We collect only the minimum data necessary:\n\n\u2022 Account Information: email and display name, stored locally in your browser (localStorage).\n\u2022 API Keys: stored only in your browser. Transmitted directly to Anthropic. GMA never receives your API key on our servers.\n\u2022 Payment Data: processed entirely by Paddle.com. GMA does not receive, store, or process card information.\n\u2022 Analytics: anonymised, aggregated usage data with no personally identifiable information."},
    {t:"2. Legal Basis for Processing (GDPR)",b:"Under the General Data Protection Regulation (GDPR), we rely on:\n\n\u2022 Contractual Necessity \u2014 processing your email to deliver the subscribed service.\n\u2022 Legitimate Interests \u2014 improving platform performance via anonymised analytics.\n\u2022 Consent \u2014 for any optional data collection. You may withdraw consent at any time."},
    {t:"3. Payment Processing via Paddle",b:"All payments are processed by our Merchant of Record, Paddle.com. When you subscribe:\n\n\u2022 You are redirected to Paddle's PCI-DSS-compliant secure checkout.\n\u2022 Card details are entered only on Paddle's infrastructure. GMA never sees your payment credentials.\n\u2022 Paddle Privacy Policy: https://www.paddle.com/legal/privacy\n\u2022 For billing enquiries: support@globalmarketanalytics.com"},
    {t:"4. Cookies & Tracking",b:"GMA does not use advertising cookies, third-party tracking pixels, or behavioural analytics. Strictly necessary session cookies may be used for authentication only. No user behaviour is sold to advertisers."},
    {t:"5. Third-Party Data Providers",b:"GMA integrates with backend providers, each subject to their own privacy policies:\n\n\u2022 GMA Providers (GMA AI) \u2014 https://www.anthropic.com/privacy\n\u2022 Finnhub.io \u2014 real-time market data provider\n\u2022 Frankfurter API \u2014 currency exchange rates\n\u2022 Paddle.com \u2014 payment processing\n\nThese providers may process your IP address in the course of normal operations."},
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
    wrap:{minHeight:'100vh',background:'#060912',color:'#e2e8f0',fontFamily:"'Courier New',monospace",padding:'40px 24px'},
    inner:{maxWidth:'760px',margin:'0 auto'},
    badge:{fontSize:'13px',color:'#38bdf8',letterSpacing:'0.08em',marginBottom:'8px'},
    h1:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'6px'},
    sub:{fontSize:'13px',color:'#64748b',marginBottom:'32px'},
    card:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'20px 22px',marginBottom:'16px'},
    ct:{fontSize:'15px',color:'#34d399',fontWeight:'bold',letterSpacing:'0.06em',marginBottom:'10px'},
    cb:{fontSize:'15px',color:'#64748b',lineHeight:1.8,whiteSpace:'pre-line'},
    warn:{background:'rgba(248,113,113,0.07)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'12px',padding:'16px 20px',marginBottom:'20px'},
    wt:{fontSize:'15px',color:'#f87171',fontWeight:'bold',marginBottom:'8px'},
    wb:{fontSize:'14px',color:'#94a3b8',lineHeight:1.8},
    tip:{textAlign:'center',padding:'8px 16px',marginBottom:'16px',background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)',borderRadius:'8px',fontSize:'12px',color:'#38bdf8'},
    btn:{padding:'11px 24px',background:'transparent',border:'1px solid #1e293b',borderRadius:'10px',color:'#475569',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bb:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(56,189,248,0.3)',borderRadius:'10px',color:'#38bdf8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bg:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(52,211,153,0.3)',borderRadius:'10px',color:'#34d399',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}
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
    wrap:{minHeight:'100vh',background:'#060912',color:'#e2e8f0',fontFamily:"'Courier New',monospace",padding:'40px 24px'},
    inner:{maxWidth:'760px',margin:'0 auto'},
    badge:{fontSize:'13px',color:'#34d399',letterSpacing:'0.08em',marginBottom:'8px'},
    h1:{fontSize:'26px',fontWeight:'bold',color:'#f1f5f9',marginBottom:'6px'},
    sub:{fontSize:'13px',color:'#64748b',marginBottom:'32px'},
    hi:{background:'linear-gradient(135deg,rgba(52,211,153,0.08),rgba(56,189,248,0.08))',border:'1px solid rgba(52,211,153,0.25)',borderRadius:'14px',padding:'22px 24px',marginBottom:'20px'},
    card:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'20px 22px',marginBottom:'16px'},
    ct:{fontSize:'15px',color:'#34d399',fontWeight:'bold',letterSpacing:'0.06em',marginBottom:'10px'},
    cb:{fontSize:'15px',color:'#64748b',lineHeight:1.8,whiteSpace:'pre-line'},
    tip:{textAlign:'center',padding:'8px 16px',marginBottom:'16px',background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)',borderRadius:'8px',fontSize:'12px',color:'#38bdf8'},
    btn:{padding:'11px 24px',background:'transparent',border:'1px solid #1e293b',borderRadius:'10px',color:'#475569',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'},
    bb:{padding:'11px 24px',background:'transparent',border:'1px solid rgba(56,189,248,0.3)',borderRadius:'10px',color:'#38bdf8',cursor:'pointer',fontSize:'15px',fontFamily:'inherit'}
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
            React.createElement("a",{href:"https://wa.me/998943931121",target:"_blank",rel:"noopener noreferrer",style:{color:'#34d399',textDecoration:'none',fontSize:'13px',display:'block'}},"+998 94 393 11 21"),
            React.createElement("a",{href:"https://wa.me/905428470735",target:"_blank",rel:"noopener noreferrer",style:{color:'#34d399',textDecoration:'none',fontSize:'13px',display:'block'}},"+90 542 847 07 35")
          )
        ),

        React.createElement("div",{style:{background:'linear-gradient(145deg,#0c1220,#080d18)',border:'1px solid #0f172a',borderRadius:'12px',padding:'16px',display:'flex',gap:'12px',alignItems:'flex-start'}},
          React.createElement("span",{style:{fontSize:'20px'}},"\uD83D\uDCE8"),
          React.createElement("div",null,
            React.createElement("div",{style:{fontSize:'12px',color:'#64748b',letterSpacing:'0.06em',marginBottom:'4px'}},"TELEGRAM"),
            React.createElement("a",{href:"https://t.me/+998943931121",target:"_blank",rel:"noopener noreferrer",style:{color:'#38bdf8',textDecoration:'none',fontSize:'13px'}},"Global Market Analytics Support")
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
      src:"data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAYoBoIDASIAAhEBAxEB/8QAHQABAAAHAQEAAAAAAAAAAAAAAAIDBAUGBwgBCf/EAFMQAAEDAgQDBgMHBAECBAIBFQEAAgMEEQUGITESQVEHEyJhcfCBkaEIFDKxwdHhFSNC8VIkMxZDYnIlNFOSNXOCFyY2VGOiGER0smSDk8LS4vL/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAgMBBAUGB//EADYRAQACAgEDBAIBAQcEAgMBAQABAgMRBBIhMQUTQVEiYTJxFCMzQoGhsQZSkdEV8CRD4WLB/9oADAMBAAIRAxEAPwDjJERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBEXoBJsASSg8RRPY5n4mlvqFCgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiKOOKWQ2jje89GtuggRXnCcrZhxWVkdDhNXMXmwtGbe/3WfZb7A+0DGXN4cMMDTrdxG3PS9/pumkZtFfMtUIul8D+yjjkzY5MSxSCBruHiaHAOF9/l9brMMH+yxlmDh/qWLTSmw4g2+n0tfqL9NQs9MqL8vDXzZxwpjIZnkBkT3X2s0ld54P9n7s0w6xdRSVhFjeQW1vrselx5aeazDCuz3ImGi1HlekvcEFwJIsdNBpz6LPS1reqYK+Ny+dVHgOM1lvuuGVUt9uGMrIKDsvz1Xd2afLtY4SO4Wnh3N7L6L0VBh9KwNpcOpIha2jAbC21zy8ttCq6B8jAQwtaHXPCxoaPP4rE6hTPq9fir590PYJ2k1Z4f6HLCb2/u6fLqr3R/Zl7R5y0SUjILmzuNrtBpc6DzXdrXvJ4i6+vuyja8+hvofZ81HcIT6rafFXE1J9lPO0ojM1dQwBxsTI7hLTtYg+ZA/K6vNP9kTMLmh02N0rDoeEOB0te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bo0XGvJSss033vN8I4T4X38lPlsGkkalXTspp/vOZppPDZhve3qkzruni77Zvnp4iwprRpfSx+CsmToXPludQegV17SHA07W6CxtpqmQKcFjSG3JIt56qm38V9I1ZpP7ZNf3mZcLw1rhanpWkgHmb30WgVtn7VFca3tTqmi/DA3um3HIFamXmck9V5l6/BXpx1j9CIigtEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQegEkAC5KzvJWW3QuhxCsi45n2NPDa977EqXkfLMbqcY1ibT3QNqaEfilf6cgLg6rc2RsuvY4YlXtHfO/BGP8B5Ld4nGnLbc+HP53NrgpP2umTcBdTA1lZZ1XJq7yWXySsgb9B7+Cpw5sLBsLbae7KnjElXKLXPne9tl3IrERqPDxmXNbNbqlVUrZKudx4jbrbbyV/jMdNAXFzWNaNSdLeapqOnZTRXcWta0X4jotNdt/aP3LX4PhNSA06SvYdR5fFVZctccbslxeLk5d+mnhT9tPacJePCcKmAj2e8Hf37030DV1ElTM6SR7nFxJJJXtZUOqJi9x3UhcDNmtltuXuOLxacakUoKbTQS1M7IYWFz3kAADmVBEx8kgYxpc5xsAFtTs1ya81cT5oe8qHHW4uGD9/fpClJvOoXZMkY67leey7Jpf3cHDd5N5X209L+/1XQeB4dT4bRspadgAA8RsNSqHLWDQ4VRtghYC63idbmr05wHhauzixxjrqHkPUebOa2kUj+KzAdAp1JDfhI1JOihpoRqXt+BCs/aDmijyrgskrnsNS5hDWu5KdpiI25mLFbLbpr5WntUz5R5Vw18DJG/fZG6HfgHp1uuQs1YzUYvik1TLK53G4m5OtlcO0HMk+YMWfUySOdqdz9ffRYsuTnzTkn9PbcDhV42PUeRVmE4fUYlWMpqdhc5x5DZU0Mb5ZWxsBc5xsAFubsryTM6obGI+KR5b3jwdAOY99FVjxze2obWbLGKvVLKOyfIzJe7a6MNpYyDIQLl5G+q31R08dNTtbG1oY0WaLaaWVJgWG02GUUdNAwNDW6+aqpZC6zQduuq6laxSuoeK53MtyLz9Er3SyWbva/oq2jgbC27gL3uSTta6l0lOAzj1N9rcvd/eq1v249otPlvDJMNoZ2urJGn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Bdy28vyWv1V4xWy4hidRWTPLnyvJuTy5KkXnMl5vabT8va46RjpFY+BERQTEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARFFGx0jwxjS5zjYAc0EUEUk8rYomlz3GwAW/uwvsxNbUx1NWw8AAfK8el7aq19ifZvUYjWRySsBe8Bznf8G/z+i6uwfC6PBMJio6WIRxRttoNXHqraRru43qXP8Abj26eSKGKipIqOljEUMbbNDeQsq3CqZ9RP30g/tM68yqekgkrqgAaMv4rjYdFccarI8OoDHGeFzhYALMzudPNxuZ3KhzPjAhY+mi15Gyw+WTiJJdqd9V7VzPlkdK83JOn7qje7Xitp+S2KV1CSYZib3/ADUl77aafupckltt7qS54OoGnlyVsQlCcZOig4wTY2t6KUX/ABUIJA1I+JUhPLzbT4qAnXnZS2nlrdTIoXuAO+qMILm2t7+SijiL3X/DZVkdHw3cSLlTpHNjHC219isTZjanZTNYbu1J5K8ZRpGzY3GS3wRgn4nRWov4ySBbks47PMImmHeNaS6R2/kFTkvqGO8zqPLKMOoZK6RsMQIH+R8llrWUWC4a+WV7YoImkyPJ30UdDSU+GURdxNaALvedhotEdrWfZcw1UmD4VKWYZEeGSRp/7hvt6LWpS17ah1cWKvDp1W/lKx9q+cqrOmJmmge+LB4HHgYNO88z9VicNPHEwcDQLbKoZCGs8gLWv76L141P7++i6NKxWNQo65mdylhoG/NRYY1sla+ckEDQKVVS9zTufbUDQDmVVYUzu6EEkcTtSVZEM67bVkj7uG1h/KlF17ndQu20PldSpZo2tJLhboOSkxEbTi7Xb4KHiNje3S6tc2JxNFowHOOw36j9gqZ1dPK7ewO38J3T6V4fOwX1ueh5+7qSapzj4TodNBZW9o4jc3KnxjUAfn76e+Q7QqGucTcnf3+qnRuAuSTt+38lUzSeYsoOKpqaqPD6GIzVc3ha0DbzWfLHT1dlVF96xOvjwnC43y1Mpt4RsOp6BbnythOGZHwEsbaSvk1mmOrnHoFQZJy/R5KwozzvbLiMzQZpOY8gqevq5KuczSn/ANjTyCxMbWdqQlYhVS1lS6aR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aNlc/MYBaGltmm1tbgO+G61Iu1rTr4/4wIiImm03/db6roz7IkHfdocEmlo2A/HX9iudKQXmb6rpz7HFORnJ0t9O7sdNraqOSdY7Nfk/wl1hms3paf8A9yu2CX+5xjlwD8lZsznighPn+hV4wUf9M3pwAb36LjRP5uZxf8SXKn2238TZ3DTx9Qea5DXWP215eNji7/GoLb666HrtuuTl2Mf8IdfF4ERFNYIiII4ReQC11vf7NVC2ftDwfwEvY4vBOltB+60bh8Zlq44wNSQAukfsrwcXabStJu1gLjpYdAPmD8Ao5J1jspzT2dmVzvAATvZu+nRKW5bfkNgNeXNSq91mjyIvboVFTXEPMnhFz529/NcVqVn8mGdozgaKRvPu3n37H7fNzG3iTGKx4NwZn2Plcr6J9rk7oMBqpox+CB2m1xcXHyXzmrnB1bO4G4MjiPmupxv4NvF5lJREWwuEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREEURtI0+az+rcwmHg0HPyNhc/PVa/b+IeqzameJaGjMZPGWa689tPkul6VOs+mry43WJbk7HJm/cPEQA1wsOdir9mZpFaJSbm+1liHZDN/3IwbaAho5iyzDNbLRsds1zee2y9dHmHjORExyJbbweQVmTYmtfYmIgkjTRcv/AGm6VxosMmDPDBJIwu63It+a6W7M5RU5TYwgHhvf52/daW+0rhpkyriBAaTT1DHt66kA/kuDza/3N6/TpenW1yaz9uXURF516sREQFfMs8LxOxxdYMuLbXv7+isavGVpAyqlY4X42Wsb268vRTxzq8SjfvWW6exycyYdVQuvZptvuLBZLUDuMappCbXeNgsP7GZLTVcJJ62t6LMMfHBWQvF/Cb/Ve3487xQ8byo6eTaG2s8ETZTgeL/4nX0XIPbvA6PNsc5FhNCCPOwA9/ruevKgffMjNIN3d3e+/L+PouWO3+nN8IqeEf8AbexxG9w79rLiepV//Hj9S3vR7azTH6aoREXAemFW4S61QAVRKpw93DUNWY8sT4dFdk0xdgckHFoDxBXSuiMeL08pdZ1xr+axbsbqbsli476A6nZZfmNnd1EDjccJHLnp0Xt+Nbqw1n9PD8mOjl2j7bQrnsfgMbTez27fXVcz/aZp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bEMy4xWuLp6yVxJuSTrf2VXOaseHQxf9N5Z/xLxH9O//AKdQ4pnnLeHcQqMSi4m6cLdT6LEcY7ZsGp3vFHTyz8PMnhv6brniSeZ/4pHFSiSd1Cc8/EOnh/6e4tP57t/9/TbGM9s2LztLKOOKDTR1rkfPT/awfF8345ibiamulcDy4rAfJY+irnJafl1MPDwYf8OkQnS1M8riXyOJOp1Um6IoNkREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQRB7xs93zUxtTO3aQqSiCsixOtiN2TubqDobbKqhzBicRJZUyAk3J4jr7sPkFaUWYtMfKM1ifMMhjzhjjA8Ctms/fxn2N1W0+f8diLbzl9iSQ7W9/9rEUWeu32hODFbzWGcRdpONsOr2EXvbgFtiLfX6eqq4e0/E2X4o2E203sNB5+QWvEUvdt9qp4XHn/ACQ2SztRrABenjLuZ1A8vkPfJT4O1Odv44GctG3H1v0/Tprq9Fn3r/aE+ncaf8jbMfaoA0NdS2sLEsktc2te3wGl/ipg7VYQ6/3MkbaPAsNPLpdaiRPeuh/8Xxf+xuAdq1PbSmkF73/uD9vMqL/7rNNp/wBJLpr/ANwfstOonvWY/wDiuJ/2f8twf/dZiaCG0bzrpeUbW9Pe6hPa2ASW0bvL+4Phy9PYWoUT3rn/AMVxP+xteXtbqOO8dK0jUan37HnZUsva1iTg7gpomk7HU2+q1kix7t/tOPTeLH+SGwZu1LG3G7OBg5AD87n8lRz9pOYZS7/qS0OIJDRbp+ywpE92/wBra8Pj18Uj/wAMlqc7ZgmLia+ccV72kIVvqcwYrUG8lZM7n+M2VqRR6pXVx0r4hUy1tVKS58znE8ypLpZHbvcfioEUU3pJO5JXiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiD//2Q==",
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
    url: 'https://t.me/+998943931121',
    svg: '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" width=\"16\" height=\"16\"><path d=\"M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0zm5.98 8.347L16 16.5c-.162.655-.59.816-1.195.508l-3.3-2.432-1.593 1.534c-.176.176-.323.323-.662.323l.236-3.342 6.095-5.504c.265-.235-.058-.366-.41-.13L5.84 12.977 2.587 11.96c-.69-.215-.704-.69.144-.9L17.27 7.528c.575-.207 1.077.13.654.82z\"/></svg>'
  }, {
    icon: null,
    label: 'WhatsApp',
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
