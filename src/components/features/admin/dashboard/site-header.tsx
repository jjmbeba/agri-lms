"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import ThemeToggle from "@/components/ui/theme-toggle";
import { capitalize } from "@/lib/utils";
import { getRouteBreadcrumbs } from "./utils";

const MAX_BREADCRUMBS = 3;

export function SiteHeader() {
  const pathname = usePathname();
  const allBreadcrumbs = getRouteBreadcrumbs(pathname);

  // Truncate breadcrumbs if too long: show first, ellipsis, and last 2
  const breadcrumbs =
    allBreadcrumbs.length > MAX_BREADCRUMBS
      ? [
          allBreadcrumbs[0],
          { label: "...", href: "#", isEllipsis: true },
          ...allBreadcrumbs.slice(-2),
        ]
      : allBreadcrumbs;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mx-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <div className="flex w-full items-center justify-between">
          <h1 className="font-medium text-base">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.flatMap((breadcrumb, index) => [
                  <BreadcrumbItem key={breadcrumb.label}>
                    {"isEllipsis" in breadcrumb && breadcrumb.isEllipsis ? (
                      <BreadcrumbEllipsis />
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {capitalize(breadcrumb.label)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>,
                  ...(index < breadcrumbs.length - 1
                    ? [
                        <BreadcrumbSeparator
                          key={`${breadcrumb.label}-${breadcrumb.href}-separator`}
                        />,
                      ]
                    : []),
                ])}
              </BreadcrumbList>
            </Breadcrumb>
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
            <ClerkLoading>
              <Skeleton className="size-8 rounded-full" />
            </ClerkLoading>
          </div>
        </div>
      </div>
    </header>
  );
}
