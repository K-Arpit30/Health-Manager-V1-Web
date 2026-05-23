'use client';

import React, { useState } from 'react';
import { Settings, User, Save, Calculator, Sparkles, Flame } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function SettingsView({ profile, onUpdateProfile }: SettingsViewProps) {
  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mifflin-St Jeor Formula
  // BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5 (for men)
  const bmr = Math.round(10 * form.currentWeight + 6.25 * form.height - 5 * form.age + 5);
  
  // Moderate exercise (lifting 5 days/split) activity multiplier = 1.45
  const maintenance = Math.round(bmr * 1.45);

  const bmi = (form.currentWeight / ((form.height / 100) * (form.height / 100))).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (val < 25) return { label: "Normal", color: "text-accent" };
    if (val < 30) return { label: "Overweight", color: "text-orange-400" };
    return { label: "Obese", color: "text-red-500" };
  };

  const bmiVal = parseFloat(bmi);
  const bmiCategory = getBmiCategory(bmiVal);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent text-black font-bold border border-accent">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-mono font-black uppercase tracking-wider">Configuration Panel</h2>
          <p className="text-zinc-500 font-mono text-xs">RECALIBRATE BIO-TARGETS & NUTRITION BOUNDARIES</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 brutalist-card p-6 bg-card-bg border border-card-border space-y-6">
          <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            Biological Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => setForm({ ...form, height: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.currentWeight}
                onChange={e => setForm({ ...form, currentWeight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.targetWeight}
                onChange={e => setForm({ ...form, targetWeight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Current Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={form.currentBodyFat}
                onChange={e => setForm({ ...form, currentBodyFat: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Target Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={form.targetBodyFat}
                onChange={e => setForm({ ...form, targetBodyFat: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Steps Target</label>
              <input
                type="number"
                value={form.stepsTarget}
                onChange={e => setForm({ ...form, stepsTarget: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
          </div>

          <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 pt-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            Nutritional Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={form.calorieTarget}
                onChange={e => setForm({ ...form, calorieTarget: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={form.proteinTarget}
                onChange={e => setForm({ ...form, proteinTarget: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={form.carbsTarget}
                onChange={e => setForm({ ...form, carbsTarget: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">Fat (g)</label>
              <input
                type="number"
                value={form.fatTarget}
                onChange={e => setForm({ ...form, fatTarget: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            {saveSuccess && (
              <span className="text-accent font-mono text-sm font-bold">✓ Parameters synchronized successfully!</span>
            )}
            <button
              type="submit"
              className="ml-auto bg-accent text-black font-mono font-black uppercase text-sm tracking-wider px-6 py-3 border border-accent hover:bg-accent-hover flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>

        {/* BMR/BMI Calculator Results sidebar */}
        <div className="space-y-6">
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-6">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-accent" />
              Metabolic Summary
            </h3>

            <div className="space-y-4">
              {/* BMI */}
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800">
                <span className="font-mono text-xs text-zinc-400 uppercase">BMI Score</span>
                <div className="text-right">
                  <span className="font-mono font-bold text-white block">{bmi}</span>
                  <span className={`font-mono text-[10px] uppercase font-semibold ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </span>
                </div>
              </div>

              {/* BMR */}
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800">
                <span className="font-mono text-xs text-zinc-400 uppercase">Basal Metabolic Rate</span>
                <span className="font-mono font-bold text-white">{bmr} kcal/day</span>
              </div>

              {/* Maintenance */}
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800">
                <span className="font-mono text-xs text-zinc-400 uppercase">Active Maintenance</span>
                <span className="font-mono font-bold text-accent">{maintenance} kcal/day</span>
              </div>

              {/* Real Deficit calculation */}
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800">
                <span className="font-mono text-xs text-zinc-400 uppercase">Est. Deficit Size</span>
                <span className="font-mono font-bold text-orange-500">
                  -{maintenance - form.calorieTarget} kcal/day
                </span>
              </div>
            </div>
          </div>

          {/* Adaptive Coaching Advice */}
          <div className="brutalist-card p-6 bg-zinc-950 border border-card-border space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl"></div>
            <h3 className="text-md font-mono font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Adaptive Coach Tips
            </h3>
            
            <div className="font-mono text-xs space-y-3 leading-relaxed text-zinc-400">
              <p>
                <strong>Muscle Retention Warning:</strong> Your target fat loss rate is aggressive. 
                Keep protein intake high at <span className="text-white font-bold">{form.proteinTarget}g</span>. 
                Do not drop calories below 1800 kcal to prevent systemic muscle catabolism.
              </p>
              <p>
                <strong>Progressive Deficit Shift:</strong> If your weight loss stalls for more than 7 days, 
                increase daily cardio steps by <span className="text-accent">+1,000 steps</span> rather than dropping calories. 
                This keeps thyroid hormones (T3/T4) active.
              </p>
              <p>
                <strong>Refeed Strategy:</strong> On Day 25, 50, and 75, consider a 24-hour carbohydrate refeed, 
                raising calories to maintenance (<span className="text-white font-bold">{maintenance} kcal</span>) 
                while keeping protein identical, to replenish intramuscular glycogen stores.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
