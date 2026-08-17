import { Quiz, QuizResult } from './types';

export function calculateResult(
  quiz: Quiz,
  answers: (string | null)[]
): QuizResult {
  // Dynamically get all result keys from the quiz data
  const resultKeys = Object.keys(quiz.results);

  // Initialize scores for all result types dynamically
  const scores: Record<string, number> = {};
  resultKeys.forEach(key => {
    scores[key] = 0;
  });

  // Count scores from answers
  answers.forEach((answer) => {
    if (answer && scores.hasOwnProperty(answer)) {
      scores[answer]++;
    }
  });

  // Late answers (last 6) for tiebreaking
  const lastSixAnswers = answers.slice(-6);
  const lateScores: Record<string, number> = {};
  resultKeys.forEach(key => {
    lateScores[key] = 0;
  });
  lastSixAnswers.forEach((answer) => {
    if (answer && lateScores.hasOwnProperty(answer)) {
      lateScores[answer]++;
    }
  });

  // Sort by score (desc), then by late score (desc), then alphabetically for stable sort
  const sortedEntries = Object.entries(scores).sort(([typeA, scoreA], [typeB, scoreB]) => {
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    const lateDiff = lateScores[typeB] - lateScores[typeA];
    if (lateDiff !== 0) {
      return lateDiff;
    }
    // Alphabetical sort for stable ordering when scores are equal
    return typeA.localeCompare(typeB);
  });

  const primaryType = sortedEntries[0]?.[0];
  const secondaryType = sortedEntries[1]?.[0];

  if (!primaryType || !quiz.results[primaryType]) {
    // Defensive: if primary result is invalid, return first available
    const firstKey = resultKeys[0];
    return {
      primary: {
        type: firstKey,
        result: quiz.results[firstKey],
      },
      secondary: null,
    };
  }

  return {
    primary: {
      type: primaryType,
      result: quiz.results[primaryType],
    },
    secondary: secondaryType && quiz.results[secondaryType]
      ? {
          type: secondaryType,
          result: quiz.results[secondaryType],
        }
      : null,
  };
}

export function getScores(
  quiz: Quiz,
  answers: (string | null)[]
): Record<string, number> {
  // Dynamically get all result keys from the quiz data
  const resultKeys = Object.keys(quiz.results);

  const scores: Record<string, number> = {};
  resultKeys.forEach(key => {
    scores[key] = 0;
  });

  answers.forEach((answer) => {
    if (answer && scores.hasOwnProperty(answer)) {
      scores[answer]++;
    }
  });

  return scores;
}
