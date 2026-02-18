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
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfile(userId);
    res.json(profile || null);
  });

  app.post(api.profile.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    
    try {
      const input = api.profile.update.input.parse(req.body);
      const existing = await storage.getProfile(userId);
      
      let profile;
      if (existing) {
        profile = await storage.updateProfile(userId, input);
      } else {
        // userId is handled by the storage layer but we pass it as part of the data
        // The storage implementation should handle the mapping correctly.
        profile = await storage.createProfile({ ...input, userId });
      }
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error("Profile update error:", err);
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
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
    }

    const allSchemes = await storage.getSchemes();

    // AI Logic
    try {
      const prompt = `
        You are an expert Indian agricultural scheme advisor. 
        Based on the farmer's profile below, identify which government schemes they are eligible for.
        
        Farmer Profile:
        - State: ${profile.state}
        - Land Size: ${profile.landSize} acres
        - Annual Income: ₹${profile.income}
        - Primary Crop: ${profile.crop}
        - Category: ${profile.category || "General"}

        Available Schemes to evaluate:
        ${allSchemes.map(s => `
        - ID: ${s.id}
        - Name: ${s.name}
        - Eligibility: ${s.description}
        - Income Limit: ${s.maxIncome ? `Up to ₹${s.maxIncome}` : "No limit"}
        - Land Limit: ${s.minLand && s.maxLand ? `${s.minLand} to ${s.maxLand} acres` : "No limit"}
        - States: ${s.supportedStates?.join(", ") || "All India"}
        `).join('\n')}

        Evaluation Rules:
        1. Compare farmer land size and income against scheme limits.
        2. Check if the farmer's state is supported by the scheme.
        3. If a scheme is "All India" or "All", it applies to all states.
        
        Response Format:
        Return ONLY a JSON object with a "recommendations" key containing an array of objects:
        {
          "recommendations": [
            {
              "scheme_id": number,
              "explanation": "Brief 1-2 sentence reason for eligibility"
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o for reliable JSON formatting
        messages: [{ role: "system", content: "You are a helpful assistant that only returns JSON." }, { role: "user", content: prompt }],
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
      "schemeId": "S001",
      "name": "PM-KISAN Samman Nidhi",
      "benefitAmount": 6000,
      "maxIncome": 200000,
      "minLand": "0",
      "maxLand": "10",
      "supportedStates": ["All"],
      "eligibleCrops": ["All"],
      "description": "Income support for small and marginal farmers.",
      "requiredDocuments": ["Aadhar Card", "Land Ownership Documents", "Bank Passbook"]
    },
    {
      "schemeId": "S002",
      "name": "Pradhan Mantri Fasal Bima Yojana",
      "benefitAmount": 50000,
      "maxIncome": 300000,
      "minLand": "0",
      "maxLand": "20",
      "supportedStates": ["All"],
      "eligibleCrops": ["All"],
      "description": "Comprehensive crop insurance against natural calamities.",
      "requiredDocuments": ["Insurance Proposal Form", "Land Record (7/12)", "Sowing Certificate"]
    },
    {
      "schemeId": "S003",
      "name": "Kisan Credit Card",
      "benefitAmount": 300000,
      "maxIncome": 500000,
      "minLand": "0.5",
      "maxLand": "15",
      "supportedStates": ["All"],
      "eligibleCrops": ["All"],
      "description": "Low interest institutional credit for agricultural needs.",
      "requiredDocuments": ["ID Proof", "Address Proof", "Land Tax Receipt"]
    },
    {
      "schemeId": "S004",
      "name": "Soil Health Card Scheme",
      "benefitAmount": 2000,
      "maxIncome": 1000000,
      "minLand": "0",
      "maxLand": "50",
      "supportedStates": ["All"],
      "eligibleCrops": ["All"],
      "description": "Provides soil testing support"
    },
    {
      "schemeId": "S005",
      "name": "PM Krishi Sinchai Yojana",
      "benefitAmount": 10000,
      "maxIncome": 300000,
      "minLand": "0.5",
      "maxLand": "15",
      "supportedStates": ["Maharashtra", "Karnataka", "Telangana"],
      "eligibleCrops": ["Sugarcane", "Cotton", "Rice"],
      "description": "Irrigation support scheme"
    },
    {
      "schemeId": "S006",
      "name": "National Food Security Mission",
      "benefitAmount": 8000,
      "maxIncome": 250000,
      "minLand": "0.5",
      "maxLand": "10",
      "supportedStates": ["Punjab", "Uttar Pradesh", "Bihar"],
      "eligibleCrops": ["Rice", "Wheat"],
      "description": "Increase food production"
    },
    {
      "schemeId": "S007",
      "name": "Paramparagat Krishi Vikas Yojana",
      "benefitAmount": 12000,
      "maxIncome": 200000,
      "minLand": "1",
      "maxLand": "5",
      "supportedStates": ["All"],
      "eligibleCrops": ["Organic"],
      "description": "Promotes organic farming"
    },
    {
      "schemeId": "S008",
      "name": "Micro Irrigation Scheme",
      "benefitAmount": 15000,
      "maxIncome": 300000,
      "minLand": "1",
      "maxLand": "20",
      "supportedStates": ["Maharashtra", "Gujarat"],
      "eligibleCrops": ["Sugarcane", "Cotton"],
      "description": "Supports drip irrigation"
    },
    {
      "schemeId": "S009",
      "name": "Dairy Entrepreneurship Development Scheme",
      "benefitAmount": 50000,
      "maxIncome": 400000,
      "minLand": "0",
      "maxLand": "10",
      "supportedStates": ["All"],
      "eligibleCrops": ["Dairy"],
      "description": "Supports dairy farming"
    },
    {
      "schemeId": "S010",
      "name": "National Mission on Sustainable Agriculture",
      "benefitAmount": 20000,
      "maxIncome": 300000,
      "minLand": "1",
      "maxLand": "10",
      "supportedStates": ["All"],
      "eligibleCrops": ["Millets", "Pulses"],
      "description": "Promotes sustainable farming"
    }
  ];

  for (const scheme of schemesData) {
    await storage.createScheme(scheme as any);
  }
}
