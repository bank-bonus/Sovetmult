import React from 'react';

interface RetroTVProps {
  imageSrc?: string;
  loading?: boolean;
  altText?: string;
}

const RetroTV: React.FC<RetroTVProps> = ({ imageSrc, loading, altText }) => {
  return (
    <div className="relative mx-auto w-full max-w-md">
      
      {/* Wooden Case */}
      <div className="bg-[#5c3a21] p-3 rounded-lg shadow-xl border-4 border-[#3e2716] relative">
        {/* Speaker Grille Pattern (Left Decoration) */}
        <div className="absolute left-2 bottom-2 w-16 h-8 flex space-x-1 opacity-50">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-1 bg-black h-full"></div>
           ))}
        </div>

        {/* Brand Label */}
        <div className="absolute top-1 left-0 w-full flex justify-center z-20">
             <div className="bg-[#d4af37] text-black text-[10px] font-bold px-2 py-0.5 rounded-b shadow border-b border-r border-black font-sans uppercase">
               РУБИН-714
             </div>
        </div>

        {/* Screen Bezel */}
        <div className="bg-[#1a1a1a] p-2 rounded border-2 border-[#808080] shadow-inner">
          {/* Screen Content */}
          <div className="aspect-[4/3] w-full relative bg-[#111] overflow-hidden rounded-[40px]">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Tv_static.gif')] bg-cover"></div>
                 <div className="relative z-10 border-4 border-white w-12 h-12 animate-spin border-t-transparent rounded-full"></div>
                 <p className="relative z-10 text-[#f0ead6] font-mono text-xs uppercase animate-pulse">Настройка...</p>
              </div>
            ) : imageSrc ? (
              <>
                <img 
                  src={imageSrc} 
                  alt={altText || "Cartoon scene"} 
                  className="w-full h-full object-cover filter contrast-125 sepia-[0.3]"
                />
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 bg-gradient-to-b from-transparent to-black"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono">
                НЕТ СИГНАЛА
              </div>
            )}
            
            {/* Scanlines & Glare */}
            <div className="absolute inset-0 scanlines opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="mt-2 flex justify-end space-x-3 px-2">
           <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-[#111] shadow-[1px_1px_0px_rgba(255,255,255,0.2)]"></div>
           <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-[#111] shadow-[1px_1px_0px_rgba(255,255,255,0.2)]"></div>
        </div>
      </div>
    </div>
  );
};

export default RetroTV;