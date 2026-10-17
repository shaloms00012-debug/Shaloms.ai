import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI is not connected yet. Add OPENAI_API_KEY to .env.local, then restart the app." }, { status: 503 });
    }
    const { question, subject, imageData } = await req.json();
    if ((!question || !String(question).trim()) && !imageData) {
      return NextResponse.json({ error: "Please type a question or upload an image." }, { status: 400 });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const instructions = `You are Shaloms AI, a patient educational assistant for students in Rwanda.
The selected area is ${subject || "Mathematics or Physics"}.
Prioritize the uploaded Rwanda REB student books indexed in the connected file-search knowledge base. Answer at the student's level, use clear step-by-step reasoning and define symbols/units. For calculations, show the formula, substitution, working and final answer. If a diagram or image is unclear, say what you cannot read and ask for a clearer image. If the supplied textbooks do not support a claim, clearly say so rather than pretending it came from a book. You may use standard subject knowledge to explain a concept, but distinguish it from the book when necessary. Be encouraging, concise, and do not simply claim an answer is correct without checking it.`;
    const content: any[] = [];
    if (question?.trim()) content.push({ type: "input_text", text: String(question).slice(0, 12000) });
    if (imageData && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(imageData)) {
      content.push({ type: "input_image", image_url: imageData, detail: "high" });
    }
    const tools: any[] = [];
    if (process.env.OPENAI_VECTOR_STORE_ID) {
      tools.push({ type: "file_search", vector_store_ids: [process.env.OPENAI_VECTOR_STORE_ID] });
    }
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions,
      input: [{ role: "user", content }],
      ...(tools.length ? { tools } : {})
    });
    return NextResponse.json({ answer: response.output_text || "I couldn't produce a clear answer. Please try rephrasing your question." });
  } catch (error: any) {
    console.error("Shaloms AI ask route error:", error);
    return NextResponse.json({ error: "Sorry, I couldn't process that question. Check your API setup and try again." }, { status: 500 });
  }
}