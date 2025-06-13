import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

export const SignupSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-slate-600">
            Welcome to QualiPilot - your medical device compliance platform
          </p>
        </div>

        {/* Success Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center space-y-6">
            {/* Email Verification Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Check Your Email
              </h3>
              <p className="text-sm text-blue-700">
                We've sent you a confirmation email. Please click the link in the email to verify your account and complete the setup process.
              </p>
            </div>

            {/* Next Steps */}
            <div className="text-left">
              <h3 className="text-lg font-medium text-slate-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Verify your email</p>
                    <p className="text-xs text-slate-600">Click the confirmation link we sent you</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Complete your profile</p>
                    <p className="text-xs text-slate-600">Add additional company details and preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Start using QualiPilot</p>
                    <p className="text-xs text-slate-600">Begin managing your regulatory compliance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Link
                to="/auth/login"
                className="w-full inline-flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <p className="text-xs text-slate-500">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4 text-center">
            What You Can Do with QualiPilot
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">AI-Powered Compliance Assistant</p>
                <p className="text-xs text-slate-600">Get instant answers to regulatory questions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Document Generation</p>
                <p className="text-xs text-slate-600">Create QMS documents and templates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Regulatory Updates</p>
                <p className="text-xs text-slate-600">Stay current with FDA, ISO, and EU MDR changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};