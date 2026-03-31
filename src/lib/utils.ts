
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | any) {
  const d = normalizeDate(date);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function normalizeDate(date: any): Date {
  if (!date) return new Date();
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  if (typeof date.toDate === 'function') return date.toDate();
  if (date.seconds) return new Date(date.seconds * 1000);
  return new Date(date);
}
