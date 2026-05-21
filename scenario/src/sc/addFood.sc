theme: /
    state: ДобавитьПродукт
        q!: (добавь | съел | запиши | ем) [$Amount::amount] (грамм | г) $FoodName::foodName

        q!: (добавь | съел | запиши | ем) $FoodName::foodName

        script:
            var foodName = $parseTree._foodName || "";
            var amount = parseInt($parseTree._amount) || 100;

            // ✅ Fallback: если NLU не выделила название, берём сырую фразу и чистим
            if (!foodName) {
                var raw = $context.request.rawRequest || "";
                foodName = raw.replace(/добавь|съел|запиши|ем|100|грамм|г|\d+/gi, "").trim();
            }

            var success = addFood(foodName, amount, $context);

            if (success) {
                $context.replyText = random([
                    "Добавлено",
                    "Записано",
                    "Ок, добавил"
                ]);
                addSuggestions([
                    "добавь 100г курицы",
                    "сколько съел?",
                    "что съесть?"
                ], $context);
            } else {
                $context.replyText = "Продукт не найден в базе. Попробуй назвать проще (например: курица, гречка, овощи).";
                addSuggestions(["помощь"], $context);
            }

        a: {{ $context.replyText }}