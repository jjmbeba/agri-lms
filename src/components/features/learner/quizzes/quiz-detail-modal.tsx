"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { QuizResults } from "./quiz-results";
import { QuizTaking } from "./quiz-taking";

type QuizDetailModalProps = {
  quizId: Id<"quiz">;
  isOpen: boolean;
  onClose: () => void;
};

export function QuizDetailModal({
  quizId,
  isOpen,
  onClose,
}: QuizDetailModalProps) {
  const [showResults, setShowResults] = useState(false);
  const [submissionId, setSubmissionId] = useState<Id<"quizSubmission"> | null>(
    null
  );

  const { data: quizData } = useSuspenseQuery(
    convexQuery(api.quizzes.getQuizWithSubmissions, { quizId })
  );

  if (!quizData) {
    return (
      <Dialog onOpenChange={onClose} open={isOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Quiz...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { quiz, latestSubmission } = quizData;
  const hasSubmission = latestSubmission !== null;

  const handleSubmissionComplete = (newSubmissionId: Id<"quizSubmission">) => {
    setSubmissionId(newSubmissionId);
    setShowResults(true);
  };

  const handleRetake = () => {
    setShowResults(false);
    setSubmissionId(null);
  };

  const handleClose = () => {
    setShowResults(false);
    setSubmissionId(null);
    onClose();
  };

  // Get the submission to display (new submission takes priority)
  const displaySubmission =
    submissionId && quizData.submissions.find((s) => s._id === submissionId)
      ? quizData.submissions.find((s) => s._id === submissionId)!
      : latestSubmission;

  // Show results if:
  // 1. We just submitted (submissionId is set), OR
  // 2. User has a previous submission and hasn't clicked retake (showResults is not explicitly false)
  const shouldShowResultsView =
    displaySubmission !== null &&
    (submissionId !== null || (hasSubmission && showResults !== false));

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Max Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quiz.maxScore} points</div>
              </CardContent>
            </Card>
            {quiz.timerMinutes !== undefined || quiz.timerSeconds !== undefined ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Time Limit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {String(quiz.timerMinutes ?? 0).padStart(2, "0")}:
                    {String(quiz.timerSeconds ?? 0).padStart(2, "0")}
                  </div>
                </CardContent>
              </Card>
            ) : null}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quiz.questions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Quiz Taking or Results */}
          {shouldShowResultsView && displaySubmission ? (
            <QuizResults
              onRetake={handleRetake}
              questions={quiz.questions}
              submission={displaySubmission}
            />
          ) : (
            <QuizTaking
              instructions={quiz.instructions}
              onSubmissionComplete={handleSubmissionComplete}
              questions={quiz.questions.map((q) => ({
                question: q.question,
                options: q.options.map((opt) => ({
                  text: opt.text,
                })),
                points: q.points,
              }))}
              quizId={quizId}
              timerMinutes={quiz.timerMinutes}
              timerSeconds={quiz.timerSeconds}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

