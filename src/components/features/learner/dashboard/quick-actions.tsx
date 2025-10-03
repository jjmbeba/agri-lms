import type { UrlObject } from "node:url";
import {
  IconBook,
  IconCertificate,
  IconSearch,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
};

type QuickActionsProps = {
  actions?: QuickAction[];
};

const defaultActions: QuickAction[] = [
  {
    id: "browse-courses",
    title: "Browse Courses",
    description: "Discover new courses to expand your knowledge",
    icon: IconBook,
    href: "/courses",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "my-certificates",
    title: "My Certificates",
    description: "View and download your earned certificates",
    icon: IconCertificate,
    href: "/certificates",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "achievements",
    title: "Achievements",
    description: "View your learning milestones and badges",
    icon: IconTrophy,
    href: "/achievements",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "search-content",
    title: "Search Content",
    description: "Find specific topics across all courses",
    icon: IconSearch,
    href: "/search",
    color: "bg-gray-100 text-gray-600",
  },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions (1 out of 4 implemented)</CardTitle>
        <CardDescription>
          Jump into your learning journey with these quick actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              asChild
              className="h-auto flex-col items-start gap-2 p-4 text-left"
              key={action.id}
              variant="outline"
            >
              <Link href={action.href as unknown as UrlObject}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    <p className="text-muted-foreground text-xs">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
