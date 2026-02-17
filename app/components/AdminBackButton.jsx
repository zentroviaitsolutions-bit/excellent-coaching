"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AdminBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        group relative inline-flex items-center gap-2
        px-5 py-2.5
        rounded-2xl
        bg-white/70
        backdrop-blur-md
        border border-white/40
        shadow-lg
        text-slate-800
        font-semibold
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-xl
        active:scale-95
      "
    >
      {/* Gradient Glow */}
      <span className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
        opacity-0
        group-hover:opacity-20
        blur-xl
        transition-all duration-500
      "></span>

      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      Back
    </button>
  );
}

