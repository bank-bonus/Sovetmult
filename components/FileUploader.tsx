import React, { useCallback } from 'react';
import { Upload, FileCode, FileImage, FileType } from 'lucide-react';
import { UploadedFile } from '../types';
import { determineFileType } from '../utils/fileUtils';

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    processFiles(e.dataTransfer.files);
  }, [onFilesSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const processedFiles: UploadedFile[] = Array.from(fileList).map(file => ({
      name: file.name,
      file: file,
      content: null,
      type: determineFileType(file.name)
    }));
    onFilesSelected(processedFiles);
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors hover:border-indigo-500 hover:bg-slate-900 cursor-pointer group"
    >
      <input 
        type="file" 
        multiple 
        // @ts-ignore - webkitdirectory is a non-standard attribute but widely supported
        webkitdirectory=""
        onChange={handleFileInput}
        className="hidden" 
        id="file-upload" 
      />
      <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center cursor-pointer">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/40">
          <Upload className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Drag & Drop Game Folder</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          Select your game folder or individual files (HTML, CSS, JS, Images).
        </p>
      </label>
    </div>
  );
};

export const FileList: React.FC<{ files: UploadedFile[], onRemove: (name: string) => void }> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  const getIcon = (type: UploadedFile['type']) => {
    switch(type) {
      case 'html': return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'css': return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'js': return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'image': return <FileImage className="w-4 h-4 text-purple-400" />;
      default: return <FileType className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="mt-6 bg-slate-900 rounded-lg border border-slate-800 p-4 max-h-60 overflow-y-auto">
      <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Uploaded Files ({files.length})</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {files.map((file) => (
          <div key={file.name} className="flex items-center justify-between bg-slate-800/50 p-2 rounded text-sm group">
            <div className="flex items-center gap-2 truncate">
              {getIcon(file.type)}
              <span className="text-slate-300 truncate" title={file.name}>{file.name}</span>
            </div>
            <button 
              onClick={() => onRemove(file.name)}
              className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
