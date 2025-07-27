import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  Plus, 
  Clock, 
  Stethoscope,
  Heart,
  Shield,
  CheckCircle,
  BarChart3,
  Calendar,
  UserCheck,
  ClipboardCheck,
  Zap,
  Star,
  Award,
  TrendingUp,
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/60 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/30">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Medical icons floating background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Stethoscope className="absolute top-20 left-1/4 w-6 h-6 text-blue-200/30 animate-float" />
        <Heart className="absolute top-40 right-1/3 w-5 h-5 text-pink-200/30 animate-float animation-delay-1000" />
        <Shield className="absolute bottom-40 left-1/3 w-7 h-7 text-green-200/30 animate-float animation-delay-2000" />
        <Calendar className="absolute bottom-20 right-1/4 w-4 h-4 text-purple-200/30 animate-float animation-delay-3000" />
        <BarChart3 className="absolute top-1/2 left-20 w-5 h-5 text-indigo-200/30 animate-float animation-delay-1000" />
        <CheckCircle className="absolute top-32 right-20 w-4 h-4 text-emerald-200/30 animate-float animation-delay-2000" />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Logo and Title */}
            <div className="space-y-6">
              <div className="relative">
                <div className="mx-auto p-8 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl w-fit shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl backdrop-blur-sm"></div>
                  <Stethoscope className="h-20 w-20 text-white relative z-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  DentalFlow
                </h1>
                <p className="text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                  Streamline Your Dental Practice with Smart Staff Management
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Trusted by dental offices worldwide</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 w-12 h-12 mb-4">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Staff Task Management</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Organize dental assistants and staff with intelligent task assignment and tracking</p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 w-12 h-12 mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Performance Analytics</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Track dental staff productivity and office efficiency with detailed insights</p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 w-12 h-12 mb-4">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Role-Based Access</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Secure access control for dentists, office managers, and dental assistants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Section */}
        <div className="container mx-auto px-6 pb-20">
          <div className="max-w-lg mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Access Your Dental Office</h2>
              <p className="text-slate-600 dark:text-slate-300">Enter your office code to access your personalized dashboard</p>
            </div>

            {/* Recent Clinics */}
            {recentClinics.length > 0 && (
              <Card className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-fit shadow-lg mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Offices</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">Quick access to your recent dental offices</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {recentClinics.slice(0, 3).map((code, index) => (
                      <Button
                        key={code}
                        variant="ghost"
                        onClick={() => handleRecentClinicAccess(code)}
                        className="w-full justify-start h-auto py-4 px-5 text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/60 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-600/60 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
                          <div className="flex-1">
                            <span className="text-slate-800 dark:text-slate-100 font-semibold text-base">{code.toUpperCase()}</span>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recently accessed</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Access Form */}
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 border-white/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-fit shadow-lg mb-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Enter Office Code</h3>
                  <p className="text-slate-600 dark:text-slate-300">Access your dental office's management portal</p>
                </div>
                
                <form onSubmit={handleClinicAccess} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="clinicCode" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Office Access Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="clinicCode"
                        value={clinicCode}
                        onChange={(e) => setClinicCode(e.target.value)}
                        placeholder="Enter your office code"
                        className="text-center text-xl tracking-wider h-16 text-base border-2 hover:border-blue-300 focus:border-blue-500 transition-colors bg-white/60 dark:bg-slate-700/60"
                      />
                      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                    disabled={!clinicCode.trim()}
                  >
                    {clinicCode.trim() ? (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Access Office Portal
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 mr-2" />
                        Enter Office Code
                      </>
                    )}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Setup Link */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></div>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">New Office?</span>
                <div className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></div>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/setup')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/60 backdrop-blur-sm border border-transparent hover:border-white/40 dark:hover:border-slate-600/40 transition-all duration-200 transform hover:scale-105 px-6 py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Set up a new dental office
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Features */}
        <div className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Trusted by Dental Professionals</h3>
              <p className="text-slate-600 dark:text-slate-300">Streamline your dental office operations with our comprehensive staff management platform</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">99.9%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Uptime</div>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">500+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Offices</div>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">40%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Efficiency Boost</div>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">4.9</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}