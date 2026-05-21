function normalizeFoodName(name) {
    name = name.toLowerCase().trim();
    name = name.replace(/^\d+\s*(г|грамм)\s*/i, '');
    var lastChar = name.slice(-1);
    if ('ыиаяе'.indexOf(lastChar) !== -1) {
        name = name.slice(0, -1);
    }
    if (name === 'яйц') name = 'яйцо';
    if (name === 'творога') name = 'творог';
    if (name === 'гречк') name = 'гречка';
    if (name === 'банана') name = 'банан';
    if (name === 'куриц') name = 'курица';
    return name;
}

function addFood(name, amount, context) {
    var normalizedName = normalizeFoodName(name);
    var food = foodDatabase.find(function(f) {
        return f.name.toLowerCase().indexOf(normalizedName) !== -1 ||
               normalizedName.indexOf(f.name.toLowerCase()) !== -1;
    });

    if (food) {
        var nutrition = {
            calories: Math.round(food.calories * amount / 100),
            protein: Math.round(food.protein * amount / 100 * 10) / 10,
            fat: Math.round(food.fat * amount / 100 * 10) / 10,
            carbs: Math.round(food.carbs * amount / 100 * 10) / 10
        };

        var meal = {
            id: String(new Date().getTime()),
            productName: food.name,
            amount: amount,
            calories: nutrition.calories,
            protein: nutrition.protein,
            fat: nutrition.fat,
            carbs: nutrition.carbs,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().getTime()
        };

        if (context && context.state) {
            if (!context.state.meals) context.state.meals = [];
            context.state.meals.push(meal);
        }
        return true;
    }
    return false;
}

function getRequest(context) {
    if (context && context.request) return context.request.rawRequest;
    return {};
}

function getItems(request) {
    if (request && request.payload && request.payload.meta &&
        request.payload.meta.current_app && request.payload.meta.current_app.state &&
        request.payload.meta.current_app.state.item_selector) {
        return request.payload.meta.current_app.state.item_selector.items;
    }
    return null;
}

function getSelectedItem(request) {
    if (request && request.payload && request.payload.meta &&
        request.payload.meta.current_app && request.payload.meta.current_app.state) {
        return request.payload.selected_item;
    }
    return null;
}

function getFoodIdBySelected(request) {
    var items = getItems(request);
    var selected = getSelectedItem(request);
    if (selected && items && items[selected.index]) {
        return items[selected.index].id;
    }
    return null;
}