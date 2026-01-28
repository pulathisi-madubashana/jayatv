import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const { theme, toggleTheme, prefersReducedMotion } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.4 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="h-12 w-12 rounded-full border-border/50 bg-card/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-card hover:shadow-xl"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <motion.div
          key={theme}
          initial={{ rotate: prefersReducedMotion ? 0 : -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-jaya-gold" />
          ) : (
            <Moon className="h-5 w-5 text-muted-foreground" />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
