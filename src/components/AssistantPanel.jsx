import { useEffect, useRef } from 'react';
import { createSmartappDebugger } from '@salutejs/client';

export default function AssistantPanel({ onCommand, onBackendAction, token: tokenProp, smartappId: smartappIdProp, onReady }) {
  const assistantRef = useRef(null);
  const onBackendActionRef = useRef(onBackendAction);
  const onCommandRef = useRef(onCommand);

  useEffect(() => { onBackendActionRef.current = onBackendAction; }, [onBackendAction]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);

  useEffect(() => {
    const token = tokenProp || process.env.REACT_APP_TOKEN;
    const smartappId = smartappIdProp || process.env.REACT_APP_SMARTAPP;
    if (!token) { console.warn('⚠️ Нет токена'); return; }

    // 🔥 Создаём правильный объект (БЕЗ Object.defineProperty)
    if (!window.appInitialData || Array.isArray(window.appInitialData)) {
      window.appInitialData = {
        applicationId: 'local-dev-app-' + Date.now(),
        projectId: smartappId,
        token: token,
        device: { platformType: 'WEB' },
        surface: 'COMPANION',
        locale: 'ru'
      };
    } else {
      // Если уже объект — добавляем/обновляем поля
      if (!window.appInitialData.applicationId) {
        window.appInitialData.applicationId = 'local-dev-app-' + Date.now();
      }
      window.appInitialData.projectId = smartappId;
      window.appInitialData.token = token;
      window.appInitialData.device = window.appInitialData.device || { platformType: 'WEB' };
      window.appInitialData.surface = window.appInitialData.surface || 'COMPANION';
    }

    console.log('✅ window.appInitialData:', window.appInitialData);
    console.log('✅ applicationId:', window.appInitialData.applicationId);

    const getState = () => {
      try {
        const totals = JSON.parse(localStorage.getItem('nutrition_totals') || '{"calories":0,"protein":0,"fat":0,"carbs":0}');
        const meals = JSON.parse(localStorage.getItem('nutrition_meals') || '[]');
        const today = new Date().toISOString().split('T')[0];
        return {
          totals,
          item_selector: {
            items: meals.filter(m => m.date === today).map((m, i) => ({
              number: i + 1, id: m.id, title: `${m.productName} ${m.amount}г`
            }))
          }
        };
      } catch { return {}; }
    };

    try {
      const assistant = createSmartappDebugger({
        token,
        smartAppBrain: { smartappId },
        initPhrase: 'запусти дневник питания',
        getState,
        nativePanel: { defaultText: 'Скажите или напишите команду' },
        surface: 'COMPANION',
        settings: {
          disableTts: true,
          disableListen: true
        }
      });

      assistant.on('data', (event) => {
        if (event?.type !== 'smart_app_data') return;
        if (event.action) onBackendActionRef.current?.(event.action);
        if (event.smart_app_data?.text) {
          const response = onCommandRef.current?.(event.smart_app_data.text);
          if (response) {
            assistant.sendData({
              type: 'smart_app_data',
              smart_app_data: { text: response }
            });
          }
        }
      });

      assistant.on('start', () => console.log('✅ Ассистент запущен'));
      assistant.on('error', (err) => console.error('❌ Ошибка ассистента:', err));

      assistantRef.current = assistant;
      onReady?.(assistant);
      assistant.start?.();

      return () => { assistant.close?.(); assistantRef.current = null; };
    } catch (err) {
      console.error('🔥 Ошибка инициализации:', err);
    }
  }, [tokenProp, smartappIdProp, onReady]);

  return null;
}