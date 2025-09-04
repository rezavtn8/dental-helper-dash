import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Calendar, Upload, AlertTriangle, CheckCircle, Plus, FileText, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Certification {
  id: string;
  name: string;
  certification_type: string;
  file_url?: string;
  expiry_date?: string;
  issued_date?: string;
  issuing_organization?: string;
  created_at: string;
}

const certificationTypes = [
  'CPR',
  'First Aid',
  'HIPAA',
  'OSHA',
  'Dental Radiology',
  'Infection Control',
  'Medical Assistant',
  'Dental Assistant',
  'Other'
];

export default function CertificationsTab() {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: '',
    certification_type: '',
    expiry_date: '',
    issued_date: '',
    issuing_organization: '',
    file: null as File | null
  });

  const fetchCertifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [user]);

  const handleAddCertification = async () => {
    if (!user?.id || !newCertification.name || !newCertification.certification_type) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      let file_url = null;
      
      // Handle file upload if present
      if (newCertification.file) {
        // For now, we'll skip file upload implementation
        // In a real app, you'd upload to Supabase Storage here
        toast.info('File upload functionality will be implemented soon');
      }

      const { data, error } = await supabase
        .from('certifications')
        .insert({
          user_id: user.id,
          name: newCertification.name,
          certification_type: newCertification.certification_type,
          expiry_date: newCertification.expiry_date || null,
          issued_date: newCertification.issued_date || null,
          issuing_organization: newCertification.issuing_organization || null,
          file_url
        })
        .select()
        .single();

      if (error) throw error;

      setCertifications([...certifications, data]);
      setNewCertification({
        name: '',
        certification_type: '',
        expiry_date: '',
        issued_date: '',
        issuing_organization: '',
        file: null
      });
      setIsAddDialogOpen(false);
      toast.success('Certification added successfully');
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error('Failed to add certification');
    }
  };

  const getCertificationStatus = (certification: Certification) => {
    if (!certification.expiry_date) return { status: 'no-expiry', label: 'No Expiry', color: 'bg-slate-100 text-slate-700' };
    
    const expiryDate = new Date(certification.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700' };
    } else if (diffDays <= 30) {
      return { status: 'expiring-soon', label: 'Expiring Soon', color: 'bg-orange-100 text-orange-700' };
    } else if (diffDays <= 90) {
      return { status: 'renew-soon', label: 'Renew Soon', color: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { status: 'valid', label: 'Valid', color: 'bg-green-100 text-green-700' };
    }
  };

  const getComplianceStatus = () => {
    const expired = certifications.filter(cert => getCertificationStatus(cert).status === 'expired').length;
    const expiringSoon = certifications.filter(cert => getCertificationStatus(cert).status === 'expiring-soon').length;
    
    if (expired > 0) {
      return { status: 'non-compliant', label: 'Action Required ⚠️', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (expiringSoon > 0) {
      return { status: 'expiring-soon', label: 'Expiring Soon ⚠️', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    } else {
      return { status: 'compliant', label: 'Compliant ✅', color: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const complianceStatus = getComplianceStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Professional Certifications
            </h1>
            <p className="text-blue-700">
              Manage your certifications and track expiry dates.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <Badge className={complianceStatus.color}>
              {complianceStatus.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {certifications.filter(cert => getCertificationStatus(cert).status === 'valid').length}
                </p>
                <p className="text-sm text-green-600">Valid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {certifications.filter(cert => getCertificationStatus(cert).status === 'expiring-soon').length}
                </p>
                <p className="text-sm text-orange-600">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {certifications.filter(cert => getCertificationStatus(cert).status === 'expired').length}
                </p>
                <p className="text-sm text-red-600">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{certifications.length}</p>
                <p className="text-sm text-blue-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Certifications</CardTitle>
              <CardDescription>Track and manage your professional certifications</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Certification</DialogTitle>
                  <DialogDescription>
                    Add a new professional certification to your profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Certification Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., CPR Certification"
                      value={newCertification.name}
                      onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={newCertification.certification_type} onValueChange={(value) => setNewCertification({...newCertification, certification_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certification type" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificationTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issued">Issued Date</Label>
                      <Input
                        id="issued"
                        type="date"
                        value={newCertification.issued_date}
                        onChange={(e) => setNewCertification({...newCertification, issued_date: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="date"
                        value={newCertification.expiry_date}
                        onChange={(e) => setNewCertification({...newCertification, expiry_date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization">Issuing Organization</Label>
                    <Input
                      id="organization"
                      placeholder="e.g., American Red Cross"
                      value={newCertification.issuing_organization}
                      onChange={(e) => setNewCertification({...newCertification, issuing_organization: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Certificate File (Coming Soon)</Label>
                    <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-500">File upload will be available soon</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleAddCertification} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Add Certification
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Certifications Yet</h3>
              <p className="text-slate-500 mb-4">
                Add your professional certifications to track expiry dates and maintain compliance.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Certification
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((cert) => {
                  const status = getCertificationStatus(cert);
                  return (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          {cert.issuing_organization && (
                            <p className="text-sm text-slate-500">{cert.issuing_organization}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cert.certification_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'No expiry'}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {cert.file_url ? (
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <FileText className="w-3 h-3 mr-1" />
                              No File
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}