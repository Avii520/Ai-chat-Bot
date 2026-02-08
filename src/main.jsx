import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Bot.css'
import Result from './Bot.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Result />
  </StrictMode>,
)
