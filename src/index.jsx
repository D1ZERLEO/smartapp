import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';

// ✅ МОК ДО ЗАГРУЗКИ SDK
if (!window.appInitialData) {
  window.appInitialData = {
    applicationId: 'local-dev-app',
    projectId: process.env.REACT_APP_SMARTAPP,
    token: process.env.REACT_APP_TOKEN,
    device: {
      platformType: 'WEB',
    },
  };
}

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);