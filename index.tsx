import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import bridge from '@vkontakte/vk-bridge';
import './index.css'; // Если у вас есть стили, оставьте

// --- ЛОВУШКА ОШИБОК ДЛЯ МОБИЛЬНЫХ ---
// Этот код покажет ошибку на экране, если React сломается
window.addEventListener('error', (event) => {
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace; font-size: 16px; background: #fff;">
      <h1>CRASH REPORT</h1>
      <p><strong>Error:</strong> ${event.message}</p>
      <p><strong>File:</strong> ${event.filename}</p>
      <p><strong>Line:</strong> ${event.lineno}</p>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML = `
    <div style="padding: 20px; color: blue; font-family: monospace; font-size: 16px; background: #fff;">
      <h1>PROMISE ERROR</h1>
      <p><strong>Reason:</strong> ${event.reason}</p>
    </div>
  `;
});
// -------------------------------------

// Инициализация моста должна быть тут
bridge.send("VKWebAppInit").then(() => {
    console.log("VK Bridge init success");
}).catch((e) => {
    console.log("VK Bridge init failed", e);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
    document.body.innerHTML = '<h1 style="color:red">ERROR: id="root" not found in index.html</h1>';
} else {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
}
