import { useQuery } from '@tanstack/react-query'
import { Building2, Network } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { useSchoolsQueryOptions } from '../../../hooks/queries/use_schools'
import { useSchoolChainsQueryOptions } from '../../../hooks/queries/use_school_chains'
import { useSearchParams } from '../../../hooks/use_search_params'

interface DashboardFiltersProps {
  showSchoolFilter?: boolean
  showChainFilter?: boolean
}

export function DashboardFilters({
  showSchoolFilter = true,
  showChainFilter = true,
}: DashboardFiltersProps) {
  const { params, setParam, deleteParam } = useSearchParams()
  const schoolId = params.schoolId ?? ''
  const schoolChainId = params.schoolChainId ?? ''

  const { data: schoolsRaw } = useQuery(useSchoolsQueryOptions())
  const { data: chains } = useQuery(useSchoolChainsQueryOptions())
  const schools = Array.isArray(schoolsRaw) ? schoolsRaw : (schoolsRaw as any)?.data || []

  function handleSchoolChange(value: string) {
    if (value && value !== 'all') {
      setParam('schoolId', value)
      deleteParam('schoolChainId')
    } else {
      deleteParam('schoolId')
    }
  }

  function handleChainChange(value: string) {
    if (value && value !== 'all') {
      setParam('schoolChainId', value)
      deleteParam('schoolId')
    } else {
      deleteParam('schoolChainId')
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      {showChainFilter && chains && chains.length > 0 && (
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-muted-foreground" />
          <Select value={schoolChainId || 'all'} onValueChange={handleChainChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as redes" />
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
              <SelectValue placeholder="Todas as escolas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as escolas</SelectItem>
              {schools.map((school: { id: string; name: string }) => (
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
