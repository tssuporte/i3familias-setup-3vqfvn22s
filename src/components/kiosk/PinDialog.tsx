import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  expectedPin: string
  onSuccess: () => void
  childName: string
}

export function PinDialog({ open, onOpenChange, expectedPin, onSuccess, childName }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleComplete = (val: string) => {
    if (val === expectedPin || !expectedPin) {
      setError(false)
      setValue('')
      onSuccess()
      onOpenChange(false)
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-none shadow-elevation rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center font-bold">Acesso Restrito</DialogTitle>
          <DialogDescription className="text-center text-xl mt-2">
            Insira o PIN de {childName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <InputOTP
            maxLength={4}
            value={value}
            onChange={(val) => {
              setValue(val)
              setError(false)
            }}
            onComplete={handleComplete}
            autoFocus
          >
            <InputOTPGroup className="gap-4">
              <InputOTPSlot index={0} className="h-16 w-16 text-3xl rounded-xl border-2" />
              <InputOTPSlot index={1} className="h-16 w-16 text-3xl rounded-xl border-2" />
              <InputOTPSlot index={2} className="h-16 w-16 text-3xl rounded-xl border-2" />
              <InputOTPSlot index={3} className="h-16 w-16 text-3xl rounded-xl border-2" />
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <p className="text-destructive mt-6 text-lg font-medium">
              PIN incorreto. Tente novamente.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
