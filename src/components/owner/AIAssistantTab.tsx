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
    <div className="flex flex-col h-full max-h-[800px]">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Create tasks and get insights using natural language
        </p>
      </div>

      {/* Recommendations Grid */}
      {cards.length > 0 && (
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-medium mb-3">AI Recommendations</h3>
          <div className="grid grid-cols-3 gap-3 max-h-48 overflow-auto">
            {cards.map((card) => {
              const IconComponent = iconMap[card.icon as keyof typeof iconMap] || Bell;
              return (
                <Card key={card.id} className={`${getCardSize(card.size)} relative`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <CardTitle className="text-sm">{card.title}</CardTitle>
                      </div>
                      <Badge variant={getPriorityColor(card.priority)} className="text-xs">
                        {card.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">AI Assistant Ready</p>
            <p className="text-sm">
              Try: "Add a weekly inventory check for May, due every Friday"
            </p>
            <p className="text-xs mt-2">
              Available assistants: Behgum, Kim, Hafsa, May
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 opacity-70`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg p-3 bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your request... (e.g., 'Add a cleaning task for Kim')"
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantTab;