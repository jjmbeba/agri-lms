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
    selectedDepartment: string;
    selectedStatus: string;
    sortBy: string;
  }) => void;
};

export function CourseFilters({ onFiltersChange }: CourseFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("title");
  const { data: departments, isLoading: isLoadingDepartments } =
    trpc.departments.getAll.useQuery();

  // Update filters when any value changes
  useEffect(() => {
    onFiltersChange({
      searchTerm,
      selectedDepartment,
      selectedStatus,
      sortBy,
    });
  }, [searchTerm, selectedDepartment, selectedStatus, sortBy, onFiltersChange]);

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
          <Select
            onValueChange={setSelectedDepartment}
            value={selectedDepartment}
          >
            <SelectTrigger
              disabled={isLoadingDepartments || departments?.length === 0}
            >
              {isLoadingDepartments ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading departments...</span>
                </div>
              ) : (
                <SelectValue
                  placeholder={
                    departments?.length === 0
                      ? "No departments found"
                      : "Select a department"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {isLoadingDepartments ? (
                <SelectItem value="loading">Loading departments...</SelectItem>
              ) : (
                <>
                  <SelectItem key="all" value="All Departments">
                    All Departments
                  </SelectItem>
                  {departments?.map((department) => (
                    <SelectItem key={department.id} value={department.name}>
                      {department.name}
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
