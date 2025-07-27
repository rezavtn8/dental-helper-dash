import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Users, Building2, Mail, Phone, Key, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  pin?: string;
  created_at: string;
}

export default function ClinicManagement() {
  const { user, signOut } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'assistant' as 'assistant' | 'owner'
  });

  useEffect(() => {
    if (user) {
      fetchClinicData();
      fetchUsers();
    }
  }, [user]);

  const fetchClinicData = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching clinic:', error);
        toast.error("Failed to load clinic information.");
      } else {
        setClinic(data);
      }
    } catch (error) {
      console.error('Error fetching clinic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers((data || []).filter(user => user.role !== null) as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      // For now, we'll just create a user record
      // In a real app, you'd send an invitation email
      const { error } = await supabase
        .from('users')
        .insert({
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
          clinic_id: clinic?.id
        });

      if (error) {
        toast.error(`Invitation Failed: ${error.message}`);
      } else {
        toast.success(`${inviteForm.name} has been added to your clinic.`);
        
        setInviteForm({ email: '', name: '', role: 'assistant' });
        fetchUsers(); // Refresh the users list
      }
    } catch (error) {
      toast.error("Failed to invite user.");
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading clinic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Clinic Management</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-6 space-y-6">
        {/* Clinic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Clinic Information</span>
            </CardTitle>
            <CardDescription>
              Your clinic details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clinic ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Clinic Name</Label>
                  <p className="text-lg">{clinic.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{clinic.address || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{clinic.phone || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{clinic.email || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No clinic information found.</p>
            )}
          </CardContent>
        </Card>

        {/* Invite User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Invite New User</span>
            </CardTitle>
            <CardDescription>
              Add assistants or owners to your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invite-name">Full Name</Label>
                  <Input
                    id="invite-name"
                    type="text"
                    placeholder="Enter full name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    className="w-full p-2 border border-input bg-background rounded-md"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as 'assistant' | 'owner' }))}
                  >
                    <option value="assistant">Assistant</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? 'Inviting...' : 'Invite User'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Clinic Team ({users.length})</span>
            </CardTitle>
            <CardDescription>
              Manage users in your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No users found. Start by inviting team members to your clinic.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}