import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useVisualFX } from '@/context/VisualFXProvider';
import { Button } from '@/components/ui/button';
import { Film, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const location = useLocation();
  const { setPreset } = useVisualFX();

  useEffect(() => {
    setPreset('standard');
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname, setPreset]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <div className="relative z-10 text-center space-y-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Film className="w-20 h-20 mx-auto text-primary/50 mb-6" />
          <h1 className="text-8xl font-display font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-display font-semibold mb-2">
            Scene Not Found
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            This page seems to have been cut from the final edit.
          </p>
          <Link to="/">
            <Button size="lg" className="rounded-2xl">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
