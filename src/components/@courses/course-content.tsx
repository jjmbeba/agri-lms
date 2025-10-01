import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Id } from "../../../convex/_generated/dataModel";

type CourseContentItem = {
  _id: Id<"module">;
  title: string;
  description: string;
  position: number;
  content: Array<{
    type: string;
    title: string;
    orderIndex: number;
    position: number;
  }>;
};

type CourseContentProps = {
  modulesCount: number;
  modules?: CourseContentItem[];
};

export const CourseContent = ({
  modulesCount,
  modules = [],
}: CourseContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          This course contains {modulesCount} module
          {modulesCount === 1 ? "" : "s"}.
        </p>
        {modules.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-md border">
            {modules.map((m) => {
              const itemsCount = m.content?.length ?? 0;
              return (
                <li
                  className="flex items-start justify-between gap-4 p-4"
                  key={m._id}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {m.position}. {m.title}
                    </p>
                    {m.description ? (
                      <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                        {m.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs">
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
