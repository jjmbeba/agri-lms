import { HandHelping, Users, Zap } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const HeroSection = () => {
  const badge = "AgriLMS Kenya";
  const heading = "Digital learning for Kenyan agriculture";
  const features = [
    {
      icon: <HandHelping className="h-auto w-5" />,
      title: "Soil & Climate-Smart Farming",
      description:
        "Practical modules on soil health, water harvesting, and sustainable inputs.",
    },
    {
      icon: <Users className="h-auto w-5" />,
      title: "Extension & Community",
      description:
        "Access county extension tips, peer groups, and Kiswahili support.",
    },
    {
      icon: <Zap className="h-auto w-5" />,
      title: "Market & Prices",
      description:
        "Stay updated on maize, tea, dairy, and horticulture prices across counties.",
    },
  ];
  return (
    <section className="py-32">
      <div className="container overflow-hidden">
        <div className="mb-20 flex flex-col items-center gap-6 text-center">
          <Badge variant="outline">{badge}</Badge>
          <h1 className="font-semibold text-4xl lg:text-5xl">{heading}</h1>
        </div>
        <div className="relative mx-auto aspect-video max-w-5xl">
          <Image
            alt="farmers learning online"
            className="rounded-xl object-cover"
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            src="/hero-image.webp"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
          <div className="-top-28 -right-28 -z-10 absolute aspect-video h-72 w-96 opacity-40 [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] sm:bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)]" />
          <div className="-top-28 -left-28 -z-10 absolute aspect-video h-72 w-96 opacity-40 [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] sm:bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)]" />
        </div>
        <div className="mx-auto mt-10 flex max-w-5xl flex-col md:flex-row">
          {features.map((feature, index) => (
            <React.Fragment key={feature.title}>
              {index > 0 && (
                <Separator
                  className="mx-6 hidden h-auto w-[2px] bg-linear-to-b from-muted via-transparent to-muted md:block"
                  orientation="vertical"
                />
              )}
              <div className="flex grow basis-0 flex-col rounded-md bg-background p-4">
                <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-background drop-shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
