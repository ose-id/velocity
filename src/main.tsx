import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui';
import { DevStartupInterceptor } from './components/dev';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
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
  );
}
