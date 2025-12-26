
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.ts';
import { UserRole } from '../../types.ts';

const Register: React.FC = () => {
  const [step, setStep] = useState<'FORM' | 'VERIFY'>('FORM');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.READER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification States
  const [verificationCode, setVerificationCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [showCodeHint, setShowCodeHint] = useState(false);

  const navigate = useNavigate();

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);
    const { data, error: regError } = await supabase.signUp(username, password, name, role);
    setLoading(false);

    if (regError) {
      setError(regError.message);
      return;
    }

    if (data?.user) {
      const code = generateVerificationCode();
      setVerificationCode(code);
      setTempUserId(data.user.id);
      setStep('VERIFY');
      
      setTimeout(() => {
        setShowCodeHint(true);
      }, 1000);
    }
  };

  const handleVerify = async () => {
    if (userEnteredCode === verificationCode && tempUserId) {
      setLoading(true);
      await supabase.verifyProfile(tempUserId);
      setLoading(false);
      navigate('/');
      window.location.reload();
    } else {
      setError("Invalid verification code. Please try again.");
    }
  };

  if (step === 'VERIFY') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 animate-pulse"></div>
          
          <div className="mb-10 relative z-10">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
              Verify <span className="text-red-600">Identity</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium italic">Username: @{username}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Enter 6-Digit Secure Code</label>
              <input 
                type="text" 
                maxLength={6}
                className="w-full text-center text-4xl font-black tracking-[0.5em] py-5 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all"
                placeholder="000000"
                value={userEnteredCode}
                onChange={(e) => setUserEnteredCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button 
              onClick={handleVerify}
              disabled={loading || userEnteredCode.length !== 6}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Complete Secure Join'}
            </button>

            {showCodeHint && (
              <div className="p-6 bg-gray-900 rounded-[2rem] border border-white/10 animate-slideUp">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Internal Secure System</span>
                </div>
                <p className="text-white/60 text-[11px] font-medium leading-relaxed mb-4">
                  Registration Successful. Your verification code is:
                </p>
                <div className="bg-white/10 px-6 py-4 rounded-xl text-center border border-white/5">
                  <span className="text-2xl font-black text-white tracking-[0.4em]">{verificationCode}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setStep('FORM')}
              className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
            Network <span className="text-red-600">Join</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium">Create your unique username for CJNewsHub</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all font-bold"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Unique Username</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all font-bold"
                placeholder="journalist_alpha"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all pr-12 font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm Access Key</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all pr-12 font-bold"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Network Role Selection</label>
            <div className="grid grid-cols-2 gap-3">
              {[UserRole.READER, UserRole.PUBLISHER, UserRole.EDITOR, UserRole.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${role === r ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20 translate-y-[-2px]' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-red-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-xl shadow-red-600/20 active:scale-95"
            >
              {loading ? 'Processing Identity...' : 'Register Securely'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs font-medium">
            Already have a username? <a href="#/login" className="text-red-600 font-bold hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
