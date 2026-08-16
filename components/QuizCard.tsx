import Link from 'next/link';
import { QuizMeta, Locale } from '@/lib/types';

interface QuizCardProps {
  quiz: QuizMeta;
  lang: Locale;
  takerCount?: string;
  compact?: boolean;
}

const categoryStyles: Record<string, { gradient: string; emoji: string }> = {
  personality: { gradient: 'from-purple-400 to-pink-400', emoji: '🧠' },
  career: { gradient: 'from-blue-400 to-cyan-400', emoji: '💼' },
  love: { gradient: 'from-red-400 to-rose-400', emoji: '💕' },
  fun: { gradient: 'from-yellow-400 to-orange-400', emoji: '🎉' },
};

export function QuizCard({ quiz, lang, takerCount = '1.2k', compact = false }: QuizCardProps) {
  const style = categoryStyles[quiz.category] || categoryStyles.fun;

  return (
    <Link href={`/${lang}/tests/${quiz.slug}`} className="card block">
      <div className={`relative bg-gradient-to-br ${style.gradient} ${compact ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${compact ? 'text-5xl' : 'text-6xl'}`}>{style.emoji}</span>
        </div>
        {quiz.featured && (
          <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-medium text-white">
            {lang === 'zh' ? '精选' : 'Featured'}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className={`font-semibold text-text-primary line-clamp-2 ${compact ? 'text-sm' : ''}`}>
          {quiz.title[lang]}
        </h3>
        {!compact && (
          <p className="text-text-secondary text-xs mt-1">
            {takerCount} {lang === 'zh' ? '人已测试' : 'people taken'}
          </p>
        )}
      </div>
    </Link>
  );
}
