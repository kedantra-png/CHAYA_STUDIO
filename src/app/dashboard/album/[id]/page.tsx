"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { db, Album, AlbumPage, MediaItem, sampleVideos, samplePhotos, sampleMusic } from "@/lib/db";
import { BookViewer } from "@/components/album-viewer/BookViewer";
import { 
  Sparkles, 
  BookOpen, 
  ImageIcon, 
  VideoIcon, 
  Music, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronLeft,
  Layout, 
  Wand2, 
  FileVideo,
  Lock,
  Calendar,
  CheckCircle,
  Eye,
  Volume2,
  X,
  QrCode
} from "@/components/icons";
import { QRCodeSVG } from 'qrcode.react';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function AlbumEditorPage({ params }: EditorPageProps) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { id: albumId } = use(params);

  // States
  const [album, setAlbum] = useState<Album | null>(null);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pages' | 'media' | 'music' | 'theme' | 'settings' | 'ai'>('pages');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  
  // Uploader form state
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaCaption, setNewMediaCaption] = useState("");
  const [newMediaPageId, setNewMediaPageId] = useState("");
  
  // Editor view reload counter
  const [previewKey, setPreviewKey] = useState(0);

  // Page fields edit state
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageLayout, setEditPageLayout] = useState<'single' | 'double' | 'full-spread' | 'video' | 'text-left' | 'text-right'>('single');
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageDesc, setEditPageDesc] = useState("");

  // Inline add media state for pages
  const [addingMediaPageId, setAddingMediaPageId] = useState<string | null>(null);
  const [newMediaUrlForPage, setNewMediaUrlForPage] = useState("");
  const [newMediaTypeForPage, setNewMediaTypeForPage] = useState<'image' | 'video'>('image');
  const [newMediaCaptionForPage, setNewMediaCaptionForPage] = useState("");
  const [showQR, setShowQR] = useState(false);

  // Load album
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("chaya_admin_logged_in");
      if (!isLoggedIn) {
        router.push("/auth");
        return;
      }
    }

    const fetchedAlbum = db.getAlbum(albumId);
    if (!fetchedAlbum) {
      router.push("/dashboard");
      return;
    }
    setAlbum(fetchedAlbum);
    setPages(db.getPages(albumId).sort((a, b) => a.page_number - b.page_number));
    setMedia(db.getMedia(albumId).sort((a, b) => a.order - b.order));
  }, [albumId, router]);

  const saveAlbumChanges = (updates: Partial<Album>) => {
    if (!album) return;
    const updated = db.updateAlbum(album.id, updates);
    setAlbum(updated);
    setPreviewKey(prev => prev + 1); // trigger canvas reload to display changes
  };

  const handleAddPage = () => {
    if (!album) return;
    const currentPages = db.getPages(album.id);
    const newPageNum = currentPages.length + 1;
    const newPage: AlbumPage = {
      id: `${album.id}-p-${Date.now()}`,
      album_id: album.id,
      page_number: newPageNum,
      layout: 'single',
      title: `Memories Part ${newPageNum}`
    };

    const updatedPages = [...currentPages, newPage];
    db.savePages(album.id, updatedPages);
    setPages(updatedPages);
    setSelectedPageId(newPage.id);
    setPreviewKey(prev => prev + 1);
  };

  const handleDeletePage = (pageId: string) => {
    if (!album) return;
    if (confirm("Are you sure you want to delete this page? Assets on this page will be unassigned.")) {
      const currentPages = db.getPages(album.id).filter(p => p.id !== pageId);
      
      // Re-number pages
      const renumbered = currentPages.map((p, idx) => ({ ...p, page_number: idx + 1 }));
      db.savePages(album.id, renumbered);
      setPages(renumbered);
      
      // Unassign media from deleted page
      const currentMedia = db.getMedia(album.id).map(m => m.page_id === pageId ? { ...m, page_id: undefined } : m);
      db.saveMedia(album.id, currentMedia);
      setMedia(currentMedia);
      
      setSelectedPageId(null);
      setPreviewKey(prev => prev + 1);
    }
  };

  const handleSavePageFields = (pageId: string) => {
    if (!album) return;
    const updated = pages.map(p => {
      if (p.id === pageId) {
        return {
          ...p,
          layout: editPageLayout,
          title: editPageTitle,
          description: editPageDesc
        };
      }
      return p;
    });
    db.savePages(album.id, updated);
    setPages(updated);
    setEditingPageId(null);
    setPreviewKey(prev => prev + 1);
  };

  const startEditingPage = (p: AlbumPage) => {
    setEditingPageId(p.id);
    setEditPageLayout(p.layout);
    setEditPageTitle(p.title || "");
    setEditPageDesc(p.description || "");
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !newMediaUrl) return;

    const currentMedia = db.getMedia(album.id);
    const newItem: MediaItem = {
      id: `${album.id}-m-${Date.now()}`,
      album_id: album.id,
      type: newMediaType,
      url: newMediaUrl,
      order: currentMedia.length + 1,
      caption: newMediaCaption || undefined,
      page_id: newMediaPageId || undefined
    };

    const updated = [...currentMedia, newItem];
    db.saveMedia(album.id, updated);
    setMedia(updated);

    // Reset Form
    setNewMediaUrl("");
    setNewMediaCaption("");
    setNewMediaPageId("");
    setPreviewKey(prev => prev + 1);
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (!album) return;
    const updated = media.filter(m => m.id !== mediaId).map((m, idx) => ({ ...m, order: idx + 1 }));
    db.saveMedia(album.id, updated);
    setMedia(updated);
    setPreviewKey(prev => prev + 1);
  };

  const assignMediaToPage = (mediaId: string, pageId: string) => {
    if (!album) return;
    const updated = media.map(m => m.id === mediaId ? { ...m, page_id: pageId || undefined } : m);
    db.saveMedia(album.id, updated);
    setMedia(updated);
    setPreviewKey(prev => prev + 1);
  };

  // Quick helper to insert sample images
  const addSamplePhoto = (url: string) => {
    if (!album) return;
    const currentMedia = db.getMedia(album.id);
    const newItem: MediaItem = {
      id: `${album.id}-m-${Date.now()}`,
      album_id: album.id,
      type: 'image',
      url,
      order: currentMedia.length + 1,
      caption: "Wedding Bliss"
    };
    const updated = [...currentMedia, newItem];
    db.saveMedia(album.id, updated);
    setMedia(updated);
    setPreviewKey(prev => prev + 1);
  };

  const handleAddMediaToPage = (e: React.FormEvent, pageId: string) => {
    e.preventDefault();
    if (!album || !newMediaUrlForPage) return;

    const currentMedia = db.getMedia(album.id);
    const newItem: MediaItem = {
      id: `${album.id}-m-${Date.now()}`,
      album_id: album.id,
      type: newMediaTypeForPage,
      url: newMediaUrlForPage,
      order: currentMedia.length + 1,
      caption: newMediaCaptionForPage || undefined,
      page_id: pageId
    };

    const updated = [...currentMedia, newItem];
    db.saveMedia(album.id, updated);
    setMedia(updated);

    // Reset Form
    setNewMediaUrlForPage("");
    setNewMediaCaptionForPage("");
    setAddingMediaPageId(null);
    setPreviewKey(prev => prev + 1);
  };

  const selectPreloadedPhotoForPage = (url: string) => {
    setNewMediaUrlForPage(url);
    setNewMediaTypeForPage('image');
  };

  // AI Automatic Arranger Mock
  const triggerAIArrangement = () => {
    if (!album) return;
    // Map existing media to empty pages
    const unassignedMedia = media.filter(m => !m.page_id);
    if (unassignedMedia.length === 0) {
      alert("AI Notice: All images are already arranged. Add more unassigned media items to try AI Arrangement.");
      return;
    }

    const updatedMedia = [...media];
    let pageIdx = 0;
    
    unassignedMedia.forEach((m, index) => {
      // Find a page or create one
      if (pageIdx >= pages.length) {
        // Create new page dynamically
        const newPageNum = pages.length + 1;
        const newPage: AlbumPage = {
          id: `${album.id}-p-ai-${Date.now()}-${index}`,
          album_id: album.id,
          page_number: newPageNum,
          layout: index % 3 === 0 ? 'double' : index % 3 === 1 ? 'full-spread' : 'single',
          title: `AI Curated Moments`
        };
        pages.push(newPage);
      }
      
      const targetPage = pages[pageIdx];
      
      // Associate media
      const mediaIdx = updatedMedia.findIndex(item => item.id === m.id);
      if (mediaIdx !== -1) {
        updatedMedia[mediaIdx].page_id = targetPage.id;
      }
      
      // double layout fits 2, else 1
      if (targetPage.layout === 'double') {
        if (index % 2 === 1) pageIdx++;
      } else {
        pageIdx++;
      }
    });

    db.savePages(album.id, pages);
    db.saveMedia(album.id, updatedMedia);
    setPages([...pages]);
    setMedia(updatedMedia);
    setPreviewKey(prev => prev + 1);

    // Import dynamic canvas-confetti dynamically to celebrate
    import("canvas-confetti").then((module) => {
      const confetti = module.default;
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#D4AF37", "#FFFFFF", "#AA771C"]
      });
    });
  };

  // AI Highlight Video mock
  const generateAIHighlight = () => {
    if (!album) return;
    
    // Add page for highlight video
    const newPageNum = pages.length + 1;
    const newPage: AlbumPage = {
      id: `${album.id}-p-vid-${Date.now()}`,
      album_id: album.id,
      page_number: newPageNum,
      layout: 'video',
      title: "AI Highlight Cinematic reel"
    };

    const newMedia: MediaItem = {
      id: `${album.id}-m-vid-${Date.now()}`,
      album_id: album.id,
      type: "video",
      url: sampleVideos[0],
      order: media.length + 1,
      caption: "Cinematic Recap Highlight Reel",
      page_id: newPage.id
    };

    const updatedPages = [...pages, newPage];
    db.savePages(album.id, updatedPages);
    setPages(updatedPages);

    const updatedMedia = [...media, newMedia];
    db.saveMedia(album.id, updatedMedia);
    setMedia(updatedMedia);

    setPreviewKey(prev => prev + 1);
    alert("AI Cinematic Video Highlight compiled and attached on Page " + newPageNum);
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gold-primary">
        Loading Wedding Editor System...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F4F6] font-sans flex flex-col justify-between">
      
      {/* Editor Header */}
      <header className="w-full py-4 px-6 border-b border-white/5 luxury-glass flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-1.5 border border-white/5 hover:border-gold-primary rounded-sm text-stone-400 hover:text-white transition-colors"
            title="Return to Dashboard"
            id="editor_btn_back"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-sm md:text-base text-white tracking-wide">{album.title}</h1>
              <span className="text-[8px] bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded border border-gold-primary/20 uppercase tracking-widest">
                Editor Suite
              </span>
            </div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">{album.client_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Published toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-stone-500">Live Status:</span>
            <button
              onClick={() => saveAlbumChanges({ status: album.status === 'published' ? 'draft' : 'published' })}
              className={`px-3 py-1 text-[9px] uppercase tracking-widest rounded-sm border font-semibold transition-all ${
                album.status === 'published'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
              }`}
              id="editor_btn_status"
            >
              {album.status}
            </button>
          </div>

          <button
            onClick={() => router.push(`/album/${album.id}`)}
            className="px-4 py-1.5 bg-gold-primary hover:bg-gold-light text-black text-[10px] tracking-widest uppercase font-bold rounded-sm transition-colors flex items-center gap-1.5 shadow"
            id="editor_btn_live_view"
          >
            <Eye size={12} />
            <span>Launch 3D</span>
          </button>
          
          {album.status === 'published' && (
            <button
              onClick={() => setShowQR(true)}
              className="px-4 py-1.5 border border-gold-primary/30 hover:border-gold-primary hover:bg-gold-primary/10 text-gold-light text-[10px] tracking-widest uppercase font-bold rounded-sm transition-all flex items-center gap-1.5"
            >
              <QrCode size={12} />
              <span>QR Code</span>
            </button>
          )}
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-gold-primary/30 rounded-md shadow-2xl shadow-gold-primary/10 p-8 flex flex-col items-center max-w-sm w-full mx-4 relative">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-12 h-12 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6 text-gold-primary">
              <QrCode size={24} />
            </div>
            
            <h2 className="font-serif text-2xl text-white mb-2 text-center">Scan to View Album</h2>
            <p className="text-stone-400 text-xs text-center mb-8 px-4 font-sans leading-relaxed">
              Scan this QR code with any smartphone camera to instantly launch the immersive 3D flipbook for {album.client_name}.
            </p>
            
            <div className="bg-white p-4 rounded-sm shadow-inner mb-6">
              <QRCodeSVG 
                value={typeof window !== 'undefined' ? `${window.location.origin}/album/${album.id}` : `https://chaya.studio/album/${album.id}`}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
            </div>
            
            <button
              onClick={() => setShowQR(false)}
              className="w-full py-3 bg-gold-bg-gradient text-black font-bold text-[10px] tracking-widest uppercase rounded-sm hover:scale-[1.02] transition-luxury"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-65px)]">
        
        {/* Left Side: Sidebar controls */}
        <aside className="w-full lg:w-96 border-r border-white/5 bg-[#0B0B0B] flex flex-col z-30 lg:h-full">
          {/* Tabs */}
          <div className="flex border-b border-white/5 text-[9px] tracking-widest uppercase text-stone-400 overflow-x-auto shrink-0 scrollbar-none">
            {(['pages', 'media', 'music', 'theme', 'settings', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center transition-colors min-w-[70px] ${
                  activeTab === tab 
                    ? 'border-b-2 border-gold-primary text-gold-primary bg-black/40 font-bold' 
                    : 'hover:text-white hover:bg-white/[0.01]'
                }`}
                id={`tab_${tab}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* PAGES TAB */}
            {activeTab === 'pages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">Pages Hierarchy</h3>
                  <button
                    onClick={handleAddPage}
                    className="p-1.5 bg-gold-primary/5 hover:bg-gold-primary/10 border border-gold-primary/30 rounded text-gold-primary flex items-center gap-1 text-[9px] tracking-widest uppercase font-semibold"
                    id="btn_add_page"
                  >
                    <Plus size={10} />
                    <span>Add Page</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {pages.map((p) => (
                    <div 
                      key={p.id} 
                      className={`p-3 border rounded-sm transition-all flex flex-col justify-between ${
                        selectedPageId === p.id 
                          ? 'border-gold-primary bg-black/60 shadow-lg' 
                          : 'border-white/5 bg-black/20 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedPageId(p.id)}>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-xs text-gold-primary font-semibold">#{p.page_number}</span>
                          <span className="font-sans text-xs text-white truncate max-w-[150px]">{p.title || "Untitled Memories"}</span>
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-stone-500 bg-white/5 px-2 py-0.5 rounded capitalize">
                          {p.layout}
                        </span>
                      </div>

                      {selectedPageId === p.id && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fade-in">
                          {editingPageId === p.id ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[8px] uppercase text-stone-500 block">Layout Style</label>
                                <select
                                  value={editPageLayout}
                                  onChange={(e) => setEditPageLayout(e.target.value as any)}
                                  className="w-full bg-[#121212] border border-white/10 text-xs px-2.5 py-1.5 outline-none text-white rounded-sm"
                                  id={`edit_layout_${p.id}`}
                                >
                                  <option value="single">Single Photo Layout</option>
                                  <option value="double">Double Side-by-Side Photos</option>
                                  <option value="full-spread">Full Width Panorama Image</option>
                                  <option value="video">Cinematic Video Highlight</option>
                                  <option value="text-left">Text Left + Photo Right</option>
                                  <option value="text-right">Photo Left + Text Right</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] uppercase text-stone-500 block">Heading Title</label>
                                <input
                                  type="text"
                                  value={editPageTitle}
                                  onChange={(e) => setEditPageTitle(e.target.value)}
                                  className="w-full bg-[#121212] border border-white/10 text-xs px-2.5 py-1.5 outline-none text-white rounded-sm"
                                  id={`edit_title_${p.id}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] uppercase text-stone-500 block">Sub-caption / Quote</label>
                                <textarea
                                  rows={2}
                                  value={editPageDesc}
                                  onChange={(e) => setEditPageDesc(e.target.value)}
                                  className="w-full bg-[#121212] border border-white/10 text-xs px-2.5 py-1.5 outline-none text-white rounded-sm resize-none"
                                  id={`edit_desc_${p.id}`}
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSavePageFields(p.id)}
                                  className="flex-1 py-1 bg-gold-primary hover:bg-gold-light text-black text-[9px] tracking-widest uppercase font-bold rounded-sm"
                                  id={`btn_save_page_${p.id}`}
                                >
                                  Apply Changes
                                </button>
                                <button
                                  onClick={() => setEditingPageId(null)}
                                  className="px-3 py-1 border border-stone-700 text-stone-300 text-[9px] tracking-widest uppercase rounded-sm"
                                  id={`btn_cancel_page_${p.id}`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditingPage(p)}
                                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] tracking-widest uppercase rounded-sm flex items-center justify-center gap-1"
                                  id={`btn_edit_fields_${p.id}`}
                                >
                                  <Edit size={10} />
                                  <span>Configure Details</span>
                                </button>
                                <button
                                  onClick={() => handleDeletePage(p.id)}
                                  className="px-3 py-1.5 border border-red-500/10 hover:bg-red-500/5 text-red-400 rounded-sm flex items-center justify-center"
                                  title="Delete Page"
                                  id={`btn_delete_page_${p.id}`}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>

                              {/* Inline Page Media Management */}
                              {(() => {
                                const pageMediaItems = media.filter(m => m.page_id === p.id);
                                return (
                                  <div className="space-y-2 mt-2 pt-2.5 border-t border-white/5 text-left font-sans">
                                    <span className="text-[8px] uppercase tracking-widest text-stone-500 font-bold block">Page Assets ({pageMediaItems.length})</span>
                                    {pageMediaItems.length > 0 ? (
                                      <div className="grid grid-cols-2 gap-1.5">
                                        {pageMediaItems.map((m) => (
                                          <div key={m.id} className="relative group rounded border border-white/5 bg-black/40 overflow-hidden h-14">
                                            {m.type === 'video' ? (
                                              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-gold-primary">
                                                <VideoIcon size={14} />
                                              </div>
                                            ) : (
                                              <img src={m.url} alt="" className="w-full h-full object-cover" />
                                            )}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMedia(m.id);
                                              }}
                                              className="absolute top-1 right-1 p-1 rounded bg-black/80 text-stone-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                              title="Delete asset"
                                            >
                                              <Trash2 size={8} />
                                            </button>
                                            {m.caption && (
                                              <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-1 py-0.5 text-[7px] text-stone-300 truncate">
                                                {m.caption}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[9px] text-stone-600 italic">No assets assigned to this page.</p>
                                    )}

                                    {addingMediaPageId === p.id ? (
                                      <form onSubmit={(e) => handleAddMediaToPage(e, p.id)} className="mt-2.5 p-3 bg-black/50 border border-gold-primary/25 rounded space-y-2 animate-fade-in">
                                        <div className="flex justify-between items-center pb-1 border-b border-white/5">
                                          <span className="text-[8px] uppercase font-bold text-gold-light">Add Page Asset</span>
                                          <button 
                                            type="button" 
                                            onClick={() => setAddingMediaPageId(null)}
                                            className="text-[8px] uppercase text-stone-500 hover:text-white"
                                          >
                                            Cancel
                                          </button>
                                        </div>

                                        <div className="flex gap-3">
                                          <label className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-stone-400 cursor-pointer">
                                            <input
                                              type="radio"
                                              checked={newMediaTypeForPage === 'image'}
                                              onChange={() => setNewMediaTypeForPage('image')}
                                              className="accent-gold-primary"
                                            />
                                            <span>Photo</span>
                                          </label>
                                          <label className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-stone-400 cursor-pointer">
                                            <input
                                              type="radio"
                                              checked={newMediaTypeForPage === 'video'}
                                              onChange={() => setNewMediaTypeForPage('video')}
                                              className="accent-gold-primary"
                                            />
                                            <span>Video</span>
                                          </label>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[7px] uppercase text-stone-500 block">Upload Local File</label>
                                          <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  setNewMediaUrlForPage(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                            className="w-full text-[9px] text-stone-400 file:cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-[8px] file:uppercase file:tracking-widest file:bg-[#1f1f1f] file:text-gold-primary hover:file:bg-[#2a2a2a] file:transition-colors"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[7px] uppercase text-stone-500 block">Or Paste Asset URL</label>
                                          <input
                                            type="text"
                                            required
                                            placeholder="Paste URL"
                                            value={newMediaUrlForPage}
                                            onChange={(e) => setNewMediaUrlForPage(e.target.value)}
                                            className="w-full bg-[#121212] border border-white/10 text-[9px] px-2 py-1 outline-none text-white rounded-sm"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <span className="text-[7px] uppercase text-stone-500 block">Or select from preloaded:</span>
                                          <div className="grid grid-cols-4 gap-1">
                                            {samplePhotos.map((url, idx) => (
                                              <button
                                                key={idx}
                                                type="button"
                                                onClick={() => selectPreloadedPhotoForPage(url)}
                                                className={`h-6 rounded overflow-hidden border ${newMediaUrlForPage === url ? 'border-gold-primary' : 'border-transparent'}`}
                                              >
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[7px] uppercase text-stone-500 block">Caption</label>
                                          <input
                                            type="text"
                                            placeholder="e.g. Ring exchange"
                                            value={newMediaCaptionForPage}
                                            onChange={(e) => setNewMediaCaptionForPage(e.target.value)}
                                            className="w-full bg-[#121212] border border-white/10 text-[9px] px-2 py-1 outline-none text-white rounded-sm"
                                          />
                                        </div>

                                        <button
                                          type="submit"
                                          className="w-full py-1 bg-gold-primary hover:bg-gold-light text-black text-[8px] tracking-widest uppercase font-bold rounded-sm shadow"
                                        >
                                          Assign to Page
                                        </button>
                                      </form>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setAddingMediaPageId(p.id);
                                          setNewMediaUrlForPage("");
                                          setNewMediaCaptionForPage("");
                                        }}
                                        className="w-full mt-2 py-1.5 border border-dashed border-[#D4AF37]/20 hover:border-gold-primary/40 text-gold-primary text-[8px] tracking-widest uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors font-medium"
                                      >
                                        <Plus size={10} />
                                        <span>+ Add Media to Page</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                
                {/* Upload Form */}
                <div className="space-y-4">
                  <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">Add Media Link</h3>
                  <form onSubmit={handleAddMedia} className="space-y-3 bg-black/20 p-4 border border-white/5 rounded-sm">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-stone-400 cursor-pointer">
                        <input
                          type="radio"
                          name="mediaType"
                          checked={newMediaType === 'image'}
                          onChange={() => setNewMediaType('image')}
                          className="accent-gold-primary"
                        />
                        <span>Image</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-stone-400 cursor-pointer">
                        <input
                          type="radio"
                          name="mediaType"
                          checked={newMediaType === 'video'}
                          onChange={() => setNewMediaType('video')}
                          className="accent-gold-primary"
                        />
                        <span>Video</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase text-stone-500 block">Asset URL</label>
                      <input
                        type="text"
                        required
                        placeholder="Paste image/video link URL"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 text-xs px-2.5 py-1.5 outline-none text-white rounded-sm"
                        id="media_input_url"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase text-stone-500 block">Assign to Page</label>
                      <select
                        value={newMediaPageId}
                        onChange={(e) => setNewMediaPageId(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 text-xs px-2.5 py-1.5 outline-none text-white rounded-sm"
                        id="media_input_page"
                      >
                        <option value="">Unassigned Pool</option>
                        {pages.map(p => (
                          <option key={p.id} value={p.id}>Page {p.page_number} ({p.layout})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase text-stone-500 block">Caption / Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Ring exchange ceremony"
                        value={newMediaCaption}
                        onChange={(e) => setNewMediaCaption(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 text-xs px-2.5 py-1.5 outline-none text-white rounded-sm"
                        id="media_input_caption"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gold-primary hover:bg-gold-light text-black text-[9px] tracking-widest uppercase font-bold rounded-sm shadow"
                      id="media_btn_submit"
                    >
                      Import Asset
                    </button>
                  </form>
                </div>

                {/* Preloaded Wedding Samples */}
                <div className="space-y-3">
                  <h3 className="font-serif text-[10px] text-gold-light uppercase tracking-widest">Instant Luxury Photos Library</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {samplePhotos.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => addSamplePhoto(url)}
                        className="h-12 border border-white/5 hover:border-gold-primary rounded overflow-hidden relative group active:scale-95 transition-all"
                        title="Click to instantly import to album pool"
                        id={`btn_sample_photo_${idx}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={10} className="text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Pool Listing */}
                <div className="space-y-3">
                  <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">Asset Catalog ({media.length})</h3>
                  <div className="space-y-2">
                    {media.map((m) => (
                      <div key={m.id} className="p-2 border border-white/5 bg-black/40 rounded flex items-center justify-between gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                          {m.type === 'video' ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-gold-primary">
                              <VideoIcon size={14} />
                            </div>
                          ) : (
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[10px] font-sans text-stone-300 truncate">{m.caption || "Asset detail link"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] uppercase tracking-wider text-stone-500">
                              {m.type}
                            </span>
                            <select
                              value={m.page_id || ""}
                              onChange={(e) => assignMediaToPage(m.id, e.target.value)}
                              className="bg-black border border-white/10 text-[9px] px-1.5 py-0.5 outline-none text-gold-primary rounded"
                              id={`select_assign_page_${m.id}`}
                            >
                              <option value="">Unassigned Pool</option>
                              {pages.map(p => (
                                <option key={p.id} value={p.id}>Page {p.page_number}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMedia(m.id)}
                          className="text-stone-600 hover:text-red-400 p-1 transition-colors"
                          id={`btn_delete_media_${m.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MUSIC TAB */}
            {activeTab === 'music' && (
              <div className="space-y-4 text-left">
                <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">Background Music</h3>
                <p className="text-stone-400 text-xs font-light">Select background soundtrack played when viewer loads.</p>
                
                <div className="space-y-2 pt-2">
                  {sampleMusic.map((track) => (
                    <label 
                      key={track.url} 
                      className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all ${
                        album.background_music === track.url
                          ? 'border-gold-primary bg-gold-primary/5 text-gold-light'
                          : 'border-white/5 bg-black/20 hover:border-white/10 text-stone-400'
                      }`}
                      id={`label_track_${track.name.toLowerCase().replace(/\s+/g, "_")}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="musicTrack"
                          checked={album.background_music === track.url}
                          onChange={() => saveAlbumChanges({ background_music: track.url })}
                          className="accent-gold-primary hidden"
                        />
                        <Music size={12} className={album.background_music === track.url ? "text-gold-primary" : "text-stone-600"} />
                        <span className="text-xs font-serif font-medium">{track.name}</span>
                      </div>
                      <Volume2 size={12} className="opacity-40" />
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-stone-500 block">Or Paste Audio Stream URL</label>
                  <input
                    type="text"
                    value={album.background_music}
                    onChange={(e) => saveAlbumChanges({ background_music: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 text-xs px-3 py-2 text-white outline-none rounded-sm"
                    placeholder="https://example.com/audio.mp3"
                    id="input_music_url"
                  />
                </div>
              </div>
            )}

            {/* THEME TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-4 text-left">
                <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">Album Aesthetics</h3>
                <p className="text-stone-400 text-xs font-light font-sans">Pick physical themes to reconfigure 3D shaders, fonts, borders, and cover texture overlay.</p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {(['luxury', 'royal', 'classic', 'modern'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => saveAlbumChanges({ theme: t })}
                      className={`p-4 border rounded-sm transition-all flex flex-col justify-between text-left space-y-2 ${
                        album.theme === t 
                          ? 'border-gold-primary bg-gold-primary/5 text-gold-light font-bold shadow-md' 
                          : 'border-white/5 bg-black/20 hover:border-white/10 text-stone-400'
                      }`}
                      id={`btn_theme_${t}`}
                    >
                      <span className="text-xs uppercase font-serif tracking-widest">{t}</span>
                      <span className="text-[8px] text-stone-500 font-light leading-tight font-sans">
                        {t === 'luxury' && "Obsidian Black Cover, golden layouts & ornaments."}
                        {t === 'royal' && "Navy Velvet feel cover with bold borders."}
                        {t === 'classic' && "Vintage leather cover with traditional serifs."}
                        {t === 'modern' && "Sleek matte covers, grid structures, clean text."}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-5 text-left">
                <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">Physics & Secrets</h3>
                
                <div className="space-y-4">
                  {/* Flip Speed */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] uppercase tracking-wider text-stone-400">
                      <span>Page Curl Speed</span>
                      <span className="text-gold-primary">{album.animation_speed}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={album.animation_speed}
                      onChange={(e) => saveAlbumChanges({ animation_speed: parseFloat(e.target.value) })}
                      className="w-full accent-gold-primary bg-stone-800"
                      id="input_speed"
                    />
                  </div>

                  {/* 3D Depth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] uppercase tracking-wider text-stone-400">
                      <span>Page 3D Offset Thickness</span>
                      <span className="text-gold-primary">{album.depth}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={album.depth}
                      onChange={(e) => saveAlbumChanges({ depth: parseFloat(e.target.value) })}
                      className="w-full accent-gold-primary bg-stone-800"
                      id="input_depth"
                    />
                  </div>

                  {/* Shadows Toggle */}
                  <label className="flex items-center justify-between p-2 border border-white/5 rounded-sm bg-black/20 cursor-pointer">
                    <span className="text-[10px] uppercase text-stone-400">Cast Contact Shadows</span>
                    <input
                      type="checkbox"
                      checked={album.shadow}
                      onChange={(e) => saveAlbumChanges({ shadow: e.target.checked })}
                      className="accent-gold-primary w-4 h-4"
                      id="input_shadow"
                    />
                  </label>

                  {/* Password Protection */}
                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    <label className="text-[9px] uppercase tracking-widest text-stone-500 flex items-center gap-1">
                      <Lock size={10} />
                      <span>Security Password</span>
                    </label>
                    <input
                      type="text"
                      value={album.password || ""}
                      onChange={(e) => saveAlbumChanges({ password: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 text-xs px-3 py-2 text-white outline-none rounded-sm"
                      placeholder="Optional view password protection"
                      id="input_password"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-stone-500 flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Album Expiry Date</span>
                    </label>
                    <input
                      type="date"
                      value={album.expiry_date || ""}
                      onChange={(e) => saveAlbumChanges({ expiry_date: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 text-xs px-3 py-2 text-white outline-none rounded-sm"
                      id="input_expiry"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI HELPERS TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-4 text-left">
                <h3 className="font-serif text-sm text-white font-medium uppercase tracking-wider">AI Studio Automations</h3>
                <p className="text-stone-400 text-xs font-light">Deploy AI algorithms to accelerate template assembly, highlight creations, and facial tagging.</p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={triggerAIArrangement}
                    className="w-full p-4 border border-gold-primary/30 bg-gold-primary/5 hover:bg-gold-primary/10 rounded-sm transition-all flex items-center gap-3 text-left"
                    id="btn_ai_arrange"
                  >
                    <Wand2 className="text-gold-primary shrink-0 animate-pulse" size={18} />
                    <div>
                      <span className="text-xs uppercase font-serif text-gold-light font-bold block">AI Layout Arranger</span>
                      <span className="text-[9px] text-stone-400 block mt-0.5">Automatically analyze images and map them onto single/double/spread pages.</span>
                    </div>
                  </button>

                  <button
                    onClick={generateAIHighlight}
                    className="w-full p-4 border border-white/5 bg-black/20 hover:border-white/10 rounded-sm transition-all flex items-center gap-3 text-left"
                    id="btn_ai_highlight"
                  >
                    <FileVideo className="text-stone-400 shrink-0" size={18} />
                    <div>
                      <span className="text-xs uppercase font-serif text-white font-medium block">AI Highlight Reel</span>
                      <span className="text-[9px] text-stone-500 block mt-0.5">Generate a romantic overlay video slice and insert directly on a dedicated video sheet.</span>
                    </div>
                  </button>

                  <button
                    onClick={() => alert("AI Notice: Face Recognition scanner successfully scanned 8 photos. Grouped: Groom (5 matches), Bride (7 matches), Family (3 matches).")}
                    className="w-full p-4 border border-white/5 bg-black/20 hover:border-white/10 rounded-sm transition-all flex items-center gap-3 text-left"
                    id="btn_ai_face"
                  >
                    <Sparkles className="text-stone-400 shrink-0" size={18} />
                    <div>
                      <span className="text-xs uppercase font-serif text-white font-medium block">Facial Recognition Index</span>
                      <span className="text-[9px] text-stone-500 block mt-0.5">Scan assets to index guest circles. Auto-tag people in page sub-captions.</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* Right Side: 3D Preview Frame */}
        <main className="flex-1 bg-[#050505] flex flex-col justify-center items-center p-6 relative">
          {/* Ornamental frame borders */}
          <div className="absolute top-6 left-6 w-6 h-6 border-t border-l border-gold-primary/20 pointer-events-none" />
          <div className="absolute top-6 right-6 w-6 h-6 border-t border-r border-gold-primary/20 pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-6 h-6 border-b border-l border-gold-primary/20 pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-b border-r border-gold-primary/20 pointer-events-none" />

          {/* Heading overlay */}
          <div className="absolute top-8 text-center pointer-events-none z-10">
            <span className="font-serif text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase font-medium">Interactive 3D Editor Sandbox</span>
            <p className="text-[9px] text-stone-500 mt-0.5 font-sans uppercase">Interact directly to review layouts, themes and settings instantly</p>
          </div>

          {/* Canvas viewport container */}
          <div className="w-full h-full max-h-[550px] relative mt-4">
            <BookViewer 
              key={`${album.theme}-${album.animation_speed}-${album.depth}-${pages.length}-${media.length}-${previewKey}`}
              album={album} 
              pages={pages} 
              media={media} 
              embeddedMode={true}
            />
          </div>
        </main>

      </div>
    </div>
  );
}
