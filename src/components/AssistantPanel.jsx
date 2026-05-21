import { useEffect, useRef } from 'react';
import { createSmartappDebugger } from '@salutejs/client';

export default function AssistantPanel({
  onCommand,
  onBackendAction,
  onReady,
}) {
  const assistantRef = useRef(null);

  useEffect(() => {
    let assistant;

    try {
      assistant = createSmartappDebugger({
        token: process.env.REACT_APP_TOKEN,

        smartAppBrain: {
          smartappId: process.env.REACT_APP_SMARTAPP,
        },

        initPhrase: 'запусти приложение',

        nativePanel: {
          defaultText: 'Введите команду',
        },

        settings: {
          disableTts: true,
        },
      });

      assistant.on('data', async (event) => {
        try {
          console.log('ASSISTANT EVENT:', event);

          // Canvas actions
          if (event.action) {
            onBackendAction?.(event.action);
            return;
          }

          // Local text commands
          const text =
            event?.smart_app_data?.text ||
            event?.payload?.text ||
            '';

          if (!text) return;

          const response = await onCommand?.(text);

          if (!response) return;

          assistant.sendData({
            action: {
              action_id: 'assistant_reply',
              parameters: {
                text: response,
              },
            },
          });

        } catch (err) {
          console.error('DATA ERROR:', err);
        }
      });

      assistant.on('start', () => {
        console.log('ASSISTANT STARTED');
      });

      assistant.on('error', (err) => {
        console.error('SDK ERROR:', err);
      });

      assistantRef.current = assistant;

      onReady?.(assistant);

      assistant.start?.();

    } catch (err) {
      console.error('INIT ERROR:', err);
    }

    return () => {
      try {
        assistant?.close?.();
      } catch {}
    };
  }, [onCommand, onBackendAction, onReady]);

  return null;
}