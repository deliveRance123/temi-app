"use client";

import React, { useState, useEffect } from "react";
import { LoginCard } from "@/components/LoginCard";
import { TopHeader } from "@/components/TopHeader";
import { BottomNav, TabType } from "@/components/BottomNav";
import { TeacherChat } from "@/components/TeacherChat";
import { ReadWriteHub } from "@/components/ReadWriteHub";
import { NotesView } from "@/components/NotesView";
import { User } from "@/lib/db";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("teacher");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshNotesTrigger, setRefreshNotesTrigger] = useState(0);

  // Load user session and refresh real-world counts
  useEffect(() => {
    try {
      const saved = localStorage.getItem("temitope_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        fetchRealCounts(parsed.username || "TEMITOPE");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchRealCounts = async (username: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("temitope_user", JSON.stringify(data.user));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    try {
      localStorage.setItem("temitope_user", JSON.stringify(loggedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem("temitope_user");
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToNotes = async (
    content: string,
    title = "Saved Item",
    category = "word"
  ) => {
    if (!user) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title,
          content,
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Saved to Notebook 📓");
        setRefreshNotesTrigger((prev) => prev + 1);
        setUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            notes_count: (prev.notes_count || 0) + 1,
            words_learned: category === "word" ? (prev.words_learned || 0) + 1 : prev.words_learned,
          };
          localStorage.setItem("temitope_user", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotesCountChange = (count: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, notes_count: count };
      localStorage.setItem("temitope_user", JSON.stringify(updated));
      return updated;
    });
  };

  if (!user) {
    return <LoginCard onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#372f7d] via-[#251f5c] to-[#1a1642] text-white antialiased">
      {/* Top Header */}
      <TopHeader user={user} />

      {/* Main Tab Screen */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col overflow-hidden">
        {activeTab === "teacher" && (
          <TeacherChat
            userId={user.id}
            onSaveToNotes={handleSaveToNotes}
          />
        )}

        {activeTab === "practice" && (
          <div className="flex-1 overflow-y-auto">
            <ReadWriteHub
              userId={user.id}
              onSaveToNotes={handleSaveToNotes}
            />
          </div>
        )}

        {activeTab === "notes" && (
          <div className="flex-1 overflow-y-auto">
            <NotesView
              userId={user.id}
              initialRefreshTrigger={refreshNotesTrigger}
              onNotesCountChange={handleNotesCountChange}
            />
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#1e1b4b] text-cyan-300 font-medium text-xs shadow-2xl flex items-center gap-2 border border-cyan-400/30">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation with Logout at bottom side */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onLogout={handleLogout}
      />
    </div>
  );
}
