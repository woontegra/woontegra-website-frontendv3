import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { BankTransferInfo } from '@/types/payment'
import { formatIbanDisplay } from '@/utils/productPurchase'

function CopyBtn({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setOk(true)
      window.setTimeout(() => setOk(false), 2000)
    } catch {
      window.alert('Panoya kopyalanamadı.')
    }
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
    >
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

export function BankTransferPanel({ info }: { info: BankTransferInfo }) {
  return (
    <div className="mt-6 rounded-xl border-2 border-sky-200 bg-sky-50/80 p-5 text-left">
      <h3 className="text-base font-semibold text-sky-950">Havale / EFT bilgileri</h3>
      <p className="mt-2 text-sm text-sky-900/90">
        Açıklama alanına sipariş numaranızı yazmayı unutmayın. Ödeme onayı sonrası teslimat bilgileri e-posta ile
        iletilir.
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="rounded-lg border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Banka</dt>
          <dd className="mt-1 font-medium text-slate-900">{info.bankName}</dd>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alıcı</dt>
          <dd className="mt-1 font-medium text-slate-900">{info.accountHolder}</dd>
        </div>
        {info.branchName ? (
          <div className="rounded-lg border border-sky-100 bg-white p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Şube</dt>
            <dd className="mt-1 text-slate-900">{info.branchName}</dd>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 rounded-lg border border-sky-100 bg-white p-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">IBAN</dt>
            <dd className="mt-1 font-mono text-sm text-slate-900">{formatIbanDisplay(info.iban)}</dd>
          </div>
          <CopyBtn label="IBAN kopyala" value={info.ibanCompact || info.iban} />
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-sky-100 bg-white p-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Açıklama / referans</dt>
            <dd className="mt-1 font-mono font-semibold text-slate-900">{info.paymentReference}</dd>
          </div>
          <CopyBtn label="Referans kopyala" value={info.paymentReference} />
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tutar</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">{info.amountFormatted}</dd>
        </div>
      </dl>
      {info.instructions ? <p className="mt-3 text-xs text-slate-600">{info.instructions}</p> : null}
    </div>
  )
}

export function PaytrIframe({ orderNo, token }: { orderNo: string; token: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Güvenli ödeme</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">PayTR ile ödeme</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sipariş no: <span className="font-mono font-semibold">{orderNo}</span>. Ödeme onayından sonra lisans ve
          teslimat bilgileri e-posta adresinize gönderilir.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="PayTR Ödeme"
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          className="block min-h-[70dvh] w-full border-0 sm:min-h-[820px]"
          allow="payment *"
        />
      </div>
    </div>
  )
}
