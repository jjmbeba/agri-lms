export default function Layout({
  learner,
  admin,
}: {
  learner: React.ReactNode;
  admin: React.ReactNode;
}) {
  // const data = await fetchQuery(api.departments.getDepartments, {});

  // const user = await fetchQuery(api.auth.getCurrentUser, {});

  const role = "admin";

  return role === "admin" ? admin : learner;
}
