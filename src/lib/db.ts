import { supabase } from "./supabase";

export interface Album {
  id: string;
  user_id?: string;
  title: string;
  client_name: string;
  date: string;
  location: string;
  cover_image: string;
  qr_code_id: string;
  qr_code: string;
  status: 'draft' | 'published';
  created_at: string;
  
  // Settings & Theme
  theme: 'royal' | 'classic' | 'modern' | 'luxury';
  animation_speed: number;
  shadow: boolean;
  depth: number;
  background_music: string;
  password?: string;
  expiry_date?: string;
}

function generateQRCodeId(existingIds: string[] = []): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const idSet = new Set(existingIds);
  let result: string;
  do {
    result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (idSet.has(result));
  return result;
}

export interface AlbumPage {
  id: string;
  album_id: string;
  page_number: number;
  layout: 'single' | 'double' | 'full-spread' | 'video' | 'text-left' | 'text-right';
  title?: string;
  description?: string;
}

export interface MediaItem {
  id: string;
  album_id: string;
  page_id?: string;
  type: 'image' | 'video';
  url: string;
  order: number;
  caption?: string;
}

export interface AlbumAnalytics {
  id: string;
  album_id: string;
  views: number;
  device_desktop: number;
  device_mobile: number;
  device_tablet: number;
  locations: { city: string; count: number }[];
}

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1200",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200",
];

const SAMPLE_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-kissing-under-a-veil-44368-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-bride-holding-a-bouquet-44367-large.mp4",
];

const SAMPLE_MUSIC = [
  { name: "Cinematic Piano", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Royal Strings", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Acoustic Love", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const DEFAULT_ALBUMS: Album[] = [
  {
    id: "royal-heritage",
    title: "The Royal Heritage Wedding",
    client_name: "Maharani Gayatri & Yuvaraj Vikram",
    date: "2026-11-12",
    location: "City Palace, Udaipur",
    cover_image: SAMPLE_PHOTOS[0],
    qr_code_id: "kR7mBx2LpQ",
    qr_code: "/album/kR7mBx2LpQ",
    status: "published",
    created_at: new Date().toISOString(),
    theme: "royal",
    animation_speed: 1.2,
    shadow: true,
    depth: 1.5,
    background_music: SAMPLE_MUSIC[1].url,
    password: "",
    expiry_date: ""
  },
  {
    id: "modern-minimalist",
    title: "A Minimalist Love Story",
    client_name: "Sarah & David",
    date: "2026-08-24",
    location: "The Glasshouse, New York",
    cover_image: SAMPLE_PHOTOS[2],
    qr_code_id: "aJ4nWx6TyR",
    qr_code: "/album/aJ4nWx6TyR",
    status: "published",
    created_at: new Date().toISOString(),
    theme: "modern",
    animation_speed: 0.8,
    shadow: true,
    depth: 0.8,
    background_music: SAMPLE_MUSIC[2].url,
    password: "",
    expiry_date: ""
  },
  {
    id: "classic-romance",
    title: "Eternity in Tuscany",
    client_name: "Elena & Matteo",
    date: "2026-05-18",
    location: "Villa d'Este, Lake Como",
    cover_image: SAMPLE_PHOTOS[7],
    qr_code_id: "zP9mDx4KwS",
    qr_code: "/album/zP9mDx4KwS",
    status: "published",
    created_at: new Date().toISOString(),
    theme: "classic",
    animation_speed: 1.0,
    shadow: true,
    depth: 1.2,
    background_music: SAMPLE_MUSIC[0].url,
    password: "",
    expiry_date: ""
  }
];

const getInitialPages = (albumId: string): AlbumPage[] => {
  if (albumId === "royal-heritage") {
    return [
      { id: "rh-p1", album_id: albumId, page_number: 1, layout: "text-left", title: "The Royal Union", description: "A celebration of legacy and love, in the heart of Udaipur." },
      { id: "rh-p2", album_id: albumId, page_number: 2, layout: "single" },
      { id: "rh-p3", album_id: albumId, page_number: 3, layout: "double" },
      { id: "rh-p4", album_id: albumId, page_number: 4, layout: "video" },
      { id: "rh-p5", album_id: albumId, page_number: 5, layout: "full-spread" },
      { id: "rh-p6", album_id: albumId, page_number: 6, layout: "text-right", title: "Forever After", description: "Whispers of eternal promises underneath the golden skies." },
    ];
  }
  return [
    { id: `${albumId}-p1`, album_id: albumId, page_number: 1, layout: "text-left", title: "Our Story Begins", description: "Moments captured forever." },
    { id: `${albumId}-p2`, album_id: albumId, page_number: 2, layout: "single" },
    { id: `${albumId}-p3`, album_id: albumId, page_number: 3, layout: "double" },
    { id: `${albumId}-p4`, album_id: albumId, page_number: 4, layout: "video" },
    { id: `${albumId}-p5`, album_id: albumId, page_number: 5, layout: "full-spread" },
  ];
};

const getInitialMedia = (albumId: string): MediaItem[] => {
  const images = [...SAMPLE_PHOTOS];
  const videos = [...SAMPLE_VIDEOS];
  if (albumId === "royal-heritage") {
    return [
      { id: "rh-m1", album_id: albumId, page_id: "rh-p2", type: "image", url: images[1], order: 1, caption: "The Bride's Veil" },
      { id: "rh-m2", album_id: albumId, page_id: "rh-p3", type: "image", url: images[3], order: 2, caption: "The Sacred Rings" },
      { id: "rh-m3", album_id: albumId, page_id: "rh-p3", type: "image", url: images[4], order: 3, caption: "A Glimpse of Joy" },
      { id: "rh-m4", album_id: albumId, page_id: "rh-p4", type: "video", url: videos[0], order: 4, caption: "Under the Veil" },
      { id: "rh-m5", album_id: albumId, page_id: "rh-p5", type: "image", url: images[6], order: 5, caption: "Sunset Serenade" },
    ];
  }
  return [
    { id: `${albumId}-m1`, album_id: albumId, page_id: `${albumId}-p2`, type: "image", url: images[2], order: 1, caption: "Beautiful Moments" },
    { id: `${albumId}-m2`, album_id: albumId, page_id: `${albumId}-p3`, type: "image", url: images[5], order: 2, caption: "The Ceremony" },
    { id: `${albumId}-m3`, album_id: albumId, page_id: `${albumId}-p3`, type: "image", url: images[6], order: 3, caption: "Joyous Exit" },
    { id: `${albumId}-m4`, album_id: albumId, page_id: `${albumId}-p4`, type: "video", url: videos[1], order: 4, caption: "Laughter and Love" },
    { id: `${albumId}-m5`, album_id: albumId, page_id: `${albumId}-p5`, type: "image", url: images[0], order: 5, caption: "Together Forever" },
  ];
};

class HybridDatabase {
  private isBrowser = typeof window !== "undefined";
  private useSupabase = false;

  constructor() {
    // Check if real Supabase settings are present and not placeholder
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url && key && !url.includes("placeholder") && !key.includes("placeholder")) {
      this.useSupabase = true;
    }
  }

  // LocalStorage helper fallback
  public getLocal<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    const item = localStorage.getItem(key);
    if (!item) {
      this.setLocal(key, defaultValue);
      return defaultValue;
    }
    try {
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  public setLocal<T>(key: string, data: T) {
    if (this.isBrowser) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Initialize Local Mock Store if Empty
  public seedLocalIfEmpty() {
    const albums = this.getLocal<Album[]>("chaya_albums", []);
    if (albums.length === 0) {
      this.setLocal("chaya_albums", DEFAULT_ALBUMS);
      DEFAULT_ALBUMS.forEach(album => {
        this.setLocal(`chaya_pages_${album.id}`, getInitialPages(album.id));
        this.setLocal(`chaya_media_${album.id}`, getInitialMedia(album.id));
      });
    } else {
      this.backfillQRCodeIds(albums);
    }
  }

  private backfillQRCodeIds(albums: Album[]) {
    const existingQRIds = albums.map(a => a.qr_code_id).filter(Boolean);
    let changed = false;
    const updated = albums.map(a => {
      if (!a.qr_code_id) {
        changed = true;
        const qr_code_id = generateQRCodeId(existingQRIds);
        existingQRIds.push(qr_code_id);
        return { ...a, qr_code_id, qr_code: `/album/${qr_code_id}` };
      }
      return a;
    });
    if (changed) {
      this.setLocal("chaya_albums", updated);
    }
  }

  // --- ALBUMS API ---

  async getAlbums(): Promise<Album[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.from("albums").select("*");
        if (error) throw error;
        if (data && data.length > 0) return data as Album[];
      } catch (err) {
        console.warn("Supabase Fetch failed, falling back to LocalStorage:", err);
      }
    }
    this.seedLocalIfEmpty();
    return this.getLocal<Album[]>("chaya_albums", []);
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.from("albums").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (data) return data as Album;
        const { data: qrData, error: qrError } = await supabase.from("albums").select("*").eq("qr_code_id", id).maybeSingle();
        if (!qrError && qrData) return qrData as Album;
      } catch (err) {
        console.warn("Supabase Fetch failed, falling back to LocalStorage:", err);
      }
    }
    this.seedLocalIfEmpty();
    return this.getLocal<Album[]>("chaya_albums", []).find(a => a.id === id || a.qr_code_id === id);
  }

  async createAlbum(album: Partial<Album> & { title: string; client_name: string }): Promise<Album> {
    const id = album.id || album.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substr(2, 6);
    const existing = this.getLocal<Album[]>("chaya_albums", []);
    const existingQRIds = existing.map(a => a.qr_code_id).filter(Boolean);
    const qr_code_id = album.qr_code_id || generateQRCodeId(existingQRIds);
    const newAlbum: Album = {
      id,
      title: album.title,
      client_name: album.client_name,
      date: album.date || new Date().toISOString().split('T')[0],
      location: album.location || "Chaya Studio",
      cover_image: album.cover_image || SAMPLE_PHOTOS[0],
      qr_code_id,
      qr_code: `/album/${qr_code_id}`,
      status: album.status || 'draft',
      created_at: new Date().toISOString(),
      theme: album.theme || 'luxury',
      animation_speed: album.animation_speed || 1.0,
      shadow: album.shadow !== undefined ? album.shadow : true,
      depth: album.depth || 1.0,
      background_music: album.background_music || SAMPLE_MUSIC[0].url,
      password: album.password || "",
      expiry_date: album.expiry_date || ""
    };

    if (this.useSupabase) {
      try {
        const { error } = await supabase.from("albums").insert([newAlbum]);
        if (!error) {
          // Pre-seed pages and media on Supabase
          const pages = getInitialPages(id).map(p => ({ ...p, album_id: id }));
          const media = getInitialMedia(id).map(m => ({ ...m, album_id: id }));
          await supabase.from("album_pages").insert(pages);
          await supabase.from("media").insert(media);
          await supabase.from("analytics").insert([{ id: `anal-${id}`, album_id: id, views: 0 }]).then(() => {});
          return newAlbum;
        }
      } catch (err) {
        console.warn("Supabase write failed, writing locally:", err);
      }
    }

    // LocalStorage Fallback Write
    this.seedLocalIfEmpty();
    const localAlbums = this.getLocal<Album[]>("chaya_albums", []);
    localAlbums.push(newAlbum);
    this.setLocal("chaya_albums", localAlbums);

    this.setLocal(`chaya_pages_${id}`, getInitialPages(id).map(p => ({ ...p, album_id: id })));
    this.setLocal(`chaya_media_${id}`, getInitialMedia(id).map(m => ({ ...m, album_id: id })));
    return newAlbum;
  }

  async updateAlbum(id: string, updates: Partial<Album>): Promise<Album> {
    const localAlbums = this.getLocal<Album[]>("chaya_albums", []);
    const existing = localAlbums.find(a => a.id === id);
    const existingQRIds = localAlbums.map(a => a.qr_code_id).filter(Boolean);

    if (!updates.qr_code_id && existing && !existing.qr_code_id) {
      updates.qr_code_id = generateQRCodeId(existingQRIds);
    }
    if (updates.qr_code_id && !updates.qr_code) {
      updates.qr_code = `/album/${updates.qr_code_id}`;
    }

    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.from("albums").update(updates).eq("id", id).select().single();
        if (!error && data) return data as Album;
      } catch (err) {
        console.warn("Supabase update failed, editing locally:", err);
      }
    }

    const index = localAlbums.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Album not found");

    localAlbums[index] = { ...localAlbums[index], ...updates };
    this.setLocal("chaya_albums", localAlbums);
    return localAlbums[index];
  }

  async deleteAlbum(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase.from("albums").delete().eq("id", id);
        if (!error) return;
      } catch (err) {
        console.warn("Supabase delete failed, deleting locally:", err);
      }
    }

    let localAlbums = this.getLocal<Album[]>("chaya_albums", []);
    localAlbums = localAlbums.filter(a => a.id !== id);
    this.setLocal("chaya_albums", localAlbums);
    if (this.isBrowser) {
      localStorage.removeItem(`chaya_pages_${id}`);
      localStorage.removeItem(`chaya_media_${id}`);
      localStorage.removeItem(`chaya_analytics_${id}`);
    }
  }

  // --- PAGES API ---

  async getPages(albumId: string): Promise<AlbumPage[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.from("album_pages").select("*").eq("album_id", albumId);
        if (error) throw error;
        if (data && data.length > 0) return data as AlbumPage[];
      } catch (err) {
        console.warn("Supabase Fetch failed, falling back to LocalStorage:", err);
      }
    }
    this.seedLocalIfEmpty();
    return this.getLocal<AlbumPage[]>(`chaya_pages_${albumId}`, []);
  }

  async savePages(albumId: string, pages: AlbumPage[]): Promise<void> {
    if (this.useSupabase) {
      try {
        // Clear old pages and batch insert new ones
        await supabase.from("album_pages").delete().eq("album_id", albumId);
        const { error } = await supabase.from("album_pages").insert(pages);
        if (!error) return;
      } catch (err) {
        console.warn("Supabase save pages failed, writing locally:", err);
      }
    }
    this.setLocal(`chaya_pages_${albumId}`, pages);
  }

  // --- MEDIA API ---

  async getMedia(albumId: string): Promise<MediaItem[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.from("media").select("*").eq("album_id", albumId);
        if (error) throw error;
        if (data && data.length > 0) return data as MediaItem[];
      } catch (err) {
        console.warn("Supabase Fetch failed, falling back to LocalStorage:", err);
      }
    }
    this.seedLocalIfEmpty();
    return this.getLocal<MediaItem[]>(`chaya_media_${albumId}`, []);
  }

  async saveMedia(albumId: string, media: MediaItem[]): Promise<void> {
    if (this.useSupabase) {
      try {
        await supabase.from("media").delete().eq("album_id", albumId);
        const { error } = await supabase.from("media").insert(media);
        if (!error) return;
      } catch (err) {
        console.warn("Supabase save media failed, writing locally:", err);
      }
    }
    this.setLocal(`chaya_media_${albumId}`, media);
  }

  // --- ANALYTICS API ---

  async getAnalytics(albumId: string): Promise<AlbumAnalytics> {
    const defaultAnal = {
      id: `anal-${albumId}`,
      album_id: albumId,
      views: 0,
      device_desktop: 0,
      device_mobile: 0,
      device_tablet: 0,
      locations: []
    };

    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.from("analytics").select("*").eq("album_id", albumId).maybeSingle();
        if (error) throw error;
        if (data) return data as AlbumAnalytics;
      } catch (err) {
        console.warn("Supabase Fetch failed, falling back to LocalStorage:", err);
      }
    }

    this.seedLocalIfEmpty();
    return this.getLocal<AlbumAnalytics>(`chaya_analytics_${albumId}`, defaultAnal);
  }

  async incrementViews(albumId: string, device: 'desktop' | 'mobile' | 'tablet' = 'desktop'): Promise<void> {
    const anal = await this.getAnalytics(albumId);
    anal.views += 1;
    if (device === 'desktop') anal.device_desktop += 1;
    else if (device === 'mobile') anal.device_mobile += 1;
    else anal.device_tablet += 1;

    const locations = ["Mumbai", "Bengaluru", "New Delhi", "New York", "London", "San Francisco", "Paris", "Udaipur"];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    const locIndex = anal.locations.findIndex(l => l.city === randomLoc);
    if (locIndex !== -1) {
      anal.locations[locIndex].count += 1;
    } else {
      anal.locations.push({ city: randomLoc, count: 1 });
    }

    if (this.useSupabase) {
      try {
        // Update Supabase explicitly to avoid unique constraint errors entirely
        const { error } = await supabase.from("analytics").update({
          views: anal.views,
          device_desktop: anal.device_desktop,
          device_mobile: anal.device_mobile,
          device_tablet: anal.device_tablet,
          locations: anal.locations
        }).eq("album_id", albumId);
        if (!error) return;
      } catch (err) {
        console.warn("Supabase upsert views failed, updating locally:", err);
      }
    }

    this.setLocal(`chaya_analytics_${albumId}`, anal);
  }
}

// Instantiate hybrid database engine
const localDB = new HybridDatabase();

// Sync functions to bridge Next.js synchronous hooks (using simple promises internally or direct state)
export const db = {
  getAlbums: () => {
    // Provide a synchronous array wrapper that resolves locally, but runs the async hybrid update in background
    if (typeof window !== "undefined") {
      const albums = localStorage.getItem("chaya_albums");
      if (albums) {
        // Trigger background sync
        localDB.getAlbums();
        return JSON.parse(albums) as Album[];
      }
    }
    // Seed and return defaults
    localDB.seedLocalIfEmpty();
    return localDB.getLocal<Album[]>("chaya_albums", DEFAULT_ALBUMS);
  },

  getAlbum: (id: string) => {
    if (typeof window !== "undefined") {
      const albums = localStorage.getItem("chaya_albums");
      if (albums) {
        const list = JSON.parse(albums) as Album[];
        const found = list.find(a => a.id === id || a.qr_code_id === id);
        if (found) return found;
      }
    }
    return DEFAULT_ALBUMS.find(a => a.id === id || a.qr_code_id === id);
  },

  createAlbum: (album: Partial<Album> & { title: string; client_name: string }) => {
    // Run async sync on backend
    localDB.createAlbum(album);
    // Write synchronous copy immediately for Next.js layout updates
    const id = album.id || album.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substr(2, 6);
    const existingList = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("chaya_albums") || "[]") as Album[]
      : [];
    const existingQRIds = existingList.map(a => a.qr_code_id).filter(Boolean);
    const qr_code_id = album.qr_code_id || generateQRCodeId(existingQRIds);
    const newAlbum: Album = {
      id,
      title: album.title,
      client_name: album.client_name,
      date: album.date || new Date().toISOString().split('T')[0],
      location: album.location || "Chaya Studio",
      cover_image: album.cover_image || SAMPLE_PHOTOS[0],
      qr_code_id,
      qr_code: `/album/${qr_code_id}`,
      status: album.status || 'draft',
      created_at: new Date().toISOString(),
      theme: album.theme || 'luxury',
      animation_speed: album.animation_speed || 1.0,
      shadow: album.shadow !== undefined ? album.shadow : true,
      depth: album.depth || 1.0,
      background_music: album.background_music || SAMPLE_MUSIC[0].url,
      password: album.password || "",
      expiry_date: album.expiry_date || ""
    };
    
    if (typeof window !== "undefined") {
      const list = JSON.parse(localStorage.getItem("chaya_albums") || "[]") as Album[];
      list.push(newAlbum);
      localStorage.setItem("chaya_albums", JSON.stringify(list));
      localStorage.setItem(`chaya_pages_${id}`, JSON.stringify(getInitialPages(id)));
      localStorage.setItem(`chaya_media_${id}`, JSON.stringify(getInitialMedia(id)));
    }
    return newAlbum;
  },

  updateAlbum: (id: string, updates: Partial<Album>) => {
    localDB.updateAlbum(id, updates);
    if (typeof window !== "undefined") {
      const list = JSON.parse(localStorage.getItem("chaya_albums") || "[]") as Album[];
      const idx = list.findIndex(a => a.id === id);
      if (idx !== -1) {
        const existing = list[idx];
        const existingQRIds = list.map(a => a.qr_code_id).filter(Boolean);
        if (!updates.qr_code_id && !existing.qr_code_id) {
          updates.qr_code_id = generateQRCodeId(existingQRIds);
        }
        if (updates.qr_code_id && !updates.qr_code) {
          updates.qr_code = `/album/${updates.qr_code_id}`;
        }
        list[idx] = { ...existing, ...updates };
        localStorage.setItem("chaya_albums", JSON.stringify(list));
        return list[idx];
      }
    }
    return DEFAULT_ALBUMS[0];
  },

  deleteAlbum: (id: string) => {
    localDB.deleteAlbum(id);
    if (typeof window !== "undefined") {
      const list = JSON.parse(localStorage.getItem("chaya_albums") || "[]") as Album[];
      const filtered = list.filter(a => a.id !== id);
      localStorage.setItem("chaya_albums", JSON.stringify(filtered));
      localStorage.removeItem(`chaya_pages_${id}`);
      localStorage.removeItem(`chaya_media_${id}`);
      localStorage.removeItem(`chaya_analytics_${id}`);
    }
  },

  getPages: (albumId: string) => {
    if (typeof window !== "undefined") {
      const pages = localStorage.getItem(`chaya_pages_${albumId}`);
      if (pages) return JSON.parse(pages) as AlbumPage[];
    }
    return getInitialPages(albumId);
  },

  savePages: (albumId: string, pages: AlbumPage[]) => {
    localDB.savePages(albumId, pages);
    if (typeof window !== "undefined") {
      localStorage.setItem(`chaya_pages_${albumId}`, JSON.stringify(pages));
    }
  },

  getMedia: (albumId: string) => {
    if (typeof window !== "undefined") {
      const media = localStorage.getItem(`chaya_media_${albumId}`);
      if (media) return JSON.parse(media) as MediaItem[];
    }
    return getInitialMedia(albumId);
  },

  saveMedia: (albumId: string, media: MediaItem[]) => {
    localDB.saveMedia(albumId, media);
    if (typeof window !== "undefined") {
      localStorage.setItem(`chaya_media_${albumId}`, JSON.stringify(media));
    }
  },

  getAnalytics: (albumId: string) => {
    if (typeof window !== "undefined") {
      const anal = localStorage.getItem(`chaya_analytics_${albumId}`);
      if (anal) return JSON.parse(anal) as AlbumAnalytics;
    }
    return {
      id: `anal-${albumId}`,
      album_id: albumId,
      views: 0,
      device_desktop: 0,
      device_mobile: 0,
      device_tablet: 0,
      locations: []
    };
  },

  incrementViews: (albumId: string, device: 'desktop' | 'mobile' | 'tablet' = 'desktop') => {
    localDB.incrementViews(albumId, device);
    if (typeof window !== "undefined") {
      const key = `chaya_analytics_${albumId}`;
      const data = localStorage.getItem(key);
      const anal = data ? JSON.parse(data) as AlbumAnalytics : {
        id: `anal-${albumId}`,
        album_id: albumId,
        views: 0,
        device_desktop: 0,
        device_mobile: 0,
        device_tablet: 0,
        locations: []
      };
      
      anal.views += 1;
      if (device === 'desktop') anal.device_desktop += 1;
      else if (device === 'mobile') anal.device_mobile += 1;
      else anal.device_tablet += 1;

      const locations = ["Mumbai", "Bengaluru", "New Delhi", "New York", "London", "San Francisco", "Paris", "Udaipur"];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const locIndex = anal.locations.findIndex(l => l.city === randomLoc);
      if (locIndex !== -1) {
        anal.locations[locIndex].count += 1;
      } else {
        anal.locations.push({ city: randomLoc, count: 1 });
      }

      localStorage.setItem(key, JSON.stringify(anal));
    }
  }
};

export const samplePhotos = SAMPLE_PHOTOS;
export const sampleVideos = SAMPLE_VIDEOS;
export const sampleMusic = SAMPLE_MUSIC;
