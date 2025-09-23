"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import PublishModulesBtn from "../modules/publish-modules-btn";
import { CourseContentManagement } from "./course-content-management";

const CourseContentTabs = ({ courseId }: { courseId: string }) => {
  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    refetch: refetchPublished,
  } = trpc.modules.getModulesByLatestVersionId.useQuery(courseId);
  const {
    data: draftData,
    isLoading: isLoadingDraft,
    refetch: refetchDraft,
  } = trpc.modules.getDraftModulesByCourseId.useQuery(courseId);

  const handlePublishSuccess = () => {
    // Refetch both published and draft data
    refetchPublished();
    refetchDraft();
  };

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
            variant="published"
          />
        )}
      </TabsContent>
      <TabsContent value="draft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Draft Modules</h3>
          <PublishModulesBtn
            courseId={courseId}
            disabled={!draftData || draftData.length === 0}
            onSuccess={handlePublishSuccess}
          />
        </div>
        {isLoadingDraft ? (
          <div>Loading...</div>
        ) : (
          <CourseContentManagement
            courseId={courseId}
            data={draftData ?? []}
            variant="draft"
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CourseContentTabs;
