import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ExtractedArticle {
  title: string;
  site: string;
  lang: string;
  contentHtml: string;
  contentText: string;
  url: string;
}

/**
 * Extract article content from a URL using Firecrawl MCP
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  try {
    // Use Firecrawl MCP to scrape the article
    const input = JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    });

    const command = `manus-mcp-cli tool call firecrawl_scrape --server firecrawl --input '${input.replace(/'/g, "'\\''")}'`;
    
    const { stdout } = await execAsync(command);
    
    // Parse the result
    const lines = stdout.split('\n');
    const resultLine = lines.find(line => line.includes('Tool execution result:'));
    
    if (!resultLine) {
      throw new Error("Failed to parse Firecrawl response");
    }

    const jsonStart = stdout.indexOf('{', stdout.indexOf('Tool execution result:'));
    const jsonStr = stdout.substring(jsonStart);
    const result = JSON.parse(jsonStr);

    if (result.metadata?.statusCode === 404) {
      throw new Error("Article not found (404)");
    }

    if (!result.markdown) {
      throw new Error("No content extracted from article");
    }

    // Extract metadata
    const title = result.metadata?.title || result.metadata?.ogTitle || "Untitled";
    const site = result.metadata?.["og:site_name"] || result.metadata?.ogSiteName || new URL(url).hostname || "Unknown";
    const lang = result.metadata?.language || detectLanguage(result.markdown);

    // Convert markdown to plain text (simple approach)
    const textContent = result.markdown
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/[*_~`]/g, '') // Remove formatting
      .trim();

    return {
      title,
      site,
      lang,
      contentHtml: `<div>${result.markdown}</div>`, // Simple HTML wrapper
      contentText: textContent,
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
