import { Head, usePage } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, ShoppingCart, CreditCard, Banknote, QrCode, ReceiptText } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { CanteenContextBar } from '../../../components/cantina/canteen-context-bar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { formatCurrency } from '../../../lib/utils'
import type { Route } from '@tuyau/core/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

type StudentsResponse = Route.Response<'api.v1.students.index'>
type CanteenItemsResponse = Route.Response<'api.v1.canteenItems.index'>
interface CreateCanteenPurchasePayload {
  userId: string
  canteenId: string
  paymentMethod: string
  studentHasLevelId?: string
  items: Array<{ canteenItemId: string; quantity: number }>
}
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

type PaymentMethod = 'BALANCE' | 'CASH' | 'CARD' | 'PIX' | 'ON_ACCOUNT'
type StudentListItem = StudentsResponse['data'][number]
type CanteenItemListItem = CanteenItemsResponse['data'][number]

export default function PDVPage() {
  const { props } = usePage<PageProps>()
  const canteenId = props.canteenId

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null)
  const [cart, setCart] = useState<
    Array<{ id: string; name: string; price: number; quantity: number }>
  >([])

  const queryClient = useQueryClient()
  const createPurchaseMutation = useMutation(api.api.v1.canteenPurchases.store.mutationOptions())

  const { data: studentsData, isLoading: loadingStudents } = useQuery(
    api.api.v1.students.index.queryOptions({
      query: { page: 1, limit: 8, search: studentSearch || undefined },
    })
  )
  const students = studentsData?.data ?? []
  const selectedStudent =
    students.find((student: StudentListItem) => student.id === selectedStudentId) ?? null

  const { data: enrollmentsData } = useQuery({
    ...api.api.v1.students.enrollments.list.queryOptions({
      params: { id: selectedStudentId! },
    }),
    enabled: !!selectedStudentId,
  })
  const enrollments = enrollmentsData ?? []

  const { data: itemsData, isLoading: loadingItems } = useQuery({
    ...api.api.v1.canteenItems.index.queryOptions({
      query: { page: 1, limit: 40, canteenId: canteenId ?? undefined, isActive: true },
    }),
    enabled: !!canteenId,
  })
  const items = itemsData?.data ?? []

  useEffect(() => {
    if (enrollments.length === 1) {
      setSelectedEnrollmentId(enrollments[0].id)
      return
    }

    if (enrollments.length > 1 && selectedEnrollmentId) {
      const hasCurrent = enrollments.some(
        (enrollment: StudentEnrollment) => enrollment.id === selectedEnrollmentId
      )
      if (!hasCurrent) {
        setSelectedEnrollmentId(null)
      }
    }
  }, [enrollments, selectedEnrollmentId])

  const totalAmount = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  )

  const onAddItem = (item: CanteenItemListItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }

      return [
        ...prev,
        { id: item.id, name: item.name, price: Number(item.price || 0), quantity: 1 },
      ]
    })
  }

  const onChangeQuantity = (itemId: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== itemId))
      return
    }

    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item))
    )
  }

  const canFinish = !!selectedStudentId && cart.length > 0 && !!canteenId

  const onSubmit = async () => {
    if (!canteenId) {
      toast.error('Cantina não encontrada no contexto atual')
      return
    }

    if (!selectedStudentId) {
      toast.error('Selecione um aluno para registrar a venda')
      return
    }

    if (cart.length === 0) {
      toast.error('Adicione ao menos um item ao carrinho')
      return
    }

    if (paymentMethod === 'ON_ACCOUNT' && enrollments.length > 1 && !selectedEnrollmentId) {
      toast.error('Selecione o período letivo para lançar a compra fiada')
      return
    }

    const payload: CreateCanteenPurchasePayload = {
      userId: selectedStudentId,
      canteenId,
      paymentMethod,
      studentHasLevelId:
        paymentMethod === 'ON_ACCOUNT' ? (selectedEnrollmentId ?? undefined) : undefined,
      items: cart.map((item) => ({
        canteenItemId: item.id,
        quantity: item.quantity,
      })),
    }

    await toast.promise(createPurchaseMutation.mutateAsync({ body: payload }), {
      loading: 'Registrando venda...',
      success: () => {
        queryClient.invalidateQueries({ queryKey: ['canteen-purchases'] })
        queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
        setCart([])
        return 'Venda registrada com sucesso'
      },
      error: (error) => (error instanceof Error ? error.message : 'Erro ao registrar venda'),
    })
  }

  return (
    <EscolaLayout>
      <Head title="PDV - Ponto de Venda" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ponto de Venda</h1>
          <p className="text-muted-foreground">Registre vendas da cantina</p>
        </div>

        <CanteenContextBar />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Aluno</CardTitle>
                <CardDescription>Digite o nome, email ou documento do aluno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, email ou documento do aluno..."
                    className="pl-9"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                {studentSearch && (
                  <div className="max-h-56 overflow-auto rounded-md border">
                    {loadingStudents && (
                      <p className="p-3 text-sm text-muted-foreground">Carregando alunos...</p>
                    )}

                    {!loadingStudents && students.length === 0 && (
                      <p className="p-3 text-sm text-muted-foreground">Nenhum aluno encontrado</p>
                    )}

                    {students.map((student: StudentListItem) => (
                      <button
                        key={student.id}
                        type="button"
                        className="w-full border-b px-3 py-2 text-left text-sm hover:bg-muted/60 last:border-0"
                        onClick={() => {
                          setSelectedStudentId(student.id)
                          setStudentSearch('')
                        }}
                      >
                        <span className="font-medium">{student.user?.name || 'Aluno'}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedStudent && (
                  <p className="text-sm text-muted-foreground">
                    Aluno selecionado:{' '}
                    <span className="font-medium text-foreground">
                      {selectedStudent.user?.name || 'Aluno'}
                    </span>
                  </p>
                )}

                {paymentMethod === 'ON_ACCOUNT' && enrollments.length > 1 && (
                  <div className="space-y-2 rounded-md border p-3">
                    <Label>Período letivo para lançamento do fiado</Label>
                    <div className="grid gap-2">
                      {enrollments.map((enrollment: StudentEnrollment) => (
                        <Button
                          key={enrollment.id}
                          type="button"
                          variant={selectedEnrollmentId === enrollment.id ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => setSelectedEnrollmentId(enrollment.id)}
                        >
                          {(enrollment.academicPeriod?.name as string) || 'Período letivo'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itens Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                {!canteenId && (
                  <p className="text-sm text-muted-foreground">
                    Cantina não encontrada no contexto.
                  </p>
                )}

                {canteenId && loadingItems && (
                  <p className="text-sm text-muted-foreground">Carregando itens...</p>
                )}

                {canteenId && !loadingItems && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map((item: CanteenItemListItem) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="h-20 flex flex-col gap-1"
                        onClick={() => onAddItem(item)}
                      >
                        <span className="font-medium truncate max-w-full">{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(item.price || 0)}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <CardTitle>Carrinho</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Carrinho vazio</p>
                  </div>
                )}

                {cart.map((item) => (
                  <div key={item.id} className="rounded-md border p-2">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="text-sm">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={paymentMethod === 'BALANCE' ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => setPaymentMethod('BALANCE')}
                >
                  <CreditCard className="h-4 w-4" />
                  Saldo do Aluno
                </Button>
                <Button
                  variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => setPaymentMethod('CASH')}
                >
                  <Banknote className="h-4 w-4" />
                  Dinheiro
                </Button>
                <Button
                  variant={paymentMethod === 'PIX' ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => setPaymentMethod('PIX')}
                >
                  <QrCode className="h-4 w-4" />
                  PIX
                </Button>
                <Button
                  variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <CreditCard className="h-4 w-4" />
                  Cartão
                </Button>
                <Button
                  variant={paymentMethod === 'ON_ACCOUNT' ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => setPaymentMethod('ON_ACCOUNT')}
                >
                  <ReceiptText className="h-4 w-4" />
                  Fiado (fatura)
                </Button>

                <Button
                  className="w-full mt-4"
                  disabled={!canFinish || createPurchaseMutation.isPending}
                  onClick={onSubmit}
                >
                  Finalizar Venda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EscolaLayout>
  )
}
