import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden",
        onClick && "cursor-pointer hover:border-indigo-300 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
