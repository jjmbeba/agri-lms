import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "../../../../convex/_generated/api";
import DepartmentCard from "./department-card";
import EmptyDepartmentsMessage from "./empty-departments-msg";

type Props = {
  preloadedDepartments: Preloaded<
    typeof api.departments.getAllDepartmentsWithCounts
  >;
};

const DepartmentGrid = ({ preloadedDepartments }: Props) => {
  const departments = usePreloadedQuery(preloadedDepartments);

  if (departments.length === 0) {
    return <EmptyDepartmentsMessage />;
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <DepartmentCard department={department} key={department._id} />
        ))}
      </div>
    </div>
  );
};

export default DepartmentGrid;
