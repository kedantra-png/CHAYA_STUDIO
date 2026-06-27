"use client";

import React, { forwardRef, useState, useCallback } from "react";
import { Album, AlbumPage, MediaItem } from "@/lib/db";

interface PageProps {
  album: Album;
  page?: AlbumPage;
  media?: MediaItem[];
  isCover?: boolean;
  currentPage?: number;
  visiblePage?: number;
}

function LazyImage({ src, alt, className, preload }: { src?: string; alt: string; className?: string; preload?: boolean }) {
  const [loaded, setLoaded] = useState(false);

  const onLoad = useCallback(() => setLoaded(true), []);

  if (!src) return null;

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className || ''}`}>
      {!loaded && <div className="absolute inset-0 w-full h-full bg-stone-800/60 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        loading={preload ? undefined : "lazy"}
        decoding="async"
        onLoad={onLoad}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

function VideoPlayer({ src, caption }: { src: string; caption?: string }) {
  return (
    <div className="w-full h-full relative">
      <video
        src={src}
        className="w-full h-full object-cover"
        controls
        muted
        playsInline
        autoPlay
        loop
        preload="metadata"
      />
      {caption && (
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <span className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-sans tracking-widest text-white/90">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}

export const Page = forwardRef<HTMLDivElement, PageProps>(({ album, page, media = [], isCover, currentPage = 0, visiblePage = 0 }, ref) => {
  const pageMedia = page ? media.filter(m => m.page_id === page.id).sort((a, b) => a.order - b.order) : [];
  const isNearVisible = Math.abs(currentPage - visiblePage) <= 2;

  return (
    <div className="page" ref={ref} style={{ backgroundColor: album.theme === 'luxury' ? '#111111' : '#141414' }}>
      <div className={`w-full h-full flex flex-col relative overflow-hidden text-white`}>
        
        {/* Cover Page Styling */}
        {isCover ? (
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            <div className="absolute inset-0 w-full h-full opacity-60">
              {(album.cover_image || media[0]?.url) && (
                <LazyImage src={album.cover_image || media[0]?.url} alt="Cover" preload />
              )}
              {!album.cover_image && !media[0] && <div className="absolute inset-0 w-full h-full bg-gold-deep/20" />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="z-10 text-center px-8 pb-12 mt-auto">
              <div className="w-12 h-[1px] bg-gold-primary mx-auto mb-6" />
              <h1 className="font-serif text-3xl tracking-widest text-gold-light uppercase mb-4 drop-shadow-lg">{album.title}</h1>
              <p className="text-sm font-sans tracking-[0.2em] uppercase text-white/80 drop-shadow-md">{album.client_name}</p>
              <p className="text-[9px] font-sans tracking-[0.3em] uppercase text-gold-primary/70 mt-8">{album.date}</p>
            </div>
          </div>
        ) : page ? (
          <>
            <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col justify-center">
              {page.layout === 'video' && pageMedia[0]?.type === 'video' ? (
                <VideoPlayer src={pageMedia[0].url} caption={pageMedia[0].caption} />
              ) : page.layout === 'full-spread' && pageMedia[0] ? (
                <div className="w-full h-full relative overflow-hidden">
                  <div className="w-full h-full scale-105 hover:scale-100 transition-all duration-700">
                    <LazyImage
                      src={isNearVisible ? pageMedia[0].url : undefined}
                      alt={pageMedia[0].caption || ""}
                      preload={currentPage <= 1}
                    />
                  </div>
                  {pageMedia[0].caption && (
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-sans tracking-widest text-white/90">
                        {pageMedia[0].caption}
                      </span>
                    </div>
                  )}
                </div>
              ) : page.layout === 'double' && pageMedia.length >= 2 ? (
                <div className="grid grid-rows-2 gap-4 h-full w-full p-8">
                  <div className="relative overflow-hidden h-full shadow-md">
                    <LazyImage
                      src={isNearVisible ? pageMedia[0].url : undefined}
                      alt=""
                      preload={currentPage <= 1}
                    />
                  </div>
                  <div className="relative overflow-hidden h-full shadow-md">
                    <LazyImage
                      src={isNearVisible ? pageMedia[1].url : undefined}
                      alt=""
                      preload={currentPage <= 1}
                    />
                  </div>
                </div>
              ) : pageMedia[0] ? (
                <div className="w-full h-full relative flex flex-col p-8 pb-12">
                  <div className="flex-1 relative shadow-lg overflow-hidden">
                    <LazyImage
                      src={isNearVisible ? pageMedia[0].url : undefined}
                      alt={pageMedia[0].caption || ""}
                      preload={currentPage <= 1}
                    />
                  </div>
                  {pageMedia[0].caption && (
                    <p className="text-[10px] font-sans tracking-widest text-center mt-6 opacity-60 uppercase drop-shadow-sm">
                      {pageMedia[0].caption}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <div className={`w-full h-full border-2 border-dashed ${album.theme === 'luxury' ? 'border-white/10' : 'border-black/10'} flex items-center justify-center`}>
                    <span className="font-serif italic text-xs opacity-40">Blank Page</span>
                  </div>
                </div>
              )}
            </div>

            {page.title && (
              <div className="absolute top-8 left-8 right-8 z-10 text-center drop-shadow-md">
                <h2 className="font-serif text-xl tracking-wide">{page.title}</h2>
                {page.description && <p className="mt-2 text-[10px] uppercase tracking-widest opacity-70">{page.description}</p>}
              </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-8 text-[8px] font-sans tracking-widest opacity-30 select-none">
              <span>CHAYA STUDIO</span>
              <span>PAGE {page.page_number}</span>
            </div>
          </>
        ) : null}

        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
      </div>
    </div>
  );
});

Page.displayName = "Page";
