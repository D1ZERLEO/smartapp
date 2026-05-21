// src/components/FoodDiary.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, TextField, Divider } from '@mui/material';
import { foodDatabase } from '../utils/foodDatabase';
import { calculateNutritionForAmount } from '../utils/nutritionCalculator';

export default function FoodDiary({ targets, totals, onAddFood, onDeleteFood, meals }) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [weight, setWeight] = useState('100');
  const containerRef = useRef(null);

  // ✅ Начальный фокус на поиск при открытии вкладки
  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.querySelector('#search-input')?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Фильтрация продуктов
  const filteredFoods = search.length > 0
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foodDatabase.slice(0, 12);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearch(food.name);
    // После выбора продукта фокус сразу прыгает на поле веса
    setTimeout(() => containerRef.current?.querySelector('#weight-input')?.focus(), 100);
  };

  const handleAdd = () => {
    if (!selectedFood) return;
    const amount = parseInt(weight) || 100;
    const nutrition = calculateNutritionForAmount(selectedFood, amount);

    onAddFood({
      id: Date.now().toString(),
      productName: selectedFood.name,
      amount,
      ...nutrition,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    });

    // Сброс и возврат фокуса в поиск для быстрого цикла
    setSelectedFood(null);
    setSearch('');
    setWeight('100');
    setTimeout(() => containerRef.current?.querySelector('#search-input')?.focus(), 200);
  };

  // 🎮 ЖЁСТКАЯ ТВ-НАВИГАЦИЯ: перехватываем D-Pad и запрещаем инпутам менять значения стрелками
  const handleKeyDown = (e) => {
    const focusable = Array.from(containerRef.current.querySelectorAll('input, button'))
                           .filter(el => !el.disabled && el.offsetParent !== null);
    const currentIdx = focusable.indexOf(document.activeElement);
    if (currentIdx === -1) return;

    // Стрелки ВНИЗ / ВПРАВО → следующий элемент
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(currentIdx + 1, focusable.length - 1);
      focusable[next]?.focus();
    }
    // Стрелки ВВЕРХ / ВЛЕВО → предыдущий элемент
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(currentIdx - 1, 0);
      focusable[prev]?.focus();
    }
    // Enter на инпуте → переход вниз (на ТВ пультах OK часто шлёт Enter)
    else if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
      e.preventDefault();
      const next = Math.min(currentIdx + 1, focusable.length - 1);
      focusable[next]?.focus();
    }
  };

  return (
    <Container
      ref={containerRef}
      onKeyDown={handleKeyDown}
      maxWidth="lg"
      sx={{ mt: 2, mb: 6, outline: 'none' }}
    >
      {/* === БЛОК ДОБАВЛЕНИЯ === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>
          📋 Добавить продукт
        </Typography>

        {/* 1. Поиск */}
        <TextField
          id="search-input"
          fullWidth
          placeholder="Начните вводить название..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedFood(null); }}
          inputProps={{ style: { fontSize: 16, padding: '16px' } }}
          sx={{ mb: 2 }}
        />

        {/* 2. Список продуктов (плоские кнопки, без скролл-контейнеров) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {filteredFoods.map((food) => (
            <Button
              key={food.name}
              variant={selectedFood?.name === food.name ? 'contained' : 'outlined'}
              onClick={() => handleSelectFood(food)}
              disableTouchRipple
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                fontSize: '1rem',
                textAlign: 'left',
                borderRadius: 2,
                border: selectedFood?.name === food.name ? '2px solid #4f46e5' : '1px solid #ccc'
              }}
            >
              {food.name}
            </Button>
          ))}
          {filteredFoods.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.9rem' }}>
              Ничего не найдено
            </Typography>
          )}
        </Box>

        {/* 3. Вес + Кнопка */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            id="weight-input"
            label="Вес (г)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/\D/g, ''))}
            //  БЛОКИРУЕМ стрелки, чтобы они не меняли число, а переводили фокус
            onKeyDown={(e) => { if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault(); }}
            inputProps={{ style: { fontSize: 16, padding: '16px' } }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!selectedFood}
            disableTouchRipple
            sx={{ px: 4, fontSize: '1.1rem', fontWeight: 600, minWidth: 140, borderRadius: 2 }}
          >
            ➕ Добавить
          </Button>
        </Box>
      </Paper>

      {/* === СПИСОК СЪЕДЕННОГО === */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>
          🍽️ Сегодня съедено
        </Typography>

        {meals.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontSize: '1rem' }}>
            Пока ничего не добавлено
          </Typography>
        ) : (
          <Box>
            {meals.map((meal, idx) => (
              <React.Fragment key={meal.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      {meal.productName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mt: 0.5 }}>
                      {meal.amount}г •  {meal.calories} ккал
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeleteFood(meal.id)}
                    disableTouchRipple
                    sx={{ minWidth: 'auto', px: 2, py: 1, fontSize: '0.9rem', ml: 2, borderRadius: 2 }}
                  >
                    🗑 Удалить
                  </Button>
                </Box>
                {idx < meals.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}