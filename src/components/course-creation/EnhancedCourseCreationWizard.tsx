import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Settings, 
  Play, 
  Save,
  Sparkles,
  Upload,
  FileText,
  Video,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Award,
  Users
} from 'lucide-react';
import { useCourseCreation, CourseTemplate, CourseCategory, MediaAsset } from '@/hooks/useCourseCreation';
import { ModuleBuilder } from './ModuleBuilder';
import { QuizBuilder } from './QuizBuilder';
import { CoursePreview } from './CoursePreview';
import { TemplateSelector } from './TemplateSelector';
import { MediaUpload } from './MediaUpload';
import { useToast } from '@/hooks/use-toast';

interface EnhancedCourseCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: (courseId: string) => void;
}

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  course_type: string;
  estimated_duration: number;
  thumbnail_url?: string;
  prerequisites: string[];
}

interface ModuleFormData {
  title: string;
  content: string;
  module_type: string;
  duration: number;
  resources?: any;
  media_assets?: string[]; // Array of media URLs
}

interface QuizFormData {
  title: string;
  description: string;
  passing_score: number;
  attempts_allowed: number;
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

interface ValidationError {
  field: string;
  message: string;
}

export const EnhancedCourseCreationWizard: React.FC<EnhancedCourseCreationWizardProps> = ({
  isOpen,
  onClose,
  onCourseCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    course_type: 'course',
    estimated_duration: 0,
    prerequisites: []
  });
  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [quiz, setQuiz] = useState<QuizFormData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { toast } = useToast();

  const {
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
  } = useCourseCreation();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchCategories();
      // Reset form when opening
      resetForm();
    }
  }, [isOpen, fetchTemplates, fetchCategories]);

  const resetForm = () => {
    setCourseData({
      title: '',
      description: '',
      category: '',
      difficulty_level: 'beginner',
      course_type: 'course',
      estimated_duration: 0,
      prerequisites: []
    });
    setModules([]);
    setQuiz(null);
    setSelectedTemplate(null);
    setValidationErrors([]);
    setIsDirty(false);
    setCurrentStep(0);
  };

  const steps = [
    { 
      title: 'Template', 
      icon: Sparkles, 
      description: 'Choose a starting template',
      isComplete: () => currentStep > 0
    },
    { 
      title: 'Course Info', 
      icon: BookOpen, 
      description: 'Basic course details',
      isComplete: () => courseData.title && courseData.description && courseData.category
    },
    { 
      title: 'Modules', 
      icon: FileText, 
      description: 'Create course modules',
      isComplete: () => modules.length > 0 && modules.every(m => m.title && m.content)
    },
    { 
      title: 'Assessment', 
      icon: HelpCircle, 
      description: 'Add quizzes and tests',
      isComplete: () => !quiz || (quiz.questions.length > 0 && quiz.title)
    },
    { 
      title: 'Preview', 
      icon: Play, 
      description: 'Review and publish',
      isComplete: () => false // Never complete until published
    }
  ];

  const validateStep = (step: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    switch (step) {
      case 1: // Course Info
        if (!courseData.title.trim()) {
          errors.push({ field: 'title', message: 'Course title is required' });
        }
        if (courseData.title.length > 100) {
          errors.push({ field: 'title', message: 'Course title must be under 100 characters' });
        }
        if (!courseData.description.trim()) {
          errors.push({ field: 'description', message: 'Course description is required' });
        }
        if (courseData.description.length < 50) {
          errors.push({ field: 'description', message: 'Course description should be at least 50 characters' });
        }
        if (!courseData.category) {
          errors.push({ field: 'category', message: 'Please select a category' });
        }
        if (courseData.estimated_duration < 5) {
          errors.push({ field: 'estimated_duration', message: 'Duration should be at least 5 minutes' });
        }
        break;

      case 2: // Modules
        if (modules.length === 0) {
          errors.push({ field: 'modules', message: 'At least one module is required' });
        }
        modules.forEach((module, index) => {
          if (!module.title.trim()) {
            errors.push({ field: `module-${index}-title`, message: `Module ${index + 1} title is required` });
          }
          if (!module.content.trim()) {
            errors.push({ field: `module-${index}-content`, message: `Module ${index + 1} content is required` });
          }
          if (module.duration < 1) {
            errors.push({ field: `module-${index}-duration`, message: `Module ${index + 1} duration must be at least 1 minute` });
          }
        });
        break;

      case 3: // Assessment
        if (quiz) {
          if (!quiz.title.trim()) {
            errors.push({ field: 'quiz-title', message: 'Quiz title is required' });
          }
          if (quiz.questions.length === 0) {
            errors.push({ field: 'quiz-questions', message: 'At least one question is required' });
          }
          if (quiz.passing_score < 1 || quiz.passing_score > 100) {
            errors.push({ field: 'quiz-passing-score', message: 'Passing score must be between 1 and 100' });
          }
        }
        break;
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before continuing",
        variant: "destructive"
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (template: CourseTemplate | null) => {
    if (!template) {
      setSelectedTemplate(null);
      return;
    }

    setSelectedTemplate(template);
    setCourseData(prev => ({
      ...prev,
      category: template.category || prev.category,
      difficulty_level: template.difficulty_level || prev.difficulty_level,
      estimated_duration: template.template_data?.modules?.reduce((sum: number, mod: any) => sum + (mod.duration || 15), 0) || prev.estimated_duration || 60
    }));
    
    // Pre-populate modules from template
    if (template.template_data?.modules) {
      const templateModules = template.template_data.modules.map((mod: any, index: number) => ({
        title: mod.title || `Module ${index + 1}`,
        content: `This is the ${mod.title?.toLowerCase() || 'module'} content. Please customize this content for your course.`,
        module_type: mod.type || 'text',
        duration: mod.duration || 15
      }));
      setModules(templateModules);
    }

    // Pre-populate quiz if template has one
    if (template.template_data?.quiz) {
      const quizTemplate = template.template_data.quiz;
      setQuiz({
        title: `${template.name} Assessment`,
        description: 'Complete this assessment to test your knowledge',
        passing_score: quizTemplate.passing_score || 70,
        attempts_allowed: 3,
        time_limit: quizTemplate.time_limit,
        questions: Array.from({ length: quizTemplate.questions || 5 }, (_, i) => ({
          id: i + 1,
          question: `Sample question ${i + 1} - Please customize this question`,
          type: 'multiple_choice' as const,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 0,
          explanation: 'This is a sample explanation - please customize'
        }))
      });
    }

    setIsDirty(true);
  };

  const handleCreateCourse = async () => {
    try {
      const finalErrors = validateStep(currentStep);
      if (finalErrors.length > 0) {
        setValidationErrors(finalErrors);
        return;
      }

      const courseId = await createCourse(courseData);
      if (!courseId) return;

      // Create modules
      for (let i = 0; i < modules.length; i++) {
        await createModule(courseId, {
          ...modules[i],
          module_order: i + 1
        });
      }

      // Create quiz if exists
      if (quiz) {
        await createQuiz(courseId, null, quiz);
      }

      // Save initial version
      await saveCourseVersion(courseId, 'Initial Version');

      toast({
        title: "Success!",
        description: "Course created successfully",
      });

      onCourseCreated?.(courseId);
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getErrorsForField = (field: string) => {
    return validationErrors.filter(error => error.field === field);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-learning-quiz to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Choose Your Starting Point</h3>
                <p className="text-muted-foreground">
                  Start with a pre-built template or create from scratch
                </p>
              </div>
            </div>
            
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onSkip={() => setCurrentStep(1)}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-learning-quiz to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Course Information</h3>
                <p className="text-muted-foreground">Provide the basic details for your course</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => {
                      setCourseData(prev => ({ ...prev, title: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Enter course title"
                    className={`mt-1 ${getErrorsForField('title').length > 0 ? 'border-destructive' : ''}`}
                  />
                  {getErrorsForField('title').map((error, i) => (
                    <p key={i} className="text-sm text-destructive mt-1">{error.message}</p>
                  ))}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value) => {
                      setCourseData(prev => ({ ...prev, category: value }));
                      setIsDirty(true);
                    }}
                  >
                    <SelectTrigger className={`mt-1 ${getErrorsForField('category').length > 0 ? 'border-destructive' : ''}`}>
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
                    <p key={i} className="text-sm text-destructive mt-1">{error.message}</p>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={courseData.difficulty_level}
                      onValueChange={(value) => {
                        setCourseData(prev => ({ ...prev, difficulty_level: value }));
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Beginner
                          </div>
                        </SelectItem>
                        <SelectItem value="intermediate">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Intermediate
                          </div>
                        </SelectItem>
                        <SelectItem value="advanced">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Advanced
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                     <div>
                       <Label htmlFor="type">Course Type</Label>
                       <Select
                         value={courseData.course_type}
                         onValueChange={(value) => {
                           setCourseData(prev => ({ ...prev, course_type: value }));
                           setIsDirty(true);
                         }}
                       >
                         <SelectTrigger className="mt-1">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="course">
                             <div className="flex items-center gap-2">
                               <BookOpen className="h-4 w-4" />
                               Course
                             </div>
                           </SelectItem>
                           <SelectItem value="certification">
                             <div className="flex items-center gap-2">
                               <Award className="h-4 w-4" />
                               Certification
                             </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => {
                      setCourseData(prev => ({ ...prev, description: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Describe what students will learn in this course..."
                    className={`mt-1 min-h-[120px] ${getErrorsForField('description').length > 0 ? 'border-destructive' : ''}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {getErrorsForField('description').map((error, i) => (
                        <p key={i} className="text-sm text-destructive">{error.message}</p>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {courseData.description.length}/500 characters
                    </p>
                  </div>
                </div>

                 <div>
                   <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                   <div className="flex items-center gap-2 mt-1">
                     <Clock className="h-4 w-4 text-muted-foreground" />
                     <Input
                       id="duration"
                       type="number"
                       value={courseData.estimated_duration}
                       onChange={(e) => {
                         setCourseData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }));
                         setIsDirty(true);
                       }}
                       placeholder="60"
                       className={getErrorsForField('estimated_duration').length > 0 ? 'border-destructive' : ''}
                     />
                     <span className="text-sm text-muted-foreground">minutes</span>
                   </div>
                   {getErrorsForField('estimated_duration').map((error, i) => (
                     <p key={i} className="text-sm text-destructive mt-1">{error.message}</p>
                   ))}
                 </div>

                 {/* Course Thumbnail Upload */}
                 <div>
                   <Label>Course Thumbnail (Optional)</Label>
                   <div className="mt-2">
                     <MediaUpload
                       bucket="course-thumbnails"
                       acceptedTypes={['image/*']}
                       maxSize={10}
                       multiple={false}
                       onFileUploaded={(file) => {
                         const thumbnailUrl = file.url || `https://jnbdhtlmdxtanwlubyis.supabase.co/storage/v1/object/public/course-thumbnails/${file.filename}`;
                         setCourseData(prev => ({ 
                           ...prev, 
                           thumbnail_url: thumbnailUrl
                         }));
                         setIsDirty(true);
                       }}
                       className="max-w-md"
                     />
                   </div>
                 </div>

                 {/* Course Thumbnail Upload */}
                 <div>
                   <Label>Course Thumbnail (Optional)</Label>
                   <div className="mt-2">
                     <MediaUpload
                       bucket="course-thumbnails"
                       acceptedTypes={['image/*']}
                       maxSize={10}
                       multiple={false}
                       onFileUploaded={(file) => {
                         setCourseData(prev => ({ 
                           ...prev, 
                           thumbnail_url: file.url || `https://jnbdhtlmdxtanwlubyis.supabase.co/storage/v1/object/public/course-thumbnails/${file.filename}`
                         }));
                         setIsDirty(true);
                       }}
                       className="max-w-md"
                     />
                   </div>
                 </div>

                {/* Preview Card */}
                <Card className="bg-gradient-to-r from-muted/50 to-muted-light/30 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Course Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Title:</strong> {courseData.title || 'Untitled Course'}</p>
                    <p><strong>Category:</strong> {courseData.category || 'Not selected'}</p>
                    <p><strong>Level:</strong> {courseData.difficulty_level}</p>
                    <p><strong>Duration:</strong> {courseData.estimated_duration} minutes</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-learning-quiz to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Course Modules</h3>
                <p className="text-muted-foreground">Break your course into digestible modules</p>
              </div>
            </div>

            {getErrorsForField('modules').length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getErrorsForField('modules')[0].message}
                </AlertDescription>
              </Alert>
            )}

            <ModuleBuilder
              modules={modules}
              onModulesChange={(newModules) => {
                setModules(newModules);
                setIsDirty(true);
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-learning-quiz to-purple-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Assessment & Quizzes</h3>
                <p className="text-muted-foreground">Test your students' understanding (optional)</p>
              </div>
            </div>

            <QuizBuilder
              quiz={quiz}
              onQuizChange={(newQuiz) => {
                setQuiz(newQuiz);
                setIsDirty(true);
              }}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-learning-success to-emerald-500 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Review & Publish</h3>
                <p className="text-muted-foreground">Review your course and make it available to students</p>
              </div>
            </div>

            <CoursePreview
              courseData={courseData}
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

  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Course
            {isDirty && (
              <Badge variant="outline" className="ml-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                Unsaved Changes
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Enhanced Progress Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete = step.isComplete();
                  const isCurrent = index === currentStep;
                  const isPast = index < currentStep;
                  
                  return (
                    <React.Fragment key={index}>
                      <div
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-gradient-to-r from-learning-quiz to-purple-500 text-white shadow-lg scale-105'
                            : isPast
                            ? 'bg-gradient-to-r from-learning-success to-emerald-500 text-white shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted-medium'
                        }`}
                        onClick={() => {
                          // Allow navigation to previous steps
                          if (index < currentStep) {
                            setCurrentStep(index);
                          }
                        }}
                      >
                        <div className="relative">
                          {isComplete && !isCurrent ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="hidden sm:block">
                          <div className="font-semibold text-sm">{step.title}</div>
                          <div className="text-xs opacity-80">{step.description}</div>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <Badge variant="outline" className="text-lg py-2 px-4">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Enhanced Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} size="lg">
                Cancel
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button 
                  onClick={handleCreateCourse} 
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-learning-success to-emerald-500 hover:from-learning-success/90 hover:to-emerald-500/90 text-white border-0 shadow-lg px-8"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Course
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  size="lg"
                  className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90 text-white border-0 shadow-lg px-8"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};