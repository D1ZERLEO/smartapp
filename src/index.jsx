/* eslint-disable import/first */
// 🔥 МОК ДО ВСЕХ IMPORT — ОБЯЗАТЕЛЬНО ДО ЗАГРУЗКИ SDK
if (typeof window !== 'undefined' && !window.appInitialData) {
  window.appInitialData = {
    applicationId: 'local-dev-app',
    projectId: process.env.REACT_APP_SMARTAPP || 'Дневник питания',
    token: process.env.REACT_APP_TOKEN || '',
    device: { platformType: 'WEB' },
    surface: 'COMPANION',
    locale: 'ru'
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);