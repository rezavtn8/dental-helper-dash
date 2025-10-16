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

  const [iframeSrcDoc, setIframeSrcDoc] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Get signed URL and convert to blob URL with correct MIME type
  const getContentUrl = async (url: string): Promise<string> => {
    const raw = (url || '').trim();
    
    try {
      // If absolute URL, return directly
      if (/^https?:\/\//i.test(raw)) {
        return raw;
      }

      // Build candidate local paths to try
      const candidates: string[] = [];
      const hasExtension = /\.[a-z0-9]+($|\?|#)/i.test(raw);
      
      // Add raw path with leading slash
      if (raw.startsWith('/')) {
        candidates.push(hasExtension ? raw : `${raw.replace(/\/$/,'')}/index.html`);
      }
      
      // Add variant with /learning-content/ prefix
      const withPrefix = raw.startsWith('/learning-content/') 
        ? raw 
        : `/learning-content/${raw.replace(/^\/+/,'')}`;
      candidates.push(hasExtension ? withPrefix : `${withPrefix.replace(/\/$/,'')}/index.html`);
      
      // Add variant without /learning-content/ prefix
      const withoutPrefix = raw.replace(/^\/+learning-content\/+/, '/');
      if (!candidates.includes(withoutPrefix)) {
        candidates.push(hasExtension ? withoutPrefix : `${withoutPrefix.replace(/\/$/,'')}/index.html`);
      }

      // Try each local candidate
      for (const candidate of candidates) {
        try {
          const headResponse = await fetch(candidate, { method: 'HEAD', cache: 'no-store' });
          if (headResponse.ok) {
            return candidate;
          }
        } catch (_) {
          // Continue to next candidate
        }
      }

      // Fall back to Supabase Storage
      const storagePath = raw.replace(/^\/+/,'').replace(/^learning-content\//,'');
      const finalPath = hasExtension ? storagePath : `${storagePath.replace(/\/$/,'')}/index.html`;
      
      const { data: signedData, error } = await supabase.storage
        .from('learning-content')
        .createSignedUrl(finalPath, 60 * 60);

      if (error || !signedData?.signedUrl) {
        throw new Error(
          `Content not found.\nTried local: ${candidates.join(', ')}\nTried storage: learning-content/${finalPath}\nError: ${error?.message || 'No signed URL generated'}`
        );
      }

      return signedData.signedUrl;
    } catch (err: any) {
      throw new Error(`Failed to load content: ${err?.message || String(err)}`);
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
        setIframeSrcDoc(null);
        const url = await getContentUrl(contentUrl);
        // If using Supabase signed URL (may return text/plain), fetch HTML and inject <base> so relative assets resolve
        if (/^https?:\/\//i.test(url) && url.includes('/storage/v1/object/sign/')) {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            const html = await res.text();
            const baseHref = url.replace(/[^\/]+(\?.*)?$/, '');
            const htmlWithBase = (/<base\s/i.test(html))
              ? html
              : (/<head[^>]*>/i.test(html)
                  ? html.replace(/<head[^>]*>/i, (m) => `${m}<base href="${baseHref}">`)
                  : `<head><base href="${baseHref}"></head>${html}`);
            setIframeSrcDoc(htmlWithBase);
            setIframeUrl('about:blank');
          } catch {
            setIframeUrl(url);
          }
        } else {
          setIframeUrl(url);
        }
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
            srcDoc={iframeSrcDoc || undefined}
            className="flex-1 w-full border-0"
            title="Course Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </>
      )}
    </div>
  );
};
