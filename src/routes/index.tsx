import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { lazyImport } from '../utils/lazyImport';

// Eagerly loaded components
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { QualiPilotInterface } from '../components/layout/QualiPilotInterface';
import { SystemStatusBar } from '../components/layout/SystemStatusBar';

// Lazy loaded components
const LoginPage = React.lazy(() => import('../components/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = React.lazy(() => import('../components/auth/SignupPage').then(module => ({ default: module.SignupPage })));
const ForgotPasswordPage = React.lazy(() => import('../components/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import('../components/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const SignupSuccessPage = React.lazy(() => import('../components/auth/SignupSuccessPage').then(module => ({ default: module.SignupSuccessPage })));
const LandingPage = React.lazy(() => import('../pages/LandingPage').then(module => ({ default: module.LandingPage })));
const OnboardingRedirect = React.lazy(() => import('../pages/OnboardingRedirect').then(module => ({ default: module.OnboardingRedirect })));
const TestAlertsPage = React.lazy(() => import('../pages/TestAlertsPage').then(module => ({ default: module.TestAlertsPage })));

// Lazy load feature modules
const ChatArea = lazyImport(() => import('../components/layout/ChatArea'), 'ChatArea');
const ConversationSidebar = lazyImport(() => import('../components/layout/ConversationSidebar'), 'ConversationSidebar');
const ContextDrawer = lazyImport(() => import('../components/layout/ContextDrawer'), 'ContextDrawer');
const RegulatoryWizard = lazyImport(() => import('../components/onboarding/RegulatoryWizard'), 'RegulatoryWizard');
const DocumentGenerator = lazyImport(() => import('../components/documents/DocumentGenerator'), 'DocumentGenerator');
const RegulatoryIntelligence = lazyImport(() => import('../components/regulatory/RegulatoryIntelligence'), 'RegulatoryIntelligence');
const ProfileSettings = lazyImport(() => import('../components/profile/ProfileSettings'), 'ProfileSettings');
const CompanySettings = lazyImport(() => import('../components/profile/CompanySettings'), 'CompanySettings');
const FileUploadPage = lazyImport(() => import('../pages/FileUploadPage'), 'FileUploadPage');

// Loading fallback with animation
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full opacity-30 animate-pulse"></div>
        <Loader2 className="h-20 w-20 text-teal-600 dark:text-teal-500 animate-spin absolute inset-0" />
      </div>
      <p className="text-slate-600 dark:text-slate-300 font-medium">Loading QualiPilot...</p>
    </div>
  </div>
);

// Layout components
const DashboardLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="flex h-[calc(100vh-3.5rem)] mt-14">
          <Suspense fallback={<PageLoader />}>
            <ConversationSidebar />
            <ChatArea />
            <ContextDrawer />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const OnboardingLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <RegulatoryWizard />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const DocumentGeneratorLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <DocumentGenerator />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const RegulatoryIntelligenceLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <RegulatoryIntelligence />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const ProfileSettingsLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <ProfileSettings />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const CompanySettingsLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <CompanySettings />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const FileUploadLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <FileUploadPage />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

const TestAlertsLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <QualiPilotInterface>
        <SystemStatusBar />
        <div className="h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <TestAlertsPage />
          </Suspense>
        </div>
      </QualiPilotInterface>
    </ProtectedRoute>
  );
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/signup-success" element={<SignupSuccessPage />} />
        
        {/* Onboarding Redirect */}
        <Route path="/welcome" element={<OnboardingRedirect />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/chat" element={<DashboardLayout />} />
        <Route path="/onboarding" element={<OnboardingLayout />} />
        <Route path="/documents" element={<DocumentGeneratorLayout />} />
        <Route path="/regulatory" element={<RegulatoryIntelligenceLayout />} />
        <Route path="/compliance" element={<DashboardLayout />} />
        <Route path="/settings/profile" element={<ProfileSettingsLayout />} />
        <Route path="/settings/company" element={<CompanySettingsLayout />} />
        <Route path="/upload" element={<FileUploadLayout />} />
        <Route path="/test-alerts" element={<TestAlertsLayout />} />
        
        {/* Default Redirects */}
        <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};