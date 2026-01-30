import { Layers, GraduationCap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

type Segment = 'KINDERGARTEN' | 'ELEMENTARY' | 'HIGHSCHOOL' | 'TECHNICAL' | 'UNIVERSITY' | 'OTHER'

interface Level {
  id: string
  levelId: string
  name: string
  order: number
  contractId: string | null
  isActive: boolean
}

interface Course {
  id: string
  courseId: string
  name: string
  levels: Level[]
}

interface CursosDoPeríodoListProps {
  courses: Course[]
  segment?: Segment
}

function isCourseSegment(segment?: Segment) {
  return segment === 'TECHNICAL' || segment === 'UNIVERSITY'
}

export function CursosDoPeríodoList({ courses, segment }: CursosDoPeríodoListProps) {
  const isCourseBased = isCourseSegment(segment)

  // Para educação básica, mostrar as séries diretamente (já que sempre tem só 1 segmento)
  if (!isCourseBased) {
    const allLevels = courses.flatMap((course) => course.levels).sort((a, b) => a.order - b.order)

    if (allLevels.length === 0) {
      return (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                Nenhuma série vinculada a este período letivo.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Séries</h2>
          <Badge variant="secondary">
            {allLevels.length} {allLevels.length === 1 ? 'série' : 'séries'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {allLevels.map((level) => (
            <Badge
              key={level.id}
              variant={level.isActive ? 'outline' : 'secondary'}
              className="text-sm py-1.5 px-3"
            >
              {level.name}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  // Para ensino técnico/superior, mostrar os cursos com seus semestres
  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Nenhum curso vinculado a este período letivo.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cursos</h2>
        <Badge variant="secondary">
          {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{course.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>
                    {course.levels.length}{' '}
                    {course.levels.length === 1 ? 'semestre' : 'semestres'}
                  </span>
                </div>
                {course.levels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {course.levels
                      .sort((a, b) => a.order - b.order)
                      .map((level) => (
                        <Badge
                          key={level.id}
                          variant={level.isActive ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {level.name}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
