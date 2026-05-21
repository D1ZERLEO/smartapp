import { useEffect } from 'react';

export default function AssistantPanel({
  onCommand
}) {

  useEffect(() => {

    const handleKey = async (e) => {

      if (e.key !== 'Enter') return;

      const text = e.target.value?.trim();

      if (!text) return;

      try {

        const result = await onCommand(text);

        console.log('ASSISTANT:', result);

        alert(result);

      } catch (err) {

        console.error(err);

        alert('Ошибка команды');

      }

      e.target.value = '';
    };

    // создаём локальную панель
    const input = document.createElement('input');

    input.placeholder = 'Введите команду...';

    input.style.position = 'fixed';
    input.style.bottom = '20px';
    input.style.left = '50%';
    input.style.transform = 'translateX(-50%)';
    input.style.width = '320px';
    input.style.padding = '16px';
    input.style.borderRadius = '16px';
    input.style.border = 'none';
    input.style.background = '#19c37d';
    input.style.color = '#fff';
    input.style.fontSize = '16px';
    input.style.zIndex = '999999';

    input.addEventListener('keydown', handleKey);

    document.body.appendChild(input);

    return () => {

      input.removeEventListener(
        'keydown',
        handleKey
      );

      document.body.removeChild(input);
    };

  }, [onCommand]);

  return null;
}