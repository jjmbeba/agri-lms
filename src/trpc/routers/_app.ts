import { createTRPCRouter } from "../init";
import { coursesRouter } from "./courses";
import { departmentsRouter } from "./departments";

export const appRouter = createTRPCRouter({
  departments: departmentsRouter,
  courses: coursesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
