import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './cesium.css'
import App from './App.jsx'

// We'll configure Cesium dynamically when needed
// This avoids issues with the Mersenne-Twister module

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
