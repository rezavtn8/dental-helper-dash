import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowLeft, Loader2, Check, X, Shuffle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function ClinicSetup() {
  const [clinicName, setClinicName] = useState('');
  const [clinicCode, setClinicCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
  
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Generate random clinic code
  const generateClinicCode = () => {
    const words = ['dental', 'smile', 'care', 'health', 'bright', 'white', 'clean', 'fresh'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    const word = words[Math.floor(Math.random() * words.length)];
    const generated = `${word}${numbers}`;
    setClinicCode(generated);
    checkCodeAvailability(generated);
  };

  // Check if clinic code is available
  const checkCodeAvailability = async (code: string) => {
    if (!code.trim()) {
      setCodeAvailable(null);
      return;
    }

    setIsCheckingCode(true);
    try {
      const response = await fetch(`/api/clinics/check-code/${code.toLowerCase().trim()}`);
      const data = await response.json();
      setCodeAvailable(data.available);
    } catch (error) {
      console.error('Error checking code availability:', error);
      setCodeAvailable(null);
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Handle clinic code input with debounced availability check
  const handleClinicCodeChange = (value: string) => {
    const cleanCode = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setClinicCode(cleanCode);
    
    // Debounce the availability check
    setTimeout(() => {
      if (cleanCode === clinicCode) {
        checkCodeAvailability(cleanCode);
      }
    }, 500);
  };

  const createClinic = async (clinicData: any) => {
    const response = await fetch('/api/clinics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clinicData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create clinic');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (codeAvailable === false) {
      toast({
        title: "Clinic Code Unavailable",
        description: "This clinic code is already taken. Please choose a different one.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create the clinic
      console.log('🏥 Creating clinic...');
      const clinic = await createClinic({
        name: clinicName.trim(),
        clinic_code: clinicCode.toLowerCase().trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        owner_email: email.toLowerCase().trim()
      });

      console.log('✅ Clinic created:', clinic.id);

      // Step 2: Create the owner account
      console.log('👤 Creating owner account...');
      const { error: authError } = await signUp(email.trim(), password, {
        name: ownerName.trim(),
        role: 'owner',
        clinic_id: clinic.id,
        clinic_code: clinicCode.toLowerCase().trim()
      });

      if (authError) {
        throw new Error(authError);
      }

      console.log('✅ Owner account created successfully');

      toast({
        title: "Clinic Created Successfully!",
        description: "Check your email to verify your account, then you can start using your clinic portal.",
      });

      // Navigate to the clinic login page
      navigate(`/clinic/${clinicCode.toLowerCase()}/login`);

    } catch (error: any) {
      console.error('❌ Setup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || 'Failed to create clinic. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl pt-8">
        
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

        <Card className="backdrop-blur-sm bg-white/90 border shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Clinic</CardTitle>
            <CardDescription>
              Set up your dental clinic and owner account to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Clinic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Clinic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name *</Label>
                    <Input
                      id="clinicName"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="e.g. Sunshine Dental Clinic"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinicCode">Clinic Code *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="clinicCode"
                          value={clinicCode}
                          onChange={(e) => handleClinicCodeChange(e.target.value)}
                          placeholder="e.g. sunshine123"
                          required
                          disabled={isLoading}
                          className={
                            codeAvailable === true 
                              ? "border-green-500 pr-8" 
                              : codeAvailable === false 
                              ? "border-red-500 pr-8" 
                              : "pr-8"
                          }
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {isCheckingCode ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : codeAvailable === true ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : codeAvailable === false ? (
                            <X className="w-4 h-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        onClick={generateClinicCode} 
                        variant="outline"
                        disabled={isLoading}
                        size="icon"
                      >
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your clinic URL: <span className="font-mono">yourapp.com/clinic/{clinicCode || 'yourcode'}</span>
                    </p>
                    {codeAvailable === false && (
                      <p className="text-xs text-red-500">This code is already taken</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, City, State, ZIP"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Owner Account */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Owner Account</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Your Name *</Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Dr. John Smith"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@clinic.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      className={
                        confirmPassword && password !== confirmPassword 
                          ? "border-red-500" 
                          : confirmPassword && password === confirmPassword 
                          ? "border-green-500" 
                          : ""
                      }
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={isLoading || codeAvailable === false || !clinicCode}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Creating Your Clinic...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5 mr-3" />
                      Create Clinic & Account
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-3">
                  By creating an account, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}