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
        >
          <rect x="70.64" y="26.34" fill="#FDFDFD" width="882.73" height="971.32"/>
          
          <path 
            fill="hsl(var(--primary))" 
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            style={getPathStyle(0)}
            d="M912.23,368.04c-2.64,0.08-4.69-0.88-6.33-2.93c-4.48-5.6-14.89-35.56-15.82-44.53l-5.75-9.99c9.87-169.53-170.87-227.39-289.01-124.34L343.25,430.21c1.08,3.4,48.21,44.25,54.75,43.03l247.55-237.32c67.1-57.94,175.17-39.28,168.69,64.54c-7.31,30.47-11.98,60.91-14,91.33l56.32,51.92l17.06-63.87l6.96-2.3c9.86,7.57,17.85,14.91,25.31,25.31c-8.76,39.36-21.66,78.46-33.17,117.12c-4.57,6.92-14.86-12.85-17.46-15.88c-6.51-2.45-12.4-5.95-17.64-10.52l-88.46-93.81c15.9-43.64,22.79-87.96,20.68-132.97l-7.66-1.6c-22.93-42.47-75.96-4.32-99.3,19.26l-6.94-1.84c-11.58,9.93-20.94,21.64-28.06,35.12L430,504.95l12.06,8.73c62.86-58.69,123.91-117.77,183.16-177.22c7.32-4.94,16.51-4.96,27.58-0.06c21.95,6.35,45.72,29.27,53.79,50.62c37.9,20.87,77.08,61.67,104.9,95.96c39.99,49.31,54.45,106.35,46.97,169.8c-9.54,66.83-53.32,249.7-111.71,285.36c-48.31,29.49-97.23,3.03-116.16-46.42c-26.11-68.21-26.29-130.71-70.07-195.69c-4.17-6.19-20.69-20.26-17.08-27.36c1.69-3.32,20.45-21.48,23.89-19.04c17.85,24.78,34.46,49.14,47.07,77.95c21.53,49.17,29.67,124.95,50.43,164.72c19.18,36.74,59.12,32.54,82.91,2.52c34.85-43.97,80.07-209.76,79.29-265.88c-0.69-49.19-25.03-102.39-58.57-137.67L642.15,374.6c-7.32,8-56.57,52.23-55.57,57.87c61.46,77.15,163.17,107.02,154.75,221.86c-1.08,14.77-17.31,93.25-23.82,102.73c-8.84,12.87-28.61,5.21-29.92-7.82c-1.61-16.04,20.15-73.64,22.1-98.07c4.44-55.49-23.96-86.58-67.52-115.1c-57.98,58.09-127.82,109.2-174.21,177.1c-40.51,54.45-37.22,203.71-102.17,230.04c-85.55,34.69-122.53-65.4-143.35-127.41c-29.23-87.07-52.31-182.35-31.56-273.72c3.18-3.32,27.13,20.72,27.97,24.34c1.86,8.04-6.04,41.01-6.08,53.11c-0.2,56.88,44.95,236.8,82.52,278.46c25.96,28.77,64.93,26.44,81.91-9.81c24.89-53.15,27-123.55,57.74-182.72c39-75.06,131.98-129.13,182.83-196.18c-8.71-8.3-48.84-53.86-57.85-52.31c-31.39,29.72-64.25,58.28-95.45,88.17c-15.38,14.73-90.72,95.58-101.93,97.72c-14.22,2.72-19.75-13.25-32.43-15.36c-1.31,40.63,13.21,79.88,22.05,119.06c0.21,16.93-23.74,25.2-32.28,6.62c-6.69-14.56-19.99-84.19-21.37-102.02c-0.79-10.2,2.58-49.07,1.38-52.31c-2.32-6.26-54.86-46.2-64.74-55.16c-5.97-5.41-10.7-12.64-15.78-17.45c0.06-4.97,3.41-8.26,10.05-9.87c-11.48-10.25-13.78-18.56-6.88-24.93l6.31-2.95l127.83,108.23c19.18-16.32,36.03-33.45,50.56-51.38L281.91,439.24C175.38,325.31,224.79,125.37,395.2,234.01c3.38-0.82,52.36-43.78,51.03-47c-2.73-6.64-59.55-38.71-69.41-41.78c-45.62-14.22-85.27-16.71-130.04,2.98c-127.28,55.99-99.7,209.5-44.75,309l-1.67,8.92c5.24,9.36-1.71,12.34-20.84,8.95l-7.64,0.54c-65.77-93.58-83.15-255.42,14.31-335.3c99.41-81.49,234.98-42.36,314.68,45.81l-104.08,98.28c-32.9-17.81-89.68-73.65-123.68-25.52c-16.85,23.85-7.08,54.16-0.99,80.12c6.76,28.78,12.53,51.28,37.39,70.13l211.9-205.68c69.15-68.88,138.71-121.76,242.7-103.32C892.89,122.96,949.2,248.22,912.23,368.04z"
          />
          
          <path 
            fill="hsl(var(--blue-100))" 
            stroke="hsl(var(--blue-100))"
            strokeWidth="1.5"
            style={getPathStyle(0.3)}
            d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z"
          />
          
          <path 
            fill="hsl(var(--blue-500))" 
            stroke="hsl(var(--blue-500))"
            strokeWidth="1.5"
            style={getPathStyle(0.6)}
            d="M200.36,466.12c9.64-2.8,28.97,16.56,22.15,25.31c1.07,1.63,1.4,6.91,3.54,10.56c8.6,14.69,25.45,18.07-6.7,24.24c-20.86-19.73-29.69-25.35-47.46-50.62C182.63,454.05,192.74,481.36,200.36,466.12z"
          />
          
          <path 
            fill="hsl(var(--blue-700))" 
            stroke="hsl(var(--blue-700))"
            strokeWidth="1.5"
            style={getPathStyle(0.9)}
            d="M912.23,368.04c0.45,12.83-3.66,22.8-6.33,34.8c-9.06,6.86-12.06-7.01-15.65-10.56c-4.95-4.9-12.99,2.34-9.66-14.75l-5.12-6.49l7.84-45.94l6.77-4.52l20.43,35.06C912.9,359.58,912.08,363.79,912.23,368.04z"
          />
          
          <path 
            fill="hsl(var(--blue-200))" 
            stroke="hsl(var(--blue-200))"
            strokeWidth="1"
            style={getPathStyle(1.2)}
            d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z"
          />
        </svg>
      </div>
    </>
  );
};