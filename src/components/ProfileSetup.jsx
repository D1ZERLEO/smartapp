// src/components/ProfileSetup.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef(null);

  // ✅ Начальный фокус строго на первое поле (Пол)
  useEffect(() => {
    const timer = setTimeout(() => {
      const first = containerRef.current?.querySelector('[tabindex="1"]');
      first?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Обработка стрелок пульта (D-Pad)
  const handleKeyDown = (e) => {
    if (!containerRef.current?.contains(e.target)) return;

    const current = document.activeElement;
    const currentTab = parseInt(current.getAttribute('tabindex') || '0', 10);
    if (currentTab === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const next = containerRef.current.querySelector(`[tabindex="${currentTab + 1}"]`);
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = containerRef.current.querySelector(`[tabindex="${Math.max(currentTab - 1, 1)}"]`);
      prev?.focus();
    }
  };

  const validate = () => {
    if (profile.age < 12 || profile.age > 100) { setError('Возраст: 12–100 лет'); return false; }
    if (profile.height < 120 || profile.height > 220) { setError('Рост: 120–220 см'); return false; }
    if (profile.weight < 30 || profile.weight > 200) { setError('Вес: 30–200 кг'); return false; }
    setError('');
    return true;
  };

  const handleSave = () => { if (validate()) onSave(profile); };

  // Общий стиль для фокусируемых элементов ТВ
  const tvFocusStyle = {
    '&:focus-visible': {
      outline: '3px solid #4f46e5',
      outlineOffset: '2px',
      borderRadius: '4px'
    }
  };

  return (
    <Container
      ref={containerRef}
      onKeyDown={handleKeyDown}
      maxWidth="sm" sx={{ mt: 4, mb: 8 }}
    >
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontSize: '1.4rem' }}>
          ⚙️ Настройка профиля
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '1.1rem' }}>{error}</Alert>}

        {/* 1. Пол */}
        <FormControl fullWidth sx={{ mb: 2, ...tvFocusStyle }}>
          <InputLabel id="gender-label">Пол</InputLabel>
          <Select
            labelId="gender-label"
            value={profile.gender}
            label="Пол"
            tabIndex={1}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            MenuProps={{ disableAutoFocus: true, disableEnforceFocus: true }}
            sx={{ fontSize: '1.1rem', minHeight: 56 }}
          >
            <MenuItem value={Gender.Male}>Мужской</MenuItem>
            <MenuItem value={Gender.Female}>Женский</MenuItem>
          </Select>
        </FormControl>

        {/* 2. Возраст */}
        <TextField
          fullWidth label="Возраст (лет)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
          tabIndex={2}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', minHeight: 56 }, ...tvFocusStyle }}
        />

        {/* 3. Рост */}
        <TextField
          fullWidth label="Рост (см)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.height}
          onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
          tabIndex={3}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', minHeight: 56 }, ...tvFocusStyle }}
        />

        {/* 4. Вес */}
        <TextField
          fullWidth label="Вес (кг)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.weight}
          onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
          tabIndex={4}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', minHeight: 56 }, ...tvFocusStyle }}
        />

        {/* 5. Активность */}
        <FormControl fullWidth sx={{ mb: 2, ...tvFocusStyle }}>
          <InputLabel id="activity-label">Уровень активности</InputLabel>
          <Select
            labelId="activity-label"
            value={profile.activityLevel}
            label="Уровень активности"
            tabIndex={5}
            onChange={(e) => setProfile({ ...profile, activityLevel: Number(e.target.value) })}
            MenuProps={{ disableAutoFocus: true, disableEnforceFocus: true }}
            sx={{ fontSize: '1.1rem', minHeight: 56 }}
          >
            {Object.entries(activityLabels).map(([val, label]) => (
              <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 6. Цель */}
        <FormControl fullWidth sx={{ mb: 3, ...tvFocusStyle }}>
          <InputLabel id="goal-label">Цель</InputLabel>
          <Select
            labelId="goal-label"
            value={profile.goal}
            label="Цель"
            tabIndex={6}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            MenuProps={{ disableAutoFocus: true, disableEnforceFocus: true }}
            sx={{ fontSize: '1.1rem', minHeight: 56 }}
          >
            {Object.entries(goalLabels).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 7. Кнопка */}
        <Button
          fullWidth variant="contained" size="large" onClick={handleSave}
          tabIndex={7}
          sx={{
            py: 2, fontSize: '1.2rem', fontWeight: 700,
            ...tvFocusStyle
          }}
        >
          ✅ Сохранить профиль
        </Button>
      </Paper>
    </Container>
  );
}