import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuizBySlug } from '@/lib/mdx';
import { getDictionary } from '@/lib/i18n';
import { calculateResult, getScores } from '@/lib/quiz';
import { Locale } from '@/lib/types';

interface ResultPageProps {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ answers?: string }>;
}

export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  const { lang, slug } = await params;
  const { answers } = await searchParams;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    notFound();
  }

  let parsedAnswers: (string | null)[] = [];
  if (answers) {
    try {
      parsedAnswers = JSON.parse(decodeURIComponent(answers));
    } catch {
      parsedAnswers = [];
    }
  }

  const quizResult = calculateResult(quiz, parsedAnswers);
  const { primary, secondary } = quizResult;
  const scores = getScores(quiz, parsedAnswers);
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const resultLabels: Record<string, { en: string; zh: string }> = {
    creative: { en: 'Creative', zh: '创意表达' },
    helper: { en: 'Helper', zh: '助人成长' },
    researcher: { en: 'Researcher', zh: '深度探索' },
    independent: { en: 'Independent', zh: '自主理想' },
  };

  const sortedScores = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen bg-background">
      <div className="site-container py-8">
        {/* Result Hero */}
        <div className="text-center mb-10">
          <p className="text-text-secondary mb-2">
            {lang === 'zh' ? '你的职业方向是' : 'Your career direction is'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            {primary.result.emoji} {primary.result.title[locale]}
          </h1>
        </div>

        {/* Result Card */}
        <div className="card-static p-6 md:p-8 mb-8">
          {/* Description */}
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            {primary.result.description[locale]}
          </p>

          {/* Score Breakdown */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {lang === 'zh' ? '你的职业倾向' : 'Your Career Tendencies'}
            </h3>
            <div className="space-y-2">
              {sortedScores.map(([type, score]) => {
                const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
                const isPrimary = type === primary.type;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className={`w-20 text-sm ${isPrimary ? 'font-medium text-primary' : 'text-text-secondary'}`}>
                      {resultLabels[type]?.[locale]}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isPrimary ? 'bg-primary' : 'bg-slate-300'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={`w-8 text-sm text-right ${isPrimary ? 'font-medium text-primary' : 'text-text-secondary'}`}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {dictionary.result.keywords}
            </h3>
            <div className="flex flex-wrap gap-2">
              {primary.result.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-indigo-50 text-primary text-sm rounded-full"
                >
                  {keyword[locale]}
                </span>
              ))}
            </div>
          </div>

          {/* Careers */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {dictionary.result.careers}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {primary.result.careers.map((career, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-xl text-center text-sm text-text-secondary"
                >
                  {career[locale]}
                </div>
              ))}
            </div>
          </div>

          {/* Avoid */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {dictionary.result.avoid}
            </h3>
            <div className="flex flex-wrap gap-2">
              {primary.result.avoid.map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 text-text-secondary text-sm rounded-full"
                >
                  {item[locale]}
                </span>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {dictionary.result.environment}
            </h3>
            <div className="flex flex-wrap gap-2">
              {primary.result.environment.map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                >
                  {item[locale]}
                </span>
              ))}
            </div>
          </div>

          {/* Secondary */}
          {secondary && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {dictionary.result.secondary}
              </h3>
              <p className="text-lg text-text-secondary">
                {secondary.result.emoji} {secondary.result.title[locale]}
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-text-secondary text-center mb-8">
          {lang === 'zh'
            ? '本测试用于自我探索与娱乐参考，不属于职业能力或心理诊断。'
            : 'This quiz is for self-exploration and entertainment reference only. It is not a professional career or psychological assessment.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${lang}/tests/${slug}/quiz`} className="btn-secondary text-center">
            {lang === 'zh' ? '重新测试' : 'Take Again'}
          </Link>
          <Link href={`/${lang}`} className="btn-primary text-center">
            {lang === 'zh' ? '探索更多测试' : 'Explore More Quizzes'}
          </Link>
        </div>
      </div>
    </div>
  );
}
