import React, { useState, useEffect, useRef } from 'react';
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
  const firstInputRef = useRef(null);

  // Автофокус на первое поле при загрузке
  useEffect(() => {
    firstInputRef.current?.focus();
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
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>️ Настройка профиля</Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '1.1rem' }}>{error}</Alert>}

        {/* Пол - RadioGroup (идеально для пультов) */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '1.1rem' }}>Пол</FormLabel>
          <RadioGroup
            row
            value={profile.gender}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            sx={{
              '& .MuiRadio-root': { fontSize: 28, p: 0.5 },
              '& .MuiFormControlLabel-root': { mr: 2, fontSize: '1.1rem' }
            }}
          >
            <FormControlLabel value={Gender.Male} control={<Radio />} label="Мужской" />
            <FormControlLabel value={Gender.Female} control={<Radio />} label="Женский" />
          </RadioGroup>
        </FormControl>

        {/* Возраст */}
        <TextField
          inputRef={firstInputRef}
          fullWidth label="Возраст (лет)" type="number" inputMode="numeric"
          value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
          sx={{ mb: 3 }}
          inputProps={{ min: 12, max: 100, style: { fontSize: '1.2rem', minHeight: 48 } }}
        />

        {/* Рост */}
        <TextField
          fullWidth label="Рост (см)" type="number" inputMode="numeric"
          value={profile.height} onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
          sx={{ mb: 3 }}
          inputProps={{ min: 120, max: 220, style: { fontSize: '1.2rem', minHeight: 48 } }}
        />

        {/* Вес */}
        <TextField
          fullWidth label="Вес (кг)" type="number" inputMode="numeric"
          value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
          sx={{ mb: 3 }}
          inputProps={{ min: 30, max: 200, style: { fontSize: '1.2rem', minHeight: 48 } }}
        />

        {/* Активность - RadioGroup */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '1.1rem' }}>Уровень активности</FormLabel>
          <RadioGroup
            value={profile.activityLevel}
            onChange={(e) => setProfile({ ...profile, activityLevel: Number(e.target.value) })}
            sx={{
              '& .MuiRadio-root': { fontSize: 28, p: 0.5 },
              '& .MuiFormControlLabel-root': { mb: 0.5, fontSize: '1.05rem' }
            }}
          >
            {Object.entries(activityLabels).map(([val, label]) => (
              <FormControlLabel key={val} value={Number(val)} control={<Radio />} label={label} />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Цель - RadioGroup */}
        <FormControl component="fieldset" sx={{ mb: 4 }}>
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '1.1rem' }}>Цель</FormLabel>
          <RadioGroup
            row
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            sx={{
              '& .MuiRadio-root': { fontSize: 28, p: 0.5 },
              '& .MuiFormControlLabel-root': { mr: 2, fontSize: '1.1rem' }
            }}
          >
            {Object.entries(goalLabels).map(([val, label]) => (
              <FormControlLabel key={val} value={val} control={<Radio />} label={label} />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Кнопка сохранения */}
        <Button
          fullWidth variant="contained" size="large" onClick={handleSave}
          sx={{
            py: 2, fontSize: '1.2rem', fontWeight: 700,
            '&:focus': { outline: '4px solid #4f46e5', outlineOffset: 2 },
            '&:active': { transform: 'scale(0.98)' }
          }}
        >
          ✅ Сохранить профиль
        </Button>
      </Paper>
    </Container>
  );
}