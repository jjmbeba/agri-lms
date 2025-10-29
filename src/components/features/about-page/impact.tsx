import { impact } from "@/components/features/about-page/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Impact = () => {
  return (
    <section className="py-16" id="impact">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <h2 className="mb-6 font-bold text-3xl">Our Impact</h2>
          <p className="text-lg leading-relaxed">
            How our work contributes to sustainable development
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {impact.map((item) => (
            <Card className="h-full" key={item.title}>
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
