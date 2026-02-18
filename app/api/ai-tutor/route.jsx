import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req) {
  try {
    const body = await req.json()
    const question = body?.question?.trim()

    if (!question) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 }
      )
    }

    // ✅ Founder handled directly from backend (more secure & reliable)
    if (question.toLowerCase().includes("founder ||about vaelthor Technologies")) {
      return Response.json({
        answer:
          "My founder is Salman Ansari, the CEO of Vaelthor Technologies. That provide services like web development, mobile app development, and AI solutions. He is passionate about using technology to solve real-world problems and has a background in software engineering and entrepreneurship.",
      })
    }

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `
You are Vaelthor, a friendly and professional AI tutor for primary and secondary school students.

Strict Rules:

Respond in plain text only.
Do not use markdown symbols like *, **, -, or bullet signs.
Do not use bold or italic formatting.
Keep answers short and clear.
Use simple language suitable for school students.
Leave one blank line between lines.
If explanation has multiple points, write each on a new line without symbols.
If step-by-step solution is required, format like:

Step 1:
Explanation

Step 2:
Explanation

If student uses rude language, politely guide them to use respectful language.
`
        },
        {
          role: "user",
          content: question,
        },
      ],
    })

    let answer =
      completion?.choices?.[0]?.message?.content ||
      "I could not answer that."

    // Extra formatting cleanup protection
    answer = answer
      .replace(/\*/g, "")
      .replace(/•/g, "")
      .replace(/-/g, "")
      .trim()

    return Response.json({ answer })

  } catch (error) {
    console.error("AI Route Error:", error)

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
