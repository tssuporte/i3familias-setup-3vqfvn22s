import { useEffect, useState } from 'react'

interface Props {
  name: string
  onClose: () => void
}

export function BirthdayOverlay({ name, onClose }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 500)
    }, 10000)
    return () => clearTimeout(timer)
  }, [onClose])

  const handleTap = () => {
    setVisible(false)
    setTimeout(onClose, 500)
  }

  return (
    <div
      onClick={handleTap}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primary/95 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center animate-slide-up text-primary-foreground">
        <div className="text-9xl mb-8 animate-bounce">🎈</div>
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">Parabéns!</h1>
        <h2 className="text-5xl md:text-7xl font-bold">{name}</h2>
        <p className="mt-12 text-xl opacity-70">Toque em qualquer lugar para continuar</p>
      </div>
    </div>
  )
}
