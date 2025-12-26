
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAvatar, setNewAvatar] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    supabase.getCurrentUser().then(res => {
      if (res.data) {
        setUser(res.data);
        setNewAvatar(res.data.avatar || '');
        setNewName(res.data.name || '');
      }
      setLoading(false);
    });
  }, []);

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.updateProfile(user.id, { avatar: newAvatar, name: newName });
    setSaving(false);
    alert('Identity profile updated successfully!');
    window.location.reload();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Secure Access Required</h1>
      <p className="text-gray-400 text-sm mt-2 mb-8 uppercase tracking-widest font-bold">Please log in to manage your profile</p>
      <a href="#/login" className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20">Sign In Now</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Visual Header */}
          <div className="bg-gray-900 h-48 relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             <div className="absolute -bottom-20 left-12">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                    <img 
                      src={newAvatar || 'https://via.placeholder.com/150'} 
                      className="w-full h-full rounded-[2.2rem] object-cover bg-gray-100 border border-gray-100" 
                      alt="Profile Avatar" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-all flex items-center justify-center pointer-events-none p-4">
                     <span className="text-white text-[10px] font-black uppercase tracking-widest text-center">Live Preview</span>
                  </div>
                </div>
             </div>
             {/* Profile Status Badge */}
             <div className="absolute top-8 right-12">
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md text-white`}>
                  {user.role} Member
                </span>
             </div>
          </div>
          
          <div className="pt-24 px-12 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-1">{newName || 'Citizen Journalist'}</h1>
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Verified Account Identity</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => window.location.href = '#/'}
                  className="px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={saving}
                  className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 active:scale-95"
                >
                  {saving ? 'Synchronizing...' : 'Update Profile'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all font-bold text-gray-900"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Avatar Display URL</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all font-bold text-gray-900"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    placeholder="Paste your image URL here"
                  />
                  <p className="mt-3 text-[10px] text-gray-400 font-medium px-1 italic">Note: High-resolution square images (1:1) work best for the platform display.</p>
                </div>
              </div>
              
              <div className="lg:col-span-5">
                <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 h-full flex flex-col justify-center">
                   <div className="flex items-center space-x-3 mb-8">
                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Security Credentials</h4>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200">
                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</span>
                        <span className="text-sm font-bold text-gray-700">{user.email}</span>
                      </div>
                      <div className="pb-4 border-b border-gray-200">
                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Access Tier</span>
                        <span className="text-sm font-black text-red-600 uppercase tracking-tighter">{user.role}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Unique Identifier</span>
                        <span className="text-[9px] font-mono text-gray-400 break-all">{user.id}</span>
                      </div>
                   </div>
                   
                   <button className="mt-12 w-full py-4 bg-white border border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm">
                     Reset Account Password
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
