import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { ChildInterfaceWrapper } from '@/components/child-interfaces/ChildInterfaceWrapper'
import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function ChildView() {
  const { memberId } = useParams<{ memberId: string }>()
  const { isMemberAccount, memberAccountRole, memberAccountMemberId } = useAuth()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!memberId) {
      setError('Membro não encontrado.')
      setLoading(false)
      return
    }

    const fetchMember = async () => {
      try {
        const record = await pb.collection('family_members').getOne(memberId)
        setMember(record)
      } catch (err) {
        setError(
          'Erro ao carregar o perfil do membro. Verifique se ele existe e pertence à sua família.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [memberId])

  if (
    isMemberAccount &&
    memberAccountRole === 'child' &&
    memberAccountMemberId &&
    memberId !== memberAccountMemberId
  ) {
    return <Navigate to={`/app/child/${memberAccountMemberId}`} replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 p-4 md:p-8 transition-colors duration-300">
      <ChildInterfaceWrapper member={member} />
    </div>
  )
}
