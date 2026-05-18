theme: /
state: ДобавитьПродукт

# ✅ Исправленные паттерны - количество может быть слитно с "г"
q!: (добавь | съел | запиши | ем) [$Amount::amount] (грамм | г) $FoodName::foodName
q!: (добавь | съел | запиши | ем) $FoodName::foodName

script:
  log('Добавление продукта: ' + JSON.stringify($parseTree));

  var amount = parseInt($parseTree._amount) || 100;
  var foodName = $parseTree._foodName || "";

  # ✅ Очищаем название от чисел и "г" в начале
  foodName = foodName.replace(/^\d+\s*г\s*/i, '').trim();

  # Если всё ещё пусто, берём как есть
  if (!foodName) {
    foodName = $parseTree._foodName;
  }

  log('Очищенное название: ' + foodName + ', количество: ' + amount);

  addFood(foodName, amount, $context);

  addSuggestions([
    "добавь 150г курицы",
    "сколько съел?",
    "что съесть?"
  ], $context);

  random:
  a: "Добавил {{foodName}}"
  a: "Записал {{foodName}}"
  a: "Ок, {{foodName}} добавлен"