import { auth } from "@clerk/nextjs/server";

export default async function Layout({
  learner,
  admin,
}: {
  learner: React.ReactNode;
  admin: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata.role;

  return role === "admin" ? admin : learner;
}
