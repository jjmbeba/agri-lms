import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconBook
} from "@tabler/icons-react";
import Link from "next/link";
import type { UrlObject } from "node:url";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  disabled?: boolean;
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
  }
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Jump into your learning journey with these quick actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              asChild={!action.disabled}
              className="h-auto flex-col items-start gap-2 p-4 text-left"
              key={action.id}
              variant="outline"
              disabled={action.disabled}
            >
              {action.disabled ? (
                 <span
                  aria-disabled="true"
                  className="opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                  </div>
                </span>
              ) : (
                <Link href={action.href as unknown as UrlObject}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    <p className="text-muted-foreground text-xs max-w-48 whitespace-normal">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
