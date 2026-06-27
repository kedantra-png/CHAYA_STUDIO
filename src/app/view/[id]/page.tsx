"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface ViewPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewForwardingPage({ params }: ViewPageProps) {
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    router.replace(`/album/${id}`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-6 h-6 rounded-full border border-gold-primary border-t-transparent animate-spin" />
      <span className="text-[10px] tracking-[0.25em] uppercase text-stone-500">Forwarding to Chaya Studio 3D Album...</span>
    </div>
  );
}
