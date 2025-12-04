import { fetchQuery, preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { CourseDetails } from "@/components/features/learner/courses/course-details";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

type CoursePageProps = {
  params: { course: string };
};

const Page = async ({ params }: CoursePageProps) => {
  const { course: slug } = await params;

  const courseData = await fetchQuery(api.courses.getCourseBySlug, {
    slug,
  });

  if (!courseData) {
    notFound();
  }

  const preloaded = await preloadQuery(api.courses.getCourseBySlug, {
    slug,
  });

  if (!preloaded) {
    notFound();
  }

  const courseId = courseData.course._id as Id<"course">;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <CourseDetails courseId={courseId} preloadedCourse={preloaded} />
    </div>
  );
};

export default Page;
