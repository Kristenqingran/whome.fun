export type Locale = 'en' | 'zh';

export interface LocalizedString {
  en: string;
  zh: string;
}

export interface QuizOption {
  text: LocalizedString;
  result: string;
}

export interface QuizQuestion {
  question: LocalizedString;
  options: QuizOption[];
}

export interface ResultType {
  id: string;
  emoji: string;
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedString[];
  careers: LocalizedString[];
  avoid: LocalizedString[];
  environment: LocalizedString[];
}

export interface Quiz {
  title: LocalizedString;
  slug: string;
  category: 'personality' | 'career' | 'love' | 'fun';
  duration: string;
  coverImage: string;
  ogImage?: string;
  featured?: boolean;
  publishedAt?: string;
  questions: QuizQuestion[];
  results: Record<string, ResultType>;
}

export interface QuizMeta {
  title: LocalizedString;
  slug: string;
  category: 'personality' | 'career' | 'love' | 'fun';
  duration: string;
  coverImage: string;
  featured?: boolean;
  publishedAt: string;
}

export interface QuizResult {
  primary: { type: string; result: ResultType };
  secondary: { type: string; result: ResultType } | null;
}
