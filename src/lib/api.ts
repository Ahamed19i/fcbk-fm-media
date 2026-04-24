

import axios from 'axios';
import useSWR from 'swr';

const api = axios.create({
  baseURL: '/api',
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

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
