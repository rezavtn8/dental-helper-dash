import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield, Users, CheckCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ClinicFlow</span>
          </div>
          <Button onClick={() => navigate('/login')}>
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Streamline Your Clinic Operations
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage tasks, track progress, and empower your team with our comprehensive clinic management platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')}>
              <LogIn className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/setup')}>
              Create New Clinic
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Why Choose ClinicFlow?</h2>
          <p className="text-lg text-muted-foreground">
            Built specifically for healthcare teams to improve efficiency and patient care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure login system with different access levels for owners and assistants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Owner dashboard with full control
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Assistant access with PIN authentication
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Secure data protection
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Add team members, assign tasks, and track performance across your clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Task assignment and tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Real-time progress updates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Performance analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <LogIn className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Simple & Secure</CardTitle>
              <CardDescription>
                Easy-to-use interface with enterprise-grade security for healthcare environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Intuitive user interface
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  HIPAA-compliant security
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Cloud-based reliability
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Transform Your Clinic?</h2>
            <p className="text-lg text-muted-foreground">
              Join healthcare teams already using ClinicFlow to improve their operations.
            </p>
            <Button size="lg" onClick={() => navigate('/login')}>
              <LogIn className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ClinicFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}