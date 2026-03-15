import { NextResponse } from 'next/server';
const pdf = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const { pdfUrl } = await req.json();
    if (!pdfUrl) {
      return NextResponse.json({ error: "No PDF URL provided" }, { status: 400 });
    }

    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch PDF: ${response.statusText}` }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdf(buffer);
    let text = pdfData.text;

    // Clean text
    text = text.replace(/-\s*\n\s*/g, ''); // Fix hyphenated line breaks: - \n -> nothing
    text = text.replace(/\n{3,}/g, '\n\n'); // Collapse 3+ newlines to double newline
    text = text.replace(/ {2,}/g, ' '); // Collapse multiple spaces to single space

    // Chunk text into 6000 char pieces
    const chunkSize = 6000;
    const numChunks = Math.ceil(text.length / chunkSize);
    const firstChunk = text.slice(0, chunkSize);

    // Limit full text to prevent payload/token overflow (approx 40k chars ~ 10k tokens)
    const MAX_TEXT_SIZE = 40000;
    const processedText = text.length > MAX_TEXT_SIZE 
      ? text.slice(0, MAX_TEXT_SIZE) + "\n\n... [Full text truncated for performance]" 
      : text;

    return NextResponse.json({
      text: firstChunk,
      fullText: processedText,
      totalChunks: numChunks,
      pages: pdfData.numpages
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to extract PDF" }, { status: 500 });
  }
}
