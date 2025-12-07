import React from 'react';
import ReactDOM from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge'; // Импортируем библиотеку
import App from './App';

// Если у тебя был файл index.css, раскомментируй строку ниже:
// import './index.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Инициализация ВК
vkBridge.send('VKWebAppInit')
  .then(() => console.log('VK Bridge Initialized'))
  .catch((e) => console.error('VK Bridge Init Failed', e));

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
