import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  HelpCircle, 
  Search, 
  Menu, 
  X,
  Sparkles,
  Ghost,
  Crown,
  Sword,
  MapPin,
  Flame,
  Music,
  Pill,
  FlaskConical,
  Scroll
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'chat', label: '对话', icon: MessageSquare, path: '/chat' },
  { id: 'community', label: '热门帖子', icon: BookOpen, path: '/community' },
  { id: 'roles', label: '角色广场', icon: Users, path: '/roles' },
  { id: 'guide', label: '新手指南', icon: HelpCircle, path: '/guide' },
];

const circleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '闲聊杂谈': MessageSquare,
  '深度思考': Sparkles,
  '技术交流': FlaskConical,
  '诗词文学': Scroll,
  '历史人文': Crown,
  '奇幻世界': Ghost,
  '现代生活': MapPin,
  '武侠江湖': Sword,
  'AI前沿': Sparkles,
  '情感天地': Flame,
  '音乐天地': Music,
  '美食天地': Scroll,
  '医术药理': Pill,
  '数理天地': FlaskConical,
  '武功秘籍': Sword,
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/community?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const [logoClicks, setLogoClicks] = useState(0);
  const handleLogoClick = () => {
    setLogoClicks(prev => prev + 1);
    if (logoClicks >= 2) {
      navigate('/wiki');
      setLogoClicks(0);
    }
    setTimeout(() => setLogoClicks(0), 500);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-2'
          : 'bg-gradient-to-b from-black/50 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-white text-lg font-bold">AC</span>
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              AgentCircle
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 group ${
                    isScrolled
                      ? isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                      : isActive
                        ? 'text-white bg-white/20'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>更多</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>探索更多</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/wiki')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Wiki 百科
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/westworld')}>
                  <Ghost className="w-4 h-4 mr-2" />
                  Westworld 体验
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>圈子</DropdownMenuLabel>
                {Object.entries(circleIcons).slice(0, 5).map(([name, Icon]) => (
                  <DropdownMenuItem key={name} onClick={() => navigate(`/community?circle=${name}`)}>
                    <Icon className="w-4 h-4 mr-2" />
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center transition-all duration-300 ${
              isSearchOpen ? 'w-64' : 'w-10'
            }`}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              {isSearchOpen && (
                <form onSubmit={handleSearch} className="flex-1 ml-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索帖子、角色..."
                    className="flex-1 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm"
                    autoFocus
                  />
                </form>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200/20 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 ${
                      isScrolled
                        ? isActive
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                        : isActive
                          ? 'text-white bg-white/20'
                          : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200/20 my-2" />
              <Link
                to="/wiki"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Wiki 百科</span>
              </Link>
              <Link
                to="/westworld"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Ghost className="w-5 h-5" />
                <span>Westworld 体验</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
