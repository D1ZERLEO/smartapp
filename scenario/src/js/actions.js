function normalizeFoodName(name) {
    name = name.toLowerCase().trim();

    // ✅ НОВОЕ: Сначала удаляем вес в начале (например "100г курицы" -> "курицы")
    name = name.replace(/^\d+\s*(г|грамм)\s*/i, '');

    // Удаляем окончания
    var lastChar = name.slice(-1);
    if ('ыиаяе'.indexOf(lastChar) !== -1) {
        name = name.slice(0, -1);
    }

    // Особые случаи
    if (name === 'яйц') name = 'яйцо';
    if (name === 'творога') name = 'творог';
    if (name === 'гречк') name = 'гречка';
    if (name === 'банана') name = 'банан';
    if (name === 'куриц') name = 'курица';

    return name;
}