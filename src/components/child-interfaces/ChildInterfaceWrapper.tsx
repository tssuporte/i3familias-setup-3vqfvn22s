import { useAgeGroup } from '@/hooks/use-age-group'
import { ChildInterface0to3 } from './ChildInterface0to3'
import { ChildInterface4to5 } from './ChildInterface4to5'
import { ChildInterface6to9 } from './ChildInterface6to9'
import { ChildInterface10to12 } from './ChildInterface10to12'
import { ChildInterface13plus } from './ChildInterface13plus'
import { Skeleton } from '@/components/ui/skeleton'

interface ChildInterfaceWrapperProps {
  member: any
}

export function ChildInterfaceWrapper({ member }: ChildInterfaceWrapperProps) {
  const { ageGroup } = useAgeGroup(member?.birth_date)

  if (!member) {
    return <Skeleton className="w-full h-[500px] rounded-xl" />
  }

  switch (ageGroup) {
    case '0-3':
      return <ChildInterface0to3 member={member} />
    case '4-5':
      return <ChildInterface4to5 member={member} />
    case '6-9':
      return <ChildInterface6to9 member={member} />
    case '10-12':
      return <ChildInterface10to12 member={member} />
    case '13+':
      return <ChildInterface13plus member={member} />
    default:
      return <ChildInterface13plus member={member} />
  }
}
