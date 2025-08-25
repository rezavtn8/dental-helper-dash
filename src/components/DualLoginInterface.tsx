import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Crown, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
}

interface DualLoginInterfaceProps {
  clinic: Clinic;
  onBack: () => void;
}

export default function DualLoginInterface({ clinic, onBack }: DualLoginInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'owner' | 'assistant'>('owner');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Owner login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Assistant login states
  const [firstName, setFirstName] = useState('');
  const [pin, setPin] = useState('');
  
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Welcome back to ${clinic.name}!`);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error);
      }
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssistantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    
    setLoading(true);
    
    // TODO: Implement assistant PIN-based login
    // This would typically involve a custom authentication flow
    toast.error('Assistant login not yet implemented');
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to search
        </Button>
        
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{clinic.name}</h2>
          <p className="text-muted-foreground">Choose your login method</p>
          <p className="text-sm text-muted-foreground">Code: {clinic.clinic_code}</p>
        </div>
      </div>

      {/* Login Type Selector */}
      <div className="flex justify-center">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'owner' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('owner')}
            className="rounded-md px-6"
            size="sm"
          >
            <Crown className="w-4 h-4 mr-2" />
            Practice Owner
          </Button>
          <Button
            variant={activeTab === 'assistant' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('assistant')}
            className="rounded-md px-6"
            size="sm"
          >
            <User className="w-4 h-4 mr-2" />
            Assistant
          </Button>
        </div>
      </div>

      {/* Login Forms */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Owner Login */}
        <Card className={`transition-all ${activeTab === 'owner' ? 'ring-2 ring-primary shadow-lg' : 'opacity-75'}`}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Practice Owner Login</CardTitle>
            <CardDescription>
              Sign in with your email and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@clinic.com"
                  required
                  disabled={loading || activeTab !== 'owner'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading || activeTab !== 'owner'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || activeTab !== 'owner'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || activeTab !== 'owner'}
              >
                {loading && activeTab === 'owner' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Sign In as Owner
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              disabled={loading || activeTab !== 'owner'}
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

        {/* Assistant Login */}
        <Card className={`transition-all ${activeTab === 'assistant' ? 'ring-2 ring-primary shadow-lg' : 'opacity-75'}`}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Assistant Login</CardTitle>
            <CardDescription>
              Quick access with your first name and PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAssistantLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                  disabled={loading || activeTab !== 'assistant'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">4-Digit PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(value);
                  }}
                  placeholder="••••"
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                  required
                  disabled={loading || activeTab !== 'assistant'}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || activeTab !== 'assistant' || pin.length !== 4}
              >
                {loading && activeTab === 'assistant' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Sign In as Assistant
              </Button>
            </form>

            <div className="text-center pt-8">
              <p className="text-sm text-muted-foreground">
                Don't have a PIN? Contact your practice owner to get set up.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}