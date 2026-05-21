import { foodDatabase } from './foodDatabase';
import { calculateNutritionForAmount } from './nutritionCalculator';

const normalizeProductName = (name) => {
  let s = name.toLowerCase().trim().replace(/^\d+\s*г\s*/i, '');
  s = s.replace(/(ов|ев|ей|ам|ами|ах|ях|у|ю|ы|и|а|я|о|е|ь|й|ие|ье|ые|ого|его|ому|ему)$/i, '');
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
      try {
        actions.addFood?.({
          id: Date.now().toString(),
          productName: food.name,
          amount,
          ...calculateNutritionForAmount(food, amount),
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now()
        });
      } catch (e) { console.error('Ошибка addFood:', e); }
      return `✅ Добавлено ${food.name} ${amount}г`;
    }
    return `❌ Продукт "${productName}" не найден`;
  }

  if (lower.includes('сколько съел') || lower.includes('калорий') || lower.includes('прогресс')) {
    const t = actions.totals || {};
    return `📊 Сегодня: ${t.calories || 0} ккал | Б:${t.protein || 0}г Ж:${t.fat || 0}г У:${t.carbs || 0}г`;
  }

  if (lower.includes('осталось') || lower.includes('сколько можно')) {
    const r = actions.remaining || {};
    return `🎯 Осталось: ${r.calories ?? '?'} ккал`;
  }

  if (lower.includes('что съесть') || lower.includes('посоветуй')) {
    const recs = actions.recommendations || [];
    if (recs.length) return `💡 Рекомендую: ${recs.map(r => r.items?.join(', ') || '').join('; ')}`;
    return '✨ Всё в норме!';
  }

  const recipeMatch = lower.match(/(?:рецепт|приготовь|найди).*?(?:из|с)?\s*(.+)/i);
  if (recipeMatch) {
    const raw = recipeMatch[1] || "";
    const ingredients = raw.replace(/[.,!?;:]/g, '').split(/[\s,]+/).filter(w => w.length > 2);
    try { actions.searchRecipes?.(ingredients); } catch (e) { console.error('Ошибка searchRecipes:', e); }
    return ingredients.length ? `🔍 Ищу: ${ingredients.join(', ')}` : "🔍 Ищу рецепты";
  }

  if (lower.includes('удали') || lower.includes('убери')) {
    try { actions.deleteLastFood?.(); } catch (e) { console.error('Ошибка deleteLastFood:', e); }
    return "🗑️ Удалено";
  }

  if (lower.includes('помощь') || lower.includes('что умеешь')) {
    return '🎤 Команды: «добавь 100г курицы», «сколько съел?», «что съесть?», «удали последнее»';
  }

  return '❓ Не поняла. Скажите «помощь»';
};