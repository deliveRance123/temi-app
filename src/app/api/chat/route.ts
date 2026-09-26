import { NextResponse } from "next/server";
import { sql, ChatMessage } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Cascade for speed and reliability
const FAST_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

// Clean text function: strips markdown asterisks, hashtags, dashes, and unwanted symbols
function sanitizeTeacherText(text: string): string {
  if (!text) return "";
  return text
    // remove bold/italic asterisks
    .replace(/\*{1,3}/g, "")
    // remove markdown headers #
    .replace(/^#{1,6}\s*/gm, "")
    // remove markdown bullet dashes and bullets at line start
    .replace(/^[\s]*[-•*]\s*/gm, "")
    // remove tildes and backticks
    .replace(/[`~]/g, "")
    // remove multiple dashes or underscores
    .replace(/[-_]{2,}/g, " ")
    // normalize spaces
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "1";

    const messages = (await sql`
      SELECT id, user_id, role, content, image_url, created_at
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
    const {
      userId = 1,
      message = "",
      mode = "ask",
      imageBase64 = null,
      imageMimeType = "image/jpeg",
    } = body;

    const trimmedMsg = message.trim();
    if (!trimmedMsg && !imageBase64) {
      return NextResponse.json({ success: false, error: "Empty message or image" }, { status: 400 });
    }

    const displayMsg = trimmedMsg || (imageBase64 ? "Uploaded paper photo for reading help" : "");

    // 1. Save user's message to Neon DB
    await sql`
      INSERT INTO chat_messages (user_id, role, content)
      VALUES (${parseInt(userId)}, 'user', ${displayMsg});
    `;

    // 2. Fetch recent conversation context (last 4 for max speed)
    const recentHistory = (await sql`
      SELECT role, content
      FROM chat_messages
      WHERE user_id = ${parseInt(userId)}
      ORDER BY id DESC
      LIMIT 4;
    `) as { role: string; content: string }[];

    recentHistory.reverse();

    // 3. System instruction: strictly NO special characters, friendly natural English
    let systemInstruction = `You are Teacher Grace, Temitope's loving, patient personal English teacher.
CRITICAL FORMATTING RULES:
1. Do NOT use any special characters like asterisks (*), hashtags (#), bullet dashes (-), or bold marks. Write in clean, normal English sentences.
2. Keep your replies concise, warm, and natural (1 to 3 sentences).
3. If an image or photo of paper is provided, read what is written on the paper clearly and explain it gently.`;

    if (mode === "voice_note") {
      systemInstruction += `\nTemitope spoke a voice note: "${trimmedMsg}".
Write out the correct English sentence clearly without any asterisks or bullet dashes.
Mention the key words and their syllables in clean plain words.`;
    } else {
      systemInstruction += `\nAnswer her question or greeting directly, warmly, and naturally.`;
    }

    // 4. Build contents
    const contents: any[] = recentHistory.map((m) => ({
      role: m.role === "teacher" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // If an image is included in this turn, attach it to the latest user part
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      contents.push({
        role: "user",
        parts: [
          { text: trimmedMsg || "Please read and explain this paper to me." },
          {
            inlineData: {
              mimeType: imageMimeType || "image/jpeg",
              data: cleanBase64,
            },
          },
        ],
      });
    }

    // 5. Call Google Gemini API with cascade for speed
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
              temperature: 0.5,
              maxOutputTokens: 250,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rawText) {
            teacherReply = sanitizeTeacherText(rawText);
            break;
          }
        }
      } catch (e) {
        console.warn(`Model ${model} failed, trying next...`, e);
      }
    }

    if (!teacherReply) {
      teacherReply = "I am right here with you, Temitope! How can I help you learn today?";
    }

    // 6. Save teacher's response to Neon DB
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
