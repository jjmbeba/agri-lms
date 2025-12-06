"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
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
import { api } from "../../../../../convex/_generated/api";

export const description = "New enrollments over time (last 90 days)";

type EnrollmentPoint = {
  date: string;
  count: number;
};

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const { data } = useSuspenseQuery(
    convexQuery(api.dashboardEnrollments.getEnrollmentsTimeseries, {})
  );

  const chartData: EnrollmentPoint[] = data ?? [];
  const isEmpty = !chartData || chartData.length === 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Learning Activity</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            New enrollments (last 90 days)
          </span>
          <span className="@[540px]/card:hidden">Enrollments</span>
        </CardDescription>
        <CardAction />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isEmpty ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            No enrollment data yet.
          </div>
        ) : (
          <ChartContainer
            className="aspect-auto h-[250px] w-full"
            config={chartConfig}
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillEnrollments" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-enrollments, hsl(var(--primary)))"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-enrollments, hsl(var(--primary)))"
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
                dataKey="count"
                fill="url(#fillEnrollments)"
                stroke="var(--color-enrollments, hsl(var(--primary)))"
                type="natural"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
