theme: /
state: УдалитьПродукт

# ✅ Добавлено слово "лишнее" и "последнюю запись"
q!: (удали | убери | вычеркни) ((последнее | последний | лишнее | последнюю запись) | $AnyText::foodName)

script:
  log('Удаление продукта');
  var foodId = getFoodIdBySelected(getRequest($context));
  if (foodId) {
    deleteFoodById(foodId, $context);
  } else {
    deleteLastFood($context);
  }

  # ✅ Нейтральный ответ
  a: "Запись удалена из дневника."