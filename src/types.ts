export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  mainImage: string;
  category: string;
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  isBreaking?: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  photo: string;
  uid: string;
  role: 'admin' | 'editor' | 'journalist';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'journalist';
  createdAt: string;
}
