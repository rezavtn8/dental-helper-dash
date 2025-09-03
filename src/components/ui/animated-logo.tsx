import { useState, useEffect, useRef } from 'react';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export const AnimatedLogo = ({ size = 120, className = "" }: AnimatedLogoProps) => {
  const [isDrawing, setIsDrawing] = useState(true);
  const [drawProgress, setDrawProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    const runDrawingAnimation = () => {
      setIsDrawing(true);
      setDrawProgress(0);
      setIsTransitioning(false);
      
      // Animate drawing progress from 0 to 100% over 4.5 seconds for elegant, deliberate drawing
      const duration = 4500;
      const startTime = Date.now();
      
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Natural artist-like easing: slow start, speed up, then slow finish
        const easedProgress = progress < 0.5 
          ? 2 * progress * progress * progress // ease-in cubic for first half
          : 1 - Math.pow(-2 * progress + 2, 3) / 2; // ease-out cubic for second half
        
        setDrawProgress(easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          // Ensure we reach exactly 100%
          setDrawProgress(1);
          
          // Start transition phase
          setTimeout(() => {
            setIsTransitioning(true);
            
            // Complete transition to filled state
            setTimeout(() => {
              setIsDrawing(false);
              setIsTransitioning(false);
            }, 600);
          }, 200);
        }
      };
      
      requestAnimationFrame(animateProgress);
    };

    // Initial animation with slight delay
    setTimeout(() => runDrawingAnimation(), 500);
    
    // Repeat every 12 seconds (4.5s drawing + 0.8s transition + 3.5s viewing + 3.2s pause)
    const interval = setInterval(() => runDrawingAnimation(), 12000);
    
    return () => clearInterval(interval);
  }, [pathLength]);

  const logoStyle: React.CSSProperties = {
    transition: 'opacity 0.8s ease-out, filter 0.6s ease-out',
    filter: isDrawing 
      ? 'none'
      : 'drop-shadow(0 2px 8px hsl(var(--primary) / 0.12))',
  };

  const getPathStyle = (): React.CSSProperties => {
    const currentOffset = pathLength * (1 - drawProgress);
    
    // Calculate smooth opacity transitions
    const strokeOpacity = isDrawing 
      ? (drawProgress < 0.95 ? 0.95 : 0.95 * (1 - (drawProgress - 0.95) / 0.05))
      : (isTransitioning ? 0.3 : 0);
    
    const fillOpacity = isDrawing 
      ? 0 
      : (isTransitioning ? 0.7 : 1);
    
    return {
      strokeDasharray: `${pathLength}`,
      strokeDashoffset: Math.max(0, currentOffset),
      fillOpacity,
      strokeOpacity,
      strokeWidth: isDrawing ? 2.5 : (isTransitioning ? 1.5 : 0),
      stroke: 'hsl(var(--primary))',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      filter: isDrawing ? 'drop-shadow(0 0 3px hsl(var(--primary) / 0.4))' : 'none',
      transition: isDrawing 
        ? 'none' 
        : 'fill-opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke-opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.4s ease-out, filter 0.4s ease-out',
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
            fill="hsl(var(--primary))" 
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            style={getPathStyle()}
            d="M882.28,526.22c-6.06,1.48-6.09-2.22-8.9-5.31c-9.79-10.75-17.6-24.9-27.42-35.85c-26.25-29.27-57.84-54.33-83.29-84.48  c-0.58-38.81,45.2-132.28-3.74-154.37c-17.11-7.72-32.01-5.01-48.7,1.95c-83.32,63.75-161.97,141.25-237.73,214.71  c-5.75,5.58-39.97,38.14-39.24,42.36c0.41,2.35,14.28,17.8,18.73,13.28l194.68-185.31l20.62,7.81  c68.86,77.86,188.2,146.61,199.17,259.6c7.11,73.26-42.15,276.33-96.33,327.58c-43.71,41.34-106.42,24.86-129.8-28.67  c-31.61-72.39-30.11-168.01-93.17-226.59l23.51-26.41c29.15,26.67,47.88,66.21,61.75,102.71c12.32,32.44,32.49,134.23,47.36,151.96  c17.46,20.81,49.78,18.91,68.52,0.42c27.37-27,58.19-128.13,67.98-167.73c16.73-67.66,27.97-131.86-7.36-195.95  c-21.63-39.23-99.3-111.59-135.38-143.04c-3.45-3-21.1-17.53-23.34-17.14c-17.72,18.81-39.51,35.26-55.55,54.7l121.23,113.09  c45.89,50.27,39.26,96.17,25.68,157.9c-3.68,16.74-9.06,64.82-31.25,62.42c-29.78-3.21-4.22-62.6-0.4-81.41  c5.82-28.66,11.61-52.17,1.71-80.86c-10.03-29.05-38.53-48.73-61.42-67.64c-45.4,51.34-107.05,95.07-150.8,146.81  c-50.47,59.7-53.18,131.6-76.75,201.67c-29.92,88.97-118.25,86.62-162.1,8.87c-39.61-70.23-76.81-222.33-71.08-302.16  c0.43-6.01,6.59-46.85,7.8-49.15c3.08-5.84,5.2-0.58,7.97,1.63c7.36,5.87,14,13.71,21.61,19.5c-0.68,29.19-4.82,58.34-2.23,87.67  c4.63,52.37,45.25,202.47,77.03,242.52c22.64,28.52,62.28,32.92,80.37-2.04c19.8-38.27,27.47-108.33,45.42-153.91  c22.04-55.95,47.99-81.53,89.35-122.63L625.96,512c-8.9-6.85-52.06-56.2-58.04-55.14c-61.95,61.68-127.63,119.43-187.43,182.94  c-24.01,15.12-36.17-17.49-42.38-12.28c5.55,10.43,2.17,21.81,3.53,32.82c2.52,20.29,24.73,86.07,15.68,98.68  c-10.24,14.28-26.6,5.78-31.69-9.9c-8.09-24.92-22.17-88.61-22.55-113.68c-0.21-13.98,6.42-26.52,1.78-39.58  c-55.19-46.62-125.06-94.28-152.66-163.7c-41.64-104.7-47.22-236.65,57.7-304.64c77.48-50.21,166.62-40.91,241.83,8.28  c8.76,5.73,58.24,42.96,57.01,49.9c-1.53,8.6-90.25,87.19-103.26,99.67c-25.28-7.47-41.87-33.16-69.13-40.52  c-24.93-6.73-56.4,0.42-61.35,30.04c-5.3,31.71,10.89,113.38,42.11,130.89l248.76-238.68c84.23-85.98,235.98-102.01,319.51-6.19  C978.43,267.66,909.34,407.67,882.28,526.22z M461.47,184.59c-1.33-1.93-34.01-23.01-38.99-25.9  c-52.73-30.66-107.94-38.48-165.63-15.86c-150.39,58.98-105.86,269.45-10.55,359.72c36.47,34.54,80.59,66.76,119.28,99.2  c4.17,0.64,58.39-53.58,57.7-57.67c-44.92-48.62-137.85-94.75-164.38-155.38c-22.71-51.9-38.01-148.37,27.65-175.02  c44.87-18.21,79.3,3.66,115.88,27.27c4.37-0.37,48.7-41.73,55.69-48.7C460.19,190.2,463.75,187.9,461.47,184.59z M846.37,169.84  c-69.73-61.84-179.73-46.81-245.7,13.08L341.32,429.74l61.64,52.08l253.21-240.24c38.41-32.94,94.4-51.61,136.04-12.83  c45.27,42.17,16.63,107.89,8.33,159.24l64.36,65.42c4.4-2.61,3.91-6.59,5.24-10.52C899.05,357.22,922.27,237.15,846.37,169.84z"
          />
        </svg>
      </div>
    </>
  );
};