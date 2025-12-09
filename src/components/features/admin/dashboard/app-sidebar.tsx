"use client";

import {
  IconBook,
  IconBuilding,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconLink,
  IconReport,
  IconSettings,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavMain } from "@/components/features/admin/dashboard/nav-main";
import { NavSecondary } from "@/components/features/admin/dashboard/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  adminNavMain: [
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
      title: "Departments",
      url: "/departments",
      icon: IconBuilding,
    },
    {
      title: "Pathways",
      url: "/pathways",
      icon: IconLink,
    },
    {
      title: "Learners",
      url: "/learners",
      icon: IconUsers,
      disabled: true,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
      disabled: true,
    },
  ],
  learnerNavMain: [
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
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({
  userRole,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userRole: "admin" | "learner" }) {
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
                <span className="font-semibold text-base">AATI LMS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={userRole === "admin" ? data.adminNavMain : data.learnerNavMain}
        />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary className="mt-auto" items={data.navSecondary} /> */}
      </SidebarContent>
    </Sidebar>
  );
}
