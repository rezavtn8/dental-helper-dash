import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  ArrowRight, 
  Plus, 
  Clock, 
  Shield,
  Lock
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center px-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4 tracking-tight">DentalFlow</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Professional dental office management made simple
              </p>
            </div>
            
            <div className="space-y-4 text-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Manage dental assistants and staff</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Track daily operations and tasks</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Secure role-based access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Access Portal */}
        <div className="flex flex-col justify-center px-8 lg:px-16 py-12">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">DentalFlow</h1>
              <p className="text-slate-600 dark:text-slate-300">Dental office management</p>
            </div>

            {/* Recent Access */}
            {recentClinics.length > 0 && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <CardTitle className="text-lg">Recent</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {recentClinics.slice(0, 2).map((code) => (
                      <Button
                        key={code}
                        variant="ghost"
                        onClick={() => handleRecentClinicAccess(code)}
                        className="w-full justify-between h-10 px-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="font-medium">{code.toUpperCase()}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Access */}
            <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Access Your Office</CardTitle>
                <CardDescription>Enter your office code to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClinicAccess} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicCode" className="text-sm font-medium">
                      Office Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="clinicCode"
                        value={clinicCode}
                        onChange={(e) => setClinicCode(e.target.value)}
                        placeholder="Enter code"
                        className="h-12 text-center text-lg tracking-wider border-2 focus:border-blue-500"
                        autoFocus
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700" 
                    disabled={!clinicCode.trim()}
                  >
                    {clinicCode.trim() ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Access Portal
                      </>
                    ) : (
                      'Enter Office Code'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* New Office Setup */}
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Setting up a new office?
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/setup')}
                className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Office
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}