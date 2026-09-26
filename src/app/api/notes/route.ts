import { NextResponse } from "next/server";
import { sql, Note } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "1";
    const category = searchParams.get("category");

    let notes: Note[];
    if (category && category !== "all") {
      notes = (await sql`
        SELECT id, user_id, category, title, content, pronunciation, meaning, created_at
        FROM notes
        WHERE user_id = ${parseInt(userId)} AND category = ${category}
        ORDER BY id DESC;
      `) as Note[];
    } else {
      notes = (await sql`
        SELECT id, user_id, category, title, content, pronunciation, meaning, created_at
        FROM notes
        WHERE user_id = ${parseInt(userId)}
        ORDER BY id DESC;
      `) as Note[];
    }

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error("Notes GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId = 1,
      category = "word",
      title = "",
      content = "",
      pronunciation = "",
      meaning = "",
    } = body;

    if (!content.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    const insertedNotes = (await sql`
      INSERT INTO notes (user_id, category, title, content, pronunciation, meaning)
      VALUES (${parseInt(userId)}, ${category}, ${title || content.slice(0, 30)}, ${content.trim()}, ${pronunciation}, ${meaning})
      RETURNING id, user_id, category, title, content, pronunciation, meaning, created_at;
    `) as Note[];

    return NextResponse.json({ success: true, note: insertedNotes[0] });
  } catch (error: any) {
    console.error("Notes POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Note ID required" }, { status: 400 });
    }

    await sql`
      DELETE FROM notes WHERE id = ${parseInt(id)};
    `;

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (error: any) {
    console.error("Notes DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
