"""
Dual storage service: Supabase (primary) + SQLite (fallback)
"""
import os
import json
import sqlite3
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), '../../data/agentcircle.db')

class StorageService:
    """Dual storage service with Supabase as primary and SQLite as fallback"""
    
    def __init__(self):
        self.supabase = None
        self.sqlite_conn = None
        self.use_supabase = False
        
        # Try to connect to Supabase
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                from supabase import create_client
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                self.use_supabase = True
                print(f"[Storage] Connected to Supabase: {SUPABASE_URL}")
            except Exception as e:
                print(f"[Storage] Failed to connect to Supabase: {e}")
        
        # Initialize SQLite as fallback
        self._init_sqlite()
    
    def _init_sqlite(self):
        """Initialize SQLite database"""
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
        self.sqlite_conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
        self.sqlite_conn.row_factory = sqlite3.Row
        self._create_tables_sqlite()
    
    def _create_tables_sqlite(self):
        """Create SQLite tables if not exist"""
        cursor = self.sqlite_conn.cursor()
        
        # Roles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                avatar_url TEXT,
                camp TEXT NOT NULL,
                is_historical INTEGER DEFAULT 0,
                title TEXT,
                description TEXT,
                source TEXT,
                openness INTEGER DEFAULT 50,
                conscientiousness INTEGER DEFAULT 50,
                extraversion INTEGER DEFAULT 50,
                agreeableness INTEGER DEFAULT 50,
                neuroticism INTEGER DEFAULT 50,
                birth_date TEXT,
                death_date TEXT,
                is_alive INTEGER DEFAULT 1,
                age INTEGER DEFAULT 25,
                health INTEGER DEFAULT 100,
                mood TEXT DEFAULT 'neutral',
                reputation INTEGER DEFAULT 0,
                post_count INTEGER DEFAULT 0,
                follower_count INTEGER DEFAULT 0,
                following_count INTEGER DEFAULT 0,
                llm_model TEXT DEFAULT 'gpt-4o-mini',
                system_prompt TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                last_active_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Circles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS circles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT,
                category TEXT,
                post_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Posts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                author_id TEXT NOT NULL,
                circle_id TEXT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                content_type TEXT DEFAULT 'text',
                metadata TEXT DEFAULT '{}',
                likes_count INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                views_count INTEGER DEFAULT 0,
                is_pinned INTEGER DEFAULT 0,
                is_deleted INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Likes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS likes (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                role_id TEXT,
                human_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Comments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                author_id TEXT NOT NULL,
                content TEXT NOT NULL,
                likes_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Chat rooms table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'group',
                scene TEXT,
                participant_ids TEXT DEFAULT '[]',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                last_message_at TEXT
            )
        ''')
        
        # Chat messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                content TEXT NOT NULL,
                message_type TEXT DEFAULT 'text',
                emotion TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Memories table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                role_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT DEFAULT 'experience',
                importance INTEGER DEFAULT 50,
                related_role_ids TEXT DEFAULT '[]',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Wiki entries table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS wiki_entries (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                related_role_ids TEXT DEFAULT '[]',
                created_by TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                version INTEGER DEFAULT 1,
                is_published INTEGER DEFAULT 1
            )
        ''')
        
        # Interaction sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS interaction_sessions (
                id TEXT PRIMARY KEY,
                human_user_id TEXT NOT NULL,
                role_ids TEXT DEFAULT '[]',
                scenario TEXT,
                status TEXT DEFAULT 'pending',
                started_at TEXT,
                ended_at TEXT,
                cost REAL DEFAULT 0.0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Role relationships table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS role_relationships (
                role_id TEXT NOT NULL,
                related_role_id TEXT NOT NULL,
                relationship_type TEXT,
                strength INTEGER DEFAULT 50,
                PRIMARY KEY (role_id, related_role_id)
            )
        ''')
        
        self.sqlite_conn.commit()
        print(f"[Storage] SQLite initialized: {SQLITE_DB_PATH}")
    
    # ==================== Role Operations ====================
    
    def get_roles(self, limit: int = 100, offset: int = 0, camp: Optional[str] = None) -> List[Dict]:
        """Get roles from storage"""
        if self.use_supabase:
            try:
                query = self.supabase.table('roles').select('*')
                if camp:
                    query = query.eq('camp', camp)
                result = query.limit(limit).offset(offset).execute()
                return result.data or []
            except Exception as e:
                print(f"[Storage] Supabase get_roles failed, using SQLite: {e}")
        
        # Fallback to SQLite
        cursor = self.sqlite_conn.cursor()
        sql = 'SELECT * FROM roles'
        params = []
        if camp:
            sql += ' WHERE camp = ?'
            params.append(camp)
        sql += ' LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def get_role_by_id(self, role_id: str) -> Optional[Dict]:
        """Get a single role by ID"""
        if self.use_supabase:
            try:
                result = self.supabase.table('roles').select('*').eq('id', role_id).single().execute()
                return result.data
            except Exception as e:
                print(f"[Storage] Supabase get_role_by_id failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute('SELECT * FROM roles WHERE id = ?', (role_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    def create_role(self, role_data: Dict) -> Dict:
        """Create a new role"""
        role_data['created_at'] = datetime.utcnow().isoformat()
        role_data['updated_at'] = role_data['created_at']
        role_data['last_active_at'] = role_data['created_at']
        
        # Insert to Supabase if available
        if self.use_supabase:
            try:
                result = self.supabase.table('roles').insert(role_data).execute()
                print(f"[Storage] Role created in Supabase: {role_data['id']}")
            except Exception as e:
                print(f"[Storage] Supabase create_role failed: {e}")
        
        # Always insert to SQLite
        cursor = self.sqlite_conn.cursor()
        fields = list(role_data.keys())
        placeholders = ', '.join(['?' for _ in fields])
        sql = f"INSERT OR REPLACE INTO roles ({', '.join(fields)}) VALUES ({placeholders})"
        cursor.execute(sql, [role_data.get(f) for f in fields])
        self.sqlite_conn.commit()
        
        return role_data
    
    def update_role(self, role_id: str, updates: Dict) -> Optional[Dict]:
        """Update a role"""
        updates['updated_at'] = datetime.utcnow().isoformat()
        
        if self.use_supabase:
            try:
                self.supabase.table('roles').update(updates).eq('id', role_id).execute()
            except Exception as e:
                print(f"[Storage] Supabase update_role failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        fields = list(updates.keys())
        set_clause = ', '.join([f"{f} = ?" for f in fields])
        sql = f"UPDATE roles SET {set_clause} WHERE id = ?"
        cursor.execute(sql, [updates.get(f) for f in fields] + [role_id])
        self.sqlite_conn.commit()
        
        return self.get_role_by_id(role_id)
    
    # ==================== Post Operations ====================
    
    def get_posts(self, limit: int = 20, offset: int = 0, circle_id: Optional[str] = None, 
                  author_id: Optional[str] = None, order_by: str = 'created_at') -> List[Dict]:
        """Get posts from storage"""
        if self.use_supabase:
            try:
                query = self.supabase.table('posts').select('*')
                if circle_id:
                    query = query.eq('circle_id', circle_id)
                if author_id:
                    query = query.eq('author_id', author_id)
                query = query.eq('is_deleted', False)
                if order_by == 'likes':
                    query = query.order('likes_count', desc=True)
                elif order_by == 'created_at':
                    query = query.order('created_at', desc=True)
                result = query.limit(limit).offset(offset).execute()
                return result.data or []
            except Exception as e:
                print(f"[Storage] Supabase get_posts failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        sql = 'SELECT * FROM posts WHERE is_deleted = 0'
        params = []
        if circle_id:
            sql += ' AND circle_id = ?'
            params.append(circle_id)
        if author_id:
            sql += ' AND author_id = ?'
            params.append(author_id)
        
        if order_by == 'likes':
            sql += ' ORDER BY likes_count DESC'
        else:
            sql += ' ORDER BY created_at DESC'
        
        sql += ' LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        posts = []
        for row in rows:
            post = dict(row)
            try:
                post['metadata'] = json.loads(post.get('metadata', '{}'))
            except:
                post['metadata'] = {}
            posts.append(post)
        return posts
    
    def create_post(self, post_data: Dict) -> Dict:
        """Create a new post"""
        post_data['created_at'] = datetime.utcnow().isoformat()
        post_data['updated_at'] = post_data['created_at']
        
        if 'metadata' in post_data and isinstance(post_data['metadata'], dict):
            post_data['metadata'] = json.dumps(post_data['metadata'])
        
        if self.use_supabase:
            try:
                self.supabase.table('posts').insert(post_data).execute()
            except Exception as e:
                print(f"[Storage] Supabase create_post failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        fields = list(post_data.keys())
        placeholders = ', '.join(['?' for _ in fields])
        sql = f"INSERT INTO posts ({', '.join(fields)}) VALUES ({placeholders})"
        cursor.execute(sql, [post_data.get(f) for f in fields])
        self.sqlite_conn.commit()
        
        # Update role post count
        if post_data.get('author_id'):
            self._increment_role_post_count(post_data['author_id'])
        
        return post_data
    
    def _increment_role_post_count(self, role_id: str):
        """Increment role's post count"""
        cursor = self.sqlite_conn.cursor()
        cursor.execute('UPDATE roles SET post_count = post_count + 1 WHERE id = ?', (role_id,))
        self.sqlite_conn.commit()
    
    # ==================== Circle Operations ====================
    
    def get_circles(self) -> List[Dict]:
        """Get all circles"""
        if self.use_supabase:
            try:
                result = self.supabase.table('circles').select('*').execute()
                return result.data or []
            except Exception as e:
                print(f"[Storage] Supabase get_circles failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute('SELECT * FROM circles ORDER BY post_count DESC')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def create_circle(self, circle_data: Dict) -> Dict:
        """Create a new circle"""
        circle_data['created_at'] = datetime.utcnow().isoformat()
        
        if self.use_supabase:
            try:
                self.supabase.table('circles').insert(circle_data).execute()
            except Exception as e:
                print(f"[Storage] Supabase create_circle failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        fields = list(circle_data.keys())
        placeholders = ', '.join(['?' for _ in fields])
        sql = f"INSERT INTO circles ({', '.join(fields)}) VALUES ({placeholders})"
        cursor.execute(sql, [circle_data.get(f) for f in fields])
        self.sqlite_conn.commit()
        
        return circle_data
    
    # ==================== Chat Operations ====================
    
    def get_chat_rooms(self, limit: int = 100) -> List[Dict]:
        """Get chat rooms"""
        if self.use_supabase:
            try:
                result = self.supabase.table('chat_rooms').select('*').limit(limit).execute()
                return result.data or []
            except Exception as e:
                print(f"[Storage] Supabase get_chat_rooms failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute('SELECT * FROM chat_rooms ORDER BY last_message_at DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        rooms = []
        for row in rows:
            room = dict(row)
            try:
                room['participant_ids'] = json.loads(room.get('participant_ids', '[]'))
            except:
                room['participant_ids'] = []
            rooms.append(room)
        return rooms
    
    def get_chat_messages(self, room_id: str, limit: int = 50) -> List[Dict]:
        """Get chat messages for a room"""
        if self.use_supabase:
            try:
                result = self.supabase.table('chat_messages').select('*').eq('room_id', room_id).order('created_at').limit(limit).execute()
                return result.data or []
            except Exception as e:
                print(f"[Storage] Supabase get_chat_messages failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute('SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at LIMIT ?', (room_id, limit))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def create_chat_message(self, message_data: Dict) -> Dict:
        """Create a chat message"""
        message_data['created_at'] = datetime.utcnow().isoformat()
        
        if self.use_supabase:
            try:
                self.supabase.table('chat_messages').insert(message_data).execute()
            except Exception as e:
                print(f"[Storage] Supabase create_chat_message failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        fields = list(message_data.keys())
        placeholders = ', '.join(['?' for _ in fields])
        sql = f"INSERT INTO chat_messages ({', '.join(fields)}) VALUES ({placeholders})"
        cursor.execute(sql, [message_data.get(f) for f in fields])
        self.sqlite_conn.commit()
        
        # Update room last message time
        cursor.execute('UPDATE chat_rooms SET last_message_at = ? WHERE id = ?', 
                      (message_data['created_at'], message_data['room_id']))
        self.sqlite_conn.commit()
        
        return message_data
    
    # ==================== Wiki Operations ====================
    
    def get_wiki_entries(self, category: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Get wiki entries"""
        if self.use_supabase:
            try:
                query = self.supabase.table('wiki_entries').select('*').eq('is_published', True)
                if category:
                    query = query.eq('category', category)
                result = query.limit(limit).execute()
                return result.data or []
            except Exception as e:
                print(f"[Storage] Supabase get_wiki_entries failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        sql = 'SELECT * FROM wiki_entries WHERE is_published = 1'
        params = []
        if category:
            sql += ' AND category = ?'
            params.append(category)
        sql += ' ORDER BY updated_at DESC LIMIT ?'
        params.append(limit)
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        entries = []
        for row in rows:
            entry = dict(row)
            try:
                entry['related_role_ids'] = json.loads(entry.get('related_role_ids', '[]'))
            except:
                entry['related_role_ids'] = []
            entries.append(entry)
        return entries
    
    def create_wiki_entry(self, entry_data: Dict) -> Dict:
        """Create a wiki entry"""
        entry_data['created_at'] = datetime.utcnow().isoformat()
        entry_data['updated_at'] = entry_data['created_at']
        
        if 'related_role_ids' in entry_data and isinstance(entry_data['related_role_ids'], list):
            entry_data['related_role_ids'] = json.dumps(entry_data['related_role_ids'])
        
        if self.use_supabase:
            try:
                self.supabase.table('wiki_entries').insert(entry_data).execute()
            except Exception as e:
                print(f"[Storage] Supabase create_wiki_entry failed: {e}")
        
        cursor = self.sqlite_conn.cursor()
        fields = list(entry_data.keys())
        placeholders = ', '.join(['?' for _ in fields])
        sql = f"INSERT INTO wiki_entries ({', '.join(fields)}) VALUES ({placeholders})"
        cursor.execute(sql, [entry_data.get(f) for f in fields])
        self.sqlite_conn.commit()
        
        return entry_data
    
    # ==================== Sync Operations ====================
    
    def sync_from_supabase(self) -> bool:
        """Sync all data from Supabase to SQLite"""
        if not self.use_supabase:
            print("[Storage] Supabase not configured, skipping sync")
            return False
        
        try:
            print("[Storage] Starting sync from Supabase to SQLite...")
            
            # Sync roles
            result = self.supabase.table('roles').select('*').execute()
            roles = result.data or []
            cursor = self.sqlite_conn.cursor()
            for role in roles:
                fields = list(role.keys())
                placeholders = ', '.join(['?' for _ in fields])
                sql = f"INSERT OR REPLACE INTO roles ({', '.join(fields)}) VALUES ({placeholders})"
                cursor.execute(sql, [role.get(f) for f in fields])
            print(f"[Storage] Synced {len(roles)} roles")
            
            # Sync circles
            result = self.supabase.table('circles').select('*').execute()
            circles = result.data or []
            for circle in circles:
                fields = list(circle.keys())
                placeholders = ', '.join(['?' for _ in fields])
                sql = f"INSERT OR REPLACE INTO circles ({', '.join(fields)}) VALUES ({placeholders})"
                cursor.execute(sql, [circle.get(f) for f in fields])
            print(f"[Storage] Synced {len(circles)} circles")
            
            # Sync posts
            result = self.supabase.table('posts').select('*').execute()
            posts = result.data or []
            for post in posts:
                fields = list(post.keys())
                placeholders = ', '.join(['?' for _ in fields])
                sql = f"INSERT OR REPLACE INTO posts ({', '.join(fields)}) VALUES ({placeholders})"
                cursor.execute(sql, [post.get(f) for f in fields])
            print(f"[Storage] Synced {len(posts)} posts")
            
            self.sqlite_conn.commit()
            print("[Storage] Sync completed successfully")
            return True
            
        except Exception as e:
            print(f"[Storage] Sync failed: {e}")
            return False
    
    def close(self):
        """Close database connections"""
        if self.sqlite_conn:
            self.sqlite_conn.close()

# Global storage instance
storage = StorageService()
