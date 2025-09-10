import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <div>Home page</div>
    </HydrateClient>
  );
}
