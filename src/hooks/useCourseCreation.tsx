import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: string;
  template_data: any;
  clinic_id: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  color_scheme: string;
  icon: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  thumbnail_path?: string;
  metadata?: any;
  created_at: string;
}

export interface CourseData {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  course_type: string;
  estimated_duration?: number;
  thumbnail_url?: string;
  prerequisites?: string[];
}

export interface ModuleData {
  title: string;
  content: string;
  module_type: string;
  module_order: number;
  duration?: number;
  resources?: any;
}

export interface QuizData {
  title: string;
  description: string;
  passing_score: number;
  attempts_allowed?: number;
  time_limit?: number;
  questions: Array<{
    id: number;
    question: string;
    type: 'multiple_choice' | 'true_false';
    options?: string[];
    correct_answer: number | boolean;
    explanation?: string;
  }>;
}

export const useCourseCreation = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const { toast } = useToast();

  // Fetch course templates
  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('course_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load course templates",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch course categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch media assets
  const fetchMediaAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaAssets(data || []);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      toast({
        title: "Error",
        description: "Failed to load media assets",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Upload media file
  const uploadMedia = useCallback(async (file: File): Promise<MediaAsset | null> => {
    try {
      setLoading(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('learning-content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save media asset record
      const { data: user } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.user?.id)
        .single();

      const { data: assetData, error: assetError } = await supabase
        .from('media_assets')
        .insert({
          filename: fileName,
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          uploaded_by: user.user?.id,
          clinic_id: userProfile?.clinic_id,
          metadata: {
            content_type: file.type,
            last_modified: file.lastModified
          }
        })
        .select()
        .single();

      if (assetError) throw assetError;

      toast({
        title: "Success",
        description: "Media file uploaded successfully"
      });

      return assetData;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "Failed to upload media file",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create course
  const createCourse = useCallback(async (courseData: CourseData): Promise<string | null> => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.user?.id)
        .single();

      const { data, error } = await supabase
        .from('learning_courses')
        .insert({
          ...courseData,
          created_by: user.user?.id,
          clinic_id: userProfile?.clinic_id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course created successfully"
      });

      return data.id;
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create module
  const createModule = useCallback(async (courseId: string, moduleData: ModuleData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('learning_modules')
        .insert({
          course_id: courseId,
          ...moduleData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module created successfully"
      });

      return true;
    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create quiz
  const createQuiz = useCallback(async (courseId: string, moduleId: string | null, quizData: QuizData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('learning_quizzes')
        .insert({
          course_id: courseId,
          module_id: moduleId,
          ...quizData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz created successfully"
      });

      return true;
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Bulk import from template
  const importFromTemplate = useCallback(async (template: CourseTemplate, courseData: Partial<CourseData>): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Create course
      const courseId = await createCourse({
        title: courseData.title || template.name,
        description: courseData.description || template.description,
        category: template.category,
        difficulty_level: template.difficulty_level,
        course_type: 'course',
        estimated_duration: template.template_data.modules.reduce((sum, mod) => sum + mod.duration, 0),
        ...courseData
      });

      if (!courseId) throw new Error('Failed to create course');

      // Create modules from template
      for (let i = 0; i < template.template_data.modules.length; i++) {
        const moduleTemplate = template.template_data.modules[i];
        await createModule(courseId, {
          title: moduleTemplate.title,
          content: `This is the ${moduleTemplate.title.toLowerCase()} module. Please add your content here.`,
          module_type: moduleTemplate.type,
          module_order: i + 1,
          duration: moduleTemplate.duration
        });
      }

      // Create quiz if template has one
      if (template.template_data.quiz) {
        const quizTemplate = template.template_data.quiz;
        await createQuiz(courseId, null, {
          title: `${courseData.title || template.name} Assessment`,
          description: 'Complete this assessment to test your knowledge',
          passing_score: quizTemplate.passing_score,
          attempts_allowed: 3,
          time_limit: quizTemplate.time_limit,
          questions: Array.from({ length: quizTemplate.questions }, (_, i) => ({
            id: i + 1,
            question: `Sample question ${i + 1}`,
            type: 'multiple_choice' as const,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: 0,
            explanation: 'This is a sample explanation'
          }))
        });
      }

      toast({
        title: "Success",
        description: "Course imported from template successfully"
      });

      return courseId;
    } catch (error) {
      console.error('Error importing from template:', error);
      toast({
        title: "Error", 
        description: "Failed to import course from template",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, createCourse, createModule, createQuiz]);

  // Save course version
  const saveCourseVersion = useCallback(async (courseId: string, versionName?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get current course data
      const { data: courseData, error: courseError } = await supabase
        .from('learning_courses')
        .select(`
          *,
          modules:learning_modules(*),
          quizzes:learning_quizzes(*)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Get next version number
      const { data: lastVersion } = await supabase
        .from('course_versions')
        .select('version_number')
        .eq('course_id', courseId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (lastVersion?.version_number || 0) + 1;

      // Save version
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('course_versions')
        .insert({
          course_id: courseId,
          version_number: nextVersion,
          version_name: versionName || `Version ${nextVersion}`,
          course_data: courseData,
          created_by: user.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course version saved successfully"
      });

      return true;
    } catch (error) {
      console.error('Error saving course version:', error);
      toast({
        title: "Error",
        description: "Failed to save course version",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    templates,
    categories,
    mediaAssets,
    fetchTemplates,
    fetchCategories,
    fetchMediaAssets,
    uploadMedia,
    createCourse,
    createModule,
    createQuiz,
    importFromTemplate,
    saveCourseVersion
  };
};