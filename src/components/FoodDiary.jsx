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
  const [customCalories, setCustomCalories] = useState('');
  const [activeField, setActiveField] = useState(null); // 'weight' | 'calories' | null
  const containerRef = useRef(null);

  // 🔒 ТВ-НАВИГАЦИЯ: исправленная логика
  const handleKeyDownCapture = useCallback((e) => {
    // Получаем все фокусируемые элементы (включая disabled с tabIndex)
    const focusable = Array.from(containerRef.current.querySelectorAll('input, button'))
      .filter(el => el.offsetParent !== null && el.tabIndex !== -1);
    const currentIdx = focusable.indexOf(document.activeElement);
    const activeId = document.activeElement?.id;
    const isEnter = (e.key === 'Enter' || e.key === 'NumpadEnter');

    // 1. Стрелки -> перевод фокуса (не меняем значения)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();

      // Вверх/Влево на первом элементе -> на вкладки
      if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && currentIdx === 0) {
        const firstTab = document.querySelector('button[role="tab"]');
        if (firstTab) {
          firstTab.focus();
          return;
        }
      }

      // Определяем направление
      const isDown = (e.key === 'ArrowDown' || e.key === 'ArrowRight');
      const nextIdx = isDown
        ? Math.min(currentIdx + 1, focusable.length - 1)
        : Math.max(currentIdx - 1, 0);

      focusable[nextIdx]?.focus();
      return;
    }

    // 2. ENTER на ПОИСКЕ -> на кнопку "Свой продукт" или первый продукт
    if (isEnter && activeId === 'diary-search') {
      e.preventDefault();
      const customBtn = document.getElementById('custom-product-btn');
      if (customBtn && customBtn.offsetParent !== null) {
        customBtn.focus();
      } else {
        const firstFoodBtn = containerRef.current.querySelector('.food-list-btn');
        if (firstFoodBtn) firstFoodBtn.focus();
        else focusable[Math.min(currentIdx + 1, focusable.length - 1)]?.focus();
      }
      return;
    }

    // 3. ENTER на ПОЛЕ ВЕСА -> активация или переход дальше
    if (isEnter && activeId === 'diary-weight') {
      e.preventDefault();
      if (activeField !== 'weight') {
        setActiveField('weight');
      } else {
        // Уже активно -> переход на калории (если свой) или добавить
        if (isCustom) {
          const calInput = document.getElementById('custom-calories');
          if (calInput) calInput.focus();
        } else {
          const addBtn = document.getElementById('add-food-btn');
          if (addBtn) addBtn.focus();
        }
      }
      return;
    }

    // 4. ENTER на ПОЛЕ КАЛОРИЙ -> активация или переход на Добавить
    if (isEnter && activeId === 'custom-calories') {
      e.preventDefault();
      if (activeField !== 'calories') {
        setActiveField('calories');
      } else {
        const addBtn = document.getElementById('add-food-btn');
        if (addBtn) addBtn.focus();
      }
      return;
    }

    // 5. ENTER на КНОПКАХ -> НЕ перехватываем (нативный клик)
  }, [activeField, isCustom]);

  // Автофокус на поиск
  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.querySelector('#diary-search')?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // При потере фокуса полем -> деактивируем
  const handleBlur = useCallback((fieldName) => () => {
    if (activeField === fieldName) {
      setActiveField(null);
    }
  }, [activeField]);

  const filteredFoods = search.length > 0
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foodDatabase.slice(0, 8);

  const handleSelectFood = (food, custom = false) => {
    setSelectedFood(food);
    setIsCustom(custom);
    setSearch(custom ? food.name : food.name);
    if (custom) {
      setCustomCalories('');
      setActiveField('weight');
    } else {
      setActiveField('weight');
    }
    setTimeout(() => containerRef.current?.querySelector('#diary-weight')?.focus(), 120);
  };

  const handleAdd = () => {
    if (!selectedFood) return;
    const amount = parseInt(weight) || 100;

    let nutrition;
    if (isCustom) {
      const cals = parseFloat(customCalories) || 0;
      nutrition = {
        calories: Math.round(cals * amount / 100),
        protein: 0,
        fat: 0,
        carbs: 0
      };
    } else {
      const normalizedFood = {
        ...selectedFood,
        calories: selectedFood.caloriesPer100g || selectedFood.calories || 0,
        protein: selectedFood.proteinPer100g || selectedFood.protein || 0,
        fat: selectedFood.fatPer100g || selectedFood.fat || 0,
        carbs: selectedFood.carbsPer100g || selectedFood.carbs || 0
      };
      nutrition = calculateNutritionForAmount(normalizedFood, amount);
    }

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
    setCustomCalories('');
    setActiveField(null);
    setTimeout(() => containerRef.current?.querySelector('#diary-search')?.focus(), 150);
  };

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
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>📊 Прогресс за сегодня</Typography>
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
          onChange={(e) => { setSearch(e.target.value); setSelectedFood(null); setIsCustom(false); setCustomCalories(''); }}
          inputProps={{
            style: { fontSize: 16, padding: '16px' },
            autoComplete: 'off',
            spellCheck: false
          }}
          sx={{ mb: 2 }}
        />

        {/* СПИСОК */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {filteredFoods.map((food) => (
            <Button
              key={food.name}
              className="food-list-btn"
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 500 }}>{food.name}</Typography>
                <Typography sx={{ fontSize: '0.85rem', opacity: 0.7, ml: 1 }}>
                  {food.caloriesPer100g ?? 0} ккал/100г
                </Typography>
              </Box>
            </Button>
          ))}

          {/* Кнопка "Свой продукт" */}
          {search.length > 2 && filteredFoods.length === 0 && (
            <Button
              id="custom-product-btn"
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

        {/* 🔥 ПОЛЕ ВЕСА: всегда фокусируемое, но ввод только при activeField */}
        <Box sx={{ mb: isCustom ? 1 : 2 }}>
          <TextField
            id="diary-weight"
            label={activeField === 'weight' ? 'Вес (г) — вводите..." : 'Вес (г) — нажмите OK для ввода'}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={weight}
            onChange={(e) => setWeight(e.target.value.replace(/\D/g, ''))}
            onBlur={handleBlur('weight')}
            // readOnly блокирует ввод, но поле остаётся фокусируемым
            inputProps={{
              readOnly: activeField !== 'weight',
              style: {
                fontSize: 16,
                padding: '16px',
                // Визуально показываем активность
                color: activeField === 'weight' ? 'inherit' : 'text.secondary'
              },
              autoComplete: 'off'
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                opacity: activeField === 'weight' ? 1 : 0.6,
                bgcolor: activeField === 'weight' ? 'rgba(79, 70, 229, 0.04)' : 'transparent'
              }
            }}
          />
        </Box>

        {/* 🔥 ПОЛЕ КАЛОРИЙ: только для своего продукта */}
        {isCustom && (
          <Box sx={{ mb: 2 }}>
            <TextField
              id="custom-calories"
              label={activeField === 'calories' ? 'Калории (на 100г) — вводите...' : 'Калории (на 100г) — нажмите OK'}
              type="number"
              inputMode="numeric"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              onBlur={handleBlur('calories')}
              inputProps={{
                readOnly: activeField !== 'calories',
                style: {
                  fontSize: 16,
                  padding: '16px',
                  color: activeField === 'calories' ? 'inherit' : 'text.secondary'
                },
                min: 0,
                max: 1000
              }}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  opacity: activeField === 'calories' ? 1 : 0.6,
                  bgcolor: activeField === 'calories' ? 'rgba(79, 70, 229, 0.04)' : 'transparent'
                }
              }}
            />
          </Box>
        )}

        {/* Кнопка Добавить */}
        <Button
          id="add-food-btn"
          variant="contained"
          onClick={handleAdd}
          disabled={!selectedFood}
          disableTouchRipple
          fullWidth
          sx={{
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 1,
            mt: 1,
            // Показываем предпросмотр ккал
            '&:not(:disabled)': {
              position: 'relative'
            }
          }}
        >
          ➕ Добавить {isCustom && customCalories && weight && `(${Math.round(parseFloat(customCalories) * parseInt(weight) / 100)} ккал)`}
        </Button>
      </Paper>

      {/* === 4. СЪЕДЕННОЕ === */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem', fontWeight: 600 }}>️ Сегодня съедено</Typography>
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
                      {meal.amount}г • 🔥 {meal.calories} ккал
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