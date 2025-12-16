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
          <RecentActivity />
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
