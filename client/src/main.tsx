import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './standalone.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App apiBasePath={`${(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')}/api`} />
  </StrictMode>,
)
