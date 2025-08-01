import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, User, Shield, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { useToast } from '@/hooks/use-toast';

interface AssistantLoginProps {
  clinicId: number;
}

interface OwnerLoginProps {
  clinicCode: string;
}

// Assistant Login Component
const AssistantLogin: React.FC<AssistantLoginProps> = ({ clinicId }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signInWithPin(name.trim(), pin, clinicId);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Successfully logged in as assistant.",
        });
        navigate('/assistant');
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assistant-name">Your Name</Label>
        <Input
          id="assistant-name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="assistant-pin">PIN</Label>
        <Input
          id="assistant-pin"
          type="password"
          placeholder="Enter your PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-12 text-center text-lg tracking-widest"
          maxLength={6}
          required
          disabled={isLoading}
        />
      </div>
      
      <Button type="submit" className="w-full h-12" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            <User className="w-4 h-4 mr-2" />
            Sign In as Assistant
          </>
        )}
      </Button>
    </form>
  );
};

// Owner Login Component
const OwnerLogin: React.FC<OwnerLoginProps> = ({ clinicCode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in as owner.",
        });
        navigate('/owner');
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="owner-email">Email</Label>
        <Input
          id="owner-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="owner-password">Password</Label>
        <Input
          id="owner-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12"
          required
          disabled={isLoading}
        />
      </div>
      
      <Button type="submit" className="w-full h-12" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Sign In as Owner
          </>
        )}
      </Button>
    </form>
  );
};

// Main Clinic Login Page
export default function ClinicLogin() {
  const { clinicCode } = useParams<{ clinicCode: string }>();
  const { clinic, loading, setClinicFromCode } = useClinic();
  const [loadError, setLoadError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (clinicCode) {
      console.log('🔄 Loading clinic for code:', clinicCode);
      
      setClinicFromCode(clinicCode)
        .then((success) => {
          if (!success) {
            setLoadError('Clinic not found or inactive');
          }
        })
        .catch((error) => {
          console.error('Error loading clinic:', error);
          setLoadError('Failed to load clinic');
        });
    }
  }, [clinicCode, setClinicFromCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading clinic...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Clinic Not Found</h3>
              <p className="text-muted-foreground">
                {loadError || 'The clinic you\'re looking for doesn\'t exist or is no longer active.'}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-md pt-12">
        
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Clinic Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-90"></div>
            <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
            <Building2 className="h-12 w-12 text-white relative z-10 mx-auto mt-4" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              {clinic.name}
            </h1>
            <p className="text-lg text-slate-600 font-medium">Welcome to your dental office portal</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure Login Portal</span>
            </div>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="backdrop-blur-lg bg-white/80 border-white/20 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold">
              Access {clinic.name}
            </CardTitle>
            <CardDescription>
              Choose your login method below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="assistant" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100/50 p-1 rounded-xl h-12">
                <TabsTrigger value="assistant" className="text-sm font-medium">
                  <User className="w-4 h-4 mr-2" />
                  Assistant
                </TabsTrigger>
                <TabsTrigger value="owner" className="text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2" />
                  Owner
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="assistant" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Assistant login using name and PIN
                    </p>
                  </div>
                  <AssistantLogin clinicId={clinic.id} />
                </div>
              </TabsContent>
              
              <TabsContent value="owner" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Owner login using email and password
                    </p>
                  </div>
                  <OwnerLogin clinicCode={clinicCode || ''} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact your clinic administrator
          </p>
        </div>
      </div>
    </div>
  );
}