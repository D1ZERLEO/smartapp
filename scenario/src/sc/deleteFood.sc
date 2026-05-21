theme: /
    state: УдалитьПродукт
        q!: (удали | убери | вычеркни) ((последнее | последний) | $AnyText::foodName)
        script:
            log('Удаление продукта');
            var foodId = getFoodIdBySelected(getRequest($context));
            if (foodId) {
                deleteFoodById(foodId, $context);
            } else {
                deleteLastFood($context);
            }
        random:
            a: "Удалено успешно"
            a: "Готово, убрано из дневника"