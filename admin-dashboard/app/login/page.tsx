'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../../lib/types';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock Login Bypass for Testing UI
      if (email === 'superadmin@gmail.com') {
        login('fake-token', { id: 1, email, name: 'System Super Admin', role: Role.SUPER_ADMIN, branchId: null });
        return;
      } else if (email === 'admin@gmail.com') {
        login('fake-token', { id: 2, email, name: 'Regional Admin', role: Role.ADMIN, branchId: null });
        return;
      } else if (email === 'stationadmin@gmail.com') {
        login('fake-token', { id: 3, email, name: 'Yaounde Station Admin', role: Role.STATION_ADMIN, branchId: 1, branchName: 'Yaounde Central' });
        return;
      } else if (email === 'stationmanager@gmail.com') {
        login('fake-token', { id: 4, email, name: 'Yaounde Station Manager', role: Role.STATION_MANAGER, branchId: 1, branchName: 'Yaounde Central' });
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to EcoLink servers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex text-[#21261F] overflow-hidden select-none">
      
      {/* LEFT SIDE: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#F4EFE6] relative z-10">
        
        {/* Header Logo - ENLARGED */}
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="EcoLink" className="h-20 w-auto object-contain drop-shadow-sm" />
          </div>
          <p className="text-[#C4693C] font-space text-sm font-bold tracking-wide mt-2">
            "Report waste, see it through"
          </p>
        </div>

        {/* Center Form Box */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-fraunces font-bold text-[#121A15] tracking-tight mb-2">
              Command Portal Sign In
            </h1>
            <p className="text-[#7A8272] text-xs font-space">
              Enter your account credentials to access operational dispatch.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-xl mb-6 text-xs font-space flex items-center gap-2.5 animate-fade-slide-up">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#7A8272] uppercase tracking-wider mb-2 font-space">
                Work Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E4DDCE] rounded-xl px-4 py-3.5 text-sm text-[#21261F] font-space focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 focus:border-[#2F4B3C] transition-all shadow-xs"
                placeholder="name@ecolink.cm"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A8272] uppercase tracking-wider mb-2 font-space">
                Security Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E4DDCE] rounded-xl pl-4 pr-12 py-3.5 text-sm text-[#21261F] font-space focus:outline-none focus:ring-2 focus:ring-[#2F4B3C]/20 focus:border-[#2F4B3C] transition-all shadow-xs"
                  placeholder="••••••••"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A8272] hover:text-[#2F4B3C] transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2F4B3C] hover:bg-[#233A2E] text-white font-bold font-space py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Clean Footer */}
        <div className="text-xs text-[#7A8272] font-mono">
          EcoLink Platform
        </div>
      </div>

      {/* RIGHT SIDE: Environmental Showcase Hero with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-cover bg-center p-12" style={{ backgroundImage: "url('/login-bg.jpg')" }}>
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121A15]/90 via-[#121A15]/60 to-[#121A15]/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10"></div>

        {/* Hero Middle Content - ENLARGED ECOLINK */}
        <div className="relative z-10 max-w-xl mx-auto my-auto text-center space-y-6">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight font-fraunces drop-shadow-lg">
            <span className="text-[#81C784]">Eco</span>
            <span className="text-[#FF8A65]">Link</span>
          </h1>

          <blockquote className="font-fraunces text-2xl sm:text-3xl font-bold text-white leading-snug drop-shadow-md">
            "Report waste, see it through"
          </blockquote>

          <p className="text-[#E4DDCE] text-base font-space leading-relaxed drop-shadow-sm max-w-md mx-auto">
            Connecting citizens, station administrators, and field collection agents all over Cameroon in one seamless platform.
          </p>
        </div>

        {/* Clean Hero Footer */}
        <div className="relative z-10 text-center text-xs text-[#E4DDCE]/80 font-mono">
          Clean City Initiative • Municipal Operations
        </div>
      </div>

    </div>
  );
}
