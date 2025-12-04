import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import { NotesEditorPage } from "@/components/features/admin/modules/notes-editor-page";
import { api } from "../../../../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../../../../convex/_generated/dataModel";

type NotesEditorRouteProps = {
  params: {
    course: string;
    module: string;
    content: string;
  };
};

const Page = async ({ params }: NotesEditorRouteProps) => {
  const {
    course: courseSlug,
    module: moduleSlug,
    content: contentSlug,
  } = await params;

  // Get the course to access courseId
  const courseData = await fetchQuery(api.courses.getCourseBySlug, {
    slug: courseSlug,
  });

  if (!courseData) {
    notFound();
  }

  const courseId = courseData.course._id;

  // Get draft modules for this course
  const draftModules = await fetchQuery(api.modules.getDraftModulesByCourseId, {
    courseId: courseId as Id<"course">,
  });

  // Find the module by slug
  const draftModule = draftModules.find((m) => m.slug === moduleSlug);

  if (!draftModule) {
    notFound();
  }

  // Find the content by slug
  const draftContent = draftModule.content.find((c) => c.slug === contentSlug);

  if (!draftContent) {
    notFound();
  }

  // Only allow editing text content type
  if (draftContent.type !== "text") {
    redirect(`/courses/${courseSlug}`);
  }

  return (
    <NotesEditorPage
      contentId={draftContent._id as Id<"draftModuleContent">}
      courseSlug={courseSlug}
      initialContent={draftContent.content}
      initialTitle={draftContent.title}
    />
  );
};

export default Page;
