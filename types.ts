export interface UploadedFile {
  name: string;
  file: File;
  content: string | ArrayBuffer | null;
  type: 'html' | 'css' | 'js' | 'image' | 'other';
}

export interface LoadingScreenData {
  html: string;
  css: string;
  js: string;
  themeDescription?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  PREVIEW = 'PREVIEW',
  BUNDLING = 'BUNDLING',
  COMPLETE = 'COMPLETE',
}
