// src/components/FoodDiary.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Button, TextField, Divider
} from '@mui/material';
import { foodDatabase } from '../utils/foodDatabase';
import { calculateNutritionForAmount } from '../utils/nutritionCalculator';

export default function FoodDiary({ targets, totals, onAddFood, onDeleteFood, meals }) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [weight, setWeight] = useState('100');
  const diaryRef = useRef(null);

  // ✅ Автофокус на поле поиска при открытии вкладки
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = diaryRef.current?.querySelector('input');
      input?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Фильтрация: показываем совпадения или топ-12 популярных
  const filteredFoods = search.length > 1
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foodDatabase.slice(0, 12);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearch(food.name);
  };

  const handleAdd = () => {
    if (!selectedFood) return;
    const amount = Number(weight) || 100;
    const nutrition = calculateNutritionForAmount(selectedFood, amount);

    onAddFood({
      id: Date.now().toString(),
      productName: selectedFood.name,
      amount,
      ...nutrition,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    });

    // Сброс формы после добавления
    setSelectedFood(null);
    setSearch('');
    setWeight('100');

    // Возвращаем фокус на поиск для быстрого добавления следующего
    setTimeout(() => diaryRef.current?.querySelector('input')?.focus(), 200);
  };

  return (
    <Container ref={diaryRef} maxWidth="lg" sx={{ mt: 2, mb: 6 }}>
      {/* === БЛОК ДОБАВЛЕНИЯ === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>
          📋 Добавить продукт
        </Typography>

        {/* 1. Поле поиска (просто input, без выпадашек) */}
        <TextField
          fullWidth
          placeholder="Начните вводить название..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedFood(null);
          }}
          inputProps={{ style: { fontSize: 16, padding: '16px' } }}
          sx={{ mb: 2 }}
        />

        {/* 2. Список продуктов (кнопки = нативная навигация пульта) */}
        <Box sx={{
          maxHeight: 220,
          overflowY: 'auto',
          mb: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          background: '#fafafa'
        }}>
          {filteredFoods.map((food) => (
            <Button
              key={food.name}
              fullWidth
              variant={selectedFood?.name === food.name ? 'contained' : 'text'}
              onClick={() => handleSelectFood(food)}
              disableTouchRipple
              sx={{
                justifyContent: 'flex-start',
                px: 2, py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderBottom: '1px solid #eee',
                '&:last-child': { borderBottom: 'none' },
                borderRadius: 0
              }}
            >
              {food.name}
            </Button>
          ))}
          {filteredFoods.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Ничего не найдено
            </Typography>
          )}
        </Box>

        {/* 3. Вес + Кнопка добавления */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label="Вес (г)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/[^0-9]/g, ''))}
            inputProps={{ style: { fontSize: 16, padding: '16px' } }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!selectedFood}
            disableTouchRipple
            sx={{ px: 4, fontSize: '1.1rem', fontWeight: 600, minWidth: 140 }}
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
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 1
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      {meal.productName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mt: 0.5 }}>
                      {meal.amount}г • 🔥 {meal.calories} ккал | Б:{meal.protein}г Ж:{meal.fat}г У:{meal.carbs}г
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeleteFood(meal.id)}
                    disableTouchRipple
                    sx={{ minWidth: 'auto', px: 2, py: 1, fontSize: '0.9rem', ml: 2 }}
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