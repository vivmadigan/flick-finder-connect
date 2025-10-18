import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '@/context/PreferencesContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { GenrePicker } from '@/features/onboarding/GenrePicker';
import { LengthPicker } from '@/features/onboarding/LengthPicker';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = usePreferences();
  const { setPreset } = useVisualFX();
  const [step, setStep] = useState(1);

  useEffect(() => {
    setPreset('standard');
  }, [setPreset]);

  const handleNext = () => {
    if (step === 1 && !preferences.genre) return;
    if (step === 2 && !preferences.lengthBucket) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/discover');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!preferences.genre;
    if (step === 2) return !!preferences.lengthBucket;
    return true;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-micro ${
                  s === step
                    ? 'w-8 bg-primary'
                    : s < step
                    ? 'w-8 bg-primary/50'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
              >
                <GenrePicker
                  selected={preferences.genre}
                  onSelect={(genre) => updatePreferences({ genre })}
                />
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
              >
                <LengthPicker
                  selected={preferences.lengthBucket}
                  onSelect={(length) => updatePreferences({ lengthBucket: length })}
                />
              </motion.div>
            )}
            
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                className="text-center space-y-6"
              >
                <h2 className="text-3xl font-display font-semibold">You're all set!</h2>
                <div className="max-w-md mx-auto space-y-4 text-left">
                  <div className="p-4 rounded-2xl backdrop-blur-glass border border-border/50">
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-semibold">{preferences.genre}</p>
                  </div>
                  <div className="p-4 rounded-2xl backdrop-blur-glass border border-border/50">
                    <p className="text-sm text-muted-foreground">Length</p>
                    <p className="font-semibold capitalize">{preferences.lengthBucket}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Ready to start discovering movies?
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button onClick={handleNext} disabled={!canProceed()} className="rounded-2xl px-4 py-3">
              {step === 3 ? 'Start Discovering' : 'Continue'}
              {step < 3 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
