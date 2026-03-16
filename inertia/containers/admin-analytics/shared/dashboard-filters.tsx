import { useQuery } from '@tanstack/react-query'
import { Building2, Network } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { api } from '~/lib/api'
import { useSearchParams } from '../../../hooks/use_search_params'

interface DashboardFiltersProps {
  showSchoolFilter?: boolean
  showChainFilter?: boolean
}

export function DashboardFilters({
  showSchoolFilter = true,
  showChainFilter = true,
}: DashboardFiltersProps) {
  const { params, updateParams } = useSearchParams()
  const schoolId = params.schoolId ?? ''
  const schoolChainId = params.schoolChainId ?? ''

  const { data: schoolsRaw } = useQuery(api.api.v1.schools.index.queryOptions({}))
  const { data: chainsRaw } = useQuery(api.api.v1.schoolChains.listSchoolChains.queryOptions({}))
  const schools = schoolsRaw?.data ?? []
  const chains = chainsRaw?.data ?? []

  function handleSchoolChange(value: string | null) {
    if (value && value !== 'all') {
      updateParams({ set: { schoolId: value }, delete: ['schoolChainId'] })
    } else {
      updateParams({ delete: ['schoolId'] })
    }
  }

  function handleChainChange(value: string | null) {
    if (value && value !== 'all') {
      updateParams({ set: { schoolChainId: value }, delete: ['schoolId'] })
    } else {
      updateParams({ delete: ['schoolChainId'] })
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      {showChainFilter && chains && chains.length > 0 && (
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-muted-foreground" />
          <Select value={schoolChainId || 'all'} onValueChange={handleChainChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as redes">
                {schoolChainId
                  ? chains.find((c) => c.id === schoolChainId)?.name ?? 'Todas as redes'
                  : 'Todas as redes'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as redes</SelectItem>
              {chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showSchoolFilter && schools && schools.length > 0 && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={schoolId || 'all'} onValueChange={handleSchoolChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as escolas">
                {schoolId
                  ? schools.find((s) => s.id === schoolId)?.name ?? 'Todas as escolas'
                  : 'Todas as escolas'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as escolas</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
