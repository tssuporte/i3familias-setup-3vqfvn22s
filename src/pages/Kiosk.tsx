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

      <Card className="bg-card rounded-xl shadow-sm p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/kiosk/meals')}
          >
            <h3 className="text-3xl font-bold text-primary">Refeição</h3>
            <p className="text-2xl font-semibold text-foreground">Macarronada</p>
          </div>

          <div
            className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:opacity-80 transition-opacity border-y md:border-y-0 md:border-x border-border py-4 md:py-0"
            onClick={() => navigate('/kiosk/tasks')}
          >
            <h3 className="text-3xl font-bold text-primary">Tarefas</h3>
            <p className="text-2xl font-semibold text-foreground">12 Total (2 Atrasadas)</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-3xl font-bold text-primary">Estrelas</h3>
            <p className="text-2xl font-semibold text-foreground">450</p>
          </div>
        </div>
      </Card>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Megaphone className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Mural da Família</h2>
        </div>

        <div className="max-h-[200px] overflow-y-auto pr-2 space-y-4">
          {notices.length === 0 ? (
            <div className="text-muted-foreground text-lg text-center py-4">
              Nenhum aviso no momento.
            </div>
          ) : (
            notices.map((notice) => (
              <div key={notice.id} className="bg-secondary rounded-lg p-6">
                <p className="text-lg text-foreground mb-4">{notice.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{notice.author_name}</span>
                  {notice.expiry_date && (
                    <span className="text-xs text-muted-foreground italic">
                      Expira em: {new Date(notice.expiry_date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {children.map((child) => {
            const code = child.name.charCodeAt(0) || 0
            const status = code % 3 === 0 ? 'green' : code % 3 === 1 ? 'yellow' : 'red'
            const borderColor =
              status === 'green'
                ? 'border-green-500'
                : status === 'yellow'
                  ? 'border-yellow-500'
                  : 'border-red-500'
            const indicatorColor =
              status === 'green'
                ? 'bg-green-500'
                : status === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'

            return (
              <div
                key={child.id}
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform duration-200"
                onClick={() => handleChildClick(child)}
              >
                <div className="relative min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Avatar
                    className={`h-[140px] w-[140px] border-4 ${borderColor} object-cover rounded-full`}
                  >
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
                    className={`absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-background ${indicatorColor}`}
                  />
                </div>
                <span className="mt-4 text-xl font-semibold text-foreground text-center">
                  {child.name.split(' ')[0]}
                </span>
              </div>
            )
          })}
          {children.length === 0 && (
            <div className="col-span-full text-muted-foreground text-lg py-4">
              Nenhuma criança cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
