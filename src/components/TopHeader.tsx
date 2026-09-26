"use client";

import React from "react";
import Image from "next/image";
import { Flame, BookOpen } from "lucide-react";
import { User } from "@/lib/db";

interface TopHeaderProps {
  user: User;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user }) => {
  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-[#161938] text-white">
      {/* Profile */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 bg-blue-900 flex-shrink-0">
          <Image
            src={user.avatar_url || "/assets/temitope-brand.png"}
            alt="Temitope"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white leading-tight">
            {user.display_name || "Temitope"}
          </h2>
          <p className="text-[11px] text-slate-300 font-medium">Daily Learner</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{user.streak_days || 1}d</span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-[#ff5b60]" />
          <span>{user.words_learned || 12}</span>
        </div>
      </div>
    </header>
  );
};
