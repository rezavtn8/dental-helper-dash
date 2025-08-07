import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '@/hooks/useClinic';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';

// Unified Login Component
const UnifiedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      // Navigation will be handled by the RoleBasedRedirect component in App.tsx
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.error(error);
    }
    setLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <LogIn className="w-12 h-12 mx-auto mb-4 text-primary" />
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access the clinic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
};

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Main component
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
    return <LoadingScreen message="Loading clinic..." />;
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{clinic.name}</h1>
          <p className="text-muted-foreground">Sign in to access your clinic</p>
          <p className="text-xs text-muted-foreground mt-1">Clinic Code: {clinic.clinic_code}</p>
        </div>

        <UnifiedLogin />
        
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/')} className="text-sm">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}