
import React, { useState, useEffect } from 'react';
import { Article } from '../types';

interface HeroSliderProps {
  articles: Article[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ articles }) => {
  const [current, setCurrent] = useState(0);
  const featured = articles.filter(a => a.is_featured).slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return null;

  const article = featured[current];

  return (
    <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gray-900 group rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-white/10">
      {/* FULL WIDTH IMAGE */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          key={article.id}
          src={article.thumbnail_url} 
          alt={article.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 animate-fadeIn"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block" />
      </div>

      {/* FLOATING TOP BADGE */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
         <span className="bg-red-600 text-white text-[10px] md:text-xs uppercase font-black px-4 py-1.5 rounded-sm shadow-xl tracking-[0.2em]">
          {article.category}
        </span>
      </div>

      {/* OVERLAID CONTENT (BOTTOM LEFT) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 z-20 flex flex-col justify-end h-full max-w-5xl">
        <div className="animate-slideUp space-y-4 md:space-y-6">
          <div className="flex items-center space-x-3">
             <span className="w-12 h-1 bg-red-600 rounded-full"></span>
             <span className="text-[10px] md:text-xs font-black uppercase text-white/70 tracking-[0.3em]">Editor's Pick</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter drop-shadow-xl line-clamp-2">
            {article.title}
          </h1>
          
          <p className="text-gray-300 text-xs md:text-base lg:text-lg mb-4 line-clamp-2 font-light leading-relaxed max-w-2xl hidden sm:block border-l border-white/20 pl-4 md:pl-6">
            {article.summary}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a 
              href={`#/article/${article.id}`} 
              className="bg-white text-black px-8 py-3 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl"
            >
              Read Full Story
            </a>

            {/* Glassmorphism Author Card */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hidden md:flex">
              <img src={article.author_avatar} className="w-8 h-8 rounded-full border border-white/40" alt="" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white leading-none">By {article.author_name}</span>
                <span className="text-[8px] uppercase tracking-tighter text-white/50 mt-0.5">Contributor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION INDICATORS (DASHED BARS) */}
      <div className="absolute bottom-8 right-10 flex space-x-3 z-30">
        {featured.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)}
            className={`h-1.5 transition-all duration-500 rounded-full ${idx === current ? 'w-10 bg-red-600' : 'w-4 bg-white/20 hover:bg-white/40'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ARROW CONTROLS (DESKTOP) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          onClick={() => setCurrent(prev => (prev - 1 + featured.length) % featured.length)}
          className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          onClick={() => setCurrent(prev => (prev + 1) % featured.length)}
          className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
};

export default HeroSlider;
