import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock,
  Play,
  CheckCircle2,
  BarChart3,
  Star
} from 'lucide-react';
import { useLearning, type LearningCourse } from '@/hooks/useLearning';
import { CourseCatalog } from './CourseCatalog';
import { CoursePlayer } from './CoursePlayer';
import { AchievementsList } from './AchievementsList';
import { LearningProgress } from './LearningProgress';

export const LearningHub: React.FC = () => {
  const { loading, getProgressStats } = useLearning();
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');

  const stats = getProgressStats();

  const handleCourseSelect = (course: LearningCourse) => {
    setSelectedCourse(course);
  };

  const handleBackToCatalog = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If a course is selected, show the course player
  if (selectedCourse) {
    return (
      <CoursePlayer 
        course={selectedCourse} 
        onBack={handleBackToCatalog}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Learning Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Expand your skills with our comprehensive learning platform
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-learning-success to-learning-success/80 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-learning-quiz to-learning-quiz/80 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressCourses}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-learning-achievement to-learning-achievement/80 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Points</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold">{stats.availableCourses}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course Catalog
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          <CourseCatalog onCourseSelect={handleCourseSelect} />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <AchievementsList />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <LearningProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
};