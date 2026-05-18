// Расчёт BMR по формуле Миффлина-Сан Жеора
export function calculateBMR(profile) {
  const { gender, weight, height, age } = profile;
  const s = gender === 'male' ? 5 : -161;
  // BMR = 10W + 6.25H - 5A + s
  return 10 * weight + 6.25 * height - 5 * age + s;
}

// Расчёт TDEE с учётом активности
export function calculateTDEE(bmr, activityLevel) {
  return bmr * activityLevel;
}

// Корректировка под цель
export function adjustCaloriesForGoal(tdee, goal) {
  switch (goal) {
    case 'lose':
      return tdee * 0.8;
    case 'gain':
      return tdee * 1.15;
    default:
      return tdee;
  }
}

// Расчёт белков
export function calculateProtein(weight, goal) {
  switch (goal) {
    case 'maintain':
      return 1.5 * weight;
    default:
      return 1.8 * weight;
  }
}

// Расчёт жиров
export function calculateFat(weight) {
  return 0.8 * weight;
}

// Расчёт углеводов
export function calculateCarbs(targetCalories, protein, fat) {
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  return (targetCalories - proteinCalories - fatCalories) / 4;
}

// Полный расчёт КБЖУ
export function calculateNutritionTargets(profile) {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calories = adjustCaloriesForGoal(tdee, profile.goal);
  const protein = calculateProtein(profile.weight, profile.goal);
  const fat = calculateFat(profile.weight);
  const carbs = calculateCarbs(calories, protein, fat);
  
  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs)
  };
}

// Расчёт КБЖУ для продукта на заданный вес
export function calculateNutritionForAmount(food, amount) {
  const factor = amount / 100;
  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: Math.round(food.proteinPer100g * factor),
    fat: Math.round(food.fatPer100g * factor),
    carbs: Math.round(food.carbsPer100g * factor)
  };
}

// ... (предыдущие функции остаются)

// Расчёт остатков
export function calculateRemaining(targets, totals) {
  return {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    fat: targets.fat - totals.fat,
    carbs: targets.carbs - totals.carbs
  };
}

// Рекомендации на основе остатков
export function getRecommendations(remaining) {
  const recommendations = [];
  
  if (remaining.protein > 30) {
    recommendations.push({ type: 'protein', items: ['курица', 'яйца', 'творог', 'рыба'] });
  }
  
  if (remaining.calories < 300 && remaining.calories > 0) {
    recommendations.push({ type: 'lowCalorie', items: ['овощи', 'йогурт', 'салат', 'суп'] });
  }
  
  if (remaining.carbs > 50) {
    recommendations.push({ type: 'carbs', items: ['рис', 'гречка', 'банан', 'овсянка'] });
  }
  
  if (remaining.calories <= 0) {
    recommendations.push({ type: 'over', items: ['сегодня лимит исчерпан', 'займитесь спортом'] });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({ type: 'balance', items: ['сбалансированное блюдо'] });
  }
  
  return recommendations;
}