"use client";

import {
  IconFileText,
  IconMessageCircle,
  IconPlus,
  IconVideo,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mock data - in real app, this would come from the database
const mockLessons = [
  {
    id: "1",
    title: "Introduction to Sustainable Farming",
    type: "video",
    duration: "15:30",
    isPublished: true,
    order: 1,
  },
  {
    id: "2",
    title: "Understanding Soil Health",
    type: "video",
    duration: "22:45",
    isPublished: true,
    order: 2,
  },
  {
    id: "3",
    title: "Quiz: Soil Health Basics",
    type: "quiz",
    duration: "10:00",
    isPublished: true,
    order: 3,
  },
  {
    id: "4",
    title: "Crop Rotation Strategies",
    type: "video",
    duration: "18:20",
    isPublished: false,
    order: 4,
  },
  {
    id: "5",
    title: "Reading: Organic Pest Control",
    type: "reading",
    duration: "12:00",
    isPublished: false,
    order: 5,
  },
];

const getLessonIcon = (type: string) => {
  switch (type) {
    case "video":
      return <IconVideo className="h-4 w-4" />;
    case "quiz":
      return <IconMessageCircle className="h-4 w-4" />;
    case "reading":
      return <IconFileText className="h-4 w-4" />;
    default:
      return <IconFileText className="h-4 w-4" />;
  }
};

const getLessonTypeColor = (type: string) => {
  switch (type) {
    case "video":
      return "bg-blue-100 text-blue-800";
    case "quiz":
      return "bg-green-100 text-green-800";
    case "reading":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function CourseContentManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              Manage lessons, quizzes, and course materials
            </CardDescription>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLessons.map((lesson, index) => (
            <div key={lesson.id}>
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-sm">
                    {lesson.order}
                  </div>
                  <div className="flex items-center gap-2">
                    {getLessonIcon(lesson.type)}
                    <div>
                      <h4 className="font-medium">{lesson.title}</h4>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span>{lesson.duration}</span>
                        <Badge
                          className={`${getLessonTypeColor(lesson.type)} text-xs`}
                          variant="secondary"
                        >
                          {lesson.type}
                        </Badge>
                        <Badge
                          className={
                            lesson.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                          variant="secondary"
                        >
                          {lesson.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    Preview
                  </Button>
                </div>
              </div>
              {index < mockLessons.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
