// src/components/ProfileSetup.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Alert, Box,
  FormControl, InputLabel, Select, MenuItem
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
  const formRef = useRef(null);

  // ✅ ТВ-навигация: перехватываем стрелки и Enter на уровне формы
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Работаем только внутри формы
      if (!formRef.current?.contains(e.target)) return;

      const focusable = Array.from(formRef.current.querySelectorAll('input, select, button'));
      const currentIdx = focusable.indexOf(document.activeElement);
      if (currentIdx === -1) return;

      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        const next = Math.min(currentIdx + 1, focusable.length - 1);
        focusable[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(currentIdx - 1, 0);
        focusable[prev]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ✅ Автофокус на первое поле после рендера
  useEffect(() => {
    const timer = setTimeout(() => {
      const first = formRef.current?.querySelector('select, input, button');
      first?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    if (profile.age < 12 || profile.age > 100) { setError('Возраст: 12–100 лет'); return false; }
    if (profile.height < 120 || profile.height > 220) { setError('Рост: 120–220 см'); return false; }
    if (profile.weight < 30 || profile.weight > 200) { setError('Вес: 30–200 кг'); return false; }
    setError('');
    return true;
  };

  const handleSave = () => { if (validate()) onSave(profile); };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Paper
        ref={formRef}
        sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 2, fontSize: '1.4rem' }}>
          ⚙️ Настройка профиля
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '1.1rem' }}>{error}</Alert>}

        {/* Пол */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Пол</InputLabel>
          <Select
            value={profile.gender}
            label="Пол"
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            MenuProps={{ disableScrollLock: true }}
            sx={{ fontSize: '1.1rem', '& .MuiSelect-select': { py: 1.5 } }}
          >
            <MenuItem value={Gender.Male}>Мужской</MenuItem>
            <MenuItem value={Gender.Female}>Женский</MenuItem>
          </Select>
        </FormControl>

        {/* Возраст */}
        <TextField
          fullWidth label="Возраст (лет)"
          type="text" inputMode="numeric" pattern="\d*"
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', py: 1.5 } }}
        />

        {/* Рост */}
        <TextField
          fullWidth label="Рост (см)"
          type="text" inputMode="numeric" pattern="\d*"
          value={profile.height}
          onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', py: 1.5 } }}
        />

        {/* Вес */}
        <TextField
          fullWidth label="Вес (кг)"
          type="text" inputMode="numeric" pattern="\d*"
          value={profile.weight}
          onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', py: 1.5 } }}
        />

        {/* Активность */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Уровень активности</InputLabel>
          <Select
            value={profile.activityLevel}
            label="Уровень активности"
            onChange={(e) => setProfile({ ...profile, activityLevel: Number(e.target.value) })}
            MenuProps={{ disableScrollLock: true }}
            sx={{ fontSize: '1.1rem', '& .MuiSelect-select': { py: 1.5 } }}
          >
            {Object.entries(activityLabels).map(([val, label]) => (
              <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Цель */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Цель</InputLabel>
          <Select
            value={profile.goal}
            label="Цель"
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            MenuProps={{ disableScrollLock: true }}
            sx={{ fontSize: '1.1rem', '& .MuiSelect-select': { py: 1.5 } }}
          >
            {Object.entries(goalLabels).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Кнопка */}
        <Button
          fullWidth variant="contained" size="large" onClick={handleSave}
          sx={{
            py: 2, fontSize: '1.2rem', fontWeight: 700,
            '&:focus': { outline: '3px solid #4f46e5', outlineOffset: 2 }
          }}
        >
          ✅ Сохранить профиль
        </Button>
      </Paper>
    </Container>
  );
}