import { useQuery } from '@tanstack/react-query'
import { Link } from '@inertiajs/react'
import {
  GraduationCap,
  Users,
  UserCheck,
  BarChart3,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'

interface ClassesGridProps {
  courseId: string
  academicPeriodId: string
  academicPeriodSlug: string
  courseSlug: string
}

interface TeacherInfo {
  id: string
  name: string
  email: string | null
  subject: {
    id: string
    name: string
  }
}

interface ClassItem {
  id: string
  name: string
  slug: string
  studentCount: number
  teachers: TeacherInfo[]
  lastActivity: {
    type: 'ASSIGNMENT'
    timestamp: string
    description: string
  } | null
  averageAttendance: number | null
}

async function fetchClasses(courseId: string, academicPeriodId: string): Promise<ClassItem[]> {
  const response = await fetch(
    `/api/v1/courses/${courseId}/academic-periods/${academicPeriodId}/classes`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch classes')
  }
  return response.json()
}

function ClassesGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ClassesGridError() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-destructive">Erro ao carregar turmas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível carregar as turmas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClassesGrid({
  courseId,
  academicPeriodId,
  academicPeriodSlug,
  courseSlug,
}: ClassesGridProps) {
  const {
    data: classes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['course-classes', courseId, academicPeriodId],
    queryFn: () => fetchClasses(courseId, academicPeriodId),
  })

  if (isLoading) {
    return <ClassesGridSkeleton />
  }

  if (isError || !classes) {
    return <ClassesGridError />
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma turma cadastrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Não há turmas cadastradas para este curso no período letivo atual.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((classItem) => (
        <Card key={classItem.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {classItem.name}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Alunos
                </span>
                <span className="font-semibold">{classItem.studentCount}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Frequência
                </span>
                {classItem.averageAttendance !== null ? (
                  <Badge
                    variant={
                      classItem.averageAttendance >= 75
                        ? 'default'
                        : classItem.averageAttendance >= 50
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {classItem.averageAttendance.toFixed(1)}%
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>

            {/* Teachers */}
            {classItem.teachers.length > 0 && (
              <div className="space-y-1 border-t pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3" />
                  Professores
                </div>
                <div className="space-y-1">
                  {classItem.teachers.slice(0, 2).map((teacher, idx) => (
                    <div key={`${teacher.id}-${idx}`} className="text-xs">
                      <span className="font-medium">{teacher.name}</span>
                      <span className="text-muted-foreground"> - {teacher.subject.name}</span>
                    </div>
                  ))}
                  {classItem.teachers.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{classItem.teachers.length - 2} outros
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Last Activity */}
            {classItem.lastActivity && (
              <div className="space-y-1 border-t pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Última atividade
                </div>
                <p className="text-xs">{classItem.lastActivity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(classItem.lastActivity.timestamp), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            )}

            {/* View Details Button */}
            <Button className="w-full" variant="outline" asChild>
              <Link
                href={`/escola/periodos-letivos/${academicPeriodSlug}/cursos/${courseSlug}/turmas/${classItem.slug}/atividades`}
              >
                Ver detalhes
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
