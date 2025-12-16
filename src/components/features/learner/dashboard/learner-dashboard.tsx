import { EnrolledCourses } from "./enrolled-courses";
// import { LearnerDashboardStats } from "./learner-dashboard-stats";
// import { ProgressOverview } from "./progress-overview";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import WelcomeSection from "./welcome-section";

// Mock data - in a real app, this would come from the database
// const mockStats = {
//   totalStudyTime: "24h 30m",
//   achievements: 12,
//   averageScore: 87,
// };

// const mockProgress = {
//   weeklyGoal: 10,
//   weeklyProgress: 7,
//   monthlyGoal: 40,
//   monthlyProgress: 28,
//   streak: 12,
//   lastActivity: "2 hours ago",
// };

const mockActivities = [
  {
    id: "1",
    type: "course_completed" as const,
    title: "Completed Crop Rotation Techniques",
    description:
      "Congratulations! You've successfully completed the Crop Rotation Techniques course.",
    timestamp: "2 days ago",
    courseTitle: "Crop Rotation Techniques",
  },
  {
    id: "2",
    type: "quiz_passed" as const,
    title: "Quiz: Soil Composition",
    description: "Great job! You scored 92% on the Soil Composition quiz.",
    timestamp: "3 days ago",
    courseTitle: "Soil Health Assessment",
    score: 92,
  },
  {
    id: "3",
    type: "streak_milestone" as const,
    title: "10 Day Learning Streak!",
    description:
      "Amazing! You've maintained a 10-day learning streak. Keep it up!",
    timestamp: "4 days ago",
    streak: 10,
  },
  {
    id: "4",
    type: "certificate_earned" as const,
    title: "Certificate Earned",
    description:
      "You've earned a certificate for completing Sustainable Farming Practices.",
    timestamp: "1 week ago",
    courseTitle: "Sustainable Farming Practices",
  },
];

// const mockDeadlines = [
//   {
//     id: "1",
//     title: "Soil Analysis Report",
//     courseTitle: "Soil Health Assessment",
//     dueDate: "2024-01-25",
//     type: "assignment" as const,
//     priority: "high" as const,
//     isOverdue: false,
//   },
//   {
//     id: "2",
//     title: "Sustainable Farming Quiz",
//     courseTitle: "Sustainable Farming Practices",
//     dueDate: "2024-01-28",
//     type: "quiz" as const,
//     priority: "medium" as const,
//     isOverdue: false,
//   },
//   {
//     id: "3",
//     title: "Final Project Submission",
//     courseTitle: "Advanced Agriculture Techniques",
//     dueDate: "2024-01-20",
//     type: "project" as const,
//     priority: "high" as const,
//     isOverdue: true,
//   },
// ];

export function LearnerDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Stats Cards */}
      {/* <LearnerDashboardStats {...mockStats} /> */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-6">
        {/* Left Column */}
        <div className="grid gap-6 lg:col-span-2">
          <EnrolledCourses />
          {/* <ProgressOverview {...mockProgress} /> */}
        </div>

        {/* Right Column */}
        <div className="grid gap-6 lg:col-span-1">
          <RecentActivity activities={mockActivities} />
          <UpcomingDeadlines />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 lg:px-6">
        <QuickActions />
      </div>
    </div>
  );
}
