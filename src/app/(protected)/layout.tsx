import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Layout({
  learner,
  admin,
}: {
  learner: React.ReactNode;
  admin: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const role = session?.user.role ?? "learner";

  return role === "admin" ? admin : learner;
}
