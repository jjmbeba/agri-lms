import { getSession } from "@/components/features/auth/actions";

export default async function Layout({
  learner,
  admin,
}: {
  learner: React.ReactNode;
  admin: React.ReactNode;
}) {
  const session = await getSession();

  const role = session?.user.role ?? "learner";

  return role === "admin" ? admin : learner;
}
