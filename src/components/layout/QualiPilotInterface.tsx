import React from 'react';

export const QualiPilotInterface: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen bg-slate-50 overflow-hidden">
      {children}
    </div>
  );
};