"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

interface LoginCardProps {
  onLogin: (user: any) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "TEMITOPE" }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLogin(data.user);
      }
    } catch (e) {
      console.error("Login failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-md mx-auto p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Section */}
      <div className="pt-10 flex flex-col items-center text-center space-y-4">
        {/* Avatar with Royal Indigo Border */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-400/40 shadow-2xl bg-indigo-950">
          <Image
            src="/assets/temitope-brand.png"
            alt="Temitope"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-xs font-semibold mb-1 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Personal English Classroom</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Hi Temitope
          </h1>
          <p className="text-sm text-indigo-200/80 max-w-xs mx-auto">
            Ready to read and write today?
          </p>
        </div>
      </div>

      {/* Middle Spacer Card (Clean, minimal, no extra clutter) */}
      <div className="indigo-card p-6 my-auto text-center space-y-2 border border-white/10">
        <p className="text-base font-semibold text-white">
          Your personal learning space is ready.
        </p>
        <p className="text-xs text-indigo-200/70 leading-relaxed">
          Tap the button below to continue where you left off.
        </p>
      </div>

      {/* Bottom Button Section */}
      <div className="pb-8 space-y-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl btn-indigo-primary font-bold text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-white">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Opening Classroom...</span>
            </span>
          ) : (
            <>
              <span>Enter Classroom</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-[11px] text-indigo-300/60 text-center font-medium">
          Installed and saved locally on your phone 📱
        </p>
      </div>
    </div>
  );
};
