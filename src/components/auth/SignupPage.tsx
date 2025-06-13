import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Eye, EyeOff, Mail, Lock, Shield, Building, Users, MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
];

const INDUSTRY_TYPES = [
  { value: 'medical_devices', label: 'Medical Devices' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'biotechnology', label: 'Biotechnology' },
  { value: 'diagnostics', label: 'In Vitro Diagnostics' },
  { value: 'digital_health', label: 'Digital Health' },
  { value: 'medical_software', label: 'Medical Software (SaMD)' },
  { value: 'combination_products', label: 'Combination Products' },
  { value: 'consulting', label: 'Regulatory Consulting' },
  { value: 'other', label: 'Other' }
];

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companySize: '',
    industryType: '',
    businessAddress: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const { signUp, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/\d/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('one special character');
    return errors;
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Company information validation
    if (!formData.companyName) {
      errors.companyName = 'Company name is required';
    }

    if (!formData.companySize) {
      errors.companySize = 'Please select company size';
    }

    if (!formData.industryType) {
      errors.industryType = 'Please select industry type';
    }

    if (!formData.businessAddress) {
      errors.businessAddress = 'Business address is required';
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms of service';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const companyInfo = {
        company_name: formData.companyName,
        company_size: formData.companySize,
        industry_type: formData.industryType,
        business_address: formData.businessAddress
      };

      await signUp(formData.email, formData.password, companyInfo);
      
      // Show success message and redirect
      navigate('/auth/signup-success');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = formData.password ? validatePassword(formData.password) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Join QualiPilot
          </h2>
          <p className="text-slate-600">
            Create your medical device compliance account
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Sign up failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          passwordStrength.length <= 4 - level
                            ? passwordStrength.length === 0
                              ? 'bg-green-500'
                              : passwordStrength.length <= 2
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.length > 0 && (
                    <p className="text-xs text-slate-600">
                      Password needs: {passwordStrength.join(', ')}
                    </p>
                  )}
                </div>
              )}
              
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Company Information Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Company Information</h3>
              
              {/* Company Name */}
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.companyName 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    placeholder="Enter your company name"
                  />
                </div>
                {validationErrors.companyName && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.companyName}</p>
                )}
              </div>

              {/* Company Size */}
              <div className="mb-4">
                <label htmlFor="companySize" className="block text-sm font-medium text-slate-700 mb-2">
                  Company Size *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      validationErrors.companySize 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <option value="">Select company size</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.companySize && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.companySize}</p>
                )}
              </div>

              {/* Industry Type */}
              <div className="mb-4">
                <label htmlFor="industryType" className="block text-sm font-medium text-slate-700 mb-2">
                  Industry Type *
                </label>
                <select
                  id="industryType"
                  name="industryType"
                  value={formData.industryType}
                  onChange={(e) => handleInputChange('industryType', e.target.value)}
                  className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.industryType 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <option value="">Select industry type</option>
                  {INDUSTRY_TYPES.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
                {validationErrors.industryType && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.industryType}</p>
                )}
              </div>

              {/* Business Address */}
              <div className="mb-4">
                <label htmlFor="businessAddress" className="block text-sm font-medium text-slate-700 mb-2">
                  Business Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea
                    id="businessAddress"
                    name="businessAddress"
                    rows={3}
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      validationErrors.businessAddress 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    placeholder="Enter your business address"
                  />
                </div>
                {validationErrors.businessAddress && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.businessAddress}</p>
                )}
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-slate-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
                {validationErrors.acceptTerms && (
                  <p className="mt-1 text-red-600">{validationErrors.acceptTerms}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in to QualiPilot
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};