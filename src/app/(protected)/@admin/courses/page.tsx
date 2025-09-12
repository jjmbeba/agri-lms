import { IconBook, IconPlus } from "@tabler/icons-react";
import { CourseManager } from "@/components/features/courses/course-manager";
import { Button } from "@/components/ui/button";

// Mock data for courses - in a real app, this would come from a database
const mockCourses = [
  {
    id: 1,
    title: "Sustainable Farming Practices",
    instructor: "Dr. Sarah Johnson",
    category: "Sustainability",
    status: "Active",
    enrolledStudents: 245,
    completionRate: 87,
    duration: "8 weeks",
    lastUpdated: "2024-01-15",
    thumbnail: "/api/placeholder/300/200",
    description:
      "Learn modern sustainable farming techniques that protect the environment while maximizing crop yield.",
  },
  {
    id: 2,
    title: "Crop Rotation Techniques",
    instructor: "Prof. Michael Chen",
    category: "Crop Management",
    status: "Active",
    enrolledStudents: 189,
    completionRate: 92,
    duration: "6 weeks",
    lastUpdated: "2024-01-12",
    thumbnail: "/api/placeholder/300/200",
    description:
      "Master the art of crop rotation to improve soil health and prevent pest infestations.",
  },
  {
    id: 3,
    title: "Soil Health Assessment",
    instructor: "Dr. Emily Rodriguez",
    category: "Soil Science",
    status: "Active",
    enrolledStudents: 156,
    completionRate: 78,
    duration: "4 weeks",
    lastUpdated: "2024-01-10",
    thumbnail: "/api/placeholder/300/200",
    description:
      "Comprehensive guide to assessing and improving soil health for better agricultural outcomes.",
  },
  {
    id: 4,
    title: "Organic Pest Management",
    instructor: "Dr. James Wilson",
    category: "Pest Control",
    status: "Active",
    enrolledStudents: 203,
    completionRate: 85,
    duration: "5 weeks",
    lastUpdated: "2024-01-08",
    thumbnail: "/api/placeholder/300/200",
    description:
      "Natural and organic methods to control pests without harmful chemicals.",
  },
  {
    id: 5,
    title: "Irrigation Systems Design",
    instructor: "Prof. Lisa Anderson",
    category: "Water Management",
    status: "Active",
    enrolledStudents: 134,
    completionRate: 90,
    duration: "7 weeks",
    lastUpdated: "2024-01-05",
    thumbnail: "/api/placeholder/300/200",
    description:
      "Design efficient irrigation systems for optimal water usage and crop growth.",
  },
  {
    id: 6,
    title: "Livestock Nutrition Basics",
    instructor: "Dr. Robert Taylor",
    category: "Animal Husbandry",
    status: "Active",
    enrolledStudents: 178,
    completionRate: 83,
    duration: "6 weeks",
    lastUpdated: "2024-01-03",
    thumbnail: "/api/placeholder/300/200",
    description:
      "Essential nutrition principles for healthy and productive livestock management.",
  },
];

const CoursesPage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Section */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <IconBook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl tracking-tight">
                    Course Management
                  </h1>
                  <p className="text-muted-foreground">
                    Manage agricultural courses and track student progress
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <IconPlus className="h-4 w-4" />
                Create Course
              </Button>
            </div>
          </div>

          {/* Course Management Components */}
          <CourseManager courses={mockCourses} />
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
