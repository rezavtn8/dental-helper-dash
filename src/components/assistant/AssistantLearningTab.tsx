import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseCatalog } from '@/components/learning/CourseCatalog';
import { CoursePlayer } from '@/components/learning/CoursePlayer';
import { AchievementsList } from '@/components/learning/AchievementsList';
import { useLearning, type LearningCourse } from '@/hooks/useLearning';
import { BookOpen, Award } from 'lucide-react';

export default function AssistantLearningTab() {
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null);
  const { getProgressStats, loading } = useLearning();
  
  const stats = getProgressStats();

  if (selectedCourse) {
    return (
      <div className="animate-fade-in">
        <CoursePlayer
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-learning-quiz via-primary to-learning-achievement bg-clip-text text-transparent">
            Learning Hub
          </h2>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-learning-achievement to-orange-400 rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Expand your knowledge and earn certifications through our comprehensive learning platform with interactive courses and achievements.
        </p>
      </div>

      {/* Learning Platform Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted to-muted-light border-0 shadow-lg">
          <TabsTrigger 
            value="courses" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-learning-quiz data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger 
            value="achievements"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-learning-achievement data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
          >
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6 mt-8">
          <div className="animate-fade-in">
            <CourseCatalog onCourseSelect={setSelectedCourse} />
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6 mt-8">
          <div className="animate-fade-in">
            <AchievementsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}