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
      question: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      points: 1,
    };
    onChange({
      ...value,
      questions: [...questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onChange({
      ...value,
      questions: newQuestions,
    });
  };

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    fieldValue: unknown
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: fieldValue,
    };
    onChange({
      ...value,
      questions: newQuestions,
    });
  };

  const updateQuestionText = (index: number, text: string) => {
    updateQuestion(index, "question", text);
  };

  const updateQuestionPoints = (index: number, points: number) => {
    const pointsValue = Number.isNaN(points) ? 0 : Math.max(0, points);
    updateQuestion(index, "points", pointsValue);
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options.length >= MAX_OPTIONS) {
      return;
    }
    const newOptions = [...question.options, { text: "", isCorrect: false }];
    updateQuestion(questionIndex, "options", newOptions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options.length <= MIN_OPTIONS) {
      return;
    }
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    // If we removed the correct answer, mark the first option as correct
    const hadCorrectAnswer = question.options[optionIndex]?.isCorrect;
    if (hadCorrectAnswer && newOptions.length > 0) {
      newOptions[0].isCorrect = true;
    }
    updateQuestion(questionIndex, "options", newOptions);
  };

  const updateOptionText = (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => {
    const question = questions[questionIndex];
    const newOptions = [...question.options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      text,
    };
    updateQuestion(questionIndex, "options", newOptions);
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const newOptions = question.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optionIndex,
    }));
    updateQuestion(questionIndex, "options", newOptions);
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
            <div
              className="rounded-lg border bg-card p-4"
              key={`${question.question}-${questionIndex}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <Label className="mb-2 block font-medium text-sm">
                    Question {questionIndex + 1}
                  </Label>
                  <Textarea
                    onChange={(e) =>
                      updateQuestionText(questionIndex, e.target.value)
                    }
                    placeholder="Enter your question here..."
                    rows={2}
                    value={question.question}
                  />
                </div>
                {questions.length > 1 && (
                  <Button
                    onClick={() => removeQuestion(questionIndex)}
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
                  <Label htmlFor={`points-${questionIndex}`}>Points</Label>
                  <Input
                    id={`points-${questionIndex}`}
                    min="0"
                    onChange={(e) => {
                      const points = Number.parseFloat(e.target.value) || 0;
                      updateQuestionPoints(questionIndex, points);
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
                      onClick={() => addOption(questionIndex)}
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
                    key={`${option.text}-${optionIndex}`}
                  >
                    <div className="mt-1">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={() =>
                          setCorrectAnswer(questionIndex, optionIndex)
                        }
                      />
                    </div>
                    <Input
                      className="flex-1"
                      onChange={(e) =>
                        updateOptionText(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                      placeholder={`Option ${String.fromCharCode(
                        ASCII_CODE_A + optionIndex
                      )}`}
                      value={option.text}
                    />
                    {question.options.length > MIN_OPTIONS && (
                      <Button
                        onClick={() => removeOption(questionIndex, optionIndex)}
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
