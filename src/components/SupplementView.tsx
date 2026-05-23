'use client';

import React from 'react';
import { Pill, Activity, Sparkles } from 'lucide-react';
import { DailyLog } from '../types';
import { SUPPLEMENTS_DATA } from '../utils/storage';

interface SupplementViewProps {
  todayLog: DailyLog;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

export default function SupplementView({ todayLog, onUpdateLog }: SupplementViewProps) {
  const handleToggleSupplement = (id: string) => {
    const isChecked = todayLog.supplementsChecked.includes(id);
    let newChecked: string[];
    
    if (isChecked) {
      newChecked = todayLog.supplementsChecked.filter(checkedId => checkedId !== id);
    } else {
      newChecked = [...todayLog.supplementsChecked, id];
    }
    
    onUpdateLog({ supplementsChecked: newChecked });
  };

  const handleAllSupplementsToggle = () => {
    const allIds = SUPPLEMENTS_DATA.map(s => s.id);
    const isAllChecked = allIds.every(id => todayLog.supplementsChecked.includes(id));
    
    onUpdateLog({ supplementsChecked: isAllChecked ? [] : allIds });
  };

  // Group supplements by timing
  const timings = ["Morning", "With Breakfast", "Pre workout", "Post workout"];
  
  const groupedSupps = timings.reduce((acc, time) => {
    acc[time] = SUPPLEMENTS_DATA.filter(s => s.timing.toLowerCase() === time.toLowerCase());
    return acc;
  }, {} as Record<string, typeof SUPPLEMENTS_DATA>);

  // Compute compliance percentage
  const totalCount = SUPPLEMENTS_DATA.length;
  const takenCount = todayLog.supplementsChecked.length;
  const compliancePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent text-black font-bold border border-accent">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-black uppercase tracking-wider">Supplement Stack</h2>
            <p className="text-zinc-500 font-mono text-xs">MICRONUTRIENT & ERGOGENIC DISCIPLINE LOG</p>
          </div>
        </div>

        <button
          onClick={handleAllSupplementsToggle}
          className="bg-black hover:border-accent text-zinc-400 hover:text-white border border-zinc-800 font-mono text-xs uppercase px-4 py-2 transition-all cursor-pointer"
        >
          {compliancePercent === 100 ? "Clear All" : "Log All Taken"}
        </button>
      </div>

      {/* Grid: Timing Sections & Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timing sections */}
        <div className="lg:col-span-2 space-y-6">
          {timings.map((timeSection) => {
            const items = groupedSupps[timeSection] || [];
            if (items.length === 0) return null;

            return (
              <div key={timeSection} className="brutalist-card p-5 bg-card-bg border border-card-border">
                <h3 className="font-mono font-black text-sm uppercase text-accent tracking-wider border-b border-zinc-800 pb-2 mb-3">
                  {timeSection}
                </h3>
                
                <div className="space-y-3">
                  {items.map((item) => {
                    const isTaken = todayLog.supplementsChecked.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleToggleSupplement(item.id)}
                        className={`flex justify-between items-center p-3 bg-black border transition-all cursor-pointer ${
                          isTaken ? 'border-accent/40 bg-zinc-950/20' : 'border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 border transition-all flex items-center justify-center ${
                            isTaken 
                              ? 'border-accent bg-accent text-black font-black text-xs' 
                              : 'border-zinc-700 bg-zinc-900'
                          }`}>
                            {isTaken && "✓"}
                          </div>
                          <div>
                            <span className={`font-mono text-xs uppercase tracking-wide block ${
                              isTaken ? 'text-zinc-500 line-through' : 'text-white'
                            }`}>
                              {item.name}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                              Dosage: {item.dosage}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSupplement(item.id);
                          }}
                          className={`font-mono text-[10px] uppercase border px-3 py-1.5 cursor-pointer transition-all ${
                            isTaken 
                              ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {isTaken ? "TAKEN" : "NOT TAKEN"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Adherence & Details Widget */}
        <div className="space-y-6">
          <div className="brutalist-card p-6 bg-card-bg border border-card-border space-y-6">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Stack Compliance
            </h3>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
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
                    strokeDashoffset={263.89 - (263.89 * compliancePercent) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-mono font-black text-white">{compliancePercent}%</span>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Logged</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="font-mono text-xs text-zinc-400">
                  {takenCount} of {totalCount} supplements taken today
                </p>
              </div>
            </div>
            
            {/* Quick stats details */}
            <div className="space-y-2 border-t border-zinc-800 pt-4">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-500 uppercase">Whey Target</span>
                <span className="text-white">2 scoops (50g protein)</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-500 uppercase">Creatine</span>
                <span className="text-white">5g monohydrate</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-500 uppercase">Vitamins/Omega</span>
                <span className="text-white">Full dosage loaded</span>
              </div>
            </div>
          </div>

          {/* Supplement details panel */}
          <div className="brutalist-card p-6 bg-zinc-950 border border-card-border space-y-4">
            <h3 className="text-md font-mono font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Stack Science Details
            </h3>
            
            <div className="font-mono text-xs space-y-3 leading-relaxed text-zinc-400">
              <p>
                <strong>L-Carnitine (1.5g):</strong> Increases fatty acid transport into the mitochondria. 
                Ingest 30-45 minutes before fasted treadmill walking for elevated lipid oxidisation.
              </p>
              <p>
                <strong>Creatine Monohydrate (5g):</strong> Crucial for maintaining muscular ATP production 
                and cell hydration during high-intensity training under a calorie deficit.
              </p>
              <p>
                <strong>HK Multivitamin + Fish Oil:</strong> Fills micronutrient deficiencies caused 
                by restrictive food intake and maintains cellular structure and joint lubrication.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
