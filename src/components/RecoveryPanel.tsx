'use client';

import React from 'react';
import { Activity, Moon, ShieldCheck, Thermometer } from 'lucide-react';
import { DailyLog } from '../types';

interface RecoveryPanelProps {
  todayLog: DailyLog;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

export default function RecoveryPanel({ todayLog, onUpdateLog }: RecoveryPanelProps) {
  const { sleepHours, sleepQuality, soreness, recoveryScore } = todayLog;

  const handleSleepHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value);
    calculateAndStore(hours, sleepQuality, soreness);
  };

  const handleSleepQualityChange = (quality: DailyLog['sleepQuality']) => {
    calculateAndStore(sleepHours, quality, soreness);
  };

  const handleSorenessChange = (sore: DailyLog['soreness']) => {
    calculateAndStore(sleepHours, sleepQuality, sore);
  };

  const calculateAndStore = (hours: number, quality: DailyLog['sleepQuality'], sore: DailyLog['soreness']) => {
    // Recovery score calculation algorithm:
    // Sleep Hours: max 10 hours. Target 8 hours = 45 points
    let sleepPoints = (hours / 8) * 45;
    if (sleepPoints > 50) sleepPoints = 50;

    // Sleep Quality: Excellent(30), Good(25), Fair(15), Poor(5)
    let qualityPoints = 15;
    if (quality === 'Excellent') qualityPoints = 30;
    else if (quality === 'Good') qualityPoints = 25;
    else if (quality === 'Fair') qualityPoints = 15;
    else if (quality === 'Poor') qualityPoints = 5;

    // Soreness: None(20), Low(18), Medium(12), High(5)
    let sorenessPoints = 12;
    if (sore === 'None') sorenessPoints = 20;
    else if (sore === 'Low') sorenessPoints = 18;
    else if (sore === 'Medium') sorenessPoints = 12;
    else if (sore === 'High') sorenessPoints = 5;

    const finalRecovery = Math.min(Math.round(sleepPoints + qualityPoints + sorenessPoints), 100);

    onUpdateLog({
      sleepHours: hours,
      sleepQuality: quality,
      soreness: sore,
      recoveryScore: finalRecovery
    });
  };

  const getRecoveryMessage = (score: number) => {
    if (score >= 85) return { text: "CNS primed. Exceed progressive overload targets today.", color: "text-accent" };
    if (score >= 70) return { text: "Optimal state. Follow training plan as scheduled.", color: "text-zinc-300" };
    if (score >= 50) return { text: "Moderate fatigue. Ensure warm-ups are extra thorough.", color: "text-orange-400" };
    return { text: "System fatigue. Consider active recovery or lower weights.", color: "text-red-500" };
  };

  const recoveryMessage = getRecoveryMessage(recoveryScore);

  return (
    <div className="brutalist-card p-6 bg-card-bg border border-card-border">
      <h3 className="text-xl font-mono font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent" />
        Recovery & Sleep Tracker
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          {/* Sleep Hours Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-sm uppercase text-zinc-400 flex items-center gap-2">
                <Moon className="w-4 h-4 text-zinc-500" />
                Sleep Duration
              </span>
              <span className="font-mono font-bold text-accent">{sleepHours} hrs</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={handleSleepHoursChange}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
              <span>4 hrs</span>
              <span>8 hrs (Target)</span>
              <span>12 hrs</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <span className="font-mono text-sm uppercase text-zinc-400 block mb-2">Sleep Quality</span>
            <div className="grid grid-cols-4 gap-2">
              {(['Poor', 'Fair', 'Good', 'Excellent'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSleepQualityChange(q)}
                  className={`py-2 px-1 font-mono text-xs uppercase border transition-all ${
                    sleepQuality === q
                      ? 'border-accent bg-accent text-black font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Soreness */}
          <div>
            <span className="font-mono text-sm uppercase text-zinc-400 block mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-zinc-500" />
              Muscle/Joint Soreness
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['None', 'Low', 'Medium', 'High'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSorenessChange(s)}
                  className={`py-2 px-1 font-mono text-xs uppercase border transition-all ${
                    soreness === s
                      ? 'border-accent bg-accent text-black font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Circular Display of Recovery Score */}
        <div className="flex flex-col items-center justify-center bg-black/40 border border-card-border p-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#18181b"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#a3e635"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * recoveryScore) / 100}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-mono font-black text-white">{recoveryScore}%</span>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Recovery</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 flex items-center justify-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-accent" />
              CNS Status Readiness
            </span>
            <p className={`font-mono text-xs font-bold leading-tight max-w-[200px] ${recoveryMessage.color}`}>
              {recoveryMessage.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
