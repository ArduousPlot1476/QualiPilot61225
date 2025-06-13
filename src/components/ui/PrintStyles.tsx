import React from 'react';

export const PrintStyles: React.FC = () => {
  return (
    <style jsx global>{`
      @media print {
        /* Hide non-printable elements */
        nav, 
        header, 
        footer, 
        button:not(.print-visible),
        .sidebar,
        .context-drawer,
        .message-input,
        .system-status-bar,
        .non-printable {
          display: none !important;
        }
        
        /* Ensure content is visible */
        body, html {
          background-color: white !important;
          font-size: 12pt !important;
          color: black !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Adjust layout for printing */
        .print-container {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        
        /* Improve typography for print */
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
          color: black !important;
        }
        
        h1 { font-size: 24pt !important; }
        h2 { font-size: 20pt !important; }
        h3 { font-size: 16pt !important; }
        h4 { font-size: 14pt !important; }
        h5, h6 { font-size: 12pt !important; }
        
        p, li {
          font-size: 12pt !important;
          line-height: 1.5 !important;
          color: black !important;
        }
        
        /* Ensure proper page breaks */
        .page-break-before {
          page-break-before: always !important;
        }
        
        .page-break-after {
          page-break-after: always !important;
        }
        
        .avoid-break {
          page-break-inside: avoid !important;
        }
        
        /* Show URLs for links */
        a[href]:after {
          content: " (" attr(href) ")" !important;
          font-size: 90% !important;
          color: #555 !important;
        }
        
        /* Don't show URLs for internal links */
        a[href^="#"]:after,
        a[href^="javascript:"]:after {
          content: "" !important;
        }
        
        /* Expand all content to be visible */
        .truncate,
        .line-clamp-2,
        .line-clamp-3 {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          display: block !important;
          -webkit-line-clamp: unset !important;
        }
        
        /* Ensure tables print well */
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        table, th, td {
          border: 1px solid #ddd !important;
        }
        
        th, td {
          padding: 8px !important;
          text-align: left !important;
        }
        
        /* Add document metadata */
        @page {
          size: auto;
          margin: 0.5in;
        }
        
        @page :first {
          margin-top: 1in;
        }
      }
    `}</style>
  );
};

export const PrintableContainer: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className = '' }) => {
  // Add document title when printing
  React.useEffect(() => {
    if (title) {
      const originalTitle = document.title;
      
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addEventListener('change', (mql) => {
        if (mql.matches) {
          document.title = title;
        } else {
          document.title = originalTitle;
        }
      });
      
      return () => {
        document.title = originalTitle;
      };
    }
  }, [title]);

  return (
    <div className={`print-container ${className}`}>
      <PrintStyles />
      {children}
    </div>
  );
};

export const PrintButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className={`print-button print-visible ${className}`}
      aria-label="Print this page"
    >
      Print
    </button>
  );
};