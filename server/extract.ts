import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import DOMPurify from "dompurify";

export interface ExtractedArticle {
  title: string;
  site: string;
  lang: string;
  contentHtml: string;
  contentText: string;
  url: string;
}

/**
 * Extract article content from a URL using Readability
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  try {
    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsSkins/1.0; +https://newsskins.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract with Readability
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to extract article content");
    }

    // Sanitize HTML
    const window = dom.window as any;
    const purify = DOMPurify(window);
    const cleanHtml = purify.sanitize(article.content || "", {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote"],
      ALLOWED_ATTR: [],
    });

    // Extract text content
    const textDom = new JSDOM(cleanHtml);
    const textContent = textDom.window.document.body.textContent || "";

    // Detect language (simple heuristic)
    const lang = detectLanguage(textContent);

    // Extract site name
    const site = article.siteName || new URL(url).hostname || "Unknown";

    return {
      title: article.title || "Untitled",
      site,
      lang,
      contentHtml: cleanHtml,
      contentText: textContent.trim(),
      url,
    };
  } catch (error) {
    console.error("[Extract] Failed to extract article:", error);
    throw new Error(`Article extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Simple language detection (Japanese vs English)
 */
function detectLanguage(text: string): string {
  // Count Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseChars = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
  const japaneseRatio = japaneseChars ? japaneseChars.length / text.length : 0;

  return japaneseRatio > 0.1 ? "ja" : "en";
}
