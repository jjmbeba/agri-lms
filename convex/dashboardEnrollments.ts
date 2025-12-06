import { query } from "./_generated/server";

type EnrollmentTimeseriesPoint = {
  date: string;
  count: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS = 90;

export const getEnrollmentsTimeseries = query({
  args: {},
  handler: async (ctx): Promise<EnrollmentTimeseriesPoint[]> => {
    const now = Date.now();
    const start = now - DAYS * MS_PER_DAY;
    const enrollments = await ctx.db.query("enrollment").collect();

    const buckets = new Map<string, number>();
    for (const enrollment of enrollments) {
      const timestamp = Date.parse(enrollment.enrolledAt);
      if (Number.isNaN(timestamp) || timestamp < start) {
        continue;
      }
      const date = new Date(timestamp);
      date.setUTCHours(0, 0, 0, 0);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    const points: EnrollmentTimeseriesPoint[] = [];
    for (let i = DAYS; i >= 0; i -= 1) {
      const date = new Date(start + i * MS_PER_DAY);
      date.setUTCHours(0, 0, 0, 0);
      const key = date.toISOString().slice(0, 10);
      points.push({ date: key, count: buckets.get(key) ?? 0 });
    }

    return points;
  },
});

