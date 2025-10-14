import { preloadQuery } from "convex/nextjs";
import { ModuleDetails } from "@/components/features/learner/courses/module-details";
import { api } from "../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";

type ModulePageProps = {
  params: { course: string; module: string };
};

const Page = async ({ params }: ModulePageProps) => {
  const { course: courseId, module: moduleId } = await params;

  const preloaded = await preloadQuery(api.modules.getModuleWithContentById, {
    id: moduleId as Id<"module">,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <ModuleDetails
        courseId={courseId as Id<"course">}
        moduleId={moduleId as Id<"module">}
        preloadedModule={preloaded}
      />
    </div>
  );
};

export default Page;
