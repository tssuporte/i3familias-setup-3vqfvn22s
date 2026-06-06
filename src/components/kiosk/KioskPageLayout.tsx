import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  children: ReactNode
}

export function KioskPageLayout({ title, children }: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full animate-slide-up w-full">
      <div className="flex items-center mb-8 shrink-0">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => navigate('/kiosk')}
          className="mr-6 h-16 w-16 rounded-full shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">{title}</h1>
      </div>
      <div className="flex-1 bg-card rounded-[2.5rem] p-8 shadow-elevation overflow-hidden flex flex-col border border-border/50">
        {children}
      </div>
    </div>
  )
}
