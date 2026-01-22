import { Building, FolderTree, MapPin, Map, Star, ChevronDown, Minus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '~/lib/api'
import { cn } from '~/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Checkbox } from '~/components/ui/checkbox'

interface School {
  id: string
  name: string
  slug: string
}

interface SchoolGroup {
  id: string
  name: string
  type: 'CITY' | 'STATE' | 'CUSTOM'
  schoolIds: string[]
  schoolCount: number
}

interface SchoolSwitcherData {
  schools: School[]
  groups: SchoolGroup[]
  selectedSchools: School[]
  selectedGroups: SchoolGroup[]
}

function getGroupIcon(type: SchoolGroup['type']) {
  switch (type) {
    case 'CITY':
      return MapPin
    case 'STATE':
      return Map
    case 'CUSTOM':
      return Star
    default:
      return FolderTree
  }
}

function getHeaderText(selectedSchools: School[], selectedGroups: SchoolGroup[]) {
  const selectedGroupCount = selectedGroups.length
  const selectedSchoolCount = selectedSchools.length

  if (selectedGroupCount === 1 && selectedSchoolCount === 0) {
    const group = selectedGroups[0]!
    return `${group.name} (${group.schoolCount} escola${group.schoolCount !== 1 ? 's' : ''})`
  } else if (selectedGroupCount > 1 && selectedSchoolCount === 0) {
    const totalSchools = selectedGroups.reduce((acc, g) => acc + g.schoolCount, 0)
    return `${selectedGroupCount} grupos (${totalSchools} escola${totalSchools !== 1 ? 's' : ''})`
  } else if (selectedGroupCount === 0 && selectedSchoolCount === 1) {
    return selectedSchools[0]!.name
  } else if (selectedGroupCount === 0 && selectedSchoolCount > 1) {
    return `${selectedSchoolCount} escolas`
  } else if (selectedGroupCount > 0 && selectedSchoolCount > 0) {
    const groupSchools = selectedGroups.reduce((acc, g) => acc + g.schoolCount, 0)
    const total = groupSchools + selectedSchoolCount
    return `${selectedGroupCount} grupo${selectedGroupCount !== 1 ? 's' : ''} + ${selectedSchoolCount} escola${selectedSchoolCount !== 1 ? 's' : ''} (${total} total)`
  }

  return 'Selecione escolas'
}

export function SchoolGroupSwitcher() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['schoolSwitcher'],
    queryFn: async () => {
      const response = await tuyau.$route('api.v1.schoolSwitcher.getData').$get().unwrap()
      return response as SchoolSwitcherData
    },
  })

  const toggleSchoolMutation = useMutation({
    mutationFn: async (schoolId: string) => {
      return tuyau.$route('api.v1.schoolSwitcher.toggleSchool').$post({ schoolId }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolSwitcher'] })
    },
  })

  const toggleGroupMutation = useMutation({
    mutationFn: async (schoolGroupId: string) => {
      return tuyau.$route('api.v1.schoolSwitcher.toggleGroup').$post({ schoolGroupId }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolSwitcher'] })
    },
  })

  const schools = data?.schools || []
  const groups = data?.groups || []
  const selectedSchools = data?.selectedSchools || []
  const selectedGroups = data?.selectedGroups || []

  const isGroupSelected = (group: SchoolGroup) => {
    return selectedGroups.some((sg) => sg.id === group.id)
  }

  const isGroupPartial = (group: SchoolGroup) => {
    if (isGroupSelected(group)) return false

    const selectedSchoolIds = selectedSchools.map((s) => s.id)
    const groupSchoolIds = group.schoolIds

    const selectedCount = groupSchoolIds.filter((id) => selectedSchoolIds.includes(id)).length

    return selectedCount > 0 && selectedCount < groupSchoolIds.length
  }

  const isSchoolSelected = (school: School) => {
    return selectedSchools.some((s) => s.id === school.id)
  }

  const handleSelectSchool = (school: School) => {
    toggleSchoolMutation.mutate(school.id)
  }

  const handleSelectGroup = (group: SchoolGroup) => {
    toggleGroupMutation.mutate(group.id)
  }

  const headerText = getHeaderText(selectedSchools, selectedGroups)

  // If user only has access to one school and no groups, don't show the switcher
  if (!isLoading && schools.length <= 1 && groups.length === 0) {
    return (
      <div className="px-4 py-3 border-b">
        <p className="text-sm font-medium truncate">{schools[0]?.name || 'Nenhuma escola'}</p>
      </div>
    )
  }

  return (
    <div className="border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderTree className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium truncate block">{headerText}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="start" sideOffset={4}>
          {/* Seção de Grupos */}
          {groups.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Agrupamentos
              </DropdownMenuLabel>
              {groups.map((group) => {
                const selected = isGroupSelected(group)
                const partial = isGroupPartial(group)
                const Icon = getGroupIcon(group.type)

                return (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={cn(
                      'gap-2 p-2 transition-colors cursor-pointer',
                      selected && 'bg-primary/10 font-medium text-primary'
                    )}
                  >
                    <div className="relative">
                      <Checkbox
                        checked={selected}
                        className="pointer-events-none"
                      />
                      {partial && !selected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Minus className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-sm border">
                      <Icon className="h-4 w-4 shrink-0" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm">{group.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {group.schoolCount} escola{group.schoolCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Seção de Escolas Individuais */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Escolas Individuais
          </DropdownMenuLabel>
          {schools.map((school) => {
            const selected = isSchoolSelected(school)

            return (
              <DropdownMenuItem
                key={school.id}
                onClick={() => handleSelectSchool(school)}
                className={cn(
                  'gap-2 p-2 transition-colors cursor-pointer',
                  selected && 'bg-primary/10 font-medium text-primary'
                )}
              >
                <Checkbox checked={selected} className="pointer-events-none" />
                <div className="flex h-6 w-6 items-center justify-center rounded-sm border">
                  <Building className="h-4 w-4 shrink-0" />
                </div>
                <span className="text-sm truncate">{school.name}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
