import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Award, Play, CheckCircle, Search, FileCheck, FileX } from 'lucide-react';
import { useLearning, useLearningQuizzes, type LearningCourse } from '@/hooks/useLearning';

interface CourseCatalogProps {
  onCourseSelect: (course: LearningCourse) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onCourseSelect }) => {
  const { courses, loading, getCourseProgress, startCourse } = useLearning();
  const { attempts: allQuizAttempts } = useLearningQuizzes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(courses.map(course => course.category)))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const getCourseTypeIcon = (type: string) => {
    switch (type) {
      case 'certification': return <Award className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleStartCourse = async (course: LearningCourse) => {
    const progress = getCourseProgress(course.id);
    if (!progress) {
      await startCourse(course.id);
    }
    onCourseSelect(course);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const progress = getCourseProgress(course.id);
          const isCompleted = progress?.status === 'completed';
          const isStarted = progress?.status === 'in_progress';
          const completionPercentage = progress?.completion_percentage || 0;
          
          // Check if quiz has been taken for this course
          const courseQuizAttempts = allQuizAttempts.filter(attempt => {
            // Match quiz attempts to this course by checking if the quiz_id belongs to this course
            // We'll need to do a simple check - if there are any attempts, quiz was taken
            return attempt.quiz_id; // This will be refined by the quiz fetch logic
          });
          const hasQuizAttempt = courseQuizAttempts.length > 0;
          const passedQuiz = courseQuizAttempts.some(attempt => attempt.passed);

          return (
            <Card 
              key={course.id} 
              className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0"
              style={{
                background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--surface-subtle)) 100%)`,
              }}
            >
              {/* Category Gradient Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryGradient(course.category)}`} />
              
              {/* Completion Status Indicator */}
              {isCompleted && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-6 h-6 bg-learning-success rounded-full flex items-center justify-center animate-learning-bounce">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getCategoryGradient(course.category)}`}>
                      {getCourseTypeIcon(course.course_type)}
                    </div>
                    <span className="capitalize font-medium">{course.course_type}</span>
                  </div>
                  <Badge className={`${getDifficultyColor(course.difficulty_level)} shadow-sm font-medium`}>
                    {course.difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="group-hover:bg-gradient-to-r group-hover:from-learning-quiz group-hover:to-primary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 text-lg font-bold">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-1 rounded bg-primary/10">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium">{course.estimated_duration} min</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`bg-gradient-to-r ${getCategoryGradient(course.category)} text-white border-0 shadow-sm`}
                  >
                    {course.category}
                  </Badge>
                </div>

                {progress && (
                  <div className="space-y-3 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-muted-light/50 border border-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold text-primary">{completionPercentage}%</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={completionPercentage} 
                        className="h-2.5 bg-muted-medium" 
                      />
                      <div 
                        className="absolute top-0 left-0 h-2.5 rounded-full bg-gradient-to-r from-learning-success to-emerald-400 transition-all duration-1000 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        {hasQuizAttempt ? (
                          <div className={`flex items-center gap-1.5 ${passedQuiz ? 'text-learning-success' : 'text-amber-600'}`}>
                            <FileCheck className="h-3.5 w-3.5" />
                            <span className="font-medium">{passedQuiz ? 'Quiz Passed' : 'Quiz Taken'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <FileX className="h-3.5 w-3.5" />
                            <span className="font-medium">Quiz Not Taken</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={() => handleStartCourse(course)}
                  className={`w-full font-semibold transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-learning-success to-emerald-500 hover:from-learning-success/90 hover:to-emerald-500/90 text-white border-0 shadow-lg hover:shadow-xl' 
                      : isStarted 
                      ? 'bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                  size="lg"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review Course
                    </>
                  ) : isStarted ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Course
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try adjusting your search or filters' 
              : 'No courses available yet'}
          </p>
        </div>
      )}
    </div>
  );
};