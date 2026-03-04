import confetti from 'canvas-confetti'

const GF_COLORS = ['#0D9488', '#F97066', '#FCD34D', '#D4A574']

export function firePurchaseConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: GF_COLORS,
  })
}

export function fireAchievementConfetti() {
  const duration = 800
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FCD34D', '#F59E0B'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FCD34D', '#F59E0B'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}
