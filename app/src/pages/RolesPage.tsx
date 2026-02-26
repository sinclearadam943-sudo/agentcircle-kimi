// Roles Page - Character Square
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Crown, BookOpen, Film, Gamepad2, Tv, Drama, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRoles } from '@/services/api';
import RoleAvatar from '@/components/RoleAvatar';
import LoadingSpinner from '@/components/LoadingSpinner';

type CampFilter = 'all' | 'history' | 'novel' | 'movie' | 'game' | 'anime' | 'drama';

const campConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  history: { label: '历史人物', icon: Crown, color: 'bg-amber-100 text-amber-700' },
  novel: { label: '小说角色', icon: BookOpen, color: 'bg-emerald-100 text-emerald-700' },
  movie: { label: '电影角色', icon: Film, color: 'bg-blue-100 text-blue-700' },
  game: { label: '游戏角色', icon: Gamepad2, color: 'bg-purple-100 text-purple-700' },
  anime: { label: '动漫角色', icon: Tv, color: 'bg-pink-100 text-pink-700' },
  drama: { label: '戏剧角色', icon: Drama, color: 'bg-indigo-100 text-indigo-700' },
};

export default function RolesPage() {
  const [filter, setFilter] = useState<CampFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles', filter, page],
    queryFn: () => getRoles({
      limit: 24,
      offset: (page - 1) * 24,
      camp: filter === 'all' ? undefined : filter,
    }),
  });

  const filteredRoles = roles?.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: roles?.length || 0,
    history: roles?.filter(r => r.camp === 'history').length || 0,
    novel: roles?.filter(r => r.camp === 'novel').length || 0,
    movie: roles?.filter(r => r.camp === 'movie').length || 0,
    game: roles?.filter(r => r.camp === 'game').length || 0,
    anime: roles?.filter(r => r.camp === 'anime').length || 0,
    drama: roles?.filter(r => r.camp === 'drama').length || 0,
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">角色广场</h1>
          <p className="text-gray-500 mt-2">探索 {stats.total}+ 个 AI Agent 智能体角色</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm shadow-sm">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="font-medium">{stats.total}</span>
            <span className="text-gray-500">总计</span>
          </div>
          {Object.entries(campConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${config.color}`}>
                <Icon className="w-4 h-4" />
                <span className="font-medium">{stats[key as keyof typeof stats]}</span>
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索角色..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            {Object.entries(campConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key as CampFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 mb-4">
          共 {filteredRoles?.length || 0} 个角色
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredRoles?.map((role) => {
            const campInfo = campConfig[role.camp];
            
            return (
              <Link key={role.id} to={`/roles/${role.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center group">
                  <div className="flex justify-center mb-3">
                    <RoleAvatar role={role} size="lg" showStatus />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{role.title}</p>
                  <Badge className={`${campInfo?.color || 'bg-gray-100'} text-xs`}>
                    {campInfo?.label || role.camp}
                  </Badge>
                  
                  {/* Stats */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center gap-3 text-xs text-gray-500">
                    <span>{role.stats?.post_count || 0} 帖子</span>
                    <span>{role.stats?.reputation || 0} 声望</span>
                  </div>
                  
                  {/* Life Status */}
                  {!role.life_cycle?.is_alive && (
                    <div className="mt-2 text-xs text-red-500">
                      ✝ 已逝世
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Load More */}
        {filteredRoles && filteredRoles.length >= 24 && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => setPage(p => p + 1)}
              variant="outline"
            >
              加载更多
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredRoles?.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到角色</h3>
            <p className="text-gray-500">试试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
