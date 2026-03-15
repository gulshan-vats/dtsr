export interface PaperData {
  title?: string;
  abstract?: string;
  authors?: string | string[];
  year?: number;
  citations?: number;
  pdfUrl?: string | null;
  [key: string]: unknown;
}

export function buildPaperContext(paper: PaperData, extractedText: string | null): string {
  let context = `Title: ${paper.title || "Unknown"}\n`;
  
  // Handle authors which might be string or array
  const authorsStr = Array.isArray(paper.authors) 
    ? paper.authors.join(", ") 
    : (paper.authors || "Unknown");
  
  context += `Authors: ${authorsStr}\n`;
  context += `Year: ${paper.year || "Unknown"}\n`;
  context += `Abstract: ${paper.abstract || "No abstract available"}\n\n`;

  if (extractedText) {
    context += `[FULL TEXT EXTRACTED]\n${extractedText}\n`;
  } else {
    context += `[Full text unavailable]\n`;
  }

  return context;
}
