import {
  BarChart3,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sprout,
  Tractor,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const Features = () => {
  return (
    <section className="px-10 pt-32">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h1 className="mb-6 text-pretty font-semibold text-4xl lg:text-5xl">
            Why AgriLMS Kenya
          </h1>
          <div className="mt-10 grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-1">
                <Sprout className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left">
                <h2 className="mb-1 font-semibold text-lg">
                  Soil & Crop Courses
                </h2>
                <p className="text-muted-foreground leading-snug">
                  Learn soil health, maize, tea, dairy, and horticulture best
                  practices.
                </p>
              </CardContent>
              <CardFooter className="justify-end pr-0 pb-0" />
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <GraduationCap className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left">
                <h2 className="mb-1 font-semibold text-lg">
                  Video Lessons & Quizzes
                </h2>
                <p className="text-muted-foreground leading-snug">
                  Short videos in English/Kiswahili with quizzes and shareable
                  certificates.
                </p>
              </CardContent>
              <CardFooter className="justify-end pr-0 pb-0" />
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <Layers className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left">
                <h2 className="mb-1 font-semibold text-lg">Extension Hub</h2>
                <p className="text-muted-foreground leading-snug">
                  County advisories, seasonal guides, and field checklists.
                </p>
              </CardContent>
              <CardFooter className="justify-end pr-0 pb-0" />
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <BarChart3 className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left">
                <h2 className="mb-1 font-semibold text-lg">Market Prices</h2>
                <p className="text-muted-foreground leading-snug">
                  Daily prices for maize, tea, dairy, and horticulture across
                  counties.
                </p>
              </CardContent>
              <CardFooter className="justify-end pr-0 pb-0" />
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <Tractor className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left">
                <h2 className="mb-1 font-semibold text-lg">Offline‑friendly</h2>
                <p className="text-muted-foreground leading-snug">
                  Download notes for low‑connectivity areas and keep learning in
                  the field.
                </p>
              </CardContent>
              <CardFooter className="justify-end pr-0 pb-0" />
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <ShieldCheck className="size-4" strokeWidth={1} />
              </CardHeader>
              <CardContent className="text-left">
                <h2 className="mb-1 font-semibold text-lg">Verified Content</h2>
                <p className="text-muted-foreground leading-snug">
                  Developed with agronomists and county extension officers.
                </p>
              </CardContent>
              <CardFooter className="justify-end pr-0 pb-0" />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
