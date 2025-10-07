import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CourseContentViewerProps {
  moduleId: string;
  courseId: string;
  contentUrl: string;
  onProgressUpdate?: (percentage: number) => void;
}

export const CourseContentViewer: React.FC<CourseContentViewerProps> = ({
  moduleId,
  courseId,
  contentUrl,
  onProgressUpdate
}) => {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Get signed URL and convert to blob URL with correct MIME type
  const getContentUrl = async (url: string): Promise<string> => {
    const raw = (url || '').trim();
    const path = raw.replace(/^\/+/, '').replace(/^learning-content\//, '');
    
    try {
      // If absolute URL, fetch and convert to blob
      if (/^https?:\/\//i.test(raw)) {
        const response = await fetch(raw);
        const html = await response.text();
        const blob = new Blob([html], { type: 'text/html' });
        return URL.createObjectURL(blob);
      }

      // Get signed URL from Supabase
      const { data: signedData, error } = await supabase.storage
        .from('learning-content')
        .createSignedUrl(path, 60 * 60);

      if (error) {
        throw new Error(`Failed to generate signed URL: ${error.message}`);
      }

      if (!signedData?.signedUrl) {
        throw new Error(`Could not generate URL for: ${path}`);
      }

      // Fetch the HTML and create a blob with correct MIME type
      const response = await fetch(signedData.signedUrl);
      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      return URL.createObjectURL(blob);
    } catch (err: any) {
      throw new Error(`Failed to load content URL: ${err?.message || String(err)}`);
    }
  };

  // Update progress in database
  const updateProgressInDatabase = useCallback(async (percentage: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          completion_percentage: percentage,
          status: percentage >= 100 ? 'completed' : 'in_progress',
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id,module_id'
        });
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }, [courseId, moduleId]);

  // Handle progress updates from iframe via postMessage
  const handleProgressUpdate = useCallback((percentage: number) => {
    const clampedProgress = Math.min(100, Math.max(0, percentage));
    setProgress(clampedProgress);
    onProgressUpdate?.(clampedProgress);

    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    progressUpdateTimeoutRef.current = setTimeout(() => {
      updateProgressInDatabase(clampedProgress);
    }, 500);
  }, [onProgressUpdate, updateProgressInDatabase]);

  // Listen for postMessage events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;

      if (type === 'progress' && typeof data?.percentage === 'number') {
        handleProgressUpdate(data.percentage);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleProgressUpdate]);

  // Load iframe URL
  useEffect(() => {
    const loadUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = await getContentUrl(contentUrl);
        setIframeUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (contentUrl) {
      loadUrl();
    }
  }, [contentUrl]);

  // Log module opened
  useEffect(() => {
    const logModuleOpen = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          completion_percentage: 0,
          status: 'in_progress',
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id,module_id',
          ignoreDuplicates: false
        });
    };

    logModuleOpen();
  }, [courseId, moduleId]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
      // Cleanup blob URL if it exists
      if (iframeUrl && iframeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(iframeUrl);
      }
    };
  }, [iframeUrl]);

  return (
    <div className="relative h-full flex flex-col bg-background">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!loading && !error && iframeUrl && (
        <>
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border shadow-sm">
            <div className="h-1 bg-muted">
              <div 
                className="h-full bg-gradient-to-r from-primary to-learning-success transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="px-6 py-2 text-sm font-medium text-muted-foreground">
              Progress: {Math.round(progress)}%
            </div>
          </div>
          
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="flex-1 w-full border-0"
            title="Course Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </>
      )}
    </div>
  );
};
