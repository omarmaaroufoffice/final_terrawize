export interface QuestionOption {
  text: string;
  description?: string;
  icon?: string;
}

export interface Question {
  question: string;
  options: QuestionOption[];
  category?: string;
  helpText?: string;
}

export interface RankingQuestion {
  question: string;
  options: { text: string }[];
} 