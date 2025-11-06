"use client";

import { convexQuery } from "@convex-dev/react-query";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { GripVertical } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { PathwayVisualizer } from "./visualizer";

// Types
export type CourseWithDepartment = {
  course: Doc<"course">;
  department: Doc<"department"> | null;
};

type PathwayDoc = Doc<"certificationPathway">;

const NAME_MIN = 3;
const NAME_MAX = 48;
const nameSchema = z
  .string()
  .min(NAME_MIN, "Name must be at least 3 characters")
  .max(NAME_MAX, "Name must be at most 48 characters");

const DRAG_ACTIVATION_DISTANCE = 6;

export const PathwayEditor: React.FC<{ pathway?: PathwayDoc | null }> = ({
  pathway = null,
}) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [pathwayCourses, setPathwayCourses] = useState<CourseWithDepartment[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [tab, setTab] = useState("list");
  const { data: allCourses } = useSuspenseQuery(
    convexQuery(api.courses.getCourses, {})
  );
  const createPathway = useMutation(api.pathways.createPathway);
  const updatePathway = useMutation(api.pathways.updatePathway);
  const [isSaving, setIsSaving] = useState(false);

  // TanStack Form setup
  const form = useForm({
    defaultValues: { name: "" },
    validators: { onSubmit: z.object({ name: nameSchema }) },
    onSubmit: async ({ value }) => {
      if (pathwayCourses.length === 0) {
        toast.error("Add at least one course to the pathway");
        return;
      }
      try {
        setIsSaving(true);
        const courseIds = pathwayCourses.map(
          (c) => c.course._id as Id<"course">
        );
        if (pathway) {
          await updatePathway({
            id: pathway._id as Id<"certificationPathway">,
            name: value.name,
            courseIds,
          });
          toast.success("Pathway updated successfully");
        } else {
          await createPathway({ name: value.name, courseIds });
          toast.success("Pathway created successfully");
          // Reset after create
          form.reset();
          setPathwayCourses([]);
        }
      } catch (err) {
        let message = "Failed to save pathway";
        if (err instanceof Error) {
          message = err.message;
        } else if (pathway) {
          message = "Failed to update pathway";
        } else {
          message = "Failed to create pathway";
        }
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Initialize editor when editing an existing pathway
  useEffect(() => {
    if (!allCourses) {
      return;
    }

    if (pathway) {
      // Set name
      form.setFieldValue("name", pathway.name);
      // Build map for quick lookup
      const byId = new Map<string, CourseWithDepartment>(
        (allCourses as CourseWithDepartment[]).map((cw) => [
          cw.course._id as unknown as string,
          cw,
        ])
      );
      const ordered = pathway.courseIds
        .map((id) => byId.get(id as unknown as string))
        .filter(Boolean) as CourseWithDepartment[];
      setPathwayCourses(ordered);
    } else {
      // New mode
      form.reset();
      setPathwayCourses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathway, allCourses, form.reset, form.setFieldValue]);

  const departmentList = useMemo(() => {
    if (!allCourses) {
      return [];
    }
    const set = new Set<string>();
    for (const cw of allCourses as CourseWithDepartment[]) {
      if (cw.department?.name) {
        set.add(cw.department.name);
      }
    }
    return ["All Departments", ...Array.from(set).sort()];
  }, [allCourses]);
  const filteredCourses = useMemo(() => {
    if (!allCourses) {
      return [];
    }
    return (allCourses as CourseWithDepartment[]).filter((cw) => {
      const matchesDept =
        department === "All Departments" ||
        (cw.department?.name ?? "") === department;
      const searchText = search.trim().toLowerCase();
      const matchesSearch =
        searchText === "" ||
        cw.course.title.toLowerCase().includes(searchText) ||
        (cw.course.description?.toLowerCase() ?? "").includes(searchText);
      return matchesDept && matchesSearch;
    });
  }, [allCourses, search, department]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDndEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active?.id !== over?.id && active && over) {
      const oldIndex = pathwayCourses.findIndex(
        (c) => c.course._id === active.id
      );
      const newIndex = pathwayCourses.findIndex(
        (c) => c.course._id === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        setPathwayCourses(arrayMove(pathwayCourses, oldIndex, newIndex));
      }
    }
  };
  const handleAddCourse = (cw: CourseWithDepartment) => {
    setPathwayCourses((prev) =>
      prev.some((p) => p.course._id === cw.course._id) ? prev : [...prev, cw]
    );
  };
  const handleRemoveCourse = (cid: string) => {
    setPathwayCourses((prev) => prev.filter((p) => p.course._id !== cid));
  };

  // Button label without nested ternaries
  let saveLabel = "Save Pathway";
  if (isSaving) {
    saveLabel = pathway ? "Updating..." : "Saving...";
  } else if (pathway) {
    saveLabel = "Update Pathway";
  }

  return (
    <div className="mx-auto my-10 w-full rounded-lg p-6 shadow">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Pathway Name</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    className="max-w-md"
                    disabled={isSaving}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Sustainable Agriculture Track"
                    value={field.state.value}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
        <div>
          {/* Tabs for editor modes */}
          <Tabs className="mb-6" onValueChange={setTab} value={tab}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <div className="mb-4">
                {/* DnD linear pathway */}
                {pathwayCourses.length === 0 ? (
                  <div className="flex min-h-[120px] flex-col items-center justify-center rounded border border-gray-300 border-dashed p-4">
                    <span className="text-muted-foreground">
                      No courses in pathway yet.
                    </span>
                  </div>
                ) : (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDndEnd}
                    sensors={sensors}
                  >
                    <SortableContext
                      items={pathwayCourses.map((c) => c.course._id)}
                    >
                      <ol className="flex list-decimal flex-col gap-3 pl-4">
                        {pathwayCourses.map((cw) => (
                          <SortableCourseItem
                            cw={cw}
                            handleRemove={handleRemoveCourse}
                            key={cw.course._id}
                          />
                        ))}
                      </ol>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </TabsContent>
            <TabsContent value="visualizer">
              <PathwayVisualizer courses={pathwayCourses} />
            </TabsContent>
          </Tabs>
        </div>
        {/* Add Courses Button/Modal */}
        <Dialog onOpenChange={setDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4" size="sm" variant="outline">
              + Add Courses
            </Button>
          </DialogTrigger>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Select Courses to Add</DialogTitle>
              <DialogDescription>
                Search or filter by department to find courses.
              </DialogDescription>
            </DialogHeader>
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  className="max-w-xs"
                  id="search-courses"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Title or description"
                  value={search}
                />
                <Select onValueChange={setDepartment} value={department}>
                  <SelectTrigger className="max-w-xs" id="department-filter">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentList.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
              {filteredCourses.length === 0 ? (
                <span className="text-muted-foreground">
                  No courses match these filters
                </span>
              ) : (
                filteredCourses.map((cw: CourseWithDepartment) => {
                  const isAdded = pathwayCourses.some(
                    (p) => p.course._id === cw.course._id
                  );
                  return (
                    <div
                      className="flex items-center gap-3 rounded border p-2"
                      key={cw.course._id}
                    >
                      <div className="flex-1">
                        <span className="font-medium">{cw.course.title}</span>
                        <span className="block max-w-xs truncate text-muted-foreground text-xs">
                          {cw.course.description}
                        </span>
                      </div>
                      <Button
                        aria-label={
                          isAdded
                            ? `Already added: ${cw.course.title}`
                            : `Add ${cw.course.title}`
                        }
                        disabled={isAdded}
                        onClick={() => handleAddCourse(cw)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {isAdded ? "Added" : "Add"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button size="sm" variant="outline">
                  Done
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            aria-label={pathway ? "Update Pathway" : "Save Pathway"}
            disabled={isSaving || !form.state.canSubmit}
            size="sm"
            tabIndex={0}
            type="submit"
            variant="outline"
          >
            {saveLabel}
          </Button>
          <Button
            aria-label="Cancel"
            disabled={isSaving}
            onClick={() => {
              form.reset();
              setPathwayCourses([]);
            }}
            size="sm"
            tabIndex={0}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

function SortableCourseItem({
  cw,
  handleRemove,
}: {
  cw: CourseWithDepartment;
  handleRemove: (id: string) => void;
}) {
  const {
    setNodeRef,
    transform,
    transition,
    listeners,
    attributes,
    isDragging,
  } = useSortable({ id: cw.course._id });
  return (
    <li
      className={`flex items-center gap-2 rounded border border-muted-foreground/20 px-2 py-1 shadow-sm ${isDragging ? "opacity-60" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag handle"
        className="cursor-grab p-1"
        tabIndex={0}
        type="button"
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </button>
      <div className="flex flex-1 flex-col">
        <span className="font-medium">{cw.course.title}</span>
        <span className="max-w-md truncate text-muted-foreground text-xs">
          {cw.course.description}
        </span>
        {cw.department && (
          <span className="text-muted-foreground text-xs italic">
            {cw.department.name}
          </span>
        )}
      </div>
      <Button
        aria-label={`Remove ${cw.course.title}`}
        onClick={() => handleRemove(cw.course._id)}
        size="sm"
        tabIndex={0}
        type="button"
        variant="outline"
      >
        Remove
      </Button>
    </li>
  );
}
