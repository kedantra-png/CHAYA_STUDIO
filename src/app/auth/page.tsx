"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Sparkles } from "@/components/icons";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Try real Supabase live auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && data.user) {
        localStorage.setItem("chaya_admin_logged_in", "true");
        router.push("/dashboard");
        return;
      }

      // 2. Demo fallback
      if (email === "admin@chaya.studio" && password === "password") {
        localStorage.setItem("chaya_admin_logged_in", "true");
        router.push("/dashboard");
        return;
      }

      // If both fail, show error
      setError("Invalid admin credentials. If you are using the real database, ensure this user exists in your Supabase Auth dashboard.");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold-primary/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-deep/10 rounded-full filter blur-[100px]" />
      </div>

      <div className="w-full max-w-md luxury-glass rounded-sm border border-gold-primary/20 p-8 md:p-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-primary/10 text-gold-primary mb-4 border border-gold-primary/20">
            <Lock size={20} />
          </div>
          <h1 className="font-serif text-2xl tracking-widest text-gold-light uppercase">Studio Portal</h1>
          <p className="text-stone-400 font-sans text-[10px] tracking-widest uppercase mt-3">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded text-center">
            <p className="text-red-400 text-[10px] font-sans tracking-wide">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                <Mail size={14} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-10 py-3.5 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans"
                placeholder="admin@chaya.studio"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-sans tracking-widest text-stone-400 uppercase ml-1">Master Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                <Lock size={14} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-10 py-3.5 text-sm text-white focus:outline-none focus:border-gold-primary/50 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 gold-bg-gradient text-black font-bold text-xs tracking-widest uppercase rounded-sm shadow-md hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              id="login_btn_submit"
            >
              {loading ? "Verifying..." : "Enter Studio"}
              {!loading && <Sparkles size={14} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
