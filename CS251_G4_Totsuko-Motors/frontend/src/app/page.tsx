'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';

export default function Home() {
  const [beStatus, setBeStatus] = useState<'Checking...' | 'Online' | 'Offline'>('Checking...');

  useEffect(() => {
    // ทดสอบยิงไปที่ Health Check ของ Backend
    apiClient.get('/health')
      .then(() => setBeStatus('Online'))
      .catch(() => setBeStatus('Offline'));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 font-sans">
      <main className="flex flex-col items-center gap-8 rounded-2xl border border-black/5 bg-white p-12 shadow-xl dark:bg-zinc-900">
        
        {/* Logo จำลอง */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white shadow-lg">
          T
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            TOTSUKO MOTORS
          </h1>
          <p className="mt-2 text-zinc-500">
            Internal Management System <span className="font-mono text-xs text-zinc-400">v0.1.0</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-zinc-100 pt-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-600">Backend Status:</span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              beStatus === 'Online' ? 'bg-success/10 text-success' : 
              beStatus === 'Offline' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
            }`}>
              {beStatus}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-transform hover:scale-105 active:scale-95">
            Login as Clerk
          </button>
        </div>
      </main>
      
      <footer className="mt-8 text-xs text-zinc-400">
        © 2026 Totsuko Motors Team - CS251 G4
      </footer>
    </div>
  );
}