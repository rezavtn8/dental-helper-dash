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
  const [selectedAssistant, setSelectedAssistant] = useState('');
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
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Feedback & Growth</h3>
          <p className="text-muted-foreground">Provide structured feedback to help your team grow</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Give Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assistant">Assistant</Label>
                <Select value={newFeedback.assistant_id} onValueChange={(value) => setNewFeedback(prev => ({ ...prev, assistant_id: value }))}>
                  <SelectTrigger>
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
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Performance Review - November 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback_type">Feedback Type</Label>
                <Select value={newFeedback.feedback_type} onValueChange={(value) => setNewFeedback(prev => ({ ...prev, feedback_type: value }))}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                  value={newFeedback.strengths}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="What is this assistant doing well?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements">Areas to Improve</Label>
                <Textarea
                  id="improvements"
                  value={newFeedback.improvements}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, improvements: e.target.value }))}
                  placeholder="What areas could use improvement?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newFeedback.notes}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional comments or goals..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Feedback Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Monthly Feedback Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assistants.map((assistant) => {
              const hasMonthlyFeedback = getMonthlyFeedbackStatus(assistant.id);
              return (
                <div key={assistant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{assistant.name}</div>
                      <div className="text-sm text-muted-foreground">{assistant.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasMonthlyFeedback ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback History by Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Feedback History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="assistant-filter">Filter by Assistant:</Label>
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Assistants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Assistants</SelectItem>
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
                .filter(assistant => !selectedAssistant || assistant.id === selectedAssistant)
                .map((assistant) => {
                  const history = getAssistantFeedbackHistory(assistant.id);
                  return (
                    <AccordionItem key={assistant.id} value={assistant.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{assistant.name}</span>
                          </div>
                          <Badge variant="secondary">
                            {history.length} feedback{history.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {history.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No feedback provided yet</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
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
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{feedback.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getFeedbackTypeColor(feedback.feedback_type)}>
                                        {feedback.feedback_type}
                                      </Badge>
                                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(feedback.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="whitespace-pre-wrap text-sm">
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
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Assistants Found</h3>
                <p className="text-muted-foreground">
                  Add assistants to your team to start providing feedback.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}