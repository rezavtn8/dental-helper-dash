import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PinChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isFirstTime?: boolean;
}

const PinChangeDialog: React.FC<PinChangeDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  isFirstTime = false 
}) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isFirstTime && !currentPin) {
      setError('Current PIN is required');
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('New PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and confirmation do not match');
      return;
    }

    if (!isFirstTime && currentPin === newPin) {
      setError('New PIN must be different from current PIN');
      return;
    }

    setLoading(true);

    try {
      // Call the database function to update PIN
      const { data, error } = await supabase.rpc('update_user_pin', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        new_pin: newPin
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "PIN Updated Successfully",
          description: isFirstTime 
            ? "Your secure PIN has been set. Please remember it for future logins."
            : "Your PIN has been changed successfully."
        });

        // Reset form
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to update PIN');
      }
    } catch (error: any) {
      console.error('Error updating PIN:', error);
      setError(error.message || 'Failed to update PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setShowPins(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>{isFirstTime ? 'Set Your Secure PIN' : 'Change Your PIN'}</span>
          </DialogTitle>
          <DialogDescription>
            {isFirstTime 
              ? 'Please set a secure 4-digit PIN for your account. You\'ll use this to log in to the system.'
              : 'Enter your current PIN and choose a new 4-digit PIN.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isFirstTime && (
            <div className="space-y-2">
              <Label htmlFor="current-pin">Current PIN</Label>
              <div className="relative">
                <Input
                  id="current-pin"
                  type={showPins ? "text" : "password"}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter current PIN"
                  maxLength={4}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPins(!showPins)}
                >
                  {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <div className="relative">
              <Input
                id="new-pin"
                type={showPins ? "text" : "password"}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter new 4-digit PIN"
                maxLength={4}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPins(!showPins)}
              >
                {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              type={showPins ? "text" : "password"}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Confirm new 4-digit PIN"
              maxLength={4}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Security Tips:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Choose a PIN that others can't easily guess</li>
              <li>• Don't use obvious numbers (1234, 0000, etc.)</li>
              <li>• Keep your PIN confidential</li>
              <li>• You can change it anytime in settings</li>
            </ul>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Updating...' : isFirstTime ? 'Set PIN' : 'Update PIN'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinChangeDialog;