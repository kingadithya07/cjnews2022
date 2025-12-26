
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.signIn(email);
    setLoading(false);
    
    if (data) {
      navigate('/');
      window.location.reload(); // Refresh to update header state
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
            Welcome <span className="text-red-600">Back</span>
          </h2>
          <p className="text-gray-400 text-sm">Log in to your CJNewsHub account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <a href="#/forgot-password" className="text-[10px] font-bold text-red-600 hover:underline">Forgot?</a>
            </div>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-95"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-xs">
            Don't have an account? <a href="#/register" className="text-red-600 font-bold hover:underline">Register Now</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
