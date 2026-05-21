// 🔥 ЭТОТ ФАЙЛ ДОЛЖЕН БЫТЬ В public/env-config.js
(function() {
  if (typeof window !== 'undefined') {
    window.appInitialData = {
      applicationId: 'local-dev-app-' + Date.now(),
      projectId: 'Дневник питания',
      token: '',
      device: { platformType: 'WEB' },
      surface: 'COMPANION',
      locale: 'ru'
    };
    console.log('✅ window.appInitialData установлен:', window.appInitialData);
  }
})();