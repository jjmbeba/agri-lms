"use client";

import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RequestRow = ({ request }: { request: Doc<"courseRequest"> }) => (
  <div className="space-y-1">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-semibold text-base">{request.title}</p>
      <p className="text-muted-foreground text-sm">
        {request.userName ?? "Learner"} • {formatDate(request.createdAt)}
      </p>
    </div>
    <p className="text-muted-foreground text-sm">{request.reason}</p>
  </div>
);

export const CourseRequestsPanel = () => {
  const requests = useQuery(api.courseRequests.listCourseRequests, {}) ?? [];

  if (!requests.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requested Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No course requests yet. Learners can submit suggestions from the
            courses page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requested Courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request, index) => (
          <div className="space-y-2" key={request._id}>
            <RequestRow request={request} />
            {index < requests.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
