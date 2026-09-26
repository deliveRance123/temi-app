import { NextResponse } from "next/server";
import { sql, ReadingLesson } from "@/lib/db";

export async function GET() {
  try {
    const lessons = (await sql`
      SELECT id, title, category, level, content, vocab_words, created_at
      FROM reading_lessons
      ORDER BY id ASC;
    `) as ReadingLesson[];

    return NextResponse.json({ success: true, lessons });
  } catch (error: any) {
    console.error("Lessons GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
