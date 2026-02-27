// ==================== Role Types ====================

export interface PersonalityVector {
  openness: number;      // 开放性 0-100
  conscientiousness: number; // 尽责性 0-100
  extraversion: number;  // 外向性 0-100
  agreeableness: number; // 宜人性 0-100
  neuroticism: number;   // 神经质 0-100
}

export interface LifeCycle {
  birth_date?: string;
  death_date?: string;
  is_alive: boolean;
  age: number;
  health: number;
  mood: string;  // happy, sad, angry, excited, neutral, thoughtful, tired
}

export interface RoleStats {
  reputation: number;
  post_count: number;
  follower_count: number;
  following_count: number;
}

export interface Role {
  id: string;
  name: string;
  avatar_url?: string;
  camp: 'history' | 'novel' | 'movie' | 'game' | 'anime' | 'drama';
  is_historical: boolean;
  title?: string;
  description?: string;
  source?: string;  // 来源：历史、小说名、电影名、游戏名等
  personality: PersonalityVector;
  life_cycle: LifeCycle;
  stats: RoleStats;
  llm_model: string;  // 可配置的大模型
  created_at?: string;
  last_active_at?: string;
}

// ==================== Post Types ====================

export type ContentType = 
  | 'text' 
  | 'poem' 
  | 'song' 
  | 'recipe' 
  | 'sword_manual' 
  | 'medicine' 
  | 'theorem' 
  | 'story' 
  | 'philosophy';

export interface PostMetadata {
  // For songs
  lyrics?: string;
  genre?: string;
  mood?: string;
  inspiration?: string;
  
  // For recipes
  ingredients?: string[];
  steps?: string[];
  cooking_time?: string;
  difficulty?: string;
  taste?: string;
  
  // For sword manuals
  moves?: string[];
  internal_skill?: string;
  origin?: string;
  power_level?: string;
  
  // For medicines
  herbs?: string[];
  effects?: string;
  usage?: string;
  precautions?: string;
  
  // For theorems
  formula?: string;
  proof?: string;
  application?: string;
  discoverer?: string;
  field?: string;
  
  // For stories
  setting?: string;
  characters?: string[];
  plot?: string;
  
  // General
  style?: string;
  rhyme_scheme?: string;
}

export interface Post {
  id: string;
  author_id: string;
  author?: Role;
  circle_id?: string;
  title: string;
  content: string;
  content_type: ContentType;
  metadata: PostMetadata;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  created_at?: string;
}

// ==================== Circle Types ====================

export interface Circle {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  post_count: number;
}

// ==================== Chat Types ====================

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender?: Role;
  content: string;
  message_type: 'text' | 'image' | 'action';
  emotion?: string;
  created_at?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  scene?: string;
  participant_ids: string[];
  participants?: Role[];
  messages?: ChatMessage[];
  last_message?: ChatMessage;
  created_at?: string;
  last_message_at?: string;
}

// ==================== Wiki Types ====================

export interface WikiEntry {
  id: string;
  title: string;
  content: string;
  category?: 'character' | 'event' | 'place' | 'item' | 'concept';
  related_role_ids: string[];
  related_roles?: Role[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  version: number;
}

// ==================== Stats Types ====================

export interface Stats {
  total_agents: number;
  total_posts: number;
  total_circles: number;
  active_agents: number;
  alive_agents: number;
  dead_agents: number;
}

// ==================== Comment Types ====================

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author?: Role;
  content: string;
  likes_count: number;
  created_at?: string;
}

// ==================== Like Types ====================

export interface Like {
  id: string;
  post_id: string;
  role_id?: string;  // AI角色点赞
  human_id?: string;  // 人类用户点赞
  created_at?: string;
}

// ==================== Memory Types ====================

export interface Memory {
  id: string;
  role_id: string;
  content: string;
  memory_type: 'experience' | 'thought' | 'dream' | 'fear' | 'desire';
  importance: number;
  related_role_ids: string[];
  created_at?: string;
}

// ==================== Interaction Session Types ====================

export interface InteractionSession {
  id: string;
  human_user_id: string;
  role_ids: string[];
  roles?: Role[];
  scenario?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  cost: number;
  created_at?: string;
}
