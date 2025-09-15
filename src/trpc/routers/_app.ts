import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categories";
import { coursesRouter } from "./courses";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  courses: coursesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
