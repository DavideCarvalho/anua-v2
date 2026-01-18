import { Head, useForm } from '@inertiajs/react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

interface SignInProps {
  errors?: {
    email?: string[]
    password?: string[]
  }
}

export default function SignIn({ errors }: SignInProps) {
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/api/v1/auth/login')
  }

  return (
    <>
      <Head title="Entrar" />

      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <span className="text-3xl font-bold text-primary">Anua</span>
            </div>
            <CardTitle className="text-2xl text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre com seu email e senha para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  autoComplete="email"
                />
                {errors?.email && (
                  <p className="text-sm text-destructive">{errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required
                  autoComplete="current-password"
                />
                {errors?.password && (
                  <p className="text-sm text-destructive">{errors.password[0]}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
