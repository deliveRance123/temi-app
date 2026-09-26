"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BookmarkPlus,
  RefreshCw,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ReadingLesson, VocabWord } from "@/lib/db";
import { speakText, stopSpeaking, createSpeechRecognizer } from "@/lib/speech";

interface ReadWriteHubProps {
  userId: number;
  onSaveToNotes: (content: string, title?: string, category?: string) => void;
}

type PracticeMode = "book_club" | "listen_type" | "shadow_reading" | "daily_writing";

export const ReadWriteHub: React.FC<ReadWriteHubProps> = ({
  userId,
  onSaveToNotes,
}) => {
  const [mode, setMode] = useState<PracticeMode>("book_club");
  const [lessons, setLessons] = useState<ReadingLesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  // Listen & Type
  const [dictationInput, setDictationInput] = useState("");
  const [dictationFeedback, setDictationFeedback] = useState<string | null>(null);
  const [dictationSuccess, setDictationSuccess] = useState(false);

  // Shadow reading
  const [shadowListening, setShadowListening] = useState(false);
  const [shadowMatched, setShadowMatched] = useState(false);

  // Daily Writing Prompt
  const [writingPrompt, setWritingPrompt] = useState(
    "What is your favourite food, and why do you love it so much?"
  );
  const [userWriting, setUserWriting] = useState("");
  const [writingReview, setWritingReview] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/lessons");
      const data = await res.json();
      if (data.success && data.lessons && data.lessons.length > 0) {
        setLessons(data.lessons);
      }
    } catch (e) {
      console.error("Failed to fetch lessons:", e);
    }
  };

  const currentLesson = lessons[currentLessonIndex] || {
    id: 1,
    title: "A Bright Morning in Lagos",
    content:
      "The sun rises over the city. Temitope wakes up early with a bright smile. She pours a cup of warm tea and opens her window. The breeze is gentle and cool. Today is a great day to learn and grow.",
    vocab_words: [
      { word: "Bright", syllables: "Bright", meaning: "Full of light and happiness", phonetic: "/braɪt/" },
      { word: "Gentle", syllables: "Gen-tle", meaning: "Soft, calm, and kind", phonetic: "/ˈdʒen.təl/" },
      { word: "Morning", syllables: "Mor-ning", meaning: "The early part of the day", phonetic: "/ˈmɔː.nɪŋ/" },
    ],
  };

  const words = currentLesson.content.split(" ");

  const handlePlayStory = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setActiveWordIndex(null);
      return;
    }

    setIsPlayingAudio(true);
    setActiveWordIndex(0);

    const utterance = speakText(currentLesson.content, () => {
      setIsPlayingAudio(false);
      setActiveWordIndex(null);
    });

    if (utterance) {
      let wordIdx = 0;
      utterance.onboundary = (event: any) => {
        if (event.name === "word") {
          setActiveWordIndex(wordIdx);
          wordIdx = Math.min(wordIdx + 1, words.length - 1);
        }
      };
    }
  };

  const handleWordClick = (wordRaw: string) => {
    const cleanWord = wordRaw.replace(/[.,!?;:"'()]/g, "").trim();
    const found = currentLesson.vocab_words?.find(
      (v) => v.word.toLowerCase() === cleanWord.toLowerCase()
    );

    if (found) {
      setSelectedWord(found);
    } else {
      setSelectedWord({
        word: cleanWord,
        syllables: cleanWord,
        meaning: `A word in the story "${currentLesson.title}". Tap below to save it!`,
        phonetic: "",
      });
    }
    speakText(cleanWord, undefined, 0.85);
  };

  const handleCheckDictation = () => {
    const targetSentence = "Today is a great day to learn and grow.";
    const cleanInput = dictationInput.trim().toLowerCase().replace(/[.]/g, "");
    const cleanTarget = targetSentence.toLowerCase().replace(/[.]/g, "");

    if (cleanInput === cleanTarget) {
      setDictationSuccess(true);
      setDictationFeedback("Perfect spelling! You wrote the entire sentence correctly! 🌟");
      confetti({ particleCount: 60, spread: 70 });
    } else {
      setDictationSuccess(false);
      setDictationFeedback("Almost! Listen once more and check each word carefully.");
    }
  };

  const handleStartShadow = () => {
    setShadowListening(true);
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        const clean = transcript.toLowerCase();
        if (clean.includes("great day") || clean.includes("learn") || clean.includes("grow")) {
          setShadowMatched(true);
          confetti({ particleCount: 60, spread: 70 });
        }
      },
      () => setShadowListening(false),
      () => setShadowListening(false)
    );
    if (recognizer) {
      try {
        recognizer.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReviewWriting = async () => {
    if (!userWriting.trim()) return;
    setReviewLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: `Here is what I wrote for the prompt "${writingPrompt}": "${userWriting}". Please praise my ideas first, then show me how it looks as a clean book paragraph!`,
          mode: "ask",
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setWritingReview(data.reply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-2">
      {/* 4 Mode Tabs (Clean Pills) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("book_club")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === "book_club"
              ? "bg-blue-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Book Read-Along</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("listen_type")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === "listen_type"
              ? "bg-amber-500 text-slate-950 font-bold"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen & Type</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("shadow_reading")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === "shadow_reading"
              ? "bg-pink-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Read Out Loud</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("daily_writing")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === "daily_writing"
              ? "bg-slate-200 text-slate-950 font-bold"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Book Writing</span>
        </button>
      </div>

      {/* MODE 1: Book Club Read-Along */}
      {mode === "book_club" && (
        <div className="space-y-4">
          <div className="clean-card-bright p-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Story {currentLessonIndex + 1} of {lessons.length || 4}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {currentLesson.title}
                </h3>
              </div>

              {lessons.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentLessonIndex((prev) => (prev + 1) % lessons.length)
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Story</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reading Words */}
            <div className="text-base md:text-lg leading-relaxed text-slate-800 font-medium">
              {words.map((word, idx) => {
                const isActive = activeWordIndex === idx;
                return (
                  <span
                    key={idx}
                    onClick={() => handleWordClick(word)}
                    className={`cursor-pointer inline-block mr-1 transition-colors ${
                      isActive
                        ? "karaoke-active"
                        : "hover:text-blue-600 hover:underline"
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tap any word to hear pronunciation and syllables</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlayStory}
            className={`w-full py-3.5 px-4 rounded-xl clean-btn text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              isPlayingAudio
                ? "bg-rose-600 text-white animate-pulse"
                : "clean-btn-blue"
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>{isPlayingAudio ? "Stop Reading" : "Read Story Aloud 📖"}</span>
          </button>

          {/* Selected Word Card */}
          <AnimatePresence>
            {selectedWord && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-2xl clean-card bg-slate-900 border border-slate-700 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-amber-300">
                      {selectedWord.word}
                    </h4>
                    <p className="text-xs font-semibold text-blue-400">
                      Syllables: {selectedWord.syllables}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => speakText(selectedWord.word, undefined, 0.85)}
                      className="p-2 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWord(null)}
                      className="text-slate-400 hover:text-white text-xs px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedWord.meaning}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onSaveToNotes(
                      selectedWord.syllables,
                      selectedWord.word,
                      "word"
                    );
                    setSelectedWord(null);
                  }}
                  className="w-full py-2 rounded-lg clean-btn clean-btn-blue text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save "{selectedWord.word}" to Notebook</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* MODE 2: Listen & Type */}
      {mode === "listen_type" && (
        <div className="space-y-4">
          <div className="clean-card p-5 text-center space-y-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              Spelling & Dictation Practice
            </span>
            <p className="text-xs text-slate-300">
              Listen to the sentence, then practice typing it.
            </p>
            <button
              type="button"
              onClick={() =>
                speakText("Today is a great day to learn and grow.", undefined, 0.85)
              }
              className="py-2.5 px-4 rounded-xl clean-btn clean-btn-blue text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen to Sentence</span>
            </button>
          </div>

          <div className="clean-card p-4 space-y-3">
            <textarea
              rows={3}
              value={dictationInput}
              onChange={(e) => setDictationInput(e.target.value)}
              placeholder="Type what you heard here..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
            />

            <button
              type="button"
              onClick={handleCheckDictation}
              className="w-full py-3 rounded-xl clean-btn clean-btn-gold text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check Spelling</span>
            </button>

            {dictationFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  dictationSuccess
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                }`}
              >
                {dictationFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: Shadow Reading */}
      {mode === "shadow_reading" && (
        <div className="clean-card p-5 text-center space-y-4">
          <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider bg-pink-400/10 px-2.5 py-1 rounded-full border border-pink-400/20">
            Read Out Loud
          </span>

          <h3 className="text-sm text-slate-300">
            Read this sentence clearly into your microphone:
          </h3>

          <div
            className={`p-4 rounded-xl text-lg font-bold border transition-colors ${
              shadowMatched
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-slate-900 text-white border-slate-700"
            }`}
          >
            "Today is a great day to learn and grow."
          </div>

          {shadowMatched && (
            <p className="text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Great job! Clear pronunciation!</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleStartShadow}
            className={`w-full py-3.5 rounded-xl clean-btn text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
              shadowListening ? "bg-rose-600 text-white animate-pulse" : "clean-btn-blue"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{shadowListening ? "Listening... Speak now!" : "Tap & Read Aloud 🎙️"}</span>
          </button>
        </div>
      )}

      {/* MODE 4: Daily Book Writing */}
      {mode === "daily_writing" && (
        <div className="space-y-4">
          <div className="clean-card p-4 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Today's Book Prompt
            </span>
            <h3 className="text-base font-bold text-white leading-snug">
              {writingPrompt}
            </h3>
            <p className="text-xs text-slate-400">
              Write 1 to 2 sentences. Teacher Grace will format it cleanly!
            </p>
          </div>

          <div className="clean-card p-4 space-y-3">
            <textarea
              rows={4}
              value={userWriting}
              onChange={(e) => setUserWriting(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={handleReviewWriting}
              disabled={reviewLoading || !userWriting.trim()}
              className="w-full py-3 rounded-xl clean-btn clean-btn-blue text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {reviewLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Teacher Grace is formatting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Polish into a Book Page</span>
                </>
              )}
            </button>

            {writingReview && (
              <div className="clean-card-bright p-4 text-slate-900 rounded-xl space-y-2">
                <span className="text-xs font-bold text-blue-600">
                  Teacher Grace's Book Polish:
                </span>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap text-slate-800">
                  {writingReview}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onSaveToNotes(userWriting, "My Daily Story", "diary")
                  }
                  className="mt-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to Notebook</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
