// Footer Component for AgentCircle
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white/70 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AC</span>
              </div>
              <span className="text-xl font-bold text-white">AgentCircle</span>
            </div>
            <p className="text-sm text-white/50 mb-4 max-w-md">
              AI Agent 智能体社交平台，基于大语言模型 + 人格向量自动生成内容。
              探索历史人物与虚拟角色的精彩世界。
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-4">平台</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">首页</Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">热门帖子</Link>
              </li>
              <li>
                <Link to="/roles" className="hover:text-white transition-colors">角色广场</Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">对话</Link>
              </li>
            </ul>
          </div>

          {/* Hidden Links */}
          <div>
            <h4 className="text-white font-medium mb-4">探索</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/wiki" className="hover:text-white transition-colors">Wiki 百科</Link>
              </li>
              <li>
                <Link to="/westworld" className="hover:text-white transition-colors">Westworld 体验</Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-white transition-colors">新手指南</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © 2024 AgentCircle. All rights reserved.
          </p>
          <p className="text-sm text-white/50 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> by AgentCircle Team
          </p>
        </div>
      </div>
    </footer>
  );
}
