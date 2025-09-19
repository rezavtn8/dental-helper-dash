import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Users, 
  HelpCircle,
  CheckCircle,
  Play,
  FileText,
  Video,
  Rocket
} from 'lucide-react';

interface CourseData {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  course_type: string;
  estimated_duration: number;
  thumbnail_url?: string;
  prerequisites: string[];
}

interface ModuleData {
  title: string;
  content: string;
  module_type: string;
  duration: number;
  resources?: any;
}

interface QuizData {
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

interface CoursePreviewProps {
  courseData: CourseData;
  modules: ModuleData[];
  quiz: QuizData | null;
  onPublish: () => void;
  isPublishing: boolean;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  courseData,
  modules,
  quiz,
  onPublish,
  isPublishing
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-learning-beginner text-white';
      case 'intermediate': return 'bg-learning-intermediate text-white';
      case 'advanced': return 'bg-learning-advanced text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients = {
      'General': 'from-blue-500 to-blue-600',
      'Medical': 'from-learning-success to-emerald-600',
      'Technology': 'from-learning-quiz to-purple-600',
      'Certification': 'from-learning-achievement to-orange-600',
      'Skills': 'from-pink-500 to-pink-600'
    };
    return gradients[category as keyof typeof gradients] || 'from-blue-500 to-blue-600';
  };

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'interactive': return HelpCircle;
      default: return FileText;
    }
  };

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'video': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'interactive': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const totalDuration = modules.reduce((sum, module) => sum + module.duration, 0);
  const completionChecklist = [
    { label: 'Course title and description', completed: courseData.title && courseData.description },
    { label: 'At least one module', completed: modules.length > 0 },
    { label: 'All modules have content', completed: modules.every(m => m.content.trim().length > 0) },
    { label: 'Assessment created', completed: quiz !== null },
    { label: 'Quiz has questions', completed: quiz && quiz.questions.length > 0 }
  ];

  const completionPercentage = (completionChecklist.filter(item => item.completed).length / completionChecklist.length) * 100;
  const canPublish = completionPercentage >= 60; // At least 60% complete

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Rocket className="h-6 w-6 text-learning-achievement" />
          <span className="bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Course Preview
          </span>
        </div>
        <p className="text-muted-foreground">
          Review your course before publishing it to students
        </p>
      </div>

      {/* Completion Status */}
      <Card className="bg-gradient-to-r from-learning-card to-surface border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Course Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Progress</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-learning-success to-emerald-400 bg-clip-text text-transparent">
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <div className="space-y-2">
            {completionChecklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {item.completed ? (
                  <CheckCircle className="h-4 w-4 text-learning-success" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Information */}
        <Card className="bg-gradient-to-br from-card to-surface-subtle border-0 shadow-lg">
          <div className={`h-1 bg-gradient-to-r ${getCategoryGradient(courseData.category)}`} />
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryGradient(courseData.category)}`}>
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <Badge className={getDifficultyColor(courseData.difficulty_level)}>
                {courseData.difficulty_level}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
              {courseData.title || 'Untitled Course'}
            </CardTitle>
            <p className="text-muted-foreground leading-relaxed">
              {courseData.description || 'No description provided'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{totalDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{courseData.course_type}</span>
              </div>
            </div>
            <Badge variant="outline" className={`bg-gradient-to-r ${getCategoryGradient(courseData.category)} text-white border-0`}>
              {courseData.category}
            </Badge>
          </CardContent>
        </Card>

        {/* Course Structure */}
        <Card className="bg-gradient-to-br from-card to-surface-subtle border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Course Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Modules</span>
                <span>{modules.length} modules</span>
              </div>
              {modules.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {modules.map((module, index) => {
                    const ModuleIcon = getModuleTypeIcon(module.module_type);
                    return (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className={`p-1 rounded ${getModuleTypeColor(module.module_type)}`}>
                          <ModuleIcon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{module.title}</div>
                          <div className="text-xs text-muted-foreground">{module.duration} min</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No modules created yet
                </div>
              )}
            </div>

            {quiz && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  <span>Assessment</span>
                  <Badge variant="outline">
                    {quiz.questions.length} questions
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-learning-quiz/10">
                  <div className="p-1 rounded bg-learning-quiz/20">
                    <HelpCircle className="h-3 w-3 text-learning-quiz" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{quiz.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {quiz.passing_score}% to pass
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Publishing Actions */}
      <Card className="bg-gradient-to-r from-learning-success/10 to-learning-achievement/10 border-learning-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Ready to Publish?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {canPublish 
                ? "Your course looks great! You can publish it now and make it available to students."
                : "Complete a few more requirements before publishing your course."
              }
            </p>
            
            {!canPublish && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Still needed:</p>
                {completionChecklist
                  .filter(item => !item.completed)
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                      <span>{item.label}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button 
              onClick={onPublish}
              disabled={!canPublish || isPublishing}
              className={`${canPublish 
                ? 'bg-gradient-to-r from-learning-success to-emerald-500 hover:from-learning-success/90 hover:to-emerald-500/90' 
                : ''
              } text-white border-0 shadow-lg`}
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish Course'}
            </Button>
            
            {canPublish && (
              <div className="text-sm text-muted-foreground">
                Students will be able to enroll immediately after publishing
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};