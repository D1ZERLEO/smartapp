// src/components/FoodDiary.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Paper, Typography, Box, Button, TextField, Divider } from '@mui/material';
import { foodDatabase } from '../utils/foodDatabase';
import { calculateNutritionForAmount } from '../utils/nutritionCalculator';

export default function FoodDiary({ targets, totals, onAddFood, onDeleteFood, meals }) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [weight, setWeight] = useState('100');
  const containerRef = useRef(null);

  const filteredFoods = search.length > 0
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foodDatabase.slice(0, 10);

  // 🔒 ПЕРЕХВАТ НА ЭТАПЕ CAPTURE (до инпутов)
  const handleContainerKeyDown = useCallback((e) => {
    if (!containerRef.current?.contains(e.target)) return;

    const isArrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
    if (isArrow) {
      e.preventDefault(); // 🔥 БЛОКИРУЕМ нативное поведение инпутов
      e.stopPropagation();

      // Находим все фокусируемые элементы в порядке DOM
      const focusable = Array.from(containerRef.current.querySelectorAll('input, button'))
        .filter(el => !el.disabled && el.offsetParent !== null && el.tabIndex !== -1);

      if (focusable.length === 0) return;
      const currentIdx = focusable.indexOf(document.activeElement);
      if (currentIdx === -1) { focusable[0]?.focus(); return; }

      const nextIdx = (e.key === 'ArrowDown' || e.key === 'ArrowRight')
        ? Math.min(currentIdx + 1, focusable.length - 1)
        : Math.max(currentIdx - 1, 0);

      focusable[nextIdx]?.focus();
    }

    // Enter на инпуте = переход вниз (стандарт для ТВ-пультов)
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && document.activeElement.tagName === 'INPUT') {
      e.preventDefault();
      const focusable = Array.from(containerRef.current.querySelectorAll('input, button'))
        .filter(el => !el.disabled && el.offsetParent !== null);
      const idx = focusable.indexOf(document.activeElement);
      if (idx !== -1 && idx < focusable.length - 1) focusable[idx + 1]?.focus();
    }
  }, []);

  // Автофокус на поиск при открытии вкладки
  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.querySelector('#diary-search')?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearch(food.name);
    setTimeout(() => containerRef.current?.querySelector('#diary-weight')?.focus(), 120);
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

    setSelectedFood(null);
    setSearch('');
    setWeight('100');
    setTimeout(() => containerRef.current?.querySelector('#diary-search')?.focus(), 150);
  };

  return (
    <Container
      ref={containerRef}
      onKeyDownCapture={handleContainerKeyDown}
      maxWidth="lg"
      sx={{ mt: 2, mb: 6, outline: 'none' }}
    >
      {/* === ДОБАВЛЕНИЕ === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>📋 Добавить продукт</Typography>

        <TextField
          id="diary-search"
          fullWidth
          placeholder="Поиск продукта..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedFood(null); }}
          inputProps={{
            style: { fontSize: 16, padding: '16px' },
            autoComplete: 'off',
            spellCheck: false,
            'aria-label': 'Поиск продукта'
          }}
          sx={{ mb: 2 }}
        />

        {/* Список продуктов (плоский, без scroll-ловушек) */}
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
                borderRadius: 1,
                textTransform: 'none',
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

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            id="diary-weight"
            label="Вес (г)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/\D/g, ''))}
            inputProps={{ style: { fontSize: 16, padding: '16px' }, autoComplete: 'off' }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!selectedFood}
            disableTouchRipple
            sx={{ px: 3, fontSize: '1.1rem', fontWeight: 600, borderRadius: 1 }}
          >
            ➕ Добавить
          </Button>
        </Box>
      </Paper>

      {/* === СЪЕДЕННОЕ === */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>🍽️ Сегодня съедено</Typography>
        {meals.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>Пока ничего не добавлено</Typography>
        ) : (
          <Box>
            {meals.map((meal, idx) => (
              <React.Fragment key={meal.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>{meal.productName}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>{meal.amount}г • {meal.calories} ккал</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeleteFood(meal.id)}
                    disableTouchRipple
                    sx={{ ml: 2, minWidth: 80, borderRadius: 1 }}
                  >
                    🗑 Удалить
                  </Button>
                </Box>
                {idx < meals.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}