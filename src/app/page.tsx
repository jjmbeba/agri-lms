import type { Metadata } from "next";
import CourseCategories from "@/components/features/home-page/course-categories";
import CTA from "@/components/features/home-page/cta";
import FAQ from "@/components/features/home-page/faq";
import Features from "@/components/features/home-page/features";
import HeroSection from "@/components/features/home-page/hero";

export const metadata: Metadata = {
  title: "Home",
  description: "Learn anywhere. Grow everywhere.",
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
