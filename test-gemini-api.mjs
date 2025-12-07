import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDkVwDaosJOMfwYW4fjYOsg7xeMK-RvI20';
const genAI = new GoogleGenerativeAI(apiKey);

console.log('Testing gemini-2.5-flash model...');
try {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent('Hello, world!');
  const response = await result.response;
  const text = response.text();
  console.log('✅ Success! Model response:', text.substring(0, 100));
} catch (error) {
  console.error('❌ Error:', error.message);
}
