import CTA from "@/components/features/homepage/cta";
import FAQ from "@/components/features/homepage/faq";
import Features from "@/components/features/homepage/features";
import HeroSection from "@/components/features/homepage/hero";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <HeroSection />
      <Features />
      {/* <CourseCategories /> */}
      {/* <Testimonials /> */}
      {/* <Partners /> */}
      <CTA
        buttons={{
          primary: { text: "Start learning", url: "/courses" },
          secondary: { text: "See market prices", url: "/market" },
        }}
        description="Practical courses for Kenyan farmers: soil health, climate‑smart farming, livestock and agribusiness."
        heading="Learn anywhere. Grow everywhere."
      />
      <FAQ />
    </HydrateClient>
  );
}
