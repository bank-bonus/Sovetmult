import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Init VK Bridge
if (window.vkBridge) {
  window.vkBridge.send('VKWebAppInit')
    .then(() => console.log('VK Bridge Initialized'))
    .catch((e: any) => console.error('VK Bridge Init Failed', e));
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);