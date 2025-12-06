import { query } from "./_generated/server";
import { restrictRoles } from "./auth";

type AdminDashboardStats = {
  totalLearners: number;
  publishedCourses: number;
  totalReviews: number;
  totalRevenueCents: number;
};

export const getAdminDashboardStats = query({
  args: {},
  handler: async (ctx): Promise<AdminDashboardStats> => {
    const identity = await ctx.auth.getUserIdentity();
    restrictRoles(identity, ["admin"]);

    const enrollments = await ctx.db.query("enrollment").collect();
    const totalLearners = new Set(enrollments.map((enrollment) => enrollment.userId)).size;

    const publishedCourses = await ctx.db
      .query("course")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    const totalReviews = await ctx.db.query("courseReview").collect();

    const successfulTransactions = await ctx.db
      .query("transaction")
      .filter((q) => q.eq(q.field("status"), "success"))
      .collect();

    const totalRevenueCents = successfulTransactions.reduce(
      (sum, transaction) => sum + transaction.amountCents,
      0
    );

    return {
      totalLearners,
      publishedCourses: publishedCourses.length,
      totalReviews: totalReviews.length,
      totalRevenueCents,
    };
  },
});

