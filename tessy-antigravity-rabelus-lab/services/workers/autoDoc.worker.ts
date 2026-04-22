export interface AutoDocWorkerRequest {
  id: string;
  payload: {
    url: string;
    rawContent: string;
    contentType: string;
  };
}

export interface AutoDocWorkerResponse {
  id: string;
  payload: {
    title: string;
    normalizedContent: string;
    summary: string;
    wordCount: number;
  };
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(rawContent: string, normalized: string, url: string): string {
  const titleMatch = rawContent.match(/<title>(.*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1].trim();
  }

  const headingMatch = rawContent.match(/^#\s+(.+)$/m);
  if (headingMatch?.[1]) {
    return headingMatch[1].trim();
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname;
  } catch {
    return normalized.slice(0, 80) || 'Untitled Source';
  }
}

self.onmessage = (event: MessageEvent<AutoDocWorkerRequest>) => {
  const { id, payload } = event.data;

  // Firecrawl returns markdown - preserve it
  const isMarkdown =
    payload.contentType.includes('markdown') ||
    payload.rawContent.trim().startsWith('#') ||
    payload.rawContent.includes('```');

  let normalizedContent: string;
  if (isMarkdown) {
    // Preserve markdown structure, just clean whitespace
    normalizedContent = payload.rawContent.replace(/\s+/g, ' ').trim();
  } else {
    // HTML content - strip tags
    normalizedContent = stripHtml(payload.rawContent);
  }

  const summary = normalizedContent.slice(0, 400);
  const title = extractTitle(payload.rawContent, normalizedContent, payload.url);
  const wordCount = normalizedContent ? normalizedContent.split(/\s+/).length : 0;

  const response: AutoDocWorkerResponse = {
    id,
    payload: {
      title,
      normalizedContent,
      summary,
      wordCount,
    },
  };

  self.postMessage(response);
};
