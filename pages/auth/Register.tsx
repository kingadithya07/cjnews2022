
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { UserRole } from '../../types';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.READER);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase.signUp(email, name, role);
    setLoading(false);
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
          </div>
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-lg"
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
