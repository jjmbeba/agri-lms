"use client";

import {
  IconBook,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconReport,
  IconSettings,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavMain } from "@/components/features/dashboard/nav-main";
import { NavSecondary } from "@/components/features/dashboard/nav-secondary";
import { NavUser } from "@/components/features/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: IconBook,
    },
    {
      title: "Learners",
      url: "/admin/learners",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Extension Hub",
      url: "/admin/extension",
      icon: IconWorld,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/admin/help",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <GalleryVerticalEndIcon className="!size-5" />
                <span className="font-semibold text-base">AgriLMS Kenya</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
