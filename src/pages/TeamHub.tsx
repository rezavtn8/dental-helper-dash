import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Users, CheckCircle, Clock, LogOut } from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { toast } from 'sonner';

interface ClinicMembership {
  id: string;
  clinic_id: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  clinic: {
    id: string;
    name: string;
    clinic_code: string;
  };
}

export default function TeamHub() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [memberships, setMemberships] = useState<ClinicMembership[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    fetchMemberships();
  }, [user, navigate]);

  const fetchMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_memberships')
        .select(`
          *,
          clinic:clinics(id, name, clinic_code)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      
      const activeMemberships = data || [];
      setMemberships(activeMemberships);
      
      // Auto-select first clinic if only one
      if (activeMemberships.length === 1) {
        setSelectedClinic(activeMemberships[0].clinic_id);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast.error('Failed to load clinic memberships');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterClinic = async () => {
    if (selectedClinic) {
      // Store selected clinic 
      localStorage.setItem('selected_clinic_id', selectedClinic);
      
        // Get the user's roles for this clinic to determine navigation options
        try {
          const { data: userRoles } = await supabase
            .from('user_roles') 
            .select('role')
            .eq('user_id', user?.id)
            .eq('clinic_id', selectedClinic)
            .eq('is_active', true);

          const selectedMembership = memberships.find(m => m.clinic_id === selectedClinic);
          const primaryRole = selectedMembership?.role;
          const additionalRoles = userRoles?.map(r => r.role) || [];
          const allRoles = [primaryRole, ...additionalRoles].filter(Boolean);
          
          // Check for preferred role from role switcher
          const preferredRole = localStorage.getItem('preferred_role');
          let targetRole = primaryRole;
          
          if (preferredRole && allRoles.includes(preferredRole)) {
            targetRole = preferredRole;
          } else if (allRoles.length > 1 && allRoles.includes('front_desk')) {
            // If user has multiple roles and one is front_desk, prefer it if no preference set
            targetRole = primaryRole;
          }
          
          // Navigate based on target role
          if (targetRole === 'owner') {
            navigate('/owner');
          } else if (targetRole === 'front_desk') {
            navigate('/front-desk');
          } else {
            navigate('/assistant');
          }
        } catch (error) {
        console.error('Error checking user roles:', error);
        // Default to assistant dashboard
        navigate('/assistant');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <AnimatedLogo size={28} animated={false} className="text-primary" />
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">Team Hub</span>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {memberships.length === 0 ? (
          // No clinics state
          <div className="text-center space-y-8">
            <Card className="shadow-lg max-w-2xl mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">No Clinic Access</CardTitle>
                <CardDescription className="text-base">
                  You're not currently a member of any dental clinics. Join a clinic to access your dashboard and start supporting your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5 text-primary" />
                    <span>How to Join a Clinic</span>
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Get your clinic code</p>
                        <p>Ask your clinic manager for the clinic code (e.g., ABC123)</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Submit join request</p>
                        <p>Enter the code and submit your request for approval</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Wait for approval</p>
                        <p>Your clinic manager will review and approve your request</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={() => navigate('/join')}
                  className="px-8 py-3"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Join a Clinic
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Has clinics - show clinic selector
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">Select Your Clinic</h1>
              <p className="text-muted-foreground">
                You have access to {memberships.length} clinic{memberships.length !== 1 ? 's' : ''}. Choose which clinic you'd like to work with today.
              </p>
            </div>

            <Card className="shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Your Clinics</span>
                </CardTitle>
                <CardDescription>
                  Select a clinic to access your dashboard and workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedClinic === membership.clinic_id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedClinic(membership.clinic_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{membership.clinic.name}</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {membership.clinic.clinic_code}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">
                              {membership.role}
                            </Badge>
                            <span>•</span>
                            <span>Joined {new Date(membership.joined_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {selectedClinic === membership.clinic_id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleEnterClinic}
                    disabled={!selectedClinic}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Enter Clinic
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/join')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Join Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}