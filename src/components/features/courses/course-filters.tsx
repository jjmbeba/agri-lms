"use client";

import { IconFilter, IconSearch } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";

const statuses = ["All Status", "Active", "Inactive", "Draft", "Archived"];

type CourseFiltersProps = {
  onFiltersChange: (filters: {
    searchTerm: string;
    selectedCategory: string;
    selectedStatus: string;
    sortBy: string;
  }) => void;
};

export function CourseFilters({ onFiltersChange }: CourseFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("title");
  const { data: categories, isLoading: isLoadingCategories } =
    trpc.categories.getAll.useQuery();

  // Update filters when any value changes
  useEffect(() => {
    onFiltersChange({
      searchTerm,
      selectedCategory,
      selectedStatus,
      sortBy,
    });
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, onFiltersChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFilter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <IconSearch className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses or instructors..."
              value={searchTerm}
            />
          </div>
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger
              disabled={isLoadingCategories || categories?.length === 0}
            >
              {isLoadingCategories ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <SelectValue
                  placeholder={
                    categories?.length === 0
                      ? "No categories found"
                      : "Select a category"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {isLoadingCategories ? (
                <SelectItem value="loading">Loading categories...</SelectItem>
              ) : (
                <>
                  <SelectItem key="all" value="All Categories">
                    All Categories
                  </SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedStatus} value={selectedStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSortBy} value={sortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="completion">Completion Rate</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
