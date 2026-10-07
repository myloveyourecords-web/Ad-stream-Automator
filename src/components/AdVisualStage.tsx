import React, { useEffect, useRef } from 'react';
import { AdCreative } from '../types';
import { 
  Server, CreditCard, Gamepad2, Car, Sparkles, Activity, 
  ShoppingBag, ShieldCheck, TrendingUp, Swords, Laptop, Droplets 
} from 'lucide-react';

interface AdVisualStageProps {
  ad: AdCreative;
  isPlaying: boolean;
  progressPercent: number;
}

export const AdVisualStage: React.FC<AdVisualStageProps> = ({ ad, isPlaying, progressPercent }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle canvas dynamic particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      particles = Array.from({ length: 28 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2,
        alpha: Math.random() * 0.4 + 0.1,
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw floating nodes/particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (isPlaying) {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${ad.accentColor}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${ad.accentColor}20`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ad.accentColor, isPlaying]);

  const renderIcon = () => {
    const props = { className: "w-12 h-12", style: { color: ad.accentColor } };
    switch (ad.iconName) {
      case 'Server': return <Server {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      case 'Gamepad2': return <Gamepad2 {...props} />;
      case 'Car': return <Car {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'ShoppingBag': return <ShoppingBag {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Swords': return <Swords {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'Droplets': return <Droplets {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className={`relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-br ${ad.bgGradient} border border-slate-700/60 shadow-inner flex flex-col justify-between p-6 select-none`}>
      {/* Background Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

      {/* Decorative Glow Orb */}
      <div 
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: ad.accentColor }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: ad.accentColor }}
      />

      {/* Top Overlay Badge Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-black/40 backdrop-blur-md text-slate-200 border border-white/10">
            {ad.category}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-emerald-300 backdrop-blur-md border border-emerald-500/20">
            ${ad.cpm.toFixed(2)} eCPM
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>SIMULATED AD STREAM</span>
        </div>
      </div>

      {/* Center Cinematic Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 shadow-lg backdrop-blur-md border transition-transform duration-500"
          style={{ 
            backgroundColor: `${ad.accentColor}18`,
            borderColor: `${ad.accentColor}40`,
            transform: isPlaying ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {renderIcon()}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-md line-clamp-1">
          {ad.headline}
        </h3>
        <p className="text-sm text-slate-300/90 max-w-lg mt-1 line-clamp-2 drop-shadow">
          {ad.description}
        </p>
      </div>

      {/* Bottom Sponsor Info & App Stats */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">{ad.brand}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">{ad.sponsorTag}</span>
        </div>
        {ad.installCount && (
          <span className="font-medium text-slate-300">
            ★ {ad.rating} ({ad.installCount})
          </span>
        )}
      </div>

      {/* Progress Line Inside Card */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full transition-all duration-100 ease-linear"
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: ad.accentColor 
          }}
        />
      </div>
    </div>
  );
};
