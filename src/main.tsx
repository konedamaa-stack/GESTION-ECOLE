import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

initCustomAlert();
import './lib/i18n'
import App from './App.tsx'
import { CustomAlert, initCustomAlert } from './components/CustomAlert';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CustomAlert />
  </StrictMode>,
)
