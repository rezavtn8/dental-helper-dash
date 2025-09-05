import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, AlertTriangle, Users, Lightbulb, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RecommendationCard {
  id: string;
  title: string;
  description: string;
  type: 'overdue' | 'balance' | 'suggestion' | 'alert';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  size: 'small' | 'medium' | 'large';
}

interface AIAssistantTabProps {
  clinicId?: string;
}

const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ clinicId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<RecommendationCard[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const iconMap = {
    AlertTriangle,
    Users,
    Lightbulb,
    Bell
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (clinicId) {
      loadRecommendations();
    }
  }, [clinicId]);

  const loadRecommendations = async () => {
    if (!clinicId || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'analyze',
          clinicId,
          userId: user.id
        }
      });

      if (error) throw error;
      setCards(data.cards || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !clinicId || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const originalInput = input;
    setInput('');
    setLoading(true);

    try {
      // Check if this is a bulk task request
      const isBulkRequest = originalInput.toLowerCase().includes('20 tasks') || 
                           originalInput.toLowerCase().includes('bulk') ||
                           originalInput.toLowerCase().includes('many tasks');
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: originalInput,
          clinicId,
          userId: user.id,
          action: isBulkRequest ? 'create_bulk_tasks' : 'create_task'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message || 'Task processed successfully!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.success) {
        toast({
          title: isBulkRequest ? "Bulk Tasks Created" : "Task Created",
          description: data.message,
        });
        // Reload recommendations after task creation
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCardSize = (size: string) => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-2';
      default: return 'col-span-1';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[800px] bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <Card className="border-0 border-b rounded-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create tasks and get insights using natural language
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recommendations Grid */}
      {cards.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-background to-muted/10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 max-h-48 overflow-auto">
            {cards.map((card) => {
              const IconComponent = iconMap[card.icon as keyof typeof iconMap] || Bell;
              return (
                <Card key={card.id} className={`${getCardSize(card.size)} bg-card border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                      </div>
                      <Badge variant={getPriorityColor(card.priority)} className="text-xs font-medium">
                        {card.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.length === 0 && (
          <Card className="text-center bg-gradient-to-br from-card to-muted/20 border-dashed border-2 border-border/50 animate-fade-in">
            <CardContent className="py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Assistant Ready</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create tasks naturally! Try these examples:
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <p className="text-xs font-medium">"Add weekly inventory check for May"</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <p className="text-xs font-medium">"Create 20 tasks for our clinic"</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <p className="text-xs font-medium">"Equipment maintenance due tomorrow"</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <Users className="h-3 w-3 inline mr-1" />
                  Available team: Behgum, Kim, Hafsa, May
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {messages.map((message, index) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
                  : 'bg-card border border-border/50'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
              </div>
              <Card className={`${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/50' 
                  : 'bg-card border-border/50'
              } shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-sm">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="border-0 border-t rounded-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your request... (e.g., 'Add a cleaning task for Kim')"
              disabled={loading}
              className="flex-1 bg-background border-border/50 focus:border-primary/50 transition-colors"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()}
              className="px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantTab;