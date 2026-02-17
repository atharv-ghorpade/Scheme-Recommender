import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users as authUsers } from "./models/auth";

// Re-export auth models for use in other files
export * from "./models/auth";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Links to auth.users.id
  state: text("state").notNull(),
  landSize: text("land_size").notNull(), 
  income: integer("income").notNull(),
  crop: text("crop").notNull(),
  category: text("category"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schemes = pgTable("schemes", {
  id: serial("id").primaryKey(),
  schemeId: text("scheme_external_id").unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  benefitAmount: integer("benefit_amount"),
  maxIncome: integer("max_income"),
  minLand: decimal("min_land", { precision: 10, scale: 2 }),
  maxLand: decimal("max_land", { precision: 10, scale: 2 }),
  supportedStates: jsonb("supported_states").$type<string[]>(),
  eligibleCrops: jsonb("eligible_crops").$type<string[]>(),
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
  userId: true 
});

export const insertSchemeSchema = createInsertSchema(schemes).omit({ id: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Scheme = typeof schemes.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
