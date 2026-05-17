import React from 'react';
import './App.css';
import { LangContext, GlobalHeader, GlobalFooter, OnboardingOverlay, LANGS, CORE_LANGS, getCachedTranslation, translateWithAI, getTranslations, EN } from './allComponents.js';
import HomePage from './pages/HomePage';
import MarketDashboard from './pages/MarketDashboard';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import UserPanelPage from './pages/UserPanelPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import RefundPage from './pages/RefundPage';

function App() {
  const [page, setPage] = React.useState('home');
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gma_current_user'));
    } catch {
      return null;
    }
  });
  const [onboardingDone, setOnboardingDone] = React.useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('gma_current_user'));
      return !u || localStorage.getItem('gma_onboarded_' + u.email) === '1';
    } catch { return true; }
  });
  const normalizeLang = code => CORE_LANGS.includes(code) ? code : 'en';
  const [lang, setLangState] = React.useState(() => normalizeLang(localStorage.getItem('gma_lang') || 'en'));
  const [aiTranslating, setAiTranslating] = React.useState(false);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const setLang = code => {
    const nextCode = normalizeLang(code);
    localStorage.setItem('gma_lang', nextCode);
    setLangState(nextCode);
    const info = LANGS.find(l => l.c === nextCode);
    document.documentElement.dir = info && info.r ? 'rtl' : 'ltr';
    document.documentElement.lang = nextCode;
    // Desteklenmeyen diller icin AI ceviri baslat
    if (!CORE_LANGS.includes(nextCode) && !getCachedTranslation(nextCode)) {
      setAiTranslating(true);
      translateWithAI(nextCode, info?.n || nextCode, translated => {
        setAiTranslating(false);
        forceUpdate(); // yeniden render et
      });
    }
  };
  const t = key => {
    const tr = getTranslations(lang);
    return tr[key] || EN[key] || key;
  };
  const navigate = p => setPage(p);

  // Global navigate event (from modals redirecting to login)
  React.useEffect(() => {
    const handler = e => navigate(e.detail);
    window.addEventListener('gma:navigate', handler);
    return () => window.removeEventListener('gma:navigate', handler);
  }, []);
  const handleLogin = u => {
    setUser(u);
    const alreadyOnboarded = localStorage.getItem('gma_onboarded_' + u.email) === '1';
    setOnboardingDone(alreadyOnboarded);
    setPage('dashboard');
  };
  const handleLogout = () => {
    setUser(null);
    setPage('home');
  };
  const noHeaderPages = ['login'];
  const noFooterPages = ['login', 'dashboard'];
  return /*#__PURE__*/React.createElement(LangContext.Provider, {
    value: {
      lang,
      setLang,
      t,
      aiTranslating
    }
  }, user && !onboardingDone && /*#__PURE__*/React.createElement(OnboardingOverlay, {
    user: user,
    onComplete: function(answers){
      setOnboardingDone(true);
      setPage('dashboard');
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#060912',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }
  }, !noHeaderPages.includes(page) && /*#__PURE__*/React.createElement(GlobalHeader, {
    page: page,
    onNavigate: navigate,
    user: user
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, page === 'home' && /*#__PURE__*/React.createElement(HomePage, {
    onNavigate: navigate
  }), page === 'pricing' && /*#__PURE__*/React.createElement(PricingPage, {
    onNavigate: navigate,
    user: user
  }), page === 'login' && /*#__PURE__*/React.createElement(LoginPage, {
    onNavigate: navigate,
    onLogin: handleLogin
  }), page === 'dashboard' && /*#__PURE__*/React.createElement(MarketDashboard, {
    onNavigate: navigate,
    user: user
  }), page === 'profile' && /*#__PURE__*/React.createElement(UserPanelPage, {
    user: user,
    onNavigate: navigate,
    onLogout: handleLogout
  }), page === 'about' && /*#__PURE__*/React.createElement(AboutPage, {
    onNavigate: navigate
  }), page === 'privacy' && /*#__PURE__*/React.createElement(PrivacyPage, {
    onNavigate: navigate
  }), page === 'terms' && /*#__PURE__*/React.createElement(TermsPage, {
    onNavigate: navigate
  }), page === 'refund' && /*#__PURE__*/React.createElement(RefundPage, {
    onNavigate: navigate
  }), page === 'contact' && /*#__PURE__*/React.createElement(ContactPage, {
    onNavigate: navigate
  })), !noFooterPages.includes(page) && /*#__PURE__*/React.createElement(GlobalFooter, {
    onNavigate: navigate
  })));
}

export default App;
