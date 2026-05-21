// src/components/AssistantPanel.jsx
import { useEffect, useRef } from 'react';

export default function AssistantPanel({ onCommand, onBackendAction, token: tokenProp, smartappId: smartappIdProp, onReady }) {
  const assistantRef = useRef(null);
  const onBackendActionRef = useRef(onBackendAction);
  const onCommandRef = useRef(onCommand);

  useEffect(() => { onBackendActionRef.current = onBackendAction; }, [onBackendAction]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);

  useEffect(() => {
    // 🔥 НЕ ИМПОРТИРУЕМ @salutejs/client локально — только на Canvas
    const isCanvas = window.appInitialData?.applicationId &&
                     window.appInitialData?.token &&
                     !window.appInitialData.applicationId.startsWith('mock');

    if (!isCanvas) {
      console.log('ℹ️ AssistantPanel: локальный режим (без SDK)');
      const mockAssistant = {
        on: () => {},
        sendData: () => {},
        start: () => console.log('✅ Mock assistant ready'),
        close: () => {}
      };
      assistantRef.current = mockAssistant;
      onReady?.(mockAssistant);
      return;
    }

    // Canvas — импортируем SDK
    import('@salutejs/client').then(({ createAssistant }) => {
      const token = window.appInitialData.token;
      const smartappId = window.appInitialData.projectId;

      const getState = () => {
        try {
          const profile = JSON.parse(localStorage.getItem('nutrition_profile') || 'null');
          const targets = JSON.parse(localStorage.getItem('nutrition_targets') || 'null');
          const totals = JSON.parse(localStorage.getItem('nutrition_totals') || '{"calories":0,"protein":0,"fat":0,"carbs":0}');
          const allMeals = JSON.parse(localStorage.getItem('nutrition_meals') || '[]');
          const today = new Date().toISOString().split('T')[0];
          const items = allMeals.filter(m => m.date === today).map((m, i) => ({
            number: i + 1, id: m.id, title: `${m.productName} ${m.amount}г`
          }));
          return { profile, targets, totals, item_selector: { items, ignored_words: ['добавь','съел','запиши','удали','сколько','что съесть','помощь','найди','рецепт','осталось'] } };
        } catch (e) { return {}; }
      };

      const getRecoveryState = () => {
        try { return { profile: JSON.parse(localStorage.getItem('nutrition_profile') || 'null') }; }
        catch (e) { return {}; }
      };

      try {
        const assistant = createAssistant({ token, smartAppBrain: { smartappId }, getState, getRecoveryState });

        assistant.on('data', (event) => {
          if (event?.type !== 'smart_app_data') return;
          if (event.action) onBackendActionRef.current?.(event.action);
          if (event.smart_app_data?.text) {
            const response = onCommandRef.current?.(event.smart_app_data.text);
            if (response) {
              assistant.sendData({
                type: 'smart_app_data',
                smart_app_data: { text: response, pronounceText: response }
              });
            }
          }
        });

        assistant.on('start', () => console.log('✅ Assistant started (Canvas)'));
        assistant.on('error', (err) => console.error('❌ Assistant error:', err));

        assistantRef.current = assistant;
        onReady?.(assistant);
        assistant.start?.();

        return () => { assistant.close?.(); assistantRef.current = null; };
      } catch (err) {
        console.error('🔥 Init error:', err);
      }
    }).catch(err => console.error('❌ SDK load error:', err));
  }, [tokenProp, smartappIdProp, onReady]);

  return null;
}