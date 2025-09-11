import Features from "@/components/features/homepage/features";
import HeroSection from "@/components/features/homepage/hero";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <HeroSection />
      <Features />
      {/* <CourseCategories />
      <Testimonials />
      <Partners />
      <CTA />
      <FAQ /> */}
    </HydrateClient>
  );
}
