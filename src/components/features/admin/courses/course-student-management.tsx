"use client";

import {
  IconMail,
  IconSearch,
  IconUserCheck,
  IconUserX,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - in real app, this would come from the database
const mockStudents = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "/api/placeholder/32/32",
    enrolledDate: "2024-01-15",
    progress: 87,
    status: "active",
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar: "/api/placeholder/32/32",
    enrolledDate: "2024-01-12",
    progress: 92,
    status: "active",
    lastActivity: "1 day ago",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@example.com",
    avatar: "/api/placeholder/32/32",
    enrolledDate: "2024-01-10",
    progress: 45,
    status: "active",
    lastActivity: "3 days ago",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    avatar: "/api/placeholder/32/32",
    enrolledDate: "2024-01-08",
    progress: 100,
    status: "completed",
    lastActivity: "1 week ago",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@example.com",
    avatar: "/api/placeholder/32/32",
    enrolledDate: "2024-01-05",
    progress: 23,
    status: "inactive",
    lastActivity: "2 weeks ago",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const HIGH_PROGRESS_THRESHOLD = 80;
const MEDIUM_PROGRESS_THRESHOLD = 50;

const getProgressColor = (progress: number) => {
  if (progress >= HIGH_PROGRESS_THRESHOLD) {
    return "bg-green-500";
  }
  if (progress >= MEDIUM_PROGRESS_THRESHOLD) {
    return "bg-yellow-500";
  }
  return "bg-red-500";
};

export function CourseStudentManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>View and manage enrolled students</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconSearch className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input className="w-64 pl-10" placeholder="Search students..." />
            </div>
            <Button variant="outline">
              <IconMail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage alt={student.name} src={student.avatar} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(student.enrolledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="font-medium text-sm">
                        {student.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(student.status)}
                      variant="secondary"
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {student.lastActivity}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <IconUserCheck className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <IconUserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
