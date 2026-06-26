import { Input } from '@/components/ui/Input'
import { sanitizeTurkishIdentityNumberInput, validateTurkishIdentityNumber } from '@/utils/turkishIdentityNumber'

type Props = {
  value: string
  onChange: (value: string) => void
  error?: string | null
  onErrorChange?: (error: string | null) => void
}

export function BillingIdentityNumberField({ value, onChange, error, onErrorChange }: Props) {
  return (
    <div className="sm:col-span-2">
      <Input
        label="T.C. Kimlik No"
        inputMode="numeric"
        autoComplete="off"
        placeholder="T.C. Kimlik No"
        maxLength={11}
        value={value}
        onChange={(e) => {
          const next = sanitizeTurkishIdentityNumberInput(e.target.value)
          onChange(next)
          onErrorChange?.(validateTurkishIdentityNumber(next))
        }}
        onBlur={() => onErrorChange?.(validateTurkishIdentityNumber(value))}
        error={error ?? undefined}
      />
      <p className="mt-1.5 text-xs text-slate-500">
        Fatura bilgilerinizde kullanılmak üzere opsiyonel olarak alınır.
      </p>
    </div>
  )
}
