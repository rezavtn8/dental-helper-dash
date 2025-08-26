import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Lock,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ChangePinTab() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPin?: string;
    newPin?: string;
    confirmPin?: string;
  }>({});

  // PIN strength calculation
  const getPinStrength = (pin: string) => {
    if (pin.length === 0) return { strength: 0, label: '', color: '' };
    if (pin.length < 4) return { strength: 25, label: 'Too Short', color: 'bg-red-500' };
    
    let strength = 0;
    const hasRepeating = /(\d)\1{2,}/.test(pin); // 3+ repeated digits
    const isSequential = /0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(pin);
    const isCommonPin = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '0123', '4321'].includes(pin);
    
    if (pin.length >= 4) strength += 25;
    if (pin.length >= 5) strength += 25;
    if (!hasRepeating) strength += 25;
    if (!isSequential && !isCommonPin) strength += 25;
    
    if (strength <= 25) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 75) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const pinStrength = getPinStrength(newPin);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!currentPin) {
      newErrors.currentPin = 'Current PIN is required';
    } else if (currentPin.length !== 4) {
      newErrors.currentPin = 'PIN must be 4 digits';
    }
    
    if (!newPin) {
      newErrors.newPin = 'New PIN is required';
    } else if (newPin.length !== 4) {
      newErrors.newPin = 'PIN must be 4 digits';
    } else if (newPin === currentPin) {
      newErrors.newPin = 'New PIN must be different from current PIN';
    } else if (pinStrength.strength < 50) {
      newErrors.newPin = 'PIN is too weak. Avoid common patterns.';
    }
    
    if (!confirmPin) {
      newErrors.confirmPin = 'Please confirm your new PIN';
    } else if (confirmPin !== newPin) {
      newErrors.confirmPin = 'PINs do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate API call - in real app, this would call the update_user_pin function
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "PIN Updated Successfully! 🎉",
        description: "Your new PIN is now active. Please remember it for future logins.",
      });
      
      // Reset form
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setErrors({});
      
    } catch (error) {
      toast({
        title: "Failed to Update PIN",
        description: "Please check your current PIN and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (value: string, setter: (value: string) => void) => {
    // Only allow digits and limit to 4 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setter(numericValue);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Change PIN</h2>
        <p className="text-gray-600 text-lg">Update your secure 4-digit PIN</p>
      </div>

      <div className="max-w-2xl">
        {/* Security Info */}
        <Card className="shadow-sm border-blue-200 bg-blue-50/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">PIN Security Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a unique 4-digit PIN that's not easily guessed</li>
                  <li>• Avoid simple patterns like 1234 or repeated digits like 1111</li>
                  <li>• Don't share your PIN with anyone</li>
                  <li>• Change your PIN regularly for better security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Change Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-teal-600" />
              Update Your PIN
            </CardTitle>
            <CardDescription>
              Enter your current PIN and choose a new secure PIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current PIN */}
              <div className="space-y-2">
                <Label htmlFor="current-pin" className="text-base font-medium">
                  Current PIN
                </Label>
                <div className="relative">
                  <Input
                    id="current-pin"
                    type={showPins ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => handlePinInput(e.target.value, setCurrentPin)}
                    placeholder="••••"
                    maxLength={4}
                    className={`text-center text-xl tracking-widest h-14 ${
                      errors.currentPin ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.currentPin && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.currentPin}</span>
                  </div>
                )}
              </div>

              {/* New PIN */}
              <div className="space-y-2">
                <Label htmlFor="new-pin" className="text-base font-medium">
                  New PIN
                </Label>
                <div className="relative">
                  <Input
                    id="new-pin"
                    type={showPins ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => handlePinInput(e.target.value, setNewPin)}
                    placeholder="••••"
                    maxLength={4}
                    className={`text-center text-xl tracking-widest h-14 ${
                      errors.newPin ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                </div>
                
                {/* PIN Strength Indicator */}
                {newPin && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">PIN Strength:</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          pinStrength.strength <= 25 ? 'border-red-300 text-red-700' :
                          pinStrength.strength <= 50 ? 'border-yellow-300 text-yellow-700' :
                          pinStrength.strength <= 75 ? 'border-blue-300 text-blue-700' :
                          'border-green-300 text-green-700'
                        }`}
                      >
                        {pinStrength.label}
                      </Badge>
                    </div>
                    <Progress 
                      value={pinStrength.strength} 
                      className="h-2"
                      // @ts-ignore - custom CSS class
                      indicatorClassName={pinStrength.color}
                    />
                  </div>
                )}
                
                {errors.newPin && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.newPin}</span>
                  </div>
                )}
              </div>

              {/* Confirm PIN */}
              <div className="space-y-2">
                <Label htmlFor="confirm-pin" className="text-base font-medium">
                  Confirm New PIN
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-pin"
                    type={showPins ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                    placeholder="••••"
                    maxLength={4}
                    className={`text-center text-xl tracking-widest h-14 ${
                      errors.confirmPin ? 'border-red-300 focus:border-red-500' : ''
                    } ${
                      confirmPin && confirmPin === newPin ? 'border-green-300 focus:border-green-500' : ''
                    }`}
                  />
                  {confirmPin && confirmPin === newPin && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.confirmPin && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPin}</span>
                  </div>
                )}
                {confirmPin && confirmPin === newPin && !errors.confirmPin && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PINs match</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !currentPin || !newPin || !confirmPin}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating PIN...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Update PIN
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Shield className="w-5 h-5 mr-2 text-teal-600" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">PIN is encrypted and secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Failed attempts are monitored</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">PIN locks after multiple failures</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Regular PIN updates recommended</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}