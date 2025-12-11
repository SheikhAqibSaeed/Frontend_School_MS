import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
}

export function Card({ children, className, title, actions }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          {title && <h3 className="text-xl font-semibold text-gray-900">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

