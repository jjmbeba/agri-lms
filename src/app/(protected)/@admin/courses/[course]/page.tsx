import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseContentTabs from "@/components/features/admin/courses/course-content-tabs";
import CourseDetails from "@/components/features/admin/courses/course-details";
import { api } from "../../../../../../convex/_generated/api";

type CourseDetailsPageProps = {
  params: {
    course: string;
  };
};

export async function generateMetadata({
  params,
}: CourseDetailsPageProps): Promise<Metadata> {
  // read route params
  const { course: slug } = await params;

  // fetch data
  const courseData = await fetchQuery(api.courses.getCourseBySlug, {
    slug,
  });

  return {
    title: courseData?.course.title,
  };
}

const CourseDetailsPage = async ({ params }: CourseDetailsPageProps) => {
  const { course: slug } = await params;

  const courseData = await fetchQuery(api.courses.getCourseBySlug, {
    slug,
  });

  if (!courseData) {
    notFound();
  }

  const preloadedCourse = await preloadQuery(api.courses.getCourseBySlug, {
    slug,
  });

  if (!preloadedCourse) {
    notFound();
  }

  const courseId = courseData.course._id;
  const courseSlug = courseData.course.slug;

  return (
    <div className="space-y-6 p-6">
      <CourseDetails preloadedCourse={preloadedCourse} />
      <CourseContentTabs courseId={String(courseId)} courseSlug={courseSlug} />
    </div>
  );
};

export default CourseDetailsPage;
