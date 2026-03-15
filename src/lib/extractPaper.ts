"use client";

export async function extractPaperText(pdfUrl: string | null): Promise<string | null> {
  if (!pdfUrl) return null;
  
  try {
    const response = await fetch('/api/extract-paper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdfUrl }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // Prefer returning fullText if available, otherwise fallback to the first chunk
    return data.fullText || data.text || null;
  } catch (error) {
    // Fail silently, never crash UI
    console.error("extractPaperText failed:", error);
    return null;
  }
}
