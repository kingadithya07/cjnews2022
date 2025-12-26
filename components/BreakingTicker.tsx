
// STATUS: STABLE – DO NOT MODIFY
import React, { useEffect, useState } from 'react';
import { Article } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

const BreakingTicker: React.FC = () => {
  const [news, setNews] = useState<Article[]>([]);

  useEffect(() => {
    supabase.getArticles().then(res => {
      if (res.data) {
        // Filter for trending or just the latest 5
        setNews(res.data.slice(0, 8));
      }
    });
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="bg-gray-900 border-b border-white/5 overflow-hidden h-10 flex items-center">
      <div className="flex-shrink-0 bg-red-600 h-full px-4 flex items-center z-10 relative shadow-[10px_0_15px_rgba(0,0,0,0.3)]">
        <span className="flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
          Breaking News
        </span>
      </div>
      
      <div className="flex-grow relative overflow-hidden h-full flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center hover:[animation-play-state:paused] cursor-pointer">
          {news.map((item, idx) => (
            <a 
              key={item.id} 
              href={`#/article/${item.id}`}
              className="inline-flex items-center px-8 group"
            >
              <span className="text-[10px] text-gray-400 font-bold mr-2">#{idx + 1}</span>
              <span className="text-xs text-gray-200 font-medium group-hover:text-red-500 transition-colors">
                {item.title}
              </span>
              <span className="mx-6 text-gray-700 font-black">•</span>
            </a>
          ))}
          {/* Duplicate for infinite effect */}
          {news.map((item, idx) => (
            <a 
              key={`${item.id}-dup`} 
              href={`#/article/${item.id}`}
              className="inline-flex items-center px-8 group"
            >
              <span className="text-[10px] text-gray-400 font-bold mr-2">#{idx + 1}</span>
              <span className="text-xs text-gray-200 font-medium group-hover:text-red-500 transition-colors">
                {item.title}
              </span>
              <span className="mx-6 text-gray-700 font-black">•</span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BreakingTicker;
