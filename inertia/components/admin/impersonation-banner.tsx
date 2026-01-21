import { Link } from '@inertiajs/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, X, AlertTriangle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '../ui/button'
import { useClearImpersonation } from '../../hooks/mutations/use-impersonation-mutations'
import { useImpersonationStatusQueryOptions } from '../../hooks/queries/use-impersonation-status'

function getRedirectPathForRole(role: string): string {
  // Responsáveis vão para /responsavel
  if (role === 'RESPONSIBLE' || role === 'STUDENT_RESPONSIBLE') {
    return '/responsavel'
  }
  // Todos os outros vão para /escola
  return '/escola'
}

// Traduções dos cargos
const ROLE_TRANSLATIONS: Record<string, string> = {
  SCHOOL_DIRECTOR: 'Diretor(a)',
  SCHOOL_COORDINATOR: 'Coordenador(a)',
  SCHOOL_ADMIN: 'Admin da Escola',
  SCHOOL_ADMINISTRATIVE: 'Administrativo',
  SCHOOL_TEACHER: 'Professor(a)',
  SCHOOL_CANTEEN: 'Cantina',
  TEACHER: 'Professor(a)',
  STUDENT: 'Aluno(a)',
  RESPONSIBLE: 'Responsável',
  STUDENT_RESPONSIBLE: 'Responsável de Aluno',
  SCHOOL_CHAIN_DIRECTOR: 'Diretor(a) de Rede',
  SCHOOL_CHAIN_COORDINATOR: 'Coordenador(a) de Rede',
  SCHOOL_CHAIN_ADMINISTRATIVE: 'Administrativo de Rede',
}

function translateRole(roleName: string): string {
  return ROLE_TRANSLATIONS[roleName] || roleName
}

export function ImpersonationBanner() {
  const queryClient = useQueryClient()

  const { data: status } = useQuery(useImpersonationStatusQueryOptions())
  const clearImpersonationMutation = useClearImpersonation()

  const handleExit = async () => {
    try {
      await clearImpersonationMutation.mutateAsync()

      toast.success('Personificação desativada - Você voltou ao modo admin')

      await queryClient.invalidateQueries()

      window.location.href = '/admin'
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desativar personificação'
      toast.error(message)
    }
  }

  if (!status?.isImpersonating || !status?.impersonatingUser) {
    return null
  }

  const { impersonatingUser } = status

  return (
    <div className="sticky top-0 z-[100] flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-amber-950">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <span className="font-semibold">Modo de Personificação Ativo</span>
          <span className="mx-2">•</span>
          <span>
            Visualizando como{' '}
            <strong>
              {impersonatingUser.name} ({translateRole(impersonatingUser.role || '')})
            </strong>
            {impersonatingUser.school && (
              <span className="ml-1 text-amber-900">• {impersonatingUser.school.name}</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={getRedirectPathForRole(impersonatingUser.role || '')}>
          <Button
            variant="secondary"
            size="sm"
            className="bg-amber-100 text-amber-900 hover:bg-amber-200"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ir para Dashboard
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExit}
          disabled={clearImpersonationMutation.isPending}
          className="bg-white/80 text-amber-900 hover:bg-white"
        >
          <X className="mr-2 h-4 w-4" />
          {clearImpersonationMutation.isPending ? 'Saindo...' : 'Sair'}
        </Button>
      </div>
    </div>
  )
}
