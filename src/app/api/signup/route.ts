import { NextResponse } from 'next/server';
import { getAccount, createAccount, saveUserStore, UserStore } from '../../../utils/db';
import bcrypt from 'bcryptjs';
import { UserProfile, DailyLog } from '../../../types';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields (email, password, name)" }, { status: 400 });
    }

    const existing = getAccount(email);
    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Save account
    createAccount({
      email: email.toLowerCase(),
      passwordHash,
      name
    });

    // Seed defaults for this account
    const startDate = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const profile: UserProfile = {
      name,
      gender: "Male",
      age: 21,
      height: 180,
      startingWeight: 90,
      currentWeight: 88.2,
      targetWeight: 78,
      startingBodyFat: 30,
      currentBodyFat: 28.2,
      targetBodyFat: 18,
      startDate,
      currentDayNum: 12,
      calorieTarget: 1850,
      proteinTarget: 200,
      carbsTarget: 125,
      fatTarget: 50,
      waterTarget: 4000,
      stepsTarget: 12000,
    };

    // SVG graphics for initial photos
    const startFrontSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f0f11"/><circle cx="200" cy="120" r="40" fill="%233f3f46"/><path d="M150,180 Q200,200 250,180 L270,360 L240,480 L160,480 L130,360 Z" fill="%233f3f46"/><rect x="135" y="210" width="130" height="80" rx="40" fill="%2327272a"/><text x="200" y="44" fill="%23ffffff" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">DAY 1 - START</text><text x="200" y="240" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Weight: 90.0 kg</text><text x="200" y="260" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Est. Fat: 30%</text></svg>`;
    const week8FrontSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f0f11"/><circle cx="200" cy="120" r="40" fill="%2352525b"/><path d="M160,180 Q200,190 240,180 L255,360 L230,480 L170,480 L145,360 Z" fill="%2352525b"/><rect x="150" y="215" width="100" height="70" rx="35" fill="%2327272a"/><text x="200" y="44" fill="%23ffffff" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle">DAY 8 - PROGRESS</text><text x="200" y="240" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Weight: 88.8 kg</text><text x="200" y="260" fill="%23a3e635" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Est. Fat: 28.9%</text></svg>`;

    const photos = [
      { date: startDate, front: startFrontSvg },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], front: week8FrontSvg }
    ];

    // Seed 11 days of logs
    const dailyLogs: DailyLog[] = [];
    const baseDate = new Date(startDate);

    const mealItems = [
      { id: "b1", calories: 270, protein: 10 },
      { id: "b2", calories: 90, protein: 8 },
      { id: "b3", calories: 120, protein: 25 },
      { id: "b4", calories: 5, protein: 0.1 },
      { id: "e1", calories: 280, protein: 24 },
      { id: "e2", calories: 100, protein: 24 },
      { id: "l1", calories: 240, protein: 46 },
      { id: "l2", calories: 130, protein: 3 },
      { id: "l3", calories: 25, protein: 1 },
      { id: "pw1", calories: 120, protein: 24 },
      { id: "d1", calories: 240, protein: 46 },
      { id: "d2", calories: 50, protein: 3 },
      { id: "d3", calories: 30, protein: 1 }
    ];
    const allMealIds = mealItems.map(m => m.id);
    const allSuppIds = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

    for (let i = 1; i <= 11; i++) {
      const logDate = new Date(baseDate);
      logDate.setDate(baseDate.getDate() + (i - 1));
      const logDateString = logDate.toISOString().split('T')[0];

      const weight = parseFloat((90 - i * 0.163).toFixed(1));
      const bodyFat = parseFloat((30 - i * 0.163).toFixed(1));
      const steps = Math.floor(11500 + Math.random() * 3000);
      const sleepHours = Math.floor(6 + Math.random() * 3);
      const recoveryScore = Math.floor(70 + Math.random() * 25);
      
      const mealsChecked = Math.random() > 0.1 ? allMealIds : allMealIds.slice(0, -1);
      const supplementsChecked = Math.random() > 0.08 ? allSuppIds : allSuppIds.slice(0, -2);
      const workoutCompleted = i % 7 !== 0 && i % 7 !== 6;

      // Adherence calculation
      const mealsAdherence = (mealsChecked.length / allMealIds.length) * 100;
      const suppsAdherence = (supplementsChecked.length / allSuppIds.length) * 100;
      const stepsAdherence = Math.min((steps / 12000) * 100, 100);
      const workoutAdherence = workoutCompleted ? 100 : 0;
      const adherenceScore = Math.round((mealsAdherence + suppsAdherence + stepsAdherence + (i % 7 === 0 || i % 7 === 6 ? 100 : workoutAdherence)) / 4);

      dailyLogs.push({
        date: logDateString,
        weight,
        bodyFat,
        waterIntake: 3500 + Math.floor(Math.random() * 1000),
        steps,
        sleepHours,
        sleepQuality: 'Good',
        soreness: 'Low',
        recoveryScore,
        mealsChecked,
        supplementsChecked,
        workoutCompleted,
        workoutSession: workoutCompleted ? {
          splitName: i % 5 === 1 ? "Push" : i % 5 === 2 ? "Pull" : i % 5 === 3 ? "Legs" : i % 5 === 4 ? "Upper" : "Conditioning",
          completed: true,
          exercises: [
            {
              name: "Bench Press",
              sets: [
                { reps: 10, weight: 60 + i, completed: true },
                { reps: 10, weight: 60 + i, completed: true },
                { reps: 8, weight: 65 + i, completed: true }
              ]
            }
          ]
        } : undefined,
        adherenceScore
      });
    }

    const seededStore: UserStore = {
      profile,
      dailyLogs,
      photos
    };

    saveUserStore(email.toLowerCase(), seededStore);

    return NextResponse.json({ success: true, message: "Account registered successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to register account";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
