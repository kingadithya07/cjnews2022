
// STATUS: STABLE – DO NOT MODIFY
import { Article, Profile, UserRole, Classified, Category, Tag, ClassifiedCategory, EPaperPage, EPaperRegion } from '../types.ts';
import { MOCK_ARTICLES, MOCK_CLASSIFIEDS, CATEGORIES, MOCK_TAGS, CLASSIFIED_CATEGORIES, MOCK_EPAPER } from '../constants.tsx';

class SupabaseService {
  private articles: Article[] = [...MOCK_ARTICLES];
  private classifieds: Classified[] = [...MOCK_CLASSIFIEDS];
  private categories: Category[] = [...CATEGORIES];
  private tags: Tag[] = [...MOCK_TAGS];
  private epaperPages: EPaperPage[] = [...MOCK_EPAPER];
  private users: Profile[] = [
    { id: 'user-1', name: 'John Doe', email: 'admin@cjnewshub.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin/100/100' },
    { id: 'user-2', name: 'Jane Smith', email: 'editor@cjnewshub.com', role: UserRole.EDITOR, avatar: 'https://picsum.photos/seed/editor/100/100' },
    { id: 'user-3', name: 'News Reader', email: 'reader@cjnewshub.com', role: UserRole.READER, avatar: 'https://picsum.photos/seed/reader/100/100' }
  ];
  private currentUser: Profile | null = null;

  async getArticles() {
    return { data: this.articles, error: null };
  }

  async getClassifieds() {
    return { data: this.classifieds, error: null };
  }

  async getCategories() {
    return { data: this.categories, error: null };
  }

  async getEPaperPages(date?: string) {
    let filtered = this.epaperPages;
    if (date) {
      filtered = this.epaperPages.filter(p => p.date === date);
    }
    return { data: filtered.sort((a, b) => a.page_number - b.page_number), error: null };
  }

  async getArticleById(id: string) {
    const article = this.articles.find(a => a.id === id);
    return { data: article || null, error: article ? null : 'Not found' };
  }

  async getAllUsers() {
    return { data: this.users, error: null };
  }

  async updateProfile(id: string, updates: Partial<Profile>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      if (this.currentUser?.id === id) {
        this.currentUser = this.users[index];
      }
      return { data: this.users[index], error: null };
    }
    return { error: 'User not found' };
  }

  async getCurrentUser() {
    return { data: this.currentUser, error: null };
  }

  async signUp(email: string, name: string, role: UserRole) {
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      name: name,
      email: email,
      role: role,
      avatar: `https://picsum.photos/seed/${name}/100/100`
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    return { data: newUser, error: null };
  }

  async signIn(email: string) {
    const existing = this.users.find(u => u.email === email);
    if (existing) {
      this.currentUser = existing;
      return { data: existing, error: null };
    }

    let role = UserRole.READER;
    if (email.includes('admin')) role = UserRole.ADMIN;
    else if (email.includes('editor')) role = UserRole.EDITOR;
    
    const loggedInUser: Profile = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role,
      avatar: `https://picsum.photos/seed/${email}/100/100`
    };
    this.users.push(loggedInUser);
    this.currentUser = loggedInUser;
    return { data: loggedInUser, error: null };
  }

  async logout() {
    this.currentUser = null;
    return { error: null };
  }

  async addArticle(article: Partial<Article>) {
    const newArt = { 
      ...MOCK_ARTICLES[0], 
      ...article, 
      id: `art-${Date.now()}`,
      created_at: new Date().toISOString(),
      view_count: 0
    } as Article;
    this.articles = [newArt, ...this.articles];
    return { data: newArt, error: null };
  }

  async updateArticle(id: string, updates: Partial<Article>) {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return { error: 'Article not found' };
    this.articles[index] = { ...this.articles[index], ...updates };
    return { data: this.articles[index], error: null };
  }

  async addEPaperPage(page: Partial<EPaperPage>) {
    const newPage: EPaperPage = {
      id: `ep-${Date.now()}`,
      date: page.date || new Date().toISOString().split('T')[0],
      page_number: page.page_number || 1,
      image_url: page.image_url || 'https://picsum.photos/seed/ep/800/1200',
      regions: [],
      created_at: new Date().toISOString()
    };
    this.epaperPages = [...this.epaperPages, newPage];
    return { data: newPage, error: null };
  }

  async updateEPaperRegions(id: string, regions: EPaperRegion[]) {
    const index = this.epaperPages.findIndex(p => p.id === id);
    if (index === -1) return { error: 'Page not found' };
    this.epaperPages[index].regions = regions;
    return { data: this.epaperPages[index], error: null };
  }

  async deleteEPaperPage(id: string) {
    this.epaperPages = this.epaperPages.filter(p => p.id !== id);
    return { error: null };
  }
}

export const supabase = new SupabaseService();
