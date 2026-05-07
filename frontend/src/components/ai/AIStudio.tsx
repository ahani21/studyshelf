'use client'

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateFromText } from '@/server/actions/ai';
import FlashcardDeck from '@/components/ai/FlashcardDeck';
import MCQQuiz from '@/components/ai/MCQQuiz';
import { Sparkles, Upload, FileText, Loader2, BookOpen, Brain, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import * as Tesseract from 'tesseract.js';

type Mode = 'text' | 'pdf';
type Tab = 'flashcards' | 'mcqs' | 'summary';

interface GenerationResult {
  summary: string;
  flashcards: { front: string; back: string }[];
  mcqs: { question: string; options: string[]; answer: string }[];
  flashcardCount: number;
}

export default function AIStudio() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('pdf');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('flashcards');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle mode from query params
  useEffect(() => {
    const m = searchParams.get('mode') as Mode;
    if (m && (m === 'pdf' || m === 'text')) {
      setMode(m);
    }
  }, [searchParams]);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      import('pdfjs-dist/build/pdf.worker.min.mjs');
    }
  }, []);

  const extractText = async (file: File): Promise<string> => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    setExtracting(true);
    setProgress(0);

    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to 10 pages for free tier
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      if (pageText.trim().length < 100) {
        // Fallback to OCR for scanned pages
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') setProgress(Math.round((i / pdf.numPages) * 100));
            }
          });
          fullText += text + '\n';
        }
      } else {
        fullText += pageText + '\n';
      }
      setProgress(Math.round((i / Math.min(pdf.numPages, 10)) * 100));
    }
    
    setExtracting(false);
    return fullText;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      let content = '';
      const title = formData.get('title') as string;

      if (mode === 'pdf') {
        const file = formData.get('pdf') as File;
        if (!file) throw new Error('No file provided');
        content = await extractText(file);
      } else {
        content = formData.get('content') as string;
      }

      if (!content || content.trim().length < 50) {
        throw new Error('Could not extract enough text from this document. Please try a different file.');
      }

      // We use the text-based generator because we've already done the extraction
      const apiFormData = new FormData();
      apiFormData.append('title', title || (mode === 'pdf' ? fileName || '' : 'Untitled'));
      apiFormData.append('content', content);

      const res = await generateFromText(apiFormData);
      setResult(res);
      setTab('flashcards');
      formRef.current?.reset();
      setFileName(null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      setFileName(file.name);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-surface-inset border border-border-default rounded-lg w-fit">
        {(['pdf', 'text'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-150 ${mode === m ? 'bg-accent-glow text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {m === 'pdf' ? <Upload className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {m === 'pdf' ? 'Upload PDF' : 'Paste Notes'}
          </button>
        ))}
      </div>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title (optional)"
          className="w-full h-10 bg-surface-inset border border-border-default rounded-md px-3 text-body text-white placeholder:text-white/40 focus:border-accent-glow outline-none"
        />

        {mode === 'pdf' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative h-48 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200
              ${dragOver ? 'border-accent-glow bg-accent-glow/10' : 'border-border-default hover:border-accent-glow/50 hover:bg-surface-raised'}`}
          >
            <input
              ref={fileRef}
              type="file"
              name="pdf"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
            />
            {fileName ? (
              <>
                <FileText className="w-10 h-10 text-accent-glow" />
                <p className="text-body text-text-primary font-medium">{fileName}</p>
                <p className="text-micro text-text-tertiary">Click to change file</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-text-tertiary" />
                <p className="text-body text-text-secondary">Drop your PDF here or <span className="text-accent-glow">browse</span></p>
                <p className="text-micro text-text-tertiary">Supports all PDFs including scanned textbooks & images</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            name="content"
            rows={10}
            placeholder="Paste your notes, lecture content, or any text you want to study..."
            className="w-full bg-surface-inset border border-border-default rounded-xl px-4 py-3 text-body text-white placeholder:text-white/40 focus:border-accent-glow outline-none resize-none"
          />
        )}

        {error && (
          <div className="flex gap-3 text-danger-fg text-body-sm bg-danger-bg border border-danger-border rounded-md px-4 py-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-accent-glow hover:bg-accent-highlight disabled:opacity-60 text-white rounded-xl font-medium text-body transition-colors flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="flex items-center gap-2 relative z-10">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {extracting ? `Scanning Document (${progress}%)` : 'AI is thinking...'}</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate Study Materials</>
            )}
          </div>
          {extracting && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 border-t border-border-subtle pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-display text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-glow" />
              Generated Materials
            </h2>
            <div className="flex items-center gap-2 text-micro text-text-tertiary">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{result.flashcardCount} flashcards added to your Review Queue!</span>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 p-1 bg-surface-inset border border-border-default rounded-lg w-fit">
            {(['flashcards', 'mcqs', 'summary'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-body-sm font-medium capitalize transition-all duration-150 ${tab === t ? 'bg-surface-raised text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}
              >
                {t === 'flashcards' && `Flashcards (${result.flashcards.length})`}
                {t === 'mcqs' && `Quiz (${result.mcqs.length})`}
                {t === 'summary' && 'Summary'}
              </button>
            ))}
          </div>

          <div className="card bg-surface border border-border-default rounded-xl p-6 shadow-[var(--shadow-raised)]">
            {tab === 'flashcards' && <FlashcardDeck flashcards={result.flashcards} />}
            {tab === 'mcqs' && <MCQQuiz mcqs={result.mcqs} />}
            {tab === 'summary' && (
              <div className="space-y-3">
                <h3 className="text-label text-text-tertiary">AI SUMMARY</h3>
                <p className="text-body text-text-primary leading-relaxed">{result.summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

