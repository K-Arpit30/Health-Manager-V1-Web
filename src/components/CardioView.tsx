'use client';

import React, { useState, useEffect } from 'react';
import { Footprints, Timer, Milestone, Award, Sparkles } from 'lucide-react';
import { DailyLog, UserProfile, Badge } from '../types';
import { getBadges, getDailyLogs } from '../utils/storage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CardioViewProps {
  todayLog: DailyLog;
  profile: UserProfile;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

export default function CardioView({ todayLog, profile, onUpdateLog }: CardioViewProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  
  // Treadmill state
  const [duration, setDuration] = useState(todayLog.treadmillDuration || 20);
  const [incline, setIncline] = useState(todayLog.treadmillIncline || 10);
  const [speed, setSpeed] = useState(todayLog.treadmillSpeed || 5.5);
  const [treadmillCalories, setTreadmillCalories] = useState(todayLog.treadmillCalories || 220);

  useEffect(() => {
    setTimeout(() => {
      setBadges(getBadges());
    }, 0);
  }, [todayLog]);

  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onUpdateLog({ steps: val });
  };

  const incrementSteps = (amount: number) => {
    onUpdateLog({ steps: Math.max(0, todayLog.steps + amount) });
  };

  const handleSaveTreadmill = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLog({
      treadmillDuration: duration,
      treadmillIncline: incline,
      treadmillSpeed: speed,
      treadmillCalories: treadmillCalories
    });
  };

  // Auto calculate calories based on speed, incline, weight, duration
  const handleAutoCalcCalories = () => {
    // Standard metabolic equation for treadmill running/walking
    // VO2 = (0.1 * speed) + (1.8 * speed * incline/100) + 3.5
    // Speed in m/min = speed_in_kmh * 16.67
    const speedMMin = speed * 16.67;
    const vo2 = (0.1 * speedMMin) + (1.8 * speedMMin * (incline / 100)) + 3.5;
    
    // METs = VO2 / 3.5
    const mets = vo2 / 3.5;
    
    // Calories/min = METs * 3.5 * weight_kg / 200
    const calsPerMin = mets * 3.5 * profile.currentWeight / 200;
    const totalBurned = Math.round(calsPerMin * duration);
    
    setTreadmillCalories(totalBurned);
  };

  // Get last 7 days of logs for Recharts
  const logs = getDailyLogs();
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const recentLogs = sortedLogs.slice(-7);

  // Map logs to chart data
  const chartData = recentLogs.map(log => {
    const dayName = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      name: dayName,
      steps: log.steps,
      target: profile.stepsTarget,
    };
  });

  // Calculate step streak
  let stepStreak = 0;
  for (let i = sortedLogs.length - 1; i >= 0; i--) {
    if (sortedLogs[i].steps >= profile.stepsTarget) {
      stepStreak++;
    } else {
      break;
    }
  }

  // Calculate weekly steps average
  const weeklyStepsSum = recentLogs.reduce((sum, log) => sum + log.steps, 0);
  const weeklyStepsAvg = recentLogs.length > 0 ? Math.round(weeklyStepsSum / recentLogs.length) : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent text-black font-bold border border-accent">
          <Footprints className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-mono font-black uppercase tracking-wider">Cardio & Steps Chamber</h2>
          <p className="text-zinc-500 font-mono text-xs">STEPS SATURATION & TREADMILL INTENSITY LOGS</p>
        </div>
      </div>

      {/* Main Grid: Steps & Treadmill & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Step Tracker & Treadmill */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Steps logger card */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border relative overflow-hidden">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
              <Milestone className="w-5 h-5 text-accent" />
              Daily Step Counter
            </h3>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">
                    Logged Steps
                  </label>
                  <input
                    type="number"
                    value={todayLog.steps}
                    onChange={handleStepsChange}
                    className="w-full bg-black border border-zinc-800 p-3 font-mono text-xl font-bold focus:border-accent outline-none text-white"
                  />
                </div>

                {/* Quick increment buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => incrementSteps(1000)}
                    className="py-2 bg-zinc-900 border border-zinc-800 hover:border-accent font-mono text-xs uppercase text-white cursor-pointer transition-all"
                  >
                    +1,000
                  </button>
                  <button
                    onClick={() => incrementSteps(5000)}
                    className="py-2 bg-zinc-900 border border-zinc-800 hover:border-accent font-mono text-xs uppercase text-white cursor-pointer transition-all"
                  >
                    +5,000
                  </button>
                  <button
                    onClick={() => incrementSteps(10000)}
                    className="py-2 bg-zinc-900 border border-zinc-800 hover:border-accent font-mono text-xs uppercase text-white cursor-pointer transition-all"
                  >
                    +10,000
                  </button>
                </div>
              </div>

              {/* Streak info */}
              <div className="bg-black border border-zinc-850 p-4 w-full md:w-56 text-center space-y-2">
                <span className="font-mono text-xs text-zinc-500 uppercase block">Active Step Streak</span>
                <span className="text-4xl font-mono font-black text-accent block">{stepStreak} Days</span>
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">
                  Target: {profile.stepsTarget} steps/day
                </span>
              </div>
            </div>
          </div>

          {/* Incline Treadmill Sessions */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
              <Timer className="w-5 h-5 text-accent" />
              Incline Treadmill Logger
            </h3>

            <form onSubmit={handleSaveTreadmill} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Incline (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={incline}
                  onChange={e => setIncline(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Speed (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={speed}
                  onChange={e => setSpeed(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-1 flex justify-between">
                  <span>Burn (kcal)</span>
                  <span onClick={handleAutoCalcCalories} className="text-accent cursor-pointer underline text-[9px]">
                    Auto
                  </span>
                </label>
                <input
                  type="number"
                  value={treadmillCalories}
                  onChange={e => setTreadmillCalories(parseInt(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                className="md:col-span-4 mt-2 bg-accent text-black font-mono font-black text-xs uppercase tracking-wider py-3 border border-accent hover:bg-accent-hover transition-all cursor-pointer text-center"
              >
                Log Treadmill Session
              </button>
            </form>
          </div>

          {/* Steps Recharts Chart */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border">
            <h3 className="text-md font-mono font-bold uppercase tracking-wider mb-4">
              Steps Performance (Past 7 Days)
            </h3>
            
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} fontFamily="monospace" tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} fontFamily="monospace" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontFamily: 'monospace', fontSize: 12 }} 
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="steps" fill="#a3e635" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center font-mono text-xs text-zinc-600">
                  No step logs logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Badges & Weekly averages */}
        <div className="space-y-6">
          {/* Weekly Averages */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-4">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
              Weekly Averages
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-500 uppercase">Steps Average</span>
                <span className="text-white font-bold">{weeklyStepsAvg} / day</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-500 uppercase">Treadmill Burn</span>
                <span className="text-white font-bold">~220 kcal / day</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-500 uppercase">Fat Burn Efficiency</span>
                <span className="text-accent font-bold">MAXIMAL</span>
              </div>
            </div>
          </div>

          {/* Badges list */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-4">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Achievements Wall
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {badges.map(b => (
                <div 
                  key={b.id}
                  className={`p-3 border font-mono text-center transition-all ${
                    b.unlocked 
                      ? 'border-accent bg-accent/5 text-white' 
                      : 'border-zinc-900 bg-zinc-950/40 text-zinc-600'
                  }`}
                >
                  <Award className={`w-8 h-8 mx-auto mb-1.5 ${b.unlocked ? 'text-accent' : 'text-zinc-700'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-wider block leading-tight ${b.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                    {b.name}
                  </span>
                  <span className="text-[8px] text-zinc-500 uppercase block mt-1 leading-none">
                    {b.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cardio coaching science */}
          <div className="brutalist-card p-6 bg-zinc-950 border border-card-border space-y-3">
            <h3 className="text-md font-mono font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Cardio Protocols
            </h3>
            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
              <strong>Incline Walking:</strong> Walking at 10% incline and 5.5 km/h creates a similar calorie burn to running on flat ground, 
              but removes the eccentric impact forces, preserving knee joints and muscle tissue.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
