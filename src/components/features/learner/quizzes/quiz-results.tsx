"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { QuizSubmission } from "../../../../types/quiz";

type QuizResultsProps = {
  submission: QuizSubmission;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect?: boolean;
    }>;
    points: number;
  }>;
  onRetake: () => void;
};

export function QuizResults({
  submission,
  questions,
  onRetake,
}: QuizResultsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getQuestionResult = (questionIndex: number) => {
    const answer = submission.answers.find(
      (a) => a.questionIndex === questionIndex
    );
    if (!answer) {
      return null;
    }

    const question = questions[questionIndex];
    if (!question) {
      return null;
    }

    const selectedOption = question.options[answer.selectedOptionIndex];
    const correctOptionIndex = question.options.findIndex(
      (opt) => opt.isCorrect === true
    );
    const isCorrect = correctOptionIndex === answer.selectedOptionIndex;
    const pointsEarned = isCorrect ? question.points : 0;

    return {
      selectedOptionIndex: answer.selectedOptionIndex,
      selectedOptionText: selectedOption?.text ?? "",
      correctOptionIndex,
      correctOptionText: question.options[correctOptionIndex]?.text ?? "",
      isCorrect,
      pointsEarned,
      questionPoints: question.points,
    };
  };

  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold">
              {submission.score} / {submission.maxScore}
            </div>
            <div className="mb-4 text-2xl font-semibold text-muted-foreground">
              {submission.percentage}%
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Attempt #{submission.attemptNumber}</span>
              {submission.timeSpentSeconds && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Time: {formatTime(submission.timeSpentSeconds)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Question Breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Question Breakdown</h3>
        {questions.map((question, questionIndex) => {
          const result = getQuestionResult(questionIndex);
          if (!result) {
            return null;
          }

          return (
            <Card
              key={questionIndex}
              className={
                result.isCorrect
                  ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    Question {questionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        result.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.pointsEarned} / {result.questionPoints} pts
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{question.question}</p>
                <Separator />
                <div className="space-y-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">
                      Your Answer:
                    </p>
                    <div
                      className={`rounded-md border-2 p-3 ${
                        result.isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : "border-red-500 bg-red-50 dark:bg-red-950/30"
                      }`}
                    >
                      <span className="font-semibold">
                        {optionLabels[result.selectedOptionIndex]}.
                      </span>{" "}
                      {result.selectedOptionText}
                    </div>
                  </div>
                  {!result.isCorrect && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-muted-foreground">
                        Correct Answer:
                      </p>
                      <div className="rounded-md border-2 border-green-500 bg-green-50 p-3 dark:bg-green-950/30">
                        <span className="font-semibold">
                          {optionLabels[result.correctOptionIndex]}.
                        </span>{" "}
                        {result.correctOptionText}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Retake Button */}
      <div className="flex items-center justify-end border-t pt-4">
        <button
          className="text-primary hover:underline text-sm font-medium"
          onClick={onRetake}
          type="button"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
}

