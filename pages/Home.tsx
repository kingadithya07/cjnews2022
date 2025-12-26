
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { Article, Classified } from '../types.ts';
import HeroSlider from '../components/HeroSlider.tsx';
import NewsCard from '../components/NewsCard.tsx';
import { CATEGORIES } from '../constants.tsx';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.getArticles(),
      supabase.getClassifieds()
    ]).then(([artRes, clsRes]) => {
      setArticles(artRes.data || []);
      setClassifieds(clsRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const trending = articles.filter(a => a.is_trending).slice(0, 6);
  const latest = articles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  return (
    <div className="space-y-12">
      {/* Top Section: Hero Slider + Trending */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Curved Slider Column */}
          <div className="lg:col-span-8">
            <HeroSlider articles={articles} />
          </div>

          {/* Trending Column */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
              <h2 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center">
                <span className="bg-red-600 w-2 h-6 mr-3"></span>
                Trending <span className="text-red-600 ml-1">Now</span>
              </h2>
              <div className="space-y-6 flex-grow overflow-y-auto hide-scrollbar max-h-[400px] lg:max-h-none">
                {trending.map((art, idx) => (
                  <div key={art.id} className="flex gap-4 group cursor-pointer items-start">
                    <span className="text-2xl font-black text-gray-200 group-hover:text-red-600 transition-colors leading-none">0{idx + 1}</span>
                    <div className="flex-1">
                      <span className="text-[9px] font-black text-red-600 uppercase mb-0.5 block tracking-widest">{art.category}</span>
                      <a href={`#/article/${art.id}`} className="text-sm font-bold block group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 bg-gray-50 text-gray-900 text-[10px] font-black uppercase py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all tracking-widest border border-gray-100">
                View All Trending
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Latest News (Main Content) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Latest <span className="text-red-600">News</span></h2>
              <a href="#/news" className="text-xs font-bold text-red-600 hover:underline">View All</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latest.map(art => (
                <NewsCard key={art.id} article={art} />
              ))}
            </div>

            {/* Category Wise News Section */}
            {CATEGORIES.slice(0, 4).map(cat => {
              const catArticles = articles.filter(a => a.category === cat.name).slice(0, 3);
              if (!catArticles.length) return null;
              return (
                <div key={cat.id} className="pt-8 space-y-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter border-l-4 border-red-600 pl-4">{cat.name}</h3>
                    <div className="flex-grow h-px bg-gray-100"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {catArticles.map(art => (
                      <NewsCard key={art.id} article={art} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl sticky top-24">
              <h2 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center">
                <span className="bg-blue-600 w-2 h-6 mr-3"></span>
                Classifieds
              </h2>
              <div className="space-y-4">
                {classifieds.slice(0, 4).map(cls => (
                  <div key={cls.id} className="group border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-4 mb-2">
                       <img src={cls.image_url} className="w-16 h-16 rounded object-cover" alt="" />
                       <div>
                         <h4 className="text-sm font-bold group-hover:text-blue-600 line-clamp-1">{cls.title}</h4>
                         <p className="text-xs text-blue-600 font-black mt-1">{cls.price}</p>
                       </div>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{cls.description}</p>
                  </div>
                ))}
                <button className="w-full mt-4 bg-gray-900 text-white text-[10px] uppercase font-black tracking-widest py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  Browse All Classifieds
                </button>
              </div>

              {/* Sidebar AD space */}
              <div className="mt-12 w-full aspect-[4/5] bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                <span className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">Advertisement</span>
                <div className="mt-2 w-12 h-1 px-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
