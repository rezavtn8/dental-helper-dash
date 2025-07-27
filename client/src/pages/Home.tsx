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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30">
      {/* Elegant background effects */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/60 bg-[size:32px_32px] opacity-40" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-slate-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-indigo-100/20 to-transparent rounded-full blur-2xl" />
        
        {/* Subtle moving dots */}
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-300/60 rounded-full animate-pulse" />
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-slate-400/50 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 mb-6">
              <Building2 className="w-8 h-8 text-slate-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              DentalFlow
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Access your clinic
            </p>
          </div>

          {/* Recent Clinics */}
          {recentClinics.length > 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
              <CardHeader className="text-center pb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-100/60 rounded-full mb-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-700">Recent</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentClinics.slice(0, 3).map((code, index) => (
                    <Button
                      key={code}
                      variant="ghost"
                      onClick={() => handleRecentClinicAccess(code)}
                      className="w-full justify-start h-auto py-3 px-4 text-left hover:bg-slate-100/60 border border-transparent hover:border-slate-200/60 rounded-lg transition-all duration-200 hover-scale"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-slate-400 rounded-full" />
                        <span className="text-slate-700 font-medium">{code}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Access Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <form onSubmit={handleClinicAccess} className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="clinicCode" className="text-sm font-medium text-slate-700">
                    Clinic Code
                  </Label>
                  <Input
                    id="clinicCode"
                    value={clinicCode}
                    onChange={(e) => setClinicCode(e.target.value)}
                    placeholder="Enter clinic code"
                    className="text-center text-lg h-12 bg-white/60 border-slate-200/60 focus:border-slate-400 focus:bg-white/80 transition-all duration-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-slate-700 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={!clinicCode.trim()}
                >
                  Access Clinic
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Create New Option */}
          <div className="text-center">
            <Button 
              variant="ghost"
              onClick={() => navigate('/setup')}
              className="text-slate-600 hover:text-slate-800 text-sm font-medium hover:bg-white/40 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create new clinic
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}