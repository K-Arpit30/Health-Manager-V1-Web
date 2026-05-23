'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during registration";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 tech-grid relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Decorative Operating System tags */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
        PROJECT 18 // SECURITY PROTOCOL INITIALIZATION
      </div>

      <div className="w-full max-w-md brutalist-card p-8 bg-zinc-950/80 backdrop-blur border border-zinc-800 relative z-10 dot-grid">
        {/* Header */}
        <div className="text-center mb-8 border-b border-zinc-900 pb-5">
          <div className="w-12 h-12 border border-accent bg-accent/5 mx-auto flex items-center justify-center mb-4 rounded-none">
            <Flame className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl font-mono font-black uppercase tracking-tighter">
            INITIALIZE <span className="text-accent">BIOCUT</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mt-1">
            75-Day Fat Reduction Command Center
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-500/50 bg-red-950/20 text-red-500 font-mono text-xs uppercase tracking-wide mb-4 text-center">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 border border-accent/50 bg-accent/10 text-accent font-mono text-xs uppercase tracking-wide mb-4 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Bio-metrics Seeded. Access Granted.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase text-zinc-400 block mb-1">Athletes Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Arpit"
              disabled={loading || success}
              className="w-full bg-black border border-zinc-800 p-3 font-mono text-sm focus:border-accent outline-none text-white disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase text-zinc-400 block mb-1">Email Interface</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="arpit@project18.fit"
              disabled={loading || success}
              className="w-full bg-black border border-zinc-800 p-3 font-mono text-sm focus:border-accent outline-none text-white disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase text-zinc-400 block mb-1">Secure Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              disabled={loading || success}
              className="w-full bg-black border border-zinc-800 p-3 font-mono text-sm focus:border-accent outline-none text-white disabled:opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-4 bg-accent text-black font-mono font-black uppercase tracking-wider py-4 border border-accent hover:bg-accent-hover transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? "INITIALISING STACK..." : "BOOT TRANSFORMATION CORE"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6 pt-5 border-t border-zinc-900">
          <span className="font-mono text-xs text-zinc-500 uppercase block">
            Already authorized?{" "}
            <Link href="/login" className="text-accent hover:underline font-bold">
              LOG IN HERE
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
