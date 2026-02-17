import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sprout, Tractor, LineChart } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground mb-6 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  AI-Powered Agriculture Assistance
                </div>
                
                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6 text-balance">
                  Maximize Your Harvest with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">Smart Schemes</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
                  Discover government agricultural schemes tailored exactly to your profile. 
                  We use advanced AI to match your land size, crops, and location to the best financial opportunities.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a href="/api/login">
                    <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-2 hover:bg-secondary/50">
                    Learn How it Works
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Abstract Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px]" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white/50 border-t border-border/40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard 
                icon={<ShieldCheck className="w-10 h-10 text-primary" />}
                title="Personalized Eligibility"
                description="Our AI analyzes your specific farming data to find schemes you actually qualify for—no more guessing."
                delay={0.1}
              />
              <FeatureCard 
                icon={<LineChart className="w-10 h-10 text-accent" />}
                title="Financial Growth"
                description="Access subsidies, loans, and insurance plans that can significantly improve your agricultural income."
                delay={0.2}
              />
              <FeatureCard 
                icon={<Tractor className="w-10 h-10 text-green-700" />}
                title="Simplified Process"
                description="We break down complex government jargon into simple, actionable steps specifically for you."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Hero Image Section - using Unsplash with credit */}
        <section className="py-24 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative aspect-[16/9] md:aspect-[21/9]"
          >
            {/* agriculture field sunlight */}
            <img 
              src="https://pixabay.com/get/ga3312e293e926e2ab13ab90531bf08647cd55069a531c1fa2d0b3d939e4f3d64e6e1c2cc90dd93fd1dd69995b978abce065d43eb1d04626b76211f474062e0ca_1280.jpg" 
              alt="Lush green agricultural field at sunrise" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 md:p-12">
              <h2 className="text-white font-display font-bold text-3xl md:text-4xl max-w-2xl">
                Empowering farmers with technology for a sustainable future.
              </h2>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sprout className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg">AgriWise</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AgriWise Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-lg transition-all duration-300 group"
    >
      <div className="mb-6 p-3 rounded-xl bg-secondary/50 w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-display font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
