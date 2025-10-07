import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

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
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoProgressRef = useRef(new Map<string, number>());
  const checkpointsRef = useRef(new Set<string>());
  const [totalCheckpoints, setTotalCheckpoints] = useState(0);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // Load HTML content from Supabase Storage
  const loadHTMLContent = async (url: string): Promise<string> => {
    const raw = (url || '').trim();
    const path = raw.replace(/^\/+/, '').replace(/^learning-content\//, '');
    const pathInfo = `bucket=learning-content, path=${path}`;
    try {
      // 1) If absolute URL, fetch directly
      if (/^https?:\/\//i.test(raw)) {
        const res = await fetch(raw);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
      }

      // 2) Try signed URL first (works for private buckets)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('learning-content')
        .createSignedUrl(path, 60 * 60);

      if (signedError) {
        console.warn('Signed URL error', { path, signedError });
      }

      if (signedData?.signedUrl) {
        const res = await fetch(signedData.signedUrl);
        if (!res.ok) throw new Error(`Signed URL fetch failed HTTP ${res.status}`);
        return await res.text();
      }

      // 3) Public URL fallback (when bucket is public)
      const { data: publicData } = supabase.storage
        .from('learning-content')
        .getPublicUrl(path);
      if (publicData?.publicUrl) {
        const res = await fetch(publicData.publicUrl);
        if (res.ok) {
          return await res.text();
        }
      }

      // 4) Fallback to direct download (for public buckets with RLS)
      const { data: blob, error: downloadError } = await supabase.storage
        .from('learning-content')
        .download(path);
      if (downloadError) {
        throw new Error(`Storage download error: ${downloadError.message || String(downloadError)}`);
      }

      return await blob.text();
    } catch (err: any) {
      const msg = err?.message || (err instanceof Error ? err.message : JSON.stringify(err));
      throw new Error(`Failed to load content (${pathInfo}): ${msg}`);
    }
  };

  // Calculate overall progress from all tracking methods
  const calculateOverallProgress = useCallback((): number => {
    const weights = {
      scroll: 0.4,
      videos: 0.4,
      checkpoints: 0.2
    };

    const scrollContribution = (maxScrollDepth / 100) * weights.scroll;

    const videoContribution = videoProgressRef.current.size > 0
      ? (Array.from(videoProgressRef.current.values()).reduce((a, b) => a + b, 0) / 
         videoProgressRef.current.size / 100) * weights.videos
      : 0;

    const checkpointContribution = totalCheckpoints > 0
      ? (checkpointsRef.current.size / totalCheckpoints) * weights.checkpoints
      : 0;

    return Math.min(100, Math.round((scrollContribution + videoContribution + checkpointContribution) * 100));
  }, [maxScrollDepth, totalCheckpoints]);

  // Debounced progress update to database
  const updateProgressInDatabase = useCallback(async (percentage: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
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

      if (error) {
        console.error('Failed to update progress:', error);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }, [courseId, moduleId]);

  // Scroll depth tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      
      if (scrollHeight === 0) {
        setMaxScrollDepth(100);
        return;
      }

      const scrollPercentage = Math.min(100, (scrollTop / scrollHeight) * 100);

      if (scrollPercentage > maxScrollDepth) {
        setMaxScrollDepth(Math.round(scrollPercentage));
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => container.removeEventListener('scroll', handleScroll);
  }, [maxScrollDepth]);

  // Video tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !htmlContent) return;

    const videos = container.querySelectorAll('video[data-track-id]');
    const handlers: Array<{ video: HTMLVideoElement; handler: () => void }> = [];

    videos.forEach((videoElement) => {
      const video = videoElement as HTMLVideoElement;
      const trackId = video.getAttribute('data-track-id');
      if (!trackId) return;

      const handleTimeUpdate = () => {
        if (video.duration > 0) {
          const percentage = Math.min(100, (video.currentTime / video.duration) * 100);
          const currentMax = videoProgressRef.current.get(trackId) || 0;

          if (percentage > currentMax) {
            videoProgressRef.current.set(trackId, percentage);
            // Trigger recalculation
            setProgress(calculateOverallProgress());
          }
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      handlers.push({ video, handler: handleTimeUpdate });
    });

    return () => {
      handlers.forEach(({ video, handler }) => {
        video.removeEventListener('timeupdate', handler);
      });
    };
  }, [htmlContent, calculateOverallProgress]);

  // Checkpoint tracking with IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !htmlContent) return;

    const checkpoints = container.querySelectorAll('[data-checkpoint]');
    setTotalCheckpoints(checkpoints.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const checkpointId = entry.target.getAttribute('data-checkpoint');
            if (checkpointId && !checkpointsRef.current.has(checkpointId)) {
              checkpointsRef.current.add(checkpointId);
              setProgress(calculateOverallProgress());
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    checkpoints.forEach((checkpoint) => observer.observe(checkpoint));

    return () => observer.disconnect();
  }, [htmlContent, calculateOverallProgress]);

  // Update progress whenever tracking values change
  useEffect(() => {
    const newProgress = calculateOverallProgress();
    
    if (newProgress !== progress) {
      setProgress(newProgress);
      onProgressUpdate?.(newProgress);

      // Debounce database updates
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      progressUpdateTimeoutRef.current = setTimeout(() => {
        updateProgressInDatabase(newProgress);
      }, 500);
    }
  }, [maxScrollDepth, totalCheckpoints, calculateOverallProgress, progress, onProgressUpdate, updateProgressInDatabase]);

  // Load content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const sanitizedHtml = await loadHTMLContent(contentUrl);
        setHtmlContent(sanitizedHtml);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (contentUrl) {
      loadContent();
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, []);

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
      
      {!loading && !error && htmlContent && (
        <>
          {/* Progress bar */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
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
          
          {/* Content */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto scroll-smooth"
          >
            <div 
              className="course-content max-w-4xl mx-auto px-6 py-8"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </>
      )}
    </div>
  );
};
