import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BokehBackdrop } from '@/components/BokehBackdrop';
import { BokehOrbs } from '@/components/BokehOrbs';
import { Film, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const steps = [
    {
      icon: Film,
      title: 'Pick your movies',
      description: 'Swipe through curated films that match your mood and preferences',
    },
    {
      icon: Heart,
      title: 'Find your match',
      description: 'Connect with someone who shares your cinematic taste',
    },
    {
      icon: MessageCircle,
      title: 'Start chatting',
      description: 'Plan your perfect movie date together',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BokehBackdrop />
      <BokehOrbs />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <div className="inline-block">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Film className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                CineMatch
              </h1>
            </div>
            
            <p className="text-2xl md:text-3xl text-foreground/90 font-light">
              Find your perfect movie date
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Match with someone who shares your taste in cinema. Swipe, connect, and discover
              your next favorite film together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-glow">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 backdrop-blur-glass"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Steps Section */}
        <section className="py-20 px-4 border-t border-border/50 backdrop-blur-glass">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How it works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center space-y-4"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
