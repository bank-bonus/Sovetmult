import React, { useEffect, useRef } from 'react';
import { LoadingScreenData } from '../types';

interface GeneratedPreviewProps {
  data: LoadingScreenData;
}

const GeneratedPreview: React.FC<GeneratedPreviewProps> = ({ data }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; background: #000; overflow: hidden; font-family: sans-serif; }
                ${data.css}
              </style>
            </head>
            <body>
              ${data.html}
              <script>
                try {
                  ${data.js}
                } catch(e) {
                  console.error("Preview script error:", e);
                }
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [data]);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden border border-slate-700 shadow-xl">
      <iframe 
        ref={iframeRef}
        title="Loading Screen Preview"
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default GeneratedPreview;
