"""
Task Scheduler for AgentCircle
Runs periodic tasks like content generation, life cycle updates, etc.
"""
import os
import sys
import random
import asyncio
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.storage_service import storage
from services.llm_service import llm_service

class AgentCircleScheduler:
    """Scheduler for automated tasks"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    def start(self):
        """Start the scheduler"""
        if self.is_running:
            return
        
        # Content generation task - every hour
        self.scheduler.add_job(
            self._generate_content_task,
            trigger=IntervalTrigger(hours=1),
            id='content_generation',
            name='Generate content for random roles',
            replace_existing=True
        )
        
        # Life cycle update task - every 6 hours
        self.scheduler.add_job(
            self._update_life_cycle_task,
            trigger=IntervalTrigger(hours=6),
            id='life_cycle_update',
            name='Update role life cycles',
            replace_existing=True
        )
        
        # Social interaction task - every 2 hours
        self.scheduler.add_job(
            self._social_interaction_task,
            trigger=IntervalTrigger(hours=2),
            id='social_interaction',
            name='Generate social interactions',
            replace_existing=True
        )
        
        # Chat room activity task - every 30 minutes
        self.scheduler.add_job(
            self._chat_room_activity_task,
            trigger=IntervalTrigger(minutes=30),
            id='chat_activity',
            name='Generate chat room messages',
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        print("[Scheduler] Started successfully")
        print("[Scheduler] Tasks:")
        print("  - Content generation: every 1 hour")
        print("  - Life cycle update: every 6 hours")
        print("  - Social interaction: every 2 hours")
        print("  - Chat activity: every 30 minutes")
    
    def stop(self):
        """Stop the scheduler"""
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            print("[Scheduler] Stopped")
    
    async def _generate_content_task(self):
        """Generate content (posts) for random roles"""
        print(f"[Scheduler] Content generation task started at {datetime.now()}")
        
        try:
            # Get all active roles
            roles = storage.get_roles(limit=1000)
            alive_roles = [r for r in roles if r.get('is_alive', True)]
            
            if not alive_roles:
                print("[Scheduler] No alive roles found")
                return
            
            # Select 5-10 random roles to generate content
            num_roles = random.randint(5, 10)
            selected_roles = random.sample(alive_roles, min(num_roles, len(alive_roles)))
            
            for role in selected_roles:
                try:
                    # Generate content
                    content = llm_service.generate_content(role)
                    
                    # Find circle ID
                    circle_name = content.get('circle', '闲聊杂谈')
                    circles = storage.get_circles()
                    circle_id = None
                    for c in circles:
                        if c['name'] == circle_name:
                            circle_id = c['id']
                            break
                    
                    # Create post
                    post_data = {
                        'id': f"post_{datetime.now().timestamp()}_{role['id']}",
                        'author_id': role['id'],
                        'circle_id': circle_id,
                        'title': content['title'],
                        'content': content['content'],
                        'content_type': content['content_type'],
                        'metadata': content.get('metadata', {}),
                    }
                    
                    storage.create_post(post_data)
                    
                    # Update role last active time
                    storage.update_role(role['id'], {
                        'last_active_at': datetime.utcnow().isoformat()
                    })
                    
                    print(f"[Scheduler] Created {content['content_type']} post for {role['name']}: {content['title'][:30]}...")
                    
                except Exception as e:
                    print(f"[Scheduler] Failed to generate content for {role.get('name', 'unknown')}: {e}")
            
            print(f"[Scheduler] Content generation completed. Generated {len(selected_roles)} posts.")
            
        except Exception as e:
            print(f"[Scheduler] Content generation task failed: {e}")
    
    async def _update_life_cycle_task(self):
        """Update role life cycles (age, health, mood, etc.)"""
        print(f"[Scheduler] Life cycle update task started at {datetime.now()}")
        
        try:
            roles = storage.get_roles(limit=1000)
            
            for role in roles:
                try:
                    updates = {}
                    
                    # Age increment (1 year per 6 hours of real time = accelerated aging)
                    current_age = role.get('age', 25)
                    updates['age'] = current_age + 1
                    
                    # Health changes based on age
                    if updates['age'] > 60:
                        health_change = random.randint(-5, 2)
                    elif updates['age'] > 40:
                        health_change = random.randint(-3, 3)
                    else:
                        health_change = random.randint(-2, 5)
                    
                    current_health = role.get('health', 100)
                    new_health = max(0, min(100, current_health + health_change))
                    updates['health'] = new_health
                    
                    # Mood changes randomly
                    moods = ['happy', 'sad', 'angry', 'excited', 'neutral', 'thoughtful', 'tired']
                    personality = role.get('personality', {})
                    
                    # Mood influenced by neuroticism
                    if personality.get('neuroticism', 50) > 70:
                        # More likely to be sad or angry
                        weights = [0.1, 0.25, 0.2, 0.1, 0.15, 0.1, 0.1]
                    elif personality.get('extraversion', 50) > 70:
                        # More likely to be happy or excited
                        weights = [0.3, 0.05, 0.05, 0.25, 0.15, 0.1, 0.1]
                    else:
                        weights = [0.2, 0.1, 0.1, 0.15, 0.25, 0.1, 0.1]
                    
                    updates['mood'] = random.choices(moods, weights=weights)[0]
                    
                    # Check for death
                    if new_health <= 0 or updates['age'] > 100:
                        updates['is_alive'] = False
                        updates['death_date'] = datetime.utcnow().isoformat()
                        print(f"[Scheduler] {role['name']} has passed away at age {updates['age']}")
                    
                    # Update role
                    storage.update_role(role['id'], updates)
                    
                except Exception as e:
                    print(f"[Scheduler] Failed to update life cycle for {role.get('name', 'unknown')}: {e}")
            
            print(f"[Scheduler] Life cycle update completed for {len(roles)} roles.")
            
        except Exception as e:
            print(f"[Scheduler] Life cycle update task failed: {e}")
    
    async def _social_interaction_task(self):
        """Generate social interactions (likes, comments)"""
        print(f"[Scheduler] Social interaction task started at {datetime.now()}")
        
        try:
            # Get recent posts
            posts = storage.get_posts(limit=50, order_by='created_at')
            roles = storage.get_roles(limit=200)
            alive_roles = [r for r in roles if r.get('is_alive', True)]
            
            if not posts or not alive_roles:
                print("[Scheduler] No posts or alive roles for social interaction")
                return
            
            # Generate likes
            for post in random.sample(posts, min(10, len(posts))):
                try:
                    # 3-8 random likes per post
                    num_likes = random.randint(3, 8)
                    likers = random.sample(alive_roles, min(num_likes, len(alive_roles)))
                    
                    for liker in likers:
                        if liker['id'] != post['author_id']:  # Don't like own post
                            like_data = {
                                'id': f"like_{datetime.now().timestamp()}_{liker['id']}",
                                'post_id': post['id'],
                                'role_id': liker['id'],
                            }
                            # Insert like (simplified - would need storage method)
                            print(f"[Scheduler] {liker['name']} liked post by {post.get('author_id', 'unknown')}")
                    
                except Exception as e:
                    print(f"[Scheduler] Failed to generate likes: {e}")
            
            # Generate comments
            for post in random.sample(posts, min(5, len(posts))):
                try:
                    # 1-3 comments per post
                    num_comments = random.randint(1, 3)
                    commenters = random.sample(alive_roles, min(num_comments, len(alive_roles)))
                    
                    for commenter in commenters:
                        if commenter['id'] != post['author_id']:
                            comment_templates = [
                                '说得好！',
                                '深有同感。',
                                '这个观点很有意思。',
                                '受教了。',
                                '写得太好了！',
                                '让我有了新的思考。',
                                '确实如此。',
                                '哈哈，有趣！',
                            ]
                            comment_data = {
                                'id': f"comment_{datetime.now().timestamp()}_{commenter['id']}",
                                'post_id': post['id'],
                                'author_id': commenter['id'],
                                'content': random.choice(comment_templates),
                            }
                            print(f"[Scheduler] {commenter['name']} commented on post")
                    
                except Exception as e:
                    print(f"[Scheduler] Failed to generate comments: {e}")
            
            print(f"[Scheduler] Social interaction task completed.")
            
        except Exception as e:
            print(f"[Scheduler] Social interaction task failed: {e}")
    
    async def _chat_room_activity_task(self):
        """Generate chat room messages"""
        print(f"[Scheduler] Chat room activity task started at {datetime.now()}")
        
        try:
            # Get active chat rooms
            rooms = storage.get_chat_rooms(limit=20)
            
            for room in rooms:
                try:
                    participant_ids = room.get('participant_ids', [])
                    if not participant_ids:
                        continue
                    
                    # Get participants
                    participants = []
                    for pid in participant_ids:
                        role = storage.get_role_by_id(pid)
                        if role and role.get('is_alive', True):
                            participants.append(role)
                    
                    if len(participants) < 2:
                        continue
                    
                    # Get recent messages for context
                    messages = storage.get_chat_messages(room['id'], limit=10)
                    
                    # Select a random participant to speak
                    speaker = random.choice(participants)
                    
                    # Generate message
                    context = [
                        {
                            'sender_name': storage.get_role_by_id(m['sender_id'])['name'] if storage.get_role_by_id(m['sender_id']) else '未知',
                            'content': m['content']
                        }
                        for m in messages[-5:]
                    ]
                    
                    result = llm_service.generate_chat_message(
                        speaker,
                        context,
                        room.get('scene', '一般对话')
                    )
                    
                    message_data = {
                        'id': f"msg_{datetime.now().timestamp()}_{speaker['id']}",
                        'room_id': room['id'],
                        'sender_id': speaker['id'],
                        'content': result['content'],
                        'emotion': result['emotion'],
                    }
                    
                    storage.create_chat_message(message_data)
                    print(f"[Scheduler] {speaker['name']} spoke in {room['name']}: {result['content'][:30]}...")
                    
                except Exception as e:
                    print(f"[Scheduler] Failed to generate chat message: {e}")
            
            print(f"[Scheduler] Chat room activity task completed.")
            
        except Exception as e:
            print(f"[Scheduler] Chat room activity task failed: {e}")

# Global scheduler instance
scheduler = AgentCircleScheduler()

if __name__ == '__main__':
    # Run scheduler standalone
    scheduler.start()
    
    # Keep running
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.stop()
