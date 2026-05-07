export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BudgetData {
  income: number;
  expenses: Record<string, number>;
  goals: string;
}

export interface DebtItem {
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export interface UserProgress {
  completedModules: string[];
  quizScores: Record<string, number>;
  toolsUsed: string[];
}
