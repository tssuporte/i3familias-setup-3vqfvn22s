import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  name: string
  onClose: () => void
}

export function BirthdayOverlay({ name, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Fade in over 0.5s, hold 9s, fade out 0.5s (10s total)
    const fadeInTimer = setTimeout(() => {
      setVisible(true)
    }, 50)

    const fadeOutTimer = setTimeout(() => {
      setVisible(false)
    }, 9500)

    const closeTimer = setTimeout(() => {
      onClose()
    }, 10000)

    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(closeTimer)
    }
  }, [onClose])

  // Canvas confetti
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: any[] = []
    const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7']

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        dx: Math.random() * 4 - 2,
        dy: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      })
    }

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleInc
        p.y += (Math.cos(p.tiltAngle) + p.dy + p.r / 2) / 2
        p.x += Math.sin(p.tiltAngle) * 2

        ctx.beginPath()
        ctx.lineWidth = p.r
        ctx.strokeStyle = p.color
        ctx.moveTo(p.x + p.tilt + p.r, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r)
        ctx.stroke()

        if (p.y > canvas.height) {
          particles[i] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.floor(Math.random() * 10) - 10,
          }
        }
      })
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Balloons */}
      <div className="absolute top-10 left-10 text-6xl animate-balloon z-0">🎈</div>
      <div
        className="absolute top-20 right-20 text-6xl animate-balloon z-0"
        style={{ animationDelay: '1s' }}
      >
        🎈
      </div>
      <div
        className="absolute bottom-20 left-20 text-6xl animate-balloon z-0"
        style={{ animationDelay: '2s' }}
      >
        🎈
      </div>
      <div
        className="absolute bottom-10 right-10 text-6xl animate-balloon z-0"
        style={{ animationDelay: '0.5s' }}
      >
        🎈
      </div>

      <div className="text-center z-10 relative px-4">
        <h1 className="text-5xl font-bold text-primary mb-4">Parabéns {name}!</h1>
      </div>
    </div>
  )
}
