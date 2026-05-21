// src/components/AssistantPanel.jsx
import { useEffect, useRef } from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';

export default function AssistantPanel({ onCommand, onBackendAction, token: tokenProp, smartappId: smartappIdProp, onReady }) {
  const assistantRef = useRef(null);
  const onBackendActionRef = useRef(onBackendAction);
  const onCommandRef = useRef(onCommand);

  useEffect(() => { onBackendActionRef.current = onBackendAction; }, [onBackendAction]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);

  useEffect(() => {
    // ✅ Создаём ПОЛНЫЙ мок с applicationId
    if (!window.appInitialData) {
      window.appInitialData = {
        token: tokenProp || process.env.REACT_APP_TOKEN,
        projectId: smartappIdProp || process.env.REACT_APP_SMARTAPP,
        applicationId: 'local-mock-app-id', // 🔥 КРИТИЧНО: это поле ищет SDK
        surface: 'COMPANION'
      };
    }

    const initialData = window.appInitialData;
    const appToken = tokenProp || initialData.token;
    const appSmartAppId = smartappIdProp || initialData.projectId;

    if (!appToken) {
      console.warn('⚠️ Нет токена');
      return;
    }

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
        return {
          profile,
          targets,
          totals,
          item_selector: {
            items,
            ignored_words: ['добавь','съел','запиши','удали','сколько','что съесть','помощь','найди','рецепт','осталось']
          }
        };
      } catch (e) {
        console.error('Ошибка в getState:', e);
        return {};
      }
    };

    const getRecoveryState = () => {
      try {
        return { profile: JSON.parse(localStorage.getItem('nutrition_profile') || 'null') };
      } catch (e) {
        return {};
      }
    };

    try {
      const isDev = process.env.NODE_ENV === 'development';

      // 🔥 ГЛАВНОЕ: settings: { disableTts: true } ОТКЛЮЧАЕТ ОЗВУЧКУ
      const assistant = isDev
        ? createSmartappDebugger({
            token: appToken,
            smartAppBrain: { smartappId: appSmartAppId },
            initPhrase: 'запусти дневник питания',
            getState,
            getRecoveryState,
            nativePanel: {
              defaultText: 'Скажите или напишите команду',
              screenshotMode: false
            },
            surface: 'COMPANION',
            settings: {
              disableTts: true  // 🔥 ЭТО ОТКЛЮЧАЕТ TTS И ОШИБКУ applicationId
            }
          })
        : createAssistant({
            token: appToken,
            smartAppBrain: { smartappId: appSmartAppId },
            getState,
            getRecoveryState
          });

      assistant.on('data', (event) => {
        if (event?.type !== 'smart_app_data') return;

        if (event.action) {
          onBackendActionRef.current?.(event.action);
        }

        if (event.smart_app_data?.text) {
          const response = onCommandRef.current?.(event.smart_app_data.text);
          if (response && response.trim() !== '') {
            assistant.sendData({
              type: 'smart_app_data',
              smart_app_data: {
                text: response,
                pronounceText: response
              }
            });
          }
        }
      });

      assistant.on('start', () => console.log('✅ Ассистент запущен'));
      assistant.on('error', (err) => console.error('❌ Ошибка ассистента:', err));

      assistantRef.current = assistant;
      onReady?.(assistant);
      assistant.start?.();

      return () => {
        assistant.close?.();
        assistantRef.current = null;
      };
    } catch (err) {
      console.error('🔥 Ошибка инициализации:', err);
    }
  }, [tokenProp, smartappIdProp, onReady]);

  return null;
}