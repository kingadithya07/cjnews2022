
export enum UserRole {
  ADMIN = 'ADMIN',
  PUBLISHER = 'PUBLISHER',
  EDITOR = 'EDITOR',
  READER = 'READER'
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  is_verified: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED';
  category: string;
  subcategory?: string;
  thumbnail_url: string;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
  view_count: number;
}

export interface EPaperRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  articleId?: string;
  title?: string;
}

export interface EPaperPage {
  id: string;
  date: string;
  page_number: number;
  image_url: string;
  regions: EPaperRegion[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  article_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

export interface ClassifiedCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Classified {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  contact: string;
  image_url: string;
  created_at: string;
}
