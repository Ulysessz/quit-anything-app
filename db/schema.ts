import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable(
  "profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userEmail: text("user_email").notNull(),
    displayName: text("display_name").notNull(),
    habit: text("habit").notNull(),
    approach: text("approach").notNull(),
    reason: text("reason").notNull(),
    dangerDays: text("danger_days").notNull().default(""),
    dangerStart: text("danger_start").notNull().default("17:00"),
    dangerEnd: text("danger_end").notNull().default("20:00"),
    replacementPlan: text("replacement_plan").notNull(),
    reminderEnabled: integer("reminder_enabled", { mode: "boolean" })
      .notNull()
      .default(true),
    reminderDays: text("reminder_days").notNull().default("Mon,Tue,Wed,Thu,Fri"),
    reminderTime: text("reminder_time").notNull().default("16:30"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("profiles_user_email_idx").on(table.userEmail)],
);

export const checkIns = sqliteTable("check_ins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  result: text("result").notNull(),
  urgeLevel: integer("urge_level").notNull(),
  trigger: text("trigger").notNull(),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
