// STATUS: STABLE – DO NOT MODIFY
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { Profile, UserRole } from '../types.ts';

const Header: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    supabase.getCurrentUser().then(res => setUser(res.data));
  }, []);

  const handleLogout = () => {
    supabase.logout().then(() => {
      setUser(null);
      setIsMenuOpen(false);
      window.location.href = '#/';
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#/" className="text-2xl font-black text-red-600 tracking-tighter">
              CJNEWS<span className="text-gray-900">HUB</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            <a href="#/" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">Home</a>
            <a href="#/epaper" className="text-sm font-bold text-gray-900 px-3 py-1 bg-gray-100 rounded-md hover:bg-red-600 hover:text-white transition-all flex items-center space-x-1 uppercase tracking-tighter">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" strokeWidth="2"/><path d="M14 4v4h4" strokeWidth="2"/></svg>
              <span>E-Paper</span>
            </a>
            {CATEGORIES.map(cat => (
              <div 
                key={cat.id} 
                className="relative group"
                onMouseEnter={() => setActiveCategory(cat.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <a href={`#/category/${cat.name}`} className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">
                  {cat.name}
                </a>
                {activeCategory === cat.id && (
                  <div className="absolute top-full left-0 bg-white border border-gray-100 shadow-xl py-2 px-4 rounded-b-lg min-w-[150px]">
                    {cat.subcategories.map(sub => (
                      <a key={sub} href={`#/category/${cat.name}/${sub}`} className="block py-1 text-xs text-gray-600 hover:text-red-600">
                        {sub}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section: Auth/Search */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Visible Dashboard Button for authorized roles */}
                {[UserRole.ADMIN, UserRole.EDITOR, UserRole.PUBLISHER].includes(user.role) && (
                  <a href="#/admin" className="hidden md:flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-red-600 transition-all shadow-md group mr-1">
                    <svg className="w-3 h-3 mr-1.5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
                  </a>
                )}

                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-900">{user.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="relative group">
                   <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer object-cover shadow-sm" />
                   <div className="absolute right-0 top-full bg-white border border-gray-100 shadow-xl hidden group-hover:block min-w-[180px] rounded-2xl overflow-hidden mt-2 p-1">
                      {[UserRole.ADMIN, UserRole.EDITOR, UserRole.PUBLISHER].includes(user.role) && (
                        <a href="#/admin" className="flex items-center space-x-2 px-4 py-3 text-xs font-bold hover:bg-gray-50 text-gray-700 rounded-xl transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2" strokeLinecap="round"/></svg>
                          <span>Dashboard</span>
                        </a>
                      )}
                      <a href="#/profile" className="flex items-center space-x-2 px-4 py-3 text-xs font-bold hover:bg-gray-50 text-gray-700 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span>My Profile</span>
                      </a>
                      <button onClick={handleLogout} className="flex items-center space-x-2 w-full text-left px-4 py-3 text-xs font-bold hover:bg-red-50 text-red-600 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>Logout</span>
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a href="#/login" className="hidden sm:block text-gray-500 hover:text-gray-900 text-sm font-bold px-4 py-2">
                  Sign In
                </a>
                <a href="#/register" className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95">
                  Join
                </a>
              </div>
            )}

            {/* Mobile Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 h-screen overflow-y-auto pb-20">
          <div className="px-4 py-4 space-y-4">
             {user && (
               <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                  <img src={user.avatar} className="w-12 h-12 rounded-full" alt="" />
                  <div>
                    <p className="font-black uppercase tracking-tighter text-gray-900">{user.name}</p>
                    <div className="flex gap-2 mt-1">
                        <a href="#/profile" className="text-[10px] font-black uppercase tracking-widest text-red-600">Edit Profile</a>
                        {[UserRole.ADMIN, UserRole.EDITOR, UserRole.PUBLISHER].includes(user.role) && (
                            <>
                                <span className="text-gray-300 text-[10px]">|</span>
                                <a href="#/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-900">Dashboard</a>
                            </>
                        )}
                    </div>
                  </div>
               </div>
             )}
             <a href="#/" className="block py-2 text-lg font-bold">Home</a>
             <a href="#/epaper" className="block py-2 text-lg font-bold text-red-600">E-Paper</a>
             {CATEGORIES.map(cat => (
               <div key={cat.id} className="py-2">
                 <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{cat.name}</h3>
                 <div className="grid grid-cols-2 gap-3">
                   {cat.subcategories.map(sub => (
                     <a key={sub} href={`#/category/${cat.name}/${sub}`} className="text-sm text-gray-600 font-medium hover:text-red-600">{sub}</a>
                   ))}
                 </div>
               </div>
             ))}
             <a href="#/contact" className="block py-2 text-lg font-bold border-t border-gray-100 pt-4">Contact Us</a>
             {user && <button onClick={handleLogout} className="block py-2 text-lg font-bold text-red-600">Logout</button>}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;