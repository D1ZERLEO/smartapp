import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert
} from '@mui/material';

const Gender = {
  Male: 'male',
  Female: 'female'
};

const ActivityLevel = {
  Minimal: 1.2,
  Light: 1.375,
  Moderate: 1.55,
  High: 1.725,
  VeryHigh: 1.9
};

const Goal = {
  Lose: 'lose',
  Maintain: 'maintain',
  Gain: 'gain'
};

const activityLabels = {
  [ActivityLevel.Minimal]: 'Минимальная (сидячая работа)',
  [ActivityLevel.Light]: 'Лёгкая (1-3 тренировки в неделю)',
  [ActivityLevel.Moderate]: 'Средняя (3-5 тренировок)',
  [ActivityLevel.High]: 'Высокая (6-7 тренировок)',
  [ActivityLevel.VeryHigh]: 'Очень высокая (физическая работа)'
};

const goalLabels = {
  [Goal.Lose]: 'Похудение',
  [Goal.Maintain]: 'Поддержание',
  [Goal.Gain]: 'Набор массы'
};

export default function ProfileSetup({ onSave, initialProfile }) {
  const [profile, setProfile] = useState(initialProfile || {
    gender: Gender.Male,
    age: 30,
    height: 170,
    weight: 70,
    activityLevel: ActivityLevel.Moderate,
    goal: Goal.Maintain
  });
  const [error, setError] = useState('');

  const validate = () => {
    if (profile.age < 12 || profile.age > 100) {
      setError('Возраст должен быть от 12 до 100 лет');
      return false;
    }
    if (profile.height < 120 || profile.height > 220) {
      setError('Рост должен быть от 120 до 220 см');
      return false;
    }
    if (profile.weight < 30 || profile.weight > 200) {
      setError('Вес должен быть от 30 до 200 кг');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(profile);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Настройка профиля
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Пол</InputLabel>
          <Select
            value={profile.gender}
            label="Пол"
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          >
            <MenuItem value={Gender.Male}>Мужской</MenuItem>
            <MenuItem value={Gender.Female}>Женский</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Возраст"
          type="number"
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Рост (см)"
          type="number"
          value={profile.height}
          onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Вес (кг)"
          type="number"
          value={profile.weight}
          onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Уровень активности</InputLabel>
          <Select
            value={profile.activityLevel}
            label="Уровень активности"
            onChange={(e) => setProfile({ ...profile, activityLevel: Number(e.target.value) })}
          >
            {Object.entries(activityLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Цель</InputLabel>
          <Select
            value={profile.goal}
            label="Цель"
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          >
            {Object.entries(goalLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSave}
        >
          Сохранить и рассчитать КБЖУ
        </Button>
      </Paper>
    </Container>
  );
}