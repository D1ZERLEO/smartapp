// src/components/FoodDiary.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Paper, Typography, Box, Button, TextField, Divider, LinearProgress } from '@mui/material';
import { foodDatabase } from '../utils/foodDatabase';
import { calculateNutritionForAmount, getRecommendations, calculateRemaining } from '../utils/nutritionCalculator';

export default function FoodDiary({ targets, totals, onAddFood, onDeleteFood, meals }) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [weight, setWeight] = useState('100');
  const [isCustom, setIsCustom] = useState(false);
  const containerRef = useRef(null);

  // 🔒 Жёсткая ТВ-навигация (работает до того, как инпуты перехватят событие)
  const handleKeyDownCapture = useCallback((e) => {
    const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrows.includes(e.key) || e.key === 'Enter') {
      const focusable = Array.from(containerRef.current.querySelectorAll('input, button'))
        .filter(el => !el.disabled && el.offsetParent !== null);
      const currentIdx = focusable.indexOf(document.activeElement);
      if (currentIdx === -1) return;

      // ВНИЗ / ВПРАВО / ENTER → следующий элемент
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Enter') {
        if (document.activeElement.tagName === 'INPUT') e.preventDefault(); // блокируем курсор/зум
        const next = Math.min(currentIdx + 1, focusable.length - 1);
        focusable[next]?.focus();
      }
      // ВВЕРХ / ВЛЕВО → предыдущий элемент
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentIdx > 0) {
          e.preventDefault();
          const prev = currentIdx - 1;
          focusable[prev]?.focus();
        } else {
          // 🔥 КЛЮЧЕВОЙ ФИКС: если мы на самом верху, снимаем фокус и отпускаем его на вкладки
          e.target.blur();
          e.stopPropagation();
        }
      }
    }
  }, []);

  // Автофокус на поиск при открытии вкладки
  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.querySelector('#diary-search')?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredFoods = search.length > 0
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foodDatabase.slice(0, 8);

  const handleSelectFood = (food, custom = false) => {
    setSelectedFood(food);
    setIsCustom(custom);
    setSearch(custom ? food.name : food.name);
    setTimeout(() => containerRef.current?.querySelector('#diary-weight')?.focus(), 120);
  };

  const handleAdd = () => {
    if (!selectedFood) return;
    const amount = parseInt(weight) || 100;

    // Если продукт свой, считаем КБЖУ как 0 или базовые (можно доработать)
    const nutrition = isCustom
      ? { calories: 0, protein: 0, fat: 0, carbs: 0 }
      : calculateNutritionForAmount(selectedFood, amount);

    onAddFood({
      id: Date.now().toString(),
      productName: selectedFood.name,
      amount,
      ...nutrition,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    });

    setSelectedFood(null);
    setIsCustom(false);
    setSearch('');
    setWeight('100');
    setTimeout(() => containerRef.current?.querySelector('#diary-search')?.focus(), 150);
  };

  // Прогресс и рекомендации
  const remaining = targets ? calculateRemaining(targets, totals) : {};
  const recommendations = targets ? getRecommendations(remaining) : [];

  return (
    <Container
      ref={containerRef}
      onKeyDownCapture={handleKeyDownCapture}
      maxWidth="lg"
      sx={{ mt: 2, mb: 6, outline: 'none' }}
    >
      {/* === 1. ПРОГРЕСС === */}
      <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}> Прогресс за сегодня</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{totals.calories} / {targets?.calories || 2000} ккал</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min((totals.calories / (targets?.calories || 2000)) * 100, 100)}
          sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: '0.85rem', color: 'text.secondary' }}>
          <span>Б: {totals.protein}г</span>
          <span>Ж: {totals.fat}г</span>
          <span>У: {totals.carbs}г</span>
          {remaining.calories !== undefined && <span>Осталось: {remaining.calories} ккал</span>}
        </Box>
      </Paper>

      {/* === 2. РЕКОМЕНДАЦИИ === */}
      {recommendations.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, borderLeft: '4px solid #4f46e5' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>💡 Рекомендации</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            {recommendations.map(r => r.items.join(', ')).join('; ')}
          </Typography>
        </Paper>
      )}

      {/* === 3. ДОБАВЛЕНИЕ ПРОДУКТА === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>📋 Добавить продукт</Typography>

        <TextField
          id="diary-search"
          fullWidth
          placeholder="Поиск продукта..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedFood(null); setIsCustom(false); }}
          inputProps={{
            style: { fontSize: 16, padding: '16px' },
            autoComplete: 'off',
            spellCheck: false
          }}
          sx={{ mb: 2 }}
        />

        {/* Список из базы */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {filteredFoods.map((food) => (
            <Button
              key={food.name}
              variant={selectedFood?.name === food.name && !isCustom ? 'contained' : 'outlined'}
              onClick={() => handleSelectFood(food, false)}
              disableTouchRipple
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 1,
                textTransform: 'none',
                border: selectedFood?.name === food.name && !isCustom ? '2px solid #4f46e5' : '1px solid #ccc'
              }}
            >
              {food.name} <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>{food.calories} ккал/100г</span>
            </Button>
          ))}

          {/* Кнопка "Свой продукт" */}
          {search.length > 2 && filteredFoods.length === 0 && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleSelectFood({ name: search }, true)}
              disableTouchRipple
              sx={{ py: 1.5, fontSize: '1rem', borderRadius: 1, borderStyle: 'dashed' }}
            >
              ➕ Добавить свой продукт: "{search}"
            </Button>
          )}
        </Box>

        {/* Вес и кнопка */}
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

      {/* === 4. СЪЕДЕННОЕ === */}
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
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                      {meal.amount}г •  {meal.calories} ккал
                    </Typography>
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