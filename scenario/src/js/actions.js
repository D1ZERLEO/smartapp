// src/sc/js/actions.js
// ✅ ES3/ES5-совместимый код. ВСЕ функции объявлены глобально для SAL.

var LOCAL_FOOD_DB = [
    { name: 'овощи', calories: 35, protein: 1.5, fat: 0.2, carbs: 7 },
    { name: 'фрукты', calories: 60, protein: 0.8, fat: 0.3, carbs: 15 },
    { name: 'курица', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    { name: 'гречка', calories: 343, protein: 13, fat: 3.4, carbs: 72 },
    { name: 'рис', calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
    { name: 'яйцо', calories: 155, protein: 13, fat: 11, carbs: 1.1 },
    { name: 'творог', calories: 121, protein: 18, fat: 5, carbs: 3.4 },
    { name: 'банан', calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
    { name: 'яблоки', calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
    { name: 'помидоры', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
    { name: 'огурцы', calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
    { name: 'картофель', calories: 77, protein: 2, fat: 0.1, carbs: 17 },
    { name: 'морковь', calories: 41, protein: 0.9, fat: 0.2, carbs: 10 },
    { name: 'лук', calories: 40, protein: 1.4, fat: 0.1, carbs: 9 },
    { name: 'рыба', calories: 206, protein: 22, fat: 12, carbs: 0 },
    { name: 'мясо', calories: 250, protein: 26, fat: 15, carbs: 0 },
    { name: 'хлеб', calories: 265, protein: 9, fat: 3.2, carbs: 49 }
];

function normalizeFoodName(name) {
    if (!name) return '';
    var clean = name.toLowerCase().replace(/^\s+|\s+$/g, '');
    clean = clean.replace(/^\d+\s*(г|грамм)\s*/i, '');
    var endings = ['ей', 'ов', 'ев', 'ами', 'ах', 'ях', 'у', 'ю', 'ы', 'и', 'а', 'я', 'о', 'е', 'ь', 'й'];
    for (var i = 0; i < endings.length; i++) {
        var end = endings[i];
        if (clean.slice(-end.length) === end) {
            clean = clean.slice(0, -end.length);
            break;
        }
    }
    var map = {
        'овощ': 'овощи', 'фрукт': 'фрукты', 'яблок': 'яблоки',
        'куриц': 'курица', 'гречк': 'гречка', 'банан': 'банан',
        'помидор': 'помидоры', 'огурц': 'огурцы', 'картошк': 'картофель',
        'морков': 'морковь', 'яйц': 'яйцо', 'рыб': 'рыба', 'мяс': 'мясо'
    };
    return map[clean] || clean;
}

function addFood(name, amount, context) {
    if (!name) return false;
    var normalizedName = normalizeFoodName(name);
    var food = null;
    for (var i = 0; i < LOCAL_FOOD_DB.length; i++) {
        var f = LOCAL_FOOD_DB[i];
        var fName = f.name.toLowerCase();
        if (fName === normalizedName || fName.indexOf(normalizedName) !== -1 || normalizedName.indexOf(fName) !== -1) {
            food = f;
            break;
        }
    }
    if (!food && typeof foodDatabase !== 'undefined') {
        for (var j = 0; j < foodDatabase.length; j++) {
            var fb = foodDatabase[j];
            var fbName = fb.name.toLowerCase();
            if (fbName === normalizedName || fbName.indexOf(normalizedName) !== -1 || normalizedName.indexOf(fbName) !== -1) {
                food = fb;
                break;
            }
        }
    }
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
            if (!context.state.totals) {
                context.state.totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
            }
            context.state.totals.calories += nutrition.calories;
            context.state.totals.protein += nutrition.protein;
            context.state.totals.fat += nutrition.fat;
            context.state.totals.carbs += nutrition.carbs;
        }
        return true;
    }
    return false;
}

function deleteLastFood(context) {
    if (context && context.state && context.state.meals && context.state.meals.length > 0) {
        var last = context.state.meals.pop();
        if (context.state.totals && last) {
            context.state.totals.calories -= last.calories;
            context.state.totals.protein -= last.protein;
            context.state.totals.fat -= last.fat;
            context.state.totals.carbs -= last.carbs;
        }
        return true;
    }
    return false;
}

// ✅ ИСПРАВЛЕНО: searchRecipes теперь глобальная функция без оберток
function searchRecipes(ingredients, context) {
    // Заглушка для SAL. Просто сохраняем запрос, чтобы не падало.
    // Логику поиска можно дописать позже, главное — функция должна существовать.
    if (context && context.state) {
        context.state.lastSearch = ingredients;
    }
    return true;
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