import { transformArticle } from './server/transform.ts';

const testArticle = `都内で新型インフルエンザの患者数が急増している。都内の医療機関からの報告によると、今週の患者数は約5000人に達し、先週の2300人から大幅に増加した。

感染症の専門家は「手洗いやマスク着用などの基本的な予防策を徹底してほしい」と呼びかけている。特に高齢者や基礎疾患のある人は注意が必要だという。

都は今後も感染状況を注視し、必要に応じて対策を強化する方針だ。`;

const newSkins = ['gen_z_slang', 'rap_style', 'academic_paper'];

console.log('================================================================================');
console.log('Testing New Skins');
console.log('================================================================================');
console.log('Test Article:');
console.log('--------------------------------------------------------------------------------');
console.log(testArticle);
console.log('--------------------------------------------------------------------------------\n');

for (const skinKey of newSkins) {
  console.log('================================================================================');
  console.log(`Testing skin: ${skinKey}`);
  console.log('================================================================================');
  
  try {
    const result = await transformArticle({
      extracted: testArticle,
      skin: skinKey,
      params: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 2048,
        lengthRatio: 1.0,
      },
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    console.log(`✅ Transformation successful!`);
    console.log(`Output (${result.output.length} characters):`);
    console.log('--------------------------------------------------------------------------------');
    console.log(result.output);
    console.log('--------------------------------------------------------------------------------');
  } catch (error) {
    console.log(`❌ Transformation failed!`);
    console.log(`Error: ${error.message}`);
    if (error.stack) {
      console.log(`Stack: ${error.stack}`);
    }
  }
  
  console.log('Waiting 2 seconds before next test...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
}

console.log('================================================================================');
console.log('Test Summary');
console.log('================================================================================');
console.log(`✅ Successful: ${newSkins.length}/${newSkins.length}`);
newSkins.forEach(skin => console.log(`  - ${skin}`));
console.log('Test completed!');
