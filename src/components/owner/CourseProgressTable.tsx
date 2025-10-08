import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Award, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CourseProgressRow {
  user_id: string;
  user_name: string;
  user_email: string;
  course_id: string;
  course_title: string;
  course_category: string;
  completion_percentage: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  best_quiz_score: number | null;
  quiz_passed: boolean | null;
  total_quiz_attempts: number;
}

export const CourseProgressTable: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<CourseProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProgressData();
  }, [user?.id]);

  const fetchProgressData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get user's clinic
      const { data: userProfile } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.clinic_id) return;

      // Fetch all course assignments with progress and quiz data
      const { data: assignments, error: assignmentsError } = await supabase
        .from('learning_assignments')
        .select(`
          user_id,
          course_id,
          assigned_at,
          users!learning_assignments_user_id_fkey (
            id,
            name,
            email,
            clinic_id
          ),
          learning_courses!learning_assignments_course_id_fkey (
            id,
            title,
            category
          )
        `)
        .eq('users.clinic_id', userProfile.clinic_id);

      if (assignmentsError) throw assignmentsError;

      // Fetch all progress for these users and courses
      const userIds = Array.from(new Set(assignments?.map(a => a.user_id) || []));
      const { data: progressRecords, error: progressError } = await supabase
        .from('learning_progress')
        .select('*')
        .in('user_id', userIds)
        .is('module_id', null); // Only course-level progress

      if (progressError) throw progressError;

      // Fetch quiz attempts for all courses
      const courseIds = Array.from(new Set(assignments?.map(a => a.course_id) || []));
      
      const { data: quizzes, error: quizzesError } = await supabase
        .from('learning_quizzes')
        .select('id, course_id')
        .in('course_id', courseIds);

      if (quizzesError) throw quizzesError;

      const quizIds = quizzes?.map(q => q.id) || [];
      const { data: quizAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .in('quiz_id', quizIds)
        .in('user_id', userIds)
        .order('score', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Build progress data
      const progressRows: CourseProgressRow[] = (assignments || []).map(assignment => {
        const user = assignment.users;
        const course = assignment.learning_courses;
        
        // Find course-level progress
        const courseProgress = progressRecords?.find(
          p => p.user_id === assignment.user_id && p.course_id === assignment.course_id
        );

        // Find quiz attempts for this user and course
        const courseQuizIds = quizzes?.filter(q => q.course_id === assignment.course_id).map(q => q.id) || [];
        const userQuizAttempts = quizAttempts?.filter(
          a => a.user_id === assignment.user_id && courseQuizIds.includes(a.quiz_id)
        ) || [];

        const bestAttempt = userQuizAttempts.length > 0 
          ? userQuizAttempts.reduce((best, current) => current.score > best.score ? current : best)
          : null;

        return {
          user_id: assignment.user_id,
          user_name: user?.name || 'Unknown',
          user_email: user?.email || '',
          course_id: assignment.course_id,
          course_title: course?.title || 'Unknown Course',
          course_category: course?.category || 'General',
          completion_percentage: courseProgress?.completion_percentage || 0,
          status: courseProgress?.status || 'not_started',
          started_at: courseProgress?.started_at || null,
          completed_at: courseProgress?.completed_at || null,
          best_quiz_score: bestAttempt?.score || null,
          quiz_passed: bestAttempt?.passed || null,
          total_quiz_attempts: userQuizAttempts.length,
        };
      });

      setProgressData(progressRows);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = progressData.filter(row => {
    const matchesSearch = 
      row.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-learning-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-learning-quiz text-white"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getQuizBadge = (passed: boolean | null, score: number | null) => {
    if (score === null) return <Badge variant="outline">No Attempts</Badge>;
    if (passed) {
      return <Badge className="bg-learning-success text-white"><Award className="h-3 w-3 mr-1" />{score}%</Badge>;
    }
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{score}%</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Team Learning Progress
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in_progress')}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'not_started' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('not_started')}
            >
              Not Started
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quiz Score</TableHead>
                <TableHead className="text-right">Attempts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No course assignments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                  <TableRow key={`${row.user_id}-${row.course_id}-${index}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.user_name}</div>
                        <div className="text-sm text-muted-foreground">{row.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={row.course_title}>
                        {row.course_title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.course_category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <Progress value={row.completion_percentage} className="h-2" />
                        <span className="text-sm font-medium min-w-[3ch]">{row.completion_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(row.status)}</TableCell>
                    <TableCell>{getQuizBadge(row.quiz_passed, row.best_quiz_score)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{row.total_quiz_attempts}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
