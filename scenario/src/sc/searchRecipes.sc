theme: /
  state: ПоискРецептов

    # Паттерн С продуктами
    q!: (найди | покажи) рецепты (из | с) $AnyText::ingredients

    # Паттерн БЕЗ продуктов (просто "Найди рецепты")
    q!: (найди | покажи) рецепты

    # Альтернативные фразы
    q!: (что приготовить | рецепт) из $AnyText::ingredients

    script:
      log('Запрос рецептов');

      # Получаем текст ингредиентов, если их нет — пустая строка
      var raw = $parseTree._ingredients || "";

      # Разбиваем ТОЛЬКО по пробелам и запятым. Убрали букву "и"!
      var ings = raw.replace(/[.,!?;:]/g, '').split(/[\s,]+/)
        .filter(function(w) {
          var lower = w.toLowerCase();
          # Убираем короткие слова и предлоги
          return lower.length > 2 && lower !== 'и' && lower !== 'с' && lower !== 'из';
        });

      log('Ингредиенты для поиска: ' + JSON.stringify(ings));

      searchRecipes(ings, $context);

      # Ответы
    random:
      a: "Ищу подходящие рецепты по продуктам."
      a: "Открываю все доступные рецепты."
