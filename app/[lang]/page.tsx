import { getDictionary } from '@/lib/i18n';
import { getAllQuizzes, getCategories } from '@/lib/mdx';
import { LatestQuizzes } from '@/components/LatestQuizzes';
import { Locale } from '@/lib/types';
import Link from 'next/link';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

const categoryInfo: Record<string, { desc: { en: string; zh: string }; emoji: string }> = {
  personality: {
    desc: {
      en: "Discover your unique personality traits, strengths, and hidden potentials.",
      zh: "发现你独特的人格特质、优势和隐藏潜能。"
    },
    emoji: '🧠'
  },
  career: {
    desc: {
      en: "Find the perfect career path that matches your skills and personality.",
      zh: "找到与你技能和人格完美匹配的职业道路。"
    },
    emoji: '💼'
  },
  love: {
    desc: {
      en: "Understand your romantic patterns and what you truly need in relationships.",
      zh: "了解你的恋爱模式和感情中真正需要什么。"
    },
    emoji: '💕'
  },
  fun: {
    desc: {
      en: "Fun quizzes to share with friends and discover surprising things about yourself.",
      zh: "与朋友分享的有趣测试，发现关于自己的有趣事实。"
    },
    emoji: '🎉'
  },
};

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const allQuizzes = getAllQuizzes();
  const categories = getCategories();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="site-container py-14 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {dictionary.hero.title}
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6">
              {dictionary.hero.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${lang}/categories/${cat.slug}`}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors"
                >
                  {categoryInfo[cat.slug]?.emoji} {cat.name[locale]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Quizzes */}
      <div className="site-container py-10">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          {lang === 'zh' ? '最新测试' : 'Latest Quizzes'}
        </h2>

        <LatestQuizzes quizzes={allQuizzes} lang={locale} initialCount={6} />
      </div>

      {/* SEO Content */}
      <section className="w-full border-t border-slate-200 py-10">
        <div className="site-container">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {lang === 'zh' ? '关于 Whome.fun' : 'About Whome.fun'}
          </h2>
          <div className="article-content text-text-secondary text-sm leading-relaxed space-y-4">
            <p>
              {lang === 'zh'
                ? 'Whome.fun 是一个免费的在线趣味测试平台。我们提供各种人格、职业、情感和娱乐测试，帮助你更好地了解自己。'
                : 'Whome.fun is a free online fun quiz platform. We offer various personality, career, love, and entertainment quizzes to help you understand yourself better.'}
            </p>
            <p>
              {lang === 'zh'
                ? '所有测试均为匿名完成，无需注册账号。完成测试后，你可以立即查看结果并分享给朋友。'
                : 'All quizzes are anonymous - no account needed. Complete a quiz and instantly see your results to share with friends.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
