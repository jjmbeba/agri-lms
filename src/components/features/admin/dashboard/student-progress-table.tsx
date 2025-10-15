"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../../../../convex/_generated/api";

export function StudentProgressTable() {
  const { data } = useSuspenseQuery(
    convexQuery(api.enrollments.getAllStudentsProgress, {})
  );

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No enrollments yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 pr-4">Learner</th>
              <th className="py-2 pr-4">Course</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Progress</th>
              <th className="py-2 pr-4">Completed At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                className="border-b last:border-0"
                key={String(row.enrollmentId)}
              >
                <td className="py-2 pr-4 font-mono text-xs">{row.userId}</td>
                <td className="py-2 pr-4">{row.courseTitle}</td>
                <td className="py-2 pr-4">
                  <Badge variant="outline">
                    {row.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </td>
                <td className="py-2 pr-4">{row.progressPercentage}%</td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {row.completedAt
                    ? new Date(row.completedAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
