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

    // Гарантируем правильный appInitialData
    if (!window.appInitialData || typeof window.appInitialData !== 'object' || Array.isArray(window.appInitialData)) {
      window.appInitialData = {
        applicationId: 'local-dev-app',
        projectId: smartappId,
        token,
        device: { platformType: 'WEB' },
        surface: 'COMPANION',
        locale: 'ru'
      };
    }

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
        settings: { disableTts: true }
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