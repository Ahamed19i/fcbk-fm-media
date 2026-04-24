

import axios from 'axios';
import useSWR from 'swr';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds timeout
});

export const fetcher = (url: string) => api.get(url).then((res) => {
  if (res.data && res.data.error && !Array.isArray(res.data)) {
    throw new Error(JSON.stringify(res.data));
  }
  return res.data;
});

export const useArticles = (params: { limit?: number; category?: string } = {}) => {
  const query = new URLSearchParams(params as any).toString();
  return useSWR(`/articles${query ? `?${query}` : ''}`, fetcher);
};

export const useArticle = (slug: string | undefined) => {
  return useSWR(slug ? `/articles/${slug}` : null, fetcher);
};

export const useCategories = () => {
  return useSWR('/categories', fetcher);
};

export const useAuthors = () => {
  return useSWR('/authors', fetcher);
};

export default api;
