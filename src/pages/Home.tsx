import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { LogIn, Shield, Users, CheckCircle, ArrowRight, Stethoscope, Building2, UserCheck, Crown, Calendar, BarChart3, Zap, Heart, Star, Globe, Lock, Clock, TrendingUp, Hand, Undo2, ArrowUp, CalendarDays, MousePointer, Sparkles, Timer, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';
import { AnimatedLogo } from '@/components/ui/animated-logo';
export default function Home() {
  console.log('Home component rendering'); // Debug log
  const navigate = useNavigate();
  const {
    user,
    userProfile,
    loading
  } = useAuth();

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
  return <div className="min-h-screen bg-background relative">
      
      {/* Loading State */}
      {loading && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>}
      

      {/* Navigation */}
      <nav className="relative z-50 bg-card/90 backdrop-blur-sm border-b border-border sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className="w-12 h-12">
                  <rect x="70.64" y="26.34" fill="#FDFDFD" width="882.73" height="971.32" />
                  <path fill="hsl(var(--logo-primary))" d="M912.23,368.04c-2.64,0.08-4.69-0.88-6.33-2.93c-4.48-5.6-14.89-35.56-15.82-44.53l-5.75-9.99c9.87-169.53-170.87-227.39-289.01-124.34L343.25,430.21c1.08,3.4,48.21,44.25,54.75,43.03l247.55-237.32c67.1-57.94,175.17-39.28,168.69,64.54c-7.31,30.47-11.98,60.91-14,91.33l56.32,51.92l17.06-63.87l6.96-2.3c9.86,7.57,17.85,14.91,25.31,25.31c-8.76,39.36-21.66,78.46-33.17,117.12c-4.57,6.92-14.86-12.85-17.46-15.88c-6.51-2.45-12.4-5.95-17.64-10.52l-88.46-93.81c15.9-43.64,22.79-87.96,20.68-132.97l-7.66-1.6c-22.93-42.47-75.96-4.32-99.3,19.26l-6.94-1.84c-11.58,9.93-20.94,21.64-28.06,35.12L430,504.95l12.06,8.73c62.86-58.69,123.91-117.77,183.16-177.22c7.32-4.94,16.51-4.96,27.58-0.06c21.95,6.35,45.72,29.27,53.79,50.62c37.9,20.87,77.08,61.67,104.9,95.96c39.99,49.31,54.45,106.35,46.97,169.8c-9.54,66.83-53.32,249.7-111.71,285.36c-48.31,29.49-97.23,3.03-116.16-46.42c-26.11-68.21-26.29-130.71-70.07-195.69c-4.17-6.19-20.69-20.26-17.08-27.36c1.69-3.32,20.45-21.48,23.89-19.04c17.85,24.78,34.46,49.14,47.07,77.95c21.53,49.17,29.67,124.95,50.43,164.72c19.18,36.74,59.12,32.54,82.91,2.52c34.85-43.97,80.07-209.76,79.29-265.88c-0.69-49.19-25.03-102.39-58.57-137.67L642.15,374.6c-7.32,8-56.57,52.23-55.57,57.87c61.46,77.15,163.17,107.02,154.75,221.86c-1.08,14.77-17.31,93.25-23.82,102.73c-8.84,12.87-28.61,5.21-29.92-7.82c-1.61-16.04,20.15-73.64,22.1-98.07c4.44-55.49-23.96-86.58-67.52-115.1c-57.98,58.09-127.82,109.2-174.21,177.1c-40.51,54.45-37.22,203.71-102.17,230.04c-85.55,34.69-122.53-65.4-143.35-127.41c-29.23-87.07-52.31-182.35-31.56-273.72c3.18-3.32,27.13,20.72,27.97,24.34c1.86,8.04-6.04,41.01-6.08,53.11c-0.2,56.88,44.95,236.8,82.52,278.46c25.96,28.77,64.93,26.44,81.91-9.81c24.89-53.15,27-123.55,57.74-182.72c39-75.06,131.98-129.13,182.83-196.18c-8.71-8.3-48.84-53.86-57.85-52.31c-31.39,29.72-64.25,58.28-95.45,88.17c-15.38,14.73-90.72,95.58-101.93,97.72c-14.22,2.72-19.75-13.25-32.43-15.36c-1.31,40.63,13.21,79.88,22.05,119.06c0.21,16.93-23.74,25.2-32.28,6.62c-6.69-14.56-19.99-84.19-21.37-102.02c-0.79-10.2,2.58-49.07,1.38-52.31c-2.32-6.26-54.86-46.2-64.74-55.16c-5.97-5.41-10.7-12.64-15.78-17.45c0.06-4.97,3.41-8.26,10.05-9.87c-11.48-10.25-13.78-18.56-6.88-24.93l6.31-2.95l127.83,108.23c19.18-16.32,36.03-33.45,50.56-51.38L281.91,439.24C175.38,325.31,224.79,125.37,395.2,234.01c3.38-0.82,52.36-43.78,51.03-47c-2.73-6.64-59.55-38.71-69.41-41.78c-45.62-14.22-85.27-16.71-130.04,2.98c-127.28,55.99-99.7,209.5-44.75,309l-1.67,8.92c5.24,9.36-1.71,12.34-20.84,8.95l-7.64,0.54c-65.77-93.58-83.15-255.42,14.31-335.3c99.41-81.49,234.98-42.36,314.68,45.81l-104.08,98.28c-32.9-17.81-89.68-73.65-123.68-25.52c-16.85,23.85-7.08,54.16-0.99,80.12c6.76,28.78,12.53,51.28,37.39,70.13l211.9-205.68c69.15-68.88,138.71-121.76,242.7-103.32C892.89,122.96,949.2,248.22,912.23,368.04z" />
                  <path fill="hsl(var(--blue-100))" d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z" />
                  <path fill="hsl(var(--logo-secondary))" d="M200.36,466.12c9.64-2.8,28.97,16.56,22.15,25.31c1.07,1.63,1.4,6.91,3.54,10.56c8.6,14.69,25.45,18.07-6.7,24.24c-20.86-19.73-29.69-25.35-47.46-50.62C182.63,454.05,192.74,481.36,200.36,466.12z" />
                  <path fill="hsl(var(--logo-accent))" d="M912.23,368.04c0.45,12.83-3.66,22.8-6.33,34.8c-9.06,6.86-12.06-7.01-15.65-10.56c-4.95-4.9-12.99,2.34-9.66-14.75l-5.12-6.49l7.84-45.94l6.77-4.52l20.43,35.06C912.9,359.58,912.08,363.79,912.23,368.04z" />
                  <path fill="#FDFDFD" d="M890.09,320.58c-1.28,16.66-6,40.17-9.49,56.95c-3.57,17.17-11.67,50.55-17.36,66.48c-1.34,3.74-3.19,7.05-6.45,9.46l-61.77-58.36c-8.32-14.26,11.94-72.87,12.92-94.96c4.81-107.94-108.39-112.79-169.29-49.09l-239.02,229.4l-9.37,0l-56.95-50.64l257.89-248.36C721.28,72.93,904.25,136.66,890.09,320.58z" />
                  <path fill="#FDFDFD" d="M200.36,466.12c-31.53-45.22-54.89-136.69-50.58-191.37c8.89-112.63,124.89-173.61,227.72-136.06c13.24,4.84,68.95,35.54,74.61,45.77c2.52,4.55,0.62,4.81-1.64,8.08c-12.17,17.7-41.5,33.31-55.49,51.35c-42.28-35.6-111.47-55.46-148.55-2.21c-33.26,47.77-2.22,163.21,45.63,197.59L418.6,546.71l-61.63,58.57L222.5,491.43C216.1,481.68,205.16,473.01,200.36,466.12z" />
                  <path fill="hsl(var(--blue-50))" d="M655.96,282.62c27.13-29.81,91.37-70.86,113.9-15.82c-8.97,20.39-1.73,38.67-3.94,57.7c-1.17,10.09-19.51,74.59-26.09,75.09c-11.18-7.97-17.99-15.71-33.25-12.57c-17.53-16.59-35.97-34.59-53.79-50.62c-26.39-0.91-34.21-14.38-14.99-34.82L655.96,282.62z" />
                  <path fill="hsl(var(--blue-100))" d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-semibold text-foreground">
                  DentaLeague
                </span>
                <div className="text-xs text-muted-foreground font-medium">HEALTHCARE MANAGEMENT</div>
              </div>
            </div>
            
            <Button onClick={() => document.getElementById('auth-section')?.scrollIntoView({
            behavior: 'smooth'
          })} className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
              <LogIn className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Animated Logo */}
          <div className="mb-8">
            <AnimatedLogo size={120} className="mx-auto" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
            DentaLeague
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Streamlined practice management for healthcare professionals
          </p>

          {/* Simple Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <UserCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Assistant Hub</h3>
                  <p className="text-sm text-muted-foreground">Task management</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>Room Preparation</span>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>Patient Check-in</span>
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-4">
                  <Crown className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Owner Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Team oversight</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>Team Analytics</span>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>Task Templates</span>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={() => document.getElementById('auth-section')?.scrollIntoView({
            behavior: 'smooth'
          })} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold transition-colors">
              <Stethoscope className="w-5 h-5 mr-2" />
              Start Your Practice Hub
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({
            behavior: 'smooth'
          })} className="border-2 border-border text-foreground hover:bg-muted px-8 py-4 text-lg font-semibold transition-colors">
              <Users className="w-5 h-5 mr-2" />
              Explore Features
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-8 mb-8 flex-wrap text-muted-foreground text-sm">
            <span>500+ Active Clinics</span>
            <span>•</span>
            <span>15K+ Healthcare Staff</span>
            <span>•</span>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border border-border overflow-hidden bg-card backdrop-blur-sm">
            <CardHeader className="text-center py-6 bg-muted/50">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className="w-12 h-12">
                  <rect x="70.64" y="26.34" fill="#FDFDFD" width="882.73" height="971.32" />
                  <path fill="hsl(var(--logo-primary))" d="M912.23,368.04c-2.64,0.08-4.69-0.88-6.33-2.93c-4.48-5.6-14.89-35.56-15.82-44.53l-5.75-9.99c9.87-169.53-170.87-227.39-289.01-124.34L343.25,430.21c1.08,3.4,48.21,44.25,54.75,43.03l247.55-237.32c67.1-57.94,175.17-39.28,168.69,64.54c-7.31,30.47-11.98,60.91-14,91.33l56.32,51.92l17.06-63.87l6.96-2.3c9.86,7.57,17.85,14.91,25.31,25.31c-8.76,39.36-21.66,78.46-33.17,117.12c-4.57,6.92-14.86-12.85-17.46-15.88c-6.51-2.45-12.4-5.95-17.64-10.52l-88.46-93.81c15.9-43.64,22.79-87.96,20.68-132.97l-7.66-1.6c-22.93-42.47-75.96-4.32-99.3,19.26l-6.94-1.84c-11.58,9.93-20.94,21.64-28.06,35.12L430,504.95l12.06,8.73c62.86-58.69,123.91-117.77,183.16-177.22c7.32-4.94,16.51-4.96,27.58-0.06c21.95,6.35,45.72,29.27,53.79,50.62c37.9,20.87,77.08,61.67,104.9,95.96c39.99,49.31,54.45,106.35,46.97,169.8c-9.54,66.83-53.32,249.7-111.71,285.36c-48.31,29.49-97.23,3.03-116.16-46.42c-26.11-68.21-26.29-130.71-70.07-195.69c-4.17-6.19-20.69-20.26-17.08-27.36c1.69-3.32,20.45-21.48,23.89-19.04c17.85,24.78,34.46,49.14,47.07,77.95c21.53,49.17,29.67,124.95,50.43,164.72c19.18,36.74,59.12,32.54,82.91,2.52c34.85-43.97,80.07-209.76,79.29-265.88c-0.69-49.19-25.03-102.39-58.57-137.67L642.15,374.6c-7.32,8-56.57,52.23-55.57,57.87c61.46,77.15,163.17,107.02,154.75,221.86c-1.08,14.77-17.31,93.25-23.82,102.73c-8.84,12.87-28.61,5.21-29.92-7.82c-1.61-16.04,20.15-73.64,22.1-98.07c4.44-55.49-23.96-86.58-67.52-115.1c-57.98,58.09-127.82,109.2-174.21,177.1c-40.51,54.45-37.22,203.71-102.17,230.04c-85.55,34.69-122.53-65.4-143.35-127.41c-29.23-87.07-52.31-182.35-31.56-273.72c3.18-3.32,27.13,20.72,27.97,24.34c1.86,8.04-6.04,41.01-6.08,53.11c-0.2,56.88,44.95,236.8,82.52,278.46c25.96,28.77,64.93,26.44,81.91-9.81c24.89-53.15,27-123.55,57.74-182.72c39-75.06,131.98-129.13,182.83-196.18c-8.71-8.3-48.84-53.86-57.85-52.31c-31.39,29.72-64.25,58.28-95.45,88.17c-15.38,14.73-90.72,95.58-101.93,97.72c-14.22,2.72-19.75-13.25-32.43-15.36c-1.31,40.63,13.21,79.88,22.05,119.06c0.21,16.93-23.74,25.2-32.28,6.62c-6.69-14.56-19.99-84.19-21.37-102.02c-0.79-10.2,2.58-49.07,1.38-52.31c-2.32-6.26-54.86-46.2-64.74-55.16c-5.97-5.41-10.7-12.64-15.78-17.45c0.06-4.97,3.41-8.26,10.05-9.87c-11.48-10.25-13.78-18.56-6.88-24.93l6.31-2.95l127.83,108.23c19.18-16.32,36.03-33.45,50.56-51.38L281.91,439.24C175.38,325.31,224.79,125.37,395.2,234.01c3.38-0.82,52.36-43.78,51.03-47c-2.73-6.64-59.55-38.71-69.41-41.78c-45.62-14.22-85.27-16.71-130.04,2.98c-127.28,55.99-99.7,209.5-44.75,309l-1.67,8.92c5.24,9.36-1.71,12.34-20.84,8.95l-7.64,0.54c-65.77-93.58-83.15-255.42,14.31-335.3c99.41-81.49,234.98-42.36,314.68,45.81l-104.08,98.28c-32.9-17.81-89.68-73.65-123.68-25.52c-16.85,23.85-7.08,54.16-0.99,80.12c6.76,28.78,12.53,51.28,37.39,70.13l211.9-205.68c69.15-68.88,138.71-121.76,242.7-103.32C892.89,122.96,949.2,248.22,912.23,368.04z" />
                  <path fill="hsl(var(--blue-100))" d="M855.28,504.09c-8.46-0.08-9,3.84-9.73,10.99c-2.05,20.13,13.87,41.69,16.03,63.39c2.38,23.94,0.13,51.45-3.13,74.32c2.37-44.07-6.67-92.93-27.9-131.88c-23.03-42.26-87.37-99.24-123.97-133.89c4.97-10.22,15.79-9.16,32.48,3.2c13.29-33.02,24.87-66.34,19.9-102.49c-0.91-12.85,2.72-19.83,10.9-20.94c16.34,39.9-9.38,89.32-15.32,130.68C788.61,432.81,823.33,466.86,855.28,504.09z" />
                  <path fill="hsl(var(--logo-secondary))" d="M200.36,466.12c9.64-2.8,28.97,16.56,22.15,25.31c1.07,1.63,1.4,6.91,3.54,10.56c8.6,14.69,25.45,18.07-6.7,24.24c-20.86-19.73-29.69-25.35-47.46-50.62C182.63,454.05,192.74,481.36,200.36,466.12z" />
                  <path fill="hsl(var(--logo-accent))" d="M912.23,368.04c0.45,12.83-3.66,22.8-6.33,34.8c-9.06,6.86-12.06-7.01-15.65-10.56c-4.95-4.9-12.99,2.34-9.66-14.75l-5.12-6.49l7.84-45.94l6.77-4.52l20.43,35.06C912.9,359.58,912.08,363.79,912.23,368.04z" />
                  <path fill="#FDFDFD" d="M890.09,320.58c-1.28,16.66-6,40.17-9.49,56.95c-3.57,17.17-11.67,50.55-17.36,66.48c-1.34,3.74-3.19,7.05-6.45,9.46l-61.77-58.36c-8.32-14.26,11.94-72.87,12.92-94.96c4.81-107.94-108.39-112.79-169.29-49.09l-239.02,229.4l-9.37,0l-56.95-50.64l257.89-248.36C721.28,72.93,904.25,136.66,890.09,320.58z" />
                  <path fill="#FDFDFD" d="M200.36,466.12c-31.53-45.22-54.89-136.69-50.58-191.37c8.89-112.63,124.89-173.61,227.72-136.06c13.24,4.84,68.95,35.54,74.61,45.77c2.52,4.55,0.62,4.81-1.64,8.08c-12.17,17.7-41.5,33.31-55.49,51.35c-42.28-35.6-111.47-55.46-148.55-2.21c-33.26,47.77-2.22,163.21,45.63,197.59L418.6,546.71l-61.63,58.57L222.5,491.43C216.1,481.68,205.16,473.01,200.36,466.12z" />
                  <path fill="hsl(var(--blue-50))" d="M655.96,282.62c27.13-29.81,91.37-70.86,113.9-15.82c-8.97,20.39-1.73,38.67-3.94,57.7c-1.17,10.09-19.51,74.59-26.09,75.09c-11.18-7.97-17.99-15.71-33.25-12.57c-17.53-16.59-35.97-34.59-53.79-50.62c-26.39-0.91-34.21-14.38-14.99-34.82L655.96,282.62z" />
                  <path fill="hsl(var(--blue-100))" d="M655.96,282.62c-10.61,11.66-34.04,32.44-16.09,48.51c3.67,3.29,8.37,1.18,12.92,5.28c-24.89-4.93-32.92,17-48.96,31.72c-54.93,50.45-107.81,103.02-161.45,154.82c-3.61-6.21-21.55-13.05-20.34-20.02L655.96,282.62z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Complete Setup' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Set up your clinic information' : 'Choose your role to continue'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 h-12">
                    <TabsTrigger value="owner" className="flex items-center space-x-2 py-2 text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      <span>Owner</span>
                    </TabsTrigger>
                    <TabsTrigger value="assistant" className="flex items-center space-x-2 py-2 text-sm font-medium">
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">Clinic Owner</h3>
                      <p className="text-muted-foreground text-xs mb-3">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mx-auto mb-2">
                        <UserCheck className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">Healthcare Assistant</h3>
                      <p className="text-muted-foreground text-xs mb-3">Access your workspace and tasks</p>
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
      <section id="features" className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Complete Healthcare Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Specialized tools for every role in your healthcare team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border border-border">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground mb-2">Assistant Hub</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Streamlined task management for healthcare assistants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Daily task overview</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">One-click completion</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Performance tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground mb-2">Owner Dashboard</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Comprehensive clinic management and oversight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                    <span className="text-sm">Team management</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                    <span className="text-sm">Task templates</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-accent" />
                    <span className="text-sm">Analytics & insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/80 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground mb-2">Secure & Compliant</CardTitle>
                <CardDescription className="text-muted-foreground">
                  HIPAA-compliant platform with enterprise security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">HIPAA compliance</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Real-time sync</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Mobile optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => document.getElementById('auth-section')?.scrollIntoView({
            behavior: 'smooth'
          })} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold">
              <Building2 className="w-5 h-5 mr-2" />
              Start Your Practice Hub
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className="w-8 h-8">
                  <path fill="hsl(var(--primary))" d="M882.28,526.22c-6.06,1.48-6.09-2.22-8.9-5.31c-9.79-10.75-17.6-24.9-27.42-35.85c-26.25-29.27-57.84-54.33-83.29-84.48c-0.58-38.81,45.2-132.28-3.74-154.37c-17.11-7.72-32.01-5.01-48.7,1.95c-83.32,63.75-161.97,141.25-237.73,214.71c-5.75,5.58-39.97,38.14-39.24,42.36c0.41,2.35,14.28,17.8,18.73,13.28l194.68-185.31l20.62,7.81c68.86,77.86,188.2,146.61,199.17,259.6c7.11,73.26-42.15,276.33-96.33,327.58c-43.71,41.34-106.42,24.86-129.8-28.67c-31.61-72.39-30.11-168.01-93.17-226.59l23.51-26.41c29.15,26.67,47.88,66.21,61.75,102.71c12.32,32.44,32.49,134.23,47.36,151.96c17.46,20.81,49.78,18.91,68.52,0.42c27.37-27,58.19-128.13,67.98-167.73c16.73-67.66,27.97-131.86-7.36-195.95c-21.63-39.23-99.3-111.59-135.38-143.04c-3.45-3-21.1-17.53-23.34-17.14c-17.72,18.81-39.51,35.26-55.55,54.7l121.23,113.09c45.89,50.27,39.26,96.17,25.68,157.9c-3.68,16.74-9.06,64.82-31.25,62.42c-29.78-3.21-4.22-62.6-0.4-81.41c5.82-28.66,11.61-52.17,1.71-80.86c-10.03-29.05-38.53-48.73-61.42-67.64c-45.4,51.34-107.05,95.07-150.8,146.81c-50.47,59.7-53.18,131.6-76.75,201.67c-29.92,88.97-118.25,86.62-162.1,8.87c-39.61-70.23-76.81-222.33-71.08-302.16c0.43-6.01,6.59-46.85,7.8-49.15c3.08-5.84,5.2-0.58,7.97,1.63c7.36,5.87,14,13.71,21.61,19.5c-0.68,29.19-4.82,58.34-2.23,87.67c4.63,52.37,45.25,202.47,77.03,242.52c22.64,28.52,62.28,32.92,80.37-2.04c19.8-38.27,27.47-108.33,45.42-153.91c22.04-55.95,47.99-81.53,89.35-122.63L625.96,512c-8.9-6.85-52.06-56.2-58.04-55.14c-61.95,61.68-127.63,119.43-187.43,182.94c-24.01,15.12-36.17-17.49-42.38-12.28c5.55,10.43,2.17,21.81,3.53,32.82c2.52,20.29,24.73,86.07,15.68,98.68c-10.24,14.28-26.6,5.78-31.69-9.9c-8.09-24.92-22.17-88.61-22.55-113.68c-0.21-13.98,6.42-26.52,1.78-39.58c-55.19-46.62-125.06-94.28-152.66-163.7c-41.64-104.7-47.22-236.65,57.7-304.64c77.48-50.21,166.62-40.91,241.83,8.28c8.76,5.73,58.24,42.96,57.01,49.9c-1.53,8.6-90.25,87.19-103.26,99.67c-25.28-7.47-41.87-33.16-69.13-40.52c-24.93-6.73-56.4,0.42-61.35,30.04c-5.3,31.71,10.89,113.38,42.11,130.89l248.76-238.68c84.23-85.98,235.98-102.01,319.51-6.19C978.43,267.66,909.34,407.67,882.28,526.22z M461.47,184.59c-1.33-1.93-34.01-23.01-38.99-25.9c-52.73-30.66-107.94-38.48-165.63-15.86c-150.39,58.98-105.86,269.45-10.55,359.72c36.47,34.54,80.59,66.76,119.28,99.2c4.17,0.64,58.39-53.58,57.7-57.67c-44.92-48.62-137.85-94.75-164.38-155.38c-22.71-51.9-38.01-148.37,27.65-175.02c44.87-18.21,79.3,3.66,115.88,27.27c4.37-0.37,48.7-41.73,55.69-48.7C460.19,190.2,463.75,187.9,461.47,184.59z M846.37,169.84c-69.73-61.84-179.73-46.81-245.7,13.08L341.32,429.74l61.64,52.08l253.21-240.24c38.41-32.94,94.4-51.61,136.04-12.83c45.27,42.17,16.63,107.89,8.33,159.24l64.36,65.42c4.4-2.61,3.91-6.59,5.24-10.52C899.05,357.22,922.27,237.15,846.37,169.84z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">DentaLeague</span>
                <div className="text-xs text-muted-foreground">HEALTHCARE MANAGEMENT</div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 mb-6 flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 DentaLeague. Empowering healthcare teams with intelligent practice management.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}