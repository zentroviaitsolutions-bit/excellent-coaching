import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { studentName, classLevel } = await req.json()
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })

    // ✅ Check if already generated today
    const { data: existing } = await supabase
      .from("daily_questions")
      .select("questions")
      .eq("student", studentName)
      .eq("date", today)
      .maybeSingle()

    if (existing?.questions) {
      return NextResponse.json(existing.questions)
    }

    // 🎯 AI Prompt with difficulty levels
    const prompt = `
You create sentence ordering questions for school children.

Return ONLY valid JSON array.

Format:
[
 { "answer": "The dog is running", "words": ["dog","running","The","is"] }
]

Rules:
- Exactly 6 questions
questions notmore then 5 words in answer.
and sentence should be based on school syllabus.
and difficulty should be based on class level.
and answer and questions should be different for each student and each day.
and answer and question should meaningful and related to school syllabus.

- Class Level: ${classLevel}

Difficulty:
1–2 → very short sentences of 3 to 4 words, simple vocabulary, and basic grammar.
3–4 → simple  and short sentences with 4 to 5 words, slightly more complex vocabulary, and basic grammar.
5–6 → longer sentences of 5 to 7 words, more complex vocabulary, and introduction to compound sentences.
7–9 → grammar based sentences (tenses, questions)

Words must be shuffled.
No text outside JSON.
`

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    if (!completion.choices?.length) {
      return NextResponse.json({ error: "AI failed" }, { status: 500 })
    }

    let text = completion.choices[0].message.content.replace(/```json|```/g, "")
    const questions = JSON.parse(text)

    // 💾 Save to database
    await supabase.from("daily_questions").insert({
      student: studentName,
      date: today,
      questions
    })

    return NextResponse.json(questions)

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}





