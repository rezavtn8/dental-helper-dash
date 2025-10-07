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
    const pathInfo = `bucket=learning-content, path=${url}`;
    try {
      // 1) If absolute URL, fetch directly
      if (/^https?:\/\//i.test(url)) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'img', 'video', 'audio', 'source', 'iframe',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span', 'section', 'article', 'blockquote',
            'a', 'code', 'pre'
          ],
          ALLOWED_ATTR: [
            'src', 'alt', 'title', 'href', 'target',
            'controls', 'autoplay', 'loop', 'muted',
            'data-track-id', 'data-checkpoint', 'data-section-id',
            'class', 'id', 'style',
            'width', 'height', 'poster'
          ],
          ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|data:image\/)/,
          KEEP_CONTENT: true,
          ADD_TAGS: ['video', 'audio', 'source'],
          ADD_ATTR: ['data-track-id', 'data-checkpoint']
        });
      }

      // 2) Try signed URL first (works for private buckets)
      const signed = await supabase.storage
        .from('learning-content')
        .createSignedUrl(url, 60 * 60);

      if (signed.data?.signedUrl) {
        const res = await fetch(signed.data.signedUrl);
        if (!res.ok) throw new Error(`Signed URL fetch failed HTTP ${res.status}`);
        const html = await res.text();
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'img', 'video', 'audio', 'source', 'iframe',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span', 'section', 'article', 'blockquote',
            'a', 'code', 'pre'
          ],
          ALLOWED_ATTR: [
            'src', 'alt', 'title', 'href', 'target',
            'controls', 'autoplay', 'loop', 'muted',
            'data-track-id', 'data-checkpoint', 'data-section-id',
            'class', 'id', 'style',
            'width', 'height', 'poster'
          ],
          ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|data:image\/)/,
          KEEP_CONTENT: true,
          ADD_TAGS: ['video', 'audio', 'source'],
          ADD_ATTR: ['data-track-id', 'data-checkpoint']
        });
      }

      // 3) Fallback to direct download (for public buckets)
      const { data, error } = await supabase.storage
        .from('learning-content')
        .download(url);
      if (error) throw error;

      const html = await data.text();
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'img', 'video', 'audio', 'source', 'iframe',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span', 'section', 'article', 'blockquote',
          'a', 'code', 'pre'
        ],
        ALLOWED_ATTR: [
          'src', 'alt', 'title', 'href', 'target',
          'controls', 'autoplay', 'loop', 'muted',
          'data-track-id', 'data-checkpoint', 'data-section-id',
          'class', 'id', 'style',
          'width', 'height', 'poster'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|data:image\/)/,
        KEEP_CONTENT: true,
        ADD_TAGS: ['video', 'audio', 'source'],
        ADD_ATTR: ['data-track-id', 'data-checkpoint']
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="course-content-viewer w-full">
      {/* Progress indicator */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Module Progress</span>
            <span className="text-sm text-muted-foreground">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* HTML content */}
      <div
        ref={containerRef}
        className="prose prose-sm max-w-none overflow-y-auto max-h-[70vh] px-6 pb-6 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
