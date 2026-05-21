// src/components/ProfileSetup.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Alert,
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

  //  Рефы для каждого поля (строго по порядку навигации)
  const genderRef = useRef(null);
  const ageRef = useRef(null);
  const heightRef = useRef(null);
  const weightRef = useRef(null);
  const activityRef = useRef(null);
  const goalRef = useRef(null);
  const saveRef = useRef(null);

  // ✅ Автофокус на первое поле при загрузке
  useEffect(() => {
    const timer = setTimeout(() => genderRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Единый обработчик изменения: обновляет стейт + переключает фокус на следующее поле
  const handleChange = (field, value, nextRef) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Небольшая задержка, чтобы выпадающее меню успело закрыться перед переходом
    setTimeout(() => nextRef?.current?.focus(), 150);
  };

  // ✅ Для текстовых полей: Enter переключает на следующее поле
  const handleKeyDownNext = (e, nextRef) => {
    if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      e.preventDefault();
      nextRef?.current?.focus();
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

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontSize: '1.4rem' }}>⚙️ Настройка профиля</Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '1.1rem' }}>{error}</Alert>}

        {/* 1. Пол */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Пол</InputLabel>
          <Select
            ref={genderRef}
            value={profile.gender}
            label="Пол"
            onChange={(e) => handleChange('gender', e.target.value, ageRef)}
            // Меню не перехватывает фокус после закрытия
            MenuProps={{ disableAutoFocus: true }}
            sx={{ fontSize: '1.1rem', minHeight: 56 }}
          >
            <MenuItem value={Gender.Male}>Мужской</MenuItem>
            <MenuItem value={Gender.Female}>Женский</MenuItem>
          </Select>
        </FormControl>

        {/* 2. Возраст */}
        <TextField
          inputRef={ageRef}
          fullWidth label="Возраст (лет)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.age}
          onChange={(e) => handleChange('age', Number(e.target.value), heightRef)}
          onKeyDown={(e) => handleKeyDownNext(e, heightRef)}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', minHeight: 56 } }}
        />

        {/* 3. Рост */}
        <TextField
          inputRef={heightRef}
          fullWidth label="Рост (см)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.height}
          onChange={(e) => handleChange('height', Number(e.target.value), weightRef)}
          onKeyDown={(e) => handleKeyDownNext(e, weightRef)}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', minHeight: 56 } }}
        />

        {/* 4. Вес */}
        <TextField
          inputRef={weightRef}
          fullWidth label="Вес (кг)"
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={profile.weight}
          onChange={(e) => handleChange('weight', Number(e.target.value), activityRef)}
          onKeyDown={(e) => handleKeyDownNext(e, activityRef)}
          sx={{ mb: 2, '& input': { fontSize: '1.1rem', minHeight: 56 } }}
        />

        {/* 5. Активность */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Уровень активности</InputLabel>
          <Select
            ref={activityRef}
            value={profile.activityLevel}
            label="Уровень активности"
            onChange={(e) => handleChange('activityLevel', Number(e.target.value), goalRef)}
            MenuProps={{ disableAutoFocus: true }}
            sx={{ fontSize: '1.1rem', minHeight: 56 }}
          >
            {Object.entries(activityLabels).map(([val, label]) => (
              <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 6. Цель */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Цель</InputLabel>
          <Select
            ref={goalRef}
            value={profile.goal}
            label="Цель"
            onChange={(e) => handleChange('goal', e.target.value, saveRef)}
            MenuProps={{ disableAutoFocus: true }}
            sx={{ fontSize: '1.1rem', minHeight: 56 }}
          >
            {Object.entries(goalLabels).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 7. Сохранить */}
        <Button
          ref={saveRef}
          fullWidth variant="contained" size="large" onClick={handleSave}
          sx={{ py: 2, fontSize: '1.2rem', fontWeight: 700 }}
        >
          ✅ Сохранить профиль
        </Button>
      </Paper>
    </Container>
  );
}