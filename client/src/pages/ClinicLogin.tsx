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
import { Loader2, Building2, Users, AlertTriangle, Stethoscope, Shield, Heart, Lock } from 'lucide-react';

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
      // Navigate based on role
      const assistant = assistants.find(a => a.name === selectedAssistant);
      if (assistant?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/assistant');
      }
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
      <div className="text-center space-y-4">
        <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-fit shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dental Assistant Login</h3>
          <p className="text-slate-600 dark:text-slate-300">Select your name and enter your PIN</p>
        </div>
      </div>
      
      <form onSubmit={handleAssistantLogin} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="assistant" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Dental Assistant</Label>
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger className="h-14 text-base border-2 hover:border-blue-300 focus:border-blue-500 transition-colors">
              <SelectValue placeholder="Choose your name" />
            </SelectTrigger>
            <SelectContent>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.name} className="text-base py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{assistant.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="pin" className="text-sm font-semibold text-slate-700 dark:text-slate-200">4-Digit PIN</Label>
          <div className="relative">
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value)}
              placeholder="••••"
              className="text-center text-2xl tracking-widest h-14 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
              maxLength={4}
              autoComplete="off"
            />
            <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
          disabled={loading || !selectedAssistant || pin.length !== 4}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Sign In Securely
            </>
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
      <div className="text-center space-y-4">
        <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl w-fit shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clinic Owner Login</h3>
          <p className="text-slate-600 dark:text-slate-300">Sign in with your email and password</p>
        </div>
      </div>
      
      <form onSubmit={handleOwnerLogin} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="h-14 text-base border-2 hover:border-green-300 focus:border-green-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-14 text-base border-2 hover:border-green-300 focus:border-green-500 transition-colors pr-12"
              required
            />
            <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5 mr-2" />
              Sign In as Owner
            </>
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
          <p className="text-muted-foreground">Loading dental office...</p>
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
            <CardTitle>Dental Office Not Found</CardTitle>
            <CardDescription>The office code you entered is not valid</CardDescription>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/60 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/30 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Medical icons floating background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Stethoscope className="absolute top-20 left-1/4 w-6 h-6 text-blue-200/30 animate-float" />
        <Heart className="absolute top-40 right-1/3 w-5 h-5 text-pink-200/30 animate-float animation-delay-1000" />
        <Shield className="absolute bottom-40 left-1/3 w-7 h-7 text-green-200/30 animate-float animation-delay-2000" />
        <Lock className="absolute bottom-20 right-1/4 w-4 h-4 text-purple-200/30 animate-float animation-delay-3000" />
      </div>
      
      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="mx-auto p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl w-fit mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
              <Building2 className="h-16 w-16 text-white relative z-10" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              {clinic.name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Welcome to your dental office portal</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure Login Portal</span>
            </div>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 border-white/20 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-[1.02]">
          <CardContent className="p-8">
            <Tabs defaultValue="assistant" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/50 dark:bg-slate-700/50 p-1 rounded-xl h-12">
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