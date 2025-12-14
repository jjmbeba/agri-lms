import type { Doc, Id } from "../../convex/_generated/dataModel";

export type QuizAnswer = {
  questionIndex: number;
  selectedOptionIndex: number;
};

export type QuizSubmission = Doc<"quizSubmission">;

export type QuizWithSubmissions = {
  quiz: {
    _id: Id<"quiz">;
    moduleContentId: Id<"moduleContent">;
    questions: Array<{
      question: string;
      options: Array<{
        text: string;
        isCorrect?: boolean;
      }>;
      points: number;
    }>;
    timerMinutes?: number;
    timerSeconds?: number;
    maxScore: number;
    instructions?: string;
    title: string;
  };
  submissions: QuizSubmission[];
  latestSubmission: QuizSubmission | null;
};

