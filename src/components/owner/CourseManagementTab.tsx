import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, Search, UserPlus, CheckCircle } from 'lucide-react';
import { CourseCatalog } from '@/components/learning/CourseCatalog';
import { CourseProgressTable } from '@/components/owner/CourseProgressTable';
import { useLearning, LearningCourse } from '@/hooks/useLearning';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const CourseManagementTab: React.FC = () => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { courses, getProgressStats } = useLearning();
  const { user } = useAuth();
  const stats = getProgressStats();

  // Fetch team members using the current user's clinic_id
  React.useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.id) return;
      
      // Get current user's profile first to get clinic_id
      const { data: userProfile } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.id)
        .single();
        
      if (!userProfile?.clinic_id) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('clinic_id', userProfile.clinic_id)
        .in('role', ['assistant', 'front_desk']);
        
      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }
      
      setTeamMembers(data || []);
    };

    fetchTeamMembers();
  }, [user?.id]);

  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedUsers.length === 0) {
      toast.error('Please select a course and at least one team member');
      return;
    }

    try {
      const assignments = selectedUsers.map(userId => ({
        user_id: userId,
        course_id: selectedCourse.id,
        assigned_by: user?.id,
        status: 'assigned'
      }));

      const { error } = await supabase
        .from('learning_assignments')
        .insert(assignments);

      if (error) throw error;

      toast.success(`Course "${selectedCourse.title}" assigned to ${selectedUsers.length} team member(s)`);
      setShowAssignDialog(false);
      setSelectedCourse(null);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Course Assignment
          </h2>
          <p className="text-muted-foreground">
            Assign platform courses to your team members
          </p>
        </div>
        <Button 
          onClick={() => setShowAssignDialog(true)}
          className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90 text-white border-0 shadow-lg"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Courses
        </Button>
      </div>

      {/* Course Progress Table */}
      <CourseProgressTable />

      {/* Platform Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Available Platform Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseCatalog 
            onCourseSelect={(course) => {
              setSelectedCourse(course);
              setShowAssignDialog(true);
            }} 
          />
        </CardContent>
      </Card>

      {/* Course Assignment Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Assign Course to Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Team Members</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {teamMembers
                  .filter(member => 
                    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
                      <input
                        type="checkbox"
                        id={member.id}
                        checked={selectedUsers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, member.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== member.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={member.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {member.email}
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </label>
                    </div>
                  ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAssignDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAssignCourse} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};