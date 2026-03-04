import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './i18n';

// Aggressive suppression of browser extension errors
if (typeof window !== 'undefined') {
  // Override console.error
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args.join(' ').toString();
    if (
      errorMessage.includes('runtime.lastError') ||
      errorMessage.includes('Receiving end does not exist') ||
      errorMessage.includes('Could not establish connection')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // Override console.warn
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const warnMessage = args.join(' ').toString();
    if (
      warnMessage.includes('runtime.lastError') ||
      warnMessage.includes('Receiving end does not exist')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('runtime.lastError') ||
      event.message?.includes('Receiving end does not exist')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
