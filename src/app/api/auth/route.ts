import { NextResponse } from "next/server";
import { sql, User } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || "TEMITOPE").trim().toUpperCase();

    // Fetch or create user
    const users = (await sql`
      SELECT id, username, display_name, avatar_url, streak_days, words_learned, created_at
      FROM users
      WHERE UPPER(username) = ${username}
      LIMIT 1;
    `) as User[];

    if (users.length > 0) {
      return NextResponse.json({ success: true, user: users[0] });
    }

    // Auto-create if not exists
    const newUsers = (await sql`
      INSERT INTO users (username, display_name, streak_days, words_learned)
      VALUES (${username}, 'Temitope', 1, 12)
      RETURNING id, username, display_name, avatar_url, streak_days, words_learned, created_at;
    `) as User[];

    return NextResponse.json({ success: true, user: newUsers[0] });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}
