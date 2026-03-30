import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  major: text("major").notNull(),
  classAttendance: text("class_attendance").notNull(),
  studyHoursPerWeek: text("study_hours_per_week").notNull(),
  distractions: text("distractions").array().notNull(),
  feelsProductive: text("feels_productive").notNull(),
  sleepHours: text("sleep_hours").notNull(),
  productivityHabits: text("productivity_habits").array().notNull(),
  routineChange: text("routine_change"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
