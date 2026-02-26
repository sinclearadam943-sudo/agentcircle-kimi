// API Client for AgentCircle Frontend
import type { Role, Post, Circle, ChatRoom, ChatMessage, WikiEntry, Stats } from '@/types';
import { 
  mockStats, 
  mockRoles, 
  mockCircles, 
  mockPosts, 
  mockChatRooms, 
  mockChatMessages,
  mockWikiEntries 
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Flag to use mock data when API is unavailable
const USE_MOCK_DATA = true;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (USE_MOCK_DATA) {
    throw new Error('Using mock data');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

// ==================== Roles API ====================

export async function getRoles(params?: {
  limit?: number;
  offset?: number;
  camp?: string;
}): Promise<Role[]> {
  try {
    return await fetchApi<Role[]>(`/roles?${new URLSearchParams(params as Record<string, string>)}`);
  } catch {
    let filtered = [...mockRoles];
    if (params?.camp) {
      filtered = filtered.filter(r => r.camp === params.camp);
    }
    return filtered.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 24));
  }
}

export async function getRole(roleId: string): Promise<Role> {
  try {
    return await fetchApi<Role>(`/roles/${roleId}`);
  } catch {
    const role = mockRoles.find(r => r.id === roleId);
    if (!role) throw new Error('Role not found');
    return role;
  }
}

export async function getRolePosts(roleId: string, limit: number = 20): Promise<Post[]> {
  try {
    return await fetchApi<Post[]>(`/roles/${roleId}/posts?limit=${limit}`);
  } catch {
    return mockPosts.filter(p => p.author_id === roleId).slice(0, limit);
  }
}

// ==================== Posts API ====================

export async function getPosts(params?: {
  limit?: number;
  offset?: number;
  circle_id?: string;
  author_id?: string;
  order_by?: 'created_at' | 'likes';
}): Promise<Post[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.circle_id) queryParams.set('circle_id', params.circle_id);
    if (params?.author_id) queryParams.set('author_id', params.author_id);
    if (params?.order_by) queryParams.set('order_by', params.order_by);
    return await fetchApi<Post[]>(`/posts?${queryParams.toString()}`);
  } catch {
    let filtered = [...mockPosts];
    if (params?.circle_id) {
      filtered = filtered.filter(p => p.circle_id === params.circle_id);
    }
    if (params?.author_id) {
      filtered = filtered.filter(p => p.author_id === params.author_id);
    }
    if (params?.order_by === 'likes') {
      filtered.sort((a, b) => b.likes_count - a.likes_count);
    }
    return filtered.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 20));
  }
}

export async function getPost(postId: string): Promise<Post> {
  try {
    return await fetchApi<Post>(`/posts/${postId}`);
  } catch {
    const post = mockPosts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');
    return post;
  }
}

// ==================== Circles API ====================

export async function getCircles(): Promise<Circle[]> {
  try {
    return await fetchApi<Circle[]>('/circles');
  } catch {
    return mockCircles;
  }
}

export async function getCirclePosts(circleId: string, limit: number = 20): Promise<Post[]> {
  try {
    return await fetchApi<Post[]>(`/circles/${circleId}/posts?limit=${limit}`);
  } catch {
    return mockPosts.filter(p => p.circle_id === circleId).slice(0, limit);
  }
}

// ==================== Chat API ====================

export async function getChatRooms(limit: number = 50): Promise<ChatRoom[]> {
  try {
    return await fetchApi<ChatRoom[]>(`/chat/rooms?limit=${limit}`);
  } catch {
    return mockChatRooms.slice(0, limit);
  }
}

export async function getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
  try {
    return await fetchApi<ChatMessage[]>(`/chat/rooms/${roomId}/messages?limit=${limit}`);
  } catch {
    return mockChatMessages.filter(m => m.room_id === roomId).slice(0, limit);
  }
}

// ==================== Wiki API ====================

export async function getWikiEntries(params?: {
  category?: string;
  limit?: number;
}): Promise<WikiEntry[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    return await fetchApi<WikiEntry[]>(`/wiki/entries?${queryParams.toString()}`);
  } catch {
    let filtered = [...mockWikiEntries];
    if (params?.category) {
      filtered = filtered.filter(e => e.category === params.category);
    }
    return filtered.slice(0, params?.limit || 100);
  }
}

export async function getWikiEntry(entryId: string): Promise<WikiEntry> {
  try {
    return await fetchApi<WikiEntry>(`/wiki/entries/${entryId}`);
  } catch {
    const entry = mockWikiEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Wiki entry not found');
    return entry;
  }
}

// ==================== Stats API ====================

export async function getStats(): Promise<Stats> {
  try {
    return await fetchApi<Stats>('/stats');
  } catch {
    return mockStats;
  }
}

// ==================== Admin API ====================

export async function syncFromSupabase(): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>('/admin/sync', { method: 'POST' });
}

export async function startScheduler(): Promise<{ status: string }> {
  return fetchApi<{ status: string }>('/admin/scheduler/start', { method: 'POST' });
}

export async function stopScheduler(): Promise<{ status: string }> {
  return fetchApi<{ status: string }>('/admin/scheduler/stop', { method: 'POST' });
}

// ==================== Hidden Features API ====================

export async function getHiddenWikiInfo(): Promise<{
  message: string;
  description: string;
  entries_count: number;
  url: string;
}> {
  try {
    return await fetchApi('/hidden/wiki');
  } catch {
    return {
      message: 'Wiki 百科',
      description: '探索 AgentCircle 世界的百科全书',
      entries_count: mockWikiEntries.length,
      url: '/wiki',
    };
  }
}

export async function getHiddenWestworldInfo(): Promise<{
  message: string;
  description: string;
  price: string;
  features: string[];
}> {
  try {
    return await fetchApi('/hidden/westworld');
  } catch {
    return {
      message: 'Westworld 体验',
      description: '与 AI 角色进行深度互动，沉浸式剧本杀体验',
      price: '¥14.9 起',
      features: ['角色互动', '剧本杀', '历史重演', '多结局'],
    };
  }
}
