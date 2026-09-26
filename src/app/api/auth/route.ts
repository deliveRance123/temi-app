import { NextResponse } from "next/server";
import { sql, User } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || "TEMITOPE").trim().toUpperCase();

    // Fetch user with REAL-WORLD live counts from database
    const users = (await sql`
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.avatar_url, 
        u.created_at,
        COALESCE((SELECT COUNT(*)::int FROM notes WHERE user_id = u.id), 0) AS notes_count,
        COALESCE((SELECT COUNT(*)::int FROM notes WHERE user_id = u.id AND category = 'word'), 0) AS words_learned,
        GREATEST(1, COALESCE((SELECT COUNT(DISTINCT DATE(created_at))::int FROM chat_messages WHERE user_id = u.id), 1)) AS streak_days
      FROM users u
      WHERE UPPER(u.username) = ${username}
      LIMIT 1;
    `) as User[];

    if (users.length > 0) {
      return NextResponse.json({ success: true, user: users[0] });
    }

    // Auto-create if not exists
    const newUsers = (await sql`
      INSERT INTO users (username, display_name, streak_days, words_learned)
      VALUES (${username}, 'Temitope', 1, 0)
      RETURNING id, username, display_name, avatar_url, streak_days, words_learned, created_at;
    `) as User[];

    return NextResponse.json({
      success: true,
      user: {
        ...newUsers[0],
        notes_count: 0,
        words_learned: 0,
        streak_days: 1,
      },
    });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}
