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
    status: v.union(
      v.literal("draft"),
      v.literal("coming-soon"),
      v.literal("published")
    ),
    departmentId: v.id("department"),
    description: v.string(),
    priceShillings: v.number(),
    handout: v.optional(v.string()),
  }).index("slug", ["slug"]),
  courseVersion: defineTable({
    courseId: v.id("course"),
    versionNumber: v.number(),
    changeLog: v.string(),
  }),
  module: defineTable({
    courseVersionId: v.id("courseVersion"),
    title: v.string(),
    slug: v.string(),
    position: v.number(),
    description: v.string(),
    priceShillings: v.number(),
  }).index("slug", ["slug"]),
  moduleContent: defineTable({
    moduleId: v.id("module"),
    type: v.string(),
    position: v.number(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    orderIndex: v.number(),
  }).index("module_slug", ["moduleId", "slug"]),
  draftModule: defineTable({
    courseId: v.id("course"),
    title: v.string(),
    slug: v.string(),
    position: v.number(),
    description: v.string(),
    priceShillings: v.number(),
  }).index("course_slug", ["courseId", "slug"]),
  draftModuleContent: defineTable({
    draftModuleId: v.id("draftModule"),
    type: v.string(),
    position: v.number(),
    title: v.string(),
    slug: v.string(),
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
  draftQuiz: defineTable({
    draftModuleContentId: v.id("draftModuleContent"),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(
          v.object({
            text: v.string(),
            isCorrect: v.boolean(),
          })
        ),
        points: v.number(),
      })
    ),
    timerMinutes: v.optional(v.number()),
    timerSeconds: v.optional(v.number()),
    maxScore: v.number(),
    instructions: v.optional(v.string()),
  }),
  quiz: defineTable({
    moduleContentId: v.id("moduleContent"),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(
          v.object({
            text: v.string(),
            isCorrect: v.boolean(),
          })
        ),
        points: v.number(),
      })
    ),
    timerMinutes: v.optional(v.number()),
    timerSeconds: v.optional(v.number()),
    maxScore: v.number(),
    instructions: v.optional(v.string()),
  }),
  enrollment: defineTable({
    courseId: v.id("course"),
    userId: v.string(),
    enrolledAt: v.string(),
    admissionLetterUrl: v.optional(v.string()),
  }).index("user_course", ["userId", "courseId"]),
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
    amountCents: v.number(),
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
  courseReview: defineTable({
    courseId: v.id("course"),
    enrollmentId: v.id("enrollment"),
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("course", ["courseId"])
    .index("user_course", ["userId", "courseId"]),
  courseRequest: defineTable({
    userId: v.string(),
    userName: v.optional(v.string()),
    title: v.string(),
    reason: v.string(),
    createdAt: v.string(),
  }).index("user", ["userId"]),
  courseNotification: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    courseId: v.id("course"),
    subscribedAt: v.string(),
  })
    .index("user_course", ["userId", "courseId"])
    .index("course", ["courseId"]),
});
