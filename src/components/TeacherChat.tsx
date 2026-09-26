"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  BookmarkPlus,
  Paperclip,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { ChatMessage } from "@/lib/db";
import { speakText, stopSpeaking, createSpeechRecognizer } from "@/lib/speech";

interface TeacherChatProps {
  userId: number;
  onSaveToNotes: (content: string, title?: string, category?: string) => void;
}

export const TeacherChat: React.FC<TeacherChatProps> = ({
  userId,
  onSaveToNotes,
}) => {
  const [mode, setMode] = useState<"ask" | "voice_note">("ask");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>("image/jpeg");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchChatHistory();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.messages) {
        if (data.messages.length === 0) {
          setMessages([
            {
              id: 0,
              user_id: userId,
              role: "teacher",
              content:
                "Hello Temitope! I am Teacher Grace. Tap Ask Teacher to ask questions, or Voice Note to check spelling. You can also upload any book page or paper photo for reading help!",
              created_at: new Date().toISOString(),
            },
          ]);
        } else {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeechId(null);

      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setInputText(transcript);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        try {
          recognizer.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Voice recognition is not supported in this browser. Please use Chrome or Safari.");
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || loading) return;

    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }

    const currentText = inputText.trim();
    const currentImg = selectedImage;
    const currentMime = selectedMimeType;

    setInputText("");
    setSelectedImage(null);

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      user_id: userId,
      role: "user",
      content: currentText || "Uploaded paper photo for reading help",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: currentText,
          mode,
          imageBase64: currentImg,
          imageMimeType: currentMime,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        playAudio(data.message.content, data.message.id);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text: string, id: number) => {
    if (activeSpeechId === id && isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeechId(null);
      return;
    }

    setIsSpeaking(true);
    setActiveSpeechId(id);
    speakText(text, () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    });
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (msg: ChatMessage) => {
    onSaveToNotes(
      msg.content,
      msg.role === "teacher" ? "Teacher Note" : "My Practice",
      mode === "voice_note" ? "word" : "sentence"
    );
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-md mx-auto bg-[#f0fdfa] px-4">
      {/* Teacher Profile Header in Emerald Blue */}
      <div className="flex items-center justify-between py-2 border-b border-teal-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f766e] to-[#0e7490] flex items-center justify-center text-white font-bold relative text-sm shadow-sm">
            <span>TG</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Teacher Grace
            </h3>
            <p className="text-[11px] text-teal-700 font-medium">Online • Patient Guide</p>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-teal-100/70 rounded-full">
          <button
            type="button"
            onClick={() => setMode("ask")}
            className={`py-1 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mode === "ask"
                ? "bg-[#0f766e] text-white shadow-xs"
                : "text-teal-900 hover:text-slate-900"
            }`}
          >
            Ask Teacher
          </button>
          <button
            type="button"
            onClick={() => setMode("voice_note")}
            className={`py-1 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mode === "voice_note"
                ? "bg-[#0e7490] text-white shadow-xs"
                : "text-teal-900 hover:text-slate-900"
            }`}
          >
            Voice Note
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? "btn-emerald-blue rounded-br-none shadow-sm"
                    : "bg-white text-slate-800 border border-teal-100 rounded-bl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">
                  {msg.content}
                </div>

                {/* Actions: Listen, Copy, Save Note */}
                <div
                  className={`flex items-center gap-3 mt-2 pt-1.5 border-t text-xs ${
                    isUser
                      ? "border-white/20 text-white/90"
                      : "border-slate-100 text-slate-500"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => playAudio(msg.content, msg.id)}
                    className="flex items-center gap-1 hover:opacity-80 cursor-pointer"
                    title="Listen"
                  >
                    <Volume2
                      className={`w-3.5 h-3.5 ${
                        activeSpeechId === msg.id && isSpeaking ? "animate-pulse font-bold text-amber-500" : ""
                      }`}
                    />
                    <span>Listen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="flex items-center gap-1 hover:opacity-80 cursor-pointer"
                    title="Copy"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(msg)}
                    className="flex items-center gap-1 hover:opacity-80 cursor-pointer ml-auto"
                    title="Save Note"
                  >
                    {savedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    )}
                    <span>{savedId === msg.id ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white border border-teal-100 text-xs text-teal-800 max-w-[65%] shadow-xs">
            <span className="w-3 h-3 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
            <span>Teacher Grace is reading...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview if user selected a paper/photo */}
      {selectedImage && (
        <div className="relative inline-block mb-2 p-1.5 bg-white rounded-xl border border-teal-200 shadow-sm w-fit">
          <img
            src={selectedImage}
            alt="Paper preview"
            className="w-16 h-16 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs shadow cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Bar with Paper/Photo Upload + Mic + Text */}
      <div className="pb-2">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-1.5 p-1.5 bg-white rounded-full border border-teal-200 shadow-sm"
        >
          {/* Hidden File Input for Paper / Photos */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Paper / Photo Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer flex-shrink-0"
            title="Upload book page or paper photo"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-teal-50 text-teal-700 hover:bg-teal-100"
            }`}
            title={isListening ? "Listening..." : "Tap to speak"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? "Listening..."
                : selectedImage
                ? "Add notes about this paper..."
                : mode === "ask"
                ? "Write a message or upload paper..."
                : "Speak or type voice note..."
            }
            className="flex-1 bg-transparent px-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || loading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
              (inputText.trim() || selectedImage) && !loading
                ? "btn-emerald-blue cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
