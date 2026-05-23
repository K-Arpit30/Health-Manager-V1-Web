'use client';

import React, { useState } from 'react';
import { ShieldAlert, Flame, Calendar, Award } from 'lucide-react';
import { UserProfile, DailyLog } from '../types';

interface MotivationPanelProps {
  profile: UserProfile;
  todayLog: DailyLog;
}

const DISCIPLINE_QUOTES = [
  "Discipline is doing what needs to be done, even when you don't feel like it.",
  "Your body is a reflection of your choices. Choose muscle over comfort.",
  "Pain is temporary. Fat loss is mathematical. Stick to the numbers.",
  "Excuses don't burn calories. Lift the weight. Eat the chicken. Walk the steps.",
  "75 days is nothing compared to a lifetime of feeling average.",
  "The mirror will never lie to you. The scale will challenge you. Keep going.",
  "Aggressive deficit requires aggressive discipline. Do not yield.",
  "You've been lifting for 3 years. Don't let 30% body fat hide your hard work.",
];

export default function MotivationPanel({ profile, todayLog }: MotivationPanelProps) {
  const [quote] = useState(() => {
    const dayIndex = profile.currentDayNum % DISCIPLINE_QUOTES.length;
    return DISCIPLINE_QUOTES[dayIndex];
  });

  return (
    <div className="brutalist-card p-6 bg-card-bg border border-card-border relative overflow-hidden dot-grid">
      <div className="absolute top-0 right-0 bg-accent text-black font-mono text-xs px-3 py-1 font-bold tracking-wider uppercase">
        System Status: Operational
      </div>

      <h3 className="text-xl font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-accent" />
        Motivation & Discipline Engine
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Days Survived Widget */}
        <div className="bg-black/50 border border-card-border p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs uppercase">
            <span>Progress Phase</span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <span className="text-4xl font-mono font-black text-white">{profile.currentDayNum}</span>
            <span className="text-zinc-500 font-mono text-sm"> / 75 DAYS</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 mt-3">
            <div 
              className="bg-accent h-1.5 transition-all duration-500" 
              style={{ width: `${(profile.currentDayNum / 75) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            {75 - profile.currentDayNum} Days Remaining to Target 18% BF
          </span>
        </div>

        {/* Adherence Score */}
        <div className="bg-black/50 border border-card-border p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 font-mono text-xs uppercase">
            <span>Today&apos;s Adherence</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2">
            <span className="text-4xl font-mono font-black text-accent">{todayLog.adherenceScore}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 mt-3">
            <div 
              className="bg-accent h-1.5 transition-all duration-500" 
              style={{ width: `${todayLog.adherenceScore}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            Maintain &gt;85% to prevent muscle loss
          </span>
        </div>

        {/* Alert Ticker */}
        <div className="bg-black/50 border border-card-border p-4 flex flex-col justify-between">
          <div className="text-zinc-500 font-mono text-xs uppercase">Discipline Directives</div>
          <div className="mt-2 font-mono text-sm leading-tight text-zinc-300">
            {todayLog.steps < profile.stepsTarget ? (
              <span className="text-orange-500 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Steps below target. Walk!
              </span>
            ) : (
              <span className="text-accent flex items-center gap-1.5">
                ✓ Steps target secured.
              </span>
            )}
            <div className="mt-1">
              {!todayLog.workoutCompleted && profile.currentDayNum % 7 !== 0 && profile.currentDayNum % 7 !== 6 ? (
                <span className="text-orange-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  Lift weights today. No excuses.
                </span>
              ) : (
                <span className="text-accent flex items-center gap-1.5">
                  ✓ Lift target completed/rest.
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            Status: {todayLog.adherenceScore >= 85 ? "Elite Athlete" : "Needs Execution"}
          </span>
        </div>
      </div>

      <div className="p-4 border-l-2 border-accent bg-zinc-900/50">
        <p className="font-mono text-sm italic text-zinc-300">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
