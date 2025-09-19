import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Play,
  BookOpen,
  Award
} from 'lucide-react';
import { useLearning, useLearningModules, type LearningCourse } from '@/hooks/useLearning';
import { QuizPlayer } from './QuizPlayer';

interface CoursePlayerProps {
  course: LearningCourse;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const { modules, loading } = useLearningModules(course.id);
  const { updateModuleProgress, getModuleProgress, getCourseProgress } = useLearning();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  const currentModule = modules[currentModuleIndex];
  const courseProgress = getCourseProgress(course.id);
  const isLastModule = currentModuleIndex === modules.length - 1;
  const isFirstModule = currentModuleIndex === 0;

  // Calculate overall course progress
  const completedModules = modules.filter(module => {
    const progress = getModuleProgress(module.id);
    return progress?.completion_percentage === 100;
  }).length;
  
  const overallProgress = modules.length > 0 ? (completedModules / modules.length) * 100 : 0;

  const handleModuleComplete = async () => {
    if (!currentModule) return;
    
    await updateModuleProgress(currentModule.id, course.id, 100);
    
    if (isLastModule) {
      // Course completed, maybe show completion modal
      return;
    }
    
    // Auto-advance to next module
    setCurrentModuleIndex(prev => Math.min(prev + 1, modules.length - 1));
  };

  const handlePrevious = () => {
    setCurrentModuleIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentModuleIndex(prev => Math.min(prev + 1, modules.length - 1));
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (passed: boolean) => {
    setShowQuiz(false);
    if (passed) {
      handleModuleComplete();
    }
  };

  useEffect(() => {
    // Mark module as started when viewed
    if (currentModule) {
      const progress = getModuleProgress(currentModule.id);
      if (!progress || progress.completion_percentage === 0) {
        updateModuleProgress(currentModule.id, course.id, 10);
      }
    }
  }, [currentModule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <QuizPlayer
        courseId={course.id}
        moduleId={currentModule?.id}
        onComplete={handleQuizComplete}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{modules.length} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.estimated_duration} min</span>
            </div>
            {course.course_type === 'certification' && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Certification</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completedModules} of {modules.length} modules completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Module Content */}
      {currentModule && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {modules.map((module, index) => {
                    const moduleProgress = getModuleProgress(module.id);
                    const isCompleted = moduleProgress?.completion_percentage === 100;
                    const isCurrent = index === currentModuleIndex;
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => setCurrentModuleIndex(index)}
                        className={`w-full text-left p-3 rounded-none border-l-4 transition-colors ${
                          isCurrent 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : isCompleted
                            ? 'border-success bg-success/10 text-success'
                            : 'border-transparent hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                isCurrent ? 'border-primary bg-primary' : 'border-muted-foreground'
                              }`} />
                            )}
                            <div>
                              <p className="font-medium text-sm">{module.title}</p>
                              <p className="text-xs text-muted-foreground">{module.duration} min</p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentModule.title}
                      <Badge variant="outline" className="text-xs">
                        Module {currentModuleIndex + 1} of {modules.length}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{currentModule.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        <span className="capitalize">{currentModule.module_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Module Content */}
                <div className="prose prose-sm max-w-none">
                  {currentModule.content ? (
                    <div className="whitespace-pre-wrap">{currentModule.content}</div>
                  ) : (
                    <p className="text-muted-foreground">Module content will be displayed here.</p>
                  )}
                </div>

                {/* Module Resources */}
                {currentModule.resources && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Additional Resources</h4>
                    <div className="text-sm text-muted-foreground">
                      Resources and files would be displayed here.
                    </div>
                  </div>
                )}

                {/* Module Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={isFirstModule}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {currentModule.module_type === 'interactive' && (
                      <Button onClick={handleStartQuiz}>
                        Take Quiz
                      </Button>
                    )}
                    
                    {isLastModule ? (
                      <Button onClick={handleModuleComplete}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Course
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};