import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle, XCircle } from 'lucide-react';

interface PinSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onPinCreated: (pin: string) => void;
  assistantName: string;
  clinicName: string;
}

export function PinSetupDialog({ open, onClose, onPinCreated, assistantName, clinicName }: PinSetupDialogProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const isWeakPin = (pin: string): boolean => {
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '0123', '9876'];
    return weakPins.includes(pin);
  };

  const getPinStrength = (pin: string): { strength: 'weak' | 'good' | 'strong'; message: string; color: string } => {
    if (pin.length < 4) {
      return { strength: 'weak', message: 'PIN must be 4 digits', color: 'text-destructive' };
    }
    
    if (isWeakPin(pin)) {
      return { strength: 'weak', message: 'This PIN is too common. Try a different combination.', color: 'text-destructive' };
    }
    
    // Check for sequential numbers
    const isSequential = /(\d)\1{2}/.test(pin) || 
                        (parseInt(pin[0]) + 1 === parseInt(pin[1]) && 
                         parseInt(pin[1]) + 1 === parseInt(pin[2]) && 
                         parseInt(pin[2]) + 1 === parseInt(pin[3]));
    
    if (isSequential) {
      return { strength: 'good', message: 'Good PIN, but avoid sequential numbers for better security', color: 'text-orange-500' };
    }
    
    return { strength: 'strong', message: 'Strong PIN! Good choice.', color: 'text-green-500' };
  };

  const handlePinInput = (value: string, setter: (value: string) => void) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setter(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    if (isWeakPin(pin)) {
      toast.error('Please choose a stronger PIN');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate PIN creation process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('PIN created successfully!');
      onPinCreated(pin);
      onClose();
    } catch (error) {
      toast.error('Failed to create PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pinStrength = getPinStrength(pin);
  const isFormValid = pin.length === 4 && pin === confirmPin && !isWeakPin(pin);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Create Your PIN
          </DialogTitle>
          <DialogDescription>
            Welcome, {assistantName}! Set up your 4-digit PIN for {clinicName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pin">Create 4-Digit PIN</Label>
            <Input
              id="new-pin"
              type="password"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setPin)}
              placeholder="Enter 4 digits"
              maxLength={4}
              className="text-center text-lg tracking-widest"
            />
            {pin.length > 0 && (
              <div className={`flex items-center gap-1 text-sm ${pinStrength.color}`}>
                {pinStrength.strength === 'strong' ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {pinStrength.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              placeholder="Confirm 4 digits"
              maxLength={4}
              className="text-center text-lg tracking-widest"
            />
            {confirmPin.length === 4 && (
              <div className={`flex items-center gap-1 text-sm ${
                pin === confirmPin ? 'text-green-500' : 'text-destructive'
              }`}>
                {pin === confirmPin ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    PINs match
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    PINs do not match
                  </>
                )}
              </div>
            )}
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-2">PIN Security Tips:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Avoid common combinations (1234, 0000, etc.)</li>
                <li>• Don't use repetitive digits (1111, 2222)</li>
                <li>• Choose numbers that aren't easily guessed</li>
                <li>• Remember your PIN - it can't be recovered</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create PIN
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}