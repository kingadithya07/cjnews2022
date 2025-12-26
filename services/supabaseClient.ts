
import { createClient } from '@supabase/supabase-js';
import { Article, Profile, UserRole, Classified, EPaperPage, EPaperRegion, Category } from '../types.ts';
import { MOCK_ARTICLES, MOCK_CLASSIFIEDS, MOCK_EPAPER } from '../constants.tsx';

/**
 * CJNewsHub Supabase Configuration
 */
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wpfzfozfxtwdaejramfz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZnpmb3pmeHR3ZGFlanJhbWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjExNzMsImV4cCI6MjA4MjIzNzE3M30.Bd6IbBcd_KgcgkfYGPvGUbqsfnlNuhJP5q-6p8BHQVk';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseService {
  private usernameToEmail(username: string): string {
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    return `${cleanUsername}@cjnewshub.internal`;
  }

  private isValidUUID(uuid: string) {
    const s = "" + uuid;
    const match = s.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
    return match !== null;
  }

  async getArticles() {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      .select('*')
      .order('name', { ascending: true });
  }

  async saveCategory(category: Partial<Category>) {
    if (category.id && this.isValidUUID(category.id)) {
      return await supabaseClient.from('categories').update(category).eq('id', category.id);
    }
    return await supabaseClient.from('categories').insert([category]);
  }

  async deleteCategory(id: string) {
    if (!this.isValidUUID(id)) return { error: { message: "Mock data cannot be deleted from server." } };
    return await supabaseClient.from('categories').delete().eq('id', id);
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
      if (!this.isValidUUID(id)) {
         const art = MOCK_ARTICLES.find(a => a.id === id);
         return { data: art || null, error: null };
      }
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
    if (!this.isValidUUID(id)) return { error: { message: "Mock profile cannot be updated on server." } };
    return await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }

  async verifyProfile(id: string) {
    if (!this.isValidUUID(id)) return { error: { message: "Mock profile cannot be verified." } };
    return await supabaseClient
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', id)
      .select()
      .single();
  }

  async getCurrentUser() {
    try {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      if (!authUser) return { data: null, error: null };
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  }

  async signUp(username: string, password: string, name: string, role: UserRole) {
    const email = this.usernameToEmail(username);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, username: username.toLowerCase().trim() }
      }
    });
    return { data, error };
  }

  async signIn(username: string, password: string) {
    const email = this.usernameToEmail(username);
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
    if (!this.isValidUUID(id)) return { error: { message: "Mock article cannot be updated on server." } };
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
    if (!this.isValidUUID(id)) {
       return { error: { message: "Mock E-Paper archive cannot be modified on the server." } };
    }
    const { data, error } = await supabaseClient
      .from('epaper_pages')
      .update({ regions })
      .eq('id', id)
      .select();
    
    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: null, error: { message: "Target record not found." } };
    return { data: data[0], error: null };
  }

  async deleteEPaperPage(id: string) {
    if (!this.isValidUUID(id)) return { error: { message: "Mock E-Paper page cannot be deleted." } };
    return await supabaseClient
      .from('epaper_pages')
      .delete()
      .eq('id', id);
  }

  async getSystemSettings() {
    return await supabaseClient.from('system_settings').select('*');
  }

  async updateSystemSetting(key: string, value: any) {
    return await supabaseClient.from('system_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  }
}

export const supabase = new SupabaseService();
