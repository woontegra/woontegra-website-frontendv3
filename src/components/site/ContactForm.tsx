import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { contactMessagesService } from '@/services/api/contactMessages'
import { getErrorMessage } from '@/services/api/client'
import { cn } from '@/utils/cn'

type Props = {
  defaultSubject?: string
  className?: string
}

export function ContactForm({ defaultSubject = '', className }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState(defaultSubject ? `Konu: ${defaultSubject}\n\n` : '')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Ad, e-posta ve mesaj zorunludur.' })
      return
    }
    setSending(true)
    try {
      await contactMessagesService.create({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      })
      setFeedback({ type: 'success', text: 'Mesajınız alındı. En kısa sürede dönüş yapacağız.' })
      setName('')
      setEmail('')
      setPhone('')
      setCompany('')
      setMessage('')
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err, 'Mesaj gönderilemedi') })
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className={cn('space-y-4', className)}>
      {feedback ? (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800',
          )}
        >
          {feedback.text}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Ad Soyad *" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="E-posta *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Firma" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">
          Mesaj *
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <Button type="submit" disabled={sending}>
        {sending ? 'Gönderiliyor…' : 'Mesaj Gönder'}
      </Button>
    </form>
  )
}
