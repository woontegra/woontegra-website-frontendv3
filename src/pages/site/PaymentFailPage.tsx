import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { useSitePageMeta } from '@/hooks/usePageMeta'
import { ordersService } from '@/services/api/orders'
import { LAST_ORDER_EMAIL_KEY, type OrderSuccessData } from '@/types/checkout'
import { formatMoney } from '@/utils/formatMoney'

export function PaymentFailPage() {
  const { orderNo } = useParams()
  const [data, setData] = useState<OrderSuccessData | null>(null)
  const [loading, setLoading] = useState(Boolean(orderNo))
  const [notFound, setNotFound] = useState(false)

  useSitePageMeta({
    title: orderNo ? `Ödeme başarısız — ${orderNo}` : 'Ödeme başarısız',
    description: 'Ödeme tamamlanamadı. Tekrar deneyebilir veya iletişime geçebilirsiniz.',
  })

  const load = useCallback(async () => {
    if (!orderNo) return
    const em = sessionStorage.getItem(LAST_ORDER_EMAIL_KEY)?.trim() || undefined
    const d = await ordersService.getSuccess(orderNo, em)
    setData(d)
  }, [orderNo])

  useEffect(() => {
    if (!orderNo) {
      setLoading(false)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        setNotFound(false)
        await load()
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [orderNo, load])

  const retryHref = '/yazilimlar'

  if (!orderNo) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Ödeme tamamlanamadı</h1>
        <p className="mt-4 text-slate-600">
          Ödeme işlemi tamamlanmadı veya iptal edildi. Tekrar deneyebilir veya bizimle iletişime geçebilirsiniz.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/yazilimlar">
            <Button>Yazılımlara dön</Button>
          </Link>
          <Link to="/iletisim">
            <Button variant="secondary">İletişim</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <LoadingState label="Sipariş bilgisi yükleniyor…" />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Ödeme tamamlanamadı</h1>
        <p className="mt-4 text-slate-600">Sipariş kaydı doğrulanamadı.</p>
        <p className="mt-2 text-sm text-slate-500">Referans: {orderNo}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/yazilimlar">
            <Button>Yazılımlara dön</Button>
          </Link>
          <Link to="/iletisim">
            <Button variant="secondary">İletişim</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (data.status === 'PAID' || data.status === 'PROCESSING') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-emerald-800">Ödemeniz onaylanmış</h1>
        <p className="mt-4 text-slate-600">Bu sipariş için ödeme zaten alınmış.</p>
        <Link to={`/odeme/basarili/${encodeURIComponent(data.orderNo)}`} className="mt-8 inline-block">
          <Button>Sipariş özeti</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Ödeme tamamlanamadı</h1>
      <p className="mt-2 text-sm text-slate-500">Sipariş no: {data.orderNo}</p>
      <p className="mt-4 text-slate-600">{data.message}</p>
      {'lines' in data && data.lines.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 text-left">
          <table className="w-full min-w-[280px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Ürün</th>
                <th className="px-4 py-2 text-right font-medium">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 font-medium">{row.productName}</td>
                  <td className="px-4 py-2.5 text-right">{formatMoney(row.lineTotal, data.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to={retryHref}>
          <Button>Tekrar dene</Button>
        </Link>
        <Link to="/iletisim">
          <Button variant="secondary">İletişim</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Ana sayfa</Button>
        </Link>
      </div>
    </div>
  )
}
