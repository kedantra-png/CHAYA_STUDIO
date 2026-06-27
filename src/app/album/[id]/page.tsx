"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { db, Album, AlbumPage, MediaItem } from "@/lib/db";
import { BookViewer } from "@/components/album-viewer/BookViewer";
import { Lock, Sparkles, Calendar, HelpCircle } from "@/components/icons";

interface ViewerPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerAlbumViewerPage({ params }: ViewerPageProps) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { id: albumId } = use(params);

  // States
  const [album, setAlbum] = useState<Album | null>(null);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Security/Checks
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchedAlbum = db.getAlbum(albumId);
    if (!fetchedAlbum) {
      setError("This beautiful wedding album does not exist or has been removed.");
      setLoading(false);
      return;
    }

    // Check expiry
    if (fetchedAlbum.expiry_date) {
      const today = new Date();
      const expiry = new Date(fetchedAlbum.expiry_date);
      if (today > expiry) {
        setIsExpired(true);
        setLoading(false);
        return;
      }
    }

    // Set Album and subitems (use album.id (UUID) for data lookups)
    setAlbum(fetchedAlbum);
    const fetchedPages = db.getPages(fetchedAlbum.id).sort((a, b) => a.page_number - b.page_number);
    const fetchedMedia = db.getMedia(fetchedAlbum.id).sort((a, b) => a.order - b.order);
    setPages(fetchedPages);
    setMedia(fetchedMedia);

    // Preload critical images: cover + first spread
    const urlsToPreload: string[] = [];
    if (fetchedAlbum.cover_image) urlsToPreload.push(fetchedAlbum.cover_image);
    const page0Media = fetchedMedia.filter(m => m.page_id === fetchedPages[0]?.id);
    const page1Media = fetchedPages[1] ? fetchedMedia.filter(m => m.page_id === fetchedPages[1].id) : [];
    [...page0Media, ...page1Media].forEach(m => { if (m.type === 'image') urlsToPreload.push(m.url); });
    const preloadLinks: HTMLLinkElement[] = [];
    urlsToPreload.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.dataset.albumPreload = '';
      document.head.appendChild(link);
      preloadLinks.push(link);
    });

    // Check if password protected
    if (fetchedAlbum.password) {
      setIsUnlocked(false);
    } else {
      setIsUnlocked(true);
      // Track view analytics since it's unlocked and loading successfully
      incrementAnalytics(fetchedAlbum.id);
    }
    
    setLoading(false);

    return () => {
      preloadLinks.forEach(l => l.remove());
    };
  }, [albumId]);

  const incrementAnalytics = (id: string) => {
    if (typeof window === "undefined") return;
    
    // Determine device type
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    const width = window.innerWidth;
    if (width < 768) device = 'mobile';
    else if (width < 1024) device = 'tablet';
    
    db.incrementViews(id, device);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;

    if (passwordInput === album.password) {
      setIsUnlocked(true);
      setPasswordError("");
      incrementAnalytics(album.id);
    } else {
      setPasswordError("Incorrect access code. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-10 h-10 rounded-full border border-gold-primary border-t-transparent animate-spin" />
        <p className="font-serif tracking-[0.2em] text-[10px] text-gold-light uppercase">Loading memories in 3D...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="w-14 h-14 rounded-full border border-gold-primary/30 flex items-center justify-center bg-black/60">
          <HelpCircle size={24} className="text-gold-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-xl text-white tracking-wide">Album Unreachable</h1>
          <p className="text-stone-400 text-xs font-light max-w-sm">{error}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 border border-gold-primary/30 text-gold-light text-xs tracking-widest uppercase hover:bg-gold-primary hover:text-black rounded-sm transition-all"
        >
          Studio Gallery
        </button>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="w-14 h-14 rounded-full border border-gold-primary/30 flex items-center justify-center bg-black/60">
          <Calendar size={24} className="text-gold-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-xl text-white tracking-wide">Memories Expired</h1>
          <p className="text-stone-400 text-xs font-light max-w-sm">
            This digital wedding album has exceeded its hosting duration. Please contact the studio owner to reactivate the album link.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 border border-white/10 hover:border-gold-primary text-white text-xs tracking-widest uppercase rounded-sm transition-all"
        >
          Chaya Studio Home
        </button>
      </div>
    );
  }

  if (!isUnlocked && album) {
    return (
      <div className="min-h-screen bg-radial from-[#121212] via-[#050505] to-black flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-primary/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm bg-[#0B0B0B] border border-gold-primary/20 p-8 rounded-sm text-center relative shadow-2xl">
          {/* Ornamental corners */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-gold-primary/30" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-gold-primary/30" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-gold-primary/30" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-gold-primary/30" />

          <div className="w-12 h-12 rounded-full border border-gold-primary/20 bg-gold-primary/5 flex items-center justify-center text-gold-primary mx-auto mb-6">
            <Lock size={20} className="animate-pulse" />
          </div>

          <div className="space-y-1.5 mb-6">
            <span className="font-serif tracking-widest text-gold-primary text-[9px] uppercase block">Protected Album</span>
            <h2 className="font-serif text-lg text-white font-medium">{album.title}</h2>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest">{album.client_name}</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <p className="text-red-400 text-[10px] font-medium bg-red-950/40 border border-red-500/20 py-1.5 rounded">{passwordError}</p>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[8px] uppercase tracking-widest text-stone-500 block">Access Password</label>
              <input
                type="password"
                required
                placeholder="Enter password to unlock"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 focus:border-gold-primary text-xs px-3 py-2.5 text-center text-white outline-none rounded-sm"
                id="password_input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 gold-bg-gradient text-black font-bold text-xs tracking-widest uppercase rounded-sm transition-all"
              id="password_submit"
            >
              Reveal 3D Album
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      {album && (
        <BookViewer 
          album={album} 
          pages={pages} 
          media={media} 
        />
      )}
    </div>
  );
}
