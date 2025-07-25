import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Users, ArrowRight, Plus } from 'lucide-react';

export default function Home() {
  const [clinicCode, setClinicCode] = useState('');
  const navigate = useNavigate();

  const handleClinicAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicCode.trim()) {
      navigate(`/clinic/${clinicCode.trim().toLowerCase()}`);
    }
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
            Streamline your dental clinic's assistant tasks and workflow
          </p>
        </div>

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
                      placeholder="e.g., irvine123"
                      className="text-center"
                    />
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