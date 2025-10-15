import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Get signed URL and convert to blob URL with correct MIME type
  const getContentUrl = async (url: string): Promise<string> => {
    const raw = (url || '').trim();
    const path = raw.replace(/^\/+/,'').replace(/^learning-content\//,'');
    const hasExtension = /\.[a-z0-9]+($|\?)/i.test(path);
    const normalizedPath = hasExtension ? path : `${path.replace(/\/$/,'')}/index.html`;
    
    try {
      // If absolute URL, use it directly so relative assets resolve correctly
      if (/^https?:\/\//i.test(raw)) {
        return raw;
      }

      // Try local public asset first (e.g., /courses/.. or courses/..)
      try {
        const localUrl = raw.startsWith('/')
          ? (/\.[a-z0-9]+($|\?)/i.test(raw) ? raw : `${raw.replace(/\/$/,'')}/index.html`)
          : `/${normalizedPath}`;
        const response = await fetch(localUrl, { method: 'HEAD' });
        if (response.ok) {
          return localUrl;
        }
      } catch (_) {
        // Ignore and fall back to Supabase storage
      }

      // Fall back to Supabase Storage bucket 'learning-content'
      const { data: signedData, error } = await supabase.storage
        .from('learning-content')
        .createSignedUrl(normalizedPath, 60 * 60);

      if (error) {
        throw new Error(`Failed to generate signed URL: ${error.message}`);
      }

      if (!signedData?.signedUrl) {
        throw new Error(`Could not generate URL for: ${path}`);
      }

      // Use the signed URL directly to preserve relative paths inside the HTML
      return signedData.signedUrl;
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
    <div className={`relative flex flex-col bg-background ${
      isFullscreen 
        ? 'fixed inset-0 z-50' 
        : 'min-h-[600px] h-[70vh]'
    }`}>
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
            <div className="flex items-center justify-between px-6 py-2">
              <div className="text-sm font-medium text-muted-foreground">
                Progress: {Math.round(progress)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span className="text-xs">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span className="text-xs">Fullscreen</span>
                  </>
                )}
              </Button>
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
