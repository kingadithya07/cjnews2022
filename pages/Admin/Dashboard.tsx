
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { Article, UserRole, Profile, Category, EPaperPage, EPaperRegion } from '../../types.ts';
import Cropper from 'cropperjs';

/**
 * Custom Rich Text Editor Component
 */
const RichTextEditor: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-inner">
      <div className="flex flex-wrap items-center p-3 gap-1 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
        <button type="button" onClick={() => exec('bold')} className="p-2 hover:bg-white rounded-lg transition-all" title="Bold"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" strokeWidth="2.5"/></svg></button>
        <button type="button" onClick={() => exec('italic')} className="p-2 hover:bg-white rounded-lg transition-all" title="Italic"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 4h-9L7 20h9l3-16z" strokeWidth="2.5"/></svg></button>
        <button type="button" onClick={() => exec('underline')} className="p-2 hover:bg-white rounded-lg transition-all" title="Underline"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3M4 21h16" strokeWidth="2.5"/></svg></button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <button type="button" onClick={() => exec('formatBlock', 'h1')} className="px-2 py-1 hover:bg-white rounded-lg font-black text-xs uppercase" title="H1">H1</button>
        <button type="button" onClick={() => exec('formatBlock', 'h2')} className="px-2 py-1 hover:bg-white rounded-lg font-black text-xs uppercase" title="H2">H2</button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg transition-all" title="Bullets"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2.5"/></svg></button>
        <button type="button" onClick={() => exec('createLink', prompt('URL:') || '')} className="p-2 hover:bg-white rounded-lg transition-all" title="Link"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2.5"/></svg></button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-8 min-h-[300px] outline-none prose prose-red max-w-none font-serif text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [epaperPages, setEpaperPages] = useState<EPaperPage[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Clipping Engine State
  const [isClipping, setIsClipping] = useState(false);
  const [clippingPage, setClippingPage] = useState<EPaperPage | null>(null);
  const [cropperInstance, setCropperInstance] = useState<Cropper | null>(null);
  const [linkedArticleId, setLinkedArticleId] = useState('');
  const [manualHotspotTitle, setManualHotspotTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const cropperImageRef = useRef<HTMLImageElement>(null);

  // Taxonomy State
  const [isEditingTaxonomy, setIsEditingTaxonomy] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Tier Management State
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [editingTierUser, setEditingTierUser] = useState<Profile | null>(null);

  // General Management State
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [newEpaperPage, setNewEpaperPage] = useState({ date: new Date().toISOString().split('T')[0], page_number: 1, image_url: '' });

  useEffect(() => {
    supabase.getCurrentUser().then(res => setUser(res.data));
    refreshData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      supabase.getArticles(),
      supabase.getCategories(),
      supabase.getEPaperPages(),
      supabase.getAllUsers()
    ]).then(([art, cat, ep, usr]) => {
      setArticles(art.data || []);
      setCategories(cat.data || []);
      setEpaperPages(ep.data || []);
      setAllUsers(usr.data || []);
      setLoading(false);
    });
  };

  const handleOpenClipping = (page: EPaperPage) => {
    setClippingPage(page);
    setIsClipping(true);
    setLinkedArticleId('');
    setManualHotspotTitle('');
    setSearchTerm('');
  };

  useEffect(() => {
    if (isClipping && cropperImageRef.current && clippingPage) {
      // Ensure image is loaded before initializing cropper
      const initCropper = () => {
        const cropper = new Cropper(cropperImageRef.current!, {
          dragMode: 'crop',
          autoCropArea: 0.5,
          restore: false,
          guides: true,
          center: true,
          highlight: true,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          viewMode: 1, // Restrict the crop box to not exceed the size of the canvas
        } as any);
        setCropperInstance(cropper);
      };

      if (cropperImageRef.current.complete) {
        initCropper();
      } else {
        cropperImageRef.current.onload = initCropper;
      }

      return () => {
        if (cropperInstance) cropperInstance.destroy();
      };
    }
  }, [isClipping, clippingPage?.id]);

  const handleSaveRegion = async () => {
    if (!cropperInstance || !clippingPage) return;
    
    setIsSaving(true);
    const data = (cropperInstance as any).getData();
    const canvas = (cropperInstance as any).getCanvasData();
    
    const articleTitle = articles.find(a => a.id === linkedArticleId)?.title;
    const finalTitle = manualHotspotTitle || articleTitle || 'Hotlink Region';

    const region: EPaperRegion = {
      id: `region-${Date.now()}`,
      x: (data.x / canvas.naturalWidth) * 100,
      y: (data.y / canvas.naturalHeight) * 100,
      width: (data.width / canvas.naturalWidth) * 100,
      height: (data.height / canvas.naturalHeight) * 100,
      articleId: linkedArticleId || undefined,
      title: finalTitle
    };

    const updatedRegions = [...(clippingPage.regions || []), region];
    const { error } = await supabase.updateEPaperRegions(clippingPage.id, updatedRegions);
    
    setIsSaving(false);
    if (error) {
      alert("Error saving hotspot: " + error.message);
    } else {
      setClippingPage({ ...clippingPage, regions: updatedRegions });
      setLinkedArticleId('');
      setManualHotspotTitle('');
      // We keep the modal open to add more regions, but refresh background data
      refreshData();
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    if (!clippingPage) return;
    if (!confirm('Permanently remove this hotspot?')) return;

    setIsSaving(true);
    const updatedRegions = (clippingPage.regions || []).filter(r => r.id !== regionId);
    const { error } = await supabase.updateEPaperRegions(clippingPage.id, updatedRegions);
    
    setIsSaving(false);
    if (!error) {
      setClippingPage({ ...clippingPage, regions: updatedRegions });
      refreshData();
    }
  };

  const handleOpenEditor = (article?: Article) => {
    if (article) setEditingArticle(article);
    else setEditingArticle({ 
      title: '', 
      summary: '', 
      content: '<p>Start typing the news story...</p>', 
      category: categories[0]?.name || 'General', 
      status: 'DRAFT', 
      thumbnail_url: 'https://picsum.photos/seed/new/800/450' 
    });
    setIsEditing(true);
  };

  const handleSaveArticle = async (status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
    if (!editingArticle?.title) return;
    setLoading(true);
    if (editingArticle.id) await supabase.updateArticle(editingArticle.id, { ...editingArticle, status });
    else await supabase.addArticle({ ...editingArticle, status });
    setIsEditing(false);
    refreshData();
  };

  const handleSaveTaxonomy = async () => {
    if (!editingCategory?.name) return;
    setLoading(true);
    await supabase.saveCategory(editingCategory);
    setIsEditingTaxonomy(false);
    refreshData();
  };

  const handleSaveTier = async (newRole: UserRole) => {
    if (!editingTierUser) return;
    setIsSaving(true);
    const { error } = await supabase.updateProfile(editingTierUser.id, { role: newRole });
    setIsSaving(false);
    if (error) {
      alert("Failed to update user role: " + error.message);
    } else {
      setIsEditingTier(false);
      refreshData();
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || ![UserRole.ADMIN, UserRole.EDITOR, UserRole.PUBLISHER].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="text-center p-20 bg-white rounded-[3rem] shadow-2xl">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2.5"/></svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Access Denied</h1>
            <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest font-bold">Unauthorized Portal Entry Attempt</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Portal <span className="text-red-600">Dashboard</span></h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Managing CJNewsHub Newsroom Network</p>
          </div>
          <div className="flex gap-4">
             <button onClick={refreshData} className="p-4 bg-white text-gray-400 hover:text-red-600 rounded-2xl shadow-sm border border-gray-100 transition-all">
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
             <button onClick={() => handleOpenEditor()} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all">
                + Create News Story
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 px-10 bg-white overflow-x-auto hide-scrollbar">
            {['Articles', 'E-Paper', 'Users', 'Taxonomy'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'border-red-600 text-red-600 bg-red-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-0 min-h-[500px]">
            {activeTab === 'articles' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
                      <th className="px-10 py-5">Headline & Category</th>
                      <th className="px-10 py-5">Status</th>
                      <th className="px-10 py-5">Engagement</th>
                      <th className="px-10 py-5">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {articles.map(art => (
                      <tr key={art.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-10 py-6 flex items-center space-x-5">
                          <img src={art.thumbnail_url} className="w-16 h-16 rounded-2xl object-cover shadow-md border border-gray-100" alt="" />
                          <div>
                            <span className="text-sm font-black text-gray-900 line-clamp-1 mb-1 tracking-tight">{art.title}</span>
                            <div className="flex items-center space-x-2">
                               <span className="text-[9px] text-red-600 font-black uppercase tracking-widest">{art.category}</span>
                               <span className="text-gray-300">•</span>
                               <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(art.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${art.status === 'PUBLISHED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {art.status}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2.5"/></svg>
                              <span className="text-xs font-black text-gray-600">{art.view_count.toLocaleString()}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <button onClick={() => handleOpenEditor(art)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5"/></svg>
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'taxonomy' && (
              <div className="p-10 space-y-10">
                <div className="flex justify-between items-center">
                   <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 border-l-4 border-red-600 pl-4">Category Management</h3>
                   <button onClick={() => { setEditingCategory({ name: '', subcategories: [] }); setIsEditingTaxonomy(true); }} className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">Add Category</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingCategory(cat); setIsEditingTaxonomy(true); }} className="p-2 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-gray-100">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2"/></svg>
                         </button>
                       </div>
                       <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">{cat.name}</h4>
                       <div className="flex flex-wrap gap-2">
                         {cat.subcategories.map(sub => (
                           <span key={sub} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{sub}</span>
                         ))}
                       </div>
                       <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Count</span>
                          <span className="text-xs font-black text-red-600">{cat.article_count || 0}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'e-paper' && (
              <div className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                   <div className="lg:col-span-3 p-8 bg-gray-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tighter">Edition Page Creator</h4>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Append new digital pages to archives</p>
                      </div>
                      <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <input type="date" className="px-5 py-3 rounded-xl bg-white/10 border-none outline-none font-bold text-xs uppercase tracking-widest" value={newEpaperPage.date} onChange={e => setNewEpaperPage({...newEpaperPage, date: e.target.value})} />
                        <input type="number" placeholder="Page #" className="w-24 px-5 py-3 rounded-xl bg-white/10 border-none outline-none font-bold text-xs" value={newEpaperPage.page_number} onChange={e => setNewEpaperPage({...newEpaperPage, page_number: parseInt(e.target.value)})} />
                        <input type="text" placeholder="CDN Image URL" className="flex-grow px-5 py-3 rounded-xl bg-white/10 border-none outline-none font-bold text-xs" value={newEpaperPage.image_url} onChange={e => setNewEpaperPage({...newEpaperPage, image_url: e.target.value})} />
                        <button onClick={() => { supabase.addEPaperPage(newEpaperPage); refreshData(); }} className="px-8 py-3 bg-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-colors">Add</button>
                      </div>
                   </div>
                   <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Active Edition</span>
                      <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                      <button className="mt-4 text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline text-left">Configure Retention Tools →</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  {epaperPages.map(page => (
                    <div key={page.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                      <div className="aspect-[3/4.5] relative overflow-hidden bg-gray-50">
                        <img src={page.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="" />
                        <div className="absolute inset-0 bg-gray-900/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                          <button onClick={() => handleOpenClipping(page)} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest mb-3 shadow-xl hover:bg-red-600 hover:text-white transition-all">
                             Define Hotspots
                          </button>
                          <button onClick={() => { if(confirm('Permanently remove this archive page?')) supabase.deleteEPaperPage(page.id).then(refreshData); }} className="w-full py-4 bg-red-600/10 text-red-500 border border-red-500/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                             Remove Archive
                          </button>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-xl px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-900 z-10">
                           {page.regions?.length || 0} Links
                        </div>
                      </div>
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                           <p className="text-[11px] font-black uppercase text-gray-900 tracking-tighter">Edition Page {page.page_number}</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{page.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allUsers.map(u => (
                    <div key={u.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all flex items-center space-x-6 relative group">
                       <img src={u.avatar || 'https://via.placeholder.com/100'} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg bg-gray-100 border-4 border-white" alt={u.name} />
                       <div className="flex-grow">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter line-clamp-1 mb-1">{u.name}</h4>
                          <div className="flex items-center space-x-2 mb-2">
                             <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{u.role}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1 italic">@{u.username}</p>
                       </div>
                       <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingTierUser(u); setIsEditingTier(true); }}
                            className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600"
                          >
                            Edit Tier
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* USER TIER EDITOR MODAL */}
      {isEditingTier && editingTierUser && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-lg" onClick={() => setIsEditingTier(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 overflow-hidden">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3c1.72 0 3.347.433 4.774 1.2a10.001 10.001 0 014.532 12.408l-.062.113a10.003 10.003 0 01-15.63 3.041m6.438-6.438a1.5 1.5 0 102.122 2.122 1.5 1.5 0 00-2.122-2.122z" strokeWidth="2.5"/></svg>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Modify <span className="text-red-600">Access Tier</span></h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configuring permissions for {editingTierUser.name}</p>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {[
                  { role: UserRole.ADMIN, desc: 'Full root access to all system tools & user management.' },
                  { role: UserRole.PUBLISHER, desc: 'Can publish, edit, and feature news stories and e-paper.' },
                  { role: UserRole.EDITOR, desc: 'Can create and modify drafts. Review access to news assets.' },
                  { role: UserRole.READER, desc: 'Public identity with ability to comment and save favorites.' }
                ].map((tier) => (
                  <button 
                    key={tier.role}
                    onClick={() => handleSaveTier(tier.role)}
                    disabled={isSaving}
                    className={`w-full p-6 text-left rounded-[2rem] border-2 transition-all flex items-center gap-6 group ${editingTierUser.role === tier.role ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-gray-50 border-gray-100 hover:border-red-200'}`}
                  >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${editingTierUser.role === tier.role ? 'bg-white/20 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                        {tier.role.charAt(0)}
                     </div>
                     <div className="flex-1">
                        <h4 className={`text-[11px] font-black uppercase tracking-widest mb-1 ${editingTierUser.role === tier.role ? 'text-white' : 'text-gray-900'}`}>{tier.role}</h4>
                        <p className={`text-[9px] font-medium leading-tight ${editingTierUser.role === tier.role ? 'text-white/60' : 'text-gray-400'}`}>{tier.desc}</p>
                     </div>
                     {editingTierUser.role === tier.role && (
                        <svg className="w-5 h-5 text-white animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     )}
                  </button>
                ))}
             </div>

             <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsEditingTier(false)}
                  className="text-gray-400 text-[9px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
                >
                  Cancel & Discard Changes
                </button>
             </div>
          </div>
        </div>
      )}

      {/* TAXONOMY EDITOR MODAL */}
      {isEditingTaxonomy && editingCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md" onClick={() => setIsEditingTaxonomy(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 overflow-hidden">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-center">Manage <span className="text-red-600">Category</span></h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Category Label</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-bold transition-all"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  placeholder="e.g. World News"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Sub-Classifications (Comma Separated)</label>
                <textarea 
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-bold transition-all text-xs"
                  value={editingCategory.subcategories?.join(', ')}
                  onChange={e => setEditingCategory({...editingCategory, subcategories: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="Local, National, Global"
                  rows={3}
                />
              </div>
              <div className="pt-6 flex flex-col gap-3">
                 <button onClick={handleSaveTaxonomy} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-gray-900/20">Commit Changes</button>
                 {editingCategory.id && (
                    <button onClick={() => { if(confirm('Delete this category?')) supabase.deleteCategory(editingCategory.id!).then(refreshData); setIsEditingTaxonomy(false); }} className="w-full py-4 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase text-[10px] tracking-widest">Destroy Category</button>
                 )}
                 <button onClick={() => setIsEditingTaxonomy(false)} className="w-full py-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Abandon Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIPPING ENGINE MODAL */}
      {isClipping && clippingPage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl" onClick={() => setIsClipping(false)}></div>
          <div className="relative bg-white w-full max-w-7xl h-full max-h-[95vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-12 py-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Interaction <span className="text-red-600">Mapper</span></h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Edition {clippingPage.date} • Page {clippingPage.page_number}</p>
              </div>
              <button onClick={() => setIsClipping(false)} className="p-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-all border border-gray-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round"/></svg></button>
            </div>
            
            <div className="flex-grow overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 bg-gray-100 flex items-center justify-center p-12 overflow-hidden relative border-r border-gray-100">
                <div className="w-full h-full max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden border-8 border-white bg-white relative">
                  <img ref={cropperImageRef} src={clippingPage.image_url} alt="" className="max-w-full" />
                  
                  {/* OVERLAY EXISTING REGIONS VISUALLY */}
                  {clippingPage.regions?.map((r) => (
                    <div 
                      key={r.id}
                      className="absolute border border-red-600 bg-red-600/10 pointer-events-none z-10"
                      style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        width: `${r.width}%`,
                        height: `${r.height}%`
                      }}
                    >
                       <span className="absolute -top-6 left-0 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded truncate max-w-[150px] shadow-lg">
                         {r.title}
                       </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-4 p-8 bg-white flex flex-col h-full overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-8 pr-2">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2">Manual Hotspot Title</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 font-bold text-xs"
                        placeholder="e.g. Ad Spotlight, Video Link..."
                        value={manualHotspotTitle}
                        onChange={e => setManualHotspotTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Link News Asset (Optional)</label>
                      <div className="relative">
                         <input 
                           type="text" 
                           className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 mb-2 font-bold text-xs"
                           placeholder="Search articles..."
                           value={searchTerm}
                           onChange={e => setSearchTerm(e.target.value)}
                         />
                         <div className="max-h-[180px] overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-inner p-1">
                            {filteredArticles.length > 0 ? filteredArticles.map(art => (
                              <button 
                                key={art.id}
                                onClick={() => {
                                  setLinkedArticleId(art.id);
                                  if (!manualHotspotTitle) setManualHotspotTitle(art.title);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${linkedArticleId === art.id ? 'bg-red-600 text-white' : 'hover:bg-gray-50'}`}
                              >
                                 <div className="flex-1 min-w-0">
                                    <p className={`text-[11px] font-black uppercase truncate ${linkedArticleId === art.id ? 'text-white' : 'text-gray-900'}`}>{art.title}</p>
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${linkedArticleId === art.id ? 'text-white/60' : 'text-gray-400'}`}>{art.category}</p>
                                 </div>
                                 {linkedArticleId === art.id && <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </button>
                            )) : <p className="p-4 text-center text-[10px] text-gray-400 font-bold uppercase">No matching assets</p>}
                         </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveRegion}
                    disabled={isSaving}
                    className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-gray-900/30 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? 'Syncing Hotspot...' : 'Commit New Hotspot'}
                  </button>

                  <div className="pt-8 border-t border-gray-100">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center">
                       <span className="w-4 h-0.5 bg-red-600 mr-3"></span> Current Page Hotspots
                    </h4>
                    <div className="space-y-3">
                      {clippingPage.regions && clippingPage.regions.length > 0 ? clippingPage.regions.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                           <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-gray-900 uppercase truncate leading-tight">{r.title}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Region ID: {r.id.split('-')[1]}</p>
                           </div>
                           <button onClick={() => handleDeleteRegion(r.id)} className="ml-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                           </button>
                        </div>
                      )) : (
                        <div className="py-8 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                           <p className="text-[10px] font-bold text-gray-400 uppercase">No active hotlinks</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                   <button onClick={() => setIsClipping(false)} className="w-full py-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hover:text-gray-900 transition-colors">Finish & Exit Mapper</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE EDITOR MODAL (CMS STYLE) */}
      {isEditing && editingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
          <div className="relative bg-white w-full max-w-5xl h-full max-h-[92vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-12 py-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" strokeWidth="2.5"/></svg>
                 </div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">News <span className="text-red-600">Composition</span></h2>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">{editingArticle.id ? 'Refining Archive Asset' : 'Constructing New Narrative'}</p>
                 </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-4 hover:bg-gray-100 rounded-full transition-colors"><svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round"/></svg></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-12 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-8 space-y-8">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Primary Headline</label>
                      <input 
                        type="text" 
                        className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-black text-2xl tracking-tight transition-all shadow-inner" 
                        placeholder="Enter the main title..."
                        value={editingArticle.title} 
                        onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">Article Body Content</label>
                      <RichTextEditor 
                        value={editingArticle.content || ''} 
                        onChange={val => setEditingArticle({...editingArticle, content: val})} 
                      />
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-10">
                    <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-inner">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center">
                           <span className="w-6 h-0.5 bg-red-600 mr-3"></span> Attributes
                        </h4>
                        <div className="space-y-6">
                           <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Classification</label>
                              <select className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 font-bold text-xs outline-none" value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})}>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Lead Media URL</label>
                              <input type="text" className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 font-bold text-xs outline-none" value={editingArticle.thumbnail_url} onChange={e => setEditingArticle({...editingArticle, thumbnail_url: e.target.value})} />
                              <img src={editingArticle.thumbnail_url} className="mt-4 w-full h-32 object-cover rounded-2xl border-4 border-white shadow-md" alt="Preview" />
                           </div>
                           <div className="pt-4 flex items-center gap-2">
                              <input type="checkbox" id="featured" className="w-4 h-4 rounded" checked={editingArticle.is_featured} onChange={e => setEditingArticle({...editingArticle, is_featured: e.target.checked})} />
                              <label htmlFor="featured" className="text-[10px] font-black uppercase tracking-widest text-gray-600">Mark as Featured Story</label>
                           </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-[3rem] text-white">
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-white/50 mb-6">Story Logistics</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                             <span className="text-[10px] text-white/40 uppercase font-black">Author ID</span>
                             <span className="text-[10px] font-mono text-white/60">{user.id.slice(0, 8)}...</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                             <span className="text-[10px] text-white/40 uppercase font-black">Publish Level</span>
                             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{user.role}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="px-12 py-10 bg-gray-50 border-t flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => handleSaveArticle('DRAFT')} className="px-10 py-5 bg-white border border-gray-200 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all shadow-sm">Stash as Draft</button>
                <button onClick={() => handleSaveArticle('PENDING')} className="px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/20">Submit for Review</button>
              </div>
              <button onClick={() => handleSaveArticle('PUBLISHED')} className="w-full md:w-auto px-16 py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all">Go Live Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
