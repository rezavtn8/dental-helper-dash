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
  Info,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

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
      
      toast.success('PIN Updated Successfully! 🎉', {
        description: 'Your new PIN is now active. Please remember it for future logins.'
      });
      
      // Reset form
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setErrors({});
      
    } catch (error) {
      toast.error('Failed to Update PIN', {
        description: 'Please check your current PIN and try again.'
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
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-teal-900 mb-3">Change PIN</h1>
        <p className="text-teal-600 text-lg">Update your secure 4-digit PIN for enhanced security</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Security Info */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-3 text-lg">PIN Security Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Use a unique 4-digit PIN that's not easily guessed
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Avoid simple patterns like 1234 or repeated digits like 1111
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Never share your PIN with anyone
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Change your PIN regularly for better security
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Change Form */}
        <Card className="shadow-xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
            <CardTitle className="flex items-center text-teal-900">
              <Lock className="w-6 h-6 mr-3 text-teal-600" />
              Update Your PIN
            </CardTitle>
            <CardDescription className="text-teal-700">
              Enter your current PIN and choose a new secure PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current PIN */}
              <div className="space-y-3">
                <Label htmlFor="current-pin" className="text-base font-semibold text-teal-900">
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
                    className={`text-center text-2xl tracking-widest h-16 border-2 rounded-xl font-bold ${
                      errors.currentPin 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-600 hover:bg-teal-100"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
              <div className="space-y-3">
                <Label htmlFor="new-pin" className="text-base font-semibold text-teal-900">
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
                    className={`text-center text-2xl tracking-widest h-16 border-2 rounded-xl font-bold ${
                      errors.newPin 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                    }`}
                  />
                </div>
                
                {/* PIN Strength Indicator */}
                {newPin && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-teal-700">PIN Strength:</span>
                      <Badge 
                        variant="outline" 
                        className={`font-semibold ${
                          pinStrength.strength <= 25 ? 'border-red-300 text-red-700 bg-red-50' :
                          pinStrength.strength <= 50 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                          pinStrength.strength <= 75 ? 'border-blue-300 text-blue-700 bg-blue-50' :
                          'border-green-300 text-green-700 bg-green-50'
                        }`}
                      >
                        {pinStrength.strength >= 75 && <Zap className="w-3 h-3 mr-1" />}
                        {pinStrength.label}
                      </Badge>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={pinStrength.strength} 
                        className="h-3 bg-gray-200"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${pinStrength.color}`}
                        style={{ width: `${pinStrength.strength}%` }}
                      />
                    </div>
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
              <div className="space-y-3">
                <Label htmlFor="confirm-pin" className="text-base font-semibold text-teal-900">
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
                    className={`text-center text-2xl tracking-widest h-16 border-2 rounded-xl font-bold ${
                      errors.confirmPin 
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : confirmPin && confirmPin === newPin 
                          ? 'border-green-300 focus:border-green-500 bg-green-50'
                          : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                    }`}
                  />
                  {confirmPin && confirmPin === newPin && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
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
                    <span className="font-medium">PINs match perfectly!</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !currentPin || !newPin || !confirmPin}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl shadow-lg shadow-teal-500/25 touch-target"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Updating PIN...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5 mr-3" />
                    Update PIN
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="mt-8 shadow-lg border-2 border-gray-200 bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center text-teal-900">
              <Shield className="w-6 h-6 mr-3 text-teal-600" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">PIN is encrypted and secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">Failed attempts are monitored</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">PIN locks after multiple failures</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">Regular PIN updates recommended</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}