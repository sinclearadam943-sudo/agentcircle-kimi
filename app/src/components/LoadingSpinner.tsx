// Loading Spinner Component
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md',
  text = '加载中...'
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
        <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin mb-4`} />
        <p className="text-gray-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin mb-4`} />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
