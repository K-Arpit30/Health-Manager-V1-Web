'use client';

import React, { useState } from 'react';
import { ChefHat, Flame, Droplet, Clock } from 'lucide-react';
import { DailyLog, UserProfile } from '../types';
import { MEALS_DATA } from '../utils/storage';

interface DietViewProps {
  todayLog: DailyLog;
  profile: UserProfile;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

export default function DietView({ todayLog, profile, onUpdateLog }: DietViewProps) {
  const [mealTimes, setMealTimes] = useState<Record<string, string>>({
    breakfast: "08:30 AM",
    egg_meal: "11:30 AM",
    lunch: "02:00 PM",
    post_workout: "06:30 PM",
    dinner: "09:00 PM",
  });
  
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");

  const handleMealCheck = (itemId: string) => {
    const isChecked = todayLog.mealsChecked.includes(itemId);
    let newChecked: string[];
    if (isChecked) {
      newChecked = todayLog.mealsChecked.filter(id => id !== itemId);
    } else {
      newChecked = [...todayLog.mealsChecked, itemId];
    }
    onUpdateLog({ mealsChecked: newChecked });
  };

  const handleAllMealToggle = (mealSectionId: string, itemIds: string[]) => {
    const allChecked = itemIds.every(id => todayLog.mealsChecked.includes(id));
    let newChecked = [...todayLog.mealsChecked];
    
    if (allChecked) {
      newChecked = newChecked.filter(id => !itemIds.includes(id));
    } else {
      itemIds.forEach(id => {
        if (!newChecked.includes(id)) {
          newChecked.push(id);
        }
      });
    }
    onUpdateLog({ mealsChecked: newChecked });
  };

  // Add water intake helper
  const addWater = (amount: number) => {
    onUpdateLog({ waterIntake: Math.max(0, todayLog.waterIntake + amount) });
  };

  // Save meal timing changes
  const saveMealTime = (sectionId: string) => {
    if (tempTime) {
      setMealTimes(prev => ({ ...prev, [sectionId]: tempTime }));
    }
    setEditingTimeId(null);
  };

  // Calculate actual consumed macros
  let consumedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFat = 0;

  MEALS_DATA.forEach(section => {
    section.items.forEach(item => {
      if (todayLog.mealsChecked.includes(item.id)) {
        consumedCalories += item.calories;
        consumedProtein += item.protein;
        consumedCarbs += item.carbs;
        consumedFat += item.fat;
      }
    });
  });

  consumedCalories = Math.round(consumedCalories);
  consumedProtein = Math.round(consumedProtein);
  consumedCarbs = Math.round(consumedCarbs);
  consumedFat = Math.round(consumedFat);

  // Calculate percentages
  const calPercent = Math.min((consumedCalories / profile.calorieTarget) * 100, 100);
  const protPercent = Math.min((consumedProtein / profile.proteinTarget) * 100, 100);
  const carbsPercent = Math.min((consumedCarbs / profile.carbsTarget) * 100, 100);
  const fatPercent = Math.min((consumedFat / profile.fatTarget) * 100, 100);
  const waterPercent = Math.min((todayLog.waterIntake / profile.waterTarget) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent text-black font-bold border border-accent">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-mono font-black uppercase tracking-wider">Nutrition & Diet Log</h2>
          <p className="text-zinc-500 font-mono text-xs">AGGRESSIVE LIPOLYSIS MEAL PLAN & MACRO MATRIX</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Meals Plan */}
        <div className="lg:col-span-2 space-y-6">
          {MEALS_DATA.map((section) => {
            const sectionItemIds = section.items.map(i => i.id);
            const allChecked = sectionItemIds.every(id => todayLog.mealsChecked.includes(id));
            const sectionTime = mealTimes[section.id] || section.time;

            return (
              <div 
                key={section.id} 
                className={`brutalist-card p-5 bg-card-bg border transition-all ${
                  allChecked ? 'border-accent/40 bg-zinc-950/60' : 'border-card-border'
                }`}
              >
                {/* Section Header */}
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleAllMealToggle(section.id, sectionItemIds)}
                      className={`w-5 h-5 border transition-all cursor-pointer flex items-center justify-center ${
                        allChecked 
                          ? 'border-accent bg-accent text-black font-bold text-xs' 
                          : 'border-zinc-700 bg-black hover:border-accent'
                      }`}
                    >
                      {allChecked && "✓"}
                    </button>
                    <div>
                      <h3 className="font-mono font-black text-sm uppercase text-white tracking-wider">
                        {section.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Timing editor */}
                  <div className="flex items-center gap-1 text-zinc-500 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {editingTimeId === section.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempTime}
                          onChange={(e) => setTempTime(e.target.value)}
                          placeholder="e.g. 08:30 AM"
                          className="bg-black border border-zinc-850 px-1 py-0.5 text-[10px] w-20 text-white outline-none focus:border-accent"
                        />
                        <button 
                          onClick={() => saveMealTime(section.id)}
                          className="text-accent hover:text-white text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => {
                          setEditingTimeId(section.id);
                          setTempTime(sectionTime);
                        }}
                        className="cursor-pointer hover:text-accent transition-colors"
                      >
                        {sectionTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section Items */}
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const itemChecked = todayLog.mealsChecked.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`flex justify-between items-center p-3 bg-black border transition-all ${
                          itemChecked ? 'border-accent/40 bg-zinc-950/20' : 'border-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={itemChecked}
                            onChange={() => handleMealCheck(item.id)}
                            className="w-4.5 h-4.5 accent-accent cursor-pointer rounded-none bg-zinc-900 border-zinc-700 focus:ring-0"
                          />
                          <div>
                            <span className={`font-mono text-xs uppercase tracking-wide block ${
                              itemChecked ? 'text-zinc-500 line-through' : 'text-white'
                            }`}>
                              {item.name}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                              Portion: {item.portion}
                            </span>
                          </div>
                        </div>

                        {/* Item Macros info */}
                        <div className="text-right font-mono text-[10px] text-zinc-400">
                          <span className="text-white font-semibold">{item.calories} kcal</span>
                          <span className="mx-1 text-zinc-700">|</span>
                          <span>P: {item.protein}g</span>
                          <span className="mx-1 text-zinc-700">|</span>
                          <span>C: {item.carbs}g</span>
                          <span className="mx-1 text-zinc-700">|</span>
                          <span>F: {item.fat}g</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Macro Totals & Hydration */}
        <div className="space-y-6">
          
          {/* Macro Progress Metrics */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-6">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              Nutritional Aggregates
            </h3>

            <div className="space-y-4">
              {/* Calories */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-400 uppercase">Calories Logged</span>
                  <span className="font-bold text-white">
                    {consumedCalories} <span className="text-zinc-500">/ {profile.calorieTarget} kcal</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 border border-zinc-850">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      consumedCalories > profile.calorieTarget ? 'bg-red-500' : 'bg-accent'
                    }`} 
                    style={{ width: `${calPercent}%` }}
                  />
                </div>
                {consumedCalories > profile.calorieTarget && (
                  <span className="text-[10px] font-mono text-red-500 mt-1 block font-bold uppercase tracking-wider">
                    ⚠️ Calorie target exceeded! Excess: {consumedCalories - profile.calorieTarget} kcal
                  </span>
                )}
              </div>

              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-400 uppercase">Protein (Muscle retention)</span>
                  <span className="font-bold text-white">
                    {consumedProtein}g <span className="text-zinc-500">/ {profile.proteinTarget}g</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 border border-zinc-850">
                  <div 
                    className="h-full bg-accent transition-all duration-300" 
                    style={{ width: `${protPercent}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-400 uppercase">Carbohydrates</span>
                  <span className="font-bold text-white">
                    {consumedCarbs}g <span className="text-zinc-500">/ {profile.carbsTarget}g</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 border border-zinc-850">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${carbsPercent}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-400 uppercase">Fats (Hormonal balance)</span>
                  <span className="font-bold text-white">
                    {consumedFat}g <span className="text-zinc-500">/ {profile.fatTarget}g</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 border border-zinc-850">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300" 
                    style={{ width: `${fatPercent}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Macro Tip */}
            <div className="p-3 bg-black border border-zinc-850 font-mono text-[10px] text-zinc-500 leading-tight">
              <span className="text-accent font-bold uppercase block mb-1">Coach Note:</span>
              Keep carbs minimal at dinner. This promotes overnight lipolysis and glycogen depletion.
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-6">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-accent" />
              Hydration Chamber
            </h3>

            {/* Visual Glass level */}
            <div className="flex items-center gap-6">
              <div className="relative w-16 h-36 border-2 border-zinc-800 bg-black flex items-end p-0.5 overflow-hidden">
                {/* Water overlay */}
                <div 
                  className="w-full bg-accent/80 border-t-2 border-accent transition-all duration-700"
                  style={{ height: `${waterPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-mono text-xs font-black text-white mix-blend-difference">
                    {waterPercent.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="font-mono">
                  <span className="text-zinc-400 text-xs uppercase block">Consumed Vol</span>
                  <span className="text-2xl font-black text-white">
                    {todayLog.waterIntake} <span className="text-xs text-zinc-500">/ {profile.waterTarget} ml</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addWater(250)}
                    className="py-2 border border-zinc-800 bg-black hover:border-accent font-mono text-xs text-white transition-all cursor-pointer"
                  >
                    +250ml Glass
                  </button>
                  <button
                    onClick={() => addWater(500)}
                    className="py-2 border border-zinc-800 bg-black hover:border-accent font-mono text-xs text-white transition-all cursor-pointer"
                  >
                    +500ml Shaker
                  </button>
                </div>
                
                <button
                  onClick={() => onUpdateLog({ waterIntake: 0 })}
                  className="w-full py-1 text-center font-mono text-[9px] text-zinc-600 hover:text-red-500 uppercase tracking-widest"
                >
                  Reset Hydration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
