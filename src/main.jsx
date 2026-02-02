import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import DevStartupInterceptor from './components/dev/DevStartupInterceptor';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevStartupInterceptor>
      <App />
    </DevStartupInterceptor>
  </StrictMode>,
)
