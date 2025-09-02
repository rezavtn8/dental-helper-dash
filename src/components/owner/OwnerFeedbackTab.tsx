import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Plus, 
  Calendar,
  User,
  TrendingUp,
  Star,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  email: string;
}

interface FeedbackEntry {
  id: string;
  assistant_id: string;
  owner_id: string;
  title: string;
  message: string;
  feedback_type: string;
  created_at: string;
  updated_at: string;
  is_visible: boolean;
  assistant_name?: string;
}

interface OwnerFeedbackTabProps {
  clinicId: string;
}

export default function OwnerFeedbackTab({ clinicId }: OwnerFeedbackTabProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('all');
  const [newFeedback, setNewFeedback] = useState({
    assistant_id: '',
    title: '',
    strengths: '',
    improvements: '',
    notes: '',
    feedback_type: 'monthly'
  });

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assistants
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant')
        .eq('is_active', true)
        .order('name');

      if (assistantsError) throw assistantsError;
      setAssistants(assistantsData || []);

      // Fetch feedback entries
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Add assistant names to feedback entries
      const feedbackWithNames = feedbackData?.map(feedback => ({
        ...feedback,
        assistant_name: assistantsData?.find(a => a.id === feedback.assistant_id)?.name || 'Unknown'
      })) || [];

      setFeedbackEntries(feedbackWithNames);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async () => {
    if (!newFeedback.assistant_id || !newFeedback.title) {
      toast.error('Please select an assistant and provide a title');
      return;
    }

    try {
      // Check if feedback already exists for this month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const existingFeedback = feedbackEntries.find(f => 
        f.assistant_id === newFeedback.assistant_id &&
        f.created_at.slice(0, 7) === currentMonth
      );

      if (existingFeedback) {
        toast.error('Feedback already submitted for this assistant this month');
        return;
      }

      // Combine all feedback into message
      const message = `**Strengths:**\n${newFeedback.strengths}\n\n**Areas to Improve:**\n${newFeedback.improvements}\n\n**Additional Notes:**\n${newFeedback.notes}`;

      const { error } = await supabase
        .from('feedback')
        .insert({
          clinic_id: clinicId,
          assistant_id: newFeedback.assistant_id,
          owner_id: clinicId, // Using clinicId as placeholder
          title: newFeedback.title,
          message: message,
          feedback_type: newFeedback.feedback_type,
          is_visible: true
        });

      if (error) throw error;

      toast.success('Feedback submitted successfully');
      setCreateDialogOpen(false);
      setNewFeedback({
        assistant_id: '',
        title: '',
        strengths: '',
        improvements: '',
        notes: '',
        feedback_type: 'monthly'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getMonthlyFeedbackStatus = (assistantId: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return feedbackEntries.some(f => 
      f.assistant_id === assistantId &&
      f.created_at.slice(0, 7) === currentMonth
    );
  };

  const getAssistantFeedbackHistory = (assistantId: string) => {
    return feedbackEntries.filter(f => f.assistant_id === assistantId);
  };

  const getFeedbackTypeColor = (type: string) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-green-100 text-green-800',
      annual: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-sm text-muted-foreground">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-semibold">Feedback & Growth</h3>
          <p className="text-sm text-muted-foreground">Provide structured feedback to help your team grow</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-3 h-3" />
              Give Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="assistant" className="text-sm">Assistant</Label>
                <Select value={newFeedback.assistant_id} onValueChange={(value) => setNewFeedback(prev => ({ ...prev, assistant_id: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map(assistant => (
                      <SelectItem key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm">Title</Label>
                <Input
                  id="title"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Performance Review - November 2024"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="feedback_type" className="text-sm">Feedback Type</Label>
                <Select value={newFeedback.feedback_type} onValueChange={(value) => setNewFeedback(prev => ({ ...prev, feedback_type: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Review</SelectItem>
                    <SelectItem value="quarterly">Quarterly Review</SelectItem>
                    <SelectItem value="annual">Annual Review</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="strengths" className="text-sm">Strengths</Label>
                <Textarea
                  id="strengths"
                  value={newFeedback.strengths}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="What is this assistant doing well?"
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="improvements" className="text-sm">Areas to Improve</Label>
                <Textarea
                  id="improvements"
                  value={newFeedback.improvements}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, improvements: e.target.value }))}
                  placeholder="What areas could use improvement?"
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newFeedback.notes}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional comments or goals..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Feedback Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-4 h-4" />
              Monthly Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assistants.map((assistant) => {
              const hasMonthlyFeedback = getMonthlyFeedbackStatus(assistant.id);
              return (
                <div key={assistant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{assistant.name}</div>
                      <div className="text-xs text-muted-foreground">{assistant.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasMonthlyFeedback ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-4 h-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assistants.length}</div>
                <div className="text-xs text-blue-700">Team Members</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {assistants.filter(a => getMonthlyFeedbackStatus(a.id)).length}
                </div>
                <div className="text-xs text-green-700">Monthly Reviews</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{feedbackEntries.length}</div>
                <div className="text-xs text-purple-700">Total Feedback</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((assistants.filter(a => getMonthlyFeedbackStatus(a.id)).length / Math.max(assistants.length, 1)) * 100)}%
                </div>
                <div className="text-xs text-orange-700">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-4 h-4" />
            Feedback History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="assistant-filter" className="text-sm">Filter:</Label>
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="All Assistants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assistants</SelectItem>
                  {assistants.map(assistant => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {assistants
                .filter(assistant => !selectedAssistant || selectedAssistant === "all" || assistant.id === selectedAssistant)
                .map((assistant) => {
                  const history = getAssistantFeedbackHistory(assistant.id);
                  return (
                    <AccordionItem key={assistant.id} value={assistant.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-primary" />
                            </div>
                            <span className="font-medium text-sm">{assistant.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {history.length} feedback{history.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-3">
                          {history.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                              <p className="text-sm mb-2">No feedback provided yet</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setNewFeedback(prev => ({ ...prev, assistant_id: assistant.id }));
                                  setCreateDialogOpen(true);
                                }}
                              >
                                Give First Feedback
                              </Button>
                            </div>
                          ) : (
                            history.map((feedback) => (
                              <Card key={feedback.id} className="ml-4">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm">{feedback.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getFeedbackTypeColor(feedback.feedback_type)}>
                                        {feedback.feedback_type}
                                      </Badge>
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(feedback.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="whitespace-pre-wrap text-xs">
                                    {feedback.message}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>

            {assistants.length === 0 && (
              <div className="text-center py-8">
                <User className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-1">No Assistants Found</h3>
                <p className="text-sm text-muted-foreground">
                  Add team members to start providing feedback
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}