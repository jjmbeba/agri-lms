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
  draftAssignment: defineTable({
    draftModuleContentId: v.id("draftModuleContent"),
    instructions: v.string(),
    dueDate: v.optional(v.string()),
    maxScore: v.number(),
    submissionType: v.union(
      v.literal("file"),
      v.literal("text"),
      v.literal("url")
    ),
  }),
  assignment: defineTable({
    moduleContentId: v.id("moduleContent"),
    instructions: v.string(),
    dueDate: v.optional(v.string()),
    maxScore: v.number(),
    submissionType: v.union(
      v.literal("file"),
      v.literal("text"),
      v.literal("url")
    ),
  }),
  enrollment: defineTable({
    courseId: v.id("course"),
    userId: v.string(),
    enrolledAt: v.string(),
  }),
  moduleProgress: defineTable({
    moduleId: v.id("module"),
    userId: v.string(),
    enrollmentId: v.id("enrollment"),
    status: v.union(
      v.literal("inProgress"),
      v.literal("completed"),
      v.literal("notStarted")
    ),
    progressPercentage: v.number(),
    completedAt: v.optional(v.string()),
  }),
  courseProgress: defineTable({
    courseId: v.id("course"),
    userId: v.string(),
    enrollmentId: v.id("enrollment"),
    status: v.union(v.literal("inProgress"), v.literal("completed")),
    progressPercentage: v.number(),
    completedAt: v.optional(v.string()),
  }),
  assignmentSubmission: defineTable({
    assignmentId: v.id("assignment"),
    userId: v.string(),
    userName: v.string(),
    enrollmentId: v.id("enrollment"),
    submissionType: v.union(
      v.literal("file"),
      v.literal("text"),
      v.literal("url")
    ),
    content: v.string(), // File URL, text content, or URL
    submittedAt: v.string(),
    isLate: v.boolean(),
    attemptNumber: v.number(),
    status: v.union(v.literal("submitted"), v.literal("graded")),
    // Optional grading fields for future implementation
    score: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedAt: v.optional(v.string()),
    gradedBy: v.optional(v.string()),
  }),
  certificationPathway: defineTable({
    name: v.string(),
    courseIds: v.array(v.id("course")),
  }),
});
