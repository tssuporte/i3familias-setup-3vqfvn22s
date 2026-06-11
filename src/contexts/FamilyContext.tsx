import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getFamily,
  getFamilyByUserId,
  getFamilyMembers,
  addFamilyMember as addMemberService,
  updateFamilyMember as updateMemberService,
} from '@/services/familyService'
import { Navigate } from 'react-router-dom'

interface FamilyContextType {
  family: any
  members: any[]
  addMember: (data: any) => Promise<void>
  updateMember: (id: string, data: any) => Promise<void>
  loading: boolean
  refreshFamily: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export const useFamily = () => {
  const context = useContext(FamilyContext)
  if (!context) throw new Error('useFamily must be used within a FamilyProvider')
  return context
}

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, familyId } = useAuth()
  const [family, setFamily] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFamily = async () => {
    if (!user) return
    try {
      setLoading(true)
      let fam = null
      if (familyId) {
        fam = await getFamily(familyId)
      } else if (user.collectionName === 'users') {
        fam = await getFamilyByUserId(user.id)
      }

      if (fam) {
        setFamily(fam)
        const mems = await getFamilyMembers(fam.id)
        setMembers(mems)
      } else {
        setFamily(null)
        setMembers([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setFamily(null)
      setMembers([])
      setLoading(false)
      return
    }
    fetchFamily()
  }, [user, isAuthenticated, familyId])

  const addMember = async (data: any) => {
    if (!family) throw new Error('Nenhuma família encontrada')
    const newMember = await addMemberService({ ...data, family_id: family.id })
    setMembers((prev) => [...prev, newMember])
  }

  const updateMember = async (id: string, data: any) => {
    const updated = await updateMemberService(id, data)
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)))
  }

  return (
    <FamilyContext.Provider
      value={{ family, members, addMember, updateMember, loading, refreshFamily: fetchFamily }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

export const FamilyRequire = ({ children }: { children: ReactNode }) => {
  const { family, loading } = useFamily()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!family) {
    return <Navigate to="/app/onboarding" replace />
  }

  return <>{children}</>
}
