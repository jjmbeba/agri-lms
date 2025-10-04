import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { CoursesGrid } from "../../../../components/features/learner/courses/courses-grid";
import { CoursesHeader } from "../../../../components/features/learner/courses/courses-header";

const Page = async () => {
  const preloadedCourses = await preloadQuery(
    api.courses.getPublishedCourses,
    {}
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <CoursesHeader />
      <CoursesGrid preloadedCourses={preloadedCourses} />
    </div>
  );
};

export default Page;
