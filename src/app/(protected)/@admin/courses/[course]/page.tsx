import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseContentTabs from "@/components/features/admin/courses/course-content-tabs";
import CourseDetails from "@/components/features/admin/courses/course-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="space-y-6 p-6">
      <CourseDetails preloadedCourse={preloadedCourse} />
      <Tabs className="space-y-6" defaultValue="content">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students (not implemented)</TabsTrigger>
          <TabsTrigger value="analytics">Analytics (not implemented)</TabsTrigger>
          <TabsTrigger value="settings">Settings (not implemented)</TabsTrigger>
        </TabsList>
        <TabsContent className="space-y-6" value="content">
          <CourseContentTabs courseId={String(courseId)} />
        </TabsContent>
        {/* <TabsContent className="space-y-6" value="students">
          <CourseStudentManagement />
        </TabsContent> */}

        {/* <TabsContent className="space-y-6" value="analytics">
          <div className="py-12 text-center">
            <h3 className="mb-2 font-semibold text-lg">
              Analytics Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Detailed course analytics and insights will be available here.
            </p>
          </div>
        </TabsContent> */}
        {/* <TabsContent className="space-y-6" value="settings">
          <CourseSettings />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default CourseDetailsPage;
