// src/components/ProfileSetup.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Alert, Box, Button, TextField } from '@mui/material';

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

  // ✅ Автофокус на первый элемент после рендера
  useEffect(() => {
    const timer = setTimeout(() => {
      const first = formRef.current?.querySelector('button, input');
      first?.focus();
    }, 400);
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
    <Container ref={formRef} maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontSize: '1.3rem', textAlign: 'center' }}>
          ⚙️ Настройка профиля
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* 1. Пол - Кнопки вместо Select */}
        <Typography sx={{ mb: 1, fontWeight: 500, fontSize: '1rem' }}>Пол</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            variant={profile.gender === 'male' ? 'contained' : 'outlined'}
            onClick={() => setProfile(p => ({ ...p, gender: 'male' }))}
            disableTouchRipple
            sx={{ flex: 1, py: 1.5, fontSize: '1rem', borderRadius: 2 }}
          >👨 Мужской</Button>
          <Button
            variant={profile.gender === 'female' ? 'contained' : 'outlined'}
            onClick={() => setProfile(p => ({ ...p, gender: 'female' }))}
            disableTouchRipple
            sx={{ flex: 1, py: 1.5, fontSize: '1rem', borderRadius: 2 }}
          >👩 Женский</Button>
        </Box>

        {/* 2-4. Числовые поля - fontSize 16 предотвращает зум на ТВ */}
        <TextField
          fullWidth label="Возраст (лет)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.age}
          onChange={(e) => setProfile(p => ({ ...p, age: Number(e.target.value) }))}
          sx={{ mb: 2 }}
          inputProps={{ style: { fontSize: 16, padding: '16px' } }}
        />
        <TextField
          fullWidth label="Рост (см)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.height}
          onChange={(e) => setProfile(p => ({ ...p, height: Number(e.target.value) }))}
          sx={{ mb: 2 }}
          inputProps={{ style: { fontSize: 16, padding: '16px' } }}
        />
        <TextField
          fullWidth label="Вес (кг)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.weight}
          onChange={(e) => setProfile(p => ({ ...p, weight: Number(e.target.value) }))}
          sx={{ mb: 3 }}
          inputProps={{ style: { fontSize: 16, padding: '16px' } }}
        />

        {/* 5. Активность - Список кнопок */}
        <Typography sx={{ mb: 1, fontWeight: 500, fontSize: '1rem' }}>Уровень активности</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {Object.entries(activityLabels).map(([val, label]) => (
            <Button
              key={val}
              variant={profile.activityLevel === Number(val) ? 'contained' : 'outlined'}
              onClick={() => setProfile(p => ({ ...p, activityLevel: Number(val) }))}
              disableTouchRipple
              sx={{ justifyContent: 'flex-start', py: 1.5, fontSize: '0.95rem', borderRadius: 2 }}
            >{label}</Button>
          ))}
        </Box>

        {/* 6. Цель - Кнопки */}
        <Typography sx={{ mb: 1, fontWeight: 500, fontSize: '1rem' }}>Цель</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
          {Object.entries(goalLabels).map(([val, label]) => (
            <Button
              key={val}
              variant={profile.goal === val ? 'contained' : 'outlined'}
              onClick={() => setProfile(p => ({ ...p, goal: val }))}
              disableTouchRipple
              sx={{ flex: 1, py: 1.5, fontSize: '0.9rem', borderRadius: 2 }}
            >{label}</Button>
          ))}
        </Box>

        {/* 7. Сохранить */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSave}
          disableTouchRipple
          sx={{ py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2 }}
        >
          ✅ Сохранить профиль
        </Button>
      </Paper>
    </Container>
  );
}