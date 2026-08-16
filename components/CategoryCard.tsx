import Link from 'next/link';
import { Locale } from '@/lib/types';

interface Category {
  slug: string;
  name: {
    en: string;
    zh: string;
  };
}

interface CategoryCardProps {
  category: Category;
  lang: Locale;
  quizCount?: number;
}

const categoryIcons: Record<string, string> = {
  personality: '🧠',
  career: '💼',
  love: '💕',
  fun: '🎉',
};

export function CategoryCard({ category, lang, quizCount }: CategoryCardProps) {
  const icon = categoryIcons[category.slug] || '📝';

  return (
    <Link
      href={`/${lang}/categories/${category.slug}`}
      className="card p-6 flex flex-col items-center text-center hover:border-primary/20"
    >
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="font-semibold text-text-primary">
        {category.name[lang]}
      </h3>
      {quizCount !== undefined && (
        <p className="text-text-secondary text-sm mt-1">
          {quizCount} {lang === 'zh' ? '个测试' : 'quizzes'}
        </p>
      )}
    </Link>
  );
}
