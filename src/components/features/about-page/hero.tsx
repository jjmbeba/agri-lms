import Image from "next/image";
import Link from "next/link";
import { VISION } from "@/components/features/about-page/constants";
import { buttonVariants } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 font-bold text-4xl lg:text-5xl">
              About Afrifoods Agribusiness Training Institute (AATI)
            </h1>
            <p className="mb-8 text-muted-foreground text-xl leading-relaxed">
              {VISION}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                className={buttonVariants({ variant: "default", size: "lg" })}
                href="/"
              >
                Explore Courses
              </Link>
              <a
                className={buttonVariants({ variant: "outline", size: "lg" })}
                href="#mission"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="relative">
            <Image
              alt="Afrifoods Limited team and agricultural landscape"
              className="rounded-lg shadow-lg"
              height={400}
              priority
              src="/about/hero-placeholder.svg"
              width={800}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
