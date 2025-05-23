export const runtime = "nodejs";
import { NextResponse } from "next/server";
const pdfParse = require("pdf-parse");
//import { cors } from "@/app/lib/cors";

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')

  return new NextResponse(null, {
      status: 204,
      headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
  })
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("pdfs") as File[];

    if (!files || files.length === 0) {
      return new NextResponse(JSON.stringify({ status: "fail", error: "No files uploaded." }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    let combinedText = "";

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      combinedText += data.text + "\n";
    }

    return new NextResponse(JSON.stringify({
      status: "success",
      extractedText: combinedText.trim(),
    }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (e) {
    console.error("❌ Error during PDF parsing:", e);
    return new NextResponse(JSON.stringify({
      status: "fail",
      error: e instanceof Error ? e.message : String(e),
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
