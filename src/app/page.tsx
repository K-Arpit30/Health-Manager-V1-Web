'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ChefHat, 
  Pill, 
  Dumbbell, 
  Footprints, 
  Camera, 
  TrendingDown, 
  Settings, 
  Sparkles, 
  Calendar,
  LogOut
} from 'lucide-react';
import { UserProfile, DailyLog, ProgressPhoto } from '../types';
import { 
  getLogForDate, 
  saveLogForDate 
} from '../utils/storage';

// Import Views
import DashboardView from '../components/DashboardView';
import DietView from '../components/DietView';
import SupplementView from '../components/SupplementView';
import WorkoutView from '../components/WorkoutView';
import CardioView from '../components/CardioView';
import PhotosView from '../components/PhotosView';
import AnalyticsView from '../components/AnalyticsView';
import SettingsView from '../components/SettingsView';
import RecoveryPanel from '../components/RecoveryPanel';
import MotivationPanel from '../components/MotivationPanel';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInWeight, setCheckInWeight] = useState('');
  const [checkInFat, setCheckInFat] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync state changes with local cache & server DB
  const syncData = useCallback(async (updatedProfile: UserProfile, updatedLogs: DailyLog[], updatedPhotos: ProgressPhoto[]) => {
    try {
      // Sync local storage
      localStorage.setItem('p18_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('p18_daily_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('p18_photos', JSON.stringify(updatedPhotos));

      // Sync server DB
      await fetch('/api/user/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: updatedProfile,
          dailyLogs: updatedLogs,
          photos: updatedPhotos
        })
      });
    } catch (e) {
      console.error("Failed to sync biomechanics data with server", e);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/data');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error("Failed to load bio telemetry");
      
      const store = await res.json();
      
      // Cache server data locally
      localStorage.setItem('p18_profile', JSON.stringify(store.profile));
      localStorage.setItem('p18_daily_logs', JSON.stringify(store.dailyLogs));
      localStorage.setItem('p18_photos', JSON.stringify(store.photos));

      setProfile(store.profile);
      setDailyLogs(store.dailyLogs);
      setPhotos(store.photos);

      // Initialize or retrieve today's log
      const todayStr = new Date().toISOString().split('T')[0];
      const matchedLog = store.dailyLogs.find((l: DailyLog) => l.date === todayStr);

      if (matchedLog) {
        setTodayLog(matchedLog);
      } else {
        // Setup today's log inside the DB
        const blankLog = getLogForDate(todayStr, store.profile.currentWeight, store.profile.currentBodyFat);
        setTodayLog(blankLog);
        
        // Save initial empty log to the server
        const updatedLogs = [...store.dailyLogs, blankLog];
        await syncData(store.profile, updatedLogs, store.photos);
      }

      // Check-in popup prompt demo on day 12
      if (store.profile.currentDayNum === 12 && !localStorage.getItem('p18_checkin_12_prompted')) {
        setCheckInWeight(store.profile.currentWeight.toString());
        setCheckInFat(store.profile.currentBodyFat.toString());
        setShowCheckIn(true);
        localStorage.setItem('p18_checkin_12_prompted', 'true');
      }

    } catch (e) {
      console.error(e);
      // fallback to offline local storage if server load fails
      const p = localStorage.getItem('p18_profile');
      if (p) {
        const parsedProfile = JSON.parse(p);
        setProfile(parsedProfile);
        const todayStr = new Date().toISOString().split('T')[0];
        setTodayLog(getLogForDate(todayStr, parsedProfile.currentWeight, parsedProfile.currentBodyFat));
      }
    } finally {
      setLoading(false);
    }
  }, [router, syncData]);

  // Authenticate & Load session data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const timer = setTimeout(() => {
        fetchUserData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, router, fetchUserData]);

  const handleUpdateTodayLog = async (updates: Partial<DailyLog>) => {
    if (!todayLog || !profile) return;
    const updatedLog = { ...todayLog, ...updates };
    setTodayLog(updatedLog);

    // Save and calculate adherence
    saveLogForDate(todayLog.date, updatedLog);
    const cachedLogsStr = localStorage.getItem('p18_daily_logs');
    const cachedLogs = cachedLogsStr ? JSON.parse(cachedLogsStr) : [];
    
    // Update local list
    const updatedList = cachedLogs.map((l: DailyLog) => l.date === todayLog.date ? updatedLog : l);
    setDailyLogs(updatedList);

    await syncData(profile, updatedList, photos);
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    await syncData(updatedProfile, dailyLogs, photos);
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !todayLog) return;

    const w = parseFloat(checkInWeight) || profile.currentWeight;
    const f = parseFloat(checkInFat) || profile.currentBodyFat;

    const updatedProfile = {
      ...profile,
      currentWeight: w,
      currentBodyFat: f,
      currentDayNum: Math.min(profile.currentDayNum + 1, 75)
    };
    setProfile(updatedProfile);

    const updatedLog = {
      ...todayLog,
      weight: w,
      bodyFat: f
    };
    setTodayLog(updatedLog);

    // Update in logs list
    const updatedList = dailyLogs.map(l => l.date === todayLog.date ? updatedLog : l);
    setDailyLogs(updatedList);

    await syncData(updatedProfile, updatedList, photos);
    setShowCheckIn(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Loading Screen
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-zinc-500 tech-grid">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-accent glow-accent">SYNCHRONISING SYSTEM TELEMETRY...</span>
      </div>
    );
  }

  if (!profile || !todayLog) return null;

  const navItems = [
    { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
    { id: 'diet', label: 'Diet & Hydration', icon: ChefHat },
    { id: 'workout', label: 'Lifting Split', icon: Dumbbell },
    { id: 'cardio', label: 'Cardio & Steps', icon: Footprints },
    { id: 'supps', label: 'Supplement Stack', icon: Pill },
    { id: 'photos', label: 'Photos Log', icon: Camera },
    { id: 'analytics', label: 'Analytics', icon: TrendingDown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-foreground font-sans tech-grid flex flex-col lg:flex-row scanlines">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-900 bg-card-bg shrink-0">
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Transformation OS</span>
            <span className="font-mono font-black text-xl text-white tracking-tighter">PROJECT 18</span>
          </div>
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
        </div>

        {/* User Mini Profile */}
        <div className="p-5 border-b border-zinc-900 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center font-mono font-bold text-accent text-sm">
              AR
            </div>
            <div>
              <span className="font-mono font-bold text-xs block text-white">{profile.name}</span>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">
                Day {profile.currentDayNum} of 75 • {profile.currentWeight}kg
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 font-mono text-xs uppercase transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-accent text-black font-black border-accent'
                    : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-800'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-zinc-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-black font-mono text-xs uppercase font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock System</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        
        {/* Top bar */}
        <header className="border-b border-zinc-900 bg-card-bg/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="lg:hidden flex flex-col">
            <span className="font-mono font-black text-sm text-white tracking-tighter">PROJECT 18</span>
            <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider">Day {profile.currentDayNum}/75</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>SECURE PHYSIC TRANSFORMATION SUITE</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCheckIn(true)}
              className="bg-accent/10 hover:bg-accent/25 border border-accent/30 text-accent font-mono text-[10px] font-bold uppercase px-3 py-1.5 transition-all cursor-pointer"
            >
              Check-In
            </button>
            <button 
              onClick={handleLogout}
              className="lg:hidden p-1.5 border border-zinc-800 text-zinc-400 hover:text-white"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
          
          {/* Active view renderer */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <DashboardView profile={profile} todayLog={todayLog} onNavigate={setActiveTab} />
              <MotivationPanel profile={profile} todayLog={todayLog} />
              <RecoveryPanel todayLog={todayLog} onUpdateLog={handleUpdateTodayLog} />
            </div>
          )}

          {activeTab === 'diet' && (
            <DietView todayLog={todayLog} profile={profile} onUpdateLog={handleUpdateTodayLog} />
          )}

          {activeTab === 'workout' && (
            <div className="space-y-6">
              <WorkoutView todayLog={todayLog} onUpdateLog={handleUpdateTodayLog} />
              <RecoveryPanel todayLog={todayLog} onUpdateLog={handleUpdateTodayLog} />
            </div>
          )}

          {activeTab === 'cardio' && (
            <CardioView todayLog={todayLog} profile={profile} onUpdateLog={handleUpdateTodayLog} />
          )}

          {activeTab === 'supps' && (
            <SupplementView todayLog={todayLog} onUpdateLog={handleUpdateTodayLog} />
          )}

          {activeTab === 'photos' && (
            <PhotosView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView profile={profile} />
          )}

          {activeTab === 'settings' && (
            <SettingsView profile={profile} onUpdateProfile={handleUpdateProfile} />
          )}

        </div>
      </main>

      {/* Bottom Nav Bar for Mobile viewport */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-card-bg/95 backdrop-blur-md py-2 px-3 flex justify-around items-center z-40">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 transition-all relative ${
                isActive ? 'text-accent' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-mono text-[8px] uppercase tracking-wider mt-1">{item.label.split(' ')[0]}</span>
              {isActive && <div className="absolute top-0 w-8 h-0.5 bg-accent" />}
            </button>
          );
        })}
      </nav>

      {/* Weekly Check-in Popup Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md brutalist-card p-6 bg-card-bg border border-accent relative dot-grid">
            <h3 className="text-xl font-mono font-black uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Weekly Bio Check-In
            </h3>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-900 pb-3 mb-4">
              Sync weight logs & adjust calibration targets
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">
                  Today&apos;s Body Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={checkInWeight}
                  onChange={e => setCheckInWeight(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase text-zinc-400 block mb-1">
                  Estimated Body Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={checkInFat}
                  onChange={e => setCheckInFat(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2.5 font-mono text-sm focus:border-accent outline-none text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckIn(false)}
                  className="w-1/2 py-3 border border-zinc-800 bg-black hover:border-zinc-700 font-mono text-xs uppercase text-zinc-400 cursor-pointer transition-all"
                >
                  Postpone
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-accent text-black font-mono font-black text-xs uppercase tracking-wider border border-accent hover:bg-accent-hover cursor-pointer transition-all"
                >
                  Log check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
