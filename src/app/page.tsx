import HeroSection from "@/components/features/homepage/hero";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <HeroSection />
    </HydrateClient>
  );
}
