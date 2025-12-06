import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false,
  className = ''
}) => {
  // Soviet Style: Square borders, bold colors, uppercase text
  const baseStyle = "w-full py-3 px-4 uppercase tracking-widest font-bold text-lg border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#cc0000] text-[#f0ead6] border-[#1a1a1a] hover:bg-[#b30000]", // Red
    secondary: "bg-[#f0ead6] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#e6ddc0]", // Beige
    danger: "bg-[#1a1a1a] text-[#f0ead6] border-[#cc0000] hover:bg-black", // Black
    success: "bg-[#4a7c59] text-white border-[#1a1a1a] hover:bg-[#3d664a]" // Soviet Green
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;