"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import { Page } from "./Book";
import { Album, AlbumPage, MediaItem } from "@/lib/db";
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Compass,
  Music,
  Share2,
  X
} from "@/components/icons";

interface BookViewerProps {
  album: Album;
  pages: AlbumPage[];
  media: MediaItem[];
  embeddedMode?: boolean;
}

export const BookViewer: React.FC<BookViewerProps> = ({
  album,
  pages,
  media,
  embeddedMode = false
}) => {
  const router = useRouter();
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize background music
  useEffect(() => {
    if (embeddedMode) return;
    
    if (album.background_music) {
      const audio = new Audio(album.background_music);
      audio.loop = true;
      audio.volume = 0.35;
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [album.background_music, embeddedMode]);

  // Paper-flip noise
  const playFlipSound = () => {
    if (typeof window === "undefined" || embeddedMode) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 2.5;
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.3);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.33);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (e) {
      // Ignore audio errors
    }
  };

  const nextButtonClick = () => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevButtonClick = () => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`w-full h-full relative bg-[#050505] flex items-center justify-center overflow-hidden font-sans`}>
      
      {/* Background Decor */}
      {album.theme === 'luxury' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-primary/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-deep/5 rounded-full filter blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main Flipbook Wrapper */}
      <div className="w-full h-full max-w-[1400px] flex items-center justify-center relative p-4 md:p-12 drop-shadow-2xl">
        <HTMLFlipBook
          style={{}}
          startZIndex={0}
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={420}
          maxHeight={1333}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="demo-book"
          ref={bookRef}
          onFlip={playFlipSound}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startPage={0}
          autoSize={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {/* Cover Page */}
          <Page album={album} media={media} isCover={true} />

          {/* Interior Pages */}
          {pages.map((page, i) => (
            <Page key={page.id} album={album} page={page} media={media} />
          ))}

          {/* Back Cover / End Page */}
          <Page album={album} media={[]} isCover={false} page={{ id: "end", album_id: album.id, page_number: 999, layout: "single" }} />
        </HTMLFlipBook>
      </div>

      {/* Custom Controls UI */}
      {!embeddedMode && (
        <>
          {/* Back / Close Button */}
          <button 
            onClick={() => router.back()}
            className="absolute top-6 left-6 w-12 h-12 rounded-full luxury-glass flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all z-50 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>

          {/* Navigation Arrows */}
          <button 
            onClick={prevButtonClick}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full luxury-glass flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all z-20"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextButtonClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full luxury-glass flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all z-20"
          >
            <ChevronRight size={24} />
          </button>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 luxury-glass px-6 py-3 rounded-full flex items-center gap-6 z-20 border border-white/10 shadow-xl">
            {album.background_music && (
              <button onClick={toggleMusic} className="flex flex-col items-center gap-1 group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPlayingMusic ? 'bg-gold-primary/20 text-gold-primary' : 'bg-white/5 text-stone-400 group-hover:text-white group-hover:bg-white/10'}`}>
                  {isPlayingMusic ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </div>
              </button>
            )}

            <button onClick={toggleFullscreen} className="flex flex-col items-center gap-1 group">
              <div className="w-8 h-8 rounded-full bg-white/5 text-stone-400 group-hover:text-white group-hover:bg-white/10 flex items-center justify-center transition-colors">
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </div>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-8 h-8 rounded-full bg-white/5 text-stone-400 group-hover:text-white group-hover:bg-white/10 flex items-center justify-center transition-colors">
                <Share2 size={14} />
              </div>
            </button>
          </div>
        </>
      )}

    </div>
  );
};
