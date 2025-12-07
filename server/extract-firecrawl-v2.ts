import axios from "axios";

export interface ExtractedArticle {
  title: string;
  site: string;
  lang: string;
  contentHtml: string;
  contentText: string;
  url: string;
}

/**
 * Extract article content from a URL using Firecrawl API directly
 * Note: This requires FIRECRAWL_API_KEY environment variable
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  try {
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!firecrawlApiKey) {
      throw new Error("FIRECRAWL_API_KEY environment variable is not set");
    }

    // Call Firecrawl API directly
    const response = await axios.post(
      "https://api.firecrawl.dev/v1/scrape",
      {
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      },
      {
        headers: {
          "Authorization": `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error("Failed to scrape article");
    }

    const data = result.data;
    const markdown = data.markdown || "";
    const metadata = data.metadata || {};

    if (metadata.statusCode === 404) {
      throw new Error("Article not found (404)");
    }

    if (!markdown) {
      throw new Error("No content extracted from article");
    }

    // Extract metadata
    const title = metadata.title || metadata.ogTitle || "Untitled";
    const site = metadata["og:site_name"] || metadata.ogSiteName || new URL(url).hostname || "Unknown";
    const lang = metadata.language || detectLanguage(markdown);

    // Convert markdown to plain text (simple approach)
    const textContent = markdown
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/[*_~`]/g, '') // Remove formatting
      .trim();

    return {
      title,
      site,
      lang,
      contentHtml: `<div>${markdown}</div>`, // Simple HTML wrapper
      contentText: textContent,
      url,
    };
  } catch (error) {
    console.error("[Extract] Failed to extract article:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Article extraction failed: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error("Article extraction failed: No response from Firecrawl API");
      }
    }
    
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
