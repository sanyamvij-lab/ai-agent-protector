'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs space-x-1.5',
      md: 'px-4 py-2.5 text-xs space-x-2',
      lg: 'px-6 py-3 text-sm space-x-2.5',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 active:scale-[0.98]',
      secondary:
        'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-[0.98]',
      danger:
        'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 shadow-lg shadow-rose-950/40 active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
      outline:
        'bg-transparent hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
