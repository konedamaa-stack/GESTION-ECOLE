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

// Test de connexion au backend
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend response:', data))
  .catch(err => console.error('Backend error:', err));
