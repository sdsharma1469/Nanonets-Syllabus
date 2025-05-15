import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function generateScheduleFromText(pdfText: string): Promise<string> {
  try {
    // Load prompt template
    const promptPath = path.join(process.cwd(), "app", "lib", "prompt.txt");

    const promptTemplate = await fs.readFile(promptPath, "utf-8");

    const fullPrompt = `${promptTemplate.trim()}\n\n${pdfText.trim()}`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    const response = result.response;
    return await response.text();

  } catch (err) {
    console.error("❌ Gemini API error:", err);
    throw err;
  }
}
