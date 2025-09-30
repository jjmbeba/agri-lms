import { Card, CardContent } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <h3 className="mb-2 font-semibold text-lg">No courses available</h3>
        <p className="mb-4 text-center text-muted-foreground">
          Please check back later as new courses are added.
        </p>
      </CardContent>
    </Card>
  );
};
