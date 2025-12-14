"use client";

import { useQuery } from "convex/react";
import { CheckCircle, Clock, Eye, Target } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { QuizDetailModal } from "./quiz-detail-modal";

type QuizItemProps = {
  quizId: Id<"quiz">;
  title: string;
  orderIndex: number;
  isCompleted?: boolean;
};

export function QuizItem({
  quizId,
  title,
  orderIndex,
  isCompleted = false,
}: QuizItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const quizData = useQuery(api.quizzes.getQuizWithSubmissions, { quizId });

  if (!quizData) {
    return (
      <li className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs">
              {orderIndex + 1}
            </div>
            <p className="text-sm">
              <span className="font-medium">{title}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
            quiz
          </span>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </li>
    );
  }

  const { quiz, latestSubmission } = quizData;
  const hasSubmission = latestSubmission !== null;
  const hasTimer = Boolean(quiz.timerMinutes || quiz.timerSeconds);

  const getStatusBadge = () => {
    if (!hasSubmission) {
      return (
        <Badge className="text-xs" variant="outline">
          Not Taken
        </Badge>
      );
    }

    return (
      <Badge className="text-xs" variant="secondary">
        Completed
      </Badge>
    );
  };

  const getStatusIcon = () => {
    if (!hasSubmission) {
      return null;
    }

    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const formatTimer = () => {
    if (!hasTimer) {
      return null;
    }
    const minutes = quiz.timerMinutes ?? 0;
    const seconds = quiz.timerSeconds ?? 0;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      <li className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-6 items-center justify-center rounded-full text-xs ${
                isCompleted
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isCompleted ? "✓" : orderIndex + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{title}</span>
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Target className="h-3 w-3" />
                  <span>{quiz.maxScore} pts</span>
                </div>
                {hasTimer && (
                  <>
                    <span className="text-muted-foreground text-xs">•</span>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimer()}</span>
                    </div>
                  </>
                )}
                {hasSubmission && (
                  <>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-muted-foreground text-xs">
                      Score: {latestSubmission.score}/{quiz.maxScore} (
                      {latestSubmission.percentage}%)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
            quiz
          </span>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
          <Button
            className="h-8 px-2"
            onClick={() => setIsModalOpen(true)}
            size="sm"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </li>

      <QuizDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quizId={quizId}
      />
    </>
  );
}

