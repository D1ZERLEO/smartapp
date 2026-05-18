export const Gender = {
  Male: 'male',
  Female: 'female'
};

export const ActivityLevel = {
  Minimal: 1.2,
  Light: 1.375,
  Moderate: 1.55,
  High: 1.725,
  VeryHigh: 1.9
};

export const Goal = {
  Lose: 'lose',
  Maintain: 'maintain',
  Gain: 'gain'
};

export const activityLabels = {
  [ActivityLevel.Minimal]: 'Минимальная (сидячая работа)',
  [ActivityLevel.Light]: 'Лёгкая (1-3 тренировки в неделю)',
  [ActivityLevel.Moderate]: 'Средняя (3-5 тренировок)',
  [ActivityLevel.High]: 'Высокая (6-7 тренировок)',
  [ActivityLevel.VeryHigh]: 'Очень высокая (физическая работа)'
};

export const goalLabels = {
  [Goal.Lose]: 'Похудение',
  [Goal.Maintain]: 'Поддержание',
  [Goal.Gain]: 'Набор массы'
};