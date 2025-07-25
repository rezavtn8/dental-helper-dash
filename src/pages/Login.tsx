import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, User, Mail, ChevronDown } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-primary to-blue-600 p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-primary/80 to-blue-600/90"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-card/90 border-border/50 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 p-4 bg-primary/15 rounded-full w-fit ring-2 ring-primary/20">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dental Assistant Platform
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-base">
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

            <TabsContent value="assistant" className="space-y-6 mt-6">
              <form onSubmit={handleAssistantLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="assistant-select" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Select Your Name
                  </Label>
                  <Select 
                    value={assistantForm.selectedUser} 
                    onValueChange={(value) => setAssistantForm({ ...assistantForm, selectedUser: value })}
                  >
                    <SelectTrigger className="w-full h-12 bg-background/80 border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors shadow-sm">
                      <SelectValue placeholder="Choose your name..." className="text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl z-50">
                      {assistants.map((assistant) => (
                        <SelectItem 
                          key={assistant.id} 
                          value={assistant.id}
                          className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {assistant.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pin" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary rounded-sm flex items-center justify-center">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                    </div>
                    4-Digit PIN
                  </Label>
                  <div className="relative">
                    <Input
                      id="pin"
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      value={assistantForm.pin}
                      onChange={(e) => setAssistantForm({ ...assistantForm, pin: e.target.value.replace(/\D/g, '') })}
                      className="text-center text-2xl tracking-[0.5em] font-bold h-14 bg-background/80 border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors shadow-sm pl-8"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i < assistantForm.pin.length ? 'bg-primary' : 'bg-muted'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login as Assistant'
                  )}
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