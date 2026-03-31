
import React from 'react';
import NewsletterForm from './NewsletterForm';

interface NewsletterBoxProps {
  variant?: 'horizontal' | 'vertical';
}

export default function NewsletterBox({ variant = 'horizontal' }: NewsletterBoxProps) {
  if (variant === 'vertical') {
    return (
      <div className="p-8 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20">
        <h3 className="font-black text-xl mb-2">Restez informé en continu</h3>
        <p className="text-blue-100 text-sm mb-6">Abonnez-vous à notre newsletter pour recevoir les alertes info directement dans votre boîte mail.</p>
        <NewsletterForm variant="sidebar" />
      </div>
    );
  }

  return (
    <div className="my-12 p-8 bg-blue-600 dark:bg-blue-700 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20 transition-colors duration-300">
      <div className="max-w-md text-center md:text-left">
        <h3 className="text-2xl font-black mb-2">Restez informé en continu</h3>
        <p className="text-blue-100 dark:text-blue-200 text-sm">Abonnez-vous à notre newsletter pour recevoir les alertes info directement dans votre boîte mail.</p>
      </div>
      <NewsletterForm />
    </div>
  );
}
