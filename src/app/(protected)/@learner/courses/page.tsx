import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { CoursesGrid } from "./courses-grid";
import { CoursesHeader } from "./courses-header";

const Page = async () => {
  const preloadedCourses = await preloadQuery(api.courses.getCourses, {});

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <CoursesHeader />
      <CoursesGrid preloadedCourses={preloadedCourses} />
    </div>
  );
};

export default Page;
