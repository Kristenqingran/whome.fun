import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Quiz, QuizMeta } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'tests');

export function getAllQuizSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getQuizBySlug(slug: string): Quiz | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(raw);
  return data as Quiz;
}

export function getAllQuizzes(): QuizMeta[] {
  const slugs = getAllQuizSlugs();
  const quizzes: QuizMeta[] = [];
  for (const slug of slugs) {
    const quiz = getQuizBySlug(slug);
    if (quiz) {
      quizzes.push({
        title: quiz.title,
        slug: quiz.slug,
        category: quiz.category,
        duration: quiz.duration,
        coverImage: quiz.coverImage,
        featured: quiz.featured,
        publishedAt: quiz.publishedAt || '1970-01-01',
      });
    }
  }
  return quizzes.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getQuizzesByCategory(category: string): QuizMeta[] {
  return getAllQuizzes().filter((q) => q.category === category);
}

export function getFeaturedQuizzes(): QuizMeta[] {
  return getAllQuizzes().filter((q) => q.featured);
}

export function getCategories(): Array<{ slug: string; name: LocalizedString }> {
  return [
    { slug: 'personality', name: { en: 'Personality', zh: '人格' } },
    { slug: 'career', name: { en: 'Career', zh: '职业' } },
    { slug: 'love', name: { en: 'Love', zh: '情感' } },
    { slug: 'fun', name: { en: 'Fun', zh: '趣味' } },
  ];
}

type LocalizedString = {
  en: string;
  zh: string;
};
