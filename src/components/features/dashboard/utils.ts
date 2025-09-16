// UUID regex pattern for performance
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getRouteBreadcrumbs = (pathname: string) => {
  const pathParts = pathname.split("/").filter(Boolean);

  // Define route labels mapping
  const routeLabels: Record<string, string> = {
    admin: "Dashboard",
    courses: "Courses",
    categories: "Categories",
    students: "Students",
    analytics: "Analytics",
    settings: "Settings",
  };

  const breadcrumbs = pathParts.map((part, index) => {
    const href = `/${pathParts.slice(0, index + 1).join("/")}`;

    // Handle dynamic routes (like course IDs)
    let label = routeLabels[part] || part;

    // If it's a UUID or looks like an ID, show a more user-friendly label
    if (UUID_PATTERN.test(part)) {
      label = "Course Details";
    }

    return {
      label,
      href,
    };
  });

  return breadcrumbs;
};
