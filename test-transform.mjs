import { transformArticle } from "./server/transform.ts";

// Test article sample
const testArticle = `
東京都内で新型インフルエンザの患者数が急増している。
先週と比べて2倍以上に増加し、専門家は警戒を呼びかけている。

都内の医療機関からの報告によると、今週の患者数は約5000人に達した。
これは前週の2300人から大幅に増加した数字である。

感染症の専門家は「手洗いやマスク着用などの基本的な予防策を徹底してほしい」と述べている。
また、高齢者や基礎疾患のある人は特に注意が必要だという。

都は今後も感染状況を注視し、必要に応じて対策を強化する方針だ。
`.trim();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is not set");
  console.error("Please set it with: export GEMINI_API_KEY='your-api-key'");
  process.exit(1);
}

const skins = [
  "kansai_banter",
  "detached_lit",
  "suggestive_safe",
  "ojisan_mail",
  "poetic_emo",
];

async function testSkin(skinName) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing skin: ${skinName}`);
  console.log("=".repeat(80));

  try {
    const result = await transformArticle({
      extracted: testArticle,
      skin: skinName,
      params: {
        temperature: 1.3,
        topP: 0.9,
        maxOutputTokens: 1500,
        lengthRatio: 1.0,
        humor: 0.6,
        insightLevel: 0.7,
      },
      apiKey,
    });

    console.log("\n✅ Transformation successful!");
    console.log(`\nOutput (${result.output.length} characters):`);
    console.log("-".repeat(80));
    console.log(result.output);
    console.log("-".repeat(80));
    console.log(`\nMeta:`);
    console.log(`  - Tokens in: ${result.meta.tokensIn}`);
    console.log(`  - Tokens out: ${result.meta.tokensOut}`);
    console.log(`  - Safety: ${result.meta.safety}`);

    return { success: true, skinName, result };
  } catch (error) {
    console.error("\n❌ Transformation failed!");
    console.error(`Error: ${error.message}`);
    return { success: false, skinName, error: error.message };
  }
}

async function main() {
  console.log("Starting transformation quality test...");
  console.log(`Testing ${skins.length} skins with the following article:\n`);
  console.log("-".repeat(80));
  console.log(testArticle);
  console.log("-".repeat(80));

  const results = [];

  for (const skin of skins) {
    const result = await testSkin(skin);
    results.push(result);
    
    // Wait 2 seconds between requests to avoid rate limiting
    if (skins.indexOf(skin) < skins.length - 1) {
      console.log("\nWaiting 2 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("Test Summary");
  console.log("=".repeat(80));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  successful.forEach((r) => console.log(`  - ${r.skinName}`));

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
    failed.forEach((r) => console.log(`  - ${r.skinName}: ${r.error}`));
  }

  console.log("\nTest completed!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
