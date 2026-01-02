import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill for smooth scrolling
if (!('scrollBehavior' in document.documentElement.style)) {
  import('scroll-behavior-polyfill');
}

// Add custom error handler
const showErrorOverlay = (err: ErrorEvent) => {
  const ErrorOverlay = customElements.get('vite-error-overlay');
  if (!ErrorOverlay) {
    return;
  }
  const overlay = new ErrorOverlay(err);
  document.body.appendChild(overlay);
};

window.addEventListener('error', showErrorOverlay);
window.addEventListener('unhandledrejection', ({ reason }) =>
  showErrorOverlay(reason)
);

// Initialize React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
