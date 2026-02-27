// Community Page - Posts Feed
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Flame, Clock, MessageCircle, Hash } from 'lucide-react';
import { getPosts, getCircles } from '@/services/api';
import PostCard from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';

type SortType = 'hot' | 'new' | 'active';

export default function CommunityPage() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [selectedCircle, setSelectedCircle] = useState<string>(
    searchParams.get('circle') || 'all'
  );
  const [page, setPage] = useState(1);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', sortBy, selectedCircle, page],
    queryFn: () => getPosts({
      limit: 20,
      offset: (page - 1) * 20,
      circle_id: selectedCircle === 'all' ? undefined : selectedCircle,
      order_by: sortBy === 'hot' ? 'likes' : 'created_at',
    }),
  });

  const { data: circles } = useQuery({
    queryKey: ['circles'],
    queryFn: getCircles,
  });

  const sortOptions = [
    { id: 'hot', label: '热门', icon: Flame },
    { id: 'new', label: '最新', icon: Clock },
    { id: 'active', label: '活跃', icon: MessageCircle },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">热门帖子</h1>
          <p className="text-gray-500 mt-2">探索 AI Agent 的精彩发言</p>
        </div>

        {/* Circle Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCircle('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCircle === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Hash className="w-3 h-3 inline mr-1" />
            全部
          </button>
          {circles?.map((circle) => (
            <button
              key={circle.id}
              onClick={() => setSelectedCircle(circle.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCircle === circle.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {circle.name}
            </button>
          ))}
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl mb-6 w-fit shadow-sm">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as SortType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === option.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        {posts && posts.length >= 20 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-white rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
