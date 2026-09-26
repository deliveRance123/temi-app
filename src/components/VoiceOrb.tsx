"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Sparkles } from "lucide-react";

interface VoiceOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  statusText?: string;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isListening = false,
  isSpeaking = false,
  onClick,
  statusText,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group cursor-pointer focus:outline-none"
      >
        {/* Outer Glow Ring */}
        <div
          className={`absolute -inset-3 rounded-full blur-xl opacity-75 transition-all duration-500 ${
            isListening
              ? "bg-gradient-to-r from-red-500 via-pink-500 to-amber-500 animate-pulse"
              : isSpeaking
              ? "bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 animate-pulse"
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-40 group-hover:opacity-70"
          }`}
        />

        {/* 3D Orb Body */}
        <div
          className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isListening
              ? "bg-gradient-to-br from-rose-400 via-pink-600 to-red-600 border-2 border-white/50 shadow-glow-coral"
              : isSpeaking
              ? "bg-gradient-to-br from-amber-300 via-amber-500 to-orange-500 border-2 border-white/60 shadow-glow-gold"
              : "bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800 border border-white/30"
          }`}
        >
          {/* Inner Light Reflection (3D Gloss Effect) */}
          <div className="absolute top-2 left-3 w-8 h-4 rounded-full bg-white/40 blur-[1px] transform -rotate-12" />

          {/* Center Icon */}
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <Mic className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Volume2 className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
          ) : (
            <Sparkles className="w-8 h-8 text-white/90 drop-shadow-md group-hover:rotate-12 transition-transform" />
          )}
        </div>
      </motion.button>

      {/* Status Label */}
      {statusText && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs md:text-sm font-medium tracking-wide text-slate-300 bg-slate-900/60 px-3 py-1 rounded-full border border-white/10"
        >
          {statusText}
        </motion.p>
      )}
    </div>
  );
};
