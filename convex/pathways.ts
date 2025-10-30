import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { restrictRoles } from "./auth";

// CREATE
export const createPathway = mutation({
  args: {
    name: v.string(),
    courseIds: v.array(v.id("course")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);
    
    return await ctx.db.insert("certificationPathway", {
      name: args.name,
      courseIds: args.courseIds,
    });
  },
});

// GET ALL
export const getPathways = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("certificationPathway").collect();
  },
});

// GET BY ID
export const getPathway = query({
  args: { id: v.id("certificationPathway") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// UPDATE
export const updatePathway = mutation({
  args: {
    id: v.id("certificationPathway"),
    name: v.string(),
    courseIds: v.array(v.id("course")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);
    await ctx.db.patch(args.id, {
      name: args.name,
      courseIds: args.courseIds,
    });
    return args.id;
  },
});

// DELETE
export const deletePathway = mutation({
  args: { id: v.id("certificationPathway") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
