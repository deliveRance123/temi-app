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
      label: "Chats",
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#161938] text-white border-t border-slate-800">
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
                  ? "text-[#ff5b60] font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? "bg-white/10" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Logout Button placed cleanly on the bottom right */}
        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#ff5b60] transition-colors cursor-pointer"
          title="Sign out"
        >
          <div className="p-1 rounded-lg">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">Log Out</span>
        </button>
      </div>
    </div>
  );
};
