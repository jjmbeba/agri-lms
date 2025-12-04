"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { GradeDialog } from "../assignments/grade-dialog";
// Id already imported above
import { SubmissionsTable } from "../assignments/submissions-table";
import PublishModulesBtn from "../modules/publish-modules-btn";
import { CourseContentManagement } from "./course-content-management";

const CourseContentTabs = ({
  courseId,
  courseSlug,
}: {
  courseId: string;
  courseSlug: string;
}) => {
  const [gradingSubmissionId, setGradingSubmissionId] =
    useState<Id<"assignmentSubmission"> | null>(null);

  const [isGradeOpen, setIsGradeOpen] = useState(false);

  const { data: publishedData, isLoading: isLoadingPublished } = useQuery(
    convexQuery(api.modules.getModulesByLatestVersionId, {
      courseId: courseId as Id<"course">,
    })
  );
  const { data: draftData, isLoading: isLoadingDraft } = useQuery(
    convexQuery(api.modules.getDraftModulesByCourseId, {
      courseId: courseId as Id<"course">,
    })
  );

  return (
    <Tabs defaultValue="published">
      <TabsList>
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="draft">Draft</TabsTrigger>
        <TabsTrigger value="submissions">Submissions</TabsTrigger>
      </TabsList>
      <TabsContent value="published">
        {isLoadingPublished ? (
          <CourseContentSkeleton />
        ) : (
          <CourseContentManagement
            courseId={courseId}
            courseSlug={courseSlug}
            data={[...(publishedData ?? [])]}
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
          />
        </div>
        {isLoadingDraft ? (
          <CourseContentSkeleton />
        ) : (
          <CourseContentManagement
            courseId={courseId}
            courseSlug={courseSlug}
            data={[...(draftData ?? [])]}
            variant="draft"
          />
        )}
      </TabsContent>
      <TabsContent value="submissions">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Submissions Inbox</h3>
        </div>
        <SubmissionsTable
          courseId={courseId as Id<"course">}
          onGradeClick={(id) => {
            setGradingSubmissionId(id);
            setIsGradeOpen(true);
          }}
          variant="inbox"
        />
        <GradeDialog
          onOpenChange={setIsGradeOpen}
          open={isGradeOpen}
          submissionId={gradingSubmissionId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CourseContentTabs;

const CourseContentSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="w-full max-w-md space-y-2">
            <CardTitle className="text-lg sm:text-xl">
              <Skeleton className="h-5 w-40" />
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 overflow-hidden sm:space-y-4">
          {(["module-1", "module-2", "module-3"] as const).map((moduleKey) => (
            <div className="space-y-2" key={moduleKey}>
              <div className="flex flex-col items-start justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-medium text-xs sm:h-8 sm:w-8 sm:text-sm" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-1/2 sm:w-64" />
                    <Skeleton className="h-4 w-full sm:w-96" />
                    <div className="mt-1 flex items-center gap-2">
                      <Skeleton className="h-5 w-28 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>

              <div className="ml-4 space-y-2 sm:ml-8">
                {["content-1", "content-2"].map((contentKey) => (
                  <div
                    className="flex w-full flex-col items-start justify-between gap-2 rounded-md border-muted border-l-2 bg-muted/30 p-3 sm:flex-row sm:items-center"
                    key={`${moduleKey}-${contentKey}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-full sm:w-80 md:w-[560px]" />
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
