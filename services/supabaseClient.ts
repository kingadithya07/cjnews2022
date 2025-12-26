
import { createClient } from '@supabase/supabase-js';
import { Article, Profile, UserRole, Classified, EPaperPage, EPaperRegion } from '../types.ts';
import { MOCK_ARTICLES, MOCK_CLASSIFIEDS, MOCK_EPAPER } from '../constants.tsx';

/**
 * CJNewsHub Supabase Configuration
 * Dynamically handles environment-based initialization with the provided project URL.
 */
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wpfzfozfxtwdaejramfz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Safely initialize the client only if both URL and Key are present and valid.
// This prevents the "Uncaught Error: supabaseUrl is required" runtime crash.
export const supabaseClient = (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 0)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

class SupabaseService {
  /**
   * Internal check to see if Supabase is connected.
   * If false, the service will return mock data to keep the app functional for previews.
   */
  private isConfigured(): boolean {
    if (!supabaseClient) {
      if (!window.localStorage.getItem('supabase_warned')) {
        console.warn("Supabase Anon Key is missing. CJNewsHub is running in 'Offline/Mock Mode'. To enable live features, please provide SUPABASE_ANON_KEY in your environment.");
        window.localStorage.setItem('supabase_warned', 'true');
      }
      return false;
    }
    return true;
  }

  async getArticles() {
    if (!this.isConfigured()) return { data: MOCK_ARTICLES, error: null };
    try {
      const { data, error } = await supabaseClient!
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: data || MOCK_ARTICLES, error };
    } catch (e) {
      return { data: MOCK_ARTICLES, error: e };
    }
  }

  async getClassifieds() {
    if (!this.isConfigured()) return { data: MOCK_CLASSIFIEDS, error: null };
    try {
      const { data, error } = await supabaseClient!
        .from('classifieds')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: data || MOCK_CLASSIFIEDS, error };
    } catch (e) {
      return { data: MOCK_CLASSIFIEDS, error: e };
    }
  }

  async getCategories() {
    if (!this.isConfigured()) return { data: [], error: null };
    return await supabaseClient!
      .from('categories')
      .select('*');
  }

  async getEPaperPages(date?: string) {
    if (!this.isConfigured()) return { data: MOCK_EPAPER, error: null };
    try {
      let query = supabaseClient!.from('epaper_pages').select('*');
      if (date) {
        query = query.eq('date', date);
      }
      const { data, error } = await query.order('page_number', { ascending: true });
      return { data: data || MOCK_EPAPER, error };
    } catch (e) {
      return { data: MOCK_EPAPER, error: e };
    }
  }

  async getArticleById(id: string) {
    if (!this.isConfigured()) {
      const art = MOCK_ARTICLES.find(a => a.id === id);
      return { data: art || null, error: art ? null : { message: 'Article not found' } };
    }
    try {
      return await supabaseClient!
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
    } catch (e) {
      const art = MOCK_ARTICLES.find(a => a.id === id);
      return { data: art || null, error: null };
    }
  }

  async getAllUsers() {
    if (!this.isConfigured()) return { data: [], error: null };
    return await supabaseClient!
      .from('profiles')
      .select('*');
  }

  async updateProfile(id: string, updates: Partial<Profile>) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    return await supabaseClient!
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  async getCurrentUser() {
    if (!this.isConfigured()) return { data: null, error: null };
    try {
      const { data: { user } } = await supabaseClient!.auth.getUser();
      if (!user) return { data: null, error: null };
      
      return await supabaseClient!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    } catch (e) {
      return { data: null, error: e };
    }
  }

  async signUp(email: string, name: string, role: UserRole) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    const { data, error } = await supabaseClient!.auth.signUp({
      email,
      password: 'temporaryPassword123!', 
      options: {
        data: { name, role }
      }
    });
    return { data, error };
  }

  async signIn(email: string) {
    if (!this.isConfigured()) return { data: { user: { id: 'mock-user' } }, error: null }; // Mock login
    const { data, error } = await supabaseClient!.auth.signInWithPassword({
      email,
      password: 'temporaryPassword123!' 
    });
    return { data, error };
  }

  async logout() {
    if (!this.isConfigured()) return { data: null, error: null };
    return await supabaseClient!.auth.signOut();
  }

  async addArticle(article: Partial<Article>) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    return await supabaseClient!
      .from('articles')
      .insert([article])
      .select()
      .single();
  }

  async updateArticle(id: string, updates: Partial<Article>) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    return await supabaseClient!
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  async addEPaperPage(page: Partial<EPaperPage>) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    return await supabaseClient!
      .from('epaper_pages')
      .insert([page])
      .select()
      .single();
  }

  async updateEPaperRegions(id: string, regions: EPaperRegion[]) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    return await supabaseClient!
      .from('epaper_pages')
      .update({ regions })
      .eq('id', id)
      .select()
      .single();
  }

  async deleteEPaperPage(id: string) {
    if (!this.isConfigured()) return { data: null, error: { message: 'Supabase disconnected' } };
    return await supabaseClient!
      .from('epaper_pages')
      .delete()
      .eq('id', id);
  }
}

export const supabase = new SupabaseService();
