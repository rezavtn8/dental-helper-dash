import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, User, Mail } from 'lucide-react';

const Login = () => {
  const { signInWithPin, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [assistantForm, setAssistantForm] = useState({
    selectedUser: '',
    pin: ''
  });
  
  const [ownerForm, setOwnerForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [assistants, setAssistants] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'assistant')
        .order('name');

      if (error) throw error;
      setAssistants(data || []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const handleAssistantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantForm.selectedUser || assistantForm.pin.length !== 4) {
      toast({
        title: "Invalid Input",
        description: "Please select your name and enter a 4-digit PIN",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithPin(assistantForm.selectedUser, assistantForm.pin);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully"
      });
      navigate('/assistant');
    }
    setLoading(false);
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signInWithEmail(ownerForm.email, ownerForm.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully"
      });
      navigate('/owner');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dental Assistant Platform</CardTitle>
          <CardDescription>
            Choose your login method to access the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assistant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Assistant
              </TabsTrigger>
              <TabsTrigger value="owner" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Owner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assistant" className="space-y-4">
              <form onSubmit={handleAssistantLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assistant-select">Select Your Name</Label>
                  <select
                    id="assistant-select"
                    value={assistantForm.selectedUser}
                    onChange={(e) => setAssistantForm({ ...assistantForm, selectedUser: e.target.value })}
                    className="w-full p-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="">Choose your name...</option>
                    {assistants.map((assistant) => (
                      <option key={assistant.id} value={assistant.id}>
                        {assistant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">4-Digit PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    value={assistantForm.pin}
                    onChange={(e) => setAssistantForm({ ...assistantForm, pin: e.target.value.replace(/\D/g, '') })}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Assistant'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="owner" className="space-y-4">
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@clinic.com"
                    value={ownerForm.email}
                    onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={ownerForm.password}
                    onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Owner'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;