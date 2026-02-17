import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { SchemeCard } from "@/components/SchemeCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { useProfile } from "@/hooks/use-profile";
import { useGenerateRecommendations } from "@/hooks/use-schemes";

export default function Dashboard() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { 
    mutate: generate, 
    data: recommendations, 
    isPending: isGenerating,
    error: generationError
  } = useGenerateRecommendations();

  const [hasGenerated, setHasGenerated] = useState(false);

  // If recommendations generated successfully, mark as generated
  if (recommendations && !hasGenerated) {
    setHasGenerated(true);
  }

  const handleGenerate = () => {
    generate();
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no profile exists, prompt user to create one
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-primary/5 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">Profile Required</h2>
            <p className="text-muted-foreground mb-8">
              We need to know a bit about your farm to recommend the best schemes for you.
            </p>
            <Link href="/profile">
              <Button size="lg" className="w-full">Create Profile</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Hello, {profile.userId ? "Farmer" : "Friend"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here are schemes tailored for your {profile.landSize} acres in {profile.state}.
            </p>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="shadow-lg shadow-accent/20 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>

        {generationError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{generationError.message}</AlertDescription>
          </Alert>
        )}

        {/* Empty State / Initial State */}
        {!hasGenerated && !isGenerating && !recommendations && (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-secondary/10">
            <div className="max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to find schemes?</h3>
              <p className="text-muted-foreground mb-6">
                Click the "Generate Recommendations" button above to let our AI analyze your profile and find the best matches.
              </p>
              <Button onClick={handleGenerate} variant="outline">
                Start Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {recommendations && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item, index) => (
              <SchemeCard 
                key={item.scheme.id} 
                scheme={item.scheme} 
                explanation={item.explanation}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty Results after generation */}
        {recommendations && recommendations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              No specific schemes found for your criteria yet. Try updating your profile details.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
