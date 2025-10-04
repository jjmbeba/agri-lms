import { preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { CourseDetails } from "../../../../../components/@courses/course-details";

type CoursePageProps = {
  params: { course: string };
};

const Page = async ({ params }: CoursePageProps) => {
  const { course: courseId } = await params;
  const preloaded = await preloadQuery(api.courses.getCourse, {
    id: courseId as Id<"course">,
  });

  if (!preloaded) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <CourseDetails preloadedCourse={preloaded} />
    </div>
  );
};

export default Page;
