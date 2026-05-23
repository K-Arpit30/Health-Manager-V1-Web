'use client';

import React from 'react';
import { Flame, Footprints, Droplet, Dumbbell, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { UserProfile, DailyLog } from '../types';
import { getDailyLogs } from '../utils/storage';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface DashboardViewProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ profile, todayLog, onNavigate }: DashboardViewProps) {
  
  // Calculate consumed calories & protein from today's checked meals
  let consumedCals = 0;
  let consumedProtein = 0;

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

  todayLog.mealsChecked.forEach(mId => {
    const match = mealItems.find(item => item.id === mId);
    if (match) {
      consumedCals += match.calories;
      consumedProtein += match.protein;
    }
  });

  consumedCals = Math.round(consumedCals);
  consumedProtein = Math.round(consumedProtein);

  // Calorie remaining calculation
  const caloriesRemaining = Math.max(0, profile.calorieTarget - consumedCals);
  const calPercent = Math.min((consumedCals / profile.calorieTarget) * 100, 100);
  const protPercent = Math.min((consumedProtein / profile.proteinTarget) * 100, 100);

  // Calculate overall program progress
  // Weight lost / Total weight to lose
  const totalWeightToLose = profile.startingWeight - profile.targetWeight;
  const currentWeightLost = profile.startingWeight - profile.currentWeight;
  const progressPercent = Math.min(Math.max(Math.round((currentWeightLost / totalWeightToLose) * 100), 0), 100);

  // Retrieve logs to draw a mini area chart for weight loss
  const logs = getDailyLogs();
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  
  // Format data for weight line graph
  const miniChartData = sortedLogs.map((log, idx) => ({
    name: `Day ${idx + 1}`,
    weight: log.weight
  }));

  // Calculate consistency streaks
  let liftStreak = 0;
  for (let i = sortedLogs.length - 1; i >= 0; i--) {
    if (sortedLogs[i].workoutCompleted) {
      liftStreak++;
    } else {
      // If it's a rest day (Saturday/Sunday), we don't break the streak unless they missed a weekday
      const dayName = new Date(sortedLogs[i].date).getDay();
      if (dayName !== 0 && dayName !== 6) {
        break;
      }
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-mono font-black uppercase tracking-wider text-white">
            PROJECT 18 <span className="text-accent">CONSOLE</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">
            Day {profile.currentDayNum} of 75 • Hyper-Personalised Cutting Protocols
          </p>
        </div>
        
        {/* Quick status box */}
        <div className="flex items-center gap-4">
          <div className="bg-zinc-950 border border-zinc-850 px-4 py-2 text-right">
            <span className="font-mono text-[9px] text-zinc-500 uppercase block">Active Streak</span>
            <span className="font-mono font-black text-accent text-lg flex items-center gap-1">
              <Flame className="w-5 h-5 text-accent animate-pulse" />
              {liftStreak} DAYS
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-850 px-4 py-2 text-right">
            <span className="font-mono text-[9px] text-zinc-500 uppercase block">Days Remaining</span>
            <span className="font-mono font-black text-white text-lg">
              {75 - profile.currentDayNum} D
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Weight lost Widget */}
        <div className="brutalist-card p-5 bg-card-bg border border-card-border relative overflow-hidden">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Current Weight</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-mono font-black text-white">{profile.currentWeight}</span>
            <span className="text-xs font-mono text-zinc-400">kg</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block mt-2">
            Target: {profile.targetWeight} kg (-{totalWeightToLose.toFixed(1)}kg cut)
          </span>
          <div className="w-full bg-zinc-900 h-1.5 mt-3">
            <div className="bg-accent h-1.5" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-[9px] font-mono text-accent uppercase font-bold mt-1 block">
            {progressPercent}% of Weight Loss Target Cleared
          </span>
        </div>

        {/* Est. Body Fat Widget */}
        <div className="brutalist-card p-5 bg-card-bg border border-card-border">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Body Fat Ratio</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-mono font-black text-white">{profile.currentBodyFat}%</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block mt-2">
            Initial: 30.0% BF • Goal: 18.0% BF
          </span>
          <div className="w-full bg-zinc-900 h-1.5 mt-3">
            {/* Linear Body Fat loss progress percentage */}
            <div 
              className="bg-accent h-1.5" 
              style={{ width: `${((30 - profile.currentBodyFat) / (30 - 18)) * 100}%` }} 
            />
          </div>
          <span className="text-[9px] font-mono text-accent uppercase font-bold mt-1 block">
            Current Rate: -0.16% BF / Day
          </span>
        </div>

        {/* Calories Left Widget */}
        <div 
          onClick={() => onNavigate('diet')} 
          className="brutalist-card p-5 bg-card-bg border border-card-border cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Calories Remaining</span>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-accent transition-colors" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-mono font-black ${caloriesRemaining === 0 ? 'text-red-500' : 'text-white'}`}>
              {caloriesRemaining}
            </span>
            <span className="text-xs font-mono text-zinc-400">kcal</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block mt-2">
            Logged: {consumedCals} / {profile.calorieTarget} kcal
          </span>
          <div className="w-full bg-zinc-900 h-1.5 mt-3">
            <div className={`h-1.5 ${consumedCals > profile.calorieTarget ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${calPercent}%` }} />
          </div>
          <span className="text-[9px] font-mono text-zinc-500 uppercase mt-1 block">
            {consumedCals > profile.calorieTarget ? "Calorie Target Breached" : "Safe deficit zone active"}
          </span>
        </div>

        {/* Protein Tracker Widget */}
        <div 
          onClick={() => onNavigate('diet')}
          className="brutalist-card p-5 bg-card-bg border border-card-border cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">Protein Satiation</span>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-accent transition-colors" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-mono font-black text-white">{consumedProtein}g</span>
            <span className="text-xs font-mono text-zinc-400">/ {profile.proteinTarget}g</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block mt-2">
            Ensures muscle retention under deficit
          </span>
          <div className="w-full bg-zinc-900 h-1.5 mt-3">
            <div className="bg-accent h-1.5" style={{ width: `${protPercent}%` }} />
          </div>
          <span className="text-[9px] font-mono text-accent uppercase font-bold mt-1 block">
            {protPercent >= 100 ? "✓ Muscle Preservation Secured" : `${Math.round(profile.proteinTarget - consumedProtein)}g remaining`}
          </span>
        </div>

      </div>

      {/* Middle Grid: Main logs summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core trackers checklist summary */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="brutalist-card p-6 bg-card-bg border border-card-border">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider mb-5 border-b border-zinc-800 pb-2">
              Daily Target Checklist
            </h3>

            <div className="space-y-4">
              
              {/* Lift tracker */}
              <div 
                onClick={() => onNavigate('workout')}
                className="flex items-center justify-between p-3.5 bg-black border border-zinc-850 hover:border-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 border ${todayLog.workoutCompleted ? 'border-accent bg-accent text-black' : 'border-zinc-850 text-zinc-500 bg-zinc-950'}`}>
                    <Dumbbell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wide block font-bold text-white">
                      Heavy Resistance Training
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      Split: {todayLog.workoutSession ? todayLog.workoutSession.splitName : "Rest Day"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs uppercase font-bold ${todayLog.workoutCompleted ? 'text-accent' : 'text-zinc-500'}`}>
                    {todayLog.workoutCompleted ? "COMPLETE" : "NOT FINISHED"}
                  </span>
                </div>
              </div>

              {/* Steps Tracker */}
              <div 
                onClick={() => onNavigate('cardio')}
                className="flex items-center justify-between p-3.5 bg-black border border-zinc-850 hover:border-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 border ${todayLog.steps >= profile.stepsTarget ? 'border-accent bg-accent text-black' : 'border-zinc-850 text-zinc-500 bg-zinc-950'}`}>
                    <Footprints className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wide block font-bold text-white">
                      Cardio Steps Counter
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      Logged: {todayLog.steps} / {profile.stepsTarget} steps
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs uppercase font-bold ${todayLog.steps >= profile.stepsTarget ? 'text-accent' : 'text-zinc-500'}`}>
                    {todayLog.steps >= profile.stepsTarget ? "✓ TARGET MET" : `${Math.max(0, profile.stepsTarget - todayLog.steps)} steps left`}
                  </span>
                </div>
              </div>

              {/* Water Tracker */}
              <div 
                onClick={() => onNavigate('diet')}
                className="flex items-center justify-between p-3.5 bg-black border border-zinc-850 hover:border-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 border ${todayLog.waterIntake >= profile.waterTarget ? 'border-accent bg-accent text-black' : 'border-zinc-850 text-zinc-500 bg-zinc-950'}`}>
                    <Droplet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wide block font-bold text-white">
                      Hydration Intake Chamber
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      Logged: {todayLog.waterIntake} / {profile.waterTarget} ml
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs uppercase font-bold ${todayLog.waterIntake >= profile.waterTarget ? 'text-accent' : 'text-zinc-500'}`}>
                    {todayLog.waterIntake >= profile.waterTarget ? "✓ SECURED" : `${Math.max(0, profile.waterTarget - todayLog.waterIntake)} ml left`}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Mini weight chart */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-4">
              Weight Loss Velocity Trend
            </h3>
            <div className="h-44 w-full">
              {miniChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3e635" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#3f3f46" fontSize={8} fontFamily="monospace" tickLine={false} />
                    <YAxis stroke="#3f3f46" fontSize={8} fontFamily="monospace" tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Area type="monotone" dataKey="weight" stroke="#a3e635" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center font-mono text-xs text-zinc-650">
                  Awaiting logs...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Expected Fat Loss Timeline & Warnings */}
        <div className="space-y-6">
          {/* Adherence scorecard */}
          <div className="brutalist-card p-6 bg-zinc-950 border border-card-border space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl"></div>
            <h3 className="text-md font-mono font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Expected Cut Timeline
            </h3>

            <div className="font-mono text-xs space-y-3 leading-relaxed text-zinc-400">
              <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                <span>Week 1-2 (Initial water drop)</span>
                <span className="text-white font-bold">90kg → 88kg ✓</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                <span>Week 3-6 (Linear fat reduction)</span>
                <span className="text-zinc-300">88kg → 84kg</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                <span>Week 7-10 (Stubborn fat burn)</span>
                <span className="text-zinc-300">84kg → 78kg</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-900 flex justify-between items-center">
              <span className="font-mono text-[9px] text-zinc-500 uppercase">Target Rate</span>
              <span className="font-mono text-[10px] text-accent font-bold uppercase">~0.75 kg / week</span>
            </div>
          </div>

          {/* Warning System */}
          {consumedCals > profile.calorieTarget && (
            <div className="brutalist-card p-5 border-red-500/50 bg-red-950/20 text-red-500 space-y-2">
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                ⚠️ DEFICIT BOUNDARY BREACHED
              </h4>
              <p className="font-mono text-[11px] leading-relaxed opacity-80">
                Your logged intake of {consumedCals} kcal exceeds the safe cutting threshold of {profile.calorieTarget} kcal. 
                Extend today&apos;s incline treadmill walking session by +15 minutes to offset.
              </p>
            </div>
          )}
          
          {/* Recovery and sleep quick snapshot */}
          <div className="brutalist-card p-5 bg-card-bg border border-card-border space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-4 h-4 text-accent" />
              CNS Status Snapshot
            </h4>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500 uppercase">Recovery Score</span>
              <span className="text-accent font-bold">{todayLog.recoveryScore}%</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500 uppercase">Sleep Logged</span>
              <span className="text-white">{todayLog.sleepHours} hrs ({todayLog.sleepQuality})</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
