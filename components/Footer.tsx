
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tighter">
              CJNEWS<span className="text-red-500">HUB</span>
            </h2>
            <p className="text-sm leading-relaxed">
              Your premier destination for the most up-to-date news, in-depth reports, and community classifieds. We deliver journalism you can trust.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map(social => (
                <a key={social} href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-white/20 rounded-full" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Trending</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#/category/Technology" className="hover:text-white transition-colors">Tech Reviews</a></li>
              <li><a href="#/category/Politics" className="hover:text-white transition-colors">Political Analysis</a></li>
              <li><a href="#/category/Business" className="hover:text-white transition-colors">Market Trends</a></li>
              <li><a href="#/category/Sports" className="hover:text-white transition-colors">Live Scoreboard</a></li>
              <li><a href="#/category/Health" className="hover:text-white transition-colors">Health & Wellness</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Newsletter</h3>
            <p className="text-sm mb-4">Subscribe to our daily news digest.</p>
            <form className="space-y-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-gray-800 border-none rounded px-4 py-2 text-sm text-white focus:ring-2 focus:ring-red-600 outline-none"
              />
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-bold transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2024 CJNewsHub. All rights reserved.</p>
          <p className="mt-4 md:mt-0 italic font-mono uppercase tracking-[0.2em]">Crafted for excellence</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
