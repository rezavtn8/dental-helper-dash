import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, ArrowRight, Plus, Clock, Shield, Lock } from 'lucide-react';

export default function Home() {
  const [clinicCode, setClinicCode] = useState('');
  const [recentClinics, setRecentClinics] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const recent = localStorage.getItem('recentClinics');
    if (recent) setRecentClinics(JSON.parse(recent));
  }, []);

  const handleClinicAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicCode.trim()) {
      const code = clinicCode.trim().toLowerCase();
      accessClinic(code);
    }
  };

  const handleRecentClinicAccess = (code: string) => {
    setClinicCode('');
    accessClinic(code);
  };

  const accessClinic = (code: string) => {
    const normalizedCode = code.toLowerCase().trim();
    const updated = [normalizedCode, ...recentClinics.filter(c => c !== normalizedCode)].slice(0, 3);
    setRecentClinics(updated);
    localStorage.setItem('recentClinics', JSON.stringify(updated));
    localStorage.removeItem('clinic_code');
    navigate(`/clinic/${normalizedCode}/login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center px-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="space-y-8">
            <div className="space-y-4">
              <Building2 className="w-16 h-16" />
              <h1 className="text-5xl font-bold tracking-tight">
                Dental Task<span className="text-blue-200">Pro</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-md">
                Smart, secure, and real-time task management for dental clinics.
              </p>
            </div>
            <div className="space-y-6 text-blue-100">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 mt-1 text-blue-200" />
                <div>
                  <h3 className="font-semibold text-white">Secure Authentication</h3>
                  <p className="text-sm">Owners use email/password, assistants use name & PIN.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 mt-1 text-blue-200" />
                <div>
                  <h3 className="font-semibold text-white">Real-time Task Updates</h3>
                  <p className="text-sm">Instant sync and notifications for all team members.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="w-6 h-6 mt-1 text-blue-200" />
                <div>
                  <h3 className="font-semibold text-white">Multi-Clinic Support</h3>
                  <p className="text-sm">Clinic-specific branding, permissions, and data isolation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Access & Recent */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16">
          <div className="max-w-md mx-auto w-full space-y-8">
            {/* Mobile Branding */}
            <div className="lg:hidden text-center space-y-4">
              <div className="flex justify-center">
                <Building2 className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">
                Dental Task<span className="text-primary">Pro</span>
              </h1>
            </div>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Access Your Clinic</h2>
                <p className="text-muted-foreground">Enter your clinic code to begin authentication</p>
              </div>

              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Clinic Login
                  </CardTitle>
                  <CardDescription>
                    Owners: Email/Password &nbsp;|&nbsp; Assistants: Name/PIN
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleClinicAccess} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinicCode">Clinic Code</Label>
                      <Input
                        id="clinicCode"
                        value={clinicCode}
                        onChange={(e) => setClinicCode(e.target.value.toLowerCase())}
                        placeholder="Enter clinic code"
                        className="text-center text-lg tracking-wider"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continue
                    </Button>
                  </form>

                  {/* Recent Clinics */}
                  {recentClinics.length > 0 && (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Recent Clinics</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {recentClinics.map((code, index) => (
                          <Button
                            key={`${code}-${index}`}
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={() => handleRecentClinicAccess(code)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="font-mono">{code}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold">New to DentalTaskPro?</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up your clinic and start managing tasks efficiently
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/setup')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Clinic
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
