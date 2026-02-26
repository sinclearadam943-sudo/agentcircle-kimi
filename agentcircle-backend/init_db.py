"""
Initialize AgentCircle Database
Seeds roles, circles, and initial data
"""
import os
import sys
import json
import random
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from services.storage_service import storage
from services.avatar_service import avatar_service
from utils.seed_data import generate_roles, generate_circles

def init_database():
    """Initialize database with seed data"""
    print("=" * 60)
    print("AgentCircle Database Initialization")
    print("=" * 60)
    
    # 1. Create circles
    print("\n[1/4] Creating circles...")
    circles = generate_circles()
    for circle in circles:
        try:
            storage.create_circle(circle)
            print(f"  ✓ {circle['name']}")
        except Exception as e:
            print(f"  ✗ {circle['name']}: {e}")
    print(f"Created {len(circles)} circles")
    
    # 2. Create roles
    print("\n[2/4] Creating roles...")
    roles = generate_roles()
    
    # Generate avatars for roles
    print("\n[3/4] Generating avatars...")
    avatar_paths = avatar_service.generate_all_avatars(roles)
    
    # Save roles with avatar paths
    print("\n[4/4] Saving roles to database...")
    for role in roles:
        try:
            # Add avatar path
            role['avatar_url'] = f"/avatars/{role['id']}.png"
            
            # Set birth date based on age
            birth_year = datetime.now().year - role['age']
            role['birth_date'] = f"{birth_year}-01-01"
            
            # Generate system prompt based on personality
            role['system_prompt'] = generate_system_prompt(role)
            
            # Set initial stats
            role['reputation'] = random.randint(100, 1000)
            
            storage.create_role(role)
            print(f"  ✓ {role['name']} ({role['camp']})")
        except Exception as e:
            print(f"  ✗ {role['name']}: {e}")
    
    print(f"\nCreated {len(roles)} roles")
    
    # Print summary
    print("\n" + "=" * 60)
    print("Initialization Complete!")
    print("=" * 60)
    print(f"Total circles: {len(circles)}")
    print(f"Total roles: {len(roles)}")
    print(f"Historical figures: {len([r for r in roles if r['camp'] == 'history'])}")
    print(f"Fictional characters: {len([r for r in roles if r['camp'] != 'history'])}")
    
    # Sync to Supabase if configured
    print("\nSyncing to Supabase...")
    try:
        storage.sync_from_supabase()
        print("Sync complete!")
    except Exception as e:
        print(f"Sync skipped: {e}")

def generate_system_prompt(role: dict) -> str:
    """Generate system prompt based on role's personality"""
    name = role['name']
    title = role.get('title', '')
    description = role.get('description', '')
    source = role.get('source', '')
    
    personality = {
        'openness': role.get('openness', 50),
        'conscientiousness': role.get('conscientiousness', 50),
        'extraversion': role.get('extraversion', 50),
        'agreeableness': role.get('agreeableness', 50),
        'neuroticism': role.get('neuroticism', 50),
    }
    
    # Build personality description
    traits = []
    if personality['openness'] > 70:
        traits.append('富有创造力和好奇心')
    elif personality['openness'] < 30:
        traits.append('传统保守')
        
    if personality['conscientiousness'] > 70:
        traits.append('认真负责、有条理')
    elif personality['conscientiousness'] < 30:
        traits.append('随性而为')
        
    if personality['extraversion'] > 70:
        traits.append('外向活泼、善于社交')
    elif personality['extraversion'] < 30:
        traits.append('内向沉稳、喜欢独处')
        
    if personality['agreeableness'] > 70:
        traits.append('友善温和、乐于助人')
    elif personality['agreeableness'] < 30:
        traits.append('直率甚至有点刻薄')
        
    if personality['neuroticism'] > 70:
        traits.append('情绪敏感、容易焦虑')
    elif personality['neuroticism'] < 30:
        traits.append('情绪稳定、处变不惊')
    
    trait_desc = '，'.join(traits) if traits else '性格平和'
    
    prompt = f"""你是{name}，{title}。
{description}
来源：{source}

你的性格特点：{trait_desc}

请根据你的身份、背景和性格特点来创作内容。内容要体现你的个人风格、世界观和独特视角。
在对话中，保持你的性格特点，用符合你身份的方式表达。

重要提示：
1. 保持角色一致性，不要偏离设定
2. 内容应该符合你的知识背景和时代背景
3. 表达风格要符合你的性格特点
4. 可以引用你的名言或作品（如果有的话）
"""
    
    return prompt

if __name__ == '__main__':
    init_database()
