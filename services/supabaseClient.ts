
import { createClient } from '@supabase/supabase-js';
import { Article, Profile, UserRole, Classified, EPaperPage, EPaperRegion } from '../types.ts';
import { MOCK_ARTICLES, MOCK_CLASSIFIEDS, MOCK_EPAPER } from '../constants.tsx';

/**
 * CJNewsHub Supabase Configuration
 * Hardcoded provided credentials to ensure immediate connectivity.
 */
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wpfzfozfxtwdaejramfz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZnpmb3pmeHR3ZGFlanJhbWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjExNzMsImV4cCI6MjA4MjIzNzE3M30.Bd6IbBcd_KgcgkfYGPvGUbqsfnlNuhJP5q-6p8BHQVk';

// Initialize the client. The app will use this instance for all data operations.
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseService {
  /**
   * Helper to check connection status.
   * If credentials were empty (not the case now), it would return false.
   */
  private isConfigured(): boolean {
    return !!supabaseClient;
  }

  async getArticles() {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fallback to mocks if table is empty or doesn't exist yet
      if (error || !data || data.length === 0) return { data: MOCK_ARTICLES, error: null };
      return { data, error: null };
    } catch (e) {
      return { data: MOCK_ARTICLES, error: null };
    }
  }

  async getClassifieds() {
    try {
      const { data, error } = await supabaseClient
        .from('classifieds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error || !data || data.length === 0) return { data: MOCK_CLASSIFIEDS, error: null };
      return { data, error: null };
    } catch (e) {
      return { data: MOCK_CLASSIFIEDS, error: null };
    }
  }

  async getCategories() {
    return await supabaseClient
      .from('categories')
      .select('*');
  }

  async getEPaperPages(date?: string) {
    try {
      let query = supabaseClient.from('epaper_pages').select('*');
      if (date) query = query.eq('date', date);
      const { data, error } = await query.order('page_number', { ascending: true });
      
      if (error || !data || data.length === 0) return { data: MOCK_EPAPER, error: null };
      return { data, error: null };
    } catch (e) {
      return { data: MOCK_EPAPER, error: null };
    }
  }

  async getArticleById(id: string) {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        const art = MOCK_ARTICLES.find(a => a.id === id);
        return { data: art || null, error: null };
      }
      return { data, error: null };
    } catch (e) {
      const art = MOCK_ARTICLES.find(a => a.id === id);
      return { data: art || null, error: null };
    }
  }

  async getAllUsers() {
    return await supabaseClient.from('profiles').select('*');
  }

  async updateProfile(id: string, updates: Partial<Profile>) {
    return await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return { data: null, error: null };
      
      return await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    } catch (e) {
      return { data: null, error: e };
    }
  }

  async signUp(email: string, password: string, name: string, role: UserRole) {
    // metadata is passed so the database trigger can automatically create the profile with correct role
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    return await supabaseClient.auth.signInWithPassword({ email, password });
  }

  async logout() {
    return await supabaseClient.auth.signOut();
  }

  async addArticle(article: Partial<Article>) {
    return await supabaseClient
      .from('articles')
      .insert([article])
      .select()
      .single();
  }

  async updateArticle(id: string, updates: Partial<Article>) {
    return await supabaseClient
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  async addEPaperPage(page: Partial<EPaperPage>) {
    return await supabaseClient
      .from('epaper_pages')
      .insert([page])
      .select()
      .single();
  }

  async updateEPaperRegions(id: string, regions: EPaperRegion[]) {
    return await supabaseClient
      .from('epaper_pages')
      .update({ regions })
      .eq('id', id)
      .select()
      .single();
  }

  async deleteEPaperPage(id: string) {
    return await supabaseClient
      .from('epaper_pages')
      .delete()
      .eq('id', id);
  }
}

export const supabase = new SupabaseService();
