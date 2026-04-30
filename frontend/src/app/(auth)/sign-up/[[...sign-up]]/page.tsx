import { SignUp } from '@clerk/nextjs';
import { BookOpen } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient shelf glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-accent-glow/10 blur-[100px] rounded-[100%]" />
      
      <div className="mb-8 flex flex-col items-center z-10">
        <BookOpen className="w-10 h-10 text-accent-glow mb-4" />
        <h1 className="text-display-sm font-display text-text-primary mb-2">StudyShelf</h1>
        <p className="text-body text-text-secondary">Join to start building your knowledge base.</p>
      </div>

      <div className="z-10">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-surface border border-border-default rounded-2xl shadow-[var(--shadow-raised)] p-2 md:p-4",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-surface-inset border border-border-default text-text-primary hover:bg-surface-raised",
              dividerLine: "bg-border-subtle",
              dividerText: "text-text-tertiary",
              formFieldLabel: "text-text-secondary",
              formFieldInput: "bg-surface-inset border border-border-default text-text-primary focus:border-accent-glow",
              formButtonPrimary: "bg-text-primary text-text-inverse hover:bg-[#E8E0D4] normal-case text-[14px] font-medium rounded-md",
              footerActionLink: "text-accent-glow hover:text-accent-highlight",
              footerActionText: "text-text-secondary"
            }
          }}
        />
      </div>
    </div>
  );
}
