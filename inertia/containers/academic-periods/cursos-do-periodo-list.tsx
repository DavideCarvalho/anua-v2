import { BookOpen, Layers } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

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
}

export function CursosDoPeríodoList({ courses }: CursosDoPeríodoListProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
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
        <Badge variant="secondary">{courses.length} curso(s)</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{course.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>{course.levels.length} nível(is)</span>
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
