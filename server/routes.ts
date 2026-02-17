import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile Routes
  app.get(api.profile.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const profile = await storage.getProfile(userId);
    res.json(profile || null);
  });

  app.post(api.profile.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    
    try {
      const input = api.profile.update.input.parse(req.body);
      const existing = await storage.getProfile(userId);
      
      let profile;
      if (existing) {
        profile = await storage.updateProfile(userId, input);
      } else {
        profile = await storage.createProfile({ ...input, userId });
      }
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Schemes List
  app.get(api.schemes.list.path, async (req, res) => {
    const schemes = await storage.getSchemes();
    res.json(schemes);
  });

  // Generate Recommendations
  app.post(api.recommendations.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const profile = await storage.getProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
    }

    const allSchemes = await storage.getSchemes();

    // AI Logic
    try {
      const prompt = `
        Based on the following farmer profile, identify which government schemes they are eligible for and explain why.
        
        Profile:
        State: ${profile.state}
        Land Size: ${profile.landSize}
        Income: ${profile.income}
        Crop: ${profile.crop}

        Available Schemes:
        ${allSchemes.map(s => `- ID: ${s.id}, Name: ${s.name}, Criteria: ${s.criteria}, State Filter: ${s.stateFilter || "All"}`).join('\n')}

        Return a JSON array of objects, where each object has:
        - scheme_id: The ID of the matching scheme
        - explanation: A concise explanation of why they are eligible (1-2 sentences).
        
        Only include eligible schemes.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using a smart model for reasoning
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const recommendations = result.recommendations || result.schemes || []; // Handle potential variation in JSON structure

      // Format response to match API contract
      const formattedRecommendations = recommendations.map((rec: any) => {
        const scheme = allSchemes.find(s => s.id === rec.scheme_id);
        return {
          scheme,
          explanation: rec.explanation
        };
      }).filter((r: any) => r.scheme !== undefined);

      res.json(formattedRecommendations);

    } catch (error) {
      console.error("AI Recommendation Error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Seed Data
  seedSchemes();

  return httpServer;
}

async function seedSchemes() {
  const existing = await storage.getSchemes();
  if (existing.length > 0) return;

  const schemesData = [
    {
      name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      description: "Income support of Rs. 6000/- per year to all landholding farmer families.",
      benefit: "Rs. 6000 per year",
      criteria: "Small and marginal farmers with land up to 2 hectares.",
      stateFilter: null
    },
    {
      name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      description: "Crop insurance scheme providing financial support in case of crop failure.",
      benefit: "Insurance cover against crop loss",
      criteria: "Farmers growing notified crops in notified areas.",
      stateFilter: null
    },
    {
      name: "Kisan Credit Card (KCC)",
      description: "Provides adequate and timely credit support to farmers.",
      benefit: "Low interest loans",
      criteria: "All farmers, tenant farmers, sharecroppers.",
      stateFilter: null
    },
    {
      name: "Soil Health Card Scheme",
      description: "Provides information to farmers on nutrient status of their soil.",
      benefit: "Soil health report and fertilizer recommendations",
      criteria: "All farmers.",
      stateFilter: null
    },
    {
      name: "Paramparagat Krishi Vikas Yojana (PKVY)",
      description: "Promotes organic farming through cluster approach.",
      benefit: "Financial assistance for organic farming",
      criteria: "Farmers willing to adopt organic farming.",
      stateFilter: null
    },
    {
      name: "Rythu Bandhu Scheme",
      description: "Investment support scheme for farmers in Telangana.",
      benefit: "Rs. 5000 per acre per season",
      criteria: "Farmers owning land in Telangana.",
      stateFilter: "Telangana"
    },
    {
      name: "KALIA Scheme",
      description: "Financial assistance to cultivators and landless agricultural laborers in Odisha.",
      benefit: "Rs. 10000 per family per year",
      criteria: "Small and marginal farmers, landless laborers in Odisha.",
      stateFilter: "Odisha"
    },
    {
      name: "YSR Rythu Bharosa",
      description: "Financial assistance to farmers in Andhra Pradesh.",
      benefit: "Rs. 13500 per year",
      criteria: "Farmer families in Andhra Pradesh.",
      stateFilter: "Andhra Pradesh"
    }
  ];

  for (const scheme of schemesData) {
    await storage.createScheme(scheme);
  }
}
