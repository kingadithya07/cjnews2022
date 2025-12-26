
import React, { useState } from 'react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        {!submitted ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                Forgot <span className="text-red-600">Password?</span>
              </h2>
              <p className="text-gray-400 text-sm">Enter your email to receive a recovery link</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all"
              >
                Send Recovery Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Email Sent!</h3>
            <p className="text-gray-400 text-sm mb-8 px-4">If an account exists for {email}, you will receive password reset instructions shortly.</p>
            <a href="#/login" className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Back to Login</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
