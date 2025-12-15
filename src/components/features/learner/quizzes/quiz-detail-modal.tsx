"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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

type QuizTimeLimitCardProps = {
  timerMinutes?: number | null;
  timerSeconds?: number | null;
};

function QuizTimeLimitCard({
  timerMinutes,
  timerSeconds,
}: QuizTimeLimitCardProps) {
  const hasTimeLimit =
    timerMinutes !== undefined && timerMinutes !== null
      ? true
      : timerSeconds !== undefined && timerSeconds !== null;

  if (!hasTimeLimit) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-muted-foreground text-sm">
          Time Limit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">
          {String(timerMinutes ?? 0).padStart(2, "0")}:
          {String(timerSeconds ?? 0).padStart(2, "0")}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuizDetailModal({
  quizId,
  isOpen,
  onClose,
}: QuizDetailModalProps) {
  const [showResults, setShowResults] = useState(false);
  const [submissionId, setSubmissionId] = useState<Id<"quizSubmission"> | null>(
    null
  );

  // Quiz state that persists across dialog open/close
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number | null>(null);
  const [lastPauseTime, setLastPauseTime] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPausedRef = useRef<boolean>(false);
  const TIMER_TICK_INTERVAL_MS = 1000;
  const MILLISECONDS_PER_SECOND = 1000;

  const { data: quizData } = useSuspenseQuery(
    convexQuery(api.quizzes.getQuizWithSubmissions, { quizId })
  );

  const { quiz, latestSubmission } = quizData;
  const hasSubmission = latestSubmission !== null;

  const hasTimer = Boolean(quiz.timerMinutes || quiz.timerSeconds);
  const totalSeconds = hasTimer
    ? (quiz.timerMinutes ?? 0) * 60 + (quiz.timerSeconds ?? 0)
    : null;

  // Initialize timer when quiz data is available and no timer is set
  useEffect(() => {
    if (totalSeconds !== null && timeRemaining === null && startTime === null) {
      setTimeRemaining(totalSeconds);
      setStartTime(Date.now());
    }
  }, [totalSeconds, timeRemaining, startTime]);

  // Handle timer pause when dialog closes
  useEffect(() => {
    if (!(isOpen || hasPausedRef.current)) {
      // Dialog closed - pause timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (timeRemaining !== null && timeRemaining > 0) {
        setLastPauseTime(Date.now());
        hasPausedRef.current = true;
      }
    }
  }, [isOpen, timeRemaining]);

  // Handle timer resume when dialog opens
  useEffect(() => {
    if (
      isOpen &&
      hasPausedRef.current &&
      timeRemaining !== null &&
      lastPauseTime !== null &&
      startTime !== null &&
      totalSeconds !== null
    ) {
      // Dialog opened - resume timer
      // Calculate how long the dialog was closed (paused duration)
      const now = Date.now();
      const pausedDuration = Math.floor(
        (now - lastPauseTime) / MILLISECONDS_PER_SECOND
      );

      // Calculate total elapsed time since start (accounting for all pauses)
      const totalElapsed =
        Math.floor((now - startTime) / MILLISECONDS_PER_SECOND) -
        (pausedTime ?? 0);
      const remaining = totalSeconds - totalElapsed;

      if (remaining <= 0) {
        // Timer expired while dialog was closed
        setTimeRemaining(0);
        setLastPauseTime(null);
        hasPausedRef.current = false;
      } else if (timeRemaining > 0) {
        // Update remaining time accounting for the pause
        setTimeRemaining(remaining);
        setPausedTime((prev) => (prev ?? 0) + pausedDuration);
        setLastPauseTime(null);
        hasPausedRef.current = false;
      }
    }
  }, [
    isOpen,
    timeRemaining,
    lastPauseTime,
    startTime,
    pausedTime,
    totalSeconds,
  ]);

  // Start timer countdown when dialog is open and timer is active
  useEffect(() => {
    if (!isOpen) {
      // Dialog closed - ensure timer is stopped
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (
      timeRemaining !== null &&
      timeRemaining > 0 &&
      !timerIntervalRef.current
    ) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_TICK_INTERVAL_MS);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isOpen, timeRemaining]);

  const handleSubmissionComplete = (newSubmissionId: Id<"quizSubmission">) => {
    setSubmissionId(newSubmissionId);
    setShowResults(true);
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Reset quiz state
    setAnswers(new Map());
    setTimeRemaining(null);
    setStartTime(null);
    setPausedTime(null);
    setLastPauseTime(null);
    hasPausedRef.current = false;
  };

  const handleRetake = () => {
    setShowResults(false);
    setSubmissionId(null);
    // Reset quiz state for retake
    setAnswers(new Map());
    if (totalSeconds !== null) {
      setTimeRemaining(totalSeconds);
      setStartTime(Date.now());
    } else {
      setTimeRemaining(null);
      setStartTime(null);
    }
    setPausedTime(null);
    setLastPauseTime(null);
    hasPausedRef.current = false;
  };

  const handleClose = () => {
    // Don't reset state on close - preserve it for when dialog reopens
    setShowResults(false);
    setSubmissionId(null);
    onClose();
  };

  const handleAnswersChange = (newAnswers: Map<number, number>) => {
    setAnswers(newAnswers);
  };

  // Get the submission to display (new submission takes priority)
  const matchedSubmission =
    submissionId !== null
      ? (quizData.submissions.find((s) => s._id === submissionId) ?? null)
      : null;

  const displaySubmission = matchedSubmission ?? latestSubmission;

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
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Max Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{quiz.maxScore} points</div>
              </CardContent>
            </Card>
            <QuizTimeLimitCard
              timerMinutes={quiz.timerMinutes}
              timerSeconds={quiz.timerSeconds}
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {quiz.questions.length}
                </div>
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
              answers={answers}
              instructions={quiz.instructions}
              onAnswersChange={handleAnswersChange}
              onSubmissionComplete={handleSubmissionComplete}
              questions={quiz.questions.map((q) => ({
                question: q.question,
                options: q.options.map((opt) => ({
                  text: opt.text,
                })),
                points: q.points,
              }))}
              quizId={quizId}
              startTime={startTime}
              timeRemaining={timeRemaining}
              timerMinutes={quiz.timerMinutes}
              timerSeconds={quiz.timerSeconds}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
