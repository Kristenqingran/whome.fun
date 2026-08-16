'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

interface QuizState {
  currentQuestionIndex: number;
  answers: (string | null)[];
  isComplete: boolean;
}

type QuizAction =
  | { type: 'SELECT_OPTION'; payload: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'RESET' };

const initialState: QuizState = {
  currentQuestionIndex: 0,
  answers: [],
  isComplete: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_OPTION': {
      const newAnswers = [...state.answers];
      newAnswers[state.currentQuestionIndex] = action.payload;
      return { ...state, answers: newAnswers };
    }
    case 'NEXT_QUESTION': {
      const nextIndex = state.currentQuestionIndex + 1;
      return { ...state, currentQuestionIndex: nextIndex };
    }
    case 'PREV_QUESTION': {
      const prevIndex = Math.max(0, state.currentQuestionIndex - 1);
      return { ...state, currentQuestionIndex: prevIndex };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface QuizContextType {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
