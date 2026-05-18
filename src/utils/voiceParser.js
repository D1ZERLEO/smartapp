import { foodDatabase } from './foodDatabase';
import { calculateNutritionForAmount } from './nutritionCalculator';

export const parseNutritionCommand = (text, actions) => {
  const lower = text.toLowerCase().trim();

  const addMatch = lower.match(/(?:добавь|съел|запиши|ем)\s+(?:(\d+)\s*(?:г|грамм)\s*)?([\wа-яё\- ]+)/i);
  if (addMatch) {
    const [, amountRaw, productName] = addMatch;
    const amount = amountRaw ? parseInt(amountRaw) : 100;
    const food = foodDatabase.find(f =>
      f.name.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(f.name.toLowerCase())
    );
    if (food) {
      const nutrition = calculateNutritionForAmount(food, amount);
      actions.addFood?.({
        id: Date.now().toString(),
        productName: food.name,
        amount,
        ...nutrition,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      });
      return ""; // Backend handles TTS
    }
    return `🔄 Ищу "${productName}" в базе...`;
  }

  if (lower.includes('сколько съел') || lower.includes('калорий')) {
    const t = actions.totals || {};
    return `📊 Сегодня: ${t.calories || 0} ккал | Б:${t.protein || 0}г Ж:${t.fat || 0}г У:${t.carbs || 0}г`;
  }

  if (lower.includes('осталось') || lower.includes('сколько можно')) {
    const r = actions.remaining || {};
    return `🎯 Осталось: ${r.calories ?? '?'} ккал | Б:${r.protein ?? '?'}г Ж:${r.fat ?? '?'}г У:${r.carbs ?? '?'}г`;
  }

  if (lower.includes('что съесть') || lower.includes('посоветуй')) {
    const recs = actions.recommendations || [];
    if (recs.length) {
      return `💡 Рекомендую: ${recs.map(r => r.items.join(', ')).join('; ')}`;
    }
    return '✨ Всё в норме!';
  }

  const recipeMatch = lower.match(/(?:рецепт|приготовь|найди).*?(?:из|с)?\s*(.+)/i);
  if (recipeMatch) {
    const raw = recipeMatch[1] || "";
    const stemRu = (w) => w.toLowerCase().replace(/(ый|ий|ая|яя|ее|ие|ые|ое|ую|юю|ым|им|ого|его|у|а|е|о|ы|и|я|ю|ем|ом|ам|ям|ми)$/i, '');
    const ingredients = raw.replace(/[.,!?;:]/g, '').split(/[\s,]+/).map(stemRu).filter(w => w.length > 2 && !['и','с','из','на','для'].includes(w));
    actions.searchRecipes?.(ingredients);
    return ""; // Backend handles TTS
  }

  if (lower.includes('удали') || lower.includes('убери')) {
    actions.deleteLastFood?.();
    return ""; // Backend handles TTS
  }

  if (lower.includes('помощь') || lower.includes('что умеешь')) {
    return '🎤 Команды: «добавь 100г курицы», «сколько съел?», «что съесть?», «рецепт из яиц», «удали последнее»';
  }

  return '❓ Команда не распознана. Скажите «помощь» для списка команд';
};