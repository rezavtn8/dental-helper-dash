import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, Target, BookOpen, Zap, Medal, TrendingUp } from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { formatDistanceToNow } from 'date-fns';

export const AchievementsList: React.FC = () => {
  const { achievements, loading, getProgressStats } = useLearning();
  const stats = getProgressStats();

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'course_completion': return Award;
      case 'quiz_mastery': return Trophy;
      case 'learning_streak': return Zap;
      case 'skill_certification': return Medal;
      default: return Award;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'course_completion': return 'from-learning-success to-emerald-400';
      case 'quiz_mastery': return 'from-learning-quiz to-purple-400';
      case 'learning_streak': return 'from-learning-achievement to-orange-400';
      case 'skill_certification': return 'from-blue-500 to-blue-600';
      default: return 'from-learning-success to-emerald-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-learning-success/20 to-learning-success/5 border-learning-success/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-learning-success to-emerald-400 rounded-full flex items-center justify-center mb-3 animate-learning-bounce">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-learning-success to-emerald-400 bg-clip-text text-transparent">
              {achievements.length}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Achievements</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-learning-quiz/20 to-learning-quiz/5 border-learning-quiz/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-learning-quiz to-purple-400 rounded-full flex items-center justify-center mb-3 animate-pulse">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-learning-quiz to-purple-400 bg-clip-text text-transparent">
              {stats.completedCourses}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Completed Courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-learning-achievement/20 to-learning-achievement/5 border-learning-achievement/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-learning-achievement to-orange-400 rounded-full flex items-center justify-center mb-3 animate-learning-glow">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-learning-achievement to-orange-400 bg-clip-text text-transparent">
              {stats.totalPoints}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mb-3 animate-pulse">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {stats.inProgressCourses}
            </div>
            <p className="text-sm text-muted-foreground font-medium">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Earned Achievements */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
          Your Achievements
        </h3>
        
        {achievements.length === 0 ? (
          <Card className="bg-gradient-to-br from-muted/50 to-muted-light/30 border-dashed border-2">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-lg mb-2">No achievements yet</h4>
              <p className="text-muted-foreground mb-4">
                Complete your first course to start earning achievements!
              </p>
              <Button className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90 text-white border-0">
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.achievement_type);
              const gradientClass = getAchievementColor(achievement.achievement_type);
              
              return (
                <Card 
                  key={achievement.id} 
                  className="bg-gradient-to-br from-card to-surface-subtle border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center flex-shrink-0 animate-achievement-burst shadow-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={`bg-gradient-to-r ${gradientClass} text-white border-0 shadow-sm font-medium`}>
                            +{achievement.points_awarded} points
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Achievements */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-learning-achievement to-orange-400 bg-clip-text text-transparent">
          Upcoming Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-learning-success/10 to-learning-success/5 border-learning-success/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-learning-success/30 to-emerald-400/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Award className="h-8 w-8 text-learning-success" />
              </div>
              <h4 className="font-bold text-lg mb-2 bg-gradient-to-r from-learning-success to-emerald-400 bg-clip-text text-transparent">
                First Course Complete
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Finish your first learning course to unlock this achievement
              </p>
              <Badge className="bg-learning-success/20 text-learning-success border-learning-success/30 font-medium">
                50 points
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-learning-quiz/10 to-learning-quiz/5 border-learning-quiz/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-learning-quiz/30 to-purple-400/30 rounded-full flex items-center justify-center mb-4 animate-learning-glow">
                <Trophy className="h-8 w-8 text-learning-quiz" />
              </div>
              <h4 className="font-bold text-lg mb-2 bg-gradient-to-r from-learning-quiz to-purple-400 bg-clip-text text-transparent">
                Learning Enthusiast
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Complete 5 courses to earn this achievement
              </p>
              <Badge className="bg-learning-quiz/20 text-learning-quiz border-learning-quiz/30 font-medium">
                150 points
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-learning-achievement/10 to-learning-achievement/5 border-learning-achievement/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-learning-achievement/30 to-orange-400/30 rounded-full flex items-center justify-center mb-4 animate-learning-bounce">
                <Medal className="h-8 w-8 text-learning-achievement" />
              </div>
              <h4 className="font-bold text-lg mb-2 bg-gradient-to-r from-learning-achievement to-orange-400 bg-clip-text text-transparent">
                Certified Professional
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Complete a certification course with 90%+ score
              </p>
              <Badge className="bg-learning-achievement/20 text-learning-achievement border-learning-achievement/30 font-medium">
                300 points
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};