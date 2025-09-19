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
  HelpCircle
} from 'lucide-react';
import { useCourseCreation, CourseTemplate, CourseCategory } from '@/hooks/useCourseCreation';
import { ModuleBuilder } from './ModuleBuilder';
import { QuizBuilder } from './QuizBuilder';
import { CoursePreview } from './CoursePreview';
import { TemplateSelector } from './TemplateSelector';

interface CourseCreationWizardProps {
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

export const CourseCreationWizard: React.FC<CourseCreationWizardProps> = ({
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

  const {
    loading,
    templates,
    categories,
    fetchTemplates,
    fetchCategories,
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
    }
  }, [isOpen, fetchTemplates, fetchCategories]);

  const steps = [
    { title: 'Template', icon: Sparkles, description: 'Choose a starting template' },
    { title: 'Course Info', icon: BookOpen, description: 'Basic course details' },
    { title: 'Modules', icon: FileText, description: 'Create course modules' },
    { title: 'Assessment', icon: HelpCircle, description: 'Add quizzes and tests' },
    { title: 'Preview', icon: Play, description: 'Review and publish' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (template: CourseTemplate) => {
    setSelectedTemplate(template);
    setCourseData(prev => ({
      ...prev,
      category: template.category,
      difficulty_level: template.difficulty_level,
      estimated_duration: template.template_data.modules.reduce((sum, mod) => sum + mod.duration, 0)
    }));
    
    // Pre-populate modules from template
    const templateModules = template.template_data.modules.map((mod, index) => ({
      title: mod.title,
      content: `This is the ${mod.title.toLowerCase()} module. Please add your content here.`,
      module_type: mod.type,
      duration: mod.duration
    }));
    setModules(templateModules);

    // Pre-populate quiz if template has one
    if (template.template_data.quiz) {
      const quizTemplate = template.template_data.quiz;
      setQuiz({
        title: `${template.name} Assessment`,
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
  };

  const handleCreateCourse = async () => {
    try {
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

      onCourseCreated?.(courseId);
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            onSkip={() => setCurrentStep(1)}
          />
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={courseData.difficulty_level}
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Course Type</Label>
                  <Select
                    value={courseData.course_type}
                    onValueChange={(value) => setCourseData(prev => ({ ...prev, course_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn"
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={courseData.estimated_duration}
                    onChange={(e) => setCourseData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <ModuleBuilder
            modules={modules}
            onModulesChange={setModules}
          />
        );

      case 3:
        return (
          <QuizBuilder
            quiz={quiz}
            onQuizChange={setQuiz}
          />
        );

      case 4:
        return (
          <CoursePreview
            courseData={courseData}
            modules={modules}
            quiz={quiz}
            onPublish={handleCreateCourse}
            isPublishing={loading}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Course
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Progress Header */}
          <div className="border-b pb-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                        index === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : index < currentStep
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  );
                })}
              </div>
              <Badge variant="outline">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleCreateCourse} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
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