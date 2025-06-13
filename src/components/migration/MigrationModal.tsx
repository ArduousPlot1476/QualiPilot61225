import React, { useState } from 'react';
import { X, Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { DataMigrationService } from '../../lib/migration/dataMigration';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationComplete: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationComplete
}) => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    try {
      setMigrationStatus('migrating');
      setError(null);
      
      const result = await DataMigrationService.migrateToSupabase();
      setMigrationResult(result);
      
      if (result.success) {
        setMigrationStatus('completed');
        setTimeout(() => {
          onMigrationComplete();
          onClose();
        }, 2000);
      } else {
        setMigrationStatus('error');
        setError(result.errors.join(', '));
      }
    } catch (error) {
      setMigrationStatus('error');
      setError(error instanceof Error ? error.message : 'Migration failed');
    }
  };

  const handleSkip = () => {
    // Mark migration as completed to prevent showing again
    localStorage.setItem('qualipilot_migration_status', 'skipped');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Data Migration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {migrationStatus === 'idle' && (
            <>
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">
                    Migrate Your Data to Supabase
                  </h3>
                  <p className="text-sm text-slate-600">
                    We've detected existing data in your browser storage. Would you like to migrate 
                    it to Supabase for better performance and synchronization across devices?
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-slate-900 mb-2">What will be migrated:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Conversation threads and messages</li>
                  <li>• Generated documents and templates</li>
                  <li>• Regulatory source references</li>
                  <li>• User preferences and settings</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleMigration}
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
                >
                  Migrate Data
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Skip
                </button>
              </div>
            </>
          )}

          {migrationStatus === 'migrating' && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">Migrating Your Data</h3>
              <p className="text-sm text-slate-600">
                Please wait while we transfer your data to Supabase. This may take a few moments.
              </p>
            </div>
          )}

          {migrationStatus === 'completed' && (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">Migration Completed!</h3>
              <p className="text-sm text-slate-600 mb-4">
                Your data has been successfully migrated to Supabase.
              </p>
              {migrationResult && (
                <div className="bg-green-50 rounded-lg p-3 text-sm">
                  <div className="text-green-800">
                    • {migrationResult.migratedThreads} threads migrated
                  </div>
                  <div className="text-green-800">
                    • {migrationResult.migratedMessages} messages migrated
                  </div>
                  <div className="text-green-800">
                    • {migrationResult.migratedDocuments} documents migrated
                  </div>
                </div>
              )}
            </div>
          )}

          {migrationStatus === 'error' && (
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">Migration Failed</h3>
              <p className="text-sm text-slate-600 mb-4">
                There was an error migrating your data. You can try again or continue without migration.
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={handleMigration}
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};