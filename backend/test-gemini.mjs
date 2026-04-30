// Quick test script - run with: node test-gemini.mjs
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';

// Read key directly from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const keyMatch = envContent.match(/LLM_API_KEY=(.+)/);
const apiKey = keyMatch?.[1]?.trim();

if (!apiKey) {
  console.error('❌ LLM_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🔑 Using key:', apiKey.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

try {
  const result = await model.generateContent('Say hello in one word.');
  console.log('✅ Success! Response:', result.response.text());
} catch (err) {
  console.error('❌ Error:', err.message);
  console.log('\n💡 This key has limit:0 — it was created from Google Cloud Console, not AI Studio.');
  console.log('   Go to: https://aistudio.google.com/apikey');
  console.log('   Click "Create API key" → "Create API key in NEW project"');
}
