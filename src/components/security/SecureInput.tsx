import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { sanitizeAndValidateInput, sanitizeText, sanitizeEmail, sanitizeClinicCode, isValidEmail, isValidClinicCode } from '@/utils/sanitize';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface SecureInputProps {
  type: 'email' | 'clinic_code' | 'name' | 'phone' | 'text';
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  validateOnServer?: boolean;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type,
  label,
  value,
  onChange,
  onValidation,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validateOnServer = false,
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  // Client-side validation
  const validateClientSide = (inputValue: string): { valid: boolean; error?: string } => {
    if (!inputValue && required) {
      return { valid: false, error: 'This field is required' };
    }

    if (!inputValue) {
      return { valid: true };
    }

    switch (type) {
      case 'email':
        if (!isValidEmail(inputValue)) {
          return { valid: false, error: 'Please enter a valid email address' };
        }
        break;
      case 'clinic_code':
        if (!isValidClinicCode(inputValue)) {
          return { valid: false, error: 'Clinic code must be 4-10 alphanumeric characters' };
        }
        break;
      case 'name':
        if (inputValue.length < 2) {
          return { valid: false, error: 'Name must be at least 2 characters long' };
        }
        if (inputValue.length > 100) {
          return { valid: false, error: 'Name must be less than 100 characters' };
        }
        break;
      case 'phone':
        if (inputValue.length > 20) {
          return { valid: false, error: 'Phone number is too long' };
        }
        break;
    }

    return { valid: true };
  };

  // Server-side validation
  const validateServerSide = async (inputValue: string) => {
    if (!validateOnServer || !inputValue) return;

    setIsValidating(true);
    try {
      const result = await sanitizeAndValidateInput(type, inputValue);
      setIsValid(result.isValid);
      setError(result.error || '');
      onValidation?.(result.isValid, result.error);
    } catch (err) {
      setIsValid(false);
      setError('Validation failed');
      onValidation?.(false, 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let sanitizedValue = e.target.value;

    // Apply client-side sanitization
    switch (type) {
      case 'email':
        sanitizedValue = sanitizeEmail(sanitizedValue);
        break;
      case 'clinic_code':
        sanitizedValue = sanitizeClinicCode(sanitizedValue);
        break;
      case 'name':
      case 'text':
        sanitizedValue = sanitizeText(sanitizedValue);
        break;
      case 'phone':
        sanitizedValue = sanitizedValue.replace(/[^0-9+\-\(\)\s]/g, '').substring(0, 20);
        break;
    }

    onChange(sanitizedValue);

    // Client-side validation
    const clientValidation = validateClientSide(sanitizedValue);
    setIsValid(clientValidation.valid);
    setError(clientValidation.error || '');
    onValidation?.(clientValidation.valid, clientValidation.error);
  };

  // Debounced server-side validation
  useEffect(() => {
    if (validateOnServer) {
      const timer = setTimeout(() => {
        validateServerSide(value);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, validateOnServer]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />;
    }
    if (isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (isValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getInputType = () => {
    switch (type) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      default: return 'text';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`secure-input-${type}`} className="flex items-center gap-2">
        {label}
        {required && <Badge variant="secondary" className="text-xs">Required</Badge>}
      </Label>
      
      <div className="relative">
        <Input
          id={`secure-input-${type}`}
          type={getInputType()}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${
            isValid === false ? 'border-red-500 focus:border-red-500' : 
            isValid === true ? 'border-green-500 focus:border-green-500' : ''
          }`}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {validateOnServer && (
        <p className="text-xs text-muted-foreground">
          This field is validated securely on our servers
        </p>
      )}
    </div>
  );
};