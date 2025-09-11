import { Button } from "@/components/ui/button";

type Cta10Props = {
  heading: string;
  description: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
};

const CTA = ({
  heading = "Learn anywhere. Grow everywhere.",
  description = "Practical courses for Kenyan farmers: soil health, climate‑smart farming, livestock and agribusiness.",
  buttons = {
    primary: {
      text: "Start learning",
      url: "/courses",
    },
    secondary: {
      text: "See market prices",
      url: "/market",
    },
  },
}: Cta10Props) => {
  return (
    <section className="px-10 pt-32">
      <div className="container">
        <div className="flex w-full flex-col gap-16 overflow-hidden rounded-lg bg-accent p-8 md:rounded-xl lg:flex-row lg:items-center lg:p-12">
          <div className="flex-1">
            <h3 className="mb-3 font-semibold text-2xl md:mb-4 md:text-4xl lg:mb-6">
              {heading}
            </h3>
            <p className="max-w-xl text-muted-foreground lg:text-lg">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {buttons.secondary && (
              <Button asChild variant="outline">
                <a
                  aria-label={buttons.secondary.text}
                  href={buttons.secondary.url}
                >
                  {buttons.secondary.text}
                </a>
              </Button>
            )}
            {buttons.primary && (
              <Button asChild size="lg" variant="default">
                <a aria-label={buttons.primary.text} href={buttons.primary.url}>
                  {buttons.primary.text}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
