"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import { CourseContentManagement } from "./course-content-management";

const CourseContentTabs = ({ courseId }: { courseId: string }) => {
  const { data: publishedData, isLoading: isLoadingPublished } =
    trpc.modules.getModulesByLatestVersionId.useQuery(courseId);
  const { data: draftData, isLoading: isLoadingDraft } =
    trpc.modules.getDraftModulesByCourseId.useQuery(courseId);

  return (
    <Tabs defaultValue="published">
      <TabsList>
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="draft">Draft</TabsTrigger>
      </TabsList>
      <TabsContent value="published">
        {isLoadingPublished ? (
          <div>Loading...</div>
        ) : (
          <CourseContentManagement
            courseId={courseId}
            data={publishedData ?? []}
          />
        )}
      </TabsContent>
      <TabsContent value="draft">
        {isLoadingDraft ? (
          <div>Loading...</div>
        ) : (
          <CourseContentManagement courseId={courseId} data={draftData ?? []} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CourseContentTabs;
