export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import pdfParse from "pdf-parse"; // Make sure to install this with: npm install pdf-parse
import { stat } from "node:fs";

export async function POST(req: Request) {
  console.log("PDF Upload Route Hit")
  try {
    const formData = await req.formData();
    console.log("going here")
    console.log(formData)
    const files = formData.getAll("pdfs") as File[];
    console.log("files are " + files)
    const savedFileNames: string[] = [];
    let combinedText = "";

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer); // required by pdf-parse

      // Save file
      const path = `./public/uploads/${file.name}`;
      await fs.writeFile(path, buffer);
      savedFileNames.push(file.name);

      // Extract text from PDF
      const data = await pdfParse(buffer);
      combinedText += data.text + "\n"; // add newline for separation
      console.log("extracted another one")
    }
    return NextResponse.json({status : "success"})
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: String(e) });
  }
}
