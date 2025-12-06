/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as assignments from "../assignments.js";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as courses from "../courses.js";
import type * as dashboard from "../dashboard.js";
import type * as departments from "../departments.js";
import type * as enrollments from "../enrollments.js";
import type * as modules from "../modules.js";
import type * as pathways from "../pathways.js";
import type * as payments from "../payments.js";
import type * as reviews from "../reviews.js";
import type * as utils_slug from "../utils/slug.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  assignments: typeof assignments;
  auth: typeof auth;
  constants: typeof constants;
  courses: typeof courses;
  dashboard: typeof dashboard;
  departments: typeof departments;
  enrollments: typeof enrollments;
  modules: typeof modules;
  pathways: typeof pathways;
  payments: typeof payments;
  reviews: typeof reviews;
  "utils/slug": typeof utils_slug;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
