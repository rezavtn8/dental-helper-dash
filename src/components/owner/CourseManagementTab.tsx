import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users, Award } from 'lucide-react';
import { CourseCreationWizard } from '@/components/course-creation/CourseCreationWizard';
import { CourseCatalog } from '@/components/learning/CourseCatalog';
import { useLearning } from '@/hooks/useLearning';

export const CourseManagementTab: React.FC = () => {
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const { courses, getProgressStats } = useLearning();
  const stats = getProgressStats();

  const handleCourseCreated = (courseId: string) => {
    console.log('Course created:', courseId);
    // Refresh courses list
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Course Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage learning courses for your team
          </p>
        </div>
        <Button 
          onClick={() => setShowCreationWizard(true)}
          className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-learning-quiz/20 to-learning-quiz/5 border-learning-quiz/20">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-learning-quiz mb-2" />
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-sm text-muted-foreground">Total Courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-learning-success/20 to-learning-success/5 border-learning-success/20">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-learning-success mb-2" />
            <div className="text-2xl font-bold">{stats.inProgressCourses}</div>
            <p className="text-sm text-muted-foreground">Active Learners</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-learning-achievement/20 to-learning-achievement/5 border-learning-achievement/20">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto text-learning-achievement mb-2" />
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-sm text-muted-foreground">Completions</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseCatalog onCourseSelect={() => {}} />
        </CardContent>
      </Card>

      {/* Course Creation Wizard */}
      <CourseCreationWizard
        isOpen={showCreationWizard}
        onClose={() => setShowCreationWizard(false)}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
};