"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, BookOpen, PenTool, FileText, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-between bg-[#f0fdfa] text-slate-900 max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Top Emerald Blue Ambient Gradient Header */}
      <div className="bg-gradient-to-b from-[#042f2e] via-[#0f766e] to-[#0e7490] text-white pt-12 pb-14 px-6 rounded-b-[2.5rem] relative overflow-hidden text-center shadow-lg">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-300/10 rounded-full blur-xl pointer-events-none" />

        {/* Avatar with glowing ring */}
        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/90 shadow-xl bg-teal-800">
          <Image
            src="/assets/temitope-brand.png"
            alt="Temitope"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-teal-100 text-xs font-semibold mb-2 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-200" />
          <span>Personal English Sanctuary</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Welcome, Temitope!
        </h1>
        <p className="text-xs md:text-sm text-teal-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
          Learn to read books, understand spellings, and write with complete confidence.
        </p>
      </div>

      {/* Middle: Feature Highlights in Emerald Blue Cards */}
      <div className="p-6 space-y-3 flex-1 flex flex-col justify-center">
        <div className="p-3.5 rounded-2xl bg-white border border-teal-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Read Along Books</h3>
            <p className="text-xs text-slate-500">Listen as words highlight in real time</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-teal-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-700 flex-shrink-0">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Voice to Spelling</h3>
            <p className="text-xs text-slate-500">Speak and see the exact written words</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-teal-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upload Homework & Papers</h3>
            <p className="text-xs text-slate-500">Snap photos of papers for teacher help</p>
          </div>
        </div>
      </div>

      {/* Bottom: 1-Tap Entry Button (No Manual Input Required) */}
      <div className="p-6 pt-0 space-y-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl btn-emerald-blue font-bold text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-white">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Opening Your Classroom...</span>
            </span>
          ) : (
            <>
              <span>Enter Classroom</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-teal-800/80 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Private & automatically saved on your phone</span>
        </div>
      </div>
    </div>
  );
};
