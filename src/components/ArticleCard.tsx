import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { formatDate } from '../lib/utils';
import { Clock, Eye } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'horizontal';
}

export default function ArticleCard({ article, variant = 'medium' }: ArticleCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-4 items-start">
        <div className="w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={article.mainImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-grow">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block">
            {article.category}
          </span>
          <h3 className="text-sm font-bold leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'large') {
    return (
      <Link to={`/article/${article.slug}`} className="group relative block overflow-hidden rounded-2xl bg-black aspect-[16/9]">
        <img
          src={article.mainImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full">
          <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
            {article.category}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base line-clamp-2 mb-4 max-w-2xl">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(article.publishedAt || article.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {article.views} vues</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 mb-4">
        <img
          src={article.mainImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 block">
          {article.category}
        </span>
        <h3 className="text-lg font-bold leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
          <span className="flex items-center gap-1 uppercase tracking-wider"><Clock size={12} /> {formatDate(article.publishedAt || article.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
