import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield, Users, CheckCircle, ArrowRight, Stethoscope, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import LoginWidget from '@/components/auth/LoginWidget';

export default function Home() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'owner') {
        navigate('/owner');
      } else if (userProfile.role === 'assistant') {
        navigate('/hub');
      }
    }
  }, [user, userProfile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              ClinicFlow
            </span>
          </div>
          <Button 
            onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })} 
            size="sm"
            variant="outline"
            className="group hover-scale transition-all duration-300"
          >
            <LogIn className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section with Login */}
      <section className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to ClinicFlow</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The complete solution for modern dental practice management. Sign in to access your dashboard or create a new clinic account.
            </p>
          </div>

          <Card className="shadow-lg max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Sign In to Your Account</CardTitle>
              <CardDescription>
                Access your clinic dashboard or assistant workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginWidget />
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Don't have a clinic yet?
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/setup')}
              className="px-8 py-3"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Create Your Clinic
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Why Choose ClinicFlow?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built specifically for healthcare teams to improve efficiency and patient care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover-scale group border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Role-Based Access</CardTitle>
              <CardDescription className="text-base">
                Secure login system with different access levels for owners and assistants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Owner dashboard with full control
                </li>
                 <li className="flex items-center">
                   <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                   Assistant access with clinic codes
                 </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Secure data protection
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover-scale group border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-secondary/10 to-secondary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Team Management</CardTitle>
              <CardDescription className="text-base">
                Add team members, assign tasks, and track performance across your clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Task assignment and tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Real-time progress updates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Performance analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover-scale group border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-accent/10 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogIn className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">Simple & Secure</CardTitle>
              <CardDescription className="text-base">
                Easy-to-use interface with enterprise-grade security for healthcare environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Intuitive user interface
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  HIPAA-compliant security
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary" />
                  Cloud-based reliability
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/5 via-muted/30 to-secondary/5 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Transform Your Clinic?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join healthcare teams already using ClinicFlow to improve their operations and patient care.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/setup')}
              className="px-12 py-6 text-lg hover-scale shadow-2xl group bg-gradient-to-r from-primary to-primary/90"
            >
              <Building2 className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Start Your Journey
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">ClinicFlow</span>
          </div>
          <p>&copy; 2024 ClinicFlow. All rights reserved. Empowering healthcare teams worldwide.</p>
        </div>
      </footer>
    </div>
  );
}