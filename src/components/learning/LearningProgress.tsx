import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLearning } from '@/hooks/useLearning';

export const LearningProgress: React.FC = () => {
  const { courses, progress, achievements, loading } = useLearning();

  // Calculate status breakdown
  const statusData = React.useMemo(() => {
    const completed = progress.filter(p => p.status === 'completed').length;
    const inProgress = progress.filter(p => p.status === 'in_progress').length;
    const notStarted = courses.length - completed - inProgress;

    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#8b5cf6' },
      { name: 'Not Started', value: notStarted, color: '#94a3b8' }
    ];
  }, [courses, progress]);

  // Calculate weekly completions (last 8 weeks)
  const weeklyData = React.useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (7 * (7 - i)));
      return {
        week: `W${8 - i}`,
        completions: 0,
        startDate: new Date(date)
      };
    });

    progress.forEach(p => {
      if (p.completed_at) {
        const completedDate = new Date(p.completed_at);
        weeks.forEach(week => {
          const weekEnd = new Date(week.startDate);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (completedDate >= week.startDate && completedDate < weekEnd) {
            week.completions++;
          }
        });
      }
    });

    return weeks.map(({ week, completions }) => ({ week, completions }));
  }, [progress]);

  // Recent achievements (last 5)
  const recentAchievements = React.useMemo(() => {
    return [...achievements]
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 5);
  }, [achievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Course Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completions" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No achievements yet. Complete courses to earn badges!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-learning-achievement/10 to-transparent hover:from-learning-achievement/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{achievement.badge_icon}</div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-learning-achievement/20">
                    +{achievement.points_awarded} pts
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Course Progress Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Start a course to track your progress here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.map((p) => {
                const course = courses.find(c => c.id === p.course_id);
                if (!course) return null;

                return (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-learning-success h-full transition-all"
                            style={{ width: `${p.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {p.completion_percentage}%
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={p.status === 'completed' ? 'default' : 'secondary'}
                      className={p.status === 'completed' ? 'bg-learning-success' : ''}
                    >
                      {p.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
