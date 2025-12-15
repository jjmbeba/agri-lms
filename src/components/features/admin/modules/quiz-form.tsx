"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { QuizQuestion } from "./types";

type QuizFormProps = {
  value: {
    questions?: QuizQuestion[];
    timerMinutes?: number;
    timerSeconds?: number;
    instructions?: string;
  };
  onChange: (value: {
    questions?: QuizQuestion[];
    timerMinutes?: number;
    timerSeconds?: number;
    instructions?: string;
  }) => void;
  errors?: string[];
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const TIMER_MIN_VALUE = 0;
const TIMER_MAX_VALUE = 59;
const ASCII_CODE_A = 65;

const QuizForm = ({ value, onChange, errors = [] }: QuizFormProps) => {
  const questions = value.questions ?? [];
  const [hasTimer, setHasTimer] = useState(
    Boolean(value.timerMinutes || value.timerSeconds)
  );

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: "",
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
      points: 1,
    };
    onChange({
      ...value,
      questions: [...questions, newQuestion],
    });
  };

  const removeQuestion = (questionId: string) => {
    const newQuestions = questions.filter((q) => q.id !== questionId);
    onChange({
      ...value,
      questions: newQuestions,
    });
  };

  const updateQuestion = (
    questionId: string,
    field: keyof QuizQuestion,
    fieldValue: unknown
  ) => {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return;
    }
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: fieldValue,
    };
    onChange({
      ...value,
      questions: newQuestions,
    });
  };

  const updateQuestionText = (questionId: string, text: string) => {
    updateQuestion(questionId, "question", text);
  };

  const updateQuestionPoints = (questionId: string, points: number) => {
    const pointsValue = Number.isNaN(points) ? 0 : Math.max(0, points);
    updateQuestion(questionId, "points", pointsValue);
  };

  const addOption = (questionId: string) => {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return;
    }
    const question = questions[questionIndex];
    if (question.options.length >= MAX_OPTIONS) {
      return;
    }
    const newOptions = [
      ...question.options,
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ];
    updateQuestion(questionId, "options", newOptions);
  };

  const removeOption = (questionId: string, optionId: string) => {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return;
    }
    const question = questions[questionIndex];
    if (question.options.length <= MIN_OPTIONS) {
      return;
    }
    const optionToRemove = question.options.find((opt) => opt.id === optionId);
    const hadCorrectAnswer = optionToRemove?.isCorrect;
    const newOptions = question.options.filter((opt) => opt.id !== optionId);
    // If we removed the correct answer, mark the first option as correct
    if (hadCorrectAnswer && newOptions.length > 0) {
      newOptions[0] = { ...newOptions[0], isCorrect: true };
    }
    updateQuestion(questionId, "options", newOptions);
  };

  const updateOptionText = (
    questionId: string,
    optionId: string,
    text: string
  ) => {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return;
    }
    const question = questions[questionIndex];
    const newOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    updateQuestion(questionId, "options", newOptions);
  };

  const setCorrectAnswer = (questionId: string, optionId: string) => {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return;
    }
    const question = questions[questionIndex];
    const newOptions = question.options.map((opt) => ({
      ...opt,
      isCorrect: opt.id === optionId,
    }));
    updateQuestion(questionId, "options", newOptions);
  };

  const handleTimerToggle = (checked: boolean) => {
    setHasTimer(checked);
    if (checked) {
      onChange({
        ...value,
        timerMinutes: value.timerMinutes ?? 0,
        timerSeconds: value.timerSeconds ?? 0,
      });
    } else {
      onChange({
        ...value,
        timerMinutes: undefined,
        timerSeconds: undefined,
      });
    }
  };

  const updateTimerMinutes = (minutes: number) => {
    const minutesValue = Number.isNaN(minutes)
      ? TIMER_MIN_VALUE
      : Math.max(
          TIMER_MIN_VALUE,
          Math.min(TIMER_MAX_VALUE, Math.floor(minutes))
        );
    onChange({
      ...value,
      timerMinutes: minutesValue,
    });
  };

  const updateTimerSeconds = (seconds: number) => {
    const secondsValue = Number.isNaN(seconds)
      ? TIMER_MIN_VALUE
      : Math.max(
          TIMER_MIN_VALUE,
          Math.min(TIMER_MAX_VALUE, Math.floor(seconds))
        );
    onChange({
      ...value,
      timerSeconds: secondsValue,
    });
  };

  const maxScore = questions.reduce((sum, q) => sum + (q.points ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">Quiz Questions</h4>
          <p className="text-muted-foreground text-xs">
            {questions.length} question{questions.length !== 1 ? "s" : ""} • Max
            Score: {maxScore} points
          </p>
        </div>
        <Button onClick={addQuestion} size="sm" type="button" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No questions added yet. Click "Add Question" to get started.
          </p>
        </div>
      )}

      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          {questions.map((question, questionIndex) => (
            <div className="rounded-lg border bg-card p-4" key={question.id}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <Label className="mb-2 block font-medium text-sm">
                    Question {questionIndex + 1}
                  </Label>
                  <Textarea
                    onChange={(e) =>
                      updateQuestionText(question.id, e.target.value)
                    }
                    placeholder="Enter your question here..."
                    rows={2}
                    value={question.question}
                  />
                </div>
                {questions.length > 1 && (
                  <Button
                    onClick={() => removeQuestion(question.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mb-4 flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor={`points-${question.id}`}>Points</Label>
                  <Input
                    id={`points-${question.id}`}
                    min="0"
                    onChange={(e) => {
                      const points = Number.parseFloat(e.target.value) || 0;
                      updateQuestionPoints(question.id, points);
                    }}
                    step="0.5"
                    type="number"
                    value={question.points}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-sm">Options</Label>
                  {question.options.length < MAX_OPTIONS && (
                    <Button
                      onClick={() => addOption(question.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Option
                    </Button>
                  )}
                </div>

                {question.options.map((option, optionIndex) => (
                  <div
                    className="flex items-start gap-2 rounded-md border p-2"
                    key={option.id}
                  >
                    <div className="mt-1">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={() =>
                          setCorrectAnswer(question.id, option.id)
                        }
                      />
                    </div>
                    <Input
                      className="flex-1"
                      onChange={(e) =>
                        updateOptionText(question.id, option.id, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(
                        ASCII_CODE_A + optionIndex
                      )}`}
                      value={option.text}
                    />
                    {question.options.length > MIN_OPTIONS && (
                      <Button
                        onClick={() => removeOption(question.id, option.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {question.options.length < MIN_OPTIONS && (
                  <p className="text-destructive text-xs">
                    Each question must have at least {MIN_OPTIONS} options
                  </p>
                )}

                {!question.options.some((opt) => opt.isCorrect) && (
                  <p className="text-destructive text-xs">
                    Please mark the correct answer
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-4 border-t pt-4">
        <div className="space-y-2">
          <Label>Instructions</Label>
          <Textarea
            onChange={(e) =>
              onChange({
                ...value,
                instructions: e.target.value,
              })
            }
            placeholder="Enter quiz instructions or description..."
            rows={3}
            value={value.instructions ?? ""}
          />
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error) => (
                <FormError key={error} message={error} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={hasTimer}
              id="enable-timer"
              onCheckedChange={handleTimerToggle}
            />
            <Label
              className="cursor-pointer font-medium text-sm"
              htmlFor="enable-timer"
            >
              Enable Timer
            </Label>
          </div>

          {hasTimer && (
            <div className="ml-6 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timer-minutes">Minutes (0-59)</Label>
                <Input
                  id="timer-minutes"
                  max="59"
                  min="0"
                  onChange={(e) => {
                    const minutes = Number.parseInt(e.target.value, 10) || 0;
                    updateTimerMinutes(minutes);
                  }}
                  type="number"
                  value={value.timerMinutes ?? 0}
                />
              </div>
              <div>
                <Label htmlFor="timer-seconds">Seconds (0-59)</Label>
                <Input
                  id="timer-seconds"
                  max="59"
                  min="0"
                  onChange={(e) => {
                    const seconds = Number.parseInt(e.target.value, 10) || 0;
                    updateTimerSeconds(seconds);
                  }}
                  type="number"
                  value={value.timerSeconds ?? 0}
                />
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">
                  Timer: {String(value.timerMinutes ?? 0).padStart(2, "0")}:
                  {String(value.timerSeconds ?? 0).padStart(2, "0")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
