import React from 'react';
import { ExternalLink, FileText, Scale } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple markdown parsing for regulatory content
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={elements.length} className="list-disc list-inside space-y-1 my-3 ml-4 text-slate-700 dark:text-slate-300">
            {currentList.map((item, index) => (
              <li key={index}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <div key={elements.length} className="my-4">
            <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden">
              {codeBlockLanguage && (
                <div className="bg-slate-800 dark:bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 dark:text-slate-400 border-b border-slate-700 dark:border-slate-800">
                  {getLanguageLabel(codeBlockLanguage)}
                </div>
              )}
              <pre className="p-4 text-sm text-green-400 dark:text-green-300 overflow-x-auto">
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            </div>
          </div>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
      }
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle lists
      if (line.match(/^[\s]*[•\-\*]\s/)) {
        currentList.push(line.replace(/^[\s]*[•\-\*]\s/, ''));
        return;
      }

      // Handle numbered lists
      if (line.match(/^[\s]*\d+\.\s/)) {
        currentList.push(line.replace(/^[\s]*\d+\.\s/, ''));
        return;
      }

      flushList();

      // Handle headings
      if (line.startsWith('###')) {
        elements.push(
          <h3 key={elements.length} className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
            {parseInlineMarkdown(line.slice(3).trim())}
          </h3>
        );
      } else if (line.startsWith('##')) {
        elements.push(
          <h2 key={elements.length} className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3">
            {parseInlineMarkdown(line.slice(2).trim())}
          </h2>
        );
      } else if (line.startsWith('#')) {
        elements.push(
          <h1 key={elements.length} className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-4">
            {parseInlineMarkdown(line.slice(1).trim())}
          </h1>
        );
      } else if (line.trim() === '') {
        // Empty line - add spacing
        if (elements.length > 0) {
          elements.push(<div key={elements.length} className="h-2" />);
        }
      } else {
        // Regular paragraph
        elements.push(
          <p key={elements.length} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    });

    flushList();
    flushCodeBlock();

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle regulatory citations [RegCode§Section]
    text = text.replace(/\[([^\]]+§[^\]]+)\]/g, (match, citation) => {
      return `<cite class="regulatory-citation">${citation}</cite>`;
    });

    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle inline code
    text = text.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="external-link">$1</a>');

    return (
      <span
        dangerouslySetInnerHTML={{ __html: text }}
        className="markdown-content"
      />
    );
  };

  const getLanguageLabel = (language: string): string => {
    const labels: { [key: string]: string } = {
      'regulatory': 'Regulatory Text',
      'legal': 'Legal Citation',
      'compliance': 'Compliance Procedure',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'sql': 'SQL'
    };
    return labels[language.toLowerCase()] || language.toUpperCase();
  };

  return (
    <div className="markdown-renderer">
      <style jsx>{`
        .markdown-content .regulatory-citation {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          font-style: normal;
          display: inline-flex;
          align-items: center;
          margin: 0 2px;
        }
        
        .markdown-content .regulatory-citation:before {
          content: "§";
          margin-right: 4px;
          font-weight: bold;
        }
        
        .markdown-content .inline-code {
          background: #f1f5f9;
          color: #475569;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }
        
        .markdown-content .external-link {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-color: #93c5fd;
          text-underline-offset: 2px;
        }
        
        .markdown-content .external-link:hover {
          color: #1d4ed8;
          text-decoration-color: #2563eb;
        }
        
        .markdown-content strong {
          font-weight: 600;
          color: #1e293b;
        }
        
        .markdown-content em {
          font-style: italic;
          color: #475569;
        }

        @media (prefers-color-scheme: dark) {
          .markdown-content .inline-code {
            background: #1e293b;
            color: #e2e8f0;
          }
          
          .markdown-content .external-link {
            color: #3b82f6;
            text-decoration-color: #1d4ed8;
          }
          
          .markdown-content .external-link:hover {
            color: #60a5fa;
            text-decoration-color: #3b82f6;
          }
          
          .markdown-content strong {
            color: #f1f5f9;
          }
          
          .markdown-content em {
            color: #cbd5e1;
          }
        }
      `}</style>
      
      <div className="space-y-2">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};