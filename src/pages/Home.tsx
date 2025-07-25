import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Users, ArrowRight, Plus, Clock } from 'lucide-react';

export default function Home() {
  const [clinicCode, setClinicCode] = useState('');
  const [recentClinics, setRecentClinics] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent clinics from localStorage
    const recent = localStorage.getItem('recentClinics');
    if (recent) {
      setRecentClinics(JSON.parse(recent));
    }
  }, []);

  const handleClinicAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicCode.trim()) {
      const code = clinicCode.trim().toLowerCase();
      // Save to recent clinics
      const updated = [code, ...recentClinics.filter(c => c !== code)].slice(0, 3);
      setRecentClinics(updated);
      localStorage.setItem('recentClinics', JSON.stringify(updated));
      navigate(`/clinic/${code}`);
    }
  };

  const handleRecentClinicAccess = (code: string) => {
    navigate(`/clinic/${code}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            DentalFlow
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Practice management made simple - access your clinic or create a new one
          </p>
        </div>

        {/* Recent Clinics */}
        {recentClinics.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Recent Clinics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {recentClinics.map((code) => (
                    <Button
                      key={code}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecentClinicAccess(code)}
                      className="text-sm"
                    >
                      {code}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Clinic Access */}
            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader className="text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <CardTitle>Access Your Clinic</CardTitle>
                <CardDescription>
                  Enter your clinic code to access your portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClinicAccess} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicCode">Clinic Code</Label>
                    <Input
                      id="clinicCode"
                      value={clinicCode}
                      onChange={(e) => setClinicCode(e.target.value)}
                      placeholder="e.g., irvine123, smith-dental"
                      className="text-center"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Enter your clinic's unique code to access your portal
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={!clinicCode.trim()}>
                    Access Clinic
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Create New Clinic */}
            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader className="text-center">
                <Plus className="w-16 h-16 mx-auto mb-4 text-primary" />
                <CardTitle>Create New Clinic</CardTitle>
                <CardDescription>
                  Set up a new clinic and start managing your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigate('/setup')} 
                  className="w-full"
                  variant="outline"
                >
                  Create Clinic
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white/60 rounded-lg backdrop-blur-sm">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Team Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage assistants with secure PIN access
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/60 rounded-lg backdrop-blur-sm">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Multi-Clinic Support</h3>
              <p className="text-sm text-muted-foreground">
                Scale across multiple clinic locations
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/60 rounded-lg backdrop-blur-sm">
              <ArrowRight className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Fast Access</h3>
              <p className="text-sm text-muted-foreground">
                Quick login for busy clinic environments
              </p>
            </div>
          </div>

          {/* How it Works */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Get started in three simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Create Your Clinic</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up your clinic with a unique code
                  </p>
                </div>
                
                <div>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Add Your Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Invite assistants and assign PINs
                  </p>
                </div>
                
                <div>
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Start Managing</h4>
                  <p className="text-sm text-muted-foreground">
                    Track tasks and patient flow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}