
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Article, UserRole, Profile, Category, EPaperPage, EPaperRegion } from '../../types';
import Cropper from 'cropperjs';

const Dashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [epaperPages, setEpaperPages] = useState<EPaperPage[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('articles');
  
  // Clipping Engine State
  const [isClipping, setIsClipping] = useState(false);
  const [clippingPage, setClippingPage] = useState<EPaperPage | null>(null);
  const [cropperInstance, setCropperInstance] = useState<Cropper | null>(null);
  const [linkedArticleId, setLinkedArticleId] = useState('');
  const cropperImageRef = useRef<HTMLImageElement>(null);

  // General Management State
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [newEpaperPage, setNewEpaperPage] = useState({ date: new Date().toISOString().split('T')[0], page_number: 1, image_url: '' });

  useEffect(() => {
    supabase.getCurrentUser().then(res => setUser(res.data));
    refreshData();
  }, []);

  const refreshData = () => {
    supabase.getArticles().then(res => setArticles(res.data || []));
    supabase.getCategories().then(res => setCategories(res.data || []));
    supabase.getEPaperPages().then(res => setEpaperPages(res.data || []));
    supabase.getAllUsers().then(res => setAllUsers(res.data || []));
  };

  const handleOpenClipping = (page: EPaperPage) => {
    setClippingPage(page);
    setIsClipping(true);
    setLinkedArticleId('');
  };

  useEffect(() => {
    if (isClipping && cropperImageRef.current && clippingPage) {
      const cropper = new Cropper(cropperImageRef.current, {
        dragMode: 'crop',
        autoCropArea: 0.5,
        restore: false,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      } as any);
      setCropperInstance(cropper);
      return () => cropper.destroy();
    }
  }, [isClipping, clippingPage]);

  const handleSaveRegion = async () => {
    if (!cropperInstance || !clippingPage) return;
    
    const data = (cropperInstance as any).getData();
    const canvas = (cropperInstance as any).getCanvasData();
    
    const region: EPaperRegion = {
      id: `region-${Date.now()}`,
      x: (data.x / canvas.naturalWidth) * 100,
      y: (data.y / canvas.naturalHeight) * 100,
      width: (data.width / canvas.naturalWidth) * 100,
      height: (data.height / canvas.naturalHeight) * 100,
      articleId: linkedArticleId,
      title: articles.find(a => a.id === linkedArticleId)?.title || 'Clipping'
    };

    const updatedRegions = [...(clippingPage.regions || []), region];
    await supabase.updateEPaperRegions(clippingPage.id, updatedRegions);
    
    setIsClipping(false);
    refreshData();
  };

  const handleOpenEditor = (article?: Article) => {
    if (article) setEditingArticle(article);
    else setEditingArticle({ title: '', summary: '', content: '', category: categories[0]?.name || '', status: 'DRAFT', thumbnail_url: 'https://picsum.photos/seed/new/800/450' });
    setIsEditing(true);
  };

  const handleSaveArticle = async (status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
    if (!editingArticle?.title) return;
    if (editingArticle.id) await supabase.updateArticle(editingArticle.id, { ...editingArticle, status });
    else await supabase.addArticle({ ...editingArticle, status });
    setIsEditing(false);
    refreshData();
  };

  if (!user || ![UserRole.ADMIN, UserRole.EDITOR, UserRole.PUBLISHER].includes(user.role)) {
    return <div className="p-20 text-center font-bold text-red-600 uppercase tracking-widest">Unauthorized Access</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Portal <span className="text-red-600">Dashboard</span></h1>
          <button onClick={() => handleOpenEditor()} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all">+ Create Article</button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 px-8 bg-white overflow-x-auto hide-scrollbar">
            {['Articles', 'E-Paper', 'Users', 'Taxonomy'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-0">
            {activeTab === 'articles' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
                      <th className="px-8 py-4">News Item</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Engagement</th>
                      <th className="px-8 py-4">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {articles.map(art => (
                      <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 flex items-center space-x-4">
                          <img src={art.thumbnail_url} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 line-clamp-1">{art.title}</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{art.category}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${art.status === 'PUBLISHED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {art.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-gray-500">{art.view_count.toLocaleString()} Views</td>
                        <td className="px-8 py-5">
                           <button onClick={() => handleOpenEditor(art)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2"/></svg></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'e-paper' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <input type="date" className="px-4 py-3 rounded-xl border-none outline-none font-bold text-sm" value={newEpaperPage.date} onChange={e => setNewEpaperPage({...newEpaperPage, date: e.target.value})} />
                  <input type="number" placeholder="Page #" className="px-4 py-3 rounded-xl border-none outline-none font-bold text-sm" value={newEpaperPage.page_number} onChange={e => setNewEpaperPage({...newEpaperPage, page_number: parseInt(e.target.value)})} />
                  <input type="text" placeholder="Image URL" className="px-4 py-3 rounded-xl border-none outline-none font-bold text-sm" value={newEpaperPage.image_url} onChange={e => setNewEpaperPage({...newEpaperPage, image_url: e.target.value})} />
                  <button onClick={() => { supabase.addEPaperPage(newEpaperPage); refreshData(); }} className="bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-95">Add Page</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {epaperPages.map(page => (
                    <div key={page.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                      <div className="aspect-[3/4.5] relative overflow-hidden bg-gray-100">
                        <img src={page.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                          <button onClick={() => handleOpenClipping(page)} className="w-full py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest mb-3 shadow-xl">Define Hotspots</button>
                          <button onClick={() => { if(confirm('Delete?')) supabase.deleteEPaperPage(page.id).then(refreshData); }} className="w-full py-3 bg-red-600/20 text-red-500 border border-red-500/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest">Remove Page</button>
                        </div>
                      </div>
                      <div className="p-6 flex justify-between items-center bg-gray-50 border-t">
                        <div>
                          <p className="text-[11px] font-black uppercase text-red-600 tracking-tighter">Edition Page {page.page_number}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{page.date}</p>
                        </div>
                        <span className="px-3 py-1 bg-white text-[9px] font-black rounded-lg border border-gray-100 uppercase text-gray-500">{page.regions?.length || 0} Links</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUsers.map(u => (
                    <div key={u.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex items-center space-x-6">
                       <img src={u.avatar} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md bg-gray-100 border-2 border-white" alt={u.name} />
                       <div className="flex-grow">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter line-clamp-1">{u.name}</h4>
                          <div className="flex items-center space-x-2 my-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                             <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{u.role}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{u.email}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLIPPING ENGINE MODAL */}
      {isClipping && clippingPage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsClipping(false)}></div>
          <div className="relative bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Define <span className="text-red-600">Interaction</span></h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Page {clippingPage.page_number} • Edition {clippingPage.date}</p>
              </div>
              <button onClick={() => setIsClipping(false)} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
            </div>
            
            <div className="flex-grow overflow-hidden grid grid-cols-1 lg:grid-cols-4">
              <div className="lg:col-span-3 bg-gray-100 flex items-center justify-center p-8 overflow-hidden relative">
                <div className="w-full h-full max-w-full max-h-full">
                  <img ref={cropperImageRef} src={clippingPage.image_url} alt="" className="max-w-full" />
                </div>
              </div>
              
              <div className="p-10 bg-white border-l border-gray-100 flex flex-col">
                <div className="flex-grow space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Connect to News Story</label>
                    <select 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-bold text-sm transition-all"
                      value={linkedArticleId}
                      onChange={e => setLinkedArticleId(e.target.value)}
                    >
                      <option value="">Select an Article...</option>
                      {articles.map(art => <option key={art.id} value={art.id}>{art.title}</option>)}
                    </select>
                  </div>
                  
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                    <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-3">Editor Hint</p>
                    <p className="text-[11px] text-red-900/70 font-medium leading-relaxed italic">Drag the crop zone over the newspaper story. Once saved, readers will be able to click this area to read the full digital report.</p>
                  </div>
                </div>

                <div className="pt-10 flex flex-col gap-3">
                   <button onClick={handleSaveRegion} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-gray-900/20 hover:bg-red-600 transition-all">Save Hotspot</button>
                   <button onClick={() => setIsClipping(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE EDITOR MODAL */}
      {isEditing && editingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-10 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl font-black uppercase tracking-tighter">{editingArticle.id ? 'Refine' : 'Construct'} <span className="text-red-600">News</span></h2>
              <button onClick={() => setIsEditing(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
            </div>
            <div className="flex-grow overflow-y-auto p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Headline</label>
                <input type="text" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-bold transition-all" value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Classification</label>
                    <select className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" value={editingArticle.category} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Lead Image URL</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" value={editingArticle.thumbnail_url} onChange={e => setEditingArticle({...editingArticle, thumbnail_url: e.target.value})} />
                 </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Article Body (HTML Supported)</label>
                <textarea rows={10} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-serif leading-relaxed transition-all" value={editingArticle.content} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} />
              </div>
            </div>
            <div className="px-10 py-8 bg-gray-50 border-t flex gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button onClick={() => handleSaveArticle('DRAFT')} className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">Stash as Draft</button>
                <button onClick={() => handleSaveArticle('PENDING')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Submit for Review</button>
              </div>
              <button onClick={() => handleSaveArticle('PUBLISHED')} className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all">Publish Live</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
