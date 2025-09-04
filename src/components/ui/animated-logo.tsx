import { useState, useEffect, useRef } from 'react';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const AnimatedLogo = ({ size = 120, className = "", animated = true }: AnimatedLogoProps) => {
  const [animationPhase, setAnimationPhase] = useState<'drawing' | 'filling' | 'emptying' | 'disappearing'>('drawing');
  const [drawProgress, setDrawProgress] = useState(0);
  const [fillProgress, setFillProgress] = useState(0);
  const [eraseProgress, setEraseProgress] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(3500);

  useEffect(() => {
    // Measure actual path length for precise animation
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  useEffect(() => {
    if (!animated) return; // Skip animation setup if not animated
    
    const runAnimation = () => {
      const drawDuration = 3000; // Drawing takes 3 seconds (slower)
      const fillDuration = 1200; // Filling takes 1.2 seconds
      const disappearDuration = 4000; // Disappearing takes 4 seconds (even slower)
      
      // Phase 1: Drawing (stroke appears)
      setAnimationPhase('drawing');
      setDrawProgress(0);
      setFillProgress(0);
      setEraseProgress(0);
      
      const animateDrawing = (startTime: number) => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / drawDuration, 1);
        
        // Slower, more deliberate one-sided drawing with ease-in
        const easedProgress = progress * progress * progress; // cubic ease-in for slower start
        
        setDrawProgress(easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(() => animateDrawing(startTime));
        } else {
          // Phase 2: Filling
          setTimeout(() => {
            setAnimationPhase('filling');
            const fillStartTime = Date.now();
            
            const animateFilling = () => {
              const elapsed = Date.now() - fillStartTime;
              const progress = Math.min(elapsed / fillDuration, 1);
              const easedProgress = progress * progress * (3 - 2 * progress); // smooth ease
              
              setFillProgress(easedProgress);
              
              if (progress < 1) {
                requestAnimationFrame(animateFilling);
              } else {
                // Phase 3: Emptying  
                setTimeout(() => {
                  setAnimationPhase('emptying');
                  const emptyStartTime = Date.now();
                  
                  const animateEmptying = () => {
                    const elapsed = Date.now() - emptyStartTime;
                    const progress = Math.min(elapsed / fillDuration, 1);
                    const easedProgress = 1 - (progress * progress * (3 - 2 * progress));
                    
                    // Empty the fill
                    setFillProgress(easedProgress);
                    
                    // Erase the stroke with same one-sided animation as drawing but in reverse
                    const eraseEasedProgress = progress * progress * progress; // cubic ease-in
                    setEraseProgress(eraseEasedProgress);
                    
                    if (progress < 1) {
                      requestAnimationFrame(animateEmptying);
                    } else {
                      // Phase 4: Disappearing
                      setTimeout(() => {
                        setAnimationPhase('disappearing');
                        const disappearStartTime = Date.now();
                        
                        const animateDisappearing = () => {
                          const elapsed = Date.now() - disappearStartTime;
                          const progress = Math.min(elapsed / disappearDuration, 1);
                          // Slower one-sided disappearing with ease-out for smooth ending
                          const easedProgress = 1 - (1 - progress) * (1 - progress) * (1 - progress);
                          
                          setDrawProgress(1 - easedProgress);
                          
                          if (progress < 1) {
                            requestAnimationFrame(animateDisappearing);
                          }
                        };
                        
                        requestAnimationFrame(animateDisappearing);
                      }, 500);
                    }
                  };
                  
                  requestAnimationFrame(animateEmptying);
                }, 500);
              }
            };
            
            requestAnimationFrame(animateFilling);
          }, 200);
        }
      };
      
      requestAnimationFrame(() => animateDrawing(Date.now()));
    };

    // Initial animation with slight delay
    setTimeout(() => runAnimation(), 500);
    
    // Repeat every 10 seconds (3s drawing + 1.2s filling + 1.2s emptying + 2.5s disappearing + pauses)
    const interval = setInterval(() => runAnimation(), 10000);
    
    return () => clearInterval(interval);
  }, [pathLength, animated]);

    const logoStyle: React.CSSProperties = {
    transition: 'opacity 0.8s ease-out, filter 0.6s ease-out',
    filter: 'none', // Removed shadow for minimalistic look
  };

  const getPathStyle = (): React.CSSProperties => {
    // If not animated, return static filled style
    if (!animated) {
      return {
        strokeDasharray: 'none',
        strokeDashoffset: 0,
        fillOpacity: 1,
        strokeOpacity: 1,
        strokeWidth: 3,
        stroke: 'hsl(0 0% 100%)',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        filter: 'none',
      };
    }
    
    // Calculate stroke offset based on animation phase
    let currentOffset;
    if (animationPhase === 'emptying') {
      // During emptying, use eraseProgress to make stroke disappear
      currentOffset = pathLength * eraseProgress;
    } else {
      // During drawing and disappearing, use drawProgress
      currentOffset = pathLength * (1 - drawProgress);
    }
    
    // Calculate opacity based on animation phase
    const strokeOpacity = (animationPhase === 'drawing' && drawProgress > 0) || 
                         (animationPhase === 'filling') || 
                         (animationPhase === 'emptying' && eraseProgress < 1) ? 0.9 : 0;
    
    const fillOpacity = animationPhase === 'filling' || animationPhase === 'emptying' 
      ? fillProgress 
      : 0;
    
    return {
      strokeDasharray: `${pathLength}`,
      strokeDashoffset: Math.max(0, currentOffset),
      fillOpacity,
      strokeOpacity,
      strokeWidth: strokeOpacity > 0 ? 3 : 0, // Increased for better contrast
      stroke: 'hsl(0 0% 100%)', // Pure white for maximum contrast
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      filter: 'none', // Removed glow effects for minimalistic look
      transition: animationPhase === 'drawing' || animationPhase === 'disappearing' || animationPhase === 'emptying'
        ? 'none' 
        : 'fill-opacity 0.3s ease-out, stroke-opacity 0.3s ease-out',
    };
  };

  return (
    <>
      <div 
        className={`animated-logo-container ${className}`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1024 1024" 
          width={size} 
          height={size}
          style={logoStyle}
          className="mx-auto"
        >
            <path 
            ref={pathRef}
            fill="hsl(0 0% 100%)" 
            stroke="hsl(0 0% 100%)"
            strokeWidth="3"
            style={getPathStyle()}
            d="M882.28,526.22c-6.06,1.48-6.09-2.22-8.9-5.31c-9.79-10.75-17.6-24.9-27.42-35.85c-26.25-29.27-57.84-54.33-83.29-84.48  c-0.58-38.81,45.2-132.28-3.74-154.37c-17.11-7.72-32.01-5.01-48.7,1.95c-83.32,63.75-161.97,141.25-237.73,214.71  c-5.75,5.58-39.97,38.14-39.24,42.36c0.41,2.35,14.28,17.8,18.73,13.28l194.68-185.31l20.62,7.81  c68.86,77.86,188.2,146.61,199.17,259.6c7.11,73.26-42.15,276.33-96.33,327.58c-43.71,41.34-106.42,24.86-129.8-28.67  c-31.61-72.39-30.11-168.01-93.17-226.59l23.51-26.41c29.15,26.67,47.88,66.21,61.75,102.71c12.32,32.44,32.49,134.23,47.36,151.96  c17.46,20.81,49.78,18.91,68.52,0.42c27.37-27,58.19-128.13,67.98-167.73c16.73-67.66,27.97-131.86-7.36-195.95  c-21.63-39.23-99.3-111.59-135.38-143.04c-3.45-3-21.1-17.53-23.34-17.14c-17.72,18.81-39.51,35.26-55.55,54.7l121.23,113.09  c45.89,50.27,39.26,96.17,25.68,157.9c-3.68,16.74-9.06,64.82-31.25,62.42c-29.78-3.21-4.22-62.6-0.4-81.41  c5.82-28.66,11.61-52.17,1.71-80.86c-10.03-29.05-38.53-48.73-61.42-67.64c-45.4,51.34-107.05,95.07-150.8,146.81  c-50.47,59.7-53.18,131.6-76.75,201.67c-29.92,88.97-118.25,86.62-162.1,8.87c-39.61-70.23-76.81-222.33-71.08-302.16  c0.43-6.01,6.59-46.85,7.8-49.15c3.08-5.84,5.2-0.58,7.97,1.63c7.36,5.87,14,13.71,21.61,19.5c-0.68,29.19-4.82,58.34-2.23,87.67  c4.63,52.37,45.25,202.47,77.03,242.52c22.64,28.52,62.28,32.92,80.37-2.04c19.8-38.27,27.47-108.33,45.42-153.91  c22.04-55.95,47.99-81.53,89.35-122.63L625.96,512c-8.9-6.85-52.06-56.2-58.04-55.14c-61.95,61.68-127.63,119.43-187.43,182.94  c-24.01,15.12-36.17-17.49-42.38-12.28c5.55,10.43,2.17,21.81,3.53,32.82c2.52,20.29,24.73,86.07,15.68,98.68  c-10.24,14.28-26.6,5.78-31.69-9.9c-8.09-24.92-22.17-88.61-22.55-113.68c-0.21-13.98,6.42-26.52,1.78-39.58  c-55.19-46.62-125.06-94.28-152.66-163.7c-41.64-104.7-47.22-236.65,57.7-304.64c77.48-50.21,166.62-40.91,241.83,8.28  c8.76,5.73,58.24,42.96,57.01,49.9c-1.53,8.6-90.25,87.19-103.26,99.67c-25.28-7.47-41.87-33.16-69.13-40.52  c-24.93-6.73-56.4,0.42-61.35,30.04c-5.3,31.71,10.89,113.38,42.11,130.89l248.76-238.68c84.23-85.98,235.98-102.01,319.51-6.19  C978.43,267.66,909.34,407.67,882.28,526.22z M461.47,184.59c-1.33-1.93-34.01-23.01-38.99-25.9  c-52.73-30.66-107.94-38.48-165.63-15.86c-150.39,58.98-105.86,269.45-10.55,359.72c36.47,34.54,80.59,66.76,119.28,99.2  c4.17,0.64,58.39-53.58,57.7-57.67c-44.92-48.62-137.85-94.75-164.38-155.38c-22.71-51.9-38.01-148.37,27.65-175.02  c44.87-18.21,79.3,3.66,115.88,27.27c4.37-0.37,48.7-41.73,55.69-48.7C460.19,190.2,463.75,187.9,461.47,184.59z M846.37,169.84  c-69.73-61.84-179.73-46.81-245.7,13.08L341.32,429.74l61.64,52.08l253.21-240.24c38.41-32.94,94.4-51.61,136.04-12.83  c45.27,42.17,16.63,107.89,8.33,159.24l64.36,65.42c4.4-2.61,3.91-6.59,5.24-10.52C899.05,357.22,922.27,237.15,846.37,169.84z"
          />
        </svg>
      </div>
    </>
  );
};