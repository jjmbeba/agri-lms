import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
// biome-ignore lint/performance/noNamespaceImport: Easier to import all schema at once
import * as schema from "./schema";

const db = drizzle(env.DATABASE_URL, { schema });

export default db;
