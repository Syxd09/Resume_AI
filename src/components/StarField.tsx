'use client';

import React, { useEffect, useState } from 'react';

export const StarField = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-zinc-950">
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,30,1),rgba(10,10,15,1))]" />
      
      {/* Stars Layer 1 - Small/Static */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-screen" />
      
      {/* Animated Stars - Only render on client to avoid hydration mismatch */}
      <div className="absolute inset-0 z-0">
        {mounted && [...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Subtle Nebula Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 blur-[100px] rounded-full" />

      {/* Saturn Ring Motif (Static/Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[40vh] border-y border-white/5 rounded-[100%] rotate-[-15deg] opacity-20" />
    </div>
  );
};
