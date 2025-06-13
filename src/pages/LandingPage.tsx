import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Shield, CheckCircle, FileText, Search, ArrowRight, BarChart3, Users, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0 bg-grid-slate-300 dark:bg-grid-slate-700 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        </div>

        <div className="container mx-auto px-6 pt-16 pb-24 relative z-10">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-teal-600 dark:text-teal-500" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">QualiPilot</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/auth/login" className="text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium">
                Sign In
              </Link>
              <Link to="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                AI-Powered <span className="text-teal-600 dark:text-teal-500">Medical Device</span> Regulatory Compliance
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Navigate FDA regulations with confidence using our AI assistant, document generation, and real-time compliance tracking.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Button size="lg" onClick={() => navigate('/auth/signup')}>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur opacity-30 dark:opacity-40 animate-pulse"></div>
              <div className="relative bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center">
                  <Bot className="h-5 w-5 text-teal-600 dark:text-teal-500 mr-2" />
                  <span className="font-medium text-slate-900 dark:text-white">QualiPilot Assistant</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-2 flex-shrink-0">
                      <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-slate-700 dark:text-slate-300 text-sm">
                      What are the key requirements for FDA 510(k) submission for a Class II medical device?
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-teal-600 dark:bg-teal-700 rounded-full p-2 flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-700 dark:text-slate-300 text-sm">
                      <p className="mb-2">For FDA 510(k) submission of Class II medical devices, you need to demonstrate substantial equivalence to a predicate device. Key requirements include:</p>
                      <ul className="list-disc list-inside space-y-1 pl-1">
                        <li>Device description and intended use</li>
                        <li>Substantial equivalence comparison</li>
                        <li>Performance data and testing results</li>
                        <li>Labeling and packaging information</li>
                        <li>Quality System Regulation compliance</li>
                      </ul>
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          <span className="font-medium">21 CFR 807.87 - Content requirements</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Comprehensive Regulatory Compliance Platform</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to navigate the complex world of medical device regulations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-teal-100 dark:bg-teal-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Bot className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI Regulatory Assistant</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Get instant, accurate answers to your regulatory questions with proper citations to FDA regulations and guidance documents.
              </p>
              <ul className="space-y-2">
                {['Real-time FDA guidance', 'Regulatory citations', 'Compliance recommendations'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Document Generation</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Create FDA-compliant regulatory documents tailored to your specific device and regulatory pathway.
              </p>
              <ul className="space-y-2">
                {['QMS documentation', '510(k) templates', 'Risk management files'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Search className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Regulatory Intelligence</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Stay updated with the latest FDA regulations and guidance documents with our real-time monitoring system.
              </p>
              <ul className="space-y-2">
                {['eCFR integration', 'Change monitoring', 'Semantic search'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-100 dark:bg-amber-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Compliance Tracking</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Monitor your regulatory compliance status and get alerts when action is needed to maintain compliance.
              </p>
              <ul className="space-y-2">
                {['Compliance dashboard', 'Automated alerts', 'Audit trail'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 dark:bg-green-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Analytics & Reporting</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Gain insights into your regulatory activities and track progress toward compliance goals.
              </p>
              <ul className="space-y-2">
                {['Compliance metrics', 'Progress tracking', 'Custom reports'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Guidance Library</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Access a comprehensive library of FDA guidance documents, standards, and best practices.
              </p>
              <ul className="space-y-2">
                {['FDA guidance documents', 'ISO standards', 'Best practices'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How QualiPilot Works</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Our streamlined process helps you navigate regulatory compliance with ease
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-600 dark:bg-teal-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-4">Complete Onboarding</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Answer a few questions about your medical device to set up your regulatory profile and get a customized compliance roadmap.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-teal-500 dark:text-teal-400" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-600 dark:bg-teal-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-4">Generate Documents</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Use our AI-powered document generator to create FDA-compliant regulatory documents tailored to your device.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-teal-500 dark:text-teal-400" />
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-600 dark:bg-teal-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-4">Stay Compliant</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Monitor regulatory changes, get alerts, and use our AI assistant to answer your compliance questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Trusted by Medical Device Companies</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              See what our customers are saying about QualiPilot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    M
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">MedTech Innovations</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Class II Device Manufacturer</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "QualiPilot has transformed our regulatory compliance process. The AI assistant has saved us countless hours of research, and the document generator produces high-quality templates that our regulatory team can easily customize."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    B
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">BioSense Diagnostics</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">In Vitro Diagnostic Manufacturer</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "As a startup navigating FDA regulations for the first time, QualiPilot has been invaluable. The onboarding wizard helped us identify our regulatory pathway, and the compliance roadmap keeps us on track."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    H
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">HealthTech Solutions</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Software as Medical Device (SaMD)</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "The regulatory intelligence features keep us informed about FDA updates that affect our software. QualiPilot has become an essential part of our compliance strategy, helping us stay ahead of regulatory changes."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-800 dark:to-blue-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Simplify Your Regulatory Compliance?</h2>
          <p className="text-xl text-teal-100 dark:text-teal-200 max-w-3xl mx-auto mb-8">
            Join hundreds of medical device companies using QualiPilot to navigate FDA regulations with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-teal-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700"
              onClick={() => navigate('/auth/signup')}
            >
              Start Your Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 dark:border-slate-300 dark:text-slate-300 dark:hover:bg-white/5"
              onClick={() => navigate('/auth/login')}
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="text-teal-100 dark:text-teal-200 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-teal-500" />
                <span className="text-xl font-bold">QualiPilot</span>
              </div>
              <p className="text-slate-400 mb-4">
                AI-powered medical device regulatory compliance platform
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-teal-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-teal-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-teal-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-teal-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Case Studies</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Reviews</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Documentation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Guides</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Webinars</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-teal-500">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Privacy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-teal-500">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} QualiPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};