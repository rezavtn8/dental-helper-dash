import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, LogIn, Eye, EyeOff, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
}

export default function UnifiedLogin() {
  // Owner login state
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [ownerLoading, setOwnerLoading] = useState(false);

  // Assistant login state  
  const [assistantFirstName, setAssistantFirstName] = useState('');
  const [assistantPin, setAssistantPin] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  // Clinic search state
  const [searchTerm, setSearchTerm] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { signInWithEmail, signInWithGoogle, signInWithPin } = useAuth();
  const navigate = useNavigate();

  // Search for clinics
  const searchClinics = async (term: string) => {
    if (!term.trim()) {
      setClinics([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, clinic_code, address')
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,clinic_code.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;
      setClinics(data || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching clinics:', error);
      toast.error('Failed to search clinics');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchClinics(value);
  };

  // Owner login handlers
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerLoading(true);
    
    const { error } = await signInWithEmail(ownerEmail, ownerPassword);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
    setOwnerLoading(false);
  };

  const handleGoogleLogin = async () => {
    setOwnerLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.error(error);
    } else {
      navigate('/dashboard');
    }
    setOwnerLoading(false);
  };

  // Assistant login handlers
  const handleAssistantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClinic) {
      toast.error('Please select a clinic first');
      return;
    }

    if (assistantPin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setAssistantLoading(true);
    
    const { error } = await signInWithPin(selectedClinic.id, assistantFirstName.trim(), assistantPin);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Welcome back, ${assistantFirstName}!`);
      navigate('/dashboard');
    }
    setAssistantLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clinic Owner/Admin Login */}
        <Card className="h-fit">
          <CardHeader className="text-center">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Clinic Owner / Admin</CardTitle>
            <CardDescription>Sign in with your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-email">Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner-password">Password</Label>
                <div className="relative">
                  <Input
                    id="owner-password"
                    type={showOwnerPassword ? 'text' : 'password'}
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  >
                    {showOwnerPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={ownerLoading}>
                {ownerLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Sign In as Owner
              </Button>
            </form>

            <div className="relative my-6">
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
              disabled={ownerLoading}
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
        <Card className="h-fit">
          <CardHeader className="text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <CardTitle>Assistant</CardTitle>
            <CardDescription>Find your clinic and sign in with your PIN</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Clinic Search */}
              {!selectedClinic ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-search">Search for your clinic</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="clinic-search"
                        type="text"
                        placeholder="Enter clinic name or code"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Clinic Results */}
                  {hasSearched && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {clinics.length > 0 ? (
                        clinics.map((clinic) => (
                          <Card
                            key={clinic.id}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => setSelectedClinic(clinic)}
                          >
                            <CardContent className="p-3">
                              <div className="font-medium">{clinic.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Code: {clinic.clinic_code}
                              </div>
                              {clinic.address && (
                                <div className="text-xs text-muted-foreground">
                                  {clinic.address}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No clinics found matching "{searchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Assistant Login Form */
                <div className="space-y-4">
                  {/* Selected Clinic Info */}
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{selectedClinic.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {selectedClinic.clinic_code}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClinic(null);
                          setAssistantFirstName('');
                          setAssistantPin('');
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  {/* Assistant Login Form */}
                  <form onSubmit={handleAssistantLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="assistant-name">First Name</Label>
                      <Input
                        id="assistant-name"
                        type="text"
                        value={assistantFirstName}
                        onChange={(e) => setAssistantFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assistant-pin">4-Digit PIN</Label>
                      <Input
                        id="assistant-pin"
                        type="password"
                        value={assistantPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setAssistantPin(value);
                        }}
                        placeholder="Enter your 4-digit PIN"
                        maxLength={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={assistantLoading}>
                      {assistantLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Sign In as Assistant
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home */}
      <div className="absolute top-4 left-4">
        <Button variant="outline" onClick={() => navigate('/')}>
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}