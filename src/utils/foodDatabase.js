export const foodDatabase = [
  {
    id: '1',
    name: 'курица',
    caloriesPer100g: 165,
    proteinPer100g: 31,
    fatPer100g: 3.6,
    carbsPer100g: 0
  },
  {
    id: '2',
    name: 'яйца',
    caloriesPer100g: 155,
    proteinPer100g: 13,
    fatPer100g: 11,
    carbsPer100g: 1.1
  },
  {
    id: '3',
    name: 'творог',
    caloriesPer100g: 98,
    proteinPer100g: 16,
    fatPer100g: 3.5,
    carbsPer100g: 2.6
  },
  {
    id: '4',
    name: 'рис',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    fatPer100g: 0.3,
    carbsPer100g: 28
  },
  {
    id: '5',
    name: 'гречка',
    caloriesPer100g: 132,
    proteinPer100g: 4.5,
    fatPer100g: 2.3,
    carbsPer100g: 25
  },
  {
    id: '6',
    name: 'банан',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    fatPer100g: 0.3,
    carbsPer100g: 23
  },
  {
    id: '7',
    name: 'рыба',
    caloriesPer100g: 206,
    proteinPer100g: 22,
    fatPer100g: 13,
    carbsPer100g: 0
  },
  {
    id: '8',
    name: 'овощи',
    caloriesPer100g: 25,
    proteinPer100g: 2,
    fatPer100g: 0.5,
    carbsPer100g: 4
  }
];

export function searchFood(query) {
  return foodDatabase.filter(food =>
    food.name.toLowerCase().includes(query.toLowerCase())
  );
}