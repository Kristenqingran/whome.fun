'use client';

import { useState } from 'react';
import { QuizCard } from './QuizCard';
import { QuizMeta, Locale } from '@/lib/types';

interface LatestQuizzesProps {
  quizzes: QuizMeta[];
  lang: Locale;
  initialCount?: number;
}

export function LatestQuizzes({ quizzes, lang, initialCount = 6 }: LatestQuizzesProps) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = quizzes.length > initialCount;
  const displayedQuizzes = showAll ? quizzes : quizzes.slice(0, initialCount);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedQuizzes.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} lang={lang} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-ghost text-primary"
          >
            {showAll
              ? (lang === 'zh' ? '收起' : 'Show less')
              : (lang === 'zh' ? '查看全部' : 'Show all')}
          </button>
        </div>
      )}
    </div>
  );
}
