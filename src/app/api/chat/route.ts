import { NextResponse } from "next/server";
import { sql, ChatMessage } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Cascade of models for maximum speed & 100% uptime
const FAST_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "1";

    const messages = (await sql`
      SELECT id, user_id, role, content, created_at
      FROM chat_messages
      WHERE user_id = ${parseInt(userId)}
      ORDER BY id ASC
      LIMIT 50;
    `) as ChatMessage[];

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Chat GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = 1, message = "", mode = "ask" } = body;

    const trimmedMsg = message.trim();
    if (!trimmedMsg) {
      return NextResponse.json({ success: false, error: "Empty message" }, { status: 400 });
    }

    // 1. Save user's message to Neon DB
    await sql`
      INSERT INTO chat_messages (user_id, role, content)
      VALUES (${parseInt(userId)}, 'user', ${trimmedMsg});
    `;

    // 2. Fetch recent conversation context for Gemini (last 4 for max speed)
    const recentHistory = (await sql`
      SELECT role, content
      FROM chat_messages
      WHERE user_id = ${parseInt(userId)}
      ORDER BY id DESC
      LIMIT 4;
    `) as { role: string; content: string }[];

    recentHistory.reverse();

    // 3. System instruction depending on mode
    let systemInstruction = "";
    if (mode === "voice_note") {
      systemInstruction = `You are a helpful English spelling assistant for Temitope.
Temitope just spoke a voice note: "${trimmedMsg}".
Your job:
1. Show the clear written form with correct punctuation.
2. Break down any key or tricky words into syllables (e.g. mar-ket, beau-ti-ful).
3. If there is a spelling fix, show it cleanly and gently.
Keep your output short, crisp, and formatted with bullet points so she can easily read and copy it.`;
    } else {
      systemInstruction = `You are Teacher Grace, Temitope's friendly and patient English teacher.
Temitope lives in Nigeria, speaks fluent English, and is learning to read and write confidently.
Rules:
1. Answer her question or greeting DIRECTLY and naturally (e.g., if she asks "how are you doing", answer how you are doing warmly and ask about her).
2. Keep your answer brief, clear, and easy to read (1-3 sentences).
3. Never give generic canned scripts. Always address exactly what she said.`;
    }

    // Format contents alternating user and model
    const contents = recentHistory.map((m) => ({
      role: m.role === "teacher" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // 4. Call Google Gemini API with cascade for ultra-fast response
    let teacherReply = "";
    for (const model of FAST_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 250,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            teacherReply = text;
            break;
          }
        }
      } catch (e) {
        console.warn(`Model ${model} failed, trying next...`, e);
      }
    }

    if (!teacherReply) {
      teacherReply = "I am right here with you, Temitope! How can I help you today?";
    }

    // 5. Save teacher's response to Neon DB
    const savedTeacherMsg = (await sql`
      INSERT INTO chat_messages (user_id, role, content)
      VALUES (${parseInt(userId)}, 'teacher', ${teacherReply})
      RETURNING id, user_id, role, content, created_at;
    `) as ChatMessage[];

    return NextResponse.json({
      success: true,
      reply: teacherReply,
      message: savedTeacherMsg[0],
    });
  } catch (error: any) {
    console.error("Chat POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
