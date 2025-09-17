import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailsHeader } from "@/components/features/courses/course-details-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/server";

type CourseDetailsPageProps = {
  params: {
    course: string;
  };
};

export async function generateMetadata({
  params,
}: CourseDetailsPageProps): Promise<Metadata> {
  // read route params
  const { course } = await params;

  // fetch data
  const [courseData] = await trpc.courses.getCourse(course);

  return {
    title: courseData.course?.title,
  };
}

const CourseDetailsPage = async ({ params }: CourseDetailsPageProps) => {
  const { course: courseId } = await params;
  const courseData = await trpc.courses.getCourse(courseId);

  if (!courseData || courseData.length === 0) {
    notFound();
  }

  const course = courseData[0];

  return (
    <div className="space-y-6 p-6">
      <CourseDetailsHeader course={course} />

      {/* <CourseDetailsStats course={course} /> */}

      <Tabs className="space-y-6" defaultValue="content">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* <TabsContent className="space-y-6" value="content">
          <CourseContentManagement />
        </TabsContent> */}

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
