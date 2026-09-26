import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL is not set in environment variables!");
}

export const sql = neon(databaseUrl || "");

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  streak_days: number;
  words_learned: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  role: "user" | "teacher";
  content: string;
  created_at: string;
}

export interface VocabWord {
  word: string;
  syllables: string;
  meaning: string;
  phonetic: string;
}

export interface ReadingLesson {
  id: number;
  title: string;
  category: string;
  level: string;
  content: string;
  vocab_words: VocabWord[];
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  category: "word" | "sentence" | "diary";
  title: string;
  content: string;
  pronunciation?: string;
  meaning?: string;
  created_at: string;
}
