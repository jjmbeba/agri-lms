"use client";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { PathwayEditor } from "./pathway-editor";

type PathwayManagerProps = {
  preloadedPathways: Preloaded<typeof api.pathways.getPathways>;
};

export default function PathwayManager({
  preloadedPathways,
}: PathwayManagerProps) {
  const [selected, setSelected] = useState<Doc<"certificationPathway"> | null>(
    null
  );
  const [mode, setMode] = useState<"new" | "edit">("new");
  const pathways = usePreloadedQuery(preloadedPathways);
  const { mutate: deletePathway } = useMutation({
    mutationFn: useConvexMutation(api.pathways.deletePathway),
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleEdit(p: Doc<"certificationPathway">) {
    setSelected(p);
    setMode("edit");
  }
  function handleNew() {
    setSelected(null);
    setMode("new");
  }
  async function handleDelete(id: Id<"certificationPathway">) {
    setDeletingId(id);
    try {
      await deletePathway({ id });
      toast.success("Pathway deleted");
      if (selected && selected._id === id) {
        handleNew();
      }
    } catch (error) {
      toast.error("Failed to delete pathway.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setDeletingId(null);
  }

  return (
    <>
      {/* Pathway List */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Certification Pathways</CardTitle>
            <CardDescription>
              View, edit, or delete an existing pathway.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pathways.length === 0 ? (
              <p className="text-muted-foreground">No pathways yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {pathways.map((p) => (
                  <li
                    className="flex items-center justify-between gap-4 rounded border px-3 py-2"
                    key={p._id}
                  >
                    <div>
                      <span className="font-medium">{p.name}</span>{" "}
                      <span className="text-muted-foreground text-xs">
                        ({p.courseIds.length} courses)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={selected?._id === p._id && mode === "edit"}
                        onClick={() => handleEdit(p)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={deletingId === p._id}
                            size="sm"
                            variant="ghost"
                          >
                            {deletingId === p._id ? "Deleting..." : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete pathway?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the pathway "{p.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className={cn(
                                buttonVariants({ variant: "destructive" })
                              )}
                              onClick={() => handleDelete(p._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <div className="my-3 flex justify-end">
          <Button
            aria-label="Create New Pathway"
            className="shrink-0"
            disabled={mode === "new" && !selected}
            onClick={handleNew}
            size="sm"
            tabIndex={0}
            variant="outline"
          >
            + New Pathway
          </Button>
        </div>
      </div>
      {/* Editor Section */}
      <PathwayEditor
        key={selected?._id || "new"}
        pathway={mode === "edit" && selected ? selected : null}
      />
    </>
  );
}
