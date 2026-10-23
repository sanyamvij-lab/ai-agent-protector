import React from 'react';
import { Info, AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onDismiss,
  className = '',
  ...props
}) => {
  const configs = {
    info: {
      icon: <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />,
      styles: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />,
      styles: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
    },
    danger: {
      icon: <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />,
      styles: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
    },
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />,
      styles: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
    },
  };

  const { icon, styles } = configs[variant];

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border text-xs flex items-start space-x-3 relative ${styles} ${className}`}
      {...props}
    >
      {icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-bold text-white text-xs">{title}</h5>}
        <div className="text-slate-300 leading-relaxed text-xs">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-md transition"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
