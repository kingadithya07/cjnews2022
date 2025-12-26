
import { Category, UserRole, Tag, ClassifiedCategory, EPaperPage } from './types.ts';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Politics', subcategories: ['Local', 'National', 'International'], article_count: 120 },
  { id: '2', name: 'Technology', subcategories: ['Gadgets', 'AI', 'Software', 'Space'], article_count: 85 },
  { id: '3', name: 'Business', subcategories: ['Markets', 'Economy', 'Startup'], article_count: 64 },
  { id: '4', name: 'Sports', subcategories: ['Football', 'Cricket', 'Basketball', 'Tennis'], article_count: 92 },
  { id: '5', name: 'Entertainment', subcategories: ['Movies', 'Music', 'Celebrity'], article_count: 45 },
  { id: '6', name: 'Health', subcategories: ['Wellness', 'Medical', 'Fitness'], article_count: 38 },
];

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Breaking', slug: 'breaking', usage_count: 540 },
  { id: 't2', name: 'Analysis', slug: 'analysis', usage_count: 210 },
  { id: 't3', name: 'Interview', slug: 'interview', usage_count: 85 },
  { id: 't4', name: 'World News', slug: 'world-news', usage_count: 1200 },
  { id: 't5', name: 'Climate', slug: 'climate', usage_count: 150 },
];

export const CLASSIFIED_CATEGORIES: ClassifiedCategory[] = [
  { id: 'cc1', name: 'Real Estate' },
  { id: 'cc2', name: 'Automobiles' },
  { id: 'cc3', name: 'Jobs' },
  { id: 'cc4', name: 'Electronics' },
  { id: 'cc5', name: 'Services' },
  { id: 'cc6', name: 'General' },
];

export const MOCK_ARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: `art-${i}`,
  title: `Breaking News: ${i % 2 === 0 ? 'Major Technological Breakthrough' : 'Economic Shift Observed in Global Markets'}`,
  summary: 'This is a brief summary of the article to give readers a glimpse of the content and entice them to read more.',
  content: '<p>The full content of the article would go here. It can include multiple paragraphs, images, and other media elements.</p>',
  author_id: 'user-1',
  author_name: 'John Doe',
  author_avatar: `https://picsum.photos/seed/${i + 50}/100/100`,
  status: 'PUBLISHED' as const,
  category: CATEGORIES[i % CATEGORIES.length].name,
  subcategory: CATEGORIES[i % CATEGORIES.length].subcategories[0],
  thumbnail_url: `https://picsum.photos/seed/${i + 100}/800/450`,
  is_featured: i < 5,
  is_trending: i % 3 === 0,
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
  view_count: Math.floor(Math.random() * 10000),
}));

export const MOCK_CLASSIFIEDS = Array.from({ length: 8 }, (_, i) => ({
  id: `cls-${i}`,
  title: `Item for Sale ${i + 1}`,
  description: 'High quality item available at a reasonable price. Contact for more details.',
  category: CLASSIFIED_CATEGORIES[i % CLASSIFIED_CATEGORIES.length].name,
  price: `$${(i + 1) * 50}`,
  contact: '+1 234 567 890',
  image_url: `https://picsum.photos/seed/cls${i}/400/300`,
  created_at: new Date().toISOString(),
}));

export const MOCK_EPAPER: EPaperPage[] = Array.from({ length: 4 }, (_, i) => ({
  id: `ep-${i}`,
  date: new Date().toISOString().split('T')[0],
  page_number: i + 1,
  image_url: `https://picsum.photos/seed/epaper${i}/800/1200`,
  regions: [],
  created_at: new Date().toISOString(),
}));
