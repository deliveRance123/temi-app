"use client";

import React from "react";
import Image from "next/image";
import { Flame, BookOpen, Notebook } from "lucide-react";
import { User } from "@/lib/db";

interface TopHeaderProps {
  user: User;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user }) => {
  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-[#251f5c]/95 backdrop-blur-md text-white border-b border-white/10 shadow-sm">
      {/* Profile */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-400/50 bg-indigo-900 flex-shrink-0">
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
          <p className="text-[11px] text-cyan-300 font-medium">Daily Learner</p>
        </div>
      </div>

      {/* Real-World Live Badges */}
      <div className="flex items-center gap-1.5">
        {/* Streak */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold border border-white/10">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{user.streak_days || 1}d</span>
        </div>

        {/* Real Words Learned */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold border border-white/10">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>{user.words_learned || 0} words</span>
        </div>

        {/* Real Notes Count */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-semibold border border-white/10">
          <Notebook className="w-3.5 h-3.5 text-cyan-300" />
          <span>{user.notes_count || 0} notes</span>
        </div>
      </div>
    </header>
  );
};
