import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("learner"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const department = pgTable("department", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const course = pgTable("course", {
  id: uuid().primaryKey().defaultRandom(),
  title: text("title").notNull(),
  tags: text("tags").notNull(),
  status: text("status").default("draft"),
  departmentId: uuid("department_id")
    .references(() => department.id, {
      onDelete: "cascade",
    })
    .notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const courseVersion = pgTable("course_version", {
  id: uuid().primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .references(() => course.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("version").notNull(),
  changeLog: text("change_log").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Updated modules table - removed type and content fields
export const modules = pgTable("module", {
  id: uuid().primaryKey().defaultRandom(),
  courseVersionId: uuid("course_version_id")
    .references(() => courseVersion.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// New module content table for multiple content items per module
export const moduleContent = pgTable("module_content", {
  id: uuid().primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .references(() => modules.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // 'text', 'video', 'pdf', 'quiz', 'assignment', 'link'
  position: integer("position").notNull(),
  t: text("content").notNull(), // URL, text, or file path
  metadata: jsonb("metadata"), // Flexible metadata storage
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Updated draft modules table - removed type and content fields
export const draftModules = pgTable("draft_module", {
  id: uuid().primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .references(() => course.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// New draft module content table for multiple content items per draft module
export const draftModuleContent = pgTable("draft_module_content", {
  id: uuid().primaryKey().defaultRandom(),
  draftModuleId: uuid("draft_module_id")
    .references(() => draftModules.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // 'text', 'video', 'pdf', 'quiz', 'assignment', 'link'
  title: text("title").notNull(),
  content: text("content").notNull(), // URL, text, or file path
  metadata: jsonb("metadata"), // Flexible metadata storage
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
