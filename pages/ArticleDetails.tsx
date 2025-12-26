
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Article } from '../types';
import NewsCard from '../components/NewsCard';

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      setLoading(true);
      Promise.all([
        supabase.getArticleById(id),
        supabase.getArticles()
      ]).then(([res, allRes]) => {
        setArticle(res.data);
        if (allRes.data) {
          const otherArticles = allRes.data
            .filter(a => a.id !== id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
          setRelatedArticles(otherArticles);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
  
  if (!article) return <div className="p-20 text-center text-gray-500 font-bold">Article Not Found.</div>;

  return (
    <div className="bg-white">
      {/* FULL IMAGE HERO WITH DETAILS OVERLAY */}
      <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-gray-900">
        <img 
          src={article.thumbnail_url} 
          className="w-full h-full object-cover transition-transform duration-1000 scale-105" 
          alt={article.title} 
        />
        
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

        {/* Content Over Image */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <div className="max-w-4xl space-y-6">
              {/* Category Tag */}
              <div className="flex items-center space-x-3">
                <span className="bg-red-600 text-white text-[10px] uppercase font-black px-4 py-1.5 rounded-sm tracking-[0.2em] shadow-2xl">
                  {article.category}
                </span>
                <div className="h-px w-12 bg-white/30"></div>
                <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Featured Report</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl">
                {article.title}
              </h1>

              {/* Summary on Image (Truncated) */}
              <p className="text-gray-300 text-sm md:text-lg font-light leading-relaxed max-w-2xl border-l-2 border-red-600 pl-6">
                {article.summary}
              </p>

              {/* Details Row on Image */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {/* Author Glass Card */}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <img src={article.author_avatar} className="w-8 h-8 rounded-full border border-white/40" alt="" />
                  <div className="text-left">
                    <span className="block font-bold text-white text-xs leading-none">{article.author_name}</span>
                    <span className="text-[9px] uppercase font-bold text-white/50 mt-0.5 block tracking-wider">Verified Editor</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-1">Release Date</span>
                    <span className="text-white text-xs font-bold">
                      {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-1">Engagement</span>
                    <div className="flex items-center space-x-2 text-white">
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      <span className="text-xs font-black">{article.view_count.toLocaleString()} Views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLE BODY SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Text Content */}
          <div className="lg:col-span-8">
            <div 
              className="prose prose-xl max-w-none text-gray-800 leading-relaxed font-serif first-letter:text-8xl first-letter:font-black first-letter:text-red-600 first-letter:mr-4 first-letter:float-left first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-16 flex flex-wrap gap-4 py-8 border-y border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-full mb-2">Share This Story</span>
              {['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp'].map(btn => (
                 <button key={btn} className="px-6 py-2.5 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-lg text-[10px] font-black transition-all duration-300 uppercase tracking-widest border border-gray-100 shadow-sm">
                   {btn}
                 </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-10">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-8 flex items-center">
                  <span className="w-8 h-0.5 bg-red-600 mr-4"></span>
                  Trending Now
                </h3>
                <div className="space-y-8">
                  {relatedArticles.slice(0, 3).map(art => (
                    <NewsCard key={art.id} article={art} horizontal={true} />
                  ))}
                </div>
              </div>

              {/* Advertisement Widget */}
              <div className="relative group overflow-hidden rounded-3xl bg-gray-900 aspect-[4/5] flex items-center justify-center p-8 text-center border-4 border-white shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 block">Sponsorship</span>
                  <h4 className="text-white text-xl font-bold mb-4 leading-tight">Your Brand Deserves the Headlines</h4>
                  <button className="bg-white text-black text-[10px] font-black uppercase px-6 py-3 rounded-full hover:bg-red-600 hover:text-white transition-colors tracking-widest">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM RECOMMENDED SECTION */}
        <div className="mt-24 pt-20 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">More from <span className="text-red-600">{article.category}</span></h2>
              <p className="text-gray-400 text-sm mt-1">Hand-picked stories related to this topic</p>
            </div>
            <a href="#/" className="bg-gray-100 hover:bg-red-600 hover:text-white text-[10px] font-black px-8 py-3 rounded-full transition-all uppercase tracking-widest">
              Back to Newsroom
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedArticles.map(art => (
              <NewsCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;
