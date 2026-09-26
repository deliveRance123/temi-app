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
}

export const NotesView: React.FC<NotesViewProps> = ({
  userId,
  initialRefreshTrigger = 0,
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
        setNotes((prev) => [data.note, ...prev]);
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
        setNotes((prev) => prev.filter((n) => n.id !== id));
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
    <div className="max-w-lg mx-auto px-4 pb-24 pt-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Notebook className="w-5 h-5 text-amber-400" />
            <span>Temitope's Notebook</span>
          </h2>
          <p className="text-xs text-slate-400">
            {notes.length} saved {notes.length === 1 ? "item" : "items"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3 rounded-xl clean-btn clean-btn-blue text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
                ? "bg-blue-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Loading your notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="clean-card p-6 text-center space-y-2">
          <BookMarked className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">Notebook is empty</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Save words from stories or chat to review and practice anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="clean-card p-3.5 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      note.category === "word"
                        ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        : note.category === "sentence"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-pink-500/10 text-pink-300 border border-pink-500/20"
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
                    className="p-1.5 rounded-lg text-amber-300 hover:bg-slate-800"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(note.content, note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Copy"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs font-medium text-slate-200 leading-relaxed">
                {note.content}
              </div>

              {(note.pronunciation || note.meaning) && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 flex flex-col gap-0.5">
                  {note.pronunciation && (
                    <p className="font-semibold">
                      Syllables: {note.pronunciation}
                    </p>
                  )}
                  {note.meaning && (
                    <p className="text-slate-400">{note.meaning}</p>
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
              className="clean-card bg-slate-900 p-5 rounded-2xl w-full max-w-sm space-y-4"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
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
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">
                    Title or Word:
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Beautiful, Today's Lesson"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">
                    Content / Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write sentence or definition here..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl clean-btn clean-btn-blue text-xs font-semibold"
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
