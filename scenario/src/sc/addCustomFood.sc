theme: /
    state: ДобавитьСвойПродукт
        q!: (добавь | запиши | внеси) свой продукт $FoodName::name (на | весом) $Amount::weight грамм $AnyText::calInfo
        q!: (добавь | запиши | внеси) свой продукт $FoodName::name $Amount::weight грамм
        script:
            log('Добавление своего продукта');
            var name = $parseTree._name;
            var weight = parseInt($parseTree._weight) || 100;
            var calInfo = $parseTree._calInfo || "0";
            var calMatch = calInfo.match(/(\d+)/);
            var calories = calMatch ? parseInt(calMatch[1]) : 0;

            addCustomFood(name, weight, calories, $context);

            addSuggestions([
                "сколько съел?",
                "что съесть?",
                "найди рецепты из курицы"
            ], $context);

        random:
            a: "Записал {{name}} ({{weight}}г, {{calories}} ккал)"
            a: "Ок, добавил {{name}}"