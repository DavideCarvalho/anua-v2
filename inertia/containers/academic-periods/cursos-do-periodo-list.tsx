import { useEffect, useMemo, useState } from 'react'
import { Layers, GraduationCap, ChevronDown } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

type Segment = 'KINDERGARTEN' | 'ELEMENTARY' | 'HIGHSCHOOL' | 'TECHNICAL' | 'UNIVERSITY' | 'OTHER'

interface Level {
  id: string
  levelId: string
  name: string
  slug?: string | null
  order: number
  contractId: string | null
  isActive: boolean
  studentsCount?: number
  classesCount?: number
}

interface Course {
  id: string
  courseId: string
  name: string
  slug?: string | null
  enrollmentMinimumAge?: number | null
  enrollmentMaximumAge?: number | null
  maxStudentsPerClass?: number | null
  metrics?: {
    levelsCount: number
    activeLevelsCount: number
    inactiveLevelsCount: number
    studentsCount: number
    classesCount: number
  }
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
  const allLevels = useMemo(
    () => courses.flatMap((course) => course.levels).sort((a, b) => a.order - b.order),
    [courses]
  )
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(allLevels[0]?.id ?? null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id ?? null)

  useEffect(() => {
    if (allLevels.length === 0) {
      setSelectedLevelId(null)
      return
    }

    if (!selectedLevelId || !allLevels.some((level) => level.id === selectedLevelId)) {
      setSelectedLevelId(allLevels[0].id)
    }
  }, [allLevels, selectedLevelId])

  useEffect(() => {
    if (courses.length === 0) {
      setSelectedCourseId(null)
      return
    }

    if (!selectedCourseId || !courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])

  // Para educação básica, mostrar as séries diretamente (já que sempre tem só 1 segmento)
  if (!isCourseBased) {
    const selectedLevel = allLevels.find((level) => level.id === selectedLevelId) ?? null

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
            <Button
              key={level.id}
              variant={selectedLevelId === level.id ? 'default' : 'outline'}
              className="h-auto py-1.5 px-3"
              onClick={() => setSelectedLevelId(level.id)}
            >
              <ChevronDown
                className={`h-3 w-3 mr-1 transition-transform ${selectedLevelId === level.id ? 'rotate-180' : ''}`}
              />
              {level.name}
            </Button>
          ))}
        </div>

        {selectedLevel && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{selectedLevel.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedLevel.isActive ? 'Ativa' : 'Inativa'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ordem</p>
                  <p className="font-medium">{selectedLevel.order}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contrato</p>
                  <p className="font-medium">
                    {selectedLevel.contractId ? 'Vinculado' : 'Sem vínculo'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Alunos</p>
                  <p className="font-medium">{selectedLevel.studentsCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Turmas</p>
                  <p className="font-medium">{selectedLevel.classesCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slug</p>
                  <p className="font-medium">{selectedLevel.slug ?? '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null

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
          <Card
            key={course.id}
            className={`cursor-pointer transition-colors ${selectedCourseId === course.id ? 'border-primary' : ''}`}
            onClick={() => setSelectedCourseId(course.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{course.name}</CardTitle>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${selectedCourseId === course.id ? 'rotate-180' : ''}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>
                    {course.levels.length} {course.levels.length === 1 ? 'semestre' : 'semestres'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {course.metrics?.studentsCount ?? 0} alunos • {course.metrics?.classesCount ?? 0}{' '}
                  turmas
                </div>
                {course.levels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {[...course.levels]
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

      {selectedCourse && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{selectedCourse.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Niveis</p>
                <p className="font-medium">
                  {selectedCourse.metrics?.levelsCount ?? selectedCourse.levels.length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Alunos</p>
                <p className="font-medium">{selectedCourse.metrics?.studentsCount ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Turmas</p>
                <p className="font-medium">{selectedCourse.metrics?.classesCount ?? 0}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Faixa etaria</p>
                <p className="font-medium">
                  {selectedCourse.enrollmentMinimumAge ?? '-'} a{' '}
                  {selectedCourse.enrollmentMaximumAge ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Max por turma</p>
                <p className="font-medium">{selectedCourse.maxStudentsPerClass ?? '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Slug</p>
                <p className="font-medium">{selectedCourse.slug ?? '-'}</p>
              </div>
            </div>
            {selectedCourse.levels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum semestre cadastrado para este curso.
              </p>
            ) : (
              <div className="space-y-2">
                {[...selectedCourse.levels]
                  .sort((a, b) => a.order - b.order)
                  .map((level) => (
                    <div
                      key={level.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{level.name}</p>
                        <p className="text-xs text-muted-foreground">Ordem {level.order}</p>
                      </div>
                      <Badge variant={level.isActive ? 'outline' : 'secondary'}>
                        {level.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
