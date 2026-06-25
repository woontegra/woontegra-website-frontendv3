import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminBlogService, getErrorMessage } from '@/services/api/adminBlog'
import { formatBlogDate } from '@/types/blog'

function formatDateTime(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function AdminBlogListPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'blog'],
    queryFn: () => adminBlogService.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminBlogService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] }),
  })

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`“${title}” silinsin mi?`)) return
    try {
      await deleteMutation.mutateAsync(id)
      void queryClient.invalidateQueries({ queryKey: ['blog'] })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Silinemedi'))
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Blog"
        description="Kurumsal site blog yazıları."
        actions={
          <Link
            to="/admin/blog/yeni"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Yeni yazı
          </Link>
        }
      />

      {isLoading ? <LoadingState label="Blog yazıları yükleniyor…" /> : null}

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm font-medium text-red-800">Liste yüklenemedi</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>
              Tekrar dene
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {!isLoading && !isError && (!data || data.length === 0) ? (
        <EmptyState title="Henüz blog yazısı yok" description="İlk yazıyı oluşturmak için “Yeni yazı” butonunu kullanın." />
      ) : null}

      {data && data.length > 0 ? (
        <>
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              Yenile
            </Button>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Başlık</TH>
                <TH>Slug</TH>
                <TH>Durum</TH>
                <TH>Yayın tarihi</TH>
                <TH>Güncelleme</TH>
                <TH className="text-right">İşlemler</TH>
              </TR>
            </THead>
            <TBody>
              {data.map((post) => (
                <TR key={post.id}>
                  <TD className="font-medium text-slate-900">{post.title}</TD>
                  <TD className="font-mono text-xs text-slate-500">{post.slug}</TD>
                  <TD>
                    <Badge tone={post.status === 'published' ? 'success' : 'warning'}>
                      {post.status === 'published' ? 'Yayında' : 'Taslak'}
                    </Badge>
                  </TD>
                  <TD className="text-slate-500">{formatBlogDate(post.publishedAt)}</TD>
                  <TD className="text-slate-500">{formatDateTime(post.updatedAt)}</TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/blog/${post.id}/duzenle`}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Düzenle
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDelete(post.id, post.title)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </>
      ) : null}
    </div>
  )
}
