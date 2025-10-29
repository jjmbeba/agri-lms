import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Overview = () => {
  return (
    <section className="py-16" id="overview">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <h2 className="mb-6 font-bold text-3xl">Company Overview</h2>
          <p className="text-lg leading-relaxed">
            Afrifoods Limited operates under the Company Acts of Kenya with a
            robust governance structure featuring a 7-member advisory board and
            a Chief Executive Officer who leads day-to-day operations and
            manages a team of business mentors and coaches.
          </p>
        </div>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-bold text-2xl">2015</CardTitle>
              <CardDescription>Founded & Registered</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Registered under the Company Acts of Kenya in December 2015</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-bold text-2xl">7</CardTitle>
              <CardDescription>Advisory Board Members</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Experienced professionals guiding strategic direction</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-bold text-2xl">1</CardTitle>
              <CardDescription>CEO & Leadership Team</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Chief Executive Officer leading daily operations and mentor team
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Overview;
