import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WhatWeDo = () => {
  return (
    <section className="py-16" id="mission">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <h2 className="mb-6 font-bold text-3xl">What We Do</h2>
          <p className="text-lg leading-relaxed">
            Our core focus is providing comprehensive business and technical
            solutions that enhance value chain productivity, connectivity,
            financing, and access to markets.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">📈</span>
              </div>
              <CardTitle className="text-xl">Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Enhancing value chain productivity through innovative business
                solutions and process optimization
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">🔗</span>
              </div>
              <CardTitle className="text-xl">Connectivity</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Building strong networks and connections across agricultural
                value chains
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-xl">Financing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Facilitating access to financial resources and investment
                opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">🏪</span>
              </div>
              <CardTitle className="text-xl">Market Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Creating pathways to local and international markets for
                agricultural products
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
