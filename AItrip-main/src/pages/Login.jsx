import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, ArrowRight, Sparkles } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('aryan.sharma@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/trips/trip-goa-4d');
  };

  return (
    <div className="min-h-screen bg-space-950 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-space-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-sm mx-auto">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase font-sans">
            WELCOME TO AI<span className="text-cyan-400">TRIP</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            ACCESS YOUR AGENTIC TRAVEL OS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-slate-400 font-mono uppercase text-[10px]">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono uppercase text-[10px]">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-space-950 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black tracking-widest uppercase shadow-glow-cyan transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>SIGN IN TO DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-cyan-400 hover:underline font-bold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
