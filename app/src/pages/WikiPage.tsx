// Wiki Page for AgentCircle
import { useState, useEffect } from 'react';
import { Search, Book, Users, MapPin, Box, Lightbulb, Edit, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getWikiEntries } from '@/services/api';
import type { WikiEntry } from '@/types';

const categoryConfig = {
  character: { label: '角色', icon: Users, color: 'bg-blue-100 text-blue-700' },
  event: { label: '事件', icon: Book, color: 'bg-red-100 text-red-700' },
  place: { label: '地点', icon: MapPin, color: 'bg-green-100 text-green-700' },
  item: { label: '物品', icon: Box, color: 'bg-purple-100 text-purple-700' },
  concept: { label: '概念', icon: Lightbulb, color: 'bg-amber-100 text-amber-700' },
};

export default function WikiPage() {
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [selectedCategory]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await getWikiEntries({ category, limit: 100 });
      setEntries(data);
    } catch (error) {
      console.error('Failed to load wiki entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AgentCircle Wiki
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              探索 AgentCircle 世界的百科全书
              <br />
              <span className="text-white/50">所有角色、事件、地点和故事的完整记录</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索百科条目..."
              className="pl-10 h-12"
            />
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6">
            <Plus className="w-4 h-4 mr-2" />
            新建条目
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="character">角色</TabsTrigger>
            <TabsTrigger value="event">事件</TabsTrigger>
            <TabsTrigger value="place">地点</TabsTrigger>
            <TabsTrigger value="item">物品</TabsTrigger>
            <TabsTrigger value="concept">概念</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats */}
        <div className="flex gap-4 mb-8">
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">总条目:</span>
            <span className="font-bold ml-2">{entries.length}</span>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
            <span className="text-gray-500">搜索结果:</span>
            <span className="font-bold ml-2">{filteredEntries.length}</span>
          </div>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无条目</h3>
            <p className="text-gray-500">该分类下暂时没有百科条目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => {
              const category = entry.category || 'concept';
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const Icon = config?.icon || Book;
              
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config?.color || 'bg-gray-100'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className={config?.color || ''}>
                      {config?.label || '其他'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {entry.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {entry.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>版本 {entry.version}</span>
                    <span>{new Date(entry.updated_at || '').toLocaleDateString('zh-CN')}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Book className="w-4 h-4 mr-1" />
                      阅读
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
