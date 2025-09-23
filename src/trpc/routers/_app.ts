import { createTRPCRouter } from "../init";
import { coursesRouter } from "./courses";
import { departmentsRouter } from "./departments";
import { modulesRouter } from "./modules";

export const appRouter = createTRPCRouter({
  departments: departmentsRouter,
  courses: coursesRouter,
  modules: modulesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
