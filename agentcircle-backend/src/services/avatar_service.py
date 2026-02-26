"""
Avatar Generation Service for AgentCircle
Generates unique avatars for each character
"""
import os
import random
from PIL import Image, ImageDraw, ImageFont
import io
import base64

class AvatarService:
    """Service for generating character avatars"""
    
    # Color palettes for different camps
    COLOR_PALETTES = {
        'history': [
            ('#8B4513', '#D2691E'),  # Brown tones
            ('#2F4F4F', '#708090'),  # Dark slate
            ('#800000', '#B22222'),  # Dark red
            ('#4B0082', '#8A2BE2'),  # Indigo
            ('#006400', '#228B22'),  # Dark green
        ],
        'novel': [
            ('#1E90FF', '#87CEEB'),  # Blue
            ('#FF6347', '#FFA07A'),  # Tomato
            ('#9370DB', '#DDA0DD'),  # Purple
            ('#20B2AA', '#48D1CC'),  # Sea green
            ('#FF69B4', '#FFB6C1'),  # Hot pink
        ],
        'movie': [
            ('#FF4500', '#FF8C00'),  # Orange red
            ('#32CD32', '#7CFC00'),  # Lime green
            ('#00CED1', '#40E0D0'),  # Dark turquoise
            ('#FF1493', '#FF69B4'),  # Deep pink
            ('#FFD700', '#FFFACD'),  # Gold
        ],
        'game': [
            ('#9400D3', '#BA55D3'),  # Dark violet
            ('#00FF7F', '#98FB98'),  # Spring green
            ('#DC143C', '#FF6B6B'),  # Crimson
            ('#4169E1', '#87CEFA'),  # Royal blue
            ('#FF8C00', '#FFD700'),  # Dark orange
        ],
        'anime': [
            ('#FF69B4', '#FFC0CB'),  # Pink
            ('#00BFFF', '#87CEFA'),  # Deep sky blue
            ('#7B68EE', '#E6E6FA'),  # Medium slate blue
            ('#FF1493', '#FFB6C1'),  # Deep pink
            ('#00FA9A', '#98FB98'),  # Medium spring green
        ],
        'drama': [
            ('#8B0000', '#CD5C5C'),  # Dark red
            ('#191970', '#6495ED'),  # Midnight blue
            ('#556B2F', '#9ACD32'),  # Dark olive green
            ('#8B008B', '#DA70D6'),  # Dark magenta
            ('#B8860B', '#FFD700'),  # Dark goldenrod
        ],
    }
    
    # Avatar patterns
    PATTERNS = ['circle', 'square', 'diamond', 'hexagon', 'star']
    
    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or os.path.join(os.path.dirname(__file__), '../../avatars')
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_avatar(self, role: dict, size: int = 256) -> str:
        """
        Generate an avatar for a role
        
        Args:
            role: Role dictionary
            size: Avatar size in pixels
        
        Returns:
            Path to generated avatar file
        """
        role_id = role['id']
        name = role['name']
        camp = role.get('camp', 'history')
        
        # Get color palette for camp
        palette = random.choice(self.COLOR_PALETTES.get(camp, self.COLOR_PALETTES['history']))
        bg_color, accent_color = palette
        
        # Create image
        img = Image.new('RGB', (size, size), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Draw pattern based on role ID hash for consistency
        pattern_seed = hash(role_id) % len(self.PATTERNS)
        pattern = self.PATTERNS[pattern_seed]
        
        self._draw_pattern(draw, pattern, size, accent_color)
        
        # Draw initials
        initials = self._get_initials(name)
        self._draw_initials(draw, initials, size)
        
        # Save avatar
        avatar_path = os.path.join(self.output_dir, f'{role_id}.png')
        img.save(avatar_path, 'PNG')
        
        return avatar_path
    
    def _draw_pattern(self, draw: ImageDraw, pattern: str, size: int, color: str):
        """Draw background pattern"""
        center = size // 2
        
        if pattern == 'circle':
            # Concentric circles
            for r in range(size // 4, size // 2, 20):
                draw.ellipse([center - r, center - r, center + r, center + r], 
                           outline=color, width=3)
        
        elif pattern == 'square':
            # Rotating squares
            for i, s in enumerate(range(size // 4, size // 2, 25)):
                offset = i * 5
                draw.rectangle([center - s + offset, center - s + offset, 
                              center + s - offset, center + s - offset], 
                             outline=color, width=3)
        
        elif pattern == 'diamond':
            # Diamond shapes
            for d in range(size // 4, size // 2, 20):
                points = [(center, center - d), (center + d, center), 
                         (center, center + d), (center - d, center)]
                draw.polygon(points, outline=color, width=3)
        
        elif pattern == 'hexagon':
            # Hexagon pattern
            for h in range(size // 4, size // 2, 20):
                points = self._get_hexagon_points(center, center, h)
                draw.polygon(points, outline=color, width=3)
        
        elif pattern == 'star':
            # Star pattern
            for r in range(size // 4, size // 2, 20):
                points = self._get_star_points(center, center, r, r // 2, 5)
                draw.polygon(points, outline=color, width=3)
    
    def _get_hexagon_points(self, cx: int, cy: int, radius: int) -> list:
        """Get hexagon points"""
        import math
        points = []
        for i in range(6):
            angle = math.pi / 3 * i - math.pi / 6
            x = cx + radius * math.cos(angle)
            y = cy + radius * math.sin(angle)
            points.append((x, y))
        return points
    
    def _get_star_points(self, cx: int, cy: int, outer_r: int, inner_r: int, points: int) -> list:
        """Get star points"""
        import math
        star_points = []
        for i in range(points * 2):
            angle = math.pi / points * i - math.pi / 2
            r = outer_r if i % 2 == 0 else inner_r
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            star_points.append((x, y))
        return star_points
    
    def _get_initials(self, name: str) -> str:
        """Get initials from name"""
        # For Chinese names, take first character
        if any('\u4e00' <= c <= '\u9fff' for c in name):
            return name[0]
        
        # For English names, take first letters
        parts = name.split()
        if len(parts) >= 2:
            return parts[0][0] + parts[-1][0]
        return name[:2].upper()
    
    def _draw_initials(self, draw: ImageDraw, initials: str, size: int):
        """Draw initials on avatar"""
        # Try to load a font, fallback to default
        try:
            font_size = size // 2 if len(initials) == 1 else size // 3
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), initials, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - text_height // 4
        
        # Draw text with shadow
        shadow_offset = 3
        draw.text((x + shadow_offset, y + shadow_offset), initials, fill='#00000040', font=font)
        draw.text((x, y), initials, fill='#FFFFFF', font=font)
    
    def generate_all_avatars(self, roles: list) -> dict:
        """Generate avatars for all roles"""
        avatar_paths = {}
        for role in roles:
            try:
                path = self.generate_avatar(role)
                avatar_paths[role['id']] = path
                print(f"[Avatar] Generated for {role['name']}: {path}")
            except Exception as e:
                print(f"[Avatar] Failed for {role['name']}: {e}")
        return avatar_paths

# Global avatar service
avatar_service = AvatarService()

if __name__ == '__main__':
    # Test
    test_roles = [
        {'id': 'test_001', 'name': '李白', 'camp': 'history'},
        {'id': 'test_002', 'name': 'Harry Potter', 'camp': 'movie'},
        {'id': 'test_003', 'name': '孙悟空', 'camp': 'novel'},
    ]
    
    for role in test_roles:
        path = avatar_service.generate_avatar(role)
        print(f"Generated: {path}")
