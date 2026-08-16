import { notFound } from 'next/navigation';
import { getQuizBySlug } from '@/lib/mdx';
import QuizPageClient from './QuizPageClient';
import QuizLayout from './QuizLayout';
import { Locale } from '@/lib/types';

interface QuizPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { lang, slug } = await params;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    notFound();
  }

  return (
    <QuizLayout>
      <QuizPageClient quiz={quiz} lang={lang as Locale} />
    </QuizLayout>
  );
}
