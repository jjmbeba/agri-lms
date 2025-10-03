"use client";

import { useUser } from "@clerk/nextjs";

const WelcomeSection = () => {
  const { user } = useUser();

  return (
    <div className="px-4 lg:px-6">
      <div className="py-6">
        <h1 className="font-bold text-3xl tracking-tight">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground">
          Continue your learning journey and track your progress.
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
