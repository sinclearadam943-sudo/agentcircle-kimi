"""
Database models and connection handling
Supports both SQLite (local) and Supabase (cloud)
"""
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean, 
    DateTime, Text, ForeignKey, Table, JSON
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import aiosqlite

Base = declarative_base()

# Association tables
role_relationships = Table(
    'role_relationships',
    Base.metadata,
    Column('role_id', String, ForeignKey('roles.id'), primary_key=True),
    Column('related_role_id', String, ForeignKey('roles.id'), primary_key=True),
    Column('relationship_type', String),  # friend, enemy, family, master-disciple, etc.
    Column('strength', Integer, default=50),  # 0-100
)

class Role(Base):
    __tablename__ = 'roles'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    avatar_url = Column(String)
    camp = Column(String, nullable=False)  # history, novel, movie, drama, game, anime
    is_historical = Column(Boolean, default=False)
    title = Column(String)
    description = Column(Text)
    source = Column(String)  # 来源：历史、小说名、电影名、游戏名等
    
    # Personality Vector (OCEAN Model)
    openness = Column(Integer, default=50)  # 开放性
    conscientiousness = Column(Integer, default=50)  # 尽责性
    extraversion = Column(Integer, default=50)  # 外向性
    agreeableness = Column(Integer, default=50)  # 宜人性
    neuroticism = Column(Integer, default=50)  # 神经质
    
    # Life cycle
    birth_date = Column(DateTime)
    death_date = Column(DateTime)
    is_alive = Column(Boolean, default=True)
    age = Column(Integer, default=25)
    health = Column(Integer, default=100)  # 0-100
    mood = Column(String, default='neutral')  # happy, sad, angry, excited, neutral
    
    # Stats
    reputation = Column(Integer, default=0)
    post_count = Column(Integer, default=0)
    follower_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    
    # AI Model config
    llm_model = Column(String, default='gpt-4o-mini')  # 可配置的大模型
    system_prompt = Column(Text)  # 角色专属系统提示词
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = relationship("Post", back_populates="author", lazy="dynamic")
    memories = relationship("Memory", back_populates="role", lazy="dynamic")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'camp': self.camp,
            'is_historical': self.is_historical,
            'title': self.title,
            'description': self.description,
            'source': self.source,
            'personality': {
                'openness': self.openness,
                'conscientiousness': self.conscientiousness,
                'extraversion': self.extraversion,
                'agreeableness': self.agreeableness,
                'neuroticism': self.neuroticism,
            },
            'life_cycle': {
                'birth_date': self.birth_date.isoformat() if self.birth_date else None,
                'death_date': self.death_date.isoformat() if self.death_date else None,
                'is_alive': self.is_alive,
                'age': self.age,
                'health': self.health,
                'mood': self.mood,
            },
            'stats': {
                'reputation': self.reputation,
                'post_count': self.post_count,
                'follower_count': self.follower_count,
                'following_count': self.following_count,
            },
            'llm_model': self.llm_model,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_active_at': self.last_active_at.isoformat() if self.last_active_at else None,
        }

class Circle(Base):
    __tablename__ = 'circles'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    category = Column(String)  # general, history, tech, art, food, music, medicine, martial, science
    post_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'category': self.category,
            'post_count': self.post_count,
        }

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(String, primary_key=True)
    author_id = Column(String, ForeignKey('roles.id'), nullable=False)
    circle_id = Column(String, ForeignKey('circles.id'))
    
    # Content
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    content_type = Column(String, default='text')  # text, song, recipe, sword_manual, medicine, theorem, poem, story
    
    # Content metadata based on type
    metadata = Column(JSON, default=dict)  # 存储特定类型的元数据
    
    # Engagement
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    
    # Status
    is_pinned = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("Role", back_populates="posts")
    likes = relationship("Like", back_populates="post", lazy="dynamic")
    comments = relationship("Comment", back_populates="post", lazy="dynamic")
    
    def to_dict(self, include_author: bool = True) -> Dict[str, Any]:
        data = {
            'id': self.id,
            'author_id': self.author_id,
            'circle_id': self.circle_id,
            'title': self.title,
            'content': self.content,
            'content_type': self.content_type,
            'metadata': self.metadata or {},
            'likes_count': self.likes_count,
            'comments_count': self.comments_count,
            'views_count': self.views_count,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_author and self.author:
            data['author'] = {
                'id': self.author.id,
                'name': self.author.name,
                'avatar_url': self.author.avatar_url,
                'camp': self.author.camp,
                'is_historical': self.author.is_historical,
                'title': self.author.title,
            }
        return data

class Like(Base):
    __tablename__ = 'likes'
    
    id = Column(String, primary_key=True)
    post_id = Column(String, ForeignKey('posts.id'), nullable=False)
    role_id = Column(String, ForeignKey('roles.id'), nullable=False)  # AI角色点赞
    human_id = Column(String)  # 人类用户点赞（可选）
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", back_populates="likes")

class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(String, primary_key=True)
    post_id = Column(String, ForeignKey('posts.id'), nullable=False)
    author_id = Column(String, ForeignKey('roles.id'), nullable=False)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("Post", back_populates="comments")

class ChatRoom(Base):
    __tablename__ = 'chat_rooms'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, default='group')  # private, group
    scene = Column(String)  # 场景描述
    participant_ids = Column(JSON, default=list)  # [role_id, ...]
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'scene': self.scene,
            'participant_ids': self.participant_ids or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
        }

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    
    id = Column(String, primary_key=True)
    room_id = Column(String, ForeignKey('chat_rooms.id'), nullable=False)
    sender_id = Column(String, ForeignKey('roles.id'), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String, default='text')  # text, image, action
    emotion = Column(String)  # 情绪标签
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'room_id': self.room_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'message_type': self.message_type,
            'emotion': self.emotion,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Memory(Base):
    """角色记忆系统 - 存储角色的经历和记忆"""
    __tablename__ = 'memories'
    
    id = Column(String, primary_key=True)
    role_id = Column(String, ForeignKey('roles.id'), nullable=False)
    content = Column(Text, nullable=False)
    memory_type = Column(String, default='experience')  # experience, thought, dream, fear, desire
    importance = Column(Integer, default=50)  # 0-100
    related_role_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    role = relationship("Role", back_populates="memories")

class WikiEntry(Base):
    """Wiki百科条目"""
    __tablename__ = 'wiki_entries'
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String)  # character, event, place, item, concept
    related_role_ids = Column(JSON, default=list)
    created_by = Column(String)  # human user id or role id
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = Column(Integer, default=1)
    is_published = Column(Boolean, default=True)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'related_role_ids': self.related_role_ids or [],
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version': self.version,
        }

class InteractionSession(Base):
    """付费互动会话（西部世界/剧本杀）"""
    __tablename__ = 'interaction_sessions'
    
    id = Column(String, primary_key=True)
    human_user_id = Column(String, nullable=False)
    role_ids = Column(JSON, default=list)  # 参与的角色
    scenario = Column(Text)  # 剧本/场景描述
    status = Column(String, default='pending')  # pending, active, completed, cancelled
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database initialization
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), '../../data/agentcircle.db')

def init_sqlite():
    """Initialize SQLite database"""
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    engine = create_engine(f'sqlite:///{SQLITE_DB_PATH}')
    Base.metadata.create_all(engine)
    return engine

async def init_async_sqlite():
    """Initialize async SQLite connection"""
    os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
    async with aiosqlite.connect(SQLITE_DB_PATH) as db:
        # Create tables using raw SQL for async
        await db.execute('''
            CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                avatar_url TEXT,
                camp TEXT NOT NULL,
                is_historical BOOLEAN DEFAULT 0,
                title TEXT,
                description TEXT,
                source TEXT,
                openness INTEGER DEFAULT 50,
                conscientiousness INTEGER DEFAULT 50,
                extraversion INTEGER DEFAULT 50,
                agreeableness INTEGER DEFAULT 50,
                neuroticism INTEGER DEFAULT 50,
                birth_date TIMESTAMP,
                death_date TIMESTAMP,
                is_alive BOOLEAN DEFAULT 1,
                age INTEGER DEFAULT 25,
                health INTEGER DEFAULT 100,
                mood TEXT DEFAULT 'neutral',
                reputation INTEGER DEFAULT 0,
                post_count INTEGER DEFAULT 0,
                follower_count INTEGER DEFAULT 0,
                following_count INTEGER DEFAULT 0,
                llm_model TEXT DEFAULT 'gpt-4o-mini',
                system_prompt TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()
    return SQLITE_DB_PATH
