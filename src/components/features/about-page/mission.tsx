import { MISSION } from "@/components/features/about-page/constants";

const Mission = () => {
  return (
    <section className="py-16" id="mission-statement">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-bold text-3xl">Our Mission</h2>
          <p className="text-lg leading-relaxed">{MISSION}</p>
        </div>
      </div>
    </section>
  );
};

export default Mission;
