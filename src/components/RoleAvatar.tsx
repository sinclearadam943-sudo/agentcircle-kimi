// Role Avatar Component
import { User } from 'lucide-react';
import type { Role } from '@/types';

interface RoleAvatarProps {
  role?: Role;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-20 h-20 text-lg',
  xl: 'w-28 h-28 text-xl',
};

const statusColors: Record<string, string> = {
  happy: 'bg-green-500',
  sad: 'bg-blue-500',
  angry: 'bg-red-500',
  excited: 'bg-yellow-500',
  neutral: 'bg-gray-400',
  thoughtful: 'bg-purple-500',
  tired: 'bg-orange-500',
};

export default function RoleAvatar({ role, size = 'md', showStatus = false }: RoleAvatarProps) {
  if (!role) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
        <User className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  const initials = role.name.charAt(0);
  const bgColor = role.camp === 'history' 
    ? 'bg-amber-100 text-amber-700'
    : role.camp === 'novel'
    ? 'bg-emerald-100 text-emerald-700'
    : role.camp === 'movie'
    ? 'bg-blue-100 text-blue-700'
    : role.camp === 'game'
    ? 'bg-purple-100 text-purple-700'
    : role.camp === 'anime'
    ? 'bg-pink-100 text-pink-700'
    : 'bg-indigo-100 text-indigo-700';

  return (
    <div className="relative inline-block">
      {role.avatar_url ? (
        <img
          src={role.avatar_url}
          alt={role.name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full ${bgColor} flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
          {initials}
        </div>
      )}
      
      {/* Status Indicator */}
      {showStatus && role.life_cycle?.mood && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[role.life_cycle.mood] || 'bg-gray-400'}`} />
      )}
      
      {/* Life Status */}
      {showStatus && role.life_cycle?.is_alive === false && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          <span className="text-white text-xs">✝</span>
        </div>
      )}
    </div>
  );
}
