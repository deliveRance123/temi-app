"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Notebook,
  Plus,
  Volume2,
  Copy,
  Check,
  Trash2,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { Note } from "@/lib/db";
import { speakText, stopSpeaking } from "@/lib/speech";

interface NotesViewProps {
  userId: number;
  initialRefreshTrigger?: number;
  onNotesCountChange?: (count: number) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  userId,
  initialRefreshTrigger = 0,
  onNotesCountChange,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"word" | "sentence" | "diary">("word");

  useEffect(() => {
    fetchNotes();
  }, [userId, categoryFilter, initialRefreshTrigger]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const url =
        categoryFilter === "all"
          ? `/api/notes?userId=${userId}`
          : `/api/notes?userId=${userId}&category=${categoryFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.notes) {
        setNotes(data.notes);
        if (categoryFilter === "all" && onNotesCountChange) {
          onNotesCountChange(data.notes.length);
        }
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: newTitle || newContent.slice(0, 25),
          content: newContent,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (data.success && data.note) {
        const updated = [data.note, ...notes];
        setNotes(updated);
        if (onNotesCountChange) {
          onNotesCountChange(updated.length);
        }
        setNewTitle("");
        setNewContent("");
        setShowAddModal(false);
      }
    } catch (e) {
      console.error("Failed to create note:", e);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const updated = notes.filter((n) => n.id !== id);
        setNotes(updated);
        if (onNotesCountChange) {
          onNotesCountChange(updated.length);
        }
      }
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  const handlePlay = (text: string, id: number) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    speakText(text, () => setSpeakingId(null));
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-24 pt-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Notebook className="w-5 h-5 text-cyan-400" />
            <span>Temitope's Notebook</span>
          </h2>
          <p className="text-xs text-indigo-200">
            {notes.length} real {notes.length === 1 ? "entry" : "entries"} saved
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {[
          { id: "all", label: "All Items" },
          { id: "word", label: "Words" },
          { id: "sentence", label: "Sentences" },
          { id: "diary", label: "Writings" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              categoryFilter === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "indigo-card text-indigo-200 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-indigo-200">
          Loading your notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="indigo-card p-6 text-center space-y-2 shadow-lg">
          <BookMarked className="w-8 h-8 text-indigo-300 mx-auto" />
          <h3 className="text-sm font-bold text-white">Notebook is empty</h3>
          <p className="text-xs text-indigo-200/70 max-w-xs mx-auto">
            Save words from stories or chat to review and practice anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="indigo-card p-3.5 space-y-2 border border-white/10 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      note.category === "word"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : note.category === "sentence"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                    }`}
                  >
                    {note.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {note.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePlay(note.content, note.id)}
                    className="p-1.5 rounded-lg text-cyan-300 hover:bg-white/10"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(note.content, note.id)}
                    className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10"
                    title="Copy"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-lg text-indigo-300 hover:text-rose-400 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs font-medium text-indigo-100 leading-relaxed">
                {note.content}
              </div>

              {(note.pronunciation || note.meaning) && (
                <div className="pt-2 border-t border-white/10 text-[11px] text-cyan-300 flex flex-col gap-0.5">
                  {note.pronunciation && (
                    <p className="font-semibold">
                      Syllables: {note.pronunciation}
                    </p>
                  )}
                  {note.meaning && (
                    <p className="text-indigo-200/80">{note.meaning}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="indigo-card bg-[#251f5c] p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl border border-white/20"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Write in Notebook</span>
              </h3>

              <form onSubmit={handleCreateNote} className="space-y-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {(["word", "sentence", "diary"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        newCategory === cat
                          ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                          : "bg-white/10 text-indigo-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-indigo-200 font-semibold mb-1 block">
                    Title or Word:
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Beautiful, Today's Lesson"
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-indigo-300/50 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-indigo-200 font-semibold mb-1 block">
                    Content / Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write sentence or definition here..."
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-indigo-300/50 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-indigo-200 text-xs font-semibold hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
