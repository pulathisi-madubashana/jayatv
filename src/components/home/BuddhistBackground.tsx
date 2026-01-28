import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Dharma Chakra SVG Component
const DharmaChakra = () => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {/* Outer ring */}
    <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    
    {/* Inner hub */}
    <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    <circle cx="100" cy="100" r="12" fill="currentColor" opacity="0.15" />
    
    {/* 8 Spokes */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <g key={angle} transform={`rotate(${angle} 100 100)`}>
        <line x1="100" y1="20" x2="100" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        {/* Spoke ends with dharma symbols */}
        <circle cx="100" cy="15" r="4" fill="currentColor" opacity="0.25" />
      </g>
    ))}
    
    {/* Decorative inner petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <g key={`petal-${angle}`} transform={`rotate(${angle} 100 100)`}>
        <ellipse cx="100" cy="55" rx="8" ry="15" fill="currentColor" opacity="0.08" />
      </g>
    ))}
  </svg>
);

// Petal component
interface PetalProps {
  delay: number;
  duration: number;
  startX: number;
  size: number;
  opacity: number;
}

const FallingPetal = ({ delay, duration, startX, size, opacity }: PetalProps) => {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) return null;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: '-5%',
        width: size,
        height: size,
      }}
      initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 0 }}
      animate={{
        y: '110vh',
        x: [0, 30, -20, 40, 0],
        rotate: [0, 45, -30, 60, 0],
        opacity: [0, opacity, opacity, opacity, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'linear',
        x: {
          duration: duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotate: {
          duration: duration * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    >
      {/* Lotus petal shape */}
      <svg viewBox="0 0 24 24" className="w-full h-full text-jaya-saffron/40">
        <ellipse cx="12" cy="12" rx="6" ry="10" fill="currentColor" />
        <ellipse cx="12" cy="14" rx="4" ry="6" fill="white" opacity="0.3" />
      </svg>
    </motion.div>
  );
};

export default function BuddhistBackground() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Reduce petals on mobile
  const petalCount = isMobile ? 4 : 8;
  
  // Generate random petals
  const petals = Array.from({ length: petalCount }, (_, i) => ({
    id: i,
    delay: i * 3 + Math.random() * 2,
    duration: 18 + Math.random() * 10,
    startX: 5 + (i * (90 / petalCount)) + Math.random() * 10,
    size: 12 + Math.random() * 16,
    opacity: 0.3 + Math.random() * 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dharma Chakra - Slow rotating */}
      <motion.div
        className="absolute text-jaya-gold/[0.08] select-none"
        style={{
          width: '70vw',
          height: '70vw',
          maxWidth: '800px',
          maxHeight: '800px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <DharmaChakra />
      </motion.div>
      
      {/* Subtle radial glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--jaya-gold) / 0.03) 0%, transparent 70%)',
        }}
      />
      
      {/* Falling Petals */}
      {!shouldReduceMotion && petals.map((petal) => (
        <FallingPetal key={petal.id} {...petal} />
      ))}
    </div>
  );
}
