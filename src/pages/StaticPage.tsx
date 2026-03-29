
import React from 'react';

interface StaticPageProps {
  title: string;
  content: React.ReactNode;
}

export default function StaticPage({ title, content }: StaticPageProps) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black mb-8 border-b-4 border-blue-600 pb-4 inline-block">{title}</h1>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
