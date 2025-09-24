import type { Metadata } from "next";
import CourseCategories from "@/components/features/homepage/course-categories";
import CTA from "@/components/features/homepage/cta";
import FAQ from "@/components/features/homepage/faq";
import Features from "@/components/features/homepage/features";
import HeroSection from "@/components/features/homepage/hero";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Features />
      <CourseCategories />
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
    </main>
  );
}
