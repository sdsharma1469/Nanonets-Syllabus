import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

const apiKey = process.env.GOOGLE_CLOUD_API_KEY
if (!apiKey) throw new Error("Missing GOOGLE_CLOUD_API_KEY")

const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    const { input } = await req.json()

    const promptPath = path.join(process.cwd(), "prompt.txt")
    const basePrompt = await readFile(promptPath, "utf8")

    const fullPrompt = `${basePrompt.trim()}\n${input.trim()}`

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = await response.text()

    return NextResponse.json({ response: text })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Gemini API Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      console.error("Unknown error", error)
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
    }
  }
  
}
