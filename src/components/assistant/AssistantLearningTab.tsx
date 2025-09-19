import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseCatalog } from '@/components/learning/CourseCatalog';
import { CoursePlayer } from '@/components/learning/CoursePlayer';
import { AchievementsList } from '@/components/learning/AchievementsList';
import { useLearning, type LearningCourse } from '@/hooks/useLearning';

export default function AssistantLearningTab() {
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null);
  const { getProgressStats, loading } = useLearning();
  
  const stats = getProgressStats();

  if (selectedCourse) {
    return (
      <CoursePlayer
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Learning Hub</h2>
        <p className="text-muted-foreground">
          Expand your knowledge and earn certifications through our comprehensive learning platform.
        </p>
      </div>

      {/* Learning Platform Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6">
          <CourseCatalog onCourseSelect={setSelectedCourse} />
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6">
          <AchievementsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}