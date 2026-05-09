'use server'

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const OPENROUTER_API_KEY = process.env.LLM_API_KEY!;
const MODEL = 'openai/gpt-oss-20b:free'; // Free model on OpenRouter

async function callAI(content: string) {
  const messages = [{ role: 'user', content: `${GENERATION_PROMPT}\n\nSTUDY MATERIAL:\n${content}` }];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://studyshelf.app',
      'X-Title': 'StudyShelf'
    },
    body: JSON.stringify({ model: MODEL, messages })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

interface GeneratedFlashcard {
  front: string;
  back: string;
  explanation: string;
  difficulty: number;
  cardType: string;
}

interface GeneratedMCQ {
  question: string;
  options: string[];
  answer: string;
}

interface GeneratedStudyMaterial {
  summary: string;
  flashcards: GeneratedFlashcard[];
  mcqs: GeneratedMCQ[];
}

const GENERATION_PROMPT = `You are an expert tutor. Analyze the provided study material and generate structured learning content.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "summary": "A concise 2-3 sentence summary of the key concepts",
  "flashcards": [
    { 
      "front": "Question or concept", 
      "back": "Answer",
      "explanation": "A detailed 1-2 sentence breakdown of WHY this is the answer",
      "difficulty": 3,
      "cardType": "BASIC" 
    }
  ],
  "mcqs": [
    {
      "question": "Multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The correct option text exactly as written above"
    }
  ]
}

Generate exactly 8 flashcards and 5 MCQs. Focus on the most important, high-yield concepts. Avoid trivial facts. Create cards that test "Why" and "How", not just "What". Ensure progressive difficulty from basic definitions (difficulty 1-2) to complex reasoning (difficulty 4-5). cardType should be "BASIC", "CLOZE", or "TRUE_FALSE".`;

const sanitize = (str: string | undefined | null) => str ? str.replace(/\u0000/g, '') : '';

export async function generateFromText(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!content || content.trim().length < 50) {
    throw new Error('Please provide at least 50 characters of content');
  }

  // Lazy-init user
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@studyshelf.app`, role: 'member' }
  });

  const text = await callAI(sanitize(content));

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').replace(/\u0000/g, '');
  const generated: GeneratedStudyMaterial = JSON.parse(jsonText);

  // Save note
  const note = await prisma.note.create({
    data: { 
      userId, 
      title: sanitize(title || 'Untitled Note').substring(0, 255), 
      content: sanitize(content) 
    }
  });

  // Save as Resource on Shelf
  const resource = await prisma.resource.create({
    data: {
      userId,
      title: sanitize(title || 'Untitled Note').substring(0, 255),
      description: generated.summary,
      canonicalUrl: `studyshelf://note/${note.id}`, // Internal link
      imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400", // Default study image
    }
  });

  // Save flashcards with SRS
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const savedFlashcards = [];
  for (const fc of generated.flashcards) {
    const srs = await prisma.sRSData.create({
      data: { interval: 1, easeFactor: 2.50, dueDate: today }
    });
    const flashcard = await prisma.flashcard.create({
      data: { 
        userId, 
        front: sanitize(fc.front), 
        back: sanitize(fc.back), 
        explanation: sanitize(fc.explanation),
        difficulty: fc.difficulty || 3,
        cardType: sanitize(fc.cardType) || 'BASIC',
        srsId: srs.id 
      }
    });
    await prisma.sRSData.update({
      where: { id: srs.id },
      data: { flashcardId: flashcard.id }
    });
    savedFlashcards.push(flashcard);
  }

  // Save MCQs
  for (const mcq of generated.mcqs) {
    await prisma.mCQ.create({
      data: { 
        userId, 
        question: sanitize(mcq.question), 
        options: mcq.options.map(o => sanitize(o)), 
        answer: sanitize(mcq.answer) 
      }
    });
  }

  revalidatePath('/ai');
  revalidatePath('/shelf');
  revalidatePath('/dashboard');

  return {
    summary: generated.summary,
    flashcards: generated.flashcards,
    mcqs: generated.mcqs,
    noteId: note.id,
    flashcardCount: savedFlashcards.length
  };
}

export async function generateFromPDF(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const file = formData.get('pdf') as File;
  const title = formData.get('title') as string;

  if (!file) throw new Error('No file provided');

  // Lazy-init user
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@studyshelf.app`, role: 'member' }
  });

  // Extract text from PDF using pdf-parse
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  let extractedText = '';
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);
    extractedText = sanitize(pdfData.text);
  } catch (e) {
    console.error('PDF parse error:', e);
    throw new Error('Could not read PDF. Please make sure it contains selectable text (not a scanned image).');
  }

  if (!extractedText || extractedText.trim().length < 50) {
    throw new Error('PDF appears to be empty or contains only images. Please use a PDF with selectable text.');
  }

  // Truncate to avoid token limits (approx 12k chars = ~3k tokens)
  const truncated = extractedText.substring(0, 12000);

  const text = await callAI(truncated);
  const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').replace(/\u0000/g, '');
  const generated: GeneratedStudyMaterial = JSON.parse(jsonText);

  // Save note with PDF summary
  const note = await prisma.note.create({
    data: {
      userId,
      title: sanitize(title || file.name.replace('.pdf', '')).substring(0, 255),
      content: sanitize(generated.summary)
    }
  });

  // Save as Resource on Shelf
  const resource = await prisma.resource.create({
    data: {
      userId,
      title: sanitize(title || file.name.replace('.pdf', '')).substring(0, 255),
      description: generated.summary,
      canonicalUrl: `studyshelf://pdf/${Date.now()}`, // Internal link
      imageUrl: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=400", // Default PDF image
    }
  });

  // Save flashcards with SRS
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const savedFlashcards = [];
  for (const fc of generated.flashcards) {
    const srs = await prisma.sRSData.create({
      data: { interval: 1, easeFactor: 2.50, dueDate: today }
    });
    const flashcard = await prisma.flashcard.create({
      data: { 
        userId, 
        front: sanitize(fc.front), 
        back: sanitize(fc.back), 
        explanation: sanitize(fc.explanation),
        difficulty: fc.difficulty || 3,
        cardType: sanitize(fc.cardType) || 'BASIC',
        srsId: srs.id 
      }
    });
    await prisma.sRSData.update({
      where: { id: srs.id },
      data: { flashcardId: flashcard.id }
    });
    savedFlashcards.push(flashcard);
  }

  // Save MCQs
  for (const mcq of generated.mcqs) {
    await prisma.mCQ.create({
      data: { 
        userId, 
        question: sanitize(mcq.question), 
        options: mcq.options.map(o => sanitize(o)), 
        answer: sanitize(mcq.answer) 
      }
    });
  }

  revalidatePath('/ai');
  revalidatePath('/shelf');
  revalidatePath('/dashboard');

  return {
    summary: generated.summary,
    flashcards: generated.flashcards,
    mcqs: generated.mcqs,
    noteId: note.id,
    flashcardCount: savedFlashcards.length
  };
}
