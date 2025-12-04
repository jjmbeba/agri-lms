import { fetchQuery, preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { ModuleContentDetails } from "@/components/features/learner/courses/module-content-details";
import { api } from "../../../../../../../../../../convex/_generated/api";

type ModuleContentPageProps = {
  params: { course: string; module: string; content: string };
};

const Page = async ({ params }: ModuleContentPageProps) => {
  const { course: courseSlug, module: moduleSlug, content: contentSlug } =
    await params;

  const contentData = await fetchQuery(api.modules.getModuleContentBySlug, {
    courseSlug,
    moduleSlug,
    contentSlug,
  });

  if (!contentData) {
    notFound();
  }

  const preloaded = await preloadQuery(api.modules.getModuleContentBySlug, {
    courseSlug,
    moduleSlug,
    contentSlug,
  });

  if (!preloaded) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <ModuleContentDetails
        courseSlug={courseSlug}
        moduleSlug={moduleSlug}
        contentSlug={contentSlug}
        preloadedContent={preloaded}
      />
    </div>
  );
};

export default Page;

