import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuizzesByCategory, getCategories } from '@/lib/mdx';
import { getDictionary } from '@/lib/i18n';
import { QuizCard } from '@/components/QuizCard';
import { Locale } from '@/lib/types';

interface CategoryPageProps {
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

const categoryInfo: Record<string, {
  title: { en: string; zh: string };
  desc: { en: string; zh: string };
  emoji: string;
}> = {
  personality: {
    title: { en: 'Personality Tests', zh: '人格测试' },
    desc: {
      en: 'Discover your unique personality type with our scientifically-inspired quizzes. Understand your strengths, weaknesses, and how you interact with the world around you.',
      zh: '通过我们基于科学研究的测试发现你独特的人格类型。了解你的优势、劣势以及你如何与周围世界互动。'
    },
    emoji: '🧠',
  },
  career: {
    title: { en: 'Career Tests', zh: '职业测试' },
    desc: {
      en: 'Find career paths that match your skills, interests, and personality. Get inspired for your next career move or discover hidden talents.',
      zh: '找到与你技能、兴趣和人格匹配的职业道路。获得下一个职业发展的灵感或发现隐藏才能。'
    },
    emoji: '💼',
  },
  love: {
    title: { en: 'Love & Relationships', zh: '爱情与关系' },
    desc: {
      en: 'Explore your romantic personality, relationship patterns, and what you truly need in a partner. Understand yourself better in matters of the heart.',
      zh: '探索你的恋爱人格、关系模式以及在伴侣中真正需要什么。在感情中更好地了解自己。'
    },
    emoji: '💕',
  },
  fun: {
    title: { en: 'Fun Quizzes', zh: '趣味测试' },
    desc: {
      en: 'Enjoy lighthearted quizzes to share with friends. Discover fun facts about yourself and get entertaining results you can compare with others.',
      zh: '享受与朋友分享的轻松测试。发现关于自己的有趣事实，并获得可以与他人比较的有趣结果。'
    },
    emoji: '🎉',
  },
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const categories = getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const quizzes = getQuizzesByCategory(slug);
  const info = categoryInfo[slug] || { title: category.name, desc: { en: '', zh: '' }, emoji: '📝' };

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <section className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="site-container py-10">
          <div className="text-center">
            <span className="text-5xl mb-4 block">{info.emoji}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              {info.title[locale]}
            </h1>
            <p className="text-text-secondary text-sm max-w-xl mx-auto">
              {info.desc[locale]}
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Grid */}
      <div className="site-container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">
            {lang === 'zh' ? '热门测试' : 'Popular Quizzes'}
          </h2>
          <span className="text-sm text-text-secondary">
            {quizzes.length} {dictionary.category.quizzes}
          </span>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.slug} quiz={quiz} lang={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <p className="text-text-secondary">
              {lang === 'zh' ? '更多测试即将上线...' : 'More quizzes coming soon...'}
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-4 mb-8">
          <Link href={`/${lang}`} className="text-primary hover:underline text-sm">
            ← {lang === 'zh' ? '返回首页' : 'Back to Home'}
          </Link>
        </div>
      </div>

      {/* About Category */}
      <section className="w-full border-t border-slate-200 py-10">
        <div className="site-container">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {lang === 'zh' ? '关于' : 'About '}{info.title[locale]}
          </h2>
          <div className="article-content text-text-secondary text-sm leading-relaxed">
            <p>{info.desc[locale]}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
