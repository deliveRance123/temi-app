"use client";

import React from "react";
import { MessageSquare, BookOpen, Notebook, LogOut } from "lucide-react";

export type TabType = "teacher" | "practice" | "notes";

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onLogout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onLogout,
}) => {
  const tabs = [
    {
      id: "teacher" as TabType,
      label: "Classroom",
      icon: MessageSquare,
    },
    {
      id: "practice" as TabType,
      label: "Read & Write",
      icon: BookOpen,
    },
    {
      id: "notes" as TabType,
      label: "Notebook",
      icon: Notebook,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1642]/95 backdrop-blur-md text-white border-t border-white/10 shadow-xl">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? "text-cyan-400 font-bold"
                  : "text-indigo-200/60 hover:text-white"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? "bg-cyan-500/20 text-cyan-300" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Logout Button cleanly on the bottom right */}
        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-1 text-indigo-200/60 hover:text-rose-400 transition-colors cursor-pointer"
          title="Sign out"
        >
          <div className="p-1 rounded-xl">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Log Out</span>
        </button>
      </div>
    </div>
  );
};
