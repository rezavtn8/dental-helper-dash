import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

interface TaskNote {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  users?: {
    name: string;
    email: string;
  };
}

interface TaskNotesViewProps {
  task: Task;
}

export default function TaskNotesView({ task }: TaskNotesViewProps) {
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskNotes();
  }, [task.id]);

  const fetchTaskNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('task_notes')
        .select(`
          *,
          users:user_id (
            name,
            email
          )
        `)
        .eq('task_id', task.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching task notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center text-sm font-medium text-gray-700">
        <FileText className="w-4 h-4 mr-2" />
        Assistant Notes ({notes.length})
      </div>
      
      <div className="space-y-2">
        {notes.map((note) => (
          <Card key={note.id} className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    {note.users?.name || 'Assistant'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                  {new Date(note.updated_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-blue-700 whitespace-pre-wrap">
                {note.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}