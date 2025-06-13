import React from 'react';
import { TransitionWrapper } from '../ui/TransitionWrapper';

interface QuickRepliesProps {
  onQuickReply: (reply: string) => void;
  visible?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ onQuickReply, visible = true }) => {
  const quickReplies = [
    'Explain ISO 13485 requirements',
    'Generate Risk Management Plan',
    'Create Design Control SOP',
    'FDA 510(k) checklist',
    'EU MDR compliance guide',
    'Quality Manual template',
    'Clinical evaluation requirements',
    'Post-market surveillance plan'
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
      <div className="px-6 py-3 border-t border-slate-200 bg-white">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onQuickReply(reply)}
              className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200 focus-ring hover-scale"
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