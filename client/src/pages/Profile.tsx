import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Save, User } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { insertProfileSchema, type InsertProfile } from "@shared/schema";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CATEGORIES = ["General", "OBC", "SC", "ST"];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const form = useForm<InsertProfile>({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      state: "",
      landSize: "",
      income: 0,
      crop: "",
      category: "General",
    },
  });

  // Populate form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        state: profile.state,
        landSize: profile.landSize,
        income: profile.income,
        crop: profile.crop,
        category: profile.category || "General",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: InsertProfile) => {
    updateProfile(data, {
      onSuccess: () => {
        // Optional: Redirect to dashboard after successful save if needed
        // setLocation("/dashboard");
      },
    });
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Farmer Profile</h1>
            <p className="text-muted-foreground mt-2">
              Complete your profile to get personalized scheme recommendations powered by AI.
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="bg-secondary/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Details</CardTitle>
                  <CardDescription>Enter your agricultural details below.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="state">State / Region</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("state", val)}
                    defaultValue={form.getValues("state")}
                  >
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.state && (
                    <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="landSize">Land Size (Acres)</Label>
                    <Input 
                      id="landSize" 
                      placeholder="e.g. 2.5" 
                      className="h-12 text-base"
                      {...form.register("landSize")} 
                    />
                    {form.formState.errors.landSize && (
                      <p className="text-sm text-destructive">{form.formState.errors.landSize.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income (₹)</Label>
                    <Input 
                      id="income" 
                      placeholder="e.g. 150000" 
                      className="h-12 text-base"
                      {...form.register("income")} 
                    />
                    {form.formState.errors.income && (
                      <p className="text-sm text-destructive">{form.formState.errors.income.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crop">Primary Crop</Label>
                  <Input 
                    id="crop" 
                    placeholder="e.g. Wheat, Rice, Cotton" 
                    className="h-12 text-base"
                    {...form.register("crop")} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Mention your main crop for better specific scheme matching.
                  </p>
                  {form.formState.errors.crop && (
                    <p className="text-sm text-destructive">{form.formState.errors.crop.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("category", val)}
                    defaultValue={form.getValues("category") || "General"}
                  >
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Select your category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <div className="pt-4 flex gap-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
