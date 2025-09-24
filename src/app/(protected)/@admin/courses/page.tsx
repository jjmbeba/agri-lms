import { IconBook } from "@tabler/icons-react";
import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { CourseManager } from "@/components/features/courses/course-manager";
import CreateCourseButton from "@/components/features/courses/create-course-btn";
import { api } from "../../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Courses",
};

const CoursesPage = async () => {
  const preloadedCourses = await preloadQuery(api.courses.getCourses, {});

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Section */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <IconBook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl tracking-tight">
                    Course Management
                  </h1>
                  <p className="text-muted-foreground">
                    Manage agricultural courses and track student progress
                  </p>
                </div>
              </div>
              <CreateCourseButton />
            </div>
          </div>

          {/* Course Management Components */}
          <CourseManager preloadedCourses={preloadedCourses} />
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
