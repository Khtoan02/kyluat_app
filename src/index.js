import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Register service worker for PWA + push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed:', err)
    })
  })
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
