"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageSquareText, Sparkles, BookOpen } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900 max-w-md mx-auto relative overflow-hidden">
      {/* Top Half: Clean White with Icon and Branding */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        {/* Large Modern Message & Learning Icon */}
        <div className="w-24 h-24 rounded-3xl bg-blue-50 border-2 border-blue-600/20 flex items-center justify-center text-blue-700 shadow-sm relative">
          <MessageSquareText className="w-12 h-12 stroke-[2.2]" />
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#ff5b60] border-2 border-white flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-[#161938] tracking-tight">
            Read with Temitope
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Personal English Classroom
          </p>
        </div>
      </div>

      {/* Bottom Half: Deep Navy Curved Sheet with Coral 'Let's Start' Button */}
      <div className="bg-[#161938] text-white rounded-t-[2.5rem] px-8 pt-10 pb-12 space-y-6 text-center shadow-2xl">
        <div className="space-y-2 max-w-xs mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Let's learn and read together
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your personal space designed for you to read books, check spellings, and write with complete confidence.
          </p>
        </div>

        {/* Coral 'Let's Start' Pill Button (No input box needed!) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-full btn-coral font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening Classroom...</span>
              </span>
            ) : (
              <span>Let's Start</span>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-[#ff5b60]" />
          <span>Prepared with love for Temitope</span>
        </p>
      </div>
    </div>
  );
};
