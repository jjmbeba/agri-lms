import type { ContentItem } from "./types";

/**
 * Strips `id` fields from quiz questions and options before sending to backend.
 * IDs are frontend-only (used for React keys) and are not stored in the database.
 */
export function stripQuizIds(content: ContentItem[]): ContentItem[] {
  return content.map((item) => {
    if (item.type === "quiz" && item.questions) {
      return {
        ...item,
        questions: item.questions.map((question) => ({
          question: question.question,
          points: question.points,
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        })),
      };
    }
    return item;
  });
}

