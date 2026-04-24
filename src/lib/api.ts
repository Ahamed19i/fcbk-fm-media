

import axios from 'axios';
import useSWR from 'swr';

const api = axios.create({
  baseURL: '/api',
});

const fetcher = (url: string) => api.get(url).then((res) => {
  if (res.data && res.data.error && !Array.isArray(res.data)) {
    throw new Error(JSON.stringify(res.data));
  }
  return res.data;
});

export const useArticles = (params: { limit?: number; category?: string } = {}) => {
  const query = new URLSearchParams(params as any).toString();
  return useSWR(`/articles${query ? `?${query}` : ''}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
};

export const useArticle = (slug: string | undefined) => {
  return useSWR(slug ? `/articles/${slug}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
};

export const useCategories = () => {
  return useSWR('/categories', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000, // 1 hour for categories (mostly static)
  });
};

export const useAuthors = () => {
  return useSWR('/authors', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
  });
};

export default api;
