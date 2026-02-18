import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/molecules/ToastContainer';

import DevStartupInterceptor from './components/dev/DevStartupInterceptor';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevStartupInterceptor>
      <LanguageProvider>
        <ToastProvider>
          <App />
          <ToastContainer />
        </ToastProvider>
      </LanguageProvider>
    </DevStartupInterceptor>
  </StrictMode>,
)
