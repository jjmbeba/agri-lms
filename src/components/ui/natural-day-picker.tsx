"use client";

import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type NaturalDayPickerProps = {
  onValueChange: (value: string) => void;
  value: string;
  label: string;
};

export function NaturalDayPicker({
  onValueChange,
  value,
  label,
}: NaturalDayPickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    parseDate(value) || undefined
  );

  const [month, setMonth] = useState<Date | undefined>(date);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <Input
          className="bg-background pr-10"
          id="due-date"
          onChange={(e) => {
            onValueChange(e.target.value);
            const parsedDate = parseDate(e.target.value);
            if (parsedDate) {
              setDate(parsedDate);
              setMonth(date);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          placeholder="Tomorrow or next week"
          value={value}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="-translate-y-1/2 absolute top-1/2 right-2 size-6"
              id="date-picker"
              variant="ghost"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto overflow-hidden p-0">
            <Calendar
              captionLayout="dropdown"
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                onValueChange(formatDate(selectedDate));
                setOpen(false);
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="px-1 text-muted-foreground text-sm">
        {label} on <span className="font-medium">{formatDate(date)}</span>.
      </div>
    </div>
  );
}
