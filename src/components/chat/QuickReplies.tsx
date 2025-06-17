import React from 'react';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { useAuth } from '../auth/AuthProvider';

interface QuickRepliesProps {
  onQuickReply: (reply: string) => void;
  visible?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ onQuickReply, visible = true }) => {
  const { userProfile } = useAuth();
  
  // Get device name from user profile if available
  const deviceName = userProfile?.company_info?.device_info?.name || 'my medical device';
  
  // Personalized quick replies that reference the user's specific device
  const quickReplies = [
    `Explain ISO 13485 requirements for ${deviceName}`,
    `What are the key requirements for FDA 510(k) submission for ${deviceName}?`,
    `How do I classify ${deviceName}?`,
    `What is the difference between Class I, II, and III devices for ${deviceName}?`,
    `What documentation is needed for a PMA application for ${deviceName}?`,
    `Explain design controls for ${deviceName}`,
    `What are the QMS requirements for ${deviceName}?`,
    `How do I implement risk management per ISO 14971 for ${deviceName}?`
  ];

  if (!visible) return null;

  return (
    <TransitionWrapper
      show={visible}
      enter="transition-all duration-500"
      enterFrom="opacity-0 transform translate-y-4"
      enterTo="opacity-100 transform translate-y-0"
      leave="transition-all duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onQuickReply(reply)}
              className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200 focus-ring hover-scale"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </TransitionWrapper>
  );
};