import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
  TrendingUp,
  Hand,
  Undo2,
  ArrowUp,
  CalendarDays,
  MousePointer,
  Sparkles,
  Timer,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';
import AnimatedLogo from '@/components/ui/animated-logo';

export default function Home() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && userProfile && !loading) {
      if (userProfile.role === 'owner') {
        navigate('/owner');
      } else if (userProfile.role === 'assistant') {
        navigate('/assistant');
      }
    }
  }, [user, userProfile, navigate, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 relative overflow-hidden">
      
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
      
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
              <div className="w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className="w-12 h-12">
                  <rect x="70.64" y="26.34" fill="#FDFDFD" width="882.73" height="971.32"/>
                  <path fill="hsl(var(--logo-primary))" d="M912.23,368.04c-2.64,0.08-4.69-0.88-6.33-2.93c-4.48-5.6-14.89-35.56-15.82-44.53l-5.75-9.99c9.87-169.53-170.87-227.39-289.01-124.34L343.25,430.21c1.08,3.4,48.21,44.25,54.75,43.03l247.55-237.32c67.1-57.94,175.17-39.28,168.69,64.54c-7.31,30.47-11.98,60.91-14,91.33l56.32,51.92l17.06-63.87l6.96-2.3c9.86,7.57,17.85,14.91,25.31,25.31c-8.76,39.36-21.66,78.46-33.17,117.12c-4.57,6.92-14.86-12.85-17.46-15.88c-6.51-2.45-12.4-5.95-17.64-10.52l-88.46-93.81c15.9-43.64,22.79-87.96,20.68-132.97l-7.66-1.6c-22.93-42.47-75.96-4.32-99.3,19.26l-6.94-1.84c-11.58,9.93-20.94,21.64-28.06,35.12L430,504.95l12.06,8.73c62.86-58.69,123.91-117.77,183.16-177.22c7.32-4.94,16.51-4.96,27.58-0.06c21.95,6.35,45.72,29.27,53.79,50.62c37.9,20.87,77.08,61.67,104.9,95.96c39.99,49.31,54.45,106.35,46.97,169.8c-9.54,66.83-53.32,249.7-111.71,285.36c-48.31,29.49-97.23,3.03-116.16-46.42c-26.11-68.21-26.29-130.71-70.07-195.69c-4.17-6.19-20.69-20.26-17.08-27.36c1.69-3.32,20.45-21.48,23.89-19.04c17.85,24.78,34.46,49.14,47.07,77.95c21.53,49.17,29.67,124.95,50.43,164.72c19.18,36.74,59.12,32.54,82.91,2.52c34.85-43.97,80.07-209.76,79.29-265.88c-0.69-49.19-25.03-102.39-58.57-137.67L642.15,374.6c-7.32,8-56.57,52.23-55.57,57.87c61.46,77.15,163.17,107.02,154.75,221.86c-1.08,14.77-17.31,93.25-23.82,102.73c-8.84,12.87-28.61,5.21-29.92-7.82c-1.61-16.04,20.15-73.64,22.1-98.07c4.44-55.49-23.96-86.58-67.52-115.1c-57.98,58.09-127.82,109.2-174.21,177.1c-40.51,54.45-37.22,203.71-102.17,230.04c-85.55,34.69-122.53-65.4-143.35-127.41c-29.23-87.07-52.31-182.35-31.56-273.72c3.18-3.32,27.13,20.72,27.97,24.34c1.86,8.04-6.04,41.01-6.08,53.11c-0.2,56.88,44.95,236.8,82.52,278.46c25.96,28.77,64.93,26.44,81.91-9.81c24.89-53.15,27-123.55,57.74-182.72c39-75.06,131.98-129.13,182.83-196.18c-8.71-8.3-48.84-53.86-57.85-52.31c-31.39,29.72-64.25,58.28-95.45,88.17c-15.38,14.73-90.72,95.58-101.93,97.72c-14.22,2.72-19.75-13.25-32.43-15.36c-1.31,40.63,13.21,79.88,22.05,119.06c0.21,16.93-23.74,25.2-32.28,6.62c-6.69-14.56-19.99-84.19-21.37-102.02c-0.79-10.2,2.58-49.07,1.38-52.31c-2.32-6.26-54.86-46.2-64.74-55.16c-5.97-5.41-10.7-12.64-15.78-17.45c0.06-4.97,3.41-8.26,10.05-9.87c-11.48-10.25-13.78-18.56-6.88-24.93l6.31-2.95l127.83,108.23c19.18-16.32,36.03-33.45,50.56-51.38L281.91,439.24C175.38,325.31,224.79,125.37,395.2,234.01c3.38-0.82,52.36-43.78,51.03-47c-2.73-6.64-59.55-38.71-69.41-41.78c-45.62-14.22-85.27-16.71-130.04,2.98c-127.28,55.99-99.7,209.5-44.75,309l-1.67,8.92c5.24,9.36-1.71,12.34-20.84,8.95l-7.64,0.54c-65.77-93.58-83.15-255.42,14.31-335.3c99.41-81.49,234.98-42.36,314.68,45.81l-104.08,98.28c-32.9-17.81-89.68-73.65-123.68-25.52c-16.85,23.85-7.08,54.16-0.99,80.12c6.76,28.78,12.53,51.28,37.39,70.13l211.9-205.68c69.15-68.88,138.71-121.76,242.7-103.32C892.89,122.96,949.2,248.22,912.23,368.04z"/>
                  <path fill="hsl(var(--blue-100))" d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z"/>
                  <path fill="hsl(var(--logo-secondary))" d="M200.36,466.12c9.64-2.8,28.97,16.56,22.15,25.31c1.07,1.63,1.4,6.91,3.54,10.56c8.6,14.69,25.45,18.07-6.7,24.24c-20.86-19.73-29.69-25.35-47.46-50.62C182.63,454.05,192.74,481.36,200.36,466.12z"/>
                  <path fill="hsl(var(--logo-accent))" d="M912.23,368.04c0.45,12.83-3.66,22.8-6.33,34.8c-9.06,6.86-12.06-7.01-15.65-10.56c-4.95-4.9-12.99,2.34-9.66-14.75l-5.12-6.49l7.84-45.94l6.77-4.52l20.43,35.06C912.9,359.58,912.08,363.79,912.23,368.04z"/>
                  <path fill="#FDFDFD" d="M890.09,320.58c-1.28,16.66-6,40.17-9.49,56.95c-3.57,17.17-11.67,50.55-17.36,66.48c-1.34,3.74-3.19,7.05-6.45,9.46l-61.77-58.36c-8.32-14.26,11.94-72.87,12.92-94.96c4.81-107.94-108.39-112.79-169.29-49.09l-239.02,229.4l-9.37,0l-56.95-50.64l257.89-248.36C721.28,72.93,904.25,136.66,890.09,320.58z"/>
                  <path fill="#FDFDFD" d="M200.36,466.12c-31.53-45.22-54.89-136.69-50.58-191.37c8.89-112.63,124.89-173.61,227.72-136.06c13.24,4.84,68.95,35.54,74.61,45.77c2.52,4.55,0.62,4.81-1.64,8.08c-12.17,17.7-41.5,33.31-55.49,51.35c-42.28-35.6-111.47-55.46-148.55-2.21c-33.26,47.77-2.22,163.21,45.63,197.59L418.6,546.71l-61.63,58.57L222.5,491.43C216.1,481.68,205.16,473.01,200.36,466.12z"/>
                  <path fill="hsl(var(--blue-50))" d="M655.96,282.62c27.13-29.81,91.37-70.86,113.9-15.82c-8.97,20.39-1.73,38.67-3.94,57.7c-1.17,10.09-19.51,74.59-26.09,75.09c-11.18-7.97-17.99-15.71-33.25-12.57c-17.53-16.59-35.97-34.59-53.79-50.62c-26.39-0.91-34.21-14.38-14.99-34.82L655.96,282.62z"/>
                  <path fill="hsl(var(--blue-100))" d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z"/>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-display font-bold">
                  <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                    Denta
                  </span>
                  <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                    League
                  </span>
                </span>
                <div className="text-xs text-blue-600 font-medium tracking-wide">DENTAL PRACTICE PLATFORM</div>
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
            <Stethoscope className="w-4 h-4 mr-2" />
            Complete Dental Practice Platform
          </Badge>

          {/* Animated Logo */}
          <div className="flex justify-center mb-8">
            <AnimatedLogo size="xl" className="animate-logo-glow" />
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              DentaLeague
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-800/80 mb-4 max-w-4xl mx-auto leading-relaxed font-medium">
            The smart task management system built exclusively for dental clinics
          </p>

          {/* Detailed Description */}
          <p className="text-lg text-blue-700/90 mb-8 max-w-5xl mx-auto leading-relaxed">
            Replace paper checklists with real-time digital workflows that track everything from morning setups to sterilization protocols. 
            Owners login with email for full oversight including team analytics and performance insights, while assistants use a simple 4-digit PIN for instant task access. 
            With pre-built templates for procedures like endo setups, ortho adjustments, and OSHA compliance, plus automatic task assignment and completion tracking, 
            your team stays synchronized and accountable throughout the day. Multi-clinic support lets you manage multiple locations from one platform, 
            ensuring consistent quality across all your practices.
          </p>

          {/* Interactive Demo Preview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-12 max-w-6xl mx-auto border border-blue-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-blue-900 mb-2">Dual Dashboard System</h3>
              <p className="text-blue-700">Specialized interfaces for owners and assistants</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Assistant Hub */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900">Assistant Hub</h4>
                    <p className="text-sm text-green-600">Daily task management</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Room Preparation</span>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Hand className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Patient Check-in</span>
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Undo2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Owner Dashboard */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900">Owner Dashboard</h4>
                    <p className="text-sm text-indigo-600">Team & clinic oversight</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Team Analytics</span>
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Task Templates</span>
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <CalendarDays className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">Calendar Integration</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">Team Management</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-white rounded-lg border border-teal-100">
                <TrendingUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">Analytics & Reports</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-white rounded-lg border border-rose-100">
                <Shield className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">HIPAA Compliance</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center items-center gap-8 mb-12 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">500+</div>
              <div className="text-blue-600 text-sm font-medium">Active Clinics</div>
            </div>
            <div className="w-px h-12 bg-blue-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">15K+</div>
              <div className="text-blue-600 text-sm font-medium">Healthcare Staff</div>
            </div>
            <div className="w-px h-12 bg-blue-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">99.9%</div>
              <div className="text-blue-600 text-sm font-medium">Platform Uptime</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              <Stethoscope className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Start Your Clinic Hub
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transition-all duration-300 group"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Explore All Features
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
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className="w-12 h-12">
                  <rect x="70.64" y="26.34" fill="#FDFDFD" width="882.73" height="971.32"/>
                  <path fill="hsl(var(--logo-primary))" d="M912.23,368.04c-2.64,0.08-4.69-0.88-6.33-2.93c-4.48-5.6-14.89-35.56-15.82-44.53l-5.75-9.99c9.87-169.53-170.87-227.39-289.01-124.34L343.25,430.21c1.08,3.4,48.21,44.25,54.75,43.03l247.55-237.32c67.1-57.94,175.17-39.28,168.69,64.54c-7.31,30.47-11.98,60.91-14,91.33l56.32,51.92l17.06-63.87l6.96-2.3c9.86,7.57,17.85,14.91,25.31,25.31c-8.76,39.36-21.66,78.46-33.17,117.12c-4.57,6.92-14.86-12.85-17.46-15.88c-6.51-2.45-12.4-5.95-17.64-10.52l-88.46-93.81c15.9-43.64,22.79-87.96,20.68-132.97l-7.66-1.6c-22.93-42.47-75.96-4.32-99.3,19.26l-6.94-1.84c-11.58,9.93-20.94,21.64-28.06,35.12L430,504.95l12.06,8.73c62.86-58.69,123.91-117.77,183.16-177.22c7.32-4.94,16.51-4.96,27.58-0.06c21.95,6.35,45.72,29.27,53.79,50.62c37.9,20.87,77.08,61.67,104.9,95.96c39.99,49.31,54.45,106.35,46.97,169.8c-9.54,66.83-53.32,249.7-111.71,285.36c-48.31,29.49-97.23,3.03-116.16-46.42c-26.11-68.21-26.29-130.71-70.07-195.69c-4.17-6.19-20.69-20.26-17.08-27.36c1.69-3.32,20.45-21.48,23.89-19.04c17.85,24.78,34.46,49.14,47.07,77.95c21.53,49.17,29.67,124.95,50.43,164.72c19.18,36.74,59.12,32.54,82.91,2.52c34.85-43.97,80.07-209.76,79.29-265.88c-0.69-49.19-25.03-102.39-58.57-137.67L642.15,374.6c-7.32,8-56.57,52.23-55.57,57.87c61.46,77.15,163.17,107.02,154.75,221.86c-1.08,14.77-17.31,93.25-23.82,102.73c-8.84,12.87-28.61,5.21-29.92-7.82c-1.61-16.04,20.15-73.64,22.1-98.07c4.44-55.49-23.96-86.58-67.52-115.1c-57.98,58.09-127.82,109.2-174.21,177.1c-40.51,54.45-37.22,203.71-102.17,230.04c-85.55,34.69-122.53-65.4-143.35-127.41c-29.23-87.07-52.31-182.35-31.56-273.72c3.18-3.32,27.13,20.72,27.97,24.34c1.86,8.04-6.04,41.01-6.08,53.11c-0.2,56.88,44.95,236.8,82.52,278.46c25.96,28.77,64.93,26.44,81.91-9.81c24.89-53.15,27-123.55,57.74-182.72c39-75.06,131.98-129.13,182.83-196.18c-8.71-8.3-48.84-53.86-57.85-52.31c-31.39,29.72-64.25,58.28-95.45,88.17c-15.38,14.73-90.72,95.58-101.93,97.72c-14.22,2.72-19.75-13.25-32.43-15.36c-1.31,40.63,13.21,79.88,22.05,119.06c0.21,16.93-23.74,25.2-32.28,6.62c-6.69-14.56-19.99-84.19-21.37-102.02c-0.79-10.2,2.58-49.07,1.38-52.31c-2.32-6.26-54.86-46.2-64.74-55.16c-5.97-5.41-10.7-12.64-15.78-17.45c0.06-4.97,3.41-8.26,10.05-9.87c-11.48-10.25-13.78-18.56-6.88-24.93l6.31-2.95l127.83,108.23c19.18-16.32,36.03-33.45,50.56-51.38L281.91,439.24C175.38,325.31,224.79,125.37,395.2,234.01c3.38-0.82,52.36-43.78,51.03-47c-2.73-6.64-59.55-38.71-69.41-41.78c-45.62-14.22-85.27-16.71-130.04,2.98c-127.28,55.99-99.7,209.5-44.75,309l-1.67,8.92c5.24,9.36-1.71,12.34-20.84,8.95l-7.64,0.54c-65.77-93.58-83.15-255.42,14.31-335.3c99.41-81.49,234.98-42.36,314.68,45.81l-104.08,98.28c-32.9-17.81-89.68-73.65-123.68-25.52c-16.85,23.85-7.08,54.16-0.99,80.12c6.76,28.78,12.53,51.28,37.39,70.13l211.9-205.68c69.15-68.88,138.71-121.76,242.7-103.32C892.89,122.96,949.2,248.22,912.23,368.04z"/>
                  <path fill="hsl(var(--blue-100))" d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z"/>
                  <path fill="hsl(var(--logo-secondary))" d="M200.36,466.12c9.64-2.8,28.97,16.56,22.15,25.31c1.07,1.63,1.4,6.91,3.54,10.56c8.6,14.69,25.45,18.07-6.7,24.24c-20.86-19.73-29.69-25.35-47.46-50.62C182.63,454.05,192.74,481.36,200.36,466.12z"/>
                  <path fill="hsl(var(--logo-accent))" d="M912.23,368.04c0.45,12.83-3.66,22.8-6.33,34.8c-9.06,6.86-12.06-7.01-15.65-10.56c-4.95-4.9-12.99,2.34-9.66-14.75l-5.12-6.49l7.84-45.94l6.77-4.52l20.43,35.06C912.9,359.58,912.08,363.79,912.23,368.04z"/>
                  <path fill="#FDFDFD" d="M890.09,320.58c-1.28,16.66-6,40.17-9.49,56.95c-3.57,17.17-11.67,50.55-17.36,66.48c-1.34,3.74-3.19,7.05-6.45,9.46l-61.77-58.36c-8.32-14.26,11.94-72.87,12.92-94.96c4.81-107.94-108.39-112.79-169.29-49.09l-239.02,229.4l-9.37,0l-56.95-50.64l257.89-248.36C721.28,72.93,904.25,136.66,890.09,320.58z"/>
                  <path fill="#FDFDFD" d="M200.36,466.12c-31.53-45.22-54.89-136.69-50.58-191.37c8.89-112.63,124.89-173.61,227.72-136.06c13.24,4.84,68.95,35.54,74.61,45.77c2.52,4.55,0.62,4.81-1.64,8.08c-12.17,17.7-41.5,33.31-55.49,51.35c-42.28-35.6-111.47-55.46-148.55-2.21c-33.26,47.77-2.22,163.21,45.63,197.59L418.6,546.71l-61.63,58.57L222.5,491.43C216.1,481.68,205.16,473.01,200.36,466.12z"/>
                  <path fill="hsl(var(--blue-50))" d="M655.96,282.62c27.13-29.81,91.37-70.86,113.9-15.82c-8.97,20.39-1.73,38.67-3.94,57.7c-1.17,10.09-19.51,74.59-26.09,75.09c-11.18-7.97-17.99-15.71-33.25-12.57c-17.53-16.59-35.97-34.59-53.79-50.62c-26.39-0.91-34.21-14.38-14.99-34.82L655.96,282.62z"/>
                  <path fill="hsl(var(--blue-100))" d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z"/>
                </svg>
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
                  
                  <TabsContent value="owner" className="space-y-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-display font-bold text-blue-900 mb-1">Clinic Owner</h3>
                      <p className="text-blue-700 text-xs mb-3">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-display font-bold text-blue-900 mb-1">Healthcare Assistant</h3>
                      <p className="text-blue-700 text-xs mb-3">Access your workspace and tasks</p>
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
              <Building2 className="w-4 h-4 mr-2" />
              Complete Healthcare Management Suite
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Everything Your
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                Clinic Needs
              </span>
            </h2>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              From Assistant Hub to Owner Dashboard - comprehensive tools for every role in your healthcare team.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Feature 1 - Assistant Hub */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Assistant Hub</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Dedicated workspace for healthcare assistants with task management, calendar, and team coordination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">Today's tasks overview</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">One-click task completion</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">Calendar integration</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">Performance tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Owner Dashboard */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Owner Dashboard</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Comprehensive clinic management with team oversight, analytics, and task template creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Team management</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Task template builder</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Analytics & insights</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Clinic configuration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Smart Features */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Smart Automation</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Intelligent features that streamline workflows and enhance productivity across your entire team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">Instant undo actions</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">Real-time synchronization</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">HIPAA compliance</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">Mobile optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-blue-300/10">
            <h3 className="text-3xl font-display font-bold text-white text-center mb-8">More Powerful Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Analytics Dashboard</h4>
                <p className="text-blue-200 text-sm">Track performance, identify trends, optimize workflows</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Calendar Views</h4>
                <p className="text-blue-200 text-sm">Weekly schedules, task planning, appointment integration</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Template System</h4>
                <p className="text-blue-200 text-sm">Create, share, and manage task templates across teams</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Real-time Updates</h4>
                <p className="text-blue-200 text-sm">Instant notifications, live status updates, team coordination</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              <Building2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Launch Your Healthcare Hub
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
              <div className="w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className="w-12 h-12">
                  <rect x="70.64" y="26.34" fill="#FDFDFD" width="882.73" height="971.32"/>
                  <path fill="hsl(var(--logo-primary))" d="M912.23,368.04c-2.64,0.08-4.69-0.88-6.33-2.93c-4.48-5.6-14.89-35.56-15.82-44.53l-5.75-9.99c9.87-169.53-170.87-227.39-289.01-124.34L343.25,430.21c1.08,3.4,48.21,44.25,54.75,43.03l247.55-237.32c67.1-57.94,175.17-39.28,168.69,64.54c-7.31,30.47-11.98,60.91-14,91.33l56.32,51.92l17.06-63.87l6.96-2.3c9.86,7.57,17.85,14.91,25.31,25.31c-8.76,39.36-21.66,78.46-33.17,117.12c-4.57,6.92-14.86-12.85-17.46-15.88c-6.51-2.45-12.4-5.95-17.64-10.52l-88.46-93.81c15.9-43.64,22.79-87.96,20.68-132.97l-7.66-1.6c-22.93-42.47-75.96-4.32-99.3,19.26l-6.94-1.84c-11.58,9.93-20.94,21.64-28.06,35.12L430,504.95l12.06,8.73c62.86-58.69,123.91-117.77,183.16-177.22c7.32-4.94,16.51-4.96,27.58-0.06c21.95,6.35,45.72,29.27,53.79,50.62c37.9,20.87,77.08,61.67,104.9,95.96c39.99,49.31,54.45,106.35,46.97,169.8c-9.54,66.83-53.32,249.7-111.71,285.36c-48.31,29.49-97.23,3.03-116.16-46.42c-26.11-68.21-26.29-130.71-70.07-195.69c-4.17-6.19-20.69-20.26-17.08-27.36c1.69-3.32,20.45-21.48,23.89-19.04c17.85,24.78,34.46,49.14,47.07,77.95c21.53,49.17,29.67,124.95,50.43,164.72c19.18,36.74,59.12,32.54,82.91,2.52c34.85-43.97,80.07-209.76,79.29-265.88c-0.69-49.19-25.03-102.39-58.57-137.67L642.15,374.6c-7.32,8-56.57,52.23-55.57,57.87c61.46,77.15,163.17,107.02,154.75,221.86c-1.08,14.77-17.31,93.25-23.82,102.73c-8.84,12.87-28.61,5.21-29.92-7.82c-1.61-16.04,20.15-73.64,22.1-98.07c4.44-55.49-23.96-86.58-67.52-115.1c-57.98,58.09-127.82,109.2-174.21,177.1c-40.51,54.45-37.22,203.71-102.17,230.04c-85.55,34.69-122.53-65.4-143.35-127.41c-29.23-87.07-52.31-182.35-31.56-273.72c3.18-3.32,27.13,20.72,27.97,24.34c1.86,8.04-6.04,41.01-6.08,53.11c-0.2,56.88,44.95,236.8,82.52,278.46c25.96,28.77,64.93,26.44,81.91-9.81c24.89-53.15,27-123.55,57.74-182.72c39-75.06,131.98-129.13,182.83-196.18c-8.71-8.3-48.84-53.86-57.85-52.31c-31.39,29.72-64.25,58.28-95.45,88.17c-15.38,14.73-90.72,95.58-101.93,97.72c-14.22,2.72-19.75-13.25-32.43-15.36c-1.31,40.63,13.21,79.88,22.05,119.06c0.21,16.93-23.74,25.2-32.28,6.62c-6.69-14.56-19.99-84.19-21.37-102.02c-0.79-10.2,2.58-49.07,1.38-52.31c-2.32-6.26-54.86-46.2-64.74-55.16c-5.97-5.41-10.7-12.64-15.78-17.45c0.06-4.97,3.41-8.26,10.05-9.87c-11.48-10.25-13.78-18.56-6.88-24.93l6.31-2.95l127.83,108.23c19.18-16.32,36.03-33.45,50.56-51.38L281.91,439.24C175.38,325.31,224.79,125.37,395.2,234.01c3.38-0.82,52.36-43.78,51.03-47c-2.73-6.64-59.55-38.71-69.41-41.78c-45.62-14.22-85.27-16.71-130.04,2.98c-127.28,55.99-99.7,209.5-44.75,309l-1.67,8.92c5.24,9.36-1.71,12.34-20.84,8.95l-7.64,0.54c-65.77-93.58-83.15-255.42,14.31-335.3c99.41-81.49,234.98-42.36,314.68,45.81l-104.08,98.28c-32.9-17.81-89.68-73.65-123.68-25.52c-16.85,23.85-7.08,54.16-0.99,80.12c6.76,28.78,12.53,51.28,37.39,70.13l211.9-205.68c69.15-68.88,138.71-121.76,242.7-103.32C892.89,122.96,949.2,248.22,912.23,368.04z"/>
                  <path fill="hsl(var(--blue-100))" d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z"/>
                  <path fill="hsl(var(--logo-secondary))" d="M200.36,466.12c9.64-2.8,28.97,16.56,22.15,25.31c1.07,1.63,1.4,6.91,3.54,10.56c8.6,14.69,25.45,18.07-6.7,24.24c-20.86-19.73-29.69-25.35-47.46-50.62C182.63,454.05,192.74,481.36,200.36,466.12z"/>
                  <path fill="hsl(var(--logo-accent))" d="M912.23,368.04c0.45,12.83-3.66,22.8-6.33,34.8c-9.06,6.86-12.06-7.01-15.65-10.56c-4.95-4.9-12.99,2.34-9.66-14.75l-5.12-6.49l7.84-45.94l6.77-4.52l20.43,35.06C912.9,359.58,912.08,363.79,912.23,368.04z"/>
                  <path fill="#FDFDFD" d="M890.09,320.58c-1.28,16.66-6,40.17-9.49,56.95c-3.57,17.17-11.67,50.55-17.36,66.48c-1.34,3.74-3.19,7.05-6.45,9.46l-61.77-58.36c-8.32-14.26,11.94-72.87,12.92-94.96c4.81-107.94-108.39-112.79-169.29-49.09l-239.02,229.4l-9.37,0l-56.95-50.64l257.89-248.36C721.28,72.93,904.25,136.66,890.09,320.58z"/>
                  <path fill="#FDFDFD" d="M200.36,466.12c-31.53-45.22-54.89-136.69-50.58-191.37c8.89-112.63,124.89-173.61,227.72-136.06c13.24,4.84,68.95,35.54,74.61,45.77c2.52,4.55,0.62,4.81-1.64,8.08c-12.17,17.7-41.5,33.31-55.49,51.35c-42.28-35.6-111.47-55.46-148.55-2.21c-33.26,47.77-2.22,163.21,45.63,197.59L418.6,546.71l-61.63,58.57L222.5,491.43C216.1,481.68,205.16,473.01,200.36,466.12z"/>
                  <path fill="hsl(var(--blue-50))" d="M655.96,282.62c27.13-29.81,91.37-70.86,113.9-15.82c-8.97,20.39-1.73,38.67-3.94,57.7c-1.17,10.09-19.51,74.59-26.09,75.09c-11.18-7.97-17.99-15.71-33.25-12.57c-17.53-16.59-35.97-34.59-53.79-50.62c-26.39-0.91-34.21-14.38-14.99-34.82L655.96,282.62z"/>
                  <path fill="hsl(var(--blue-100))" d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z"/>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-display font-bold">
                  <span className="text-blue-400">
                    Denta
                  </span>
                  <span className="text-white">
                    League
                  </span>
                </span>
                <div className="text-xs text-blue-300 font-medium tracking-wide">DENTAL PRACTICE PLATFORM</div>
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
                &copy; 2024 DentaLeague. All rights reserved. Empowering dental teams worldwide with intelligent practice management.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}