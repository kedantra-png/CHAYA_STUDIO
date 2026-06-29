"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, BookOpen, Lock, Compass, Layout } from "@/components/icons";
import InkReveal from "@/components/InkReveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-gold-primary selection:text-black overflow-x-hidden relative">
      {/* Rainbow Background Revealed by Ink */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-600 z-0 opacity-50 pointer-events-none fixed" />
      
      {/* Ink Reveal Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <InkReveal maskColor={[5, 5, 5]} brushSize={100} lifetime={1200} />
      </div>

      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold-primary/5 rounded-full filter blur-[150px]" />
        <div className="absolute top-[40%] right-[-20%] w-[60%] h-[60%] bg-gold-deep/5 rounded-full filter blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 luxury-glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gold-bg-gradient flex items-center justify-center shadow-lg shadow-gold-primary/20">
            <Sparkles size={16} className="text-black" />
          </div>
          <h1 className="font-serif tracking-widest text-gold-light uppercase text-sm font-medium">Chaya Studio</h1>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/auth" className="text-xs uppercase tracking-widest text-stone-400 hover:text-white transition-colors">
            Client Login
          </Link>
          <Link 
            href="/auth" 
            className="px-5 py-2.5 gold-bg-gradient text-black font-semibold text-xs tracking-widest uppercase rounded-sm shadow-md hover:scale-[1.02] transition-luxury"
          >
            Studio Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 md:px-12 z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-primary/30 bg-gold-primary/5 mb-8">
          <Sparkles size={12} className="text-gold-primary" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold-light">The Future of Wedding Memories</span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight tracking-wide mb-6">
          Immortalize Your Special Day in <span className="gold-text-gradient italic font-medium">Stunning 3D</span>
        </h1>
        
        <p className="text-stone-400 max-w-2xl text-sm md:text-base tracking-wide font-light mb-12 leading-relaxed">
          Experience your wedding album like never before. Chaya Studio transforms traditional photography into breathtaking, interactive 3D virtual books that you can flip through, listen to, and share with the world.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5">
          <Link 
            href="/auth" 
            className="px-8 py-3.5 gold-bg-gradient text-black font-bold text-xs tracking-widest uppercase rounded-sm shadow-lg shadow-gold-primary/20 hover:scale-[1.02] transition-luxury flex items-center justify-center gap-2"
          >
            Create Your Album
          </Link>
          <button className="px-8 py-3.5 border border-white/10 hover:border-gold-primary/50 text-white font-semibold text-xs tracking-widest uppercase rounded-sm hover:bg-white/5 transition-luxury flex items-center justify-center gap-2">
            <Compass size={16} />
            View Demo
          </button>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-6 md:px-12 bg-black/50 border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-3xl md:text-4xl font-light tracking-wide mb-4">A Premium Digital Experience</h2>
            <div className="w-12 h-[1px] bg-gold-primary/50 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 rounded-sm luxury-glass border border-white/5 hover:border-gold-primary/30 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-gold-primary/10 group-hover:border-gold-primary/30 transition-colors">
                <BookOpen size={20} className="text-gold-light" />
              </div>
              <h3 className="text-lg font-serif tracking-wide mb-3 text-white">Hyper-Realistic 3D</h3>
              <p className="text-stone-400 text-xs leading-relaxed font-light">
                Feel the turn of every page. Our proprietary 3D rendering engine creates a lifelike physical book experience directly in your browser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-sm luxury-glass border border-white/5 hover:border-gold-primary/30 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-gold-primary/10 group-hover:border-gold-primary/30 transition-colors">
                <Layout size={20} className="text-gold-light" />
              </div>
              <h3 className="text-lg font-serif tracking-wide mb-3 text-white">Full-Bleed Layouts</h3>
              <p className="text-stone-400 text-xs leading-relaxed font-light">
                Gorgeous edge-to-edge panoramic spreads and elegant matte margins designed to showcase your photography perfectly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-sm luxury-glass border border-white/5 hover:border-gold-primary/30 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-gold-primary/10 group-hover:border-gold-primary/30 transition-colors">
                <Lock size={20} className="text-gold-light" />
              </div>
              <h3 className="text-lg font-serif tracking-wide mb-3 text-white">Private & Secure</h3>
              <p className="text-stone-400 text-xs leading-relaxed font-light">
                Your memories belong to you. Every album is protected by secure access codes and exclusive client portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/5 relative z-10 bg-[#020202]">
        <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={14} className="text-gold-primary" />
        </div>
        <h2 className="font-serif tracking-[0.3em] text-gold-light uppercase text-sm mb-4">Chaya Studio</h2>
        <p className="text-[10px] text-stone-600 font-sans tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Chaya Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
