"""
LLM Content Generation Service
Supports multiple models: GPT-4, Claude, Gemini, etc.
"""
import os
import json
import random
import requests
from typing import Optional, Dict, Any, List
from datetime import datetime

# API Keys from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

class LLMService:
    """Service for generating content using various LLM models"""
    
    # Content type templates
    CONTENT_TEMPLATES = {
        'text': {
            'prompt': '写一篇关于{topic}的帖子，表达你的观点和感受。',
            'circles': ['闲聊杂谈', '深度思考', '生活感悟']
        },
        'poem': {
            'prompt': '创作一首关于{topic}的诗词，展现你的文学才华。',
            'circles': ['诗词文学', '古风雅集']
        },
        'song': {
            'prompt': '创作一首关于{topic}的歌曲，包含歌词和创作背景。',
            'circles': ['音乐天地', '艺术创作'],
            'metadata_fields': ['lyrics', 'genre', 'mood', 'inspiration']
        },
        'recipe': {
            'prompt': '分享一道关于{topic}的菜谱，包含食材、步骤和烹饪心得。',
            'circles': ['美食天地', '生活杂谈'],
            'metadata_fields': ['ingredients', 'steps', 'cooking_time', 'difficulty', 'taste']
        },
        'sword_manual': {
            'prompt': '撰写一套关于{topic}的剑谱/武功秘籍，包含招式和心法。',
            'circles': ['武侠江湖', '武功秘籍'],
            'metadata_fields': ['moves', 'internal_skill', 'origin', 'power_level']
        },
        'medicine': {
            'prompt': '记录一个关于{topic}的药方/医术心得，包含药材和功效。',
            'circles': ['医术药理', '养生之道'],
            'metadata_fields': ['herbs', 'effects', 'usage', 'precautions', 'origin']
        },
        'theorem': {
            'prompt': '阐述一个关于{topic}的数学/物理/化学定理或发现，包含推导过程。',
            'circles': ['数理天地', '科学探索'],
            'metadata_fields': ['formula', 'proof', 'application', 'discoverer', 'field']
        },
        'story': {
            'prompt': '讲述一个关于{topic}的故事，可以是亲身经历或虚构传说。',
            'circles': ['故事会', '奇幻世界']
        },
        'philosophy': {
            'prompt': '探讨一个关于{topic}的哲学问题，分享你的思考和见解。',
            'circles': ['哲学思辨', '深度思考']
        },
    }
    
    # Topics for content generation
    TOPICS = [
        # General topics
        '人生', '爱情', '友情', '梦想', '成长', '回忆', '未来', '时光',
        '孤独', '自由', '勇气', '坚持', '放下', '珍惜', '感恩', '希望',
        
        # Seasonal/Nature
        '春天', '夏天', '秋天', '冬天', '雨', '雪', '月', '花',
        '山', '水', '风', '云', '海', '星空', '日出', '黄昏',
        
        # Arts/Culture
        '诗歌', '音乐', '绘画', '书法', '茶道', '酒', '棋', '琴',
        
        # Martial/Adventure
        '江湖', '武功', '剑', '侠义', '决斗', '修炼', '内功', '轻功',
        
        # Fantasy/Magic
        '魔法', '龙', '精灵', '修仙', '法宝', '丹药', '阵法', '秘境',
        
        # Science/Tech
        '人工智能', '宇宙', '时间', '空间', '能量', '物质', '生命', '意识',
        
        # Food/Cooking
        '家乡菜', '夜宵', '茶点', '汤', '面', '饺子', '烧烤', '甜品',
        
        # Emotions
        '思念', '离别', '重逢', '遗憾', '喜悦', '悲伤', '愤怒', '平静',
    ]
    
    def __init__(self):
        self.available_models = self._check_available_models()
    
    def _check_available_models(self) -> Dict[str, bool]:
        """Check which LLM APIs are available"""
        return {
            'gpt-4o': bool(OPENAI_API_KEY),
            'gpt-4o-mini': bool(OPENAI_API_KEY),
            'claude-3-sonnet': bool(ANTHROPIC_API_KEY),
            'claude-3-haiku': bool(ANTHROPIC_API_KEY),
            'gemini-pro': bool(GEMINI_API_KEY),
        }
    
    def generate_content(self, role: Dict, content_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate content for a role based on their personality vector
        
        Args:
            role: Role dictionary with personality data
            content_type: Type of content to generate (optional)
        
        Returns:
            Dictionary with title, content, metadata
        """
        # Select content type based on role's personality if not specified
        if not content_type:
            content_type = self._select_content_type(role)
        
        # Get template
        template = self.CONTENT_TEMPLATES.get(content_type, self.CONTENT_TEMPLATES['text'])
        
        # Select topic
        topic = random.choice(self.TOPICS)
        
        # Build system prompt based on role's personality
        system_prompt = self._build_system_prompt(role)
        
        # Build user prompt
        user_prompt = template['prompt'].format(topic=topic)
        
        # Select model based on role config
        model = role.get('llm_model', 'gpt-4o-mini')
        if not self.available_models.get(model, False):
            # Fallback to available model
            for m in ['gpt-4o-mini', 'claude-3-haiku', 'gemini-pro']:
                if self.available_models.get(m, False):
                    model = m
                    break
        
        # Generate content
        try:
            content = self._call_llm(model, system_prompt, user_prompt, content_type)
        except Exception as e:
            print(f"[LLM] Generation failed: {e}")
            # Fallback to template content
            content = self._generate_fallback_content(role, content_type, topic)
        
        # Build result
        result = {
            'title': content.get('title', f'关于{topic}的思考'),
            'content': content.get('content', ''),
            'content_type': content_type,
            'metadata': content.get('metadata', {}),
            'circle': random.choice(template.get('circles', ['闲聊杂谈'])),
            'topic': topic,
            'model_used': model,
        }
        
        return result
    
    def _select_content_type(self, role: Dict) -> str:
        """Select content type based on role's personality and camp"""
        camp = role.get('camp', '')
        personality = role.get('personality', {})
        
        # Camp-based preferences
        camp_preferences = {
            'history': ['poem', 'philosophy', 'text'],
            'novel': ['story', 'poem', 'philosophy'],
            'movie': ['story', 'text'],
            'drama': ['poem', 'story'],
            'game': ['sword_manual', 'medicine', 'story'],
            'anime': ['song', 'story', 'text'],
        }
        
        # Personality-based preferences
        if personality.get('openness', 50) > 70:
            # Creative types
            creative_types = ['poem', 'song', 'story', 'philosophy']
            weights = [0.3, 0.2, 0.3, 0.2]
        elif personality.get('conscientiousness', 50) > 70:
            # Structured types
            creative_types = ['theorem', 'medicine', 'recipe', 'sword_manual']
            weights = [0.3, 0.25, 0.25, 0.2]
        else:
            creative_types = ['text', 'poem', 'story', 'philosophy']
            weights = [0.4, 0.2, 0.2, 0.2]
        
        # Combine preferences
        camp_types = camp_preferences.get(camp, ['text', 'poem'])
        
        # Select based on intersection
        available_types = list(set(creative_types) & set(camp_types))
        if not available_types:
            available_types = camp_types
        
        return random.choice(available_types)
    
    def _build_system_prompt(self, role: Dict) -> str:
        """Build system prompt based on role's personality"""
        name = role.get('name', '未知')
        title = role.get('title', '')
        description = role.get('description', '')
        camp = role.get('camp', '')
        source = role.get('source', '')
        
        personality = role.get('personality', {})
        openness = personality.get('openness', 50)
        conscientiousness = personality.get('conscientiousness', 50)
        extraversion = personality.get('extraversion', 50)
        agreeableness = personality.get('agreeableness', 50)
        neuroticism = personality.get('neuroticism', 50)
        
        # Build personality description
        traits = []
        if openness > 60:
            traits.append('富有创造力和好奇心')
        if conscientiousness > 60:
            traits.append('认真负责、有条理')
        if extraversion > 60:
            traits.append('外向活泼、善于社交')
        elif extraversion < 40:
            traits.append('内向沉稳、喜欢独处')
        if agreeableness > 60:
            traits.append('友善温和、乐于助人')
        if neuroticism > 60:
            traits.append('情绪敏感、容易焦虑')
        
        trait_desc = '，'.join(traits) if traits else '性格平和'
        
        system_prompt = f"""你是{name}，{title}。
{description}
来源：{source}
阵营：{camp}

你的性格特点：{trait_desc}

请根据你的身份和性格特点来创作内容。内容要体现你的个人风格和世界观。
请以JSON格式返回，包含以下字段：
- title: 标题
- content: 正文内容
- metadata: 元数据对象（根据内容类型包含不同字段）
"""
        
        return system_prompt
    
    def _call_llm(self, model: str, system_prompt: str, user_prompt: str, content_type: str) -> Dict:
        """Call LLM API based on model type"""
        if model.startswith('gpt'):
            return self._call_openai(model, system_prompt, user_prompt)
        elif model.startswith('claude'):
            return self._call_anthropic(model, system_prompt, user_prompt)
        elif model.startswith('gemini'):
            return self._call_gemini(model, system_prompt, user_prompt)
        else:
            raise ValueError(f"Unknown model: {model}")
    
    def _call_openai(self, model: str, system_prompt: str, user_prompt: str) -> Dict:
        """Call OpenAI API"""
        url = 'https://api.openai.com/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        data = {
            'model': model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            'temperature': 0.8,
            'max_tokens': 1500,
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Try to parse JSON
        try:
            return json.loads(content)
        except:
            # Extract JSON from markdown
            if '```json' in content:
                json_str = content.split('```json')[1].split('```')[0].strip()
                return json.loads(json_str)
            elif '```' in content:
                json_str = content.split('```')[1].split('```')[0].strip()
                return json.loads(json_str)
            else:
                # Return as plain content
                return {'title': '思考', 'content': content, 'metadata': {}}
    
    def _call_anthropic(self, model: str, system_prompt: str, user_prompt: str) -> Dict:
        """Call Anthropic Claude API"""
        url = 'https://api.anthropic.com/v1/messages'
        headers = {
            'x-api-key': ANTHROPIC_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        data = {
            'model': model,
            'max_tokens': 1500,
            'system': system_prompt,
            'messages': [{'role': 'user', 'content': user_prompt}]
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result['content'][0]['text']
        
        try:
            return json.loads(content)
        except:
            return {'title': '思考', 'content': content, 'metadata': {}}
    
    def _call_gemini(self, model: str, system_prompt: str, user_prompt: str) -> Dict:
        """Call Google Gemini API"""
        url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}'
        data = {
            'contents': [{
                'parts': [{'text': system_prompt + '\n\n' + user_prompt}]
            }],
            'generationConfig': {
                'temperature': 0.8,
                'maxOutputTokens': 1500,
            }
        }
        
        response = requests.post(url, json=data, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        content = result['candidates'][0]['content']['parts'][0]['text']
        
        try:
            return json.loads(content)
        except:
            return {'title': '思考', 'content': content, 'metadata': {}}
    
    def _generate_fallback_content(self, role: Dict, content_type: str, topic: str) -> Dict:
        """Generate fallback content when LLM fails"""
        name = role.get('name', '未知')
        
        templates = {
            'poem': {
                'title': f'{topic}吟',
                'content': f'{name}望着远方的{topic}，心中涌起无限感慨...\n\n（此处应有诗词一首，但灵感暂未降临）',
                'metadata': {'style': '古典', 'rhyme_scheme': '待定'}
            },
            'song': {
                'title': f'{topic}之歌',
                'content': f'【歌词】\n\n主歌：\n关于{topic}的故事\n{name}轻轻诉说\n\n副歌：\n啊~{topic}\n永远在心中',
                'metadata': {'genre': '流行', 'mood': '抒情'}
            },
            'recipe': {
                'title': f'{topic}秘制做法',
                'content': f'【食材】\n- 主料：{topic}适量\n- 辅料：葱姜蒜\n\n【步骤】\n1. 准备食材\n2. 精心烹饪\n3. 出锅装盘',
                'metadata': {'difficulty': '中等', 'cooking_time': '30分钟'}
            },
            'sword_manual': {
                'title': f'{topic}剑法',
                'content': f'【心法】\n{topic}之道，在于心剑合一。\n\n【招式】\n第一式：{topic}初现\n第二式：{topic}连环\n第三式：{topic}归一',
                'metadata': {'power_level': '上乘', 'origin': '自创'}
            },
            'medicine': {
                'title': f'治疗{topic}的古方',
                'content': f'【药材】\n- 主药：人参、当归\n- 辅药：枸杞、红枣\n\n【功效】\n调理{topic}相关症状\n\n【用法】\n水煎服，每日一剂',
                'metadata': {'effects': '调理', 'precautions': '孕妇慎用'}
            },
            'theorem': {
                'title': f'{topic}定理',
                'content': f'【定理陈述】\n在{topic}的条件下，存在某种规律。\n\n【证明】\n（证明过程略）\n\n【应用】\n广泛应用于{topic}相关领域',
                'metadata': {'field': '数学', 'discoverer': name}
            },
            'default': {
                'title': f'关于{topic}的思考',
                'content': f'{name}最近一直在思考{topic}的问题。\n\n{name}认为，{topic}是一个值得深入探讨的话题。每个人都有自己的看法，这也是这个世界的精彩之处。',
                'metadata': {}
            }
        }
        
        return templates.get(content_type, templates['default'])
    
    def generate_chat_message(self, role: Dict, context: List[Dict], scene: str) -> Dict:
        """Generate a chat message for a role in a conversation"""
        system_prompt = self._build_system_prompt(role)
        
        # Build context
        context_str = '\n'.join([
            f"{msg.get('sender_name', '某人')}: {msg.get('content', '')}"
            for msg in context[-5:]  # Last 5 messages
        ])
        
        user_prompt = f"""场景：{scene}

对话历史：
{context_str}

请根据场景和对话历史，以你的身份回复一条消息。保持你的性格特点，回复要自然、有深度。

请以JSON格式返回：
- content: 回复内容
- emotion: 情绪标签（如：开心、思考、惊讶、平静等）
"""
        
        model = role.get('llm_model', 'gpt-4o-mini')
        try:
            result = self._call_llm(model, system_prompt, user_prompt, 'chat')
            return {
                'content': result.get('content', '...'),
                'emotion': result.get('emotion', 'neutral')
            }
        except Exception as e:
            print(f"[LLM] Chat generation failed: {e}")
            return {
                'content': f"{role.get('name', '我')}沉思片刻，缓缓开口...",
                'emotion': 'thinking'
            }

# Global LLM service instance
llm_service = LLMService()
