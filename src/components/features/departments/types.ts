import type { RouterOutputs } from "@/trpc/init";

export type Department = RouterOutputs["departments"]["getById"][number];
