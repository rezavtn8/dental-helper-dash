import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseCatalog } from '@/components/learning/CourseCatalog';
import { CoursePlayer } from '@/components/learning/CoursePlayer';
import { AchievementsList } from '@/components/learning/AchievementsList';
import CertificationsTab from './AssistantCertificationsTab';
import { useLearning, type LearningCourse } from '@/hooks/useLearning';
import { BookOpen, Award, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Learning & Certifications</h2>
        <p className="text-muted-foreground">
          Expand your knowledge, earn achievements, and manage your professional certifications.
        </p>
      </div>

      {/* Learning Platform Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Certifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6 mt-6">
          <CourseCatalog onCourseSelect={setSelectedCourse} />
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6 mt-6">
          <AchievementsList />
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <CertificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
