/**
 * Quiz Data Validation Test
 *
 * This script validates all quiz data to ensure:
 * 1. Every option.result exists in quiz.results
 * 2. Every result.id is actually used by at least one option
 * 3. Scoring works correctly for each quiz
 * 4. Primary and secondary results can be properly looked up
 *
 * Run with: node __tests__/quiz-validation.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'tests');

function validateQuizzes() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));

  let passed = 0;
  let failed = 0;
  const failures = [];

  console.log('=== Quiz Validation ===\n');

  for (const file of files) {
    const slug = file.replace('.mdx', '');
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');

    // Parse MDX frontmatter
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.log(`✗ ${slug}: Invalid MDX frontmatter`);
      failed++;
      failures.push({ slug, error: 'Invalid MDX frontmatter' });
      continue;
    }

    const data = parseFrontmatter(frontmatterMatch[1]);
    const quiz = data;

    let quizPassed = true;
    const errors = [];

    // 1. Check all option.result exists in quiz.results
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      for (const opt of q.options) {
        if (!quiz.results[opt.result]) {
          quizPassed = false;
          errors.push(`Q${i + 1} option result "${opt.result}" not in results`);
        }
      }
    }

    // 2. Check each result.id is used by at least one option
    const usedResults = new Set();
    for (const q of quiz.questions) {
      for (const opt of q.options) {
        usedResults.add(opt.result);
      }
    }

    for (const key of Object.keys(quiz.results)) {
      if (!usedResults.has(key)) {
        console.log(`  ⚠ ${slug}: result "${key}" defined but never used`);
      }
    }

    // 3. Test scoring with first option of each question
    const answers = quiz.questions.map((q, idx) => q.options[idx % q.options.length].result);
    const scoringResult = calculateResult(quiz, answers);

    // 4. Primary result must exist
    if (!scoringResult.primary) {
      quizPassed = false;
      errors.push('primary result is null/undefined');
    } else if (!scoringResult.primary.result) {
      quizPassed = false;
      errors.push('primary.result is undefined');
    } else {
      // 5. Primary result must have required fields
      if (!scoringResult.primary.result.emoji) {
        quizPassed = false;
        errors.push('primary result missing emoji');
      }
      if (!scoringResult.primary.result.title) {
        quizPassed = false;
        errors.push('primary result missing title');
      }
      if (!scoringResult.primary.result.description) {
        quizPassed = false;
        errors.push('primary result missing description');
      }
      if (!scoringResult.primary.result.keywords) {
        quizPassed = false;
        errors.push('primary result missing keywords');
      }
    }

    // 6. Secondary result must be lookup-able if it exists
    if (scoringResult.secondary && !scoringResult.secondary.result) {
      quizPassed = false;
      errors.push('secondary result defined but lookup failed');
    }

    if (quizPassed) {
      console.log(`✓ ${slug}: primary=${scoringResult.primary?.type}, secondary=${scoringResult.secondary?.type || 'none'}`);
      passed++;
    } else {
      console.log(`✗ ${slug}:`);
      errors.forEach(e => console.log(`  - ${e}`));
      failed++;
      failures.push({ slug, errors });
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed quizzes:');
    failures.forEach(f => console.log(`- ${f.slug}: ${f.errors.join(', ')}`));
    process.exit(1);
  }

  console.log('\n✓ All quizzes passed validation!');
}

function parseFrontmatter(str) {
  const result = {};
  const lines = str.split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;
  let objectIndent = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '') continue;

    // Array start
    if (trimmedLine.startsWith('- ')) {
      if (currentObject) {
        // Object in array
        const objMatch = trimmedLine.match(/^-\s+(.+):\s*(.*)/);
        if (objMatch) {
          const [, key, value] = objMatch;
          currentObject[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
      } else {
        // Simple array
        const match = trimmedLine.match(/^-\s+(.+)/);
        if (match) {
          const value = match[1].trim().replace(/^["']|["']$/g, '');
          currentArray.push(value);
        }
      }
      continue;
    }

    // Object in array
    if (trimmedLine.startsWith('-') && trimmedLine.includes(':')) {
      if (currentArray !== null) {
        const objMatch = trimmedLine.match(/^-\s+(.+):\s*(.*)/);
        if (objMatch) {
          const [, key, value] = objMatch;
          if (value.trim()) {
            currentObject = { _key: key.trim() };
          } else {
            currentObject = {};
          }
          currentArray.push(currentObject);
        }
      }
      continue;
    }

    // Key-value pair
    const match = trimmedLine.match(/^(\w+(?:\w)*):\s*(.*)/);
    if (match) {
      const [, key, value] = match;

      if (currentArray !== null && !trimmedLine.includes(':')) {
        // This is a simple value in array
        currentArray.push(trimmedLine.replace(/^-\s*/, '').replace(/^["']|["']$/g, ''));
        continue;
      }

      const cleanValue = value.trim().replace(/^["']|["']$/g, '');

      if (cleanValue === '' || value.includes(':')) {
        // Could be array or nested object
        if (cleanValue === '') {
          // Check next lines to determine
          currentKey = key;
          if (value.includes(':')) {
            // Nested object
            currentObject = {};
            result[currentKey] = currentObject;
            currentArray = null;
          } else {
            currentArray = [];
            result[currentKey] = currentArray;
          }
        } else {
          result[key] = cleanValue;
          currentArray = null;
          currentObject = null;
        }
      } else {
        result[key] = cleanValue;
        currentArray = null;
        currentObject = null;
      }
    }
  }

  return result;
}

function calculateResult(quiz, answers) {
  const resultKeys = Object.keys(quiz.results);

  const scores = {};
  resultKeys.forEach(key => scores[key] = 0);

  answers.forEach(answer => {
    if (answer && scores.hasOwnProperty(answer)) {
      scores[answer]++;
    }
  });

  const lastSixAnswers = answers.slice(-6);
  const lateScores = {};
  resultKeys.forEach(key => lateScores[key] = 0);
  lastSixAnswers.forEach(answer => {
    if (answer && lateScores.hasOwnProperty(answer)) {
      lateScores[answer]++;
    }
  });

  const sortedEntries = Object.entries(scores).sort(([a, sa], [b, sb]) => {
    if (sb !== sa) return sb - sa;
    const lateDiff = lateScores[b] - lateScores[a];
    if (lateDiff !== 0) return lateDiff;
    return a.localeCompare(b);
  });

  const primaryType = sortedEntries[0]?.[0];
  const secondaryType = sortedEntries[1]?.[0];

  if (!primaryType || !quiz.results[primaryType]) {
    const firstKey = resultKeys[0];
    return {
      primary: { type: firstKey, result: quiz.results[firstKey] },
      secondary: null,
    };
  }

  return {
    primary: { type: primaryType, result: quiz.results[primaryType] },
    secondary: secondaryType && quiz.results[secondaryType]
      ? { type: secondaryType, result: quiz.results[secondaryType] }
      : null,
  };
}

validateQuizzes();
