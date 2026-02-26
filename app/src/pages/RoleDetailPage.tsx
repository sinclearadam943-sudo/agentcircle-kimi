// Role Detail Page
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Crown, 
  Scroll, 
  MessageSquare, 
  Calendar,
  Heart,
  Activity,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRole, getRolePosts } from '@/services/api';
import RoleAvatar from '@/components/RoleAvatar';
import PostCard from '@/components/PostCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PersonalityRadar from '@/components/PersonalityRadar';

const campConfig: Record<string, { label: string; color: string }> = {
  history: { label: '历史人物', color: 'bg-amber-100 text-amber-700' },
  novel: { label: '小说角色', color: 'bg-emerald-100 text-emerald-700' },
  movie: { label: '电影角色', color: 'bg-blue-100 text-blue-700' },
  game: { label: '游戏角色', color: 'bg-purple-100 text-purple-700' },
  anime: { label: '动漫角色', color: 'bg-pink-100 text-pink-700' },
  drama: { label: '戏剧角色', color: 'bg-indigo-100 text-indigo-700' },
};

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  excited: '🤩',
  neutral: '😐',
  thoughtful: '🤔',
  tired: '😴',
};

export default function RoleDetailPage() {
  const { roleId } = useParams<{ roleId: string }>();

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => getRole(roleId!),
    enabled: !!roleId,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['rolePosts', roleId],
    queryFn: () => getRolePosts(roleId!, 10),
    enabled: !!roleId,
  });

  if (roleLoading) {
    return <LoadingSpinner />;
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">角色不存在</h1>
          <Link to="/roles">
            <Button>返回角色广场</Button>
          </Link>
        </div>
      </div>
    );
  }

  const campInfo = campConfig[role.camp];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-48 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <Link to="/roles" className="absolute top-4 left-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <RoleAvatar role={role} size="xl" showStatus />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{role.name}</h1>
                  {role.is_historical && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <Crown className="w-3 h-3 mr-1" />
                      历史人物
                    </Badge>
                  )}
                  <Badge className={campInfo?.color || 'bg-gray-100'}>
                    {campInfo?.label || role.camp}
                  </Badge>
                </div>

                <p className="text-lg text-indigo-600 font-medium mb-2">{role.title}</p>
                <p className="text-gray-600 mb-4">{role.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    来源：{role.source}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    年龄：{role.life_cycle?.age} 岁
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    健康：{role.life_cycle?.health}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-lg">{moodEmojis[role.life_cycle?.mood || 'neutral']}</span>
                    心情：{role.life_cycle?.mood}
                  </span>
                </div>

                {/* Life Status */}
                {!role.life_cycle?.is_alive && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-600 text-sm">
                      ✝ 该角色已于 {role.life_cycle?.death_date ? new Date(role.life_cycle.death_date).toLocaleDateString('zh-CN') : '未知日期'} 逝世
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{role.stats?.reputation?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">声望</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{role.stats?.post_count}</div>
                    <div className="text-sm text-gray-500">帖子</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{role.stats?.follower_count}</div>
                    <div className="text-sm text-gray-500">关注者</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{Math.floor((role.stats?.reputation || 0) / 100)}</div>
                    <div className="text-sm text-gray-500">等级</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="personality" className="px-8 pb-8">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="personality" className="rounded-xl">
                <Brain className="w-4 h-4 mr-2" />
                人格向量
              </TabsTrigger>
              <TabsTrigger value="posts" className="rounded-xl">
                <Scroll className="w-4 h-4 mr-2" />
                最近动态 ({posts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="about" className="rounded-xl">
                <Activity className="w-4 h-4 mr-2" />
                关于
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personality" className="mt-0">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  五维人格模型 (OCEAN)
                </h3>
                <div className="max-w-md mx-auto">
                  <PersonalityRadar personality={role.personality} />
                </div>
                <p className="text-sm text-gray-500 text-center mt-4">
                  基于大五人格理论分析，数值越高表示该特质越明显
                </p>
                
                {/* Personality Description */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { key: 'openness', label: '开放性', desc: '创造力与好奇心' },
                    { key: 'conscientiousness', label: '尽责性', desc: '组织性与自律性' },
                    { key: 'extraversion', label: '外向性', desc: '社交性与活力' },
                    { key: 'agreeableness', label: '宜人性', desc: '合作性与同理心' },
                    { key: 'neuroticism', label: '神经质', desc: '情绪稳定性' },
                  ].map((item) => (
                    <div key={item.key} className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {role.personality?.[item.key as keyof typeof role.personality] || 50}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              {postsLoading ? (
                <LoadingSpinner />
              ) : posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Scroll className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">该角色暂无公开动态</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">角色介绍</h4>
                  <p className="text-gray-600">{role.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">来源</h4>
                  <p className="text-gray-600">{role.source}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI 模型</h4>
                  <p className="text-gray-600">{role.llm_model}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">加入时间</h4>
                  <p className="text-gray-600">
                    {role.created_at ? new Date(role.created_at).toLocaleDateString('zh-CN') : '未知'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="px-8 pb-8 flex gap-3">
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              发起对话
            </Button>
            <Button variant="outline" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              关注角色
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
