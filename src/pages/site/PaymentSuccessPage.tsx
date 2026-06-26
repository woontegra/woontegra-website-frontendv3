import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/LoadingState'
import { BankTransferPanel } from '@/components/payment/PaymentPanels'
import { useSitePageMeta } from '@/hooks/usePageMeta'
import { ordersService } from '@/services/api/orders'
import { LAST_ORDER_EMAIL_KEY, type OrderSuccessData, type OrderSuccessPaid } from '@/types/checkout'
import { formatMoney } from '@/utils/formatMoney'
import { CENTRAL_LICENSE_EMAIL_MESSAGE } from '@/constants/centralLicenseServer'
import { clearCart } from '@/lib/cartStorage'
import { isSaasOrderDeliveryUrl } from '@/utils/productPurchase'

const POLL_MS = 2000
const MAX_POLLS = 15

function isPaidOrProcessing(d: OrderSuccessData): d is OrderSuccessPaid {
  return d.status === 'PAID' || d.status === 'PROCESSING'
}

function OrderLinesTable({
  lines,
  currency,
  downloads,
}: {
  lines: { productName: string; quantity: number; lineTotal: number }[]
  currency: string
  downloads?: (string | null | undefined)[]
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 text-left">
      <table className="w-full min-w-[280px] text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Ürün</th>
            <th className="px-4 py-2 font-medium">Adet</th>
            <th className="px-4 py-2 text-right font-medium">Tutar</th>
            {downloads ? <th className="px-4 py-2 text-right font-medium">İndir</th> : null}
          </tr>
        </thead>
        <tbody>
          {lines.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2.5 font-medium text-slate-900">{row.productName}</td>
              <td className="px-4 py-2.5 text-slate-700">{row.quantity}</td>
              <td className="px-4 py-2.5 text-right text-slate-800">{formatMoney(row.lineTotal, currency)}</td>
              {downloads ? (
                <td className="px-4 py-2.5 text-right">
                  {(() => {
                    const url = downloads[i]
                    if (!url) return <span className="text-slate-400">—</span>
                    if (isSaasOrderDeliveryUrl(url)) {
                      return (
                        <span className="text-xs font-medium text-slate-600">Hesap bilgileri e-posta ile</span>
                      )
                    }
                    return (
                      <a
                        href={url}
                        className="inline-flex rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        İndir
                      </a>
                    )
                  })()}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PaymentSuccessPage() {
  const { orderNo } = useParams()
  const [data, setData] = useState<OrderSuccessData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(orderNo))
  const [pollExhausted, setPollExhausted] = useState(false)
  const [polling, setPolling] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailToken, setEmailToken] = useState(0)
  const cartClearedForOrder = useRef<string | null>(null)

  useSitePageMeta({
    title: orderNo ? `Sipariş ${orderNo}` : 'Ödeme başarılı',
    description: 'Sipariş durumu ve teslimat bilgileri.',
  })

  const storedEmail = () => sessionStorage.getItem(LAST_ORDER_EMAIL_KEY)?.trim() || undefined

  const fetchOrder = useCallback(async (): Promise<OrderSuccessData | null> => {
    if (!orderNo) return null
    return ordersService.getSuccess(orderNo, storedEmail())
  }, [orderNo, emailToken])

  useEffect(() => {
    if (!orderNo) {
      setLoading(false)
      return
    }
    let cancelled = false
    let pollTimer: number | null = null
    let polls = 0

    const clearTimer = () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }

    const loadOnce = async (): Promise<OrderSuccessData | null> => {
      try {
        const d = await fetchOrder()
        if (cancelled) return null
        setError(null)
        setData(d)
        setLoading(false)
        return d
      } catch (e) {
        if (cancelled) return null
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          setError('Sipariş bulunamadı.')
        } else {
          setError('Sipariş bilgisi alınamadı.')
        }
        setLoading(false)
        return null
      }
    }

    void (async () => {
      const initial = await loadOnce()
      if (cancelled || !initial || initial.status !== 'PENDING') {
        setPolling(false)
        return
      }
      setPolling(true)
      pollTimer = window.setInterval(() => {
        void (async () => {
          polls += 1
          const next = await loadOnce()
          if (cancelled) return
          if (next && next.status !== 'PENDING') {
            clearTimer()
            setPolling(false)
            return
          }
          if (polls >= MAX_POLLS) {
            setPollExhausted(true)
            clearTimer()
            setPolling(false)
          }
        })()
      }, POLL_MS)
    })()

    return () => {
      cancelled = true
      clearTimer()
    }
  }, [orderNo, fetchOrder])

  useEffect(() => {
    if (!orderNo || !data) return
    if (data.status === 'FAILED' || data.status === 'CANCELLED') return
    if (cartClearedForOrder.current === orderNo) return
    cartClearedForOrder.current = orderNo
    clearCart()
  }, [orderNo, data])

  const applyEmail = () => {
    const t = emailInput.trim()
    if (t) sessionStorage.setItem(LAST_ORDER_EMAIL_KEY, t.toLowerCase())
    setEmailToken((k) => k + 1)
  }

  if (!orderNo) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Ödemeniz alındı</h1>
        <p className="mt-4 text-slate-600">
          Sipariş numaranız e-posta ile iletildi. Detay için e-postanızı kontrol edin.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/yazilimlar">
            <Button variant="secondary">Yazılımlar</Button>
          </Link>
          <Link to="/">
            <Button>Ana sayfa</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <LoadingState label="Sipariş durumu kontrol ediliyor…" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-800">{error ?? 'Sipariş bulunamadı.'}</p>
          </CardBody>
        </Card>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/yazilimlar">
            <Button variant="secondary">Yazılımlar</Button>
          </Link>
          <Link to="/iletisim">
            <Button variant="secondary">İletişim</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (data.status === 'PENDING') {
    const bankInfo = data.paymentProvider === 'BANK_TRANSFER' ? data.bankTransferInfo : null
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Siparişiniz alındı</h1>
        <p className="mt-2 text-sm text-slate-500">Sipariş no: {data.orderNo}</p>
        <p className="mt-4 font-medium text-amber-800">{data.paymentStatusLabel}</p>
        <p className="mt-2 text-sm text-slate-600">{data.message}</p>
        <p className="mt-3 text-sm text-slate-600">{CENTRAL_LICENSE_EMAIL_MESSAGE}</p>
        <OrderLinesTable lines={data.lines} currency={data.currency} />
        <p className="mt-4 text-lg font-semibold text-slate-900">
          Toplam: {formatMoney(data.orderTotal, data.currency)}
        </p>
        {bankInfo ? <BankTransferPanel info={bankInfo} /> : null}
        {polling && !pollExhausted ? (
          <p className="mt-4 text-sm text-slate-500">Ödeme onayı bekleniyor…</p>
        ) : null}
        {pollExhausted ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Onay bir süre sürebilir. Sayfayı daha sonra yenileyebilirsiniz.
          </p>
        ) : null}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/">
            <Button variant="secondary">Ana sayfa</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (data.status === 'FAILED' || data.status === 'CANCELLED') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-red-900">Ödeme tamamlanamadı</h1>
        <p className="mt-2 text-sm text-slate-500">Sipariş no: {data.orderNo}</p>
        <p className="mt-4 text-slate-600">{data.message}</p>
        <Link to={`/odeme/basarisiz/${encodeURIComponent(data.orderNo)}`} className="mt-6 inline-block">
          <Button variant="secondary">Detay sayfası</Button>
        </Link>
      </div>
    )
  }

  if (!isPaidOrProcessing(data)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">Beklenmeyen sipariş durumu.</p>
      </div>
    )
  }

  const needsEmail = data.requiresEmail === true
  const downloads = data.items.map((it) => it.downloadUrl)
  const legacyUrl = data.downloadUrl

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-emerald-800">Ödemeniz alındı</h1>
      <p className="mt-2 text-sm text-slate-500">Sipariş no: {data.orderNo}</p>
      <p className="mt-4 font-medium text-emerald-700">{data.paymentStatusLabel}</p>
      {data.message ? <p className="mt-2 text-sm text-slate-600">{data.message}</p> : null}
      <p className="mt-2 text-sm text-slate-600">
        {data.customerEmail}
        {data.paidAt ? ` — ${new Date(data.paidAt).toLocaleString('tr-TR')}` : ''}
      </p>
      <p className="mt-1 text-sm text-slate-500">{CENTRAL_LICENSE_EMAIL_MESSAGE}</p>
      <p className="mt-4 text-lg font-semibold text-slate-900">
        Toplam: {formatMoney(data.orderTotal, data.currency)}
      </p>

      {needsEmail ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm">
          <p>{data.message}</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="Sipariş e-postanız"
              className="min-w-0 flex-1 rounded border border-amber-300 px-2 py-1.5 text-sm"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <Button type="button" size="sm" onClick={applyEmail}>
              Doğrula
            </Button>
          </div>
        </div>
      ) : null}

      {data.lines.length > 0 ? (
        <OrderLinesTable lines={data.lines} currency={data.currency} downloads={needsEmail ? undefined : downloads} />
      ) : legacyUrl ? (
        isSaasOrderDeliveryUrl(legacyUrl) ? (
          <p className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Giriş bilgileri e-postanıza iletilecek.
          </p>
        ) : (
          <div className="mt-8">
            <a
              href={legacyUrl}
              className="inline-flex rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
            >
              İndirmeye başla
            </a>
          </div>
        )
      ) : null}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/hesabim/siparisler">
          <Button variant="secondary">Siparişlerim</Button>
        </Link>
        <Link to="/yazilimlar">
          <Button variant="secondary">Yazılımlar</Button>
        </Link>
        <Link to="/">
          <Button>Ana sayfa</Button>
        </Link>
      </div>
    </div>
  )
}
