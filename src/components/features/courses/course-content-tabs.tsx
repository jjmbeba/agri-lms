"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import { CourseContentManagement } from "./course-content-management";

const CourseContentTabs = ({ courseId }: { courseId: string }) => {
  const { data: publishedData } =
    trpc.modules.getModulesByLatestVersionId.useQuery(courseId);
  const { data: draftData } =
    trpc.modules.getDraftModulesByCourseId.useQuery(courseId);
  return (
    <Tabs defaultValue="published">
      <TabsList>
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="draft">Draft</TabsTrigger>
      </TabsList>
      <TabsContent value="published">
        <CourseContentManagement data={publishedData ?? []} type="published" />
      </TabsContent>
      <TabsContent value="draft">
        <CourseContentManagement data={draftData ?? []} type="draft" />
      </TabsContent>
    </Tabs>
  );
};

export default CourseContentTabs;
