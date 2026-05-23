'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Sliders, Upload, BrainCircuit } from 'lucide-react';
import { ProgressPhoto } from '../types';
import { getPhotos, updatePhotos } from '../utils/storage';

interface AiVisionInsight {
  timestamp: string;
  definition: string;
  fatDistribution: string;
  posture: string;
  readinessScore: number;
  recommendations: string;
}

export default function PhotosView() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [uploadType, setUploadType] = useState<'front' | 'side' | 'back'>('front');
  
  // AI analysis states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AiVisionInsight | null>(null);

  useEffect(() => {
    const loadedPhotos = getPhotos();
    setTimeout(() => {
      setPhotos(loadedPhotos);
      if (loadedPhotos.length > 0) {
        setBeforeIdx(0);
        setAfterIdx(loadedPhotos.length - 1);
      }
    }, 0);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Trigger AI Analysis API Call
      setAiLoading(true);
      setAiInsights(null);
      
      try {
        const aiRes = await fetch('/api/image-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String, poseType: uploadType })
        });
        
        const aiData = await aiRes.json();
        if (aiRes.ok && aiData.success) {
          setAiInsights(aiData.insights);
        }
      } catch (err) {
        console.error("AI photo analysis error", err);
      } finally {
        setAiLoading(false);
      }

      // Save photo to state & localStorage
      const updated = [...photos];
      const existingIdx = updated.findIndex(p => p.date === todayStr);

      if (existingIdx !== -1) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          [uploadType]: base64String
        };
      } else {
        updated.push({
          date: todayStr,
          [uploadType]: base64String
        });
      }

      setPhotos(updated);
      updatePhotos(updated);
      
      // Update indexes to latest
      setBeforeIdx(0);
      setAfterIdx(updated.length - 1);
    };
    reader.readAsDataURL(file);
  };

  const getActivePhoto = (index: number, type: 'front' | 'side' | 'back'): string | null => {
    const photo = photos[index];
    if (!photo) return null;
    return photo[type] || null;
  };

  const beforeImg = getActivePhoto(beforeIdx, uploadType);
  const afterImg = getActivePhoto(afterIdx, uploadType);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-5">
        <div className="p-2.5 bg-accent text-black font-bold border-2 border-accent">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-mono font-black uppercase tracking-wider">Progress Photos</h2>
          <p className="text-zinc-500 font-mono text-xs">VISUAL EVIDENCE & TRANSFORMATION ARCHIVE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Upload controls & AI Insights */}
        <div className="space-y-6">
          
          {/* Upload card */}
          <div className="brutalist-card p-6 bg-card-bg border-2 border-card-border space-y-6">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider border-b border-zinc-900 pb-2">
              Upload Pose
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-2">Pose Target</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['front', 'side', 'back'] as const).map(pose => (
                    <button
                      key={pose}
                      type="button"
                      onClick={() => setUploadType(pose)}
                      className={`py-2 px-1 font-mono text-xs uppercase border-2 cursor-pointer transition-all ${
                        uploadType === pose
                          ? 'border-accent bg-accent text-black font-bold'
                          : 'border-zinc-900 bg-black text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      {pose}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload trigger */}
              <label className="border-2 border-dashed border-zinc-850 hover:border-accent bg-black p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-zinc-700 group-hover:text-accent transition-colors" />
                <span className="font-mono text-xs uppercase text-zinc-400 font-bold">
                  Select Photo to Upload
                </span>
                <span className="font-mono text-[9px] text-zinc-650 uppercase tracking-wider">
                  Target pose: {uploadType}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={aiLoading}
                />
              </label>

              {/* Comparison log selectors */}
              {photos.length > 1 && (
                <div className="space-y-3 pt-4 border-t border-zinc-900">
                  <span className="font-mono text-xs uppercase text-zinc-500 block">Compare Timelines</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-mono text-[9px] text-zinc-650 uppercase block mb-1">Before Log</label>
                      <select
                        value={beforeIdx}
                        onChange={e => setBeforeIdx(parseInt(e.target.value))}
                        className="w-full bg-black border-2 border-zinc-900 text-xs font-mono p-2 text-white outline-none focus:border-accent"
                      >
                        {photos.map((p, idx) => (
                          <option key={idx} value={idx}>
                            Day {idx * 7 + 1} ({p.date})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[9px] text-zinc-650 uppercase block mb-1">After Log</label>
                      <select
                        value={afterIdx}
                        onChange={e => setAfterIdx(parseInt(e.target.value))}
                        className="w-full bg-black border-2 border-zinc-900 text-xs font-mono p-2 text-white outline-none focus:border-accent"
                      >
                        {photos.map((p, idx) => (
                          <option key={idx} value={idx}>
                            Day {idx * 7 + 1} ({p.date})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Physique Diagnostics Box */}
          {(aiLoading || aiInsights) && (
            <div className="brutalist-card p-6 bg-card-bg border-2 border-accent-blue space-y-4 dot-grid">
              <h3 className="text-md font-mono font-black uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2 text-accent-blue">
                <BrainCircuit className="w-5 h-5 text-accent-blue animate-pulse" />
                AI Physique Diagnostics
              </h3>

              {aiLoading ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent animate-spin mx-auto" />
                  <p className="font-mono text-xs uppercase text-zinc-500 tracking-wider">
                    SCANNING LIPID DISPERSION & SCAPULAR SYMMETRY...
                  </p>
                </div>
              ) : (
                aiInsights && (
                  <div className="font-mono text-xs space-y-4 leading-relaxed text-zinc-400">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="text-[10px] text-zinc-500 uppercase">Analysis Profile</span>
                      <span className="text-accent font-bold uppercase">{uploadType} pose</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-white uppercase font-bold block">1. Muscle Definition</span>
                      <p className="text-zinc-400 leading-normal">{aiInsights.definition}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-white uppercase font-bold block">2. Fat Distribution</span>
                      <p className="text-zinc-400 leading-normal">{aiInsights.fatDistribution}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-white uppercase font-bold block">3. Postural Alignment</span>
                      <p className="text-zinc-400 leading-normal">{aiInsights.posture}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-900 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 uppercase">Physique Readiness</span>
                        <span className="text-accent-blue font-bold">{aiInsights.readinessScore}%</span>
                      </div>
                      <div className="p-2.5 bg-black border border-accent-blue/35 text-[10px] text-accent-blue leading-normal">
                        <span className="font-bold block uppercase mb-0.5">Directive Suggestion:</span>
                        {aiInsights.recommendations}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Right Col: Comparison Slider Display */}
        <div className="lg:col-span-2 brutalist-card p-6 bg-card-bg border-2 border-card-border flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
            <h3 className="text-lg font-mono font-bold uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent" />
              Wipe Comparison Slider
            </h3>
            <span className="font-mono text-xs uppercase text-zinc-500">
              Pose: <span className="text-accent font-bold">{uploadType}</span>
            </span>
          </div>

          {/* Wipe slider component */}
          {beforeImg && afterImg ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-[400px] h-[500px] border-2 border-zinc-900 bg-zinc-950 overflow-hidden select-none">
                
                {/* Background image (Before / Left) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={beforeImg} 
                  alt="Before Log" 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                
                {/* Foreground image container (After / Right) with dynamic width */}
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-accent" 
                  style={{ width: `${sliderPos}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={afterImg} 
                    alt="After Log" 
                    className="absolute inset-0 w-[400px] h-[500px] max-w-none object-cover"
                  />
                </div>

                {/* Overlay Text Tags */}
                <div className="absolute bottom-4 left-4 bg-black/85 border border-zinc-900 px-2 py-1 font-mono text-[9px] uppercase font-bold text-white z-10">
                  Before: {photos[beforeIdx]?.date}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/85 border border-accent/40 px-2 py-1 font-mono text-[9px] uppercase font-bold text-accent z-10">
                  After: {photos[afterIdx]?.date}
                </div>

                {/* Slider Input overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={e => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Center Handle details */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-accent pointer-events-none z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent text-black font-bold p-1.5 border border-black shadow-lg rounded-full text-xs">
                    ↔
                  </div>
                </div>
              </div>
              <p className="font-mono text-zinc-650 text-[10px] text-center uppercase tracking-widest leading-normal max-w-sm">
                Swipe image left/right to wipe between before and after progress photos
              </p>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-zinc-900 bg-black text-center p-6 gap-3">
              <ImageIcon className="w-12 h-12 text-zinc-800" />
              <div className="font-mono">
                <span className="text-sm font-bold text-zinc-500 block uppercase">Awaiting Image Uploads</span>
                <span className="text-[10px] text-zinc-600 block uppercase max-w-xs mt-1">
                  Upload photos of this pose to unlock the comparison slider and AI vision diagnostics.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
