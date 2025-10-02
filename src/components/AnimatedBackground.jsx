import { useEffect, useMemo } from 'react'

const particles = Array.from({ length: 25 }, (_, i) => i)
const environmentalEmojis = ['🍃', '🌿', '💧', '🌱', '🦋', '🌸', '✨']

export default function AnimatedBackground() {
  const positions = useMemo(() => particles.map((_, index) => ({
    left: Math.random() * 100,
    duration: 6 + Math.random() * 12,
    delay: Math.random() * 8,
    emoji: environmentalEmojis[index % environmentalEmojis.length],
    size: 0.8 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 20
  })), [])

  useEffect(() => {}, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ contain: 'paint', backfaceVisibility: 'hidden' }}>
      {/* Overscan to avoid seam at extreme zoom levels */}
      <div className="absolute -inset-[10vh]" style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
        <div className="absolute inset-0 bg-grid bg-[length:24px_24px] opacity-10 dark:opacity-[0.08]" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-400/25 dark:bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-sky-400/25 dark:bg-sky-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-emerald-300/10 to-sky-300/10 rounded-full blur-3xl" />
      </div>

      {/* Soft aurora beams */}
      <div className="absolute inset-0 bg-aurora animate-gradient-x opacity-40" />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.2) 0, rgba(255,255,255,.2) 1px, transparent 1px, transparent 4px)' }} />

      <div className="absolute inset-0" style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
        {positions.map((p, idx) => (
          <span
            key={idx}
            className="absolute animate-fall transition-opacity duration-1000"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              top: '-5%',
              fontSize: `${p.size * 18}px`,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
              opacity: 0.7,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
      
      {/* Floating bubbles for water theme */}
      <div className="absolute inset-0 pointer-events-none" style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-sky-300/20 dark:bg-sky-400/10 animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fall {
          0% { 
            transform: translate3d(0, -10vh, 0) rotate(0deg); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          50% { 
            transform: translate3d(var(--drift, 0px), 50vh, 0) rotate(180deg);
            opacity: 1;
          }
          100% { 
            transform: translate3d(var(--drift, 0px), 110vh, 0) rotate(360deg); 
            opacity: 0; 
          }
        }
        
        @keyframes bubble {
          0% { 
            transform: translate3d(0, 100vh, 0) scale(0.8);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { 
            transform: translate3d(0, -10vh, 0) scale(1.2);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation-name: fall;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        .animate-bubble {
          animation-name: bubble;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  )
}

