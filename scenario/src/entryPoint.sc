require: slotfilling/slotFilling.sc
module = sys.zb-common
require: js/actions.js
require: js/reply.js
require: js/helpers.js
require: sc/addFood.sc
require: sc/showProgress.sc
require: sc/showRemaining.sc
require: sc/getRecommendations.sc
require: sc/deleteFood.sc
require: sc/help.sc
require: sc/searchRecipes.sc
require: sc/addCustomFood.sc

patterns:
$AnyText = $nonEmptyGarbage
$Amount = $nonEmptyGarbage
$FoodName = $nonEmptyGarbage

theme: /
state: Start
q!: $regex</start>
q!: (запусти | открой | включи) дневник питания
q!: (запусти | открой | включи) трекер калорий
script:
  addSuggestions([
    "добавь 100г курицы",
    "сколько съел?",
    "что съесть?",
    "помощь"
  ], $context);
  a: Привет! Я помогу вести дневник питания. Выберите подсказку или скажите команду.

state: Fallback
event!: noMatch
script:
  log('Не распознано');
  addSuggestions(["добавь 100г курицы", "сколько съел?", "помощь"], $context);
  a: "Команда не распознана. Скажите «помощь» для списка команд."