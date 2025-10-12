'use client'

import * as React from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const formatPhone = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '')
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      }
      return cleaned
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value)
      onChange?.(formatted)
    }

    return (
      <Input
        type="tel"
        className={cn(className)}
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="(21) 99999-9999"
        maxLength={15}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
