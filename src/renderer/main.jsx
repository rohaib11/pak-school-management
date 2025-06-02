import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // ✅ updated
import App from './App'
import { DarkModeProvider } from './context/DarkModeContext'
import './styles/main.css'
console.log('🧪 electronAPI check:', window.electronAPI);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter> {/* ✅ updated */}
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </HashRouter>
  </React.StrictMode>
)
