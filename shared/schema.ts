import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users as authUsers } from "./models/auth";

// Re-export auth models for use in other files
export * from "./models/auth";

// Extend the auth users table with profile fields
// Note: We can't actually "extend" the table definition easily in Drizzle without modifying the original file
// effectively. Since we're in a "lite" mode and I can't modify the auth blueprint files easily without
// potentially breaking future updates, I'll create a separate profile table linked to the user.
// actually, the instructions say "rewrite shared/models/chat.ts" if needed, but for auth it says "DO NOT modify".
// So I will create a `profiles` table.

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Links to auth.users.id
  state: text("state").notNull(),
  landSize: text("land_size").notNull(), // text because it might be "2 acres" or just "2"
  income: text("income").notNull(),
  crop: text("crop").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schemes = pgTable("schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  benefit: text("benefit").notNull(),
  criteria: text("criteria").notNull(), // Description of eligibility
  stateFilter: text("state_filter"), // Optional state restriction
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  schemeId: integer("scheme_id").notNull().references(() => schemes.id),
  explanation: text("explanation").notNull(), // AI generated reason
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ 
  id: true, 
  updatedAt: true,
  userId: true // We'll set this from the session
});

export const insertSchemeSchema = createInsertSchema(schemes).omit({ id: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Scheme = typeof schemes.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
