import React, { useState, useMemo } from 'react';
import { Box, Code2, Download, Gamepad2, Layers, Loader2, Sparkles, Wand2 } from 'lucide-react';
import FileUploader, { FileList } from './components/FileUploader';
import GeneratedPreview from './components/GeneratedPreview';
import { AppState, LoadingScreenData, UploadedFile } from './types';
import { generateLoadingScreen } from './services/geminiService';
import { bundleGame } from './services/bundlerService';
import { readFileAsText } from './utils/fileUtils';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [mainEntryFile, setMainEntryFile] = useState<string | null>(null);
  const [loadingScreenData, setLoadingScreenData] = useState<LoadingScreenData | null>(null);
  const [finalBundleUrl, setFinalBundleUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: UploadedFile[]) => {
    // Merge new files, avoiding duplicates
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const uniqueNew = newFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...uniqueNew];
    });
    
    // Auto-detect index.html
    if (!mainEntryFile) {
      const index = newFiles.find(f => f.name.toLowerCase() === 'index.html');
      if (index) setMainEntryFile(index.name);
    }
  };

  const handleRemoveFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    if (mainEntryFile === name) setMainEntryFile(null);
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError("Please upload game files first.");
      return;
    }

    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      // Create context for Gemini
      // Concatenate text from a few key files (HTML/JS) to give context
      let context = "";
      const textFiles = files.filter(f => f.type === 'html' || f.type === 'js');
      
      for (const f of textFiles.slice(0, 3)) { // Limit to first 3 text files to save tokens/time
        const content = await readFileAsText(f.file);
        context += `\n--- FILE: ${f.name} ---\n${content.slice(0, 2000)}`; // Slice large files
      }

      setAppState(AppState.GENERATING);
      const result = await generateLoadingScreen(context);
      setLoadingScreenData(result);
      setAppState(AppState.PREVIEW);
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate loading screen. Please check API Key and try again.");
      setAppState(AppState.IDLE);
    }
  };

  const handleBundle = async () => {
    if (!loadingScreenData || !mainEntryFile) return;
    
    const entryFileObj = files.find(f => f.name === mainEntryFile);
    if (!entryFileObj) {
      setError("Main entry file not found.");
      return;
    }

    setAppState(AppState.BUNDLING);
    try {
      const bundledHtml = await bundleGame(files, entryFileObj, loadingScreenData);
      const blob = new Blob([bundledHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setFinalBundleUrl(url);
      setAppState(AppState.COMPLETE);
    } catch (e: any) {
      console.error(e);
      setError("Failed to bundle files.");
      setAppState(AppState.PREVIEW);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">GameBundler AI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="hidden sm:inline-block hover:text-indigo-400 transition-colors cursor-help" title="Using Gemini 2.5 Flash">Powered by Google Gemini</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Pack Your Web Game with AI Style
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Upload your HTML5 game files. We'll analyze the code, generate a custom thematic loading screen using Gemini, and bundle everything into a single standalone HTML file.
          </p>
        </section>

        {/* Step 1: Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">1</div>
                <h3 className="font-semibold text-lg">Upload Assets</h3>
              </div>
              
              <FileUploader onFilesSelected={handleFilesSelected} />
              
              <FileList files={files} onRemove={handleRemoveFile} />

              {files.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Main Entry File (e.g., index.html)</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={mainEntryFile || ''}
                    onChange={(e) => setMainEntryFile(e.target.value)}
                  >
                    <option value="" disabled>Select entry point...</option>
                    {files.filter(f => f.type === 'html').map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">2</div>
                <h3 className="font-semibold text-lg">Generate & Bundle</h3>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={files.length === 0 || !mainEntryFile || appState === AppState.GENERATING || appState === AppState.ANALYZING}
                className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 mb-3 transition-all ${
                  files.length > 0 && mainEntryFile && appState !== AppState.GENERATING && appState !== AppState.ANALYZING
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {appState === AppState.ANALYZING || appState === AppState.GENERATING ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {appState === AppState.ANALYZING ? 'Analyzing Game...' : 'Generating UI...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Loading Screen
                  </>
                )}
              </button>

              {appState === AppState.PREVIEW || appState === AppState.COMPLETE || appState === AppState.BUNDLING ? (
                <button
                  onClick={handleBundle}
                  disabled={appState === AppState.BUNDLING}
                  className="w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all"
                >
                  {appState === AppState.BUNDLING ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Bundling Assets...
                    </>
                  ) : (
                    <>
                      <Box className="w-4 h-4" />
                      Bundle Everything
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* Right Panel: Preview & Result */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Loading Screen Preview */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-1 min-h-[400px] h-[500px] flex flex-col relative overflow-hidden">
               {/* Label Badge */}
               <div className="absolute top-4 left-4 z-10 bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  AI Generated Preview
               </div>

               {loadingScreenData ? (
                 <GeneratedPreview data={loadingScreenData} />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    {appState === AppState.ANALYZING || appState === AppState.GENERATING ? (
                      <div className="text-center space-y-4">
                        <div className="relative w-20 h-20 mx-auto">
                          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="animate-pulse">Dreaming up a theme based on your code...</p>
                      </div>
                    ) : (
                      <>
                        <Layers className="w-12 h-12 mb-4 opacity-20" />
                        <p>Upload files and click Generate to see magic.</p>
                      </>
                    )}
                 </div>
               )}
            </div>

            {/* Bundle Result */}
            {appState === AppState.COMPLETE && finalBundleUrl && (
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                      <Code2 className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-white">Bundle Ready!</h3>
                     <p className="text-indigo-200 text-sm">Your game + AI loading screen is ready.</p>
                   </div>
                </div>
                <a 
                  href={finalBundleUrl} 
                  download="game-bundle.html"
                  className="whitespace-nowrap px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download HTML
                </a>
              </div>
            )}
            
            {loadingScreenData?.themeDescription && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 text-sm text-slate-400">
                <strong className="text-slate-200">AI Analysis:</strong> {loadingScreenData.themeDescription}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
