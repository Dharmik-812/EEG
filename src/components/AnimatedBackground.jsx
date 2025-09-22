import { useEffect, useMemo } from 'react'

const leaves = Array.from({ length: 20 }, (_, i) => i)

export default function AnimatedBackground() {
  const positions = useMemo(() => leaves.map(() => ({
    left: Math.random() * 100,
    duration: 8 + Math.random() * 10,
    delay: Math.random() * 5
  })), [])

  useEffect(() => {}, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-[length:24px_24px] opacity-10 dark:opacity-[0.08]" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-400/25 dark:bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-sky-400/25 dark:bg-sky-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-emerald-300/10 to-sky-300/10 rounded-full blur-3xl" />

      <div className="absolute inset-0">
        {positions.map((p, idx) => (
          <span
            key={idx}
            className="absolute text-emerald-500/60 dark:text-emerald-400/50 animate-fall"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              top: '-5%',
            }}
          >
            🍃
          </span>
        ))}
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.4; }
        }
        .animate-fall {
          animation-name: fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          font-size: 18px;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
        }
      `}</style>
    </div>
  )
}

