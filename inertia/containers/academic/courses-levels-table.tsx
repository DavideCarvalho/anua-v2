import { useSuspenseQuery } from '@tanstack/react-query'
import { GraduationCap, Layers, Plus, MoreHorizontal, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { useCoursesQueryOptions } from '../../hooks/queries/use_courses'
import { useLevelsQueryOptions } from '../../hooks/queries/use_levels'
import { useDeleteCourse } from '../../hooks/mutations/use_course_mutations'
import { useDeleteLevel } from '../../hooks/mutations/use_level_mutations'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible'

interface CoursesLevelsTableProps {
  schoolId: string
  onCreateCourse?: () => void
  onCreateLevel?: (courseId: string) => void
  onEditCourse?: (id: string) => void
  onEditLevel?: (id: string) => void
}

export function CoursesLevelsTable({
  schoolId,
  onCreateCourse,
  onCreateLevel,
  onEditCourse,
  onEditLevel,
}: CoursesLevelsTableProps) {
  const { data: coursesData } = useSuspenseQuery(useCoursesQueryOptions({ schoolId }))
  const { data: levelsData } = useSuspenseQuery(useLevelsQueryOptions({ schoolId }))
  const deleteCourseMutation = useDeleteCourse()
  const deleteLevelMutation = useDeleteLevel()

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())

  const courses = Array.isArray(coursesData) ? coursesData : coursesData?.data || []
  const levels = Array.isArray(levelsData) ? levelsData : levelsData?.data || []

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }

  const getLevelsForCourse = (courseId: string) => {
    return levels.filter((level: any) => level.courseId === courseId)
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum curso cadastrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre cursos e níveis para organizar suas turmas
          </p>
          {onCreateCourse && (
            <Button className="mt-4" onClick={onCreateCourse}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Curso
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cursos e Níveis</CardTitle>
          <CardDescription>
            {courses.length} curso(s) • {levels.length} nível(is)
          </CardDescription>
        </div>
        {onCreateCourse && (
          <Button onClick={onCreateCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Curso
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {courses.map((course: any) => {
            const courseLevels = getLevelsForCourse(course.id)
            const isExpanded = expandedCourses.has(course.id)

            return (
              <Collapsible key={course.id} open={isExpanded} onOpenChange={() => toggleCourse(course.id)}>
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{course.name}</p>
                        {course.description && (
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {courseLevels.length} níveis
                      </Badge>
                    </CollapsibleTrigger>

                    <div className="flex items-center gap-2">
                      {onCreateLevel && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onCreateLevel(course.id)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nível
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditCourse?.(course.id)}>
                            Editar Curso
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteCourseMutation.mutate(course.id)}
                          >
                            Excluir Curso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CollapsibleContent>
                    {courseLevels.length > 0 ? (
                      <div className="border-t bg-muted/30">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Ordem</TableHead>
                              <TableHead>Nível</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="text-center">Turmas</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {courseLevels
                              .sort((a: any, b: any) => a.order - b.order)
                              .map((level: any) => (
                                <TableRow key={level.id}>
                                  <TableCell>
                                    <Badge variant="outline">{level.order}</Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Layers className="h-4 w-4 text-muted-foreground" />
                                      {level.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {level.description || '-'}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {level.classes?.length || 0}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditLevel?.(level.id)}>
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => deleteLevelMutation.mutate(level.id)}
                                        >
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="border-t p-4 text-center text-sm text-muted-foreground">
                        Nenhum nível cadastrado para este curso
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
