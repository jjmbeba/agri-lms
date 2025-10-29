import Link from "next/link";
import Beneficiaries from "@/components/features/about-page/beneficiaries";
import Hero from "@/components/features/about-page/hero";
import Impact from "@/components/features/about-page/impact";
import Mission from "@/components/features/about-page/mission";
import Overview from "@/components/features/about-page/overview";
import Values from "@/components/features/about-page/values";
import WhatWeDo from "@/components/features/about-page/what-we-do";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "About Afrifoods Agribusiness Training Institute (AATI) | Agri-LMS",
  description:
    "Afrifoods Agribusiness Training Institute (AATI) is a vocational Training institution with an online and community outreach learning platform dedicated to imparting practical-based skills in human capital and enterprise development through innovation. The objective is to enhance employability and/or capacity to succeed as entrepreneurs without a focus on academic grades. Market relevance, accessibility and affordability are the main features.",
};

const AboutUsPage = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Overview />
      <Mission />
      <WhatWeDo />
      <Values />
      <Impact />
      <Beneficiaries />

      {/* Governance & Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl">Governance & Team</h2>
            <p className="text-lg leading-relaxed">
              Our leadership structure ensures strategic oversight and
              operational excellence
            </p>
          </div>

          {/* CEO Section */}
          <div className="mb-16">
            <h3 className="mb-8 text-center font-bold text-2xl">Leadership</h3>
            <Card className="mx-auto max-w-md text-center">
              <CardContent className="pt-8">
                <Avatar className="mx-auto mb-6 h-32 w-32">
                  <AvatarImage
                    alt="Chief Executive Officer"
                    src="/about/ceo-avatar.svg"
                  />
                  <AvatarFallback>CEO</AvatarFallback>
                </Avatar>
                <h4 className="mb-2 font-bold text-xl">
                  Chief Executive Officer
                </h4>
                <p className="mb-4">
                  Leading day-to-day operations and managing our team of
                  business mentors and coaches
                </p>
                <Badge variant="outline">Executive Leadership</Badge>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-12" />

          {/* Advisory Board */}
          <div>
            <h3 className="mb-8 text-center font-bold text-2xl">
              Advisory Board
            </h3>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
              {Array.from({ length: 7 }, (_, i) => (
                <Card className="text-center" key={`advisory-board-${i + 1}`}>
                  <CardContent className="pt-6">
                    <Avatar className="mx-auto mb-4 h-16 w-16">
                      <AvatarImage
                        alt={`Advisory board member ${i + 1}`}
                        src={`/about/avatar-${i + 1}.svg`}
                      />
                      <AvatarFallback>AB{i + 1}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-sm">Board Member</h4>
                    <p className="text-xs">Advisory Board</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 font-bold text-3xl">Join Our Programs</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl">
            Be part of our mission to enhance agricultural value chains and
            empower communities through sustainable business development.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className={buttonVariants({ variant: "secondary", size: "lg" })}
              href="/courses"
            >
              Explore Courses
            </Link>
            <Link
              className={buttonVariants({
                variant: "outline",
                size: "lg",
              })}
              href="/departments"
            >
              Browse Departments
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUsPage;
