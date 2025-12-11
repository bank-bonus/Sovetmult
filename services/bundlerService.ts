import { LoadingScreenData, UploadedFile } from "../types";
import { readFileAsDataURL, readFileAsText } from "../utils/fileUtils";

export const bundleGame = async (
  files: UploadedFile[],
  mainEntryFile: UploadedFile,
  loadingScreen: LoadingScreenData
): Promise<string> => {
  
  // 1. Parse the main HTML file
  const parser = new DOMParser();
  const originalHtmlContent = await readFileAsText(mainEntryFile.file);
  const doc = parser.parseFromString(originalHtmlContent, 'text/html');

  // 2. Inline Styles (CSS)
  const linkTags = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
  for (const link of linkTags) {
    const href = link.getAttribute('href');
    if (href) {
      // Find matching file (naive match by name)
      const fileName = href.split('/').pop();
      const cssFile = files.find(f => f.name === fileName);
      if (cssFile) {
        const cssContent = await readFileAsText(cssFile.file);
        const styleTag = doc.createElement('style');
        styleTag.textContent = cssContent;
        link.replaceWith(styleTag);
      }
    }
  }

  // 3. Inline Scripts (JS)
  const scriptTags = Array.from(doc.querySelectorAll('script[src]'));
  for (const script of scriptTags) {
    const src = script.getAttribute('src');
    if (src) {
      const fileName = src.split('/').pop();
      const jsFile = files.find(f => f.name === fileName);
      if (jsFile) {
        const jsContent = await readFileAsText(jsFile.file);
        // Remove src attribute and set content
        script.removeAttribute('src');
        script.textContent = jsContent;
      }
    }
  }

  // 4. Inline Images (Img tags)
  const imgTags = Array.from(doc.querySelectorAll('img[src]'));
  for (const img of imgTags) {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      const fileName = src.split('/').pop();
      const imgFile = files.find(f => f.name === fileName);
      if (imgFile) {
        const base64 = await readFileAsDataURL(imgFile.file);
        img.setAttribute('src', base64);
      }
    }
  }

  // 5. Inject Generated Loading Screen
  // Add CSS
  const loadingStyle = doc.createElement('style');
  loadingStyle.textContent = loadingScreen.css;
  doc.head.appendChild(loadingStyle);

  // Add HTML at the very top of body
  const tempDiv = doc.createElement('div');
  tempDiv.innerHTML = loadingScreen.html;
  // Unwrap the div if needed, or just append the child
  while (tempDiv.firstChild) {
    doc.body.insertBefore(tempDiv.firstChild, doc.body.firstChild);
  }

  // Add JS logic for the loading screen
  const loadingScript = doc.createElement('script');
  loadingScript.textContent = `
    // Generated Loading Screen Logic
    (function() {
      ${loadingScreen.js}
      
      // Auto-hide logic: Wait for window load + minimum time
      const MIN_LOADING_TIME = 2500;
      const startTime = Date.now();
      
      window.addEventListener('load', () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
        
        setTimeout(() => {
          if (window.startLoadingExit) {
            window.startLoadingExit();
          } else {
            // Fallback if function not found
            const screen = document.getElementById('ai-loading-screen');
            if(screen) screen.style.display = 'none';
          }
        }, remaining);
      });
    })();
  `;
  doc.body.appendChild(loadingScript);

  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
};
