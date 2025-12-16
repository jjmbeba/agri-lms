"use client";

import { Building2, BookOpen, DollarSign, GraduationCap, Tag, ToggleLeft } from "lucide-react";
import type { FilterFieldConfig } from "@/components/ui/filters";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type CourseFilterFieldsProps = {
  departments: Doc<"department">[];
  tags: string[];
  priceRange: { min: number; max: number };
};

export const getCourseFilterFields = ({
  departments,
  tags,
  priceRange,
}: CourseFilterFieldsProps): FilterFieldConfig[] => {
  return [
    {
      key: "title",
      label: "Course Name",
      icon: <BookOpen />,
      type: "text",
      placeholder: "Enter course name...",
      defaultOperator: "contains",
    },
    {
      key: "department",
      label: "Department",
      icon: <Building2 />,
      type: "multiselect",
      options: departments.map((dept) => ({
        value: dept._id,
        label: dept.name,
      })),
      defaultOperator: "is_any_of",
      searchable: true,
    },
    {
      key: "status",
      label: "Status",
      icon: <GraduationCap />,
      type: "select",
      options: [
        { value: "published", label: "Published" },
        { value: "coming-soon", label: "Coming Soon" },
      ],
      defaultOperator: "is",
    },
    {
      key: "price",
      label: "Price",
      icon: <DollarSign />,
      type: "numberrange",
      min: priceRange.min,
      max: priceRange.max,
      defaultOperator: "between",
      prefix: "KES",
    },
    {
      key: "tags",
      label: "Tags",
      icon: <Tag />,
      type: "multiselect",
      options: tags.map((tag) => ({
        value: tag,
        label: tag,
      })),
      defaultOperator: "is_any_of",
      searchable: true,
    },
    {
      key: "isEnrolled",
      label: "Enrollment Status",
      icon: <ToggleLeft />,
      type: "boolean",
      options: [
        { value: true, label: "Enrolled" },
        { value: false, label: "Not Enrolled" },
      ],
      defaultOperator: "is",
      onLabel: "Enrolled",
      offLabel: "Not Enrolled",
    },
  ];
};

