import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  course_type: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface LearningModule {
  id: string;
  course_id: string;
  title: string;
  content: string;
  module_order: number;
  module_type: string;
  duration: number;
  resources?: any;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  completion_percentage: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  last_accessed_at: string;
}

export interface LearningQuiz {
  id: string;
  course_id?: string;
  module_id?: string;
  title: string;
  description: string;
  passing_score: number;
  questions: any;
  time_limit?: number;
  attempts_allowed: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: any;
  score: number;
  passed: boolean;
  started_at: string;
  completed_at: string;
  time_taken?: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  badge_icon: string;
  points_awarded: number;
  earned_at: string;
}

export const useLearning = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses - for staff, only show assigned courses
  const fetchCourses = async () => {
    try {
      if (!user?.id) return;
      
      // Get user profile to check role
      const { data: userProfile } = await supabase
        .from('users')
        .select('role, clinic_id')
        .eq('id', user.id)
        .single();

      if (userProfile?.role === 'owner') {
        // Owners can see all platform courses (system courses without clinic_id)
        const { data, error } = await supabase
          .from('learning_courses')
          .select('*')
          .eq('is_active', true)
          .is('clinic_id', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } else {
        // Staff only see assigned courses via learning_assignments table
        const { data, error } = await supabase
          .from('learning_assignments')
          .select(`
            *,
            learning_courses (
              id,
              title,
              description,
              category,
              difficulty_level,
              estimated_duration,
              course_type,
              thumbnail_url,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .eq('learning_courses.is_active', true)
          .order('assigned_at', { ascending: false });

        if (error) throw error;
        
        // Extract courses from the assignments and filter out null courses
        const assignedCourses = (data || [])
          .map(assignment => assignment.learning_courses)
          .filter(Boolean) as LearningCourse[];
        
        setCourses(assignedCourses);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching courses');
    }
  };

  // Fetch user progress
  const fetchProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching progress');
    }
  };

  // Fetch user achievements
  const fetchAchievements = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('learning_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching achievements');
    }
  };

  // Start a course
  const startCourse = async (courseId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('learning_progress')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting course');
    }
  };

  // Update module progress
  const updateModuleProgress = async (moduleId: string, courseId: string, completionPercentage: number) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          completion_percentage: completionPercentage,
          status: completionPercentage >= 100 ? 'completed' : 'in_progress',
          ...(completionPercentage >= 100 && { completed_at: new Date().toISOString() }),
          ...(completionPercentage > 0 && !progress.some(p => p.module_id === moduleId) && { started_at: new Date().toISOString() }),
          last_accessed_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating progress');
    }
  };

  // Get course progress
  const getCourseProgress = (courseId: string) => {
    return progress.find(p => p.course_id === courseId && !p.module_id);
  };

  // Get module progress
  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.module_id === moduleId);
  };

  // Calculate overall progress stats
  const getProgressStats = () => {
    const completedCourses = progress.filter(p => p.status === 'completed' && !p.module_id).length;
    const inProgressCourses = progress.filter(p => p.status === 'in_progress' && !p.module_id).length;
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points_awarded, 0);

    return {
      completedCourses,
      inProgressCourses,
      availableCourses: courses.length,
      totalPoints,
      achievements: achievements.length,
    };
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchProgress(), fetchAchievements()]);
      setLoading(false);
    };

    if (user?.id) {
      initData();
    }
  }, [user?.id]);

  return {
    courses,
    progress,
    achievements,
    loading,
    error,
    startCourse,
    updateModuleProgress,
    getCourseProgress,
    getModuleProgress,
    getProgressStats,
    refetch: () => Promise.all([fetchCourses(), fetchProgress(), fetchAchievements()]),
  };
};

export const useLearningModules = (courseId: string) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('learning_modules')
          .select('*')
          .eq('course_id', courseId)
          .order('module_order', { ascending: true });

        if (error) throw error;
        setModules(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  return { modules, loading, error };
};

export const useLearningQuizzes = (courseId?: string, moduleId?: string) => {
  const [quizzes, setQuizzes] = useState<LearningQuiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchQuizzes = async () => {
    try {
      let query = supabase.from('learning_quizzes').select('*');
      
      if (courseId) query = query.eq('course_id', courseId);
      if (moduleId) query = query.eq('module_id', moduleId);

      const { data, error } = await query;
      if (error) throw error;
      setQuizzes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching quizzes');
    }
  };

  const fetchAttempts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAttempts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching quiz attempts');
    }
  };

  const submitQuizAttempt = async (quizId: string, answers: any, score: number, timeTaken: number) => {
    if (!user?.id) return null;

    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return null;

    const passed = score >= quiz.passing_score;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          answers,
          score,
          passed,
          started_at: new Date(Date.now() - timeTaken * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          time_taken: timeTaken,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAttempts();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting quiz attempt');
      return null;
    }
  };

  const getQuizAttempts = (quizId: string) => {
    return attempts.filter(attempt => attempt.quiz_id === quizId);
  };

  const getBestScore = (quizId: string) => {
    const quizAttempts = getQuizAttempts(quizId);
    return Math.max(...quizAttempts.map(attempt => attempt.score), 0);
  };

  const hasPassedQuiz = (quizId: string) => {
    return attempts.some(attempt => attempt.quiz_id === quizId && attempt.passed);
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchQuizzes(), fetchAttempts()]);
      setLoading(false);
    };

    if (courseId || moduleId) {
      initData();
    }
  }, [courseId, moduleId, user?.id]);

  return {
    quizzes,
    attempts,
    loading,
    error,
    submitQuizAttempt,
    getQuizAttempts,
    getBestScore,
    hasPassedQuiz,
  };
};