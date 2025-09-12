import {
  IconBook,
  IconCurrencyDollar,
  IconPlant,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="size-4 text-green-600" />
            Total Students
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            2,847
          </CardTitle>
          <CardAction>
            <Badge
              className="border-green-200 text-green-700"
              variant="outline"
            >
              <IconTrendingUp className="size-3" />
              +18.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growing student enrollment{" "}
            <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            Active learners this semester
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBook className="size-4 text-blue-600" />
            Active Courses
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            156
          </CardTitle>
          <CardAction>
            <Badge className="border-blue-200 text-blue-700" variant="outline">
              <IconTrendingUp className="size-3" />
              +8.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New courses added{" "}
            <IconTrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="text-muted-foreground">
            Including 12 new farm management modules
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconPlant className="size-4 text-emerald-600" />
            Partner Farms
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            89
          </CardTitle>
          <CardAction>
            <Badge
              className="border-emerald-200 text-emerald-700"
              variant="outline"
            >
              <IconTrendingUp className="size-3" />
              +15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expanding farm network{" "}
            <IconTrendingUp className="size-4 text-emerald-600" />
          </div>
          <div className="text-muted-foreground">
            Providing hands-on learning opportunities
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
            $45,230
          </CardTitle>
          <CardAction>
            <Badge
              className="border-amber-200 text-amber-700"
              variant="outline"
            >
              <IconTrendingUp className="size-3" />
              +22.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong financial growth{" "}
            <IconTrendingUp className="size-4 text-amber-600" />
          </div>
          <div className="text-muted-foreground">
            Course subscriptions and certifications
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
