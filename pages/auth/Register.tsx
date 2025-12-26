
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.ts';
import { UserRole } from '../../types.ts';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.READER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

    setLoading(true);
    // Passing role and name via Auth Metadata for Supabase Triggers
    const { data, error: regError } = await supabase.signUp(email, password, name, role);
    setLoading(false);

    if (regError) {
      setError(regError.message);
      return;
    }

    if (data) {
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
            Create <span className="text-red-600">Account</span>
          </h2>
          <p className="text-gray-400 text-sm">Join the CJNewsHub community today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all pr-12"
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all pr-12"
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
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {[UserRole.READER, UserRole.PUBLISHER, UserRole.EDITOR, UserRole.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${role === r ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-red-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[9px] text-gray-400 font-medium italic">
              Note: Staff roles (Editor, Admin) will be processed via your account metadata.
            </p>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-lg active:scale-95"
            >
              {loading ? 'Creating Account...' : 'Join Now'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs">
            Already have an account? <a href="#/login" className="text-red-600 font-bold hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
