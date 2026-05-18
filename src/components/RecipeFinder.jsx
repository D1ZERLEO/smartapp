import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Card, CardContent,
  Grid, Chip, Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemText, IconButton, Box, Slider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { findRecipesByIngredients, scaleRecipe, recipesDatabase } from '../utils/recipesDatabase';

export default function RecipeFinder({ triggerSearch = [] }) {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState(recipesDatabase);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [portions, setPortions] = useState(1);
  const [scaledRecipe, setScaledRecipe] = useState(null);

  // Обработка поиска от ассистента
  useEffect(() => {
    if (triggerSearch.length > 0) {
      // ✅ Просто в нижний регистр, НЕ режем окончания для UI
      const cleaned = triggerSearch.map(w => w.toLowerCase().trim());
      setIngredients(cleaned);
      setRecipes(findRecipesByIngredients(cleaned));
    } else if (triggerSearch.length === 0 && ingredients.length > 0) {
      setIngredients([]);
      setRecipes(recipesDatabase);
    }
  }, [triggerSearch]);

  const addIngredient = () => {
    if (ingredientsInput.trim() && !ingredients.includes(ingredientsInput.trim())) {
      const cleaned = ingredientsInput.trim().toLowerCase();
      setIngredients([...ingredients, cleaned]);
      setIngredientsInput('');
    }
  };

  const removeIngredient = (ingredient) => {
    const newIngredients = ingredients.filter(i => i !== ingredient);
    setIngredients(newIngredients);
    if (newIngredients.length === 0) setRecipes(recipesDatabase);
  };

  const searchRecipes = () => {
    setRecipes(ingredients.length > 0 ? findRecipesByIngredients(ingredients) : recipesDatabase);
  };

  const openRecipeDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setPortions(recipe.basePortions);
    setScaledRecipe(scaleRecipe(recipe, recipe.basePortions));
  };

  const updatePortions = (newPortions) => {
    setPortions(newPortions);
    setScaledRecipe(scaleRecipe(selectedRecipe, newPortions));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>🍳 Поиск рецептов по продуктам</Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth label="Введите продукт" value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addIngredient()} sx={{ mb: 1 }} />
          <Button variant="outlined" onClick={addIngredient} fullWidth>Добавить продукт</Button>
        </Box>
        <Box sx={{ mb: 2 }}>
          {ingredients.map((ing) => (
            <Chip key={ing} label={ing} onDelete={() => removeIngredient(ing)} sx={{ m: 0.5 }} />
          ))}
        </Box>

        <Button variant="contained" onClick={searchRecipes} fullWidth sx={{ mb: 3 }}>
          {ingredients.length > 0 ? 'Найти рецепты' : 'Показать все рецепты'}
        </Button>

        <Grid container spacing={2}>
          {recipes.map((recipe) => (
            <Grid item xs={12} md={6} key={recipe.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{recipe.name}</Typography>
                  {recipe.matchScore !== undefined && (
                    <Typography color="textSecondary" variant="body2">
                      Совпадение: {Math.round(recipe.matchScore * 100)}%
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    🔥 {recipe.caloriesPerPortion} ккал | 🥩 {recipe.proteinPerPortion}г | 🧈 {recipe.fatPerPortion}г | 🍚 {recipe.carbsPerPortion}г
                  </Typography>
                  {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                    <Typography variant="body2" color="warning" sx={{ mt: 1 }}>
                      Не хватает: {recipe.missingIngredients.join(', ')}
                    </Typography>
                  )}
                  <Button size="small" onClick={() => openRecipeDialog(recipe)} sx={{ mt: 1 }}>
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {recipes.length === 0 && (
          <Typography color="textSecondary" align="center" sx={{ mt: 3 }}>
            Рецептов не найдено. Попробуйте другие продукты.
          </Typography>
        )}

        <Dialog open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} maxWidth="md" fullWidth>
          {scaledRecipe && (<>
            <DialogTitle>{scaledRecipe.name}
              <IconButton onClick={() => setSelectedRecipe(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>Количество порций: {portions}</Typography>
                <Slider value={portions} onChange={(_, val) => updatePortions(val)} min={0.5} max={5} step={0.5} marks valueLabelDisplay="auto" />
              </Box>
              <Typography variant="h6">КБЖУ на {portions} порц.:</Typography>
              <Typography>🔥 {scaledRecipe.caloriesPerPortion} ккал | 🥩 {scaledRecipe.proteinPerPortion}г | 🧈 {scaledRecipe.fatPerPortion}г | 🍚 {scaledRecipe.carbsPerPortion}г</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Ингредиенты:</Typography>
              <List>{scaledRecipe.ingredients.map((ing, idx) => (<ListItem key={idx}><ListItemText primary={ing} /></ListItem>))}</List>
              <Typography variant="h6" sx={{ mt: 2 }}>Приготовление:</Typography>
              <List>{scaledRecipe.steps.map((step, idx) => (<ListItem key={idx}><ListItemText primary={`${idx + 1}. ${step}`} /></ListItem>))}</List>
            </DialogContent>
          </>)}
        </Dialog>
      </Paper>
    </Container>
  );
}