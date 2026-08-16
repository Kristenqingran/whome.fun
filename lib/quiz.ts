import { Quiz, QuizResult } from './types';

const RESULT_PRIORITY = ['creative', 'helper', 'researcher', 'independent'];

export function calculateResult(
  quiz: Quiz,
  answers: (string | null)[]
): QuizResult {
  const scores: Record<string, number> = {
    creative: 0,
    helper: 0,
    researcher: 0,
    independent: 0,
  };

  answers.forEach((answer) => {
    if (answer && scores.hasOwnProperty(answer)) {
      scores[answer]++;
    }
  });

  const lastSixAnswers = answers.slice(-6);
  const lateScores: Record<string, number> = {
    creative: 0,
    helper: 0,
    researcher: 0,
    independent: 0,
  };
  lastSixAnswers.forEach((answer) => {
    if (answer && lateScores.hasOwnProperty(answer)) {
      lateScores[answer]++;
    }
  });

  const sortedEntries = Object.entries(scores).sort(([typeA, scoreA], [typeB, scoreB]) => {
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    const lateDiff = lateScores[typeB] - lateScores[typeA];
    if (lateDiff !== 0) {
      return lateDiff;
    }
    const priorityA = RESULT_PRIORITY.indexOf(typeA);
    const priorityB = RESULT_PRIORITY.indexOf(typeB);
    return priorityA - priorityB;
  });

  const primaryType = sortedEntries[0]?.[0] || 'creative';
  const secondaryType = sortedEntries[1]?.[0];

  return {
    primary: {
      type: primaryType,
      result: quiz.results[primaryType],
    },
    secondary: secondaryType
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
  const scores: Record<string, number> = {
    creative: 0,
    helper: 0,
    researcher: 0,
    independent: 0,
  };

  answers.forEach((answer) => {
    if (answer && scores.hasOwnProperty(answer)) {
      scores[answer]++;
    }
  });

  return scores;
}
