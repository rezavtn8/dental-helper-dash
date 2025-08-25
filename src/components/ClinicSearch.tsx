import { useState } from 'react';
import { Search, MapPin, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface ClinicSearchProps {
  onClinicSelected: (clinic: Clinic) => void;
}

export default function ClinicSearch({ onClinicSelected }: ClinicSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchClinics = async (term: string) => {
    if (!term.trim()) {
      setClinics([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, clinic_code, address, phone, email')
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,clinic_code.ilike.%${term}%`)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        toast.error('Error searching clinics');
        setClinics([]);
      } else {
        setClinics(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error searching clinics');
      setClinics([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchClinics(value);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Find Your Clinic</h2>
          <p className="text-muted-foreground">Search by clinic name or enter your clinic code</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Enter clinic name or code..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-12 text-base shadow-lg border-2 border-border focus:border-primary transition-colors"
        />
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center text-muted-foreground">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Searching clinics...</span>
          </div>
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="max-w-2xl mx-auto space-y-4">
          {clinics.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Found {clinics.length} clinic{clinics.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-3">
                {clinics.map((clinic) => (
                  <Card key={clinic.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{clinic.name}</h3>
                            <p className="text-sm text-primary font-medium">Code: {clinic.clinic_code}</p>
                          </div>
                          
                          <div className="space-y-1">
                            {clinic.address && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{clinic.address}</span>
                              </div>
                            )}
                            {clinic.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{clinic.phone}</span>
                              </div>
                            )}
                            {clinic.email && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{clinic.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => onClinicSelected(clinic)}
                          className="ml-4 shadow-sm"
                        >
                          Select Clinic
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">No clinics found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try searching with a different name or clinic code
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure you have the correct clinic code from your practice manager
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}