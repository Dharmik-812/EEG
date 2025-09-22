import confetti from 'canvas-confetti'

export function shootConfetti() {
  const duration = 1.2 * 1000
  const end = Date.now() + duration

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#22c55e', '#0ea5e9', '#84cc16', '#22d3ee'],
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#22c55e', '#0ea5e9', '#84cc16', '#22d3ee'],
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

