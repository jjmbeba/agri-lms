import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// @snippet start schema
export default defineSchema({
  department: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
  }),
  course: defineTable({
    title: v.string(),
    tags: v.array(v.string()),
    status: v.string(),
    departmentId: v.id("department"),
    description: v.string(),
  }),
  courseVersion: defineTable({
    courseId: v.id("course"),
    versionNumber: v.number(),
    changeLog: v.string(),
  }),
  module: defineTable({
    courseVersionId: v.id("courseVersion"),
    title: v.string(),
    position: v.number(),
    description: v.string(),
  }),
  moduleContent: defineTable({
    moduleId: v.id("module"),
    type: v.string(),
    position: v.number(),
    title: v.string(),
    content: v.string(),
    orderIndex: v.number(),
  }),
  draftModule: defineTable({
    courseId: v.id("course"),
    title: v.string(),
    position: v.number(),
    description: v.string(),
  }),
  draftModuleContent: defineTable({
    draftModuleId: v.id("draftModule"),
    type: v.string(),
    position: v.number(),
    title: v.string(),
    content: v.string(),
    orderIndex: v.number(),
  }),
});
