import { IconBuilding } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import CreateDepartmentButton from "./create-department-btn";

const EmptyDepartmentsMessage = () => {
  return (
    <div className="px-4 lg:px-6">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconBuilding className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-lg">No departments yet</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Get started by creating your first department to organize courses
            and students.
          </p>
          <CreateDepartmentButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyDepartmentsMessage;
