'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuizProvider, useQuiz } from '@/components/QuizContext';
import { Quiz, Locale } from '@/lib/types';

interface QuizPageClientProps {
  quiz: Quiz;
  lang: Locale;
}

function QuizView({ quiz, lang }: QuizPageClientProps) {
  const router = useRouter();
  const { state, dispatch } = useQuiz();
  const [showTransition, setShowTransition] = useState(false);

  const currentQuestion = quiz.questions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[state.currentQuestionIndex];
  const isFirstQuestion = state.currentQuestionIndex === 0;
  const isLastQuestion = state.currentQuestionIndex === quiz.questions.length - 1;
  const isAnswered = selectedAnswer !== undefined;

  const goToNext = useCallback(() => {
    if (isLastQuestion) {
      setShowTransition(true);
      setTimeout(() => {
        const resultParam = encodeURIComponent(JSON.stringify(state.answers));
        router.push(`/${lang}/tests/${quiz.slug}/result?answers=${resultParam}`);
      }, 1200);
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [isLastQuestion, state.answers, router, lang, quiz.slug, dispatch]);

  const handleSelectOption = (optionIndex: number) => {
    const resultKey = currentQuestion.options[optionIndex].result;
    dispatch({ type: 'SELECT_OPTION', payload: resultKey });
  };

  const handlePrev = () => {
    dispatch({ type: 'PREV_QUESTION' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    setShowTransition(false);
  };

  useEffect(() => {
    return () => {
      handleReset();
    };
  }, []);

  const progress = ((state.currentQuestionIndex + 1) / quiz.questions.length) * 100;

  if (showTransition) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          <p className="text-text-secondary text-sm">
            {lang === 'zh' ? '正在分析你的职业倾向...' : 'Analyzing your career direction...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="w-full max-w-[680px] mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            {state.currentQuestionIndex + 1} / {quiz.questions.length}
          </span>
        </div>
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-[680px]">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary text-center mb-8 leading-relaxed">
            {currentQuestion.question[lang]}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option.result;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-indigo-50 text-primary'
                      : 'border-slate-200 bg-white text-text-primary hover:border-primary/50 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">{option.text[lang]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-[680px] mx-auto px-4 pb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={isFirstQuestion}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isFirstQuestion
                ? 'opacity-0 pointer-events-none'
                : 'text-text-secondary hover:text-primary hover:bg-slate-100'
            }`}
          >
            ← {lang === 'zh' ? '上一题' : 'Previous'}
          </button>

          {isLastQuestion ? (
            <button
              onClick={goToNext}
              disabled={!isAnswered}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
            >
              {lang === 'zh' ? '查看结果' : 'View Results'} →
            </button>
          ) : (
            <button
              onClick={goToNext}
              disabled={!isAnswered}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
            >
              {lang === 'zh' ? '下一题' : 'Next'} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPageClient({ quiz, lang }: QuizPageClientProps) {
  return (
    <QuizProvider>
      <QuizView quiz={quiz} lang={lang} />
    </QuizProvider>
  );
}
