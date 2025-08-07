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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
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
            <Card className="bg-card/95 backdrop-blur-sm border shadow-md">
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Access Clinic */}
            <Card className="bg-card/95 backdrop-blur-sm border shadow-md">
              <CardHeader className="text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl">Access Your Clinic</CardTitle>
                <CardDescription>
                  Enter your clinic code to access the portal
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
                      className="text-center text-lg h-12"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Enter your clinic's unique code to access your portal
                    </p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg" disabled={!clinicCode.trim()}>
                    Access Clinic
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Create New Clinic */}
            <Card className="bg-card/95 backdrop-blur-sm border shadow-md">
              <CardHeader className="text-center">
                <Plus className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl">Create New Clinic</CardTitle>
                <CardDescription>
                  Set up a new clinic and invite your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full h-12 text-lg" 
                  variant="outline"
                  onClick={() => navigate('/setup')}
                >
                  Create Clinic
                  <Plus className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <Card className="bg-card/90 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-primary" />
                  Multi-Role Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Owners and assistants have different dashboards tailored to their needs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/90 backdrop-blur-sm border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-6 h-6 mr-2 text-primary" />
                  Easy Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quick clinic setup with unique codes for secure access
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}