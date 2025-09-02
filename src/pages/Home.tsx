import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Stethoscope, 
  Building2, 
  UserCheck, 
  Crown,
  Calendar,
  BarChart3,
  Zap,
  Heart,
  Star,
  Globe,
  Lock,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';

export default function Home() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'owner' && userProfile.clinic_id) {
        // Only redirect owners who have a clinic setup
        navigate('/owner');
      } else if (userProfile.role === 'assistant') {
        navigate('/hub');
      }
      // If owner has no clinic_id, stay on home page to set up clinic
    }
  }, [user, userProfile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 relative overflow-hidden">
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                  ClinicFlow
                </span>
                <div className="text-xs text-blue-600 font-medium tracking-wide">HEALTHCARE PLATFORM</div>
              </div>
            </div>
            
            <Button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} 
              variant="default"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <LogIn className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Badge */}
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1 text-sm font-medium border-0">
            <Zap className="w-4 h-4 mr-2" />
            Trusted by 500+ Healthcare Practices
          </Badge>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 bg-clip-text text-transparent">
              Healthcare
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-800/80 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Streamline your clinic operations with intelligent task management, 
            team collaboration, and patient care optimization.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center items-center gap-8 mb-12 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">500+</div>
              <div className="text-blue-600 text-sm font-medium">Active Clinics</div>
            </div>
            <div className="w-px h-12 bg-blue-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">50K+</div>
              <div className="text-blue-600 text-sm font-medium">Tasks Completed</div>
            </div>
            <div className="w-px h-12 bg-blue-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">99.9%</div>
              <div className="text-blue-600 text-sm font-medium">Uptime</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              <Crown className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transition-all duration-300 group"
            >
              <Heart className="w-5 h-5 mr-2 group-hover:text-red-500 transition-colors duration-300" />
              See How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-medium">4.9/5 from 200+ reviews</span>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border border-blue-100/50 overflow-hidden bg-white/95 backdrop-blur-md">
            <CardHeader className="text-center py-6 bg-gradient-to-br from-blue-50/80 to-white/50">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-display font-bold text-blue-900">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Setup' 
                  : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-sm text-blue-700">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id
                  ? 'Set up your clinic information'
                  : 'Choose your role to continue'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-50 p-1 h-12">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Crown className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-blue-900 mb-2">Clinic Owner</h3>
                      <p className="text-blue-700 text-sm mb-4">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-blue-900 mb-2">Healthcare Assistant</h3>
                      <p className="text-blue-700 text-sm mb-4">Access your workspace and tasks</p>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <div className="container mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-1 text-sm font-medium border-0">
              <Star className="w-4 h-4 mr-2" />
              Why Healthcare Teams Choose ClinicFlow
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Everything You Need,
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              Built specifically for healthcare teams who want to focus on patient care, not paperwork.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Feature 1 */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Enterprise Security</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  HIPAA-compliant infrastructure with role-based access controls and encrypted data storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Role-based permissions</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Audit trail logging</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">HIPAA compliance</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Smart Collaboration</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Seamless team coordination with real-time task updates and intelligent workflow automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Real-time task updates</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Team performance analytics</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Automated scheduling</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Mobile notifications</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Growth Analytics</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Data-driven insights to optimize operations, improve patient satisfaction, and grow your practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Performance dashboards</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Patient flow analysis</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Revenue optimization</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Custom reporting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              <Globe className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Join 500+ Healthcare Practices
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-blue-950 border-t border-blue-800 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            
            {/* Logo */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-white">ClinicFlow</span>
                <div className="text-xs text-blue-300 font-medium tracking-wide">HEALTHCARE PLATFORM</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-8 mb-8 flex-wrap">
              <div className="flex items-center space-x-2 text-blue-300">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-blue-800 pt-8">
              <p className="text-blue-300 text-sm">
                &copy; 2024 ClinicFlow. All rights reserved. Empowering healthcare teams worldwide with intelligent practice management.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}