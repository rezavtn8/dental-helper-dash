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
import { CourseContentViewer } from './CourseContentViewer';

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
  const isCourseComplete = overallProgress === 100;

  const handleModuleComplete = async () => {
    if (!currentModule) return;
    
    await updateModuleProgress(currentModule.id, course.id, 100);
    
    if (isLastModule) {
      // Mark all modules as complete if not already
      for (const module of modules) {
        const moduleProgress = getModuleProgress(module.id);
        if (!moduleProgress || moduleProgress.completion_percentage < 100) {
          await updateModuleProgress(module.id, course.id, 100);
        }
      }
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
      <Card className="bg-gradient-to-r from-learning-card to-surface border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Progress</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-learning-success to-emerald-400 bg-clip-text text-transparent">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={overallProgress} className="h-3 bg-muted-medium" />
              <div 
                className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-learning-success to-emerald-400 transition-all duration-1000 ease-out animate-progress-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              <span className="text-learning-success font-bold">{completedModules}</span> of <span className="font-bold">{modules.length}</span> modules completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Module Navigation */}
      {currentModule && (
        <div className="space-y-4">
          {/* Module Strip */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <div className="flex gap-3 pb-2 min-w-max px-1">
                {modules.map((module, index) => {
                  const moduleProgress = getModuleProgress(module.id);
                  const isCompleted = moduleProgress?.completion_percentage === 100;
                  const isCurrent = index === currentModuleIndex;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => setCurrentModuleIndex(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                        isCurrent 
                          ? 'border-learning-quiz bg-gradient-to-r from-learning-quiz/20 to-learning-quiz/10 text-learning-quiz shadow-lg' 
                          : isCompleted
                          ? 'border-learning-success/50 bg-learning-success/10 text-learning-success shadow-md'
                          : 'border-border hover:bg-muted/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-5 h-5 bg-learning-success rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 bg-learning-quiz rounded-full flex items-center justify-center animate-pulse">
                            <Play className="h-2.5 w-2.5 text-white ml-0.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground bg-background" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{module.title}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{module.duration}m</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div>
            <Card className="bg-gradient-to-br from-card to-surface-subtle border-0 shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-learning-quiz to-purple-500">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
                        {currentModule.title}
                      </span>
                      <Badge 
                        className="bg-gradient-to-r from-learning-achievement to-orange-500 text-white border-0 shadow-sm font-medium"
                      >
                        {currentModuleIndex + 1} of {modules.length}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-6 text-sm mt-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1 rounded bg-primary/10">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{currentModule.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1 rounded bg-learning-quiz/10">
                          <Play className="h-4 w-4 text-learning-quiz" />
                        </div>
                        <span className="capitalize font-medium">{currentModule.module_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Module Content */}
                {(() => {
                  const contentUrl = currentModule.content_url || 
                    (currentModule.content?.trim().match(/^[\/\\]?[a-zA-Z0-9_\-\/\\]+\.(html?|pdf)$/i) 
                      ? currentModule.content.trim() 
                      : null);
                  
                  if (contentUrl) {
                    return (
                      <CourseContentViewer
                        moduleId={currentModule.id}
                        courseId={course.id}
                        contentUrl={contentUrl}
                        onProgressUpdate={async (percentage) => {
                          if (percentage >= 100) {
                            await handleModuleComplete();
                          }
                        }}
                      />
                    );
                  }
                  
                  if (currentModule.content) {
                    return <div className="prose prose-sm max-w-none whitespace-pre-wrap">{currentModule.content}</div>;
                  }
                  
                  return <p className="text-muted-foreground">Module content will be displayed here.</p>;
                })()}

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
                    {/* Mark Complete Button */}
                    {getModuleProgress(currentModule.id)?.completion_percentage !== 100 && (
                      <Button 
                        variant="outline"
                        onClick={() => updateModuleProgress(currentModule.id, course.id, 100)}
                        className="border-learning-success text-learning-success hover:bg-learning-success/10"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    
                    {isCourseComplete ? (
                      <Button onClick={handleStartQuiz} className="bg-gradient-to-r from-learning-quiz to-purple-600 hover:from-learning-quiz/90 hover:to-purple-600/90">
                        <Award className="h-4 w-4 mr-2" />
                        Take Final Quiz
                      </Button>
                    ) : (
                      <>
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
                      </>
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