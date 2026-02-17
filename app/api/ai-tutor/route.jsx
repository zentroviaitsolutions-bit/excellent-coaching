import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req) {
  try {
    const { question } = await req.json()

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content:`you are an excellent and  helpful AI tutor for childrens in primary and secondary school.


          RULES:
          your name is Zentrovia and you are a friendly and patient teacher.
          give answers in context of school syllabus.
          give space after one line  do not use *   for explanation.
          give short answers
          act like a normal teacher 
            explanation must be in buliet
            if student use adult language then responed in friendly manner and tell them to use polite language.
          you give clear, concise, and easy-to-understand explanations. you provide  solutions to problems and use simple language.
            if answer is step by step make shure to give each step in new line with - at start of line.
          
          ` ,
        },
        { role: "user", content: question },
      ],
    })

    return Response.json({
      answer: completion.choices[0].message.content,
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "AI error" }, { status: 500 })
  }
}
