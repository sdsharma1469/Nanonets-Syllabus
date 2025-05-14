import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function main() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Explain how AI works in a few words." }],
        },
      ],
    });
    const response = result.response;
    const text = await response.text();
    console.log("💡 Gemini says:", text);
  } catch (err) {
    console.error("❌ Error calling Gemini API:", err);
  }
}

main();
