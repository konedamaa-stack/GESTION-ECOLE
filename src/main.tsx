import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'
import App from './App.tsx'
import { CustomAlert, initCustomAlert } from './components/CustomAlert'

initCustomAlert();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CustomAlert />
  </StrictMode>,
)
