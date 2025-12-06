"use client";

import {
  IconBook,
  IconCurrencyDollar,
  IconPlant,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";

const formatNumber = (value: number) => value.toLocaleString("en-US");

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function SectionCards() {
  const stats = useQuery(api.dashboard.getAdminDashboardStats, {});

  const isLoading = stats === undefined;
  const totalLearners = stats?.totalLearners ?? 0;
  const publishedCourses = stats?.publishedCourses ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const totalRevenueCents = stats?.totalRevenueCents ?? 0;

  const getBadgeLabel = (label: string) => (isLoading ? "Loading..." : label);

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="size-4 text-green-600" />
            Total Learners
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {isLoading ? "…" : formatNumber(totalLearners)}
          </CardTitle>
          <CardAction>
            <Badge
              className="border-green-200 text-green-700"
              variant="outline"
            >
              <IconTrendingUp className="size-3" />
              {getBadgeLabel("Lifetime")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique learners enrolled{" "}
            <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            Tracks total unique user enrollments
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBook className="size-4 text-blue-600" />
            Published Courses
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {isLoading ? "…" : formatNumber(publishedCourses)}
          </CardTitle>
          <CardAction>
            <Badge className="border-blue-200 text-blue-700" variant="outline">
              <IconTrendingUp className="size-3" />
              {getBadgeLabel("Live")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Courses available to learners{" "}
            <IconTrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="text-muted-foreground">
            Count of published course catalog
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconPlant className="size-4 text-emerald-600" />
            Course Reviews
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {isLoading ? "…" : formatNumber(totalReviews)}
          </CardTitle>
          <CardAction>
            <Badge
              className="border-emerald-200 text-emerald-700"
              variant="outline"
            >
              <IconTrendingUp className="size-3" />
              {getBadgeLabel("Feedback")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Learner feedback submitted{" "}
            <IconTrendingUp className="size-4 text-emerald-600" />
          </div>
          <div className="text-muted-foreground">
            Total course reviews across the platform
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCurrencyDollar className="size-4 text-amber-600" />
            Monthly Revenue
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {isLoading ? "…" : formatCurrency(totalRevenueCents)}
          </CardTitle>
          <CardAction>
            <Badge
              className="border-amber-200 text-amber-700"
              variant="outline"
            >
              <IconTrendingUp className="size-3" />
              {getBadgeLabel("Lifetime")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenue from successful payments{" "}
            <IconTrendingUp className="size-4 text-amber-600" />
          </div>
          <div className="text-muted-foreground">
            Sums verified transactions in Convex
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
