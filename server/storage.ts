import { users, profiles, schemes, recommendations, type User, type InsertUser, type Profile, type InsertProfile, type Scheme, type Recommendation } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;

  getSchemes(): Promise<Scheme[]>;
  createScheme(scheme: typeof schemes.$inferInsert): Promise<Scheme>;
  
  createRecommendation(recommendation: typeof recommendations.$inferInsert): Promise<Recommendation>;
  getRecommendations(userId: string): Promise<Recommendation[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(insertProfile: any): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async updateProfile(userId: string, updateProfile: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updateProfile, updatedAt: new Date() } as any)
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async getSchemes(): Promise<Scheme[]> {
    return await db.select().from(schemes);
  }

  async createScheme(insertScheme: typeof schemes.$inferInsert): Promise<Scheme> {
    const [scheme] = await db.insert(schemes).values(insertScheme).returning();
    return scheme;
  }

  async createRecommendation(insertRecommendation: typeof recommendations.$inferInsert): Promise<Recommendation> {
    const [recommendation] = await db.insert(recommendations).values(insertRecommendation).returning();
    return recommendation;
  }

  async getRecommendations(userId: string): Promise<Recommendation[]> {
    return await db.select().from(recommendations).where(eq(recommendations.userId, userId));
  }
}

export const storage = new DatabaseStorage();
