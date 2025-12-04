"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { NotesEditor } from "./notes-editor";

type NotesEditorPageProps = {
  contentId: Id<"draftModuleContent">;
  courseSlug: string;
  initialContent: string;
  initialTitle: string;
};

export function NotesEditorPage({
  contentId,
  courseSlug,
  initialContent,
  initialTitle,
}: NotesEditorPageProps) {
  const router = useRouter();

  const { mutate: updateContent, isPending } = useMutation({
    mutationFn: useConvexMutation(api.modules.updateDraftModuleContentById),
    onSuccess: () => {
      toast.success("Notes saved successfully");
      router.push(`/courses/${courseSlug}`);
    },
    onError: (error) => {
      toast.error(
        `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    },
  });

  const handleSave = (content: string) => {
    updateContent({
      contentId,
      content,
    });
  };

  const handleCancel = () => {
    router.push(`/admin/courses/${courseSlug}` as never);
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-background p-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <Link
            className="text-muted-foreground hover:text-foreground"
            href={`/courses/${courseSlug}`}
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-xl">Edit Notes</h1>
            <p className="text-muted-foreground text-sm">{initialTitle}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-7xl p-4">
          <NotesEditor
            initialContent={initialContent}
            isSaving={isPending}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      </main>
    </div>
  );
}
