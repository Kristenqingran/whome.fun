import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuizBySlug, getCategories } from '@/lib/mdx';
import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/lib/types';

interface QuizPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  const params: { lang: string; slug: string }[] = [];

  categories.forEach((cat) => {
    params.push({ lang: 'en', slug: cat.slug });
    params.push({ lang: 'zh', slug: cat.slug });
  });

  return params;
}

const categoryStyles: Record<string, { gradient: string; emoji: string }> = {
  personality: { gradient: 'from-purple-400 to-pink-400', emoji: '🧠' },
  career: { gradient: 'from-blue-400 to-cyan-400', emoji: '💼' },
  love: { gradient: 'from-red-400 to-rose-400', emoji: '💕' },
  fun: { gradient: 'from-yellow-400 to-orange-400', emoji: '🎉' },
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { lang, slug } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    notFound();
  }

  const style = categoryStyles[quiz.category] || categoryStyles.fun;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card-static overflow-hidden">
        <div className={`relative aspect-video bg-gradient-to-br ${style.gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl">{style.emoji}</span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="badge">{quiz.category}</span>
            <span className="text-text-secondary text-sm">• {quiz.duration}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {quiz.title[lang as Locale]}
          </h1>

          <p className="text-text-secondary text-lg mb-8">
            {lang === 'zh'
              ? '探索你的职业倾向，发现最适合你的工作类型。'
              : 'Explore your career tendencies and discover the type of work that suits you best.'}
          </p>

          <div className="flex items-center gap-6 text-text-secondary mb-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span>1.2k {dictionary.home.people}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span>{quiz.duration}</span>
            </div>
          </div>

          <Link
            href={`/${lang}/tests/${slug}/quiz`}
            className="btn-primary w-full md:w-auto text-center text-lg"
          >
            {dictionary.quiz.start}
          </Link>
        </div>
      </div>

      <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
        <h2 className="font-semibold text-text-primary mb-4">
          {lang === 'zh' ? '测试包含' : 'This quiz includes'}
        </h2>
        <ul className="space-y-2 text-text-secondary">
          <li className="flex items-center gap-2">
            <span>✅</span>
            <span>
              {quiz.questions.length} {lang === 'zh' ? '道题目' : 'questions'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span>✅</span>
            <span>
              {Object.keys(quiz.results).length} {lang === 'zh' ? '种测试结果' : 'result types'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
