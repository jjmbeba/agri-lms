import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Id } from "../../../../../convex/_generated/dataModel";

type CourseContentItem = {
  _id: Id<"module">;
  title: string;
  description: string;
  position: number;
  content: Array<{
    type: string;
    title: string;
    content?: string;
    orderIndex: number;
    position: number;
  }>;
};

type CourseContentProps = {
  modulesCount: number;
  modules?: CourseContentItem[];
  isEnrolled: boolean;
};

export const CourseContent = ({
  modulesCount,
  modules = [],
  isEnrolled,
}: CourseContentProps) => {
  if (!isEnrolled) {
    return (
      <GeneralCourseContent modules={modules} modulesCount={modulesCount} />
    );
  }

  return (
    <DetailedCourseContent modules={modules} modulesCount={modulesCount} />
  );
};

const GeneralCourseContent = ({
  modules,
  modulesCount,
}: {
  modules: CourseContentItem[];
  modulesCount: number;
}) => {
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

const DetailedCourseContent = ({
  modules,
  modulesCount,
}: {
  modules: CourseContentItem[];
  modulesCount: number;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          You are enrolled. This course contains {modulesCount} module
          {modulesCount === 1 ? "" : "s"}.
        </p>
        {modules.length > 0 && (
          <Accordion
            className="flex flex-col space-y-4"
            collapsible
            type="single"
          >
            {modules
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((m) => {
                const items = (m.content ?? [])
                  .slice()
                  .sort((a, b) => a.position - b.position);
                return (
                  <AccordionItem
                    className="rounded-md border"
                    key={m._id}
                    value={m._id}
                  >
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <AccordionTrigger>
                          <h3 className="font-medium text-sm">
                            {m.position}. {m.title}
                          </h3>
                        </AccordionTrigger>
                        {m.description ? (
                          <p className="mt-1 text-muted-foreground text-xs">
                            {m.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs">
                        {items.length} item{items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <AccordionContent>
                      {items.length > 0 ? (
                        <ol
                          aria-label={`Items in module ${m.position}`}
                          className="divide-y divide-border"
                        >
                          {items.map((it) => (
                            <li
                              className="flex items-start justify-between gap-3 px-4 py-3"
                              key={`${m._id}-${it.position}`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">
                                    &gt; {it.orderIndex + 1}.
                                  </span>{" "}
                                  <span className="font-medium">
                                    {it.title}
                                  </span>
                                </p>
                                {it.type === "text" && it.content ? (
                                  <p className="mt-1 text-muted-foreground text-xs">
                                    {it.content}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
                                {it.type}
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div
                          aria-live="polite"
                          className="px-4 pb-4 text-muted-foreground text-xs"
                        >
                          No items yet in this module.
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
