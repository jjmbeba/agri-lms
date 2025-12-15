"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { displayToastError } from "@/lib/utils";
import type { QuizAnswer } from "@/types/quiz";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

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
  answers: Map<number, number>;
  timeRemaining: number | null;
  startTime: number | null;
  onAnswersChange: (answers: Map<number, number>) => void;
  onSubmissionComplete: (submissionId: Id<"quizSubmission">) => void;
};

export function QuizTaking({
  quizId,
  questions,
  timerMinutes,
  timerSeconds,
  instructions,
  answers,
  timeRemaining,
  startTime,
  onAnswersChange,
  onSubmissionComplete,
}: QuizTakingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasTimer = Boolean(timerMinutes || timerSeconds);

  type SubmitQuizResult = {
    submissionId: Id<"quizSubmission">;
    score: number;
    maxScore: number;
    percentage: number;
    attemptNumber: number;
  };

  const { mutate: submitQuiz } = useMutation({
    mutationFn: useConvexMutation(api.quizzes.submitQuiz),
    onSuccess: (result: SubmitQuizResult) => {
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
    const newAnswers = new Map(answers);
    newAnswers.set(questionIndex, optionIndex);
    onAnswersChange(newAnswers);
  };

  const MILLISECONDS_PER_SECOND = 1000;
  const SECONDS_PER_MINUTE = 60;
  const LOW_TIME_THRESHOLD_SECONDS = 60;
  const PERCENT_MULTIPLIER = 100;

  const handleSubmit = useCallback(
    (isAutoSubmit = false) => {
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
          // If auto-submit and question not answered, use first option by default
          answersArray.push({
            questionIndex: i,
            selectedOptionIndex: 0,
          });
        } else {
          answersArray.push({
            questionIndex: i,
            selectedOptionIndex: selectedIndex,
          });
        }
      }

      // Calculate time spent (accounting for paused time if needed)
      const timeSpent =
        startTime !== null
          ? Math.floor((Date.now() - startTime) / MILLISECONDS_PER_SECOND)
          : undefined;

      submitQuiz({
        quizId,
        answers: answersArray,
        timeSpentSeconds: timeSpent,
      });
    },
    [answers, isSubmitting, questions, quizId, startTime, submitQuiz]
  );

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitting) {
      handleSubmit(true);
    }
  }, [timeRemaining, isSubmitting, handleSubmit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / SECONDS_PER_MINUTE);
    const secs = seconds % SECONDS_PER_MINUTE;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const allQuestionsAnswered = answers.size === questions.length;
  const progress =
    questions.length > 0
      ? (answers.size / questions.length) * PERCENT_MULTIPLIER
      : 0;
  const isTimeLow =
    timeRemaining !== null &&
    timeRemaining <= LOW_TIME_THRESHOLD_SECONDS &&
    timeRemaining > 0;

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
              className={`font-mono font-semibold text-lg ${
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
            Less than 1 minute remaining! Quiz will auto-submit when time runs
            out.
          </AlertDescription>
        </Alert>
      )}

      {/* Questions */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-6 pr-4">
          {questions.map((question, questionIndex) => {
            const selectedAnswer = answers.get(questionIndex);
            const optionLabelFor = (index: number) =>
              String.fromCharCode("A".charCodeAt(0) + index);

            return (
              <Card key={`${question.question}-${questionIndex}`}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Question {questionIndex + 1} ({question.points} point
                    {question.points !== 1 ? "s" : ""})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-medium">{question.question}</p>
                  <RadioGroup
                    onValueChange={(value) =>
                      handleAnswerChange(
                        questionIndex,
                        Number.parseInt(value, 10)
                      )
                    }
                    value={
                      selectedAnswer !== undefined
                        ? String(selectedAnswer)
                        : undefined
                    }
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50"
                        key={`${option.text}-${optionIndex}`}
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
                            {optionLabelFor(optionIndex)}.
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
          disabled={
            !allQuestionsAnswered || isSubmitting || timeRemaining === 0
          }
          onClick={() => handleSubmit(false)}
          size="lg"
          type="button"
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
