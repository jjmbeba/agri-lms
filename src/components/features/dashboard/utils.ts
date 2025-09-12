export const getRouteBreadcrumbs = (pathname: string) => {
  const pathParts = pathname.split("/");
  const breadcrumbs = pathParts.map((part, index) => {
    return {
      label: part,
      href: `/${pathParts.slice(0, index + 1).join("/")}`,
    };
  });
  return breadcrumbs;
};
