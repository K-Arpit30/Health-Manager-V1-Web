import { UserProfile, MealSection, SupplementItem, DailyLog, Badge, WorkoutSession, ProgressPhoto } from '../types';

export const DEFAULT_PROFILE: UserProfile = {
  name: "Arpit",
  gender: "Male",
  age: 21,
  height: 180, // 5'11"
  startingWeight: 90,
  currentWeight: 88.2,
  targetWeight: 78,
  startingBodyFat: 30,
  currentBodyFat: 28.2,
  targetBodyFat: 18,
  startDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Started 11 days ago
  currentDayNum: 12,
  calorieTarget: 1850,
  proteinTarget: 200,
  carbsTarget: 125,
  fatTarget: 50,
  waterTarget: 4000,
  stepsTarget: 12000,
};

export const MEALS_DATA: MealSection[] = [
  {
    id: "breakfast",
    title: "Breakfast",
    time: "08:30 AM",
    items: [
      { id: "b1", name: "Oats", portion: "70g", calories: 270, protein: 10, carbs: 47, fat: 5 },
      { id: "b2", name: "Skim Milk", portion: "250ml", calories: 90, protein: 8, carbs: 12, fat: 0.5 },
      { id: "b3", name: "MuscleBlaze Whey", portion: "1 scoop", calories: 120, protein: 25, carbs: 3, fat: 1.5 },
      { id: "b4", name: "Cinnamon", portion: "1 tsp", calories: 5, protein: 0.1, carbs: 1, fat: 0.1 }
    ]
  },
  {
    id: "egg_meal",
    title: "Egg Meal",
    time: "11:30 AM",
    items: [
      { id: "e1", name: "Whole Eggs", portion: "4 pieces", calories: 280, protein: 24, carbs: 2, fat: 20 },
      { id: "e2", name: "Egg Whites", portion: "6 pieces", calories: 100, protein: 24, carbs: 0.6, fat: 0.2 }
    ]
  },
  {
    id: "lunch",
    title: "Lunch",
    time: "02:00 PM",
    items: [
      { id: "l1", name: "Chicken Breast / Fish", portion: "200g", calories: 240, protein: 46, carbs: 0, fat: 5 },
      { id: "l2", name: "Cooked Rice / 2 Chapatis", portion: "100g / 2 pcs", calories: 130, protein: 3, carbs: 28, fat: 0.5 },
      { id: "l3", name: "Salad (Cucumber/Tomato)", portion: "1 bowl", calories: 25, protein: 1, carbs: 5, fat: 0.2 }
    ]
  },
  {
    id: "post_workout",
    title: "Post Workout",
    time: "06:30 PM",
    items: [
      { id: "pw1", name: "MuscleTech Whey", portion: "1 scoop", calories: 120, protein: 24, carbs: 2, fat: 1.5 }
    ]
  },
  {
    id: "dinner",
    title: "Dinner",
    time: "09:00 PM",
    items: [
      { id: "d1", name: "Chicken/Fish/Paneer", portion: "200g", calories: 240, protein: 46, carbs: 0, fat: 5 },
      { id: "d2", name: "Mixed Vegetables", portion: "1 bowl", calories: 50, protein: 3, carbs: 10, fat: 0.5 },
      { id: "d3", name: "Minimal Carbs Extra", portion: "Leafy greens", calories: 30, protein: 1, carbs: 6, fat: 0.1 }
    ]
  }
];

export const SUPPLEMENTS_DATA: SupplementItem[] = [
  { id: "s1", name: "MuscleBlaze Whey Protein", dosage: "1 scoop", timing: "Morning" },
  { id: "s2", name: "HK Vitals Multivitamin", dosage: "1 tablet", timing: "With Breakfast" },
  { id: "s3", name: "Fish Oil", dosage: "1 capsule", timing: "With Breakfast" },
  { id: "s4", name: "L-Carnitine", dosage: "1.5g", timing: "Pre workout" },
  { id: "s5", name: "Coffee in warm water", dosage: "1 cup", timing: "Pre workout" },
  { id: "s6", name: "MuscleTech Whey", dosage: "1 scoop", timing: "Post workout" },
  { id: "s7", name: "Creatine Monohydrate", dosage: "5g", timing: "Post workout" },
];

export interface ExercisePlan {
  name: string;
  sets: number;
  repsRange: string;
  defaultWeight: number;
}

export interface SplitPlan {
  splitName: string;
  exercises: ExercisePlan[];
  cardio: string;
  conditioningFinisher?: string;
}

export const WORKOUT_PLAN: Record<number, SplitPlan> = {
  1: {
    splitName: "Push (Chest, Shoulders, Triceps)",
    cardio: "30 min incline treadmill (incline 10-12, speed 5-6 km/h)",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, repsRange: "6-8", defaultWeight: 60 },
      { name: "Incline Dumbbell Press", sets: 4, repsRange: "8-10", defaultWeight: 22 },
      { name: "Weighted Dips", sets: 3, repsRange: "8-10", defaultWeight: 10 },
      { name: "Seated Dumbbell Shoulder Press", sets: 4, repsRange: "8-10", defaultWeight: 16 },
      { name: "Cable Lateral Raises", sets: 4, repsRange: "12-15", defaultWeight: 7.5 },
      { name: "Pec Deck Flyes", sets: 3, repsRange: "12-15", defaultWeight: 45 },
      { name: "Rope Tricep Pushdowns", sets: 4, repsRange: "12", defaultWeight: 18 },
      { name: "Overhead Cable Tricep Extensions", sets: 3, repsRange: "12", defaultWeight: 14 },
      { name: "Pushup Burnout Set", sets: 2, repsRange: "Failure", defaultWeight: 0 }
    ]
  },
  2: {
    splitName: "Pull (Back, Rear Delts, Biceps)",
    cardio: "25 min incline treadmill",
    exercises: [
      { name: "Deadlifts", sets: 4, repsRange: "5", defaultWeight: 100 },
      { name: "Weighted Pullups", sets: 4, repsRange: "8", defaultWeight: 5 },
      { name: "Barbell Rows", sets: 4, repsRange: "8-10", defaultWeight: 50 },
      { name: "Chest Supported Rows", sets: 3, repsRange: "10-12", defaultWeight: 18 },
      { name: "Seated Cable Rows", sets: 3, repsRange: "12", defaultWeight: 40 },
      { name: "Wide Grip Lat Pulldown", sets: 3, repsRange: "12", defaultWeight: 45 },
      { name: "Face Pulls", sets: 4, repsRange: "15", defaultWeight: 15 },
      { name: "Rear Delt Flyes", sets: 3, repsRange: "15", defaultWeight: 8 },
      { name: "Incline Dumbbell Curls", sets: 3, repsRange: "12", defaultWeight: 10 },
      { name: "Hammer Curls", sets: 4, repsRange: "12", defaultWeight: 12 },
      { name: "Cable Curl Burnout", sets: 2, repsRange: "Failure", defaultWeight: 10 }
    ]
  },
  3: {
    splitName: "Legs (Quads, Hamstrings, Glutes, Calves)",
    cardio: "20 min cycling",
    conditioningFinisher: "sled pushes OR assault bike intervals",
    exercises: [
      { name: "Back Squats", sets: 4, repsRange: "6-8", defaultWeight: 80 },
      { name: "Romanian Deadlifts", sets: 4, repsRange: "8-10", defaultWeight: 70 },
      { name: "Leg Press", sets: 4, repsRange: "12", defaultWeight: 120 },
      { name: "Bulgarian Split Squats", sets: 3, repsRange: "10", defaultWeight: 12 },
      { name: "Walking Lunges", sets: 3, repsRange: "20", defaultWeight: 10 },
      { name: "Leg Extensions", sets: 3, repsRange: "15", defaultWeight: 35 },
      { name: "Hamstring Curls", sets: 3, repsRange: "15", defaultWeight: 30 },
      { name: "Standing Calf Raises", sets: 5, repsRange: "15", defaultWeight: 40 },
      { name: "Seated Calf Raises", sets: 4, repsRange: "20", defaultWeight: 30 }
    ]
  },
  4: {
    splitName: "Upper Hypertrophy",
    cardio: "30 min incline treadmill",
    exercises: [
      { name: "Incline Smith Machine Press", sets: 4, repsRange: "10", defaultWeight: 50 },
      { name: "Flat Dumbbell Press", sets: 3, repsRange: "12", defaultWeight: 22 },
      { name: "Pullups", sets: 4, repsRange: "Failure", defaultWeight: 0 },
      { name: "Chest Supported T-Bar Rows", sets: 4, repsRange: "10", defaultWeight: 35 },
      { name: "Cable Flyes", sets: 3, repsRange: "15", defaultWeight: 10 },
      { name: "Single Arm Lat Pulldown", sets: 3, repsRange: "12", defaultWeight: 20 },
      { name: "Dumbbell Lateral Raises", sets: 4, repsRange: "15", defaultWeight: 10 },
      { name: "EZ Bar Curls", sets: 3, repsRange: "12", defaultWeight: 25 },
      { name: "Skull Crushers", sets: 3, repsRange: "12", defaultWeight: 20 },
      { name: "Cable Superset Arms Finisher", sets: 3, repsRange: "15", defaultWeight: 15 }
    ]
  },
  5: {
    splitName: "Full Body Conditioning + Athleticism",
    cardio: "20 min stairmaster OR incline treadmill",
    conditioningFinisher: "Circuit Style (5 rounds) - 60-90s rest",
    exercises: [
      { name: "Kettlebell Swings", sets: 5, repsRange: "20", defaultWeight: 16 },
      { name: "Pushups", sets: 5, repsRange: "20", defaultWeight: 0 },
      { name: "Goblet Squats", sets: 5, repsRange: "15", defaultWeight: 20 },
      { name: "Dumbbell Rows", sets: 5, repsRange: "15", defaultWeight: 16 },
      { name: "Burpees", sets: 5, repsRange: "12", defaultWeight: 0 },
      { name: "Battle Ropes", sets: 5, repsRange: "30s", defaultWeight: 0 },
      { name: "Box Jumps", sets: 5, repsRange: "12", defaultWeight: 0 },
      { name: "Farmer Carries", sets: 5, repsRange: "40m", defaultWeight: 24 }
    ]
  }
};

export const INITIAL_BADGES: Badge[] = [
  { id: "b_start", name: "Iron Will", description: "Start the 75-day Project 18 program.", unlocked: true, unlockedAt: DEFAULT_PROFILE.startDate, category: "consistency" },
  { id: "b_steps_15", name: "Step Overlord", description: "Walk over 15,000 steps in a single day.", unlocked: false, category: "steps" },
  { id: "b_diet_7", name: "Macro Machine", description: "Hit your exact macro targets 7 days in a row.", unlocked: false, category: "diet" },
  { id: "b_supp_comp", name: "Stack Discipline", description: "100% supplement compliance for 5 consecutive days.", unlocked: false, category: "consistency" },
  { id: "b_workout_5", name: "Split Slayer", description: "Complete all 5 workout splits in a single week.", unlocked: false, category: "workout" },
  { id: "b_streak_10", name: "Discipline streak", description: "Maintain a 10-day adherence streak.", unlocked: false, category: "consistency" }
];

// Inline default SVG assets to display as transformation images immediately
const startFrontSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f0f11"/><circle cx="200" cy="120" r="40" fill="%233f3f46"/><path d="M150,180 Q200,200 250,180 L270,360 L240,480 L160,480 L130,360 Z" fill="%233f3f46"/><rect x="135" y="210" width="130" height="80" rx="40" fill="%2327272a"/><text x="200" y="44" fill="%23ffffff" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">DAY 1 - START</text><text x="200" y="240" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Weight: 90.0 kg</text><text x="200" y="260" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Est. Fat: 30%</text></svg>`;
const week8FrontSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f0f11"/><circle cx="200" cy="120" r="40" fill="%2352525b"/><path d="M160,180 Q200,190 240,180 L255,360 L230,480 L170,480 L145,360 Z" fill="%2352525b"/><rect x="150" y="215" width="100" height="70" rx="35" fill="%2327272a"/><text x="200" y="44" fill="%23ffffff" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">DAY 8 - PROGRESS</text><text x="200" y="240" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Weight: 88.8 kg</text><text x="200" y="260" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Est. Fat: 28.9%</text></svg>`;

export const INITIAL_PHOTOS: ProgressPhoto[] = [
  { date: DEFAULT_PROFILE.startDate, front: startFrontSvg },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], front: week8FrontSvg }
];

export const seedInitialData = (): void => {
  if (typeof window === 'undefined') return;

  // Set Profile
  if (!localStorage.getItem('p18_profile')) {
    localStorage.setItem('p18_profile', JSON.stringify(DEFAULT_PROFILE));
  }

  // Set Badges
  if (!localStorage.getItem('p18_badges')) {
    localStorage.setItem('p18_badges', JSON.stringify(INITIAL_BADGES));
  }

  // Set Photos
  if (!localStorage.getItem('p18_photos')) {
    localStorage.setItem('p18_photos', JSON.stringify(INITIAL_PHOTOS));
  }

  // Generate historical data for Days 1 to 11
  if (!localStorage.getItem('p18_daily_logs')) {
    const logs: DailyLog[] = [];
    const baseDate = new Date(DEFAULT_PROFILE.startDate);

    for (let i = 1; i <= 11; i++) {
      const logDate = new Date(baseDate);
      logDate.setDate(baseDate.getDate() + (i - 1));
      const logDateString = logDate.toISOString().split('T')[0];

      // Weight starts at 90 and falls progressively
      const weight = parseFloat((90 - i * 0.163).toFixed(1));
      // Fat percentage starts at 30% and falls progressively
      const bodyFat = parseFloat((30 - i * 0.163).toFixed(1));
      
      // Calculate realistic steps: average 12500 steps, high adherence
      const steps = Math.floor(11500 + Math.random() * 3000);
      const sleepHours = Math.floor(6 + Math.random() * 3);
      const sleepQualities: DailyLog['sleepQuality'][] = ['Good', 'Excellent', 'Fair'];
      const sleepQuality = sleepQualities[Math.floor(Math.random() * sleepQualities.length)];
      const sorenessLevels: DailyLog['soreness'][] = ['Medium', 'Low', 'None', 'High'];
      const soreness = sorenessLevels[Math.floor(Math.random() * sorenessLevels.length)];
      
      // Calculate recovery score
      const recoveryScore = Math.floor(70 + Math.random() * 25);

      // Check all meals and supplements on most days
      const allMealIds = MEALS_DATA.flatMap(m => m.items.map(it => it.id));
      const mealsChecked = Math.random() > 0.1 ? allMealIds : allMealIds.slice(0, -1);
      
      const allSuppIds = SUPPLEMENTS_DATA.map(s => s.id);
      const supplementsChecked = Math.random() > 0.08 ? allSuppIds : allSuppIds.slice(0, -2);

      const workoutCompleted = i % 7 !== 0 && i % 7 !== 6; // Lift 5 days a week
      
      // Split configuration
      let splitDay = (i % 7);
      if (splitDay === 0) splitDay = 1;
      if (splitDay > 5) splitDay = 5;
      const splitInfo = WORKOUT_PLAN[splitDay] || WORKOUT_PLAN[1];

      const workoutSession: WorkoutSession = {
        splitName: splitInfo.splitName,
        completed: workoutCompleted,
        exercises: splitInfo.exercises.map(ex => ({
          name: ex.name,
          sets: Array.from({ length: ex.sets }).map((_, idx) => ({
            reps: ex.repsRange === "Failure" ? 12 : ex.repsRange.includes('s') ? 30 : ex.repsRange.includes('m') ? 40 : parseInt(ex.repsRange.split('-')[0]) || 10,
            weight: ex.defaultWeight > 0 ? parseFloat((ex.defaultWeight + i * 0.45).toFixed(1)) : 0,
            completed: workoutCompleted,
            rpe: 8,
            isPr: i > 8 && idx === 0
          })),
          notes: "Seeded progressive overload execution"
        }))
      };

      // Set values
      const waterIntake = 3500 + Math.floor(Math.random() * 1000);
      
      // Calculate Adherence Score
      const mealsAdherence = (mealsChecked.length / allMealIds.length) * 100;
      const suppsAdherence = (supplementsChecked.length / allSuppIds.length) * 100;
      const stepsAdherence = Math.min((steps / DEFAULT_PROFILE.stepsTarget) * 100, 100);
      const workoutAdherence = workoutCompleted ? 100 : 0;
      const adherenceScore = Math.round((mealsAdherence + suppsAdherence + stepsAdherence + (i % 7 === 0 || i % 7 === 6 ? 100 : workoutAdherence)) / 4);

      // Treadmill details
      const treadmillDuration = workoutCompleted ? 20 : 0;
      const treadmillIncline = workoutCompleted ? 10 : 0;
      const treadmillSpeed = workoutCompleted ? 5.5 : 0;
      const treadmillCalories = workoutCompleted ? 220 : 0;

      logs.push({
        date: logDateString,
        weight,
        bodyFat,
        waterIntake,
        steps,
        sleepHours,
        sleepQuality,
        soreness,
        recoveryScore,
        mealsChecked,
        supplementsChecked,
        workoutCompleted,
        workoutSession,
        treadmillDuration,
        treadmillIncline,
        treadmillSpeed,
        treadmillCalories,
        adherenceScore
      });
    }
    localStorage.setItem('p18_daily_logs', JSON.stringify(logs));
  }
};

// Retrieve data wrappers
export const getProfile = (): UserProfile => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  const p = localStorage.getItem('p18_profile');
  return p ? JSON.parse(p) : DEFAULT_PROFILE;
};

export const updateProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('p18_profile', JSON.stringify(profile));
};

export const getDailyLogs = (): DailyLog[] => {
  if (typeof window === 'undefined') return [];
  const l = localStorage.getItem('p18_daily_logs');
  return l ? JSON.parse(l) : [];
};

export const updateDailyLogs = (logs: DailyLog[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('p18_daily_logs', JSON.stringify(logs));
};

export const getBadges = (): Badge[] => {
  if (typeof window === 'undefined') return INITIAL_BADGES;
  const b = localStorage.getItem('p18_badges');
  return b ? JSON.parse(b) : INITIAL_BADGES;
};

export const updateBadges = (badges: Badge[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('p18_badges', JSON.stringify(badges));
};

export const getPhotos = (): ProgressPhoto[] => {
  if (typeof window === 'undefined') return INITIAL_PHOTOS;
  const ph = localStorage.getItem('p18_photos');
  return ph ? JSON.parse(ph) : INITIAL_PHOTOS;
};

export const updatePhotos = (photos: ProgressPhoto[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('p18_photos', JSON.stringify(photos));
};

// Helper to get or initialize log for a specific date
export const getLogForDate = (dateString: string, weightFallback = 88.2, fatFallback = 28.2): DailyLog => {
  const logs = getDailyLogs();
  const existing = logs.find(l => l.date === dateString);
  
  if (existing) return existing;

  // Initialize a blank log for today
  const dayOfWeek = new Date(dateString).getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate which split day
  // 5 days active: 1 to 5. Let's map Day of week: Mon(1)->Push, Tue(2)->Pull, Wed(3)->Legs, Thu(4)->Upper, Fri(5)->Conditioning, Sat/Sun rest
  const workoutActive = dayOfWeek >= 1 && dayOfWeek <= 5;
  const splitInfo = WORKOUT_PLAN[dayOfWeek] || WORKOUT_PLAN[1];

  const workoutSession: WorkoutSession = {
    splitName: splitInfo ? splitInfo.splitName : "Rest Day",
    completed: false,
    exercises: splitInfo ? splitInfo.exercises.map(ex => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }).map(() => ({
        reps: ex.repsRange === "Failure" ? 12 : ex.repsRange.includes('s') ? 30 : ex.repsRange.includes('m') ? 40 : parseInt(ex.repsRange.split('-')[0]) || 10,
        weight: ex.defaultWeight,
        completed: false,
        rpe: 8,
        isPr: false
      })),
      notes: ""
    })) : []
  };

  const newLog: DailyLog = {
    date: dateString,
    weight: weightFallback,
    bodyFat: fatFallback,
    waterIntake: 0,
    steps: 0,
    sleepHours: 7,
    sleepQuality: 'Good',
    soreness: 'None',
    recoveryScore: 85,
    mealsChecked: [],
    supplementsChecked: [],
    workoutCompleted: false,
    workoutSession: workoutActive ? workoutSession : undefined,
    adherenceScore: 0
  };

  logs.push(newLog);
  updateDailyLogs(logs);
  return newLog;
};

export const saveLogForDate = (dateString: string, log: DailyLog): void => {
  const logs = getDailyLogs();
  const idx = logs.findIndex(l => l.date === dateString);
  
  // Recalculate adherence score before saving
  const allMealIds = MEALS_DATA.flatMap(m => m.items.map(it => it.id));
  const mealsAdherence = allMealIds.length > 0 ? (log.mealsChecked.length / allMealIds.length) * 100 : 100;
  
  const allSuppIds = SUPPLEMENTS_DATA.map(s => s.id);
  const suppsAdherence = allSuppIds.length > 0 ? (log.supplementsChecked.length / allSuppIds.length) * 100 : 100;
  
  const profile = getProfile();
  const stepsAdherence = Math.min((log.steps / profile.stepsTarget) * 100, 100);
  
  const dayOfWeek = new Date(dateString).getDay();
  const isRestDay = dayOfWeek === 0 || dayOfWeek === 6;
  const workoutAdherence = isRestDay ? 100 : (log.workoutCompleted ? 100 : 0);
  
  log.adherenceScore = Math.round((mealsAdherence + suppsAdherence + stepsAdherence + workoutAdherence) / 4);

  if (idx !== -1) {
    logs[idx] = log;
  } else {
    logs.push(log);
  }
  updateDailyLogs(logs);

  // Check achievements after updating log
  checkAchievements();
};

// Check for achievements unlock
const checkAchievements = (): void => {
  const logs = getDailyLogs();
  const badges = getBadges();
  let updated = false;

  // 15k steps badge
  const has15k = logs.some(l => l.steps >= 15000);
  const badge15k = badges.find(b => b.id === 'b_steps_15');
  if (has15k && badge15k && !badge15k.unlocked) {
    badge15k.unlocked = true;
    badge15k.unlockedAt = new Date().toISOString().split('T')[0];
    updated = true;
  }

  // Supplement discipline: 5 days in a row with 100% compliance
  const allSuppIds = SUPPLEMENTS_DATA.map(s => s.id);
  let streak = 0;
  let maxStreak = 0;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].supplementsChecked.length === allSuppIds.length) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }
  const badgeSupp = badges.find(b => b.id === 'b_supp_comp');
  if (maxStreak >= 5 && badgeSupp && !badgeSupp.unlocked) {
    badgeSupp.unlocked = true;
    badgeSupp.unlockedAt = new Date().toISOString().split('T')[0];
    updated = true;
  }

  // Workout Split: 5 workouts in a week
  const recent7Days = logs.slice(-7);
  const workoutsCompleted = recent7Days.filter(l => l.workoutCompleted).length;
  const badgeWorkouts = badges.find(b => b.id === 'b_workout_5');
  if (workoutsCompleted >= 5 && badgeWorkouts && !badgeWorkouts.unlocked) {
    badgeWorkouts.unlocked = true;
    badgeWorkouts.unlockedAt = new Date().toISOString().split('T')[0];
    updated = true;
  }

  // 10-day adherence streak (adherence >= 80)
  let adhStreak = 0;
  let maxAdhStreak = 0;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].adherenceScore >= 80) {
      adhStreak++;
      maxAdhStreak = Math.max(maxAdhStreak, adhStreak);
    } else {
      adhStreak = 0;
    }
  }
  const badgeStreak = badges.find(b => b.id === 'b_streak_10');
  if (maxAdhStreak >= 10 && badgeStreak && !badgeStreak.unlocked) {
    badgeStreak.unlocked = true;
    badgeStreak.unlockedAt = new Date().toISOString().split('T')[0];
    updated = true;
  }

  if (updated) {
    updateBadges(badges);
  }
};
