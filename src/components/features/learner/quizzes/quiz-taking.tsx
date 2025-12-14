"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { displayToastError } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { QuizAnswer } from "../../../../../types/quiz";

type QuizTakingProps = {
  quizId: Id<"quiz">;
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
  instructions?: string;
  onSubmissionComplete: (submissionId: Id<"quizSubmission">) => void;
};

export function QuizTaking({
  quizId,
  questions,
  timerMinutes,
  timerSeconds,
  instructions,
  onSubmissionComplete,
}: QuizTakingProps) {
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const hasTimer = Boolean(timerMinutes || timerSeconds);
  const totalSeconds = hasTimer
    ? (timerMinutes ?? 0) * 60 + (timerSeconds ?? 0)
    : null;

  // Initialize timer
  useEffect(() => {
    if (totalSeconds !== null) {
      setTimeRemaining(totalSeconds);
      setStartTime(Date.now());
    }
  }, [totalSeconds]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeRemaining]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitting) {
      handleSubmit(true);
    }
  }, [timeRemaining, isSubmitting]);

  const { mutate: submitQuiz } = useMutation({
    mutationFn: useConvexMutation(api.quizzes.submitQuiz),
    onSuccess: (result) => {
      toast.success("Quiz submitted successfully");
      setIsSubmitting(false);
      onSubmissionComplete(result.submissionId);
    },
    onError: (error) => {
      displayToastError(error);
      setIsSubmitting(false);
    },
  });

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionIndex, optionIndex);
      return newAnswers;
    });
  };

  const handleSubmit = (isAutoSubmit = false) => {
    if (isSubmitting) {
      return;
    }

    // Only validate for manual submissions
    if (!isAutoSubmit && answers.size !== questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    if (isAutoSubmit) {
      toast.warning("Time's up! Quiz will be submitted automatically.");
    }

    setIsSubmitting(true);

    // Convert answers map to array format
    const answersArray: QuizAnswer[] = [];
    for (let i = 0; i < questions.length; i++) {
      const selectedIndex = answers.get(i);
      if (selectedIndex === undefined) {
        // If auto-submit and question not answered, use -1 or first option
        answersArray.push({
          questionIndex: i,
          selectedOptionIndex: 0, // Default to first option if not answered
        });
      } else {
        answersArray.push({
          questionIndex: i,
          selectedOptionIndex: selectedIndex,
        });
      }
    }

    // Calculate time spent
    const timeSpent =
      startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : undefined;

    submitQuiz({
      quizId,
      answers: answersArray,
      timeSpentSeconds: timeSpent,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const allQuestionsAnswered = answers.size === questions.length;
  const progress = questions.length > 0 ? (answers.size / questions.length) * 100 : 0;
  const isTimeLow = timeRemaining !== null && timeRemaining <= 60 && timeRemaining > 0;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Timer and Progress */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {answers.size} / {questions.length} answered
            </span>
          </div>
          <Progress value={progress} />
        </div>
        {hasTimer && timeRemaining !== null && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
              isTimeLow ? "border-destructive bg-destructive/10" : ""
            }`}
          >
            <Clock
              className={`h-5 w-5 ${
                isTimeLow ? "text-destructive" : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono text-lg font-semibold ${
                isTimeLow ? "text-destructive" : ""
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Time warning */}
      {isTimeLow && timeRemaining !== null && timeRemaining > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Less than 1 minute remaining! Quiz will auto-submit when time runs out.
          </AlertDescription>
        </Alert>
      )}

      {/* Questions */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-6 pr-4">
          {questions.map((question, questionIndex) => {
            const selectedAnswer = answers.get(questionIndex);
            const optionLabels = ["A", "B", "C", "D", "E", "F"];

            return (
              <Card key={questionIndex}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Question {questionIndex + 1} ({question.points} point
                    {question.points !== 1 ? "s" : ""})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-medium">{question.question}</p>
                  <RadioGroup
                    value={
                      selectedAnswer !== undefined
                        ? String(selectedAnswer)
                        : undefined
                    }
                    onValueChange={(value) =>
                      handleAnswerChange(questionIndex, Number.parseInt(value, 10))
                    }
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50"
                      >
                        <RadioGroupItem
                          id={`q${questionIndex}-opt${optionIndex}`}
                          value={String(optionIndex)}
                        />
                        <Label
                          className="flex-1 cursor-pointer font-normal"
                          htmlFor={`q${questionIndex}-opt${optionIndex}`}
                        >
                          <span className="mr-2 font-semibold">
                            {optionLabels[optionIndex]}.
                          </span>
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Submit Button */}
      <div className="flex items-center justify-end border-t pt-4">
        <Button
          disabled={!allQuestionsAnswered || isSubmitting || timeRemaining === 0}
          onClick={() => handleSubmit(false)}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Quiz"
          )}
        </Button>
      </div>
    </div>
  );
}

