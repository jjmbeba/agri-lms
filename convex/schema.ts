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
    slug: v.string(),
    tags: v.array(v.string()),
    status: v.string(),
    departmentId: v.id("department"),
    description: v.string(),
    priceShillings: v.number(),
  }).index("slug", ["slug"]),
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
    priceShillings: v.number(),
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
    priceShillings: v.number(),
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
  transaction: defineTable({
    reference: v.string(),
    provider: v.literal("paystack"),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("abandoned")
    ),
    amountKobo: v.number(),
    currency: v.string(),
    userId: v.string(),
    courseId: v.id("course"),
    moduleId: v.optional(v.id("module")),
    accessScope: v.union(v.literal("course"), v.literal("module")),
    metadata: v.optional(v.any()),
    rawEvent: v.optional(v.any()),
    verifiedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("reference", ["reference"]),
  moduleAccess: defineTable({
    userId: v.string(),
    courseId: v.id("course"),
    moduleId: v.id("module"),
    transactionId: v.id("transaction"),
    grantedAt: v.string(),
  })
    .index("user_module", ["userId", "moduleId"])
    .index("user_course", ["userId", "courseId"]),
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
