import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  LinearProgress,
  Grid,
  Chip,
  Autocomplete,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { foodDatabase, searchFood } from '../utils/foodDatabase';
import { calculateNutritionForAmount } from '../utils/nutritionCalculator';

export default function FoodDiary({ targets, totals, onAddFood, onDeleteFood, meals }) {
  const [selectedFood, setSelectedFood] = useState(null);
  const [amount, setAmount] = useState(100);
  const [customFood, setCustomFood] = useState({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [showCustom, setShowCustom] = useState(false);

  const handleAddFood = () => {
    if (selectedFood && amount > 0) {
      const nutrition = calculateNutritionForAmount(selectedFood, amount);
      onAddFood({
        id: Date.now().toString(),
        productName: selectedFood.name,
        amount: amount,
        ...nutrition,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      });
      setSelectedFood(null);
      setAmount(100);
    }
  };

  const handleAddCustomFood = () => {
    if (customFood.name && customFood.calories > 0) {
      const factor = amount / 100;
      onAddFood({
        id: Date.now().toString(),
        productName: customFood.name,
        amount: amount,
        calories: Math.round(customFood.calories * factor),
        protein: Math.round(customFood.protein * factor),
        fat: Math.round(customFood.fat * factor),
        carbs: Math.round(customFood.carbs * factor),
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      });
      setCustomFood({ name: '', calories: 0, protein: 0, fat: 0, carbs: 0 });
      setAmount(100);
      setShowCustom(false);
    }
  };

  const getProgressColor = (current, target) => {
    const percent = (current / target) * 100;
    if (percent >= 100) return 'error';
    if (percent >= 85) return 'warning';
    return 'success';
  };

  const remaining = {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    fat: targets.fat - totals.fat,
    carbs: targets.carbs - totals.carbs
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Прогресс */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Прогресс на сегодня</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>Калории: {totals.calories} / {targets.calories} ккал</Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((totals.calories / targets.calories) * 100, 100)}
                color={getProgressColor(totals.calories, targets.calories)}
                sx={{ mb: 2 }}
              />
              
              <Typography>Белки: {totals.protein} / {targets.protein} г</Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((totals.protein / targets.protein) * 100, 100)}
                color={getProgressColor(totals.protein, targets.protein)}
                sx={{ mb: 2 }}
              />
              
              <Typography>Жиры: {totals.fat} / {targets.fat} г</Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((totals.fat / targets.fat) * 100, 100)}
                color={getProgressColor(totals.fat, targets.fat)}
                sx={{ mb: 2 }}
              />
              
              <Typography>Углеводы: {totals.carbs} / {targets.carbs} г</Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((totals.carbs / targets.carbs) * 100, 100)}
                color={getProgressColor(totals.carbs, targets.carbs)}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Добавление продукта */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Добавить приём пищи</Typography>
            
            {!showCustom ? (
              <>
                <Autocomplete
                  options={foodDatabase}
                  getOptionLabel={(option) => option.name}
                  value={selectedFood}
                  onChange={(_, newValue) => setSelectedFood(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Поиск продукта" fullWidth />
                  )}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Количество (грамм)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleAddFood}
                  disabled={!selectedFood}
                  fullWidth
                >
                  Добавить продукт
                </Button>
                
                <Button 
                  variant="text" 
                  onClick={() => setShowCustom(true)}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Или добавить свой продукт
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Название продукта"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Калории на 100г"
                  type="number"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: Number(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Белки на 100г"
                  type="number"
                  value={customFood.protein}
                  onChange={(e) => setCustomFood({ ...customFood, protein: Number(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Жиры на 100г"
                  type="number"
                  value={customFood.fat}
                  onChange={(e) => setCustomFood({ ...customFood, fat: Number(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Углеводы на 100г"
                  type="number"
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood({ ...customFood, carbs: Number(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Количество (грамм)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />
                
                <Button variant="contained" onClick={handleAddCustomFood} fullWidth>
                  Добавить свой продукт
                </Button>
                <Button variant="text" onClick={() => setShowCustom(false)} fullWidth sx={{ mt: 1 }}>
                  Назад к поиску
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Список съеденного */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Сегодня съедено</Typography>
            <List>
              {meals.map((meal) => (
                <ListItem
                  key={meal.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => onDeleteFood(meal.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={meal.productName}
                    secondary={`${meal.amount}г | ${meal.calories} ккал | Б:${meal.protein} Ж:${meal.fat} У:${meal.carbs}`}
                  />
                </ListItem>
              ))}
              {meals.length === 0 && (
                <Typography color="textSecondary" align="center">
                  Пока ничего не съедено. Добавьте первый приём пищи!
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Рекомендации */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>💡 Рекомендации</Typography>
            {remaining.calories < 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                ⚠️ Вы превысили дневную норму калорий на {Math.abs(remaining.calories)} ккал!
              </Alert>
            )}
            {remaining.calories > 0 && remaining.calories < 300 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Осталось всего {remaining.calories} ккал. Выбирайте лёгкие продукты!
              </Alert>
            )}
            {remaining.protein > 30 && (
              <Alert severity="success" sx={{ mb: 1 }}>
                💪 Добавьте белка: курица, яйца, творог, рыба
              </Alert>
            )}
            {remaining.carbs > 50 && (
              <Alert severity="success" sx={{ mb: 1 }}>
                🍚 Для энергии добавьте углеводы: рис, гречка, банан, овсянка
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}