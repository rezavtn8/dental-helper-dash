import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Target } from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { formatDistanceToNow } from 'date-fns';

export const AchievementsList: React.FC = () => {
  const { achievements, loading, getProgressStats } = useLearning();
  const stats = getProgressStats();

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'first_course': return <Star className="h-6 w-6" />;
      case 'course_completion': return <Trophy className="h-6 w-6" />;
      case 'certification': return <Award className="h-6 w-6" />;
      case 'streak': return <Target className="h-6 w-6" />;
      default: return <Trophy className="h-6 w-6" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'first_course': return 'text-yellow-500';
      case 'course_completion': return 'text-blue-500';
      case 'certification': return 'text-purple-500';
      case 'streak': return 'text-green-500';
      default: return 'text-gray-500';
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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-success mb-2" />
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <div className="text-sm text-muted-foreground">Courses Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto text-warning mb-2" />
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-info mb-2" />
            <div className="text-2xl font-bold">{stats.inProgressCourses}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
              <p className="text-muted-foreground">
                Complete your first course to start earning achievements!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-background ${getAchievementColor(achievement.achievement_type)}`}>
                    {achievement.badge_icon ? (
                      <span className="text-2xl">{achievement.badge_icon}</span>
                    ) : (
                      getAchievementIcon(achievement.achievement_type)
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      {achievement.points_awarded > 0 && (
                        <Badge variant="secondary">
                          +{achievement.points_awarded} pts
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earned {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Upcoming Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Show potential achievements based on current progress */}
            {stats.completedCourses === 0 && (
              <div className="flex items-center gap-4 p-4 rounded-lg border-dashed border-2 opacity-60">
                <div className="p-2 rounded-full bg-muted">
                  <Star className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">First Course Complete</h3>
                  <p className="text-sm text-muted-foreground">Complete your first course to unlock this achievement</p>
                  <Badge variant="outline" className="mt-1">+100 pts</Badge>
                </div>
              </div>
            )}
            
            {stats.completedCourses >= 1 && stats.completedCourses < 5 && (
              <div className="flex items-center gap-4 p-4 rounded-lg border-dashed border-2 opacity-60">
                <div className="p-2 rounded-full bg-muted">
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Learning Enthusiast</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete 5 courses ({stats.completedCourses}/5)
                  </p>
                  <Badge variant="outline" className="mt-1">+200 pts</Badge>
                </div>
              </div>
            )}

            {!achievements.some(a => a.achievement_type === 'certification') && (
              <div className="flex items-center gap-4 p-4 rounded-lg border-dashed border-2 opacity-60">
                <div className="p-2 rounded-full bg-muted">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Certified Professional</h3>
                  <p className="text-sm text-muted-foreground">Complete your first certification course</p>
                  <Badge variant="outline" className="mt-1">+150 pts</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};