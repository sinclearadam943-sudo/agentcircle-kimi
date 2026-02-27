// Westworld Experience Page for AgentCircle
import { useState } from 'react';
import { Sparkles, Sword, Ghost, Crown, Clock, Users, Star, Lock, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'murder' | 'historical' | 'fantasy' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  maxPlayers: number;
  price: number;
  image: string;
  features: string[];
}

const scenarios: Scenario[] = [
  {
    id: 'murder_001',
    title: '月下谜案',
    description: '一座古老的庄园中发生了一起神秘的谋杀案。作为侦探，你需要与庄园中的角色对话，收集线索，找出真凶。',
    type: 'murder',
    difficulty: 'medium',
    duration: '60-90分钟',
    maxPlayers: 1,
    price: 29.9,
    image: '🌙',
    features: ['多结局', '角色互动', '线索收集', '推理挑战'],
  },
  {
    id: 'historical_001',
    title: '三国风云',
    description: '穿越回三国时代，与曹操、诸葛亮、关羽等历史人物面对面。你可以选择成为谋士、武将或君主，改变历史的走向。',
    type: 'historical',
    difficulty: 'hard',
    duration: '90-120分钟',
    maxPlayers: 3,
    price: 39.9,
    image: '⚔️',
    features: ['历史还原', '多线剧情', '角色扮演', '策略对抗'],
  },
  {
    id: 'fantasy_001',
    title: '魔法学院',
    description: '进入霍格沃茨风格的魔法学院，学习魔法课程，参加魁地奇比赛，解开学院中隐藏的秘密。',
    type: 'fantasy',
    difficulty: 'easy',
    duration: '45-60分钟',
    maxPlayers: 4,
    price: 19.9,
    image: '🔮',
    features: ['魔法学习', '学院生活', '友谊建立', '冒险探索'],
  },
  {
    id: 'social_001',
    title: '宫廷宴会',
    description: '参加一场盛大的宫廷宴会，与各路角色交流互动。你需要运用社交技巧，完成自己的目标。',
    type: 'social',
    difficulty: 'medium',
    duration: '30-45分钟',
    maxPlayers: 6,
    price: 14.9,
    image: '👑',
    features: ['社交模拟', '角色扮演', '目标达成', '关系建立'],
  },
  {
    id: 'murder_002',
    title: '江湖恩怨',
    description: '一个武侠世界的谋杀谜案。各大门派的高手齐聚一堂，每个人都有秘密，每个人都有动机。',
    type: 'murder',
    difficulty: 'hard',
    duration: '90-120分钟',
    maxPlayers: 2,
    price: 34.9,
    image: '🗡️',
    features: ['武侠风格', '门派对抗', '武功对决', '真相揭露'],
  },
  {
    id: 'fantasy_002',
    title: '龙族传说',
    description: '探索龙族的秘密，与龙对话，了解这个古老种族的历史和文化。你的选择将影响龙族的命运。',
    type: 'fantasy',
    difficulty: 'medium',
    duration: '60-90分钟',
    maxPlayers: 2,
    price: 24.9,
    image: '🐉',
    features: ['龙族文化', '史诗剧情', '道德抉择', '命运改变'],
  },
];

const typeConfig = {
  murder: { label: '悬疑推理', icon: Ghost, color: 'bg-purple-100 text-purple-700' },
  historical: { label: '历史重演', icon: Crown, color: 'bg-amber-100 text-amber-700' },
  fantasy: { label: '奇幻冒险', icon: Sparkles, color: 'bg-blue-100 text-blue-700' },
  social: { label: '社交模拟', icon: Users, color: 'bg-green-100 text-green-700' },
};

const difficultyConfig = {
  easy: { label: '简单', color: 'bg-green-100 text-green-700' },
  medium: { label: '中等', color: 'bg-yellow-100 text-yellow-700' },
  hard: { label: '困难', color: 'bg-red-100 text-red-700' },
};

export default function WestworldPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredScenarios = filter === 'all' 
    ? scenarios 
    : scenarios.filter(s => s.type === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span>付费体验</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Westworld 体验
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              与 AI 角色进行深度互动
              <br />
              <span className="text-white/50">沉浸式剧本杀 · 历史重演 · 奇幻冒险</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Users, label: '角色互动', desc: '与AI角色深度对话' },
            { icon: Sword, label: '剧本杀', desc: '沉浸式推理体验' },
            { icon: Crown, label: '历史重演', desc: '改变历史走向' },
            { icon: Star, label: '多结局', desc: '你的选择决定结局' },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <feature.icon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">{feature.label}</div>
              <div className="text-sm text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            全部
          </Button>
          {Object.entries(typeConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
            >
              <config.icon className="w-4 h-4 mr-1" />
              {config.label}
            </Button>
          ))}
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => {
            const typeInfo = typeConfig[scenario.type];
            const difficultyInfo = difficultyConfig[scenario.difficulty];
            
            return (
              <Card key={scenario.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">{scenario.image}</span>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={typeInfo.color}>
                      <typeInfo.icon className="w-3 h-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                    <Badge className={difficultyInfo.color}>
                      {difficultyInfo.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{scenario.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {scenario.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {scenario.maxPlayers}人
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {scenario.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold text-indigo-600">
                      ¥{scenario.price}
                    </div>
                    <Button 
                      onClick={() => setSelectedScenario(scenario)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      开始体验
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full">
            <Lock className="w-4 h-4" />
            <span>更多场景开发中...</span>
          </div>
        </div>
      </div>

      {/* Scenario Detail Dialog */}
      <Dialog open={!!selectedScenario} onOpenChange={() => setSelectedScenario(null)}>
        <DialogContent className="max-w-2xl">
          {selectedScenario && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <span className="text-4xl">{selectedScenario.image}</span>
                  {selectedScenario.title}
                </DialogTitle>
                <DialogDescription>{selectedScenario.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={typeConfig[selectedScenario.type].color}>
                    {typeConfig[selectedScenario.type].label}
                  </Badge>
                  <Badge className={difficultyConfig[selectedScenario.difficulty].color}>
                    {difficultyConfig[selectedScenario.difficulty].label}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">时长</div>
                    <div className="font-medium">{selectedScenario.duration}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">人数</div>
                    <div className="font-medium">{selectedScenario.maxPlayers}人</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Star className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">特色</div>
                    <div className="font-medium">{selectedScenario.features.length}项</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">特色功能</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedScenario.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">体验说明</p>
                      <p>支付后将立即开始体验。体验过程中可以随时暂停和继续。完成体验后可以获得成就徽章。</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-sm text-gray-500">价格</div>
                    <div className="text-3xl font-bold text-indigo-600">
                      ¥{selectedScenario.price}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedScenario(null)}>
                      取消
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      确认支付
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
