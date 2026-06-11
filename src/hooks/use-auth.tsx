import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  member: any
  isAuthenticated: boolean
  role: 'admin' | 'adult' | 'child' | null
  familyId: string | null
  isMemberAccount: boolean
  memberAccountRole: 'child' | 'adult' | 'admin' | null
  memberAccountMemberId: string | null
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (identifier: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [member, setMember] = useState<any>(null)
  const [role, setRole] = useState<'admin' | 'adult' | 'child' | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isMemberAccount, setIsMemberAccount] = useState<boolean>(
    pb.authStore.isValid && pb.authStore.record?.collectionName === 'member_accounts',
  )
  const [memberAccountRole, setMemberAccountRole] = useState<'child' | 'adult' | 'admin' | null>(
    pb.authStore.isValid && pb.authStore.record?.collectionName === 'member_accounts'
      ? pb.authStore.record?.role
      : null,
  )
  const [memberAccountMemberId, setMemberAccountMemberId] = useState<string | null>(
    pb.authStore.isValid && pb.authStore.record?.collectionName === 'member_accounts'
      ? pb.authStore.record?.member_id
      : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  const loadUserData = async (record: any) => {
    if (!record) {
      setUser(null)
      setMember(null)
      setRole(null)
      setFamilyId(null)
      setIsMemberAccount(false)
      setMemberAccountRole(null)
      setMemberAccountMemberId(null)
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    setUser(record)
    setIsAuthenticated(true)

    try {
      if (record.collectionName === 'users') {
        setRole('admin')
        setIsMemberAccount(false)
        setMemberAccountRole(null)
        setMemberAccountMemberId(null)
        try {
          const family = await pb.collection('families').getFirstListItem(`user_id="${record.id}"`)
          setFamilyId(family.id)
        } catch (e) {
          setFamilyId(null)
        }
        setMember(null)
      } else if (record.collectionName === 'member_accounts') {
        setRole(record.role)
        setFamilyId(record.family_id)
        setIsMemberAccount(true)
        setMemberAccountRole(record.role)
        setMemberAccountMemberId(record.member_id)
        try {
          const memberRecord = await pb.collection('family_members').getOne(record.member_id)
          setMember(memberRecord)
        } catch (e) {
          setMember(null)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setLoading(true)
      loadUserData(record)
    })

    if (pb.authStore.isValid && pb.authStore.record) {
      const collectionName = pb.authStore.record.collectionName
      pb.collection(collectionName)
        .authRefresh()
        .then((authData) => {
          loadUserData(authData.record)
        })
        .catch(() => {
          pb.authStore.clear()
          loadUserData(null)
        })
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      loadUserData(null)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password, name })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (identifier: string, password: string) => {
    try {
      try {
        await pb.collection('users').authWithPassword(identifier, password)
        return { error: null }
      } catch (err) {
        await pb.collection('member_accounts').authWithPassword(identifier, password)
        return { error: null }
      }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        isAuthenticated,
        role,
        familyId,
        isMemberAccount,
        memberAccountRole,
        memberAccountMemberId,
        signUp,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
