import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useState } from "react";

interface ErrorBannerProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "error" | "warning";
  className?: string;
}

export function ErrorBanner({
  title,
  message,
  onRetry,
  onDismiss,
  variant = "error",
  className = ""
}: ErrorBannerProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const bgColor = variant === "error" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
  const iconColor = variant === "error" ? "text-red-500" : "text-yellow-500";
  const textColor = variant === "error" ? "text-red-700" : "text-yellow-700";
  const titleColor = variant === "error" ? "text-red-800" : "text-yellow-800";

  return (
    <Card className={`${bgColor} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${titleColor}`}>{title}</h4>
            <p className={`text-sm ${textColor} mt-1`}>{message}</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="text-xs"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </>
                )}
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionErrorBanner({
  section,
  error,
  onRetry,
  className = ""
}: {
  section: string;
  error: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <ErrorBanner
      title={`Failed to load ${section}`}
      message={error || `There was an error loading ${section}. Please try again.`}
      onRetry={onRetry}
      className={className}
    />
  );
}