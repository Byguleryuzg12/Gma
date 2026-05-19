import React from 'react';
import './App.css';

const GmaShell = React.lazy(() => import('./GmaShell.jsx'));

function LoadingShell() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#02040a',
      color: '#c8d0d8',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '13px',
      letterSpacing: '0.08em'
    }
  }, 'GLOBAL MARKET ANALYTICS');
}

export default function App() {
  return /*#__PURE__*/React.createElement(React.Suspense, {
    fallback: /*#__PURE__*/React.createElement(LoadingShell, null)
  }, /*#__PURE__*/React.createElement(GmaShell, null));
}
