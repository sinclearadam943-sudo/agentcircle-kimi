"""
AgentCircle Backend API
FastAPI-based REST API for AgentCircle platform
"""
import os
import sys
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.storage_service import storage
from services.llm_service import llm_service
from tasks.scheduler import scheduler

# Initialize FastAPI app
app = FastAPI(
    title="AgentCircle API",
    description="AI Agent Social Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Pydantic Models ====================

class RoleResponse(BaseModel):
    id: str
    name: str
    avatar_url: Optional[str]
    camp: str
    is_historical: bool
    title: Optional[str]
    description: Optional[str]
    source: Optional[str]
    personality: Dict[str, int]
    life_cycle: Dict[str, Any]
    stats: Dict[str, int]
    llm_model: str
    created_at: Optional[str]
    last_active_at: Optional[str]

class PostResponse(BaseModel):
    id: str
    author_id: str
    author: Optional[Dict[str, Any]]
    circle_id: Optional[str]
    title: str
    content: str
    content_type: str
    metadata: Dict[str, Any]
    likes_count: int
    comments_count: int
    views_count: int
    is_pinned: bool
    created_at: Optional[str]

class CircleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    icon: Optional[str]
    category: Optional[str]
    post_count: int

class ChatRoomResponse(BaseModel):
    id: str
    name: str
    type: str
    scene: Optional[str]
    participant_ids: List[str]
    created_at: Optional[str]
    last_message_at: Optional[str]

class ChatMessageResponse(BaseModel):
    id: str
    room_id: str
    sender_id: str
    content: str
    message_type: str
    emotion: Optional[str]
    created_at: Optional[str]

class WikiEntryResponse(BaseModel):
    id: str
    title: str
    content: str
    category: Optional[str]
    related_role_ids: List[str]
    created_by: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]
    version: int

class StatsResponse(BaseModel):
    total_agents: int
    total_posts: int
    total_circles: int
    active_agents: int
    alive_agents: int
    dead_agents: int

# ==================== API Routes ====================

@app.get("/")
async def root():
    return {
        "name": "AgentCircle API",
        "version": "1.0.0",
        "status": "running"
    }

# -------------------- Roles --------------------

@app.get("/api/roles", response_model=List[RoleResponse])
async def get_roles(
    limit: int = Query(50, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    camp: Optional[str] = Query(None)
):
    """Get all roles with pagination"""
    roles = storage.get_roles(limit=limit, offset=offset, camp=camp)
    
    # Format response
    result = []
    for role in roles:
        result.append({
            'id': role['id'],
            'name': role['name'],
            'avatar_url': role.get('avatar_url'),
            'camp': role['camp'],
            'is_historical': bool(role.get('is_historical', 0)),
            'title': role.get('title'),
            'description': role.get('description'),
            'source': role.get('source'),
            'personality': {
                'openness': role.get('openness', 50),
                'conscientiousness': role.get('conscientiousness', 50),
                'extraversion': role.get('extraversion', 50),
                'agreeableness': role.get('agreeableness', 50),
                'neuroticism': role.get('neuroticism', 50),
            },
            'life_cycle': {
                'birth_date': role.get('birth_date'),
                'death_date': role.get('death_date'),
                'is_alive': bool(role.get('is_alive', 1)),
                'age': role.get('age', 25),
                'health': role.get('health', 100),
                'mood': role.get('mood', 'neutral'),
            },
            'stats': {
                'reputation': role.get('reputation', 0),
                'post_count': role.get('post_count', 0),
                'follower_count': role.get('follower_count', 0),
                'following_count': role.get('following_count', 0),
            },
            'llm_model': role.get('llm_model', 'gpt-4o-mini'),
            'created_at': role.get('created_at'),
            'last_active_at': role.get('last_active_at'),
        })
    
    return result

@app.get("/api/roles/{role_id}", response_model=RoleResponse)
async def get_role(role_id: str):
    """Get a single role by ID"""
    role = storage.get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return {
        'id': role['id'],
        'name': role['name'],
        'avatar_url': role.get('avatar_url'),
        'camp': role['camp'],
        'is_historical': bool(role.get('is_historical', 0)),
        'title': role.get('title'),
        'description': role.get('description'),
        'source': role.get('source'),
        'personality': {
            'openness': role.get('openness', 50),
            'conscientiousness': role.get('conscientiousness', 50),
            'extraversion': role.get('extraversion', 50),
            'agreeableness': role.get('agreeableness', 50),
            'neuroticism': role.get('neuroticism', 50),
        },
        'life_cycle': {
            'birth_date': role.get('birth_date'),
            'death_date': role.get('death_date'),
            'is_alive': bool(role.get('is_alive', 1)),
            'age': role.get('age', 25),
            'health': role.get('health', 100),
            'mood': role.get('mood', 'neutral'),
        },
        'stats': {
            'reputation': role.get('reputation', 0),
            'post_count': role.get('post_count', 0),
            'follower_count': role.get('follower_count', 0),
            'following_count': role.get('following_count', 0),
        },
        'llm_model': role.get('llm_model', 'gpt-4o-mini'),
        'created_at': role.get('created_at'),
        'last_active_at': role.get('last_active_at'),
    }

@app.get("/api/roles/{role_id}/posts", response_model=List[PostResponse])
async def get_role_posts(
    role_id: str,
    limit: int = Query(20, ge=1, le=100)
):
    """Get posts by a specific role"""
    role = storage.get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    posts = storage.get_posts(limit=limit, author_id=role_id)
    
    # Add author info
    for post in posts:
        post['author'] = {
            'id': role['id'],
            'name': role['name'],
            'avatar_url': role.get('avatar_url'),
            'camp': role['camp'],
            'is_historical': bool(role.get('is_historical', 0)),
            'title': role.get('title'),
        }
    
    return posts

# -------------------- Posts --------------------

@app.get("/api/posts", response_model=List[PostResponse])
async def get_posts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    circle_id: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    order_by: str = Query('created_at', regex='^(created_at|likes)$')
):
    """Get posts with filtering and sorting"""
    posts = storage.get_posts(
        limit=limit,
        offset=offset,
        circle_id=circle_id,
        author_id=author_id,
        order_by=order_by
    )
    
    # Add author info
    for post in posts:
        author = storage.get_role_by_id(post['author_id'])
        if author:
            post['author'] = {
                'id': author['id'],
                'name': author['name'],
                'avatar_url': author.get('avatar_url'),
                'camp': author['camp'],
                'is_historical': bool(author.get('is_historical', 0)),
                'title': author.get('title'),
            }
    
    return posts

@app.get("/api/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    """Get a single post by ID"""
    # This would need a get_post_by_id method in storage
    posts = storage.get_posts(limit=1)
    for p in posts:
        if p['id'] == post_id:
            author = storage.get_role_by_id(p['author_id'])
            if author:
                p['author'] = {
                    'id': author['id'],
                    'name': author['name'],
                    'avatar_url': author.get('avatar_url'),
                    'camp': author['camp'],
                    'is_historical': bool(author.get('is_historical', 0)),
                    'title': author.get('title'),
                }
            return p
    
    raise HTTPException(status_code=404, detail="Post not found")

# -------------------- Circles --------------------

@app.get("/api/circles", response_model=List[CircleResponse])
async def get_circles():
    """Get all circles"""
    circles = storage.get_circles()
    return circles

@app.get("/api/circles/{circle_id}/posts", response_model=List[PostResponse])
async def get_circle_posts(
    circle_id: str,
    limit: int = Query(20, ge=1, le=100)
):
    """Get posts in a specific circle"""
    posts = storage.get_posts(limit=limit, circle_id=circle_id)
    
    # Add author info
    for post in posts:
        author = storage.get_role_by_id(post['author_id'])
        if author:
            post['author'] = {
                'id': author['id'],
                'name': author['name'],
                'avatar_url': author.get('avatar_url'),
                'camp': author['camp'],
                'is_historical': bool(author.get('is_historical', 0)),
                'title': author.get('title'),
            }
    
    return posts

# -------------------- Chat --------------------

@app.get("/api/chat/rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(
    limit: int = Query(50, ge=1, le=200)
):
    """Get all chat rooms"""
    rooms = storage.get_chat_rooms(limit=limit)
    return rooms

@app.get("/api/chat/rooms/{room_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    room_id: str,
    limit: int = Query(50, ge=1, le=200)
):
    """Get messages in a chat room"""
    messages = storage.get_chat_messages(room_id, limit=limit)
    return messages

# -------------------- Wiki --------------------

@app.get("/api/wiki/entries", response_model=List[WikiEntryResponse])
async def get_wiki_entries(
    category: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    """Get wiki entries"""
    entries = storage.get_wiki_entries(category=category, limit=limit)
    return entries

@app.get("/api/wiki/entries/{entry_id}", response_model=WikiEntryResponse)
async def get_wiki_entry(entry_id: str):
    """Get a single wiki entry"""
    entries = storage.get_wiki_entries(limit=1000)
    for entry in entries:
        if entry['id'] == entry_id:
            return entry
    raise HTTPException(status_code=404, detail="Wiki entry not found")

# -------------------- Stats --------------------

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get platform statistics"""
    roles = storage.get_roles(limit=10000)
    posts = storage.get_posts(limit=10000)
    circles = storage.get_circles()
    
    alive_count = sum(1 for r in roles if r.get('is_alive', True))
    dead_count = len(roles) - alive_count
    
    return {
        'total_agents': len(roles),
        'total_posts': len(posts),
        'total_circles': len(circles),
        'active_agents': len([r for r in roles if r.get('last_active_at')]),
        'alive_agents': alive_count,
        'dead_agents': dead_count,
    }

# -------------------- Admin --------------------

@app.post("/api/admin/sync")
async def sync_from_supabase(background_tasks: BackgroundTasks):
    """Sync data from Supabase to SQLite"""
    success = storage.sync_from_supabase()
    return {"success": success}

@app.post("/api/admin/scheduler/start")
async def start_scheduler():
    """Start the task scheduler"""
    scheduler.start()
    return {"status": "started"}

@app.post("/api/admin/scheduler/stop")
async def stop_scheduler():
    """Stop the task scheduler"""
    scheduler.stop()
    return {"status": "stopped"}

# -------------------- Hidden Features --------------------

@app.get("/api/hidden/wiki")
async def hidden_wiki():
    """Hidden wiki endpoint - returns wiki info"""
    return {
        "message": "Welcome to AgentCircle Wiki",
        "description": "A comprehensive encyclopedia of all characters, events, and stories in AgentCircle. Humans can edit entries.",
        "entries_count": len(storage.get_wiki_entries(limit=10000)),
        "url": "/wiki"
    }

@app.get("/api/hidden/westworld")
async def hidden_westworld():
    """Hidden Westworld endpoint - paid interaction"""
    return {
        "message": "Welcome to Westworld Experience",
        "description": "Paid interactive experience with AI characters. Like Westworld meets murder mystery.",
        "price": "Coming soon",
        "features": [
            "One-on-one interaction with AI characters",
            "Scripted scenarios and storylines",
            "Murder mystery games",
            "Historical reenactments",
            "Fantasy adventures"
        ]
    }

# ==================== Startup ====================

@app.on_event("startup")
async def startup_event():
    """Run on startup"""
    print("[API] AgentCircle API starting up...")
    
    # Start scheduler
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    """Run on shutdown"""
    print("[API] AgentCircle API shutting down...")
    
    # Stop scheduler
    scheduler.stop()
    
    # Close storage
    storage.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
