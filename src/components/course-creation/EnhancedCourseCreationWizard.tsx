import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCourseCreation } from '@/hooks/useCourseCreation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { TemplateSelector } from './TemplateSelector';
import { ModuleBuilder } from './ModuleBuilder';
import { QuizBuilder } from './QuizBuilder';
import { CoursePreview } from './CoursePreview';
import { MediaUpload } from './MediaUpload';
import { DraggableModuleList } from './DraggableModuleList';
import { BulkOperationsToolbar } from './BulkOperationsToolbar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BookOpen, 
  Settings, 
  FileText, 
  HelpCircle, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Save,
  Rocket,
  Upload,
  Camera,
  Video,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Zap,
  Globe,
  Star,
  Users,
  Clock,
  Target,
  Award,
  TrendingUp,
  Plus
} from 'lucide-react';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  course_type: string;
  thumbnail_url?: string;
  is_published: boolean;
  prerequisites?: string[];
}

interface ModuleFormData {
  title: string;
  content: string;
  module_type: string;
  duration: number;
  resources?: any;
  media_assets?: string[];
}

interface QuizFormData {
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  attempts_allowed: number;
  questions: Array<{
    id: number;
    question: string;
    type: 'multiple_choice' | 'true_false';
    options?: string[];
    correct_answer: number | boolean;
    explanation?: string;
  }>;
}

interface ValidationError {
  field: string;
  message: string;
}

interface EnhancedCourseCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (courseId: string) => void;
}

export const EnhancedCourseCreationWizard: React.FC<EnhancedCourseCreationWizardProps> = ({
  isOpen,
  onClose,
  onCourseCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [isEditingModule, setIsEditingModule] = useState<number | null>(null);

  // Enhanced state management with undo/redo
  interface WizardState {
    courseData: CourseFormData;
    modules: ModuleFormData[];
    quiz: QuizFormData | null;
    selectedTemplate: any;
  }

  const initialState: WizardState = {
    courseData: {
      title: '',
      description: '',
      category: '',
      difficulty_level: 'beginner',
      estimated_duration: 60,
      course_type: 'course',
      is_published: false,
      prerequisites: []
    },
    modules: [],
    quiz: null,
    selectedTemplate: null
  };

  const {
    state: wizardState,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  } = useUndoRedo(initialState);

  // Extract individual states for easier access
  const courseData = wizardState.courseData;
  const modules = wizardState.modules;
  const quiz = wizardState.quiz;
  const selectedTemplate = wizardState.selectedTemplate;

  const {
    loading: hookLoading,
    templates,
    categories,
    fetchTemplates,
    fetchCategories,
    createCourse,
    createModule,
    createQuiz,
    importFromTemplate
  } = useCourseCreation();

  // Auto-save functionality
  const { forceSave } = useAutoSave(wizardState, {
    delay: 3000,
    enabled: isDirty && isOpen,
    onSave: async (data: WizardState) => {
      try {
        // Save to localStorage as backup
        localStorage.setItem('course-wizard-autosave', JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Auto-save failed:', error);
        return false;
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchCategories();
      
      // Try to restore from auto-save
      try {
        const saved = localStorage.getItem('course-wizard-autosave');
        if (saved) {
          const savedData = JSON.parse(saved);
          if (savedData.courseData?.title || savedData.modules?.length > 0) {
            updateState(savedData, false);
            toast.success('Restored previous work from auto-save');
          }
        }
      } catch (error) {
        console.error('Failed to restore auto-save:', error);
      }
    }
  }, [isOpen, fetchTemplates, fetchCategories, updateState]);

  const steps = [
    {
      title: 'Template',
      description: 'Choose a starting point',
      icon: Palette,
      component: 'template',
      isComplete: () => currentStep > 0
    },
    {
      title: 'Course Info',
      description: 'Basic details & media',
      icon: BookOpen,
      component: 'info',
      isComplete: () => courseData.title && courseData.category && courseData.description
    },
    {
      title: 'Content',
      description: 'Build your modules',
      icon: FileText,
      component: 'modules',
      isComplete: () => modules.length > 0
    },
    {
      title: 'Assessment',
      description: 'Optional quiz',
      icon: HelpCircle,
      component: 'quiz',
      isComplete: () => true // Optional step
    },
    {
      title: 'Preview',
      description: 'Review & publish',
      icon: Eye,
      component: 'preview',
      isComplete: () => true
    }
  ];

  const validateStep = (step: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    switch (step) {
      case 1: // Course Info
        if (!courseData.title?.trim()) {
          errors.push({ field: 'title', message: 'Course title is required' });
        }
        if (!courseData.description?.trim()) {
          errors.push({ field: 'description', message: 'Course description is required' });
        }
        if (!courseData.category) {
          errors.push({ field: 'category', message: 'Please select a category' });
        }
        break;
      case 2: // Modules
        if (modules.length === 0) {
          errors.push({ field: 'modules', message: 'At least one module is required' });
        }
        modules.forEach((module, index) => {
          if (!module.title?.trim()) {
            errors.push({ field: `module-${index}-title`, message: `Module ${index + 1} title is required` });
          }
          if (!module.content?.trim()) {
            errors.push({ field: `module-${index}-content`, message: `Module ${index + 1} content is required` });
          }
        });
        break;
    }

    return errors;
  };

  const getErrorsForField = (field: string) => {
    return validationErrors.filter(error => error.field === field);
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fix the validation errors before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setValidationErrors([]);
  };

  // Enhanced state update helpers
  const updateCourseData = (newData: Partial<CourseFormData>) => {
    updateState({
      ...wizardState,
      courseData: { ...courseData, ...newData }
    });
    setIsDirty(true);
  };

  const updateModules = (newModules: ModuleFormData[]) => {
    updateState({
      ...wizardState,
      modules: newModules
    });
    setIsDirty(true);
  };

  const updateQuiz = (newQuiz: QuizFormData | null) => {
    updateState({
      ...wizardState,
      quiz: newQuiz
    });
    setIsDirty(true);
  };

  const handleTemplateSelect = (template: any) => {
    if (!template) {
      updateState({
        ...wizardState,
        selectedTemplate: null
      });
      return;
    }

    const newCourseData = {
      ...courseData,
      category: template.category || courseData.category,
      difficulty_level: template.difficulty_level || courseData.difficulty_level,
      estimated_duration: template.template_data?.modules?.reduce((sum: number, mod: any) => sum + (mod.duration || 15), 0) || courseData.estimated_duration || 60
    };
    
    // Pre-populate modules from template
    const templateModules = template.template_data?.modules?.map((mod: any, index: number) => ({
      title: mod.title || `Module ${index + 1}`,
      content: `This is the ${mod.title?.toLowerCase() || 'module'} content. Please customize this content for your course.`,
      module_type: mod.type || 'text',
      duration: mod.duration || 15,
      media_assets: [] as string[]
    })) || [];

    // Pre-populate quiz if template has one
    let newQuiz: QuizFormData | null = null;
    if (template.template_data?.quiz) {
      const quizTemplate = template.template_data.quiz;
      newQuiz = {
        title: `${template.name} Assessment`,
        description: 'Test your knowledge of the course material',
        time_limit: quizTemplate.time_limit || 30,
        passing_score: quizTemplate.passing_score || 70,
        attempts_allowed: quizTemplate.attempts_allowed || 3,
        questions: Array.isArray(quizTemplate.questions) 
          ? quizTemplate.questions.map((q: any, index: number) => ({
              id: index + 1,
              question: q.question || 'Sample question - please customize',
              type: q.type || 'multiple_choice',
              options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              correct_answer: q.correct_answer || 0,
              explanation: q.explanation || 'This is a sample explanation - please customize'
            }))
          : [{
              id: 1,
              question: 'Sample question - please customize this',
              type: 'multiple_choice' as const,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correct_answer: 0,
              explanation: 'This is a sample explanation - please customize'
            }]
      };
    }

    updateState({
      courseData: newCourseData,
      modules: templateModules,
      quiz: newQuiz,
      selectedTemplate: template
    });
    setIsDirty(true);
  };

  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      const finalErrors = validateStep(currentStep);
      if (finalErrors.length > 0) {
        setValidationErrors(finalErrors);
        return;
      }

              const courseId = await createCourse({
                ...courseData,
                prerequisites: courseData.prerequisites || []
              });
      if (!courseId) {
        toast.error('Failed to create course');
        return;
      }

      // Create modules
      for (let i = 0; i < modules.length; i++) {
        const success = await createModule(courseId, {
          ...modules[i],
          module_order: i + 1
        });
        if (!success) {
          toast.error(`Failed to create module ${i + 1}`);
          return;
        }
      }

      // Create quiz if exists
      if (quiz) {
        const quizWithDefaults = {
          ...quiz,
          attempts_allowed: quiz.attempts_allowed || 3
        };
        const success = await createQuiz(courseId, null, quizWithDefaults);
        if (!success) {
          toast.error('Failed to create quiz');
          return;
        }
      }

      toast.success('Course created successfully!');
      onCourseCreated(courseId);
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-learning-quiz to-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-learning-quiz via-primary to-learning-quiz bg-clip-text text-transparent mb-2">
                  Choose Your Starting Point
                </h2>
                <p className="text-muted-foreground text-lg">
                  Select a template to jumpstart your course creation, or start from scratch
                </p>
              </div>
            </div>
            
            <Card className="border-dashed border-2 bg-gradient-to-br from-background via-background to-muted/20">
              <CardContent className="p-8">
                <TemplateSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={handleTemplateSelect}
                  onSkip={() => setCurrentStep(1)}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-learning-quiz to-primary rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
                  Course Information
                </h2>
                <p className="text-muted-foreground text-lg">Let's set up the foundation of your course</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="hover-scale transition-all duration-200 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Basic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div>
                       <Label htmlFor="title" className="text-base font-semibold">Course Title *</Label>
                       <Input
                         id="title"
                         value={courseData.title}
                         onChange={(e) => updateCourseData({ title: e.target.value })}
                         placeholder="Enter an engaging course title..."
                         className={`mt-2 text-lg h-12 ${getErrorsForField('title').length > 0 ? 'border-destructive' : ''}`}
                       />
                      {getErrorsForField('title').map((error, i) => (
                        <p key={i} className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {error.message}
                        </p>
                      ))}
                    </div>

                     <div>
                       <Label htmlFor="description" className="text-base font-semibold">Course Description *</Label>
                       <Textarea
                         id="description"
                         value={courseData.description}
                         onChange={(e) => updateCourseData({ description: e.target.value })}
                         placeholder="Describe what students will learn in this course..."
                         className={`mt-2 min-h-[120px] ${getErrorsForField('description').length > 0 ? 'border-destructive' : ''}`}
                       />
                      {getErrorsForField('description').map((error, i) => (
                        <p key={i} className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {error.message}
                        </p>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                         <Select
                           value={courseData.category}
                           onValueChange={(value) => updateCourseData({ category: value })}
                         >
                          <SelectTrigger className={`mt-2 h-12 ${getErrorsForField('category').length > 0 ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getErrorsForField('category').map((error, i) => (
                          <p key={i} className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {error.message}
                          </p>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor="difficulty" className="text-base font-semibold">Difficulty Level</Label>
                         <Select
                           value={courseData.difficulty_level}
                           onValueChange={(value) => updateCourseData({ difficulty_level: value })}
                         >
                          <SelectTrigger className="mt-2 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                  <div className="font-medium">Beginner</div>
                                  <div className="text-xs text-muted-foreground">No prior experience needed</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="intermediate">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div>
                                  <div className="font-medium">Intermediate</div>
                                  <div className="text-xs text-muted-foreground">Some experience required</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="advanced">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div>
                                  <div className="font-medium">Advanced</div>
                                  <div className="text-xs text-muted-foreground">Expert level content</div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration" className="text-base font-semibold">Estimated Duration (minutes)</Label>
                        <div className="relative mt-2">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="duration"
                            type="number"
                            value={courseData.estimated_duration}
                             onChange={(e) => updateCourseData({ estimated_duration: parseInt(e.target.value) || 0 })}
                            placeholder="60"
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="course_type" className="text-base font-semibold">Course Type</Label>
                        <Select
                          value={courseData.course_type}
                           onValueChange={(value) => updateCourseData({ course_type: value })}
                        >
                          <SelectTrigger className="mt-2 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="course">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Course
                              </div>
                            </SelectItem>
                            <SelectItem value="tutorial">
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Tutorial
                              </div>
                            </SelectItem>
                            <SelectItem value="workshop">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Workshop
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course Thumbnail */}
              <div className="space-y-6">
                <Card className="hover-scale transition-all duration-200 border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Course Thumbnail
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MediaUpload
                      bucket="course-thumbnails"
                      multiple={false}
                      acceptedTypes={["image/*"]}
                      maxSize={5 * 1024 * 1024} // 5MB
                       onFileUploaded={(file) => {
                         const thumbnailUrl = file.url || `https://jnbdhtlmdxtanwlubyis.supabase.co/storage/v1/object/public/course-thumbnails/${file.filename}`;
                         updateCourseData({ thumbnail_url: thumbnailUrl });
                       }}
                      showPreview={true}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a compelling thumbnail image (recommended: 1200x600px)
                    </p>
                  </CardContent>
                </Card>

                {/* Course Stats Preview */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-learning-quiz/10 via-primary/5 to-learning-quiz/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      Course Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Modules</span>
                      <Badge variant="outline">{modules.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <Badge variant="outline">{courseData.estimated_duration}min</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quiz</span>
                      <Badge variant="outline">{quiz ? 'Yes' : 'No'}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level</span>
                      <Badge variant="outline" className="capitalize">{courseData.difficulty_level}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-learning-quiz to-primary rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
                  Course Content
                </h2>
                <p className="text-muted-foreground text-lg">Build engaging modules with rich media content</p>
              </div>
            </div>

            {/* Bulk Operations Toolbar */}
            <BulkOperationsToolbar
              selectedItems={selectedModules}
              totalItems={modules.length}
              onBulkDelete={(indices) => {
                const newModules = modules.filter((_, index) => !indices.includes(index));
                updateModules(newModules);
                setSelectedModules([]);
                toast.success(`Deleted ${indices.length} module(s)`);
              }}
              onBulkDuplicate={(indices) => {
                const duplicatedModules = indices.map(index => ({
                  ...modules[index],
                  title: `${modules[index].title} (Copy)`
                }));
                updateModules([...modules, ...duplicatedModules]);
                setSelectedModules([]);
                toast.success(`Duplicated ${indices.length} module(s)`);
              }}
              onImportFromText={(text) => {
                const lines = text.split('\n').filter(line => line.trim());
                const newModules = lines.map((line, index) => ({
                  title: line.trim() || `Module ${modules.length + index + 1}`,
                  content: `Content for ${line.trim()}`,
                  module_type: 'text',
                  duration: 15,
                  media_assets: [] as string[]
                }));
                updateModules([...modules, ...newModules]);
                toast.success(`Imported ${newModules.length} module(s)`);
              }}
              onExportToText={() => {
                return modules.map(module => module.title).join('\n');
              }}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onSelectAll={() => setSelectedModules(modules.map((_, index) => index))}
              onClearSelection={() => setSelectedModules([])}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Module List */}
              <div className="lg:col-span-3">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Course Modules ({modules.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DraggableModuleList
                      modules={modules}
                      onReorder={updateModules}
                      onEdit={(index) => {
                        // Scroll to module builder or show inline editor
                        const moduleElement = document.getElementById(`module-${index}`);
                        if (moduleElement) {
                          moduleElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      onDelete={(index) => {
                        const newModules = modules.filter((_, i) => i !== index);
                        updateModules(newModules);
                        toast.success('Module deleted');
                      }}
                      onDuplicate={(index) => {
                        const duplicated = {
                          ...modules[index],
                          title: `${modules[index].title} (Copy)`
                        };
                        updateModules([...modules, duplicated]);
                        toast.success('Module duplicated');
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Module Builder */}
              <div className="lg:col-span-1">
                <ModuleBuilder
                  modules={modules}
                  onModulesChange={updateModules}
                />
              </div>
            </div>

            {getErrorsForField('modules').length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Module Validation Errors</span>
                </div>
                <div className="mt-2 space-y-1">
                  {getErrorsForField('modules').map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error.message}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-learning-quiz to-primary rounded-xl flex items-center justify-center shadow-lg">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
                  Course Assessment
                </h2>
                <p className="text-muted-foreground text-lg">Create an optional quiz to test student knowledge</p>
              </div>
            </div>

            <QuizBuilder
              quiz={quiz}
               onQuizChange={(updatedQuiz) => {
                 if (updatedQuiz) {
                   updateQuiz({
                     ...updatedQuiz,
                     time_limit: updatedQuiz.time_limit || 30,
                     attempts_allowed: updatedQuiz.attempts_allowed || 3
                   });
                 } else {
                   updateQuiz(null);
                 }
               }}
            />
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  Preview & Publish
                </h2>
                <p className="text-muted-foreground text-lg">Review your course before making it available to students</p>
              </div>
            </div>

            <CoursePreview
              courseData={{
                ...courseData,
                prerequisites: courseData.prerequisites || []
              }}
              modules={modules}
              quiz={quiz}
              onPublish={handleCreateCourse}
              isPublishing={loading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border-0 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Enhanced Progress Header */}
          <div className="px-8 py-6 border-b bg-gradient-to-r from-learning-quiz/10 via-primary/5 to-learning-quiz/10 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-learning-quiz via-primary to-learning-quiz bg-clip-text text-transparent animate-fade-in">
                  {selectedTemplate ? `Creating from "${selectedTemplate.name}"` : "Create New Course"}
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  {steps[currentStep]?.description || "Let's build something amazing together"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">Step {currentStep + 1}</div>
                  <div className="text-xs text-muted-foreground">of {steps.length}</div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-learning-quiz to-primary p-0.5">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <span className="text-lg font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
                {isDirty && (
                  <Badge variant="outline" className="animate-pulse border-yellow-500 text-yellow-700">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Enhanced Progress Steps */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  const isUpcoming = index > currentStep;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 relative flex-1">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
                        ${isActive ? 'bg-gradient-to-r from-learning-quiz to-primary text-white shadow-lg scale-110' : ''}
                        ${isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                        ${isUpcoming ? 'bg-muted text-muted-foreground hover:bg-muted-dark' : ''}
                      `}
                      onClick={() => {
                        if (index < currentStep) {
                          setCurrentStep(index);
                        }
                      }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium ${
                          isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`
                          absolute top-6 left-1/2 w-full h-0.5 transition-all duration-300 -z-10
                          ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                        `} style={{ transform: 'translateX(24px)', width: 'calc(100% - 48px)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Animated Progress Bar */}
              <div className="w-full bg-muted/50 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-learning-quiz via-primary to-learning-quiz h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Content Area - Fixed Height */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-8 py-8 h-full">
              <div className="max-w-6xl mx-auto">
                <div className="animate-fade-in">
                  {renderStepContent()}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation - Always Visible */}
          <div className="px-8 py-6 border-t bg-gradient-to-r from-muted/30 via-background to-muted/30 backdrop-blur-sm flex-shrink-0 sticky bottom-0 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={loading}
                    className="hover-scale transition-all duration-200 border-2 bg-background hover:bg-muted"
                    size="lg"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                {isDirty && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    Unsaved changes
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="hover:bg-destructive/10 hover:text-destructive"
                  size="lg"
                >
                  Cancel
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-gradient-to-r from-learning-quiz to-primary hover:from-learning-quiz/90 hover:to-primary/90 hover-scale shadow-lg transition-all duration-200 border-0 px-8 text-white font-semibold"
                    size="lg"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateCourse}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 hover-scale shadow-lg transition-all duration-200 text-white font-semibold px-8 border-0"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Create Course
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};