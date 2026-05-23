'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  TrendingUp, 
  History, 
  BrainCircuit, 
  Flame, 
  Activity, 
  Footprints, 
  ChevronDown, 
  ChevronUp, 
  Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DailyLog, WorkoutSession, SetLog } from '../types';
import { WORKOUT_PLAN, getDailyLogs } from '../utils/storage';
import { generateWorkoutSuggestions } from '../utils/workoutAdvisor';

interface WorkoutViewProps {
  todayLog: DailyLog;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

export default function WorkoutView({ todayLog, onUpdateLog }: WorkoutViewProps) {
  const [selectedSplitDay, setSelectedSplitDay] = useState<number>(() => {
    const dayOfWeek = new Date(todayLog.date).getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return dayOfWeek;
    return 1; // Default to Push
  });

  // Expand/collapse states for exercise cards
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});
  
  // Overload graph toggle
  const [visualizingExercise, setVisualizingExercise] = useState<string | null>(null);

  // Live stopwatch timer
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dailyLogs = getDailyLogs();
  const currentSplit = WORKOUT_PLAN[selectedSplitDay];
  
  // Resolve active session
  const activeSession: WorkoutSession = todayLog.workoutSession && todayLog.workoutSession.splitName.startsWith(currentSplit.splitName.split(' ')[0])
    ? todayLog.workoutSession 
    : {
        splitName: currentSplit.splitName,
        completed: todayLog.workoutCompleted,
        exercises: currentSplit.exercises.map(ex => ({
          name: ex.name,
          sets: Array.from({ length: ex.sets }).map(() => ({
            reps: ex.repsRange === "Failure" ? 12 : ex.repsRange.includes('s') ? 30 : ex.repsRange.includes('m') ? 40 : parseInt(ex.repsRange.split('-')[0]) || 10,
            weight: ex.defaultWeight,
            completed: false,
            rpe: 8,
            isPr: false
          })),
          notes: ""
        }))
      };

  // Find previous session for historical match
  const findPreviousSession = (splitName: string): WorkoutSession | null => {
    const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const todayIndex = sortedLogs.findIndex(l => l.date === todayLog.date);
    const searchLogs = todayIndex === -1 ? sortedLogs : sortedLogs.slice(todayIndex + 1);

    for (const log of searchLogs) {
      if (log.workoutCompleted && log.workoutSession && log.workoutSession.splitName.toLowerCase().includes(splitName.toLowerCase())) {
        return log.workoutSession;
      }
    }
    return null;
  };

  const prevSession = findPreviousSession(currentSplit.splitName.split(' ')[0]);

  // Generate dynamic AI Suggestions based on logs
  const aiSuggestions = generateWorkoutSuggestions(dailyLogs, currentSplit.splitName.split(' ')[0], todayLog.recoveryScore);

  const handleSaveSession = (updatedSession: WorkoutSession) => {
    const allSets = updatedSession.exercises.flatMap(e => e.sets);
    const allCompleted = allSets.length > 0 && allSets.every(s => s.completed);

    onUpdateLog({
      workoutCompleted: allCompleted || updatedSession.completed,
      workoutSession: updatedSession
    });
  };

  const handleToggleWorkoutComplete = () => {
    const isCompleted = !todayLog.workoutCompleted;
    handleSaveSession({
      ...activeSession,
      completed: isCompleted
    });
  };

  const handleSetChange = (exerciseIdx: number, setIdx: number, updates: Partial<SetLog>) => {
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIdx].sets[setIdx] = {
      ...updatedExercises[exerciseIdx].sets[setIdx],
      ...updates
    };
    
    handleSaveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleAddSet = (exerciseIdx: number) => {
    const updatedExercises = [...activeSession.exercises];
    const lastSet = updatedExercises[exerciseIdx].sets[updatedExercises[exerciseIdx].sets.length - 1];
    
    updatedExercises[exerciseIdx].sets.push({
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 50,
      completed: false,
      rpe: lastSet?.rpe || 8,
      isPr: false
    });

    handleSaveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleDeleteSet = (exerciseIdx: number, setIdx: number) => {
    const updatedExercises = [...activeSession.exercises];
    if (updatedExercises[exerciseIdx].sets.length <= 1) return;
    
    updatedExercises[exerciseIdx].sets.splice(setIdx, 1);

    handleSaveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleNotesChange = (exerciseIdx: number, notes: string) => {
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIdx].notes = notes;

    handleSaveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const toggleCollapse = (name: string) => {
    setCollapsedExercises(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Calculate XP Progression
  const totalSets = activeSession.exercises.flatMap(e => e.sets).length;
  const completedSets = activeSession.exercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const xpPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  // Calculate Level (roughly based on completed sets in history logs)
  const allHistoryCompletedSets = dailyLogs.reduce((sum, log) => {
    if (log.workoutCompleted && log.workoutSession) {
      const count = log.workoutSession.exercises.flatMap(e => e.sets).filter(s => s.completed).length;
      return sum + count;
    }
    return sum;
  }, 0);
  
  const athleteLevel = Math.floor(allHistoryCompletedSets / 25) + 1;

  // Circular progress ring setup
  const radius = 22;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (xpPercentage / 100) * circumference;

  // Active muscle groups configuration
  const muscleGroups = ['Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Calves'];
  const getActiveMuscles = (splitName: string) => {
    const name = splitName.toLowerCase();
    const active: string[] = [];
    if (name.includes('push')) active.push('Chest', 'Shoulders', 'Triceps');
    if (name.includes('pull')) active.push('Back', 'Biceps');
    if (name.includes('legs')) active.push('Quads', 'Hamstrings', 'Calves');
    if (name.includes('upper')) active.push('Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps');
    if (name.includes('conditioning')) active.push('Chest', 'Back', 'Quads', 'Hamstrings', 'Core');
    return active;
  };
  const activeMuscles = getActiveMuscles(currentSplit.splitName);

  // Calculate lifting streak
  const calculateStreak = () => {
    let streak = 0;
    const sorted = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (const log of sorted) {
      if (log.workoutCompleted) {
        streak++;
      } else {
        if (log.date === todayLog.date) continue;
        break;
      }
    }
    return streak;
  };
  const currentStreak = calculateStreak();

  return (
    <div className="space-y-6">
      
      {/* Title & Live Timer & Streak */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent text-black font-bold border-2 border-accent">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-black uppercase tracking-wider">Lifting Chamber</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase">PROGRESSIVE OVERLOAD & INTENSITY REGULATION</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Workout Timer */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-2">
            <Clock className={`w-4 h-4 ${timerActive ? 'text-accent animate-spin-slow' : 'text-zinc-500'}`} />
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">CLOCK:</span>
            <span className="font-mono font-bold text-xs text-accent glow-accent">{formatTime(elapsedTime)}</span>
            <button 
              onClick={() => setTimerActive(!timerActive)}
              className="ml-2 font-mono text-[8px] uppercase font-black text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-0.5 transition-all cursor-pointer"
            >
              {timerActive ? 'PAUSE' : 'START'}
            </button>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-2">
            <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-accent animate-pulse' : 'text-zinc-650'}`} />
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">STREAK:</span>
            <span className="font-mono font-black text-xs text-white">{currentStreak} DAYS</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleToggleWorkoutComplete}
            className={`font-mono text-xs uppercase px-5 py-2.5 border-2 transition-all cursor-pointer font-bold ${
              todayLog.workoutCompleted 
                ? 'bg-accent text-black border-accent' 
                : 'bg-black text-zinc-400 border-zinc-900 hover:border-accent hover:text-white'
            }`}
          >
            {todayLog.workoutCompleted ? "✓ Split Session Secured" : "Mark Workout Completed"}
          </button>
        </div>
      </div>

      {/* Level / Gamified XP Progress Bar & Progress Ring */}
      <div className="brutalist-card p-4 bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-14 h-14 transform -rotate-90 absolute">
              <circle cx="28" cy="28" r={radius} stroke="#18181b" strokeWidth={strokeWidth} fill="transparent" />
              <circle cx="28" cy="28" r={radius} stroke="#3b82f6" strokeWidth={strokeWidth} fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="font-mono font-black text-xs text-white z-10">{xpPercentage}%</span>
          </div>
          <div>
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">Athlete Rank Level</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs uppercase text-white">Elite Physique Development</span>
              <span className="px-1.5 py-0.5 bg-accent-blue/15 border border-accent-blue/20 text-accent-blue font-mono font-black text-[9px] uppercase">
                RANK {athleteLevel}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full md:max-w-md space-y-1.5">
          <div className="flex justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
            <span>Session XP (Sets Completed)</span>
            <span>{completedSets} / {totalSets} sets</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 border border-zinc-800">
            <div 
              className="bg-accent-blue h-full transition-all duration-500" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5-Day Split Selector tabs */}
      <div className="grid grid-cols-5 gap-1.5">
        {Object.entries(WORKOUT_PLAN).map(([dayKey, plan]) => {
          const dayNum = parseInt(dayKey);
          const isSelected = selectedSplitDay === dayNum;
          const shortName = plan.splitName.split(' ')[0];

          return (
            <button
              key={dayKey}
              onClick={() => setSelectedSplitDay(dayNum)}
              className={`py-3 px-1 text-center border-2 font-mono text-xs uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'border-accent bg-accent text-black font-black'
                  : 'border-zinc-900 bg-card-bg text-zinc-500 hover:border-zinc-700'
              }`}
            >
              <span className="block text-[8px] opacity-60">Day {dayNum}</span>
              <span className="font-bold tracking-wider">{shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Exercise cards */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {activeSession.exercises.map((exercise, exerciseIdx) => {
              const prevExercise = prevSession?.exercises.find(e => e.name.toLowerCase() === exercise.name.toLowerCase());
              const completedCount = exercise.sets.filter(s => s.completed).length;
              const isFinished = exercise.sets.length > 0 && completedCount === exercise.sets.length;
              const isCollapsed = collapsedExercises[exercise.name] ?? false;

              return (
                <motion.div 
                  layout
                  key={exercise.name} 
                  className={`brutalist-card p-5 bg-card-bg border-2 transition-all duration-300 ${
                    isFinished 
                      ? 'border-accent/40 bg-zinc-950/20 shadow-[0_0_15px_rgba(163,230,53,0.03)]' 
                      : 'border-card-border hover:border-zinc-800'
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleCollapse(exercise.name)}>
                      {isCollapsed ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
                      <div>
                        <h3 className="font-mono font-black text-sm uppercase text-white tracking-wide flex flex-wrap items-center gap-2">
                          <span>{exercise.name}</span>
                          {isFinished ? (
                            <span className="text-[8px] bg-accent/15 text-accent font-bold px-1.5 py-0.5 border border-accent/25 tracking-widest uppercase">
                              COMPLETED
                            </span>
                          ) : (
                            <span className="text-[8px] bg-zinc-900 text-zinc-400 font-bold px-1.5 py-0.5 border border-zinc-800 uppercase">
                              {completedCount}/{exercise.sets.length} Sets
                            </span>
                          )}
                        </h3>
                        
                        {prevExercise && (
                          <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 mt-1">
                            <History className="w-3 h-3 text-zinc-700" />
                            <span>Previous Best:</span>
                            <span className="text-zinc-400">
                              {prevExercise.sets.map(s => `${s.weight}kg x${s.reps}${s.rpe ? ` @RPE${s.rpe}` : ''}`).join(' | ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Overload Chart Toggle */}
                      <button
                        onClick={() => setVisualizingExercise(visualizingExercise === exercise.name ? null : exercise.name)}
                        className={`bg-black border font-mono text-[9px] uppercase px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer ${
                          visualizingExercise === exercise.name 
                            ? 'border-accent text-accent' 
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" /> Overload Chart
                      </button>

                      <button
                        onClick={() => handleAddSet(exerciseIdx)}
                        className="bg-black border border-zinc-800 hover:border-accent font-mono text-[9px] text-zinc-400 hover:text-white uppercase px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Set
                      </button>
                    </div>
                  </div>

                  {/* Overload Graph Container */}
                  <AnimatePresence>
                    {visualizingExercise === exercise.name && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-black border border-zinc-900 overflow-hidden"
                      >
                        <h4 className="font-mono text-[9px] uppercase text-zinc-450 tracking-wider font-bold mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-accent" />
                          Progressive Overload Telemetry // {exercise.name}
                        </h4>
                        <div className="h-44 w-full">
                          {(() => {
                            const dataPoints = dailyLogs
                              .filter(l => l.workoutCompleted && l.workoutSession)
                              .map(l => {
                                const ex = l.workoutSession?.exercises.find(e => e.name.toLowerCase() === exercise.name.toLowerCase());
                                if (!ex || ex.sets.length === 0) return null;
                                const maxWeight = Math.max(...ex.sets.map(s => s.weight));
                                return {
                                  date: l.date.split('-').slice(1).join('/'),
                                  load: maxWeight
                                };
                              })
                              .filter((p): p is { date: string; load: number } => p !== null)
                              .reverse();

                            if (dataPoints.length === 0) {
                              return (
                                <div className="h-full flex items-center justify-center font-mono text-zinc-650 text-[10px]">
                                  NO PREVIOUS LIFT DATA LOGGED IN ARCHIVE DB
                                </div>
                              );
                            }

                            return (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id={`colorLoad-${exerciseIdx}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#a3e635" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={8} tickLine={false} />
                                  <YAxis stroke="#3f3f46" fontSize={8} tickLine={false} domain={['auto', 'auto']} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontFamily: 'monospace', fontSize: '9px' }}
                                    labelStyle={{ color: '#a3e635' }}
                                  />
                                  <Area type="monotone" dataKey="load" name="Max Weight (kg)" stroke="#a3e635" fillOpacity={1} fill={`url(#colorLoad-${exerciseIdx})`} strokeWidth={1.5} />
                                </AreaChart>
                              </ResponsiveContainer>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Set Log Matrix */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="space-y-2 mb-4">
                          <div className="grid grid-cols-12 text-[9px] font-mono uppercase text-zinc-500 tracking-wider px-2">
                            <div className="col-span-1">Set</div>
                            <div className="col-span-3 text-center">Load (kg)</div>
                            <div className="col-span-2 text-center">Reps</div>
                            <div className="col-span-2 text-center">RPE</div>
                            <div className="col-span-2 text-center">PR</div>
                            <div className="col-span-1 text-center">Del</div>
                            <div className="col-span-1 text-right">Done</div>
                          </div>

                          {exercise.sets.map((set, setIdx) => (
                            <div 
                              key={setIdx}
                              className={`grid grid-cols-12 items-center p-2 border font-mono text-xs transition-all ${
                                set.completed ? 'bg-accent/5 border-accent/20' : 'bg-black border-zinc-900'
                              }`}
                            >
                              <div className="col-span-1 text-xs text-zinc-500 font-bold">
                                #{setIdx + 1}
                              </div>

                              <div className="col-span-3 flex justify-center px-1">
                                <input
                                  type="number"
                                  value={set.weight}
                                  onChange={e => handleSetChange(exerciseIdx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                                  disabled={set.completed}
                                  className="bg-zinc-900 border border-zinc-800 disabled:opacity-50 font-mono text-center text-xs text-white w-16 py-1 focus:border-accent outline-none"
                                />
                              </div>

                              <div className="col-span-2 flex justify-center px-1">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={e => handleSetChange(exerciseIdx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                                  disabled={set.completed}
                                  className="bg-zinc-900 border border-zinc-800 disabled:opacity-50 font-mono text-center text-xs text-white w-12 py-1 focus:border-accent outline-none"
                                />
                              </div>

                              <div className="col-span-2 flex justify-center px-1">
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  step="0.5"
                                  value={set.rpe || 8}
                                  onChange={e => handleSetChange(exerciseIdx, setIdx, { rpe: parseFloat(e.target.value) || 8 })}
                                  disabled={set.completed}
                                  className="bg-zinc-900 border border-zinc-800 disabled:opacity-50 font-mono text-center text-xs text-white w-12 py-1 focus:border-accent outline-none"
                                />
                              </div>

                              <div className="col-span-2 flex justify-center">
                                <button
                                  onClick={() => handleSetChange(exerciseIdx, setIdx, { isPr: !set.isPr })}
                                  disabled={set.completed}
                                  className={`px-1.5 py-0.5 font-mono text-[8px] uppercase font-black border transition-all cursor-pointer ${
                                    set.isPr 
                                      ? 'border-accent bg-accent text-black glow-accent' 
                                      : 'border-zinc-800 text-zinc-650 hover:border-zinc-600'
                                  }`}
                                >
                                  🔥 PR
                                </button>
                              </div>

                              <div className="col-span-1 flex justify-center">
                                <button
                                  onClick={() => handleDeleteSet(exerciseIdx, setIdx)}
                                  disabled={set.completed || exercise.sets.length <= 1}
                                  className="text-zinc-650 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  animate={set.completed ? { scale: [1, 1.25, 1] } : {}}
                                  transition={{ duration: 0.2 }}
                                  onClick={() => handleSetChange(exerciseIdx, setIdx, { completed: !set.completed })}
                                  className={`w-4.5 h-4.5 border transition-all flex items-center justify-center cursor-pointer ${
                                    set.completed 
                                      ? 'border-accent bg-accent text-black font-black text-[10px]' 
                                      : 'border-zinc-700 bg-zinc-950 hover:border-accent'
                                  }`}
                                >
                                  {set.completed && "✓"}
                                </motion.button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Performance Notes */}
                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block mb-1">
                            Performance Logs
                          </label>
                          <input
                            type="text"
                            value={exercise.notes || ""}
                            onChange={e => handleNotesChange(exerciseIdx, e.target.value)}
                            placeholder="e.g. Set 4 reached muscle failure. RPE 9.5."
                            className="w-full bg-black border border-zinc-900 p-2.5 font-mono text-[10px] text-zinc-350 focus:border-accent outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Right Col: AI Workout Advisor Panel, Cardio, Muscle highlight, and Overload tips */}
        <div className="space-y-6">
          
          {/* AI Coach Suggestion Board */}
          <div className="brutalist-card p-6 bg-card-bg border-2 border-accent-blue space-y-4 dot-grid">
            <h3 className="text-sm font-mono font-black uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-2 text-accent-blue">
              <BrainCircuit className="w-5 h-5 text-accent-blue animate-pulse" />
              AI Workout Advisor
            </h3>

            <div className="space-y-3.5">
              {aiSuggestions.length > 0 ? (
                aiSuggestions.map((sug, idx) => (
                  <div key={idx} className="p-3 bg-black border border-zinc-900 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[10px] uppercase text-white">
                        {sug.exerciseName}
                      </span>
                      <span className={`font-mono text-[8px] uppercase font-bold px-1.5 py-0.5 border ${
                        sug.type === 'increase' 
                          ? 'border-accent/40 bg-accent/5 text-accent' 
                          : sug.type === 'deload' 
                            ? 'border-accent-crimson/40 bg-accent-crimson/5 text-accent-crimson'
                            : 'border-accent-blue/40 bg-accent-blue/5 text-accent-blue'
                      }`}>
                        {sug.type}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-300 block leading-tight">
                      {sug.title}
                    </span>
                    <p className="font-mono text-[10px] text-zinc-500 leading-normal">
                      {sug.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-mono text-xs text-zinc-500 italic text-center py-4">
                  No active anomalies detected. Program running at optimal load parameters.
                </p>
              )}
            </div>
          </div>

          {/* Target Muscle Systems */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-4">
            <h3 className="text-sm font-mono font-black uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-blue" />
              Target Muscle Systems
            </h3>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase font-bold">
              {muscleGroups.map(muscle => {
                const isActive = activeMuscles.includes(muscle);
                return (
                  <div 
                    key={muscle}
                    className={`p-2 border text-center transition-all ${
                      isActive 
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-blue glow-blue' 
                        : 'border-zinc-900 bg-black text-zinc-650'
                    }`}
                  >
                    {muscle}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cardio Protocol Panel */}
          {currentSplit.cardio && (
            <div className="brutalist-card p-5 bg-card-bg border border-card-border">
              <h3 className="font-mono font-black text-xs uppercase text-white tracking-widest mb-3 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-accent" />
                Cardio Protocol
              </h3>
              <p className="font-mono text-[10px] text-zinc-400 uppercase bg-black p-3 border border-zinc-900 leading-relaxed">
                {currentSplit.cardio}
              </p>
            </div>
          )}

          {/* Conditioning Finisher Panel */}
          {currentSplit.conditioningFinisher && (
            <div className="brutalist-card p-5 bg-card-bg border border-card-border">
              <h3 className="font-mono font-black text-xs uppercase text-white tracking-widest mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent-crimson animate-pulse" />
                Conditioning Finisher
              </h3>
              <p className="font-mono text-[10px] text-zinc-400 uppercase bg-black p-3 border border-zinc-900 leading-relaxed">
                {currentSplit.conditioningFinisher}
              </p>
            </div>
          )}

          {/* Overload directives */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-4">
            <h3 className="text-sm font-mono font-black uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Volume Directives
            </h3>

            <div className="p-3 bg-black border border-zinc-900 font-mono text-[10px] text-zinc-550 space-y-3">
              <div>
                <span className="text-white font-bold block mb-1 uppercase text-accent">1. Progressive Step:</span>
                Log each set precisely. Failures are data points. Hit 10 clean reps to earn weight increments.
              </div>
              <div>
                <span className="text-white font-bold block mb-1 uppercase text-accent">2. RPE Boundary:</span>
                Aim for RPE 8.5 (1-2 reps left in tank) on primary compound lifts.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
