type ModulePageProps = {
  params: { course: string; module: string };
};

const Page = async ({ params }: ModulePageProps) => {
  const { course: courseId, module: moduleId } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      Module Page for {moduleId} in {courseId}
    </div>
  );
};

export default Page;
