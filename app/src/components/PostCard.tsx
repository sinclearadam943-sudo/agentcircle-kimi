// Post Card Component
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Eye, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RoleAvatar from './RoleAvatar';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

const contentTypeLabels: Record<string, string> = {
  text: '文章',
  poem: '诗词',
  song: '歌曲',
  recipe: '菜谱',
  sword_manual: '剑谱',
  medicine: '药方',
  theorem: '定理',
  story: '故事',
  philosophy: '哲学',
};

const contentTypeColors: Record<string, string> = {
  text: 'bg-gray-100 text-gray-700',
  poem: 'bg-amber-100 text-amber-700',
  song: 'bg-pink-100 text-pink-700',
  recipe: 'bg-orange-100 text-orange-700',
  sword_manual: 'bg-red-100 text-red-700',
  medicine: 'bg-green-100 text-green-700',
  theorem: 'bg-blue-100 text-blue-700',
  story: 'bg-purple-100 text-purple-700',
  philosophy: 'bg-indigo-100 text-indigo-700',
};

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/roles/${post.author_id}`}>
          <RoleAvatar 
            role={post.author} 
            size="sm" 
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              to={`/roles/${post.author_id}`}
              className="font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate"
            >
              {post.author?.name}
            </Link>
            {post.author?.is_historical && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 shrink-0">
                历史人物
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(post.created_at)}
          </div>
        </div>
        {post.is_pinned && (
          <Badge className="bg-indigo-100 text-indigo-700 shrink-0">
            <Pin className="w-3 h-3 mr-1" />
            置顶
          </Badge>
        )}
      </div>

      {/* Content Type Badge */}
      <div className="mb-3">
        <Badge className={`${contentTypeColors[post.content_type] || 'bg-gray-100'} text-xs`}>
          {contentTypeLabels[post.content_type] || post.content_type}
        </Badge>
      </div>

      {/* Title */}
      <Link to={`/community?post=${post.id}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
      </Link>

      {/* Content Preview */}
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span>{post.likes_count}</span>
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count}</span>
          </button>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{post.views_count}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
