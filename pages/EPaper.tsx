
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { EPaperPage, EPaperRegion } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import Cropper from 'cropperjs';

const EPaper: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pages, setPages] = useState<EPaperPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Clipping Modal State
  const [isClipModalOpen, setIsClipModalOpen] = useState(false);
  const [clippingRegion, setClippingRegion] = useState<EPaperRegion | null>(null);
  const [cropperInstance, setCropperInstance] = useState<Cropper | null>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoading(true);
    supabase.getEPaperPages(selectedDate).then(res => {
      setPages(res.data || []);
      setCurrentPageIndex(0);
      setLoading(false);
    });
  }, [selectedDate]);

  const currentPage = pages[currentPageIndex];

  // Initialize Cropper for reader-side clipping
  useEffect(() => {
    if (isClipModalOpen && cropImageRef.current) {
      const cropper = new Cropper(cropImageRef.current, {
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: clippingRegion ? 0.8 : 0.5,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      } as any);

      // If a region was passed, pre-set the crop box to that region (simplified)
      if (clippingRegion) {
        // CropperJS setCropBoxData uses pixels, converting % to pixels is complex here
        // We'll let the user adjust for now, but focus the area
      }

      setCropperInstance(cropper);
      return () => cropper.destroy();
    }
  }, [isClipModalOpen, clippingRegion]);

  const handleDownloadClip = () => {
    if (!cropperInstance) return;
    const canvas = (cropperInstance as any).getCroppedCanvas();
    const link = document.createElement('a');
    link.download = `cjnewshub-clip-${selectedDate}-p${currentPage.page_number}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsClipModalOpen(false);
  };

  const handleFreeCrop = () => {
    setClippingRegion(null);
    setIsClipModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Digital <span className="text-red-600">Edition</span></h1>
            <p className="text-gray-500 text-sm mt-1">Daily Interactive E-Paper Archives</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleFreeCrop}
              disabled={loading || pages.length === 0}
              className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95 disabled:opacity-30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2.5"/><path d="M9 11l3 3 3-3" strokeWidth="2.5"/></svg>
              <span>Free Crop Tool</span>
            </button>

            <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Edition Date</label>
              <input 
                type="date" 
                className="px-4 py-2 border-none outline-none font-bold text-gray-900 bg-transparent"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[70vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : pages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9 space-y-6">
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden group/main">
                <div className="relative aspect-[3/4.5] bg-gray-50 overflow-hidden">
                   <img 
                    src={currentPage.image_url} 
                    className="w-full h-full object-contain" 
                    alt={`Page ${currentPage.page_number}`} 
                  />
                  
                  {currentPage.regions?.map((region) => (
                    <div
                      key={region.id}
                      className="absolute border-2 border-transparent hover:border-red-600/40 hover:bg-red-600/5 transition-all cursor-pointer z-10 group/region"
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/region:opacity-100 transition-all transform scale-90 group-hover/region:scale-100 bg-gray-900/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl min-w-[200px] z-20 pointer-events-auto flex flex-col gap-2 border border-white/10">
                        <p className="text-[10px] font-black uppercase text-white tracking-widest text-center mb-1 line-clamp-2">{region.title || 'Interactive Spot'}</p>
                        <div className="grid grid-cols-1 gap-2">
                          {region.articleId && (
                            <button 
                              onClick={() => navigate(`/article/${region.articleId}`)}
                              className="w-full py-2 px-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                            >
                              Read Full Story
                            </button>
                          )}
                          <button 
                            onClick={() => { setClippingRegion(region); setIsClipModalOpen(true); }}
                            className="w-full py-2 px-4 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
                          >
                            Crop & Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-between px-10 z-30">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xl font-black text-red-600 tracking-tighter">CJNEWS</span>
                        <span className="text-xl font-black text-gray-900 tracking-tighter">HUB</span>
                      </div>
                      <span className="w-px h-4 bg-gray-200"></span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter leading-none">Digital Edition</span>
                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-0.5">
                          {new Date(currentPage.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                       <div className="hidden sm:flex flex-col items-end">
                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">Verified Publication</span>
                         <span className="text-[9px] font-medium text-gray-400">© 2024 CJNewsHub Network</span>
                       </div>
                       <div className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                         Page {currentPage.page_number}
                       </div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex(prev => prev - 1)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl flex items-center justify-center disabled:opacity-20 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover/main:opacity-100"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button 
                  disabled={currentPageIndex === pages.length - 1}
                  onClick={() => setCurrentPageIndex(prev => prev + 1)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl flex items-center justify-center disabled:opacity-20 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover/main:opacity-100"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-32">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 border-l-4 border-red-600 pl-4">Edition Explorer</h3>
                <div className="space-y-4">
                  {pages.map((page, idx) => (
                    <button 
                      key={page.id}
                      onClick={() => setCurrentPageIndex(idx)}
                      className={`flex items-center w-full p-3 rounded-2xl border transition-all ${currentPageIndex === idx ? 'bg-red-50 border-red-100 shadow-md ring-4 ring-red-50/50' : 'border-gray-50 hover:bg-gray-50'}`}
                    >
                      <div className="w-12 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={page.image_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="ml-4 text-left">
                        <p className={`text-[11px] font-black uppercase ${currentPageIndex === idx ? 'text-red-600' : 'text-gray-900'}`}>Page {page.page_number}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[4rem] border border-dashed border-gray-200 p-12 text-center">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-3">Archive Not Found</h2>
            <p className="text-gray-400 text-sm max-w-md uppercase tracking-widest font-bold">Try selecting a different date from the edition explorer above.</p>
          </div>
        )}
      </div>

      {isClipModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md" onClick={() => setIsClipModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2.5"/></svg>
                 </div>
                 <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Clipping <span className="text-red-600">Portal</span></h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{clippingRegion ? `Focus: ${clippingRegion.title}` : 'Manual Archive Capture'}</p>
                 </div>
              </div>
              <button onClick={() => setIsClipModalOpen(false)} className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-full transition-all border border-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round"/></svg>
              </button>
            </div>
            
            <div className="flex-grow bg-gray-100 overflow-hidden flex items-center justify-center relative">
               <div className="w-full h-full max-w-full max-h-full">
                  <img ref={cropImageRef} src={currentPage.image_url} alt="Clip area" className="max-w-full" />
               </div>
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 z-20">
                  <p className="text-[9px] font-black uppercase text-white tracking-widest whitespace-nowrap">Adjust borders to frame your clip</p>
               </div>
            </div>

            <div className="p-10 bg-white border-t border-gray-100 flex flex-col md:flex-row gap-6 justify-between items-center">
              <button 
                onClick={handleDownloadClip}
                className="w-full md:w-auto px-16 py-4 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-900/20 active:scale-95"
              >
                Capture & Download Archive
              </button>
              <button 
                onClick={() => setIsClipModalOpen(false)}
                className="w-full md:w-auto px-10 py-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hover:text-gray-900 transition-colors"
              >
                Cancel Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPaper;
