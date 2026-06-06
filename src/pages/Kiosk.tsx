import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInYears } from 'date-fns'
import { Loader2, Calendar, CheckSquare, Star, Megaphone } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getFamilyByUserId, getFamilyMembers } from '@/services/familyService'
import { getFamilyNotices, notifyBirthday } from '@/services/kioskService'
import { BirthdayOverlay } from '@/components/kiosk/BirthdayOverlay'
import { PinDialog } from '@/components/kiosk/PinDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

export default function Kiosk() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [birthdayMember, setBirthdayMember] = useState<any | null>(null)
  const [selectedChild, setSelectedChild] = useState<any | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return
        const family = await getFamilyByUserId(user.id)
        if (!family) {
          setLoading(false)
          return
        }

        const [fetchedMembers, fetchedNotices] = await Promise.all([
          getFamilyMembers(family.id),
          getFamilyNotices(family.id),
        ])

        setMembers(fetchedMembers)
        setNotices(fetchedNotices)

        const today = new Date()
        const bdayChild = fetchedMembers.find((m) => {
          if (!m.birth_date || m.member_type !== 'child') return false
          const bDate = new Date(m.birth_date)
          return bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth()
        })

        if (bdayChild) {
          const notifiedKey = `bday_notified_${bdayChild.id}_${today.getFullYear()}`
          if (!localStorage.getItem(notifiedKey)) {
            setBirthdayMember(bdayChild)
            notifyBirthday(bdayChild.id).catch(() => {})
            localStorage.setItem(notifiedKey, 'true')
          }
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as informações do quiosque.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, toast])

  const handleChildClick = (child: any) => {
    if (!child.birth_date) {
      navigate('/kiosk/profile')
      return
    }
    const age = differenceInYears(new Date(), new Date(child.birth_date))
    if (age >= 6 && child.pin_code) {
      setSelectedChild(child)
    } else {
      navigate('/kiosk/profile')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  const children = members.filter((m) => m.member_type === 'child')

  return (
    <div className="flex flex-col h-full space-y-6 max-w-7xl mx-auto w-full">
      {birthdayMember && (
        <BirthdayOverlay name={birthdayMember.name} onClose={() => setBirthdayMember(null)} />
      )}

      <PinDialog
        open={!!selectedChild}
        onOpenChange={(open) => !open && setSelectedChild(null)}
        expectedPin={selectedChild?.pin_code || ''}
        childName={selectedChild?.name || ''}
        onSuccess={() => navigate('/kiosk/profile')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <Card
          onClick={() => navigate('/kiosk/meals')}
          className="cursor-pointer hover:border-primary transition-all shadow-sm hover:shadow-md rounded-[2rem]"
        >
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-500">
              <Calendar className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-bold text-foreground">Macarronada</h3>
            <p className="text-xl text-muted-foreground">Refeição do dia</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate('/kiosk/tasks')}
          className="cursor-pointer hover:border-primary transition-all shadow-sm hover:shadow-md rounded-[2rem]"
        >
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-full">
            <div className="p-5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-500">
              <CheckSquare className="h-10 w-10" />
            </div>
            <div className="flex space-x-6 w-full justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">12</p>
                <p className="text-base font-medium text-muted-foreground">Tarefas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">10</p>
                <p className="text-base font-medium text-muted-foreground">Em dia</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">2</p>
                <p className="text-base font-medium text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-all shadow-sm hover:shadow-md rounded-[2rem]">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-500">
              <Star className="h-10 w-10" />
            </div>
            <h3 className="text-4xl font-black text-yellow-500">450</h3>
            <p className="text-xl text-muted-foreground">Estrelas na semana</p>
          </CardContent>
        </Card>
      </div>

      <div
        className="flex-1 bg-card rounded-[2.5rem] p-8 shadow-elevation flex flex-col animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <Megaphone className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Mural da Família</h2>
        </div>

        {notices.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-2xl">
            Nenhum aviso no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-6 rounded-3xl bg-secondary/50 border border-border flex flex-col justify-between"
              >
                <p className="text-2xl font-medium leading-relaxed mb-4 text-foreground">
                  {notice.content}
                </p>
                <div className="flex justify-between items-center text-base text-muted-foreground">
                  <span className="font-semibold text-primary/80">{notice.author_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="bg-card rounded-[2.5rem] p-8 shadow-elevation animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        <div
          className="flex overflow-x-auto gap-10 pb-4 justify-center md:justify-start"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children.map((child) => {
            const code = child.name.charCodeAt(0) || 0
            const statusColor =
              code % 3 === 0 ? 'bg-green-500' : code % 3 === 1 ? 'bg-yellow-500' : 'bg-red-500'

            return (
              <div
                key={child.id}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                onClick={() => handleChildClick(child)}
              >
                <div className="relative">
                  <Avatar className="h-[140px] w-[140px] border-[6px] border-background shadow-xl transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage
                      src={
                        child.photo_url ||
                        `https://img.usecurling.com/ppl/thumbnail?seed=${child.id}`
                      }
                    />
                    <AvatarFallback className="text-4xl font-bold">
                      {child.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute bottom-2 right-2 h-8 w-8 rounded-full border-4 border-background shadow-sm ${statusColor}`}
                  />
                </div>
                <span className="mt-4 text-2xl font-bold text-foreground tracking-tight">
                  {child.name.split(' ')[0]}
                </span>
              </div>
            )
          })}
          {children.length === 0 && (
            <div className="w-full text-center text-muted-foreground text-xl py-6 font-medium">
              Nenhuma criança cadastrada na família.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
