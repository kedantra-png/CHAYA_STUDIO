"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db, Album } from "@/lib/db";
import { 
  Sparkles, 
  Plus, 
  Settings, 
  LogOut, 
  Search, 
  Layout, 
  Calendar,
  ImageIcon
} from "@/components/icons";

export default function DashboardPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Album State
  const [newClientName, setNewClientName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTheme, setNewTheme] = useState<'luxury' | 'modern' | 'classic'>('luxury');

  useEffect(() => {
    // Auth Check
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("chaya_admin_logged_in");
      if (!isLoggedIn) {
        router.push("/auth");
        return;
      }
    }

    setAlbums(db.getAlbums());
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("chaya_admin_logged_in");
    router.push("/auth");
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlbum = db.createAlbum({
      client_name: newClientName,
      title: newTitle,
      location: newLocation,
      date: newDate,
      theme: newTheme,
      cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000" // default placeholder
    });
    
    setShowCreateModal(false);
    router.push(`/dashboard/album/${newAlbum.id}`);
  };

  const filteredAlbums = albums.filter(a => 
    a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="luxury-glass border-b border-white/5 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gold-bg-gradient flex items-center justify-center shadow-lg shadow-gold-primary/20">
            <Sparkles size={16} className="text-black" />
          </div>
          <div>
            <h1 className="font-serif tracking-widest text-gold-light uppercase text-sm">Chaya Studio</h1>
            <p className="text-[9px] font-sans text-stone-500 tracking-[0.2em] uppercase">Master Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 gold-bg-gradient text-black font-bold text-xs tracking-widest uppercase rounded-sm shadow-md hover:scale-[1.01] transition-all flex items-center gap-2"
            id="btn_open_create_modal"
          >
            <Plus size={14} />
            <span>New Album</span>
          </button>
          
          <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="font-serif text-3xl font-light text-white tracking-wide">Client Albums</h2>
            <p className="text-stone-400 font-sans text-xs tracking-wide mt-1">Manage and edit your 3D luxury albums</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans placeholder-stone-500"
            />
          </div>
        </div>

        {/* Album Grid */}
        {filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map(album => (
              <Link href={`/dashboard/album/${album.id}`} key={album.id} className="group">
                <div className="luxury-glass border border-white/5 rounded-sm overflow-hidden hover:border-gold-primary/30 transition-all duration-500">
                  <div className="h-48 relative overflow-hidden bg-stone-900">
                    <img 
                      src={album.cover_image} 
                      alt="" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-90" />
                    
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-gold-primary text-[10px] uppercase tracking-widest font-sans mb-1">{album.client_name}</p>
                          <h3 className="text-white font-serif text-xl">{album.title}</h3>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <Settings size={14} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 grid grid-cols-2 gap-4 border-t border-white/5 bg-black/40">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Calendar size={12} />
                      <span className="text-[10px] uppercase tracking-widest font-sans">{album.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <Layout size={12} />
                      <span className="text-[10px] uppercase tracking-widest font-sans">Theme: {album.theme}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-sm luxury-glass">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-stone-500">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-white font-serif text-xl mb-2">No Albums Found</h3>
            <p className="text-stone-400 font-sans text-sm max-w-md mx-auto mb-6">Create your first stunning 3D interactive album to wow your clients.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 gold-bg-gradient text-black font-bold text-xs tracking-widest uppercase rounded-sm shadow-md hover:scale-[1.01] transition-all inline-flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Create New Album</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl relative overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="font-serif text-xl text-gold-light">Create New Album</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-500 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateAlbum} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase">Client Name</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans"
                    placeholder="e.g. John & Sarah"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase">Album Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans"
                    placeholder="e.g. Our Wedding Day"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans"
                    placeholder="e.g. The Grand Hotel"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase">Event Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans"
                    placeholder="e.g. October 24, 2026"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase">Album Theme Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {['luxury', 'modern', 'classic'].map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setNewTheme(theme as any)}
                      className={`py-3 rounded border text-xs font-sans tracking-widest uppercase transition-all ${
                        newTheme === theme 
                          ? 'bg-gold-primary/10 border-gold-primary text-gold-primary' 
                          : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-stone-400 hover:text-white font-sans text-xs tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 gold-bg-gradient text-black font-bold text-xs tracking-widest uppercase rounded-sm shadow-md hover:scale-[1.01] transition-all"
                  id="form_submit"
                >
                  Assemble Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
