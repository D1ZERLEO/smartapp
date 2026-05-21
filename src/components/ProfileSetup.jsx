import React, { useState, useRef, useEffect } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Alert, Box,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';

const Gender = { Male: 'male', Female: 'female' };
const ActivityLevel = { Minimal: 1.2, Light: 1.375, Moderate: 1.55, High: 1.725, VeryHigh: 1.9 };
const Goal = { Lose: 'lose', Maintain: 'maintain', Gain: 'gain' };

const activityLabels = {
  [ActivityLevel.Minimal]: 'Минимальная (сидячая работа)',
  [ActivityLevel.Light]: 'Лёгкая (1-3 тренировки в неделю)',
  [ActivityLevel.Moderate]: 'Средняя (3-5 тренировок)',
  [ActivityLevel.High]: 'Высокая (6-7 тренировок)',
  [ActivityLevel.VeryHigh]: 'Очень высокая (физ. работа)'
};

const goalLabels = {
  [Goal.Lose]: 'Похудение',
  [Goal.Maintain]: 'Поддержание',
  [Goal.Gain]: 'Набор массы'
};

export default function ProfileSetup({ onSave, initialProfile }) {
  const [profile, setProfile] = useState(initialProfile || {
    gender: Gender.Male, age: 30, height: 170, weight: 70,
    activityLevel: ActivityLevel.Moderate, goal: Goal.Maintain
  });
  const [error, setError] = useState('');

  // ✅ Массив рефов для каждого блока формы (строго по порядку)
  const fieldRefs = [
    useRef(null), // Пол
    useRef(null), // Возраст
    useRef(null), // Рост
    useRef(null), // Вес
    useRef(null), // Активность
    useRef(null), // Цель
    useRef(null)  // Кнопка
  ];

  // Автофокус на первое поле при монтировании
  useEffect(() => {
    fieldRefs[0].current?.focus();
  }, []);

  // ✅ Управление навигацией пультом
  const handleContainerKeyDown = (e) => {
    // Определяем текущий индекс фокуса
    let currentIndex = fieldRefs.findIndex(
      ref => ref.current === document.activeElement || ref.current?.contains(document.activeElement)
    );
    if (currentIndex === -1) currentIndex = 0;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const next = (currentIndex + 1) % fieldRefs.length;
      fieldRefs[next].current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const prev = (currentIndex - 1 + fieldRefs.length) % fieldRefs.length;
      fieldRefs[prev].current?.focus();
    }
  };

  // ✅ Выбор варианта в RadioGroup по Enter/OK
  const handleRadioSelect = (refIndex, valueKey, value) => {
    return (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setProfile(prev => ({ ...prev, [valueKey]: value }));
      }
    };
  };

  const validate = () => {
    if (profile.age < 12 || profile.age > 100) { setError('Возраст: 12–100 лет'); return false; }
    if (profile.height < 120 || profile.height > 220) { setError('Рост: 120–220 см'); return false; }
    if (profile.weight < 30 || profile.weight > 200) { setError('Вес: 30–200 кг'); return false; }
    setError('');
    return true;
  };

  const handleSave = () => { if (validate()) onSave(profile); };

  // Общий стиль для фокусируемых блоков
  const focusBoxStyle = {
    tabIndex: 0,
    outline: 'none',
    '&:focus': {
      outline: '3px solid #4f46e5',
      outlineOffset: '4px',
      borderRadius: '8px',
      background: 'rgba(79, 70, 229, 0.04)'
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Paper
        sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}
        onKeyDown={handleContainerKeyDown}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
          ️ Настройка профиля
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '1.1rem' }}>{error}</Alert>}

        {/* 1. Пол */}
        <Box ref={fieldRefs[0]} sx={{ ...focusBoxStyle, mb: 2, p: 1 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontSize: '1.1rem' }}>Пол</FormLabel>
            <RadioGroup
              row
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              onKeyDown={(e) => e.stopPropagation()} // 🔒 Блокируем внутренние стрелки
              sx={{ '& .MuiFormControlLabel-root': { mr: 3, fontSize: '1.1rem' } }}
            >
              <FormControlLabel
                value={Gender.Male}
                control={<Radio sx={{ fontSize: 28 }} />}
                label="Мужской"
                onKeyDown={handleRadioSelect(0, 'gender', Gender.Male)}
              />
              <FormControlLabel
                value={Gender.Female}
                control={<Radio sx={{ fontSize: 28 }} />}
                label="Женский"
                onKeyDown={handleRadioSelect(0, 'gender', Gender.Female)}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* 2. Возраст */}
        <Box ref={fieldRefs[1]} sx={{ ...focusBoxStyle, mb: 2, p: 1 }}>
          <TextField
            fullWidth label="Возраст (лет)" type="number" inputMode="numeric"
            value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
            inputProps={{ min: 12, max: 100, style: { fontSize: '1.2rem' } }}
          />
        </Box>

        {/* 3. Рост */}
        <Box ref={fieldRefs[2]} sx={{ ...focusBoxStyle, mb: 2, p: 1 }}>
          <TextField
            fullWidth label="Рост (см)" type="number" inputMode="numeric"
            value={profile.height} onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
            inputProps={{ min: 120, max: 220, style: { fontSize: '1.2rem' } }}
          />
        </Box>

        {/* 4. Вес */}
        <Box ref={fieldRefs[3]} sx={{ ...focusBoxStyle, mb: 2, p: 1 }}>
          <TextField
            fullWidth label="Вес (кг)" type="number" inputMode="numeric"
            value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
            inputProps={{ min: 30, max: 200, style: { fontSize: '1.2rem' } }}
          />
        </Box>

        {/* 5. Активность */}
        <Box ref={fieldRefs[4]} sx={{ ...focusBoxStyle, mb: 2, p: 1 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontSize: '1.1rem' }}>Уровень активности</FormLabel>
            <RadioGroup
              value={profile.activityLevel}
              onChange={(e) => setProfile({ ...profile, activityLevel: Number(e.target.value) })}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{ '& .MuiFormControlLabel-root': { mb: 0.5, fontSize: '1.05rem' } }}
            >
              {Object.entries(activityLabels).map(([val, label]) => (
                <FormControlLabel
                  key={val}
                  value={Number(val)}
                  control={<Radio sx={{ fontSize: 28 }} />}
                  label={label}
                  onKeyDown={handleRadioSelect(4, 'activityLevel', Number(val))}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        {/* 6. Цель */}
        <Box ref={fieldRefs[5]} sx={{ ...focusBoxStyle, mb: 3, p: 1 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontSize: '1.1rem' }}>Цель</FormLabel>
            <RadioGroup
              row
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{ '& .MuiFormControlLabel-root': { mr: 3, fontSize: '1.1rem' } }}
            >
              {Object.entries(goalLabels).map(([val, label]) => (
                <FormControlLabel
                  key={val}
                  value={val}
                  control={<Radio sx={{ fontSize: 28 }} />}
                  label={label}
                  onKeyDown={handleRadioSelect(5, 'goal', val)}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        {/* 7. Кнопка */}
        <Box ref={fieldRefs[6]} sx={{ ...focusBoxStyle, p: 1 }}>
          <Button
            fullWidth variant="contained" size="large" onClick={handleSave}
            sx={{
              py: 2, fontSize: '1.2rem', fontWeight: 700,
              '&:focus': { outline: 'none' } // outline управляется wrapper'ом
            }}
          >
            ✅ Сохранить профиль
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}