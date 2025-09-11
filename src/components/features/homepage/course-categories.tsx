import {
  Droplet,
  Leaf,
  LineChart,
  Milk,
  Package,
  Shovel,
  Sprout,
  Sun,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const categories = [
  {
    icon: <Leaf className="size-4" strokeWidth={1} />,
    title: "Soil Health",
    description:
      "Soil testing, fertility, composting, and regenerative practices.",
    href: "/courses/soil-health",
  },
  {
    icon: <Sprout className="size-4" strokeWidth={1} />,
    title: "Crop Production",
    description: "Maize, tea, horticulture, seed selection, and IPM.",
    href: "/courses/crop-production",
  },
  {
    icon: <Milk className="size-4" strokeWidth={1} />,
    title: "Livestock",
    description: "Dairy, poultry, feeding, housing, and animal health.",
    href: "/courses/livestock",
  },
  {
    icon: <Droplet className="size-4" strokeWidth={1} />,
    title: "Irrigation & Water",
    description: "Water harvesting, irrigation systems, and efficient use.",
    href: "/courses/irrigation",
  },
  {
    icon: <Package className="size-4" strokeWidth={1} />,
    title: "Post‑Harvest",
    description: "Storage, handling, value addition, and quality assurance.",
    href: "/courses/post-harvest",
  },
  {
    icon: <LineChart className="size-4" strokeWidth={1} />,
    title: "Agribusiness",
    description: "Marketing, record‑keeping, SACCOs, and cooperative models.",
    href: "/courses/agribusiness",
  },
  {
    icon: <Sun className="size-4" strokeWidth={1} />,
    title: "Climate‑Smart",
    description: "Drought resilience, CSA practices, and risk management.",
    href: "/courses/climate-smart",
  },
  {
    icon: <Shovel className="size-4" strokeWidth={1} />,
    title: "Extension Hub",
    description: "County guides, field checklists, and seasonal advisories.",
    href: "/extension",
  },
];

const CourseCategories = () => {
  return (
    <section className="px-10 pt-32">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="mb-2 font-semibold text-3xl md:text-4xl">
            Course categories
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Explore practical learning paths tailored for Kenyan farmers and
            extension programs.
          </p>
          <div className="mt-10 grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <a className="w-full" href={cat.href} key={cat.title}>
                <Card className="transition-colors hover:bg-muted/60">
                  <CardHeader className="pb-1">{cat.icon}</CardHeader>
                  <CardContent className="text-left">
                    <h3 className="mb-1 font-semibold">{cat.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {cat.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseCategories;
