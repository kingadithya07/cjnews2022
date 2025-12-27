
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAvatar, setNewAvatar] = useState('');
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 storage
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.updateProfile(user.id, { avatar: newAvatar, name: newName });
    setSaving(false);
    
    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Identity profile updated successfully!');
      window.location.reload();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5"/></svg>
      </div>
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
             
             {/* Profile Image Container */}
             <div className="absolute -bottom-20 left-12">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl transition-transform active:scale-95">
                    <img 
                      src={newAvatar || 'https://via.placeholder.com/150'} 
                      className="w-full h-full rounded-[2.2rem] object-cover bg-gray-100 border border-gray-100" 
                      alt="Profile Avatar" 
                    />
                  </div>
                  
                  {/* Floating Camera Button */}
                  <div className="absolute -right-2 -bottom-2 bg-red-600 text-white p-3 rounded-2xl shadow-xl border-4 border-white group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Glass Overlay for Desktop Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-all flex items-center justify-center text-center p-4">
                     <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                  </div>
                </div>
                
                {/* Hidden File Input */}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
             </div>

             {/* Profile Status Badge */}
             <div className="absolute top-8 right-12">
                <div className="flex flex-col items-end gap-2">
                  <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md text-white">
                    {user.role} Member
                  </span>
                  {user.is_verified && (
                    <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1 rounded-full">
                      <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Verified Identity</span>
                    </div>
                  )}
                </div>
             </div>
          </div>
          
          <div className="pt-24 px-12 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
              <div className="animate-slideUp">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-1">{newName || 'New Network Member'}</h1>
                <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-red-600"></div>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Profile Configuration Hub</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <button 
                  onClick={() => window.location.href = '#/'}
                  className="flex-1 md:flex-none px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 md:flex-none bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 active:scale-95"
                >
                  {saving ? 'Saving...' : 'Commit Changes'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all font-bold text-gray-900 shadow-inner"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* NEW: Explicit Avatar Upload Section */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Profile Avatar</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-grow">
                       <div className="relative">
                          <input 
                            type="text" 
                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all font-bold text-gray-900 shadow-inner text-xs"
                            value={newAvatar ? (newAvatar.length > 50 ? 'Image Data Loaded' : newAvatar) : ''}
                            readOnly
                            placeholder="No image selected"
                          />
                          {newAvatar && (
                             <button onClick={() => setNewAvatar('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                             </button>
                          )}
                       </div>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors shadow-lg whitespace-nowrap"
                    >
                      Upload New
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold mt-2 ml-1">Supports JPG, PNG (Max 2MB)</p>
                </div>
                
                <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100">
                  <div className="flex items-center space-x-3 mb-4">
                     <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                     <p className="text-[11px] font-black uppercase text-red-600 tracking-widest">Network Guidance</p>
                  </div>
                  <p className="text-[11px] text-red-900/60 font-medium leading-relaxed italic">
                    Your display name and profile picture are visible to the public on news stories and classifieds. Professional attire is recommended for verified journalists.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-5">
                <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white h-full flex flex-col justify-center shadow-2xl">
                   <div className="flex items-center space-x-3 mb-8 text-white/50">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     <h4 className="text-[11px] font-black uppercase tracking-widest">System Metadata</h4>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="pb-4 border-b border-white/10">
                        <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Network Handle</span>
                        <span className="text-sm font-bold text-white">@{user.username}</span>
                      </div>
                      <div className="pb-4 border-b border-white/10">
                        <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Access Level</span>
                        <span className="text-sm font-black text-red-500 uppercase tracking-tighter">{user.role}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Network UUID</span>
                        <span className="text-[9px] font-mono text-white/20 break-all">{user.id}</span>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => alert("Multi-Factor Authentication is managed by your organization's admin.")}
                     className="mt-12 w-full py-4 bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all"
                   >
                     Security Logs
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
