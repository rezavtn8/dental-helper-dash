import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '@/hooks/useClinic';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Building2, Users, AlertTriangle } from 'lucide-react';

interface AssistantLoginProps {
  clinicId: string;
}

const AssistantLogin: React.FC<AssistantLoginProps> = ({ clinicId }) => {
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [pin, setPin] = useState('');
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { signInWithPin, getClinicAssistants } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const fetchAssistants = async () => {
      if (!clinicId) return;
      
      try {
        console.log('Fetching assistants for clinic:', clinicId);
        const assistants = await getClinicAssistants(clinicId);
        console.log('Received assistants:', assistants);
        if (isMounted) {
          setAssistants(assistants);
        }
      } catch (error) {
        console.error('Error fetching assistants:', error);
      }
    };

    fetchAssistants();

    // Set up real-time listener for users table changes
    const channel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `clinic_id=eq.${clinicId}`
        },
        (payload) => {
          console.log('Real-time user change:', payload);
          // Refetch assistants when users table changes
          setTimeout(() => fetchAssistants(), 100);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [clinicId, getClinicAssistants]);

  const loadAssistants = async () => {
    if (!clinicId) return;
    
    try {
      const assistantList = await getClinicAssistants(clinicId);
      console.log('Loaded assistants for clinic:', clinicId, assistantList);
      setAssistants(assistantList);
      
      // Clear selected assistant if they're no longer in the list
      if (selectedAssistant && !assistantList.find(a => a.name === selectedAssistant)) {
        setSelectedAssistant('');
        setPin('');
      }
    } catch (error) {
      console.error('Error loading assistants:', error);
      setAssistants([]);
    }
  };

  const handleAssistantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant || pin.length !== 4) {
      toast.error('Please select an assistant and enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    const { error } = await signInWithPin(selectedAssistant, pin, clinicId);
    
    if (error) {
      toast.error(error);
      setPin('');
    } else {
      toast.success('Welcome back!');
      navigate('/assistant');
    }
    setLoading(false);
  };

  const handlePinInput = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto p-3 bg-primary/15 rounded-full w-fit">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Assistant Login</h3>
        <p className="text-sm text-muted-foreground">Select your name and enter your PIN</p>
      </div>
      
      <form onSubmit={handleAssistantLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assistant">Select Assistant</Label>
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose your name" />
            </SelectTrigger>
            <SelectContent>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.name}>
                  {assistant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pin">4-Digit PIN</Label>
          <Input
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => handlePinInput(e.target.value)}
            placeholder="Enter your PIN"
            className="text-center text-xl tracking-wider h-12"
            maxLength={4}
            autoComplete="off"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12" 
          disabled={loading || !selectedAssistant || pin.length !== 4}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
};

const OwnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      navigate('/owner');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto p-3 bg-primary/15 rounded-full w-fit">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Clinic Owner Login</h3>
        <p className="text-sm text-muted-foreground">Sign in with your email and password</p>
      </div>
      
      <form onSubmit={handleOwnerLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-12"
            required
          />
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
};

export default function ClinicLogin() {
  const { clinicCode } = useParams<{ clinicCode: string }>();
  const { clinic, setClinicFromCode, loading: clinicLoading } = useClinic();
  const navigate = useNavigate();

  useEffect(() => {
    if (clinicCode && !clinic) {
      setClinicFromCode(clinicCode).then((found) => {
        if (!found) {
          toast.error('Clinic not found');
          navigate('/');
        }
      });
    }
  }, [clinicCode, clinic, setClinicFromCode, navigate]);

  if (clinicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/10">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading clinic...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/10 p-4">
        <Card className="w-full max-w-md backdrop-blur-sm border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-destructive/15 rounded-full w-fit mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Clinic Not Found</CardTitle>
            <CardDescription>The clinic code you entered is not valid</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/10 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full blur-xl" />
        
        <div className="text-center">
          <div className="mx-auto p-4 bg-primary/15 rounded-full w-fit mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            {clinic.name}
          </h1>
          <p className="text-muted-foreground">Welcome to your clinic portal</p>
        </div>

        <Card className="backdrop-blur-sm border-white/10 shadow-2xl">
          <CardContent className="p-6">
            <Tabs defaultValue="assistant" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="assistant">Assistant</TabsTrigger>
                <TabsTrigger value="owner">Owner</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assistant" className="mt-0">
                <AssistantLogin clinicId={clinic.id} />
              </TabsContent>
              
              <TabsContent value="owner" className="mt-0">
                <OwnerLogin />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}