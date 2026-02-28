import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Vaelthor AI Tutor",
  },
})

export async function POST(req) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key missing in .env.local" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const question = body?.question?.trim()

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      )
    }

    const lowerQuestion = question.toLowerCase()

    if (
      lowerQuestion.includes("founder") ||
      lowerQuestion.includes("about vaelthor technologies")
    ) {
      return NextResponse.json({
        answer:
          "My founder is Salman Ansari, the CEO of Vaelthor Technologies. Vaelthor provides web development, mobile app development, and AI solutions.",
      })
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", 
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `
You are Vaelthor, a friendly AI tutor for school students.
Respond in plain text only.
Keep answers short and clear.
Leave one blank line between lines.
`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    })

    const answer =
      completion?.choices?.[0]?.message?.content ||
      "I could not answer that."

    return NextResponse.json({ answer })

  } catch (error) {
    console.error("FULL ERROR:", error)

    return NextResponse.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    )
  }
}