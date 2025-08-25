import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Plus, Star } from 'lucide-react';
import ClinicSearch from '@/components/ClinicSearch';
import DualLoginInterface from '@/components/DualLoginInterface';
import { useNavigate } from 'react-router-dom';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
}

export default function Home() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const navigate = useNavigate();

  const handleClinicSelected = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    
    // Update recent clinics in localStorage
    const recentClinics = JSON.parse(localStorage.getItem('recentClinics') || '[]');
    const updated = [clinic.clinic_code, ...recentClinics.filter((c: string) => c !== clinic.clinic_code)].slice(0, 3);
    localStorage.setItem('recentClinics', JSON.stringify(updated));
  };

  const handleBackToSearch = () => {
    setSelectedClinic(null);
  };

  if (selectedClinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <DualLoginInterface 
            clinic={selectedClinic} 
            onBack={handleBackToSearch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to DentalFlow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern practice management made simple. Find your clinic and access your personalized dashboard.
          </p>
        </div>

        {/* Main Search Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <ClinicSearch onClinicSelected={handleClinicSelected} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Create New Practice</CardTitle>
              <CardDescription className="text-base">
                Set up a new dental practice with your own custom portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full h-12 text-base shadow-sm" 
                variant="outline"
                onClick={() => navigate('/setup')}
              >
                Get Started
                <Plus className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Direct Access</CardTitle>
              <CardDescription className="text-base">
                Already have an account? Sign in directly to your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full h-12 text-base shadow-sm" 
                variant="secondary"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Why Choose DentalFlow?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Customized dashboards for practice owners and assistants, each with the tools they need.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Simple</h3>
              <p className="text-muted-foreground">
                Quick setup with unique clinic codes and secure authentication for your entire team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}