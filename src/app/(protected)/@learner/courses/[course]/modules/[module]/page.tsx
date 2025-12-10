import { fetchQuery, preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { ModuleDetails } from "@/components/features/learner/courses/module-details";
import { api } from "../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";

type ModulePageProps = {
  params: { course: string; module: string };
};

const Page = async ({ params }: ModulePageProps) => {
  const { course: courseSlug, module: moduleSlug } = await params;

  const moduleData = await fetchQuery(api.modules.getModuleBySlug, {
    courseSlug,
    moduleSlug,
  });

  if (!moduleData) {
    notFound();
  }

  // Debug: log video URLs (helps identify unavailable videos)
  const parseVideoUrls = (content?: string): string[] => {
    if (!content) return [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((url) => typeof url === "string" && url.trim())
          .map((url) => url.replace(/^http:\/\//i, "https://"));
      }
    } catch {
      // Not JSON, treat as single url
    }
    return [content].filter(Boolean).map((url) => url.replace(/^http:\/\//i, "https://"));
  };

  const videoUrls =
    moduleData.content
      ?.filter((item) => item.type === "video")
      .flatMap((item) => parseVideoUrls(item.content)) ?? [];

  if (videoUrls.length > 0) {
    console.log(
      "[Module videos]",
      { courseSlug, moduleSlug },
      videoUrls
    );
  }

  const preloaded = await preloadQuery(api.modules.getModuleBySlug, {
    courseSlug,
    moduleSlug,
  });

  if (!preloaded) {
    notFound();
  }

  // Get courseId from the module data by fetching the course version
  const courseVersion = await fetchQuery(api.courses.getCourseBySlug, {
    slug: courseSlug,
  });

  if (!courseVersion) {
    notFound();
  }

  const courseId = courseVersion.course._id as Id<"course">;
  const moduleId = moduleData._id as Id<"module">;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <ModuleDetails
        courseId={courseId}
        courseSlug={courseSlug}
        moduleId={moduleId}
        preloadedModule={preloaded}
      />
    </div>
  );
};

export default Page;
