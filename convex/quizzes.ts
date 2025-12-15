import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

// -----------------------------
// Validators
// -----------------------------
const quizSubmissionValidator = v.object({
  quizId: v.id("quiz"),
  answers: v.array(
    v.object({
      questionIndex: v.number(),
      selectedOptionIndex: v.number(),
    })
  ),
  timeSpentSeconds: v.optional(v.number()),
});

// -----------------------------
// Helpers
// -----------------------------
async function validateQuizExists(
  ctx: QueryCtx,
  quizId: Id<"quiz">
): Promise<Doc<"quiz">> {
  const quiz = await ctx.db.get(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  return quiz;
}

async function validateUserEnrollmentForQuiz(
  ctx: QueryCtx,
  userId: string,
  quizId: Id<"quiz">
) {
  const quiz = await validateQuizExists(ctx, quizId);

  // Get the module content to find the module
  const moduleContent = await ctx.db.get(quiz.moduleContentId);
  if (!moduleContent) {
    throw new Error("Module content not found");
  }

  // Get the module to find the course version
  const module = await ctx.db.get(moduleContent.moduleId);
  if (!module) {
    throw new Error("Module not found");
  }

  // Get the course version to find the course
  const courseVersion = await ctx.db.get(module.courseVersionId);
  if (!courseVersion) {
    throw new Error("Course version not found");
  }

  // Check if user is enrolled in the course
  const enrollment = await ctx.db
    .query("enrollment")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("courseId"), courseVersion.courseId)
      )
    )
    .first();

  if (!enrollment) {
    throw new Error("User is not enrolled in this course");
  }

  return { quiz, enrollment };
}

async function getNextAttemptNumber(
  ctx: QueryCtx,
  quizId: Id<"quiz">,
  userId: string
): Promise<number> {
  const submissions = await ctx.db
    .query("quizSubmission")
    .withIndex("user_quiz", (q) => q.eq("userId", userId).eq("quizId", quizId))
    .collect();

  return submissions.length + 1;
}

function validateQuizAnswers(
  quiz: Doc<"quiz">,
  answers: Array<{ questionIndex: number; selectedOptionIndex: number }>
): void {
  // Check that all questions are answered
  if (answers.length !== quiz.questions.length) {
    throw new Error(
      `Expected ${quiz.questions.length} answers, got ${answers.length}`
    );
  }

  // Validate each answer
  for (const answer of answers) {
    const question = quiz.questions[answer.questionIndex];
    if (!question) {
      throw new Error(
        `Invalid question index: ${answer.questionIndex}. Quiz has ${quiz.questions.length} questions.`
      );
    }

    if (
      answer.selectedOptionIndex < 0 ||
      answer.selectedOptionIndex >= question.options.length
    ) {
      throw new Error(
        `Invalid option index ${answer.selectedOptionIndex} for question ${answer.questionIndex}. Question has ${question.options.length} options.`
      );
    }
  }

  // Check for duplicate question indices
  const questionIndices = answers.map((a) => a.questionIndex);
  const uniqueIndices = new Set(questionIndices);
  if (uniqueIndices.size !== questionIndices.length) {
    throw new Error("Duplicate question indices found in answers");
  }
}

function calculateQuizScore(
  quiz: Doc<"quiz">,
  answers: Array<{ questionIndex: number; selectedOptionIndex: number }>
): { score: number; maxScore: number; percentage: number } {
  let score = 0;
  const maxScore = quiz.maxScore;

  for (const answer of answers) {
    const question = quiz.questions[answer.questionIndex];
    if (!question) {
      continue;
    }

    const selectedOption = question.options[answer.selectedOptionIndex];
    if (selectedOption?.isCorrect) {
      score += question.points;
    }
  }

  const PERCENT_MULTIPLIER = 100;

  const percentage =
    maxScore > 0 ? Math.round((score / maxScore) * PERCENT_MULTIPLIER) : 0;

  return { score, maxScore, percentage };
}

// -----------------------------
// Queries
// -----------------------------
export const getQuizWithSubmissions = query({
  args: {
    quizId: v.id("quiz"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const quiz = await validateQuizExists(ctx, args.quizId);
    const moduleContent = await ctx.db.get(quiz.moduleContentId);

    if (!moduleContent) {
      throw new Error("Module content not found");
    }

    // Get user's submissions for this quiz
    const submissions = await ctx.db
      .query("quizSubmission")
      .withIndex("user_quiz", (q) =>
        q.eq("userId", identity.subject).eq("quizId", args.quizId)
      )
      .order("desc")
      .collect();

    // Prepare quiz questions - always include correct answers for results view
    // Frontend will handle hiding them during quiz taking
    const questionsForDisplay = quiz.questions.map((q) => ({
      question: q.question,
      options: q.options.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      points: q.points,
    }));

    return {
      quiz: {
        ...quiz,
        title: moduleContent.title,
        questions: questionsForDisplay,
      },
      submissions,
      latestSubmission: submissions[0] || null,
    };
  },
});

// -----------------------------
// Mutations
// -----------------------------
export const submitQuiz = mutation({
  args: quizSubmissionValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { quiz, enrollment } = await validateUserEnrollmentForQuiz(
      ctx,
      identity.subject,
      args.quizId
    );

    // Validate answers
    validateQuizAnswers(quiz, args.answers);

    // Calculate score
    const { score, maxScore, percentage } = calculateQuizScore(
      quiz,
      args.answers
    );

    // Get next attempt number
    const attemptNumber = await getNextAttemptNumber(
      ctx,
      args.quizId,
      identity.subject
    );

    const submittedAt = new Date().toISOString();

    const submissionId = await ctx.db.insert("quizSubmission", {
      quizId: args.quizId,
      userId: identity.subject,
      userName: identity.name ?? "",
      enrollmentId: enrollment._id,
      answers: args.answers,
      score,
      maxScore,
      percentage,
      submittedAt,
      timeSpentSeconds: args.timeSpentSeconds,
      attemptNumber,
      status: "completed", // Quizzes are auto-graded, so always completed
    });

    return {
      submissionId,
      score,
      maxScore,
      percentage,
      attemptNumber,
    };
  },
});
