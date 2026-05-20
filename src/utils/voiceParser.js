import { foodDatabase } from './foodDatabase';
import { calculateNutritionForAmount } from './nutritionCalculator';

// ✅ Единая функция нормализации для голосовых команд
const normalizeProductName = (name) => {
  let s = name.toLowerCase().trim().replace(/^\d+\s*г\s*/i, '');
  // Отсекаем окончания
  s = s.replace(/(ов|ев|ей|ам|ами|ах|ях|у|ю|ы|и|а|я|о|е|ь|й|ие|ье|ые|ого|его|ому|ему)$/i, '');

  // Маппинг основ на канонические названия
  const map = {
    'куриц': 'курица', 'творог': 'творог', 'творога': 'творог',
    'гречк': 'гречка', 'греч': 'гречка', 'банан': 'банан', 'бананов': 'банан',
    'овощ': 'овощи', 'фрукт': 'фрукты', 'яблок': 'яблоки', 'ябл': 'яблоки',
    'помидор': 'помидоры', 'помид': 'помидоры', 'огурц': 'огурцы', 'огур': 'огурцы',
    'картошк': 'картофель', 'картофел': 'картофель', 'морков': 'морковь',
    'лук': 'лук', 'чеснок': 'чеснок', 'капуст': 'капуста', 'свёкл': 'свекла', 'свекл': 'свекла',
    'яйц': 'яйцо', 'яиц': 'яйцо', 'рыб': 'рыба', 'мяс': 'мясо', 'хлеб': 'хлеб'
  };
  return map[s] || s;
};

export const parseNutritionCommand = (text, actions) => {
  const lower = text.toLowerCase().trim();

  const addMatch = lower.match(/(?:добавь|съел|запиши|ем)\s+(?:(\d+)\s*(?:г|грамм)\s*)?([\wа-яё\- ]+)/i);
  if (addMatch) {
    const [, amountRaw, productName] = addMatch;
    const amount = amountRaw ? parseInt(amountRaw) : 100;

    const normalized = normalizeProductName(productName);
    const food = foodDatabase.find(f =>
      f.name.toLowerCase().includes(normalized) ||
      normalized.includes(f.name.toLowerCase())
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
    return `❌ Продукт "${productName}" не найден`;
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