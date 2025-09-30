import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type CourseCardProps = {
  data: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
  };
};

export const CourseCard = ({ data }: CourseCardProps) => {
  const c = data.course;
  const d = data.department;

  return (
    <Card className="group transition-shadow hover:shadow-lg" key={c._id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link
              aria-label={`View course ${c.title}`}
              href={`/courses/${c._id}`}
            >
              <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                {c.title}
              </CardTitle>
            </Link>
            <div className="mt-1 text-muted-foreground text-xs">{d?.name}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-muted-foreground text-sm">
          {c.description}
        </p>
        <Separator />
        <div className="flex items-center justify-end">
          <Button aria-label={`Open ${c.title}`} asChild size="sm">
            <Link href={`/courses/${c._id}`}>View details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
