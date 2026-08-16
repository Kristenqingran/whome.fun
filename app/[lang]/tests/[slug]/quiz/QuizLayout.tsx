import { Locale } from '@/lib/types';

interface QuizLayoutProps {
  children: React.ReactNode;
}

export default function QuizLayout({ children }: QuizLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
    </div>
  );
}
