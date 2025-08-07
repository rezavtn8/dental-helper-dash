import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '@/hooks/useClinic';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Building2, Users } from 'lucide-react';

// Components
const AssistantLogin = ({ clinicId }: { clinicId: string }) => {
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [pin, setPin] = useState('');
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { signInWithPin, getClinicAssistants } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAssistants();
  }, [clinicId]);

  const loadAssistants = async () => {
    const assistantList = await getClinicAssistants(clinicId);
    setAssistants(assistantList);
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
        <CardTitle>Assistant Login</CardTitle>
        <CardDescription>Select your name and enter your PIN</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssistantLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="assistant">Select Assistant</Label>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger>
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
              className="text-center text-2xl tracking-wider"
              maxLength={4}
              autoComplete="off"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedAssistant || pin.length !== 4}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const OwnerLogin = () => {
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
        <CardTitle>Clinic Owner Login</CardTitle>
        <CardDescription>Sign in with your email and password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOwnerLogin} className="space-y-4">
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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

        <Tabs defaultValue="assistant" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assistant" className="mt-6">
            <AssistantLogin clinicId={clinic.id} />
          </TabsContent>
          
          <TabsContent value="owner" className="mt-6">
            <OwnerLogin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}