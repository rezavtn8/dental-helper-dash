import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ message = "Loading...", size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className}`}>
      <div className="text-center">
        <Loader2 className={`animate-spin mx-auto mb-4 text-primary ${sizeClasses[size]}`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md", className = "" }: Pick<LoadingProps, "size" | "className">) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
  );
}