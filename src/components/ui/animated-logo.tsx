import { useState, useEffect } from 'react';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export const AnimatedLogo = ({ size = 120, className = "" }: AnimatedLogoProps) => {
  const [isDrawing, setIsDrawing] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Initial animation and cycling logic
  useEffect(() => {
    const animationCycle = () => {
      // Start drawing animation
      setIsDrawing(true);
      setIsVisible(false);
      
      // Complete drawing after 2.5s
      setTimeout(() => {
        setIsDrawing(false);
        setIsVisible(true);
      }, 2500);
      
      // After 8-10 seconds visible, fade and restart
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          animationCycle();
        }, 500);
      }, 10000);
    };

    // Start the cycle
    setTimeout(() => animationCycle(), 100);
  }, []);

  // Handle hover events
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Trigger immediate redraw if it's been more than 3 seconds
    if (isVisible) {
      setIsDrawing(true);
      setIsVisible(false);
      setTimeout(() => {
        setIsDrawing(false);
        setIsVisible(true);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const logoStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0.2,
    transition: 'opacity 0.8s ease-in-out, filter 0.3s ease-in-out, transform 0.3s ease-in-out',
    filter: isHovered 
      ? 'brightness(1.2) drop-shadow(0 0 20px hsl(var(--primary) / 0.6))' 
      : isVisible && !isDrawing 
      ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))'
      : 'none',
    transform: isVisible && !isDrawing ? 'scale(1)' : 'scale(1)',
    animation: isVisible && !isDrawing ? 'logo-breathing 4s ease-in-out infinite' : 'none',
  };

  const getPathStyle = (delay: number): React.CSSProperties => ({
    strokeDasharray: '100%',
    strokeDashoffset: isDrawing ? '100%' : '0',
    fillOpacity: isDrawing ? 0 : 1,
    transition: `stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, fill-opacity 0.5s ease-in-out ${delay + 2}s`,
  });

  return (
    <>
      <style>
        {`
          @keyframes logo-breathing {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
        `}
      </style>
      <div 
        className={`animated-logo-container ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
            fill="hsl(var(--primary))" 
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            style={getPathStyle(0)}
            d="M764.11,100.12c-103.99-18.45-173.55,34.44-242.7,103.32l-211.9,205.68c-24.86-18.85-30.63-41.35-37.39-70.13  c-6.09-25.96-15.87-56.27,0.99-80.12c34-48.12,90.78,7.72,123.68,25.52l104.08-98.27c-79.7-88.17-215.27-127.3-314.68-45.81  c-97.46,79.89-80.08,241.73-14.31,335.31c17.76,25.27,26.6,30.89,47.46,50.62c5.08,4.8,9.81,12.03,15.78,17.44  c9.88,8.96,62.42,48.91,64.74,55.17c1.21,3.24-2.16,42.11-1.37,52.31c1.38,17.83,14.68,87.47,21.37,102.02  c8.54,18.58,32.49,10.31,32.28-6.62c-8.83-39.18-23.35-78.44-22.05-119.06c12.69,2.11,18.22,18.07,32.44,15.36  c11.21-2.15,86.55-82.99,101.93-97.72c31.2-29.9,64.05-58.45,95.45-88.17c9.01-1.56,49.15,44,57.85,52.3  c-50.85,67.05-143.82,121.11-182.83,196.18c-30.74,59.17-32.84,129.57-57.73,182.72c-16.99,36.25-55.96,38.58-81.91,9.81  c-37.58-41.66-82.73-221.58-82.52-278.46c0.04-12.1,7.94-45.07,6.08-53.11c-0.84-3.62-24.79-27.66-27.97-24.34  c-20.74,91.38,2.33,186.66,31.56,273.73c20.82,62.01,57.81,162.09,143.36,127.41c64.94-26.33,61.65-175.6,102.16-230.05  c46.39-67.9,116.23-119.01,174.21-177.1c43.56,28.52,71.96,59.61,67.52,115.1c-1.95,24.43-23.7,82.03-22.1,98.07  c1.31,13.03,21.08,20.69,29.92,7.82c6.51-9.47,22.74-87.95,23.82-102.73c8.42-114.84-93.29-144.71-154.75-221.85  c-1-5.64,48.25-49.87,55.57-57.87l126.27,116.69c33.55,35.27,57.89,88.47,58.58,137.66c0.78,56.12-44.44,221.91-79.29,265.88  c-23.79,30.02-63.73,34.22-82.91-2.52c-20.76-39.76-28.9-115.54-50.42-164.71c-12.61-28.81-29.22-53.17-47.07-77.95  c-3.44-2.44-22.2,15.71-23.89,19.03c-3.6,7.1,12.91,21.17,17.09,27.36c43.78,64.98,43.96,127.48,70.07,195.7  c18.92,49.44,67.85,75.91,116.16,46.41c58.39-35.65,102.16-218.52,111.71-285.36c7.48-63.45-6.98-120.49-46.97-169.8  c-27.82-34.3-67-75.1-104.9-95.96c-8.06-21.36-31.84-44.28-53.79-50.63c-11.07-4.9-20.26-4.88-27.58,0.06  c-59.24,59.45-120.29,118.53-183.16,177.22L430,504.95l197.9-187.21c7.12-13.49,16.47-25.19,28.06-35.12l6.94,1.84  c23.33-23.58,76.37-61.73,99.3-19.26l7.66,1.6c2.11,45-4.78,89.32-20.68,132.96l88.47,93.81c5.23,4.57,11.12,8.07,17.63,10.52  c2.6,3.03,12.89,22.79,17.46,15.88c11.5-38.67,24.4-77.76,33.17-117.12c2.67-12.01,6.78-21.98,6.32-34.81  C949.2,248.22,892.89,122.96,764.11,100.12z M356.64,596.71L228.81,488.48l-6.31,2.95c6.83-8.74-12.5-28.11-22.14-25.31l1.67-8.91  c-54.94-99.5-82.53-253.01,44.75-309c44.78-19.7,84.42-17.2,130.04-2.98c9.86,3.07,66.68,35.14,69.41,41.78  c1.33,3.21-47.65,46.17-51.03,47c-170.41-108.64-219.82,91.3-113.29,205.23l125.28,106.09  C392.67,563.26,375.81,580.39,356.64,596.71z"
          />
          
          <path 
            fill="hsl(var(--blue-100))" 
            stroke="hsl(var(--blue-100))"
            strokeWidth="1.5"
            style={getPathStyle(0.3)}
            d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39  c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89  c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94  c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z"
          />
          
          <path 
            fill="hsl(var(--background))" 
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
            style={getPathStyle(0.6)}
            d="M890.09,320.58c-1.28,16.66-6,40.17-9.49,56.95c-3.57,17.17-11.67,50.55-17.36,66.48  c-1.34,3.74-3.19,7.05-6.45,9.46l-61.77-58.36c-8.32-14.26,11.94-72.87,12.92-94.96c4.81-107.94-108.39-112.79-169.29-49.09  l-239.02,229.4l-9.37,0l-56.95-50.64l257.89-248.36C721.28,72.93,904.25,136.66,890.09,320.58z"
          />
          
          <path 
            fill="hsl(var(--background))" 
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
            style={getPathStyle(0.9)}
            d="M200.36,466.12c-31.53-45.22-54.89-136.69-50.58-191.37c8.89-112.63,124.89-173.61,227.72-136.06  c13.24,4.84,68.95,35.54,74.61,45.77c2.52,4.55,0.62,4.81-1.64,8.08c-12.17,17.7-41.5,33.31-55.49,51.35  c-42.28-35.6-111.47-55.46-148.55-2.21c-33.26,47.77-2.22,163.21,45.63,197.59L418.6,546.71l-61.63,58.57L222.5,491.43  C216.1,481.68,205.16,473.01,200.36,466.12z"
          />
          
          <path 
            fill="hsl(var(--blue-200))" 
            stroke="hsl(var(--blue-200))"
            strokeWidth="1"
            style={getPathStyle(1.2)}
            d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28  c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z"
          />
        </svg>
      </div>
    </>
  );
};