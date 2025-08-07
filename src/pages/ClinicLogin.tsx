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
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      // Navigation will be handled by the RoleBasedRedirect component
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <LogIn className="w-12 h-12 mx-auto mb-4 text-primary" />
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>
      <CardContent>
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
          <p className="text-muted-foreground">Welcome to your clinic portal</p>
        </div>

        <UnifiedLogin />
      </div>
    </div>
  );
}