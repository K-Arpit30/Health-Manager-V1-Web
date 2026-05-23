export interface UserProfile {
  name: string;
  gender: string;
  age: number;
  height: number; // in cm, e.g., 180 (5'11")
  startingWeight: number; // in kg, e.g., 90
  currentWeight: number;
  targetWeight: number; // e.g., 78
  startingBodyFat: number; // e.g., 30
  currentBodyFat: number;
  targetBodyFat: number; // e.g., 18
  startDate: string; // YYYY-MM-DD
  currentDayNum: number; // Day 1 to 75
  calorieTarget: number; // 1800-1950 (e.g. 1850)
  proteinTarget: number; // e.g. 200g
  carbsTarget: number; // e.g. 125g
  fatTarget: number; // e.g. 50g
  waterTarget: number; // in ml, e.g. 4000 (4 Litres)
  stepsTarget: number; // e.g. 12000
}

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSection {
  id: string;
  title: string;
  time: string; // e.g. "08:30 AM"
  items: MealItem[];
}

export interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  timing: string; // e.g. "Morning", "Pre-workout"
}

export interface SetLog {
  reps: number;
  weight: number; // in kg
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  isPr?: boolean; // Toggle for Personal Record
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSession {
  splitName: string; // e.g. "Push", "Pull", "Legs", "Upper", "Conditioning"
  completed: boolean;
  exercises: ExerciseLog[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFat: number;
  waterIntake: number; // in ml
  steps: number;
  sleepHours: number;
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  soreness: 'None' | 'Low' | 'Medium' | 'High';
  recoveryScore: number; // 0-100
  mealsChecked: string[]; // List of mealItem.id that are checked
  supplementsChecked: string[]; // List of supplementItem.id that are checked
  workoutCompleted: boolean;
  workoutSession?: WorkoutSession;
  treadmillDuration?: number; // in mins
  treadmillIncline?: number; // %
  treadmillSpeed?: number; // km/h
  treadmillCalories?: number; // kcal
  adherenceScore: number; // 0-100 percentage
}

export interface ProgressPhoto {
  date: string; // YYYY-MM-DD
  front?: string; // base64 URL
  side?: string; // base64 URL
  back?: string; // base64 URL
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'steps' | 'workout' | 'diet' | 'consistency';
}
