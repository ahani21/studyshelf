import { Sparkles } from 'lucide-react';
import AIStudio from '@/components/ai/AIStudio';

export const metadata = {
  title: 'AI Studio | StudyShelf',
  description: 'Upload PDFs or paste notes to generate flashcards, quizzes, and summaries using AI.'
};

export default function AIPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <header>
        <h1 className="text-display-lg font-display text-text-primary flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-accent-glow" />
          AI Studio
        </h1>
        <p className="text-body-lg text-text-secondary mt-1">
          Upload a PDF or paste your notes — Gemini AI will generate flashcards, a quiz, and a summary. Your flashcards are automatically added to your Review Queue!
        </p>
      </header>

      <AIStudio />
    </div>
  );
}
