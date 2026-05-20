import React, { useEffect, useRef } from 'react';

export default function AssistantPanel({ onCommand, onBackendAction, token: tokenProp, smartappId: smartappIdProp, onReady }) {
  const assistantRef = useRef(null);
  const onBackendActionRef = useRef(onBackendAction);
  const onCommandRef = useRef(onCommand);

  useEffect(() => { onBackendActionRef.current = onBackendAction; }, [onBackendAction]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);

  useEffect(() => {
    // ✅ НЕ создаём ассистент локально — только на Canvas
    if (!window.appInitialData) {
      console.log('ℹ️ Ассистент доступен только в SmartApp Studio');
      return;
    }

    const token = window.appInitialData.token || tokenProp;
    const smartappId = window.appInitialData.projectId || smartappIdProp;

    if (!token) {
      console.warn('⚠️ Нет токена');
      return;
    }

    // Динамический импорт только когда есть appInitialData
    import('@salutejs/client').then(({ createAssistant }) => {
      const getState = () => {
        const profile = JSON.parse(localStorage.getItem('nutrition_profile') || 'null');
        const targets = JSON.parse(localStorage.getItem('nutrition_targets') || 'null');
        const totals = JSON.parse(localStorage.getItem('nutrition_totals') || '{"calories":0,"protein":0,"fat":0,"carbs":0}');
        const allMeals = JSON.parse(localStorage.getItem('nutrition_meals') || '[]');
        const today = new Date().toISOString().split('T')[0];
        const items = allMeals.filter(m => m.date === today).map((m, i) => ({
          number: i + 1, id: m.id, title: `${m.productName} ${m.amount}г`
        }));
        return {
          profile, targets, totals,
          item_selector: { items, ignored_words: ['добавь','съел','запиши','удали','сколько','что съесть','помощь','найди','рецепт','осталось'] }
        };
      };

      const getRecoveryState = () => ({ profile: JSON.parse(localStorage.getItem('nutrition_profile') || 'null') });

      try {
        const assistant = createAssistant({
          token,
          smartAppBrain: { smartappId },
          getState,
          getRecoveryState
        });

        assistant.on('data', (event) => {
          if (event && event.type === 'smart_app_data' && event.action) {
            onBackendActionRef.current?.(event.action);
          }
        });

        assistant.on('start', () => {
          console.log('✅ Ассистент запущен');
        });

        assistant.on('error', (err) => {
          console.error('💥 Ошибка:', err);
        });

        assistantRef.current = assistant;
        if (onReady) onReady(assistant);
        if (assistant.start) assistant.start();

        return () => {
          if (assistant.close) assistant.close();
          assistantRef.current = null;
        };
      } catch (err) {
        console.error('🔥 Ошибка инициализации:', err);
      }
    }).catch(err => {
      console.error('Ошибка загрузки SDK:', err);
    });
  }, [tokenProp, smartappIdProp, onReady]);

  return null;
}