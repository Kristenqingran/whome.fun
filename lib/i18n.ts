import { Locale } from './types';

const dictionaries = {
  en: () => import('@/i18n/dictionaries/en.json').then((m) => m.default),
  zh: () => import('@/i18n/dictionaries/zh.json').then((m) => m.default),
};

export type Dictionary = {
  nav: {
    trending: string;
    personality: string;
    career: string;
    love: string;
    fun: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  home: {
    featured: string;
    popular: string;
    categories: string;
    takeQuiz: string;
    people: string;
  };
  category: {
    quizzes: string;
    explore: string;
  };
  quiz: {
    start: string;
    next: string;
    back: string;
    question: string;
    of: string;
    results: string;
    takeAgain: string;
    shareResult: string;
    tryAnother: string;
    relatedQuizzes: string;
    analyzing: string;
  };
  result: {
    yourResult: string;
    keywords: string;
    careers: string;
    avoid: string;
    environment: string;
    secondary: string;
    share: string;
    copyLink: string;
    saveImage: string;
  };
  footer: {
    copyright: string;
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
  };
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
