
import React from 'react';
import { Article } from '../types';

interface NewsCardProps {
  article: Article;
  horizontal?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, horizontal = false }) => {
  if (horizontal) {
    return (
      <a href={`#/article/${article.id}`} className="flex gap-4 group">
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={article.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-black text-red-600 uppercase mb-1">{article.category}</span>
          <h3 className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">{article.title}</h3>
          <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
            {new Date(article.created_at).toLocaleDateString()}
          </span>
        </div>
      </a>
    );
  }

  return (
    <article className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <a href={`#/article/${article.id}`} className="block relative overflow-hidden aspect-video">
        <img 
          src={article.thumbnail_url} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          alt={article.title}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
            {article.category}
          </span>
        </div>
      </a>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-widest mb-2 space-x-3">
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2"/></svg>
            {article.view_count}
          </span>
        </div>
        <a href={`#/article/${article.id}`} className="block flex-grow">
          <h2 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-gray-500 text-xs line-clamp-3 mb-4 leading-relaxed font-light">
            {article.summary}
          </p>
        </a>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center space-x-2">
            <img src={article.author_avatar} className="w-6 h-6 rounded-full" alt="" />
            <span className="text-[11px] font-bold text-gray-700">{article.author_name}</span>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/></svg>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
