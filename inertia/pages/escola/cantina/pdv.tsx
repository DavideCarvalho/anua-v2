import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Search, ShoppingCart, CreditCard, Banknote, QrCode } from 'lucide-react'

export default function PDVPage() {
  return (
    <EscolaLayout>
      <Head title="PDV - Ponto de Venda" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ponto de Venda</h1>
          <p className="text-muted-foreground">
            Registre vendas da cantina
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Busca de aluno */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Aluno</CardTitle>
                <CardDescription>
                  Digite o nome ou código do aluno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Nome ou código do aluno..." className="pl-9" />
                </div>
              </CardContent>
            </Card>

            {/* Itens disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Itens Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {['Lanche', 'Suco', 'Água', 'Refrigerante', 'Salgado', 'Doce'].map((item) => (
                    <Button key={item} variant="outline" className="h-20 flex flex-col gap-1">
                      <span className="font-medium">{item}</span>
                      <span className="text-xs text-muted-foreground">R$ 5,00</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrinho */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <CardTitle>Carrinho</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carrinho vazio</p>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R$ 0,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CreditCard className="h-4 w-4" />
                  Saldo do Aluno
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Banknote className="h-4 w-4" />
                  Dinheiro
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <QrCode className="h-4 w-4" />
                  PIX
                </Button>
                <Button className="w-full mt-4" disabled>
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
