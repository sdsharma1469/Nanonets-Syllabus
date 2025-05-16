export const runtime = "nodejs";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

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

    return NextResponse.json({
      status: "success",
      extractedText: combinedText.trim(),
    });

  } catch (e) {
    console.error("❌ Error during PDF parsing:", e);
    return NextResponse.json({
      status: "fail",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
