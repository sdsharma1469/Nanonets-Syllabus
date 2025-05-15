export const runtime = "nodejs";
import { generateScheduleFromText } from "@/app/lib/utils/gemini_call";

import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { readFile } from "fs/promises"; // For reading prompt.txt
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("pdfs") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ status: "fail", error: "No files uploaded." });
    }

    let combinedText = "";

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      console.log(`📄 Text extracted from ${file.name}:\n---\n${data.text}\n---\n`);
      combinedText += data.text + "\n";
    }

    const scheduleJson = await generateScheduleFromText(combinedText);
    return NextResponse.json({
      status: "success",
      extractedText: combinedText.trim(),
      geminiResponse: scheduleJson,
    });

  } catch (e) {
    console.error("❌ Error during PDF parsing or Gemini call:", e);
    return NextResponse.json({
      status: "fail",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
