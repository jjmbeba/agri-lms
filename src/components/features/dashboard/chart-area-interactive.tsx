"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export const description = "An interactive area chart";

const TIME_RANGE_90_DAYS = 90;
const TIME_RANGE_30_DAYS = 30;
const TIME_RANGE_7_DAYS = 7;

const chartData = [
  { date: "2024-04-01", online: 185, field: 95 },
  { date: "2024-04-02", online: 142, field: 78 },
  { date: "2024-04-03", online: 198, field: 112 },
  { date: "2024-04-04", online: 234, field: 156 },
  { date: "2024-04-05", online: 287, field: 189 },
  { date: "2024-04-06", online: 312, field: 201 },
  { date: "2024-04-07", online: 245, field: 167 },
  { date: "2024-04-08", online: 356, field: 234 },
  { date: "2024-04-09", online: 178, field: 98 },
  { date: "2024-04-10", online: 267, field: 145 },
  { date: "2024-04-11", online: 298, field: 178 },
  { date: "2024-04-12", online: 334, field: 201 },
  { date: "2024-04-13", online: 289, field: 167 },
  { date: "2024-04-14", online: 156, field: 89 },
  { date: "2024-04-15", online: 189, field: 112 },
  { date: "2024-04-16", online: 223, field: 134 },
  { date: "2024-04-17", online: 378, field: 245 },
  { date: "2024-04-18", online: 345, field: 223 },
  { date: "2024-04-19", online: 267, field: 156 },
  { date: "2024-04-20", online: 198, field: 123 },
  { date: "2024-04-21", online: 234, field: 145 },
  { date: "2024-04-22", online: 289, field: 178 },
  { date: "2024-04-23", online: 312, field: 201 },
  { date: "2024-04-24", online: 356, field: 234 },
  { date: "2024-04-25", online: 298, field: 189 },
  { date: "2024-04-26", online: 178, field: 112 },
  { date: "2024-04-27", online: 367, field: 245 },
  { date: "2024-04-28", online: 234, field: 156 },
  { date: "2024-04-29", online: 289, field: 178 },
  { date: "2024-04-30", online: 345, field: 223 },
  { date: "2024-05-01", online: 198, field: 123 },
  { date: "2024-05-02", online: 312, field: 201 },
  { date: "2024-05-03", online: 267, field: 167 },
  { date: "2024-05-04", online: 378, field: 245 },
  { date: "2024-05-05", online: 423, field: 278 },
  { date: "2024-05-06", online: 456, field: 301 },
  { date: "2024-05-07", online: 345, field: 223 },
  { date: "2024-05-08", online: 189, field: 123 },
  { date: "2024-05-09", online: 234, field: 145 },
  { date: "2024-05-10", online: 312, field: 201 },
  { date: "2024-05-11", online: 356, field: 234 },
  { date: "2024-05-12", online: 289, field: 178 },
  { date: "2024-05-13", online: 198, field: 123 },
  { date: "2024-05-14", online: 423, field: 278 },
  { date: "2024-05-15", online: 456, field: 301 },
  { date: "2024-05-16", online: 378, field: 245 },
  { date: "2024-05-17", online: 489, field: 323 },
  { date: "2024-05-18", online: 345, field: 223 },
  { date: "2024-05-19", online: 234, field: 145 },
  { date: "2024-05-20", online: 198, field: 123 },
  { date: "2024-05-21", online: 156, field: 89 },
  { date: "2024-05-22", online: 178, field: 98 },
  { date: "2024-05-23", online: 298, field: 189 },
  { date: "2024-05-24", online: 334, field: 201 },
  { date: "2024-05-25", online: 267, field: 167 },
  { date: "2024-05-26", online: 223, field: 134 },
  { date: "2024-05-27", online: 423, field: 278 },
  { date: "2024-05-28", online: 267, field: 167 },
  { date: "2024-05-29", online: 156, field: 89 },
  { date: "2024-05-30", online: 345, field: 223 },
  { date: "2024-05-31", online: 198, field: 123 },
  { date: "2024-06-01", online: 198, field: 123 },
  { date: "2024-06-02", online: 456, field: 301 },
  { date: "2024-06-03", online: 178, field: 98 },
  { date: "2024-06-04", online: 423, field: 278 },
  { date: "2024-06-05", online: 156, field: 89 },
  { date: "2024-06-06", online: 334, field: 201 },
  { date: "2024-06-07", online: 367, field: 245 },
  { date: "2024-06-08", online: 378, field: 245 },
  { date: "2024-06-09", online: 423, field: 278 },
  { date: "2024-06-10", online: 198, field: 123 },
  { date: "2024-06-11", online: 156, field: 89 },
  { date: "2024-06-12", online: 489, field: 323 },
  { date: "2024-06-13", online: 178, field: 98 },
  { date: "2024-06-14", online: 423, field: 278 },
  { date: "2024-06-15", online: 345, field: 223 },
  { date: "2024-06-16", online: 378, field: 245 },
  { date: "2024-06-17", online: 456, field: 301 },
  { date: "2024-06-18", online: 178, field: 98 },
  { date: "2024-06-19", online: 345, field: 223 },
  { date: "2024-06-20", online: 423, field: 278 },
  { date: "2024-06-21", online: 198, field: 123 },
  { date: "2024-06-22", online: 334, field: 201 },
  { date: "2024-06-23", online: 456, field: 301 },
  { date: "2024-06-24", online: 198, field: 123 },
  { date: "2024-06-25", online: 223, field: 134 },
  { date: "2024-06-26", online: 423, field: 278 },
  { date: "2024-06-27", online: 456, field: 301 },
  { date: "2024-06-28", online: 198, field: 123 },
  { date: "2024-06-29", online: 178, field: 98 },
  { date: "2024-06-30", online: 423, field: 278 },
];

const chartConfig = {
  learners: {
    label: "Learners",
  },
  online: {
    label: "Online Learning",
    color: "hsl(var(--primary))",
  },
  field: {
    label: "Field Training",
    color: "hsl(142, 76%, 36%)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("90d");

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = TIME_RANGE_90_DAYS;
    if (timeRange === "30d") {
      daysToSubtract = TIME_RANGE_30_DAYS;
    } else if (timeRange === "7d") {
      daysToSubtract = TIME_RANGE_7_DAYS;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Learning Activity</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Student engagement across learning modes
          </span>
          <span className="@[540px]/card:hidden">Learning engagement</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            className="*:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex hidden"
            onValueChange={setTimeRange}
            type="single"
            value={timeRange}
            variant="outline"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger
              aria-label="Select a value"
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem className="rounded-lg" value="90d">
                Last 3 months
              </SelectItem>
              <SelectItem className="rounded-lg" value="30d">
                Last 30 days
              </SelectItem>
              <SelectItem className="rounded-lg" value="7d">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOnline" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-online)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-online)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillField" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-field)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-field)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="field"
              fill="url(#fillField)"
              stackId="a"
              stroke="var(--color-field)"
              type="natural"
            />
            <Area
              dataKey="online"
              fill="url(#fillOnline)"
              stackId="a"
              stroke="var(--color-online)"
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
