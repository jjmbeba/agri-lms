import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import DeleteDepartmentButton from "./delete-department-btn";
import EditDepartmentButton from "./edit-department-btn";

type Props = {
  department: Doc<"department"> & { courseCount: number; studentCount: number };
};

const DepartmentCard = ({ department }: Props) => {
  return (
    <Card className="transition-shadow hover:shadow-md" key={department._id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{department.name}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {department.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground text-sm">
                Students
              </p>
              <p className="font-bold text-2xl">
                {department.studentCount.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground text-sm">
                Courses
              </p>
              <p className="font-bold text-2xl">{department.courseCount}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-muted-foreground text-xs">
              Created {new Date(department._creationTime).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              {/* <Button size="sm" variant="outline">
                            View Details
                          </Button> */}
              <EditDepartmentButton
                departmentDetails={department}
                id={department._id}
              />
              <DeleteDepartmentButton id={department._id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
