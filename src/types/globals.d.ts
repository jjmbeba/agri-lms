// Create a type for the roles
/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: Easier to follow docs */
export type Roles = "admin" | "instructor" | "learner";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
