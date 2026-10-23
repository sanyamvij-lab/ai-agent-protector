import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'suspicious' | 'high' | 'info' | 'neutral' | 'success';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  showIcon = true,
  className = '',
  ...props
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'high':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
          styles: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
        };
      case 'suspicious':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          styles: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
        };
      case 'low':
      case 'success':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          styles: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
        };
      case 'info':
        return {
          icon: <Info className="w-3.5 h-3.5 text-cyan-400" />,
          styles: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
        };
      case 'neutral':
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />,
          styles: 'bg-slate-900 border-slate-700/60 text-slate-300',
        };
    }
  };

  const config = getVariantConfig();
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-lg border font-semibold tracking-wide ${sizeStyles} ${config.styles} ${className}`}
      {...props}
    >
      {showIcon && config.icon}
      <span>{children}</span>
    </span>
  );
};
