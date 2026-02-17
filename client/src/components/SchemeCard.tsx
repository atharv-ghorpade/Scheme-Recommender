import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sprout } from "lucide-react";
import type { Scheme } from "@shared/schema";

interface SchemeCardProps {
  scheme: Scheme;
  explanation?: string;
  index?: number;
}

export function SchemeCard({ scheme, explanation, index = 0 }: SchemeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group bg-card">
        <CardHeader className="p-6 bg-secondary/30 border-b border-border/50">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
                {scheme.name}
              </h3>
              <div className="mt-2 flex gap-2">
                {scheme.stateFilter ? (
                  <Badge variant="outline" className="bg-background text-xs font-medium">
                    {scheme.stateFilter}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-background text-xs font-medium">
                    Central
                  </Badge>
                )}
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs">
                  Active
                </Badge>
              </div>
            </div>
            <div className="bg-background p-2 rounded-full shadow-sm">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-grow space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-foreground/80 leading-relaxed text-sm">
              {scheme.description}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Benefits
            </h4>
            <p className="text-foreground/90 font-medium text-sm">
              {scheme.benefit}
            </p>
          </div>

          {explanation && (
            <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2 text-accent-foreground font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Why you're eligible
              </div>
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                "{explanation}"
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 mt-auto">
          <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors" variant="outline">
            View Details
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
