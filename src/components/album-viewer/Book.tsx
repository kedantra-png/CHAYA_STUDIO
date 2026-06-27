"use client";

import React, { forwardRef } from "react";
import { Album, AlbumPage, MediaItem } from "@/lib/db";

interface PageProps {
  album: Album;
  page?: AlbumPage;
  media?: MediaItem[];
  isCover?: boolean;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(({ album, page, media = [], isCover }, ref) => {
  const pageMedia = page ? media.filter(m => m.page_id === page.id).sort((a, b) => a.order - b.order) : [];

  return (
    <div className="page" ref={ref} style={{ backgroundColor: album.theme === 'luxury' ? '#111111' : '#141414' }}>
      <div className={`w-full h-full flex flex-col relative overflow-hidden text-white`}>
        
        {/* Cover Page Styling */}
        {isCover ? (
          <div className="w-full h-full relative flex flex-col items-center justify-center">
            {media[0] ? (
              <img src={album.cover_image || media[0].url} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gold-deep/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="z-10 text-center px-8 pb-12 mt-auto">
              <div className="w-12 h-[1px] bg-gold-primary mx-auto mb-6" />
              <h1 className="font-serif text-3xl tracking-widest text-gold-light uppercase mb-4 drop-shadow-lg">{album.title}</h1>
              <p className="text-sm font-sans tracking-[0.2em] uppercase text-white/80 drop-shadow-md">{album.client_name}</p>
              <p className="text-[9px] font-sans tracking-[0.3em] uppercase text-gold-primary/70 mt-8">{album.date}</p>
            </div>
          </div>
        ) : page ? (
          /* Standard Page Styling */
          <>
            <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col justify-center">
              {page.layout === 'video' && pageMedia[0]?.type === 'video' ? (
                <div className="w-full h-full relative">
                  <video
                    src={pageMedia[0].url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                  {pageMedia[0].caption && (
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <span className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-sans tracking-widest text-white/90">
                        {pageMedia[0].caption}
                      </span>
                    </div>
                  )}
                </div>
              ) : page.layout === 'full-spread' && pageMedia[0] ? (
                // Edge-to-edge full bleed image
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={pageMedia[0].url}
                    alt={pageMedia[0].caption || ""}
                    className="w-full h-full object-cover scale-105 hover:scale-100 transition-all duration-700"
                  />
                  {pageMedia[0].caption && (
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-sans tracking-widest text-white/90">
                        {pageMedia[0].caption}
                      </span>
                    </div>
                  )}
                </div>
              ) : page.layout === 'double' && pageMedia.length >= 2 ? (
                // Two photos with elegant gap and margin
                <div className="grid grid-rows-2 gap-4 h-full w-full p-8">
                  <div className="relative overflow-hidden h-full shadow-md">
                    <img src={pageMedia[0].url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative overflow-hidden h-full shadow-md">
                    <img src={pageMedia[1].url} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : pageMedia[0] ? (
                // Default layout/single photo (Clean elegant margin like a matted print)
                <div className="w-full h-full relative flex flex-col p-8 pb-12">
                  <div className="flex-1 relative shadow-lg overflow-hidden">
                    <img
                      src={pageMedia[0].url}
                      alt={pageMedia[0].caption || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {pageMedia[0].caption && (
                    <p className="text-[10px] font-sans tracking-widest text-center mt-6 opacity-60 uppercase drop-shadow-sm">
                      {pageMedia[0].caption}
                    </p>
                  )}
                </div>
              ) : (
                // Placeholder when page has no media
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <div className={`w-full h-full border-2 border-dashed ${album.theme === 'luxury' ? 'border-white/10' : 'border-black/10'} flex items-center justify-center`}>
                    <span className="font-serif italic text-xs opacity-40">Blank Page</span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Header / Text Content */}
            {page.title && (
              <div className="absolute top-8 left-8 right-8 z-10 text-center drop-shadow-md">
                <h2 className="font-serif text-xl tracking-wide">{page.title}</h2>
                {page.description && <p className="mt-2 text-[10px] uppercase tracking-widest opacity-70">{page.description}</p>}
              </div>
            )}

            {/* Footer page number */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-8 text-[8px] font-sans tracking-widest opacity-30 select-none">
              <span>CHAYA STUDIO</span>
              <span>PAGE {page.page_number}</span>
            </div>
          </>
        ) : null}

        {/* CSS Page Shadows / Highlights for physical realism */}
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
      </div>
    </div>
  );
});

Page.displayName = "Page";
