import { Separator } from "@/components/ui/separator";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import EnrollCourseBtn from "./enroll-course-btn";

type CourseHeaderProps = {
  course: {
    course: Doc<"course">;
    department: Doc<"department"> | null;
    isEnrolled: boolean;
  };
};

export const CourseHeader = ({ course }: CourseHeaderProps) => {
  const c = course.course;
  const d = course.department;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex-1 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-bold text-2xl tracking-tight">{c.title}</h1>
            </div>
            <p className="text-lg text-muted-foreground">{c.description}</p>
          </div>
          <EnrollCourseBtn
            courseId={c._id}
            isEnrolled={course.isEnrolled}
            priceShillings={c.priceShillings}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Department:</span>
            <span>{d?.name || "Uncategorized"}</span>
          </div>
          <Separator className="h-4" orientation="vertical" />
          <div className="flex items-center gap-2">
            <span className="font-medium">Created:</span>
            <span>{new Date(c._creationTime).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
