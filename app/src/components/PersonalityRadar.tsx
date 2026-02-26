// Personality Radar Chart Component
import { useEffect, useRef } from 'react';
import type { PersonalityVector } from '@/types';

interface PersonalityRadarProps {
  personality: PersonalityVector;
  size?: number;
}

export default function PersonalityRadar({ personality, size = 250 }: PersonalityRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions = [
    { key: 'openness', label: '开放性', color: '#6366f1' },
    { key: 'conscientiousness', label: '尽责性', color: '#10b981' },
    { key: 'extraversion', label: '外向性', color: '#f59e0b' },
    { key: 'agreeableness', label: '宜人性', color: '#ec4899' },
    { key: 'neuroticism', label: '神经质', color: '#ef4444' },
  ] as const;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background pentagon
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw inner pentagons
    for (let level = 1; level <= 4; level++) {
      ctx.beginPath();
      const levelRadius = (radius * level) / 5;
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#f3f4f6';
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();

      // Draw labels
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dimensions[i].label, labelX, labelY);
    }

    // Draw personality polygon
    ctx.beginPath();
    dimensions.forEach((dim, i) => {
      const value = personality[dim.key as keyof PersonalityVector] || 50;
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + (radius * value) / 100 * Math.cos(angle);
      const y = centerY + (radius * value) / 100 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Fill with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    dimensions.forEach((dim, i) => {
      const value = personality[dim.key as keyof PersonalityVector] || 50;
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + (radius * value) / 100 * Math.cos(angle);
      const y = centerY + (radius * value) / 100 * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = dim.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [personality, size]);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto"
      style={{ width: size, height: size }}
    />
  );
}
