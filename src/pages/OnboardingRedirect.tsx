import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OnboardingRedirect: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showSkipOption, setShowSkipOption] = useState(false);

  useEffect(() => {
    // Check if user has completed regulatory profile
    const checkProfile = async () => {
      try {
        setIsLoading(true);
        
        // Wait a moment to ensure profile is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const hasCompletedOnboarding = userProfile?.company_info?.onboarding_completed || 
                                      userProfile?.regulatory_profile_completed;
        
        if (hasCompletedOnboarding) {
          // User has completed onboarding, redirect to dashboard
          navigate('/dashboard');
        } else {
          // User needs to complete onboarding
          setIsLoading(false);
          
          // Show skip option after 5 seconds
          setTimeout(() => {
            setShowSkipOption(true);
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setIsLoading(false);
        
        // If there's an error, still show skip option immediately
        setShowSkipOption(true);
      }
    };
    
    if (user) {
      checkProfile();
    } else {
      // If no user, redirect to login
      navigate('/auth/login');
    }
  }, [user, userProfile, navigate]);

  const handleStartOnboarding = () => {
    navigate('/onboarding');
  };

  const handleSkipOnboarding = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full opacity-30 animate-pulse"></div>
            <Loader2 className="h-20 w-20 text-teal-600 dark:text-teal-500 animate-spin absolute inset-0" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Checking your profile...</h2>
          <p className="text-slate-600 dark:text-slate-300">
            We're preparing your QualiPilot experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-6">
          <div className="bg-teal-100 dark:bg-teal-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Complete Your Regulatory Profile
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            To get the most out of QualiPilot, we need to understand your medical device and regulatory needs.
          </p>
        </div>

        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-6 border border-teal-100 dark:border-teal-900/50">
          <h3 className="font-medium text-teal-800 dark:text-teal-300 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Why complete the onboarding?
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-teal-700 dark:text-teal-400">
            <li className="flex items-start">
              <div className="mr-2">•</div>
              <div>Get a customized compliance roadmap for your device</div>
            </li>
            <li className="flex items-start">
              <div className="mr-2">•</div>
              <div>Receive relevant regulatory alerts and updates</div>
            </li>
            <li className="flex items-start">
              <div className="mr-2">•</div>
              <div>Generate device-specific documentation</div>
            </li>
          </ul>
        </div>

        <Button 
          className="w-full mb-4" 
          size="lg"
          onClick={handleStartOnboarding}
        >
          Start Regulatory Onboarding
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {showSkipOption && (
          <div className="text-center">
            <button 
              onClick={handleSkipOnboarding}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
            >
              Skip for now (you can complete this later)
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          This will take approximately 5-10 minutes to complete
        </div>
      </div>
    </div>
  );
};

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}