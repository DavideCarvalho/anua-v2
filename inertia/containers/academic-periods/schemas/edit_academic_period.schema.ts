import { z } from 'zod'

export const SEGMENTS = [
  'KINDERGARTEN',
  'ELEMENTARY',
  'HIGHSCHOOL',
  'TECHNICAL',
  'UNIVERSITY',
  'OTHER',
] as const

export type Segment = (typeof SEGMENTS)[number]

export const SEGMENT_LABELS: Record<Segment, string> = {
  KINDERGARTEN: 'Educação Infantil',
  ELEMENTARY: 'Ensino Fundamental',
  HIGHSCHOOL: 'Ensino Médio',
  TECHNICAL: 'Ensino Técnico',
  UNIVERSITY: 'Ensino Superior',
  OTHER: 'Outro',
}

export const PERIOD_STRUCTURE_OPTIONS = [
  {
    value: '',
    label: 'Usar config da escola',
    description: 'Usa o padrão definido nas configurações',
  },
  {
    value: 'BIMESTRAL',
    label: 'Bimestral (4 períodos)',
    description: 'O ano é dividido em 4 bimestres',
  },
  {
    value: 'TRIMESTRAL',
    label: 'Trimestral (3 períodos)',
    description: 'O ano é dividido em 3 trimestres',
  },
  {
    value: 'SEMESTRAL',
    label: 'Semestral (2 períodos)',
    description: 'O ano é dividido em 2 semestres',
  },
  {
    value: 'ANUAL',
    label: 'Anual (1 período)',
    description: 'O ano inteiro conta como um único período',
  },
] as const

export const RECOVERY_METHOD_OPTIONS = [
  { value: '', label: 'Usar config da escola', description: 'Usa o padrão definido' },
  {
    value: 'AVERAGE',
    label: 'Média (Nota + Rec) / 2',
    description: 'Soma a nota original com a de recuperação e divide por dois',
  },
  {
    value: 'REPLACE_IF_HIGHER',
    label: 'Substituir se maior',
    description: 'A nota de recuperação só substitui a original se for maior',
  },
  {
    value: 'REPLACE',
    label: 'Substituir pela rec.',
    description: 'A nota de recuperação sempre substitui a original, independentemente do valor',
  },
] as const

export const calendarFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  segment: z.enum(SEGMENTS, { error: 'Segmento é obrigatório' }),
  startDate: z.date({ error: 'Data de início é obrigatória' }),
  endDate: z.date({ error: 'Data de término é obrigatória' }),
  enrollmentStartDate: z.date().nullable().optional(),
  enrollmentEndDate: z.date().nullable().optional(),
  periodStructure: z.enum(['', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL']).optional(),
  recoveryGradeMethod: z.enum(['', 'AVERAGE', 'REPLACE_IF_HIGHER', 'REPLACE']).optional(),
  breakStartDate: z.date().nullable().optional(),
  breakEndDate: z.date().nullable().optional(),
})

export const teacherSchema = z.object({
  id: z.string().optional(),
  teacherId: z.string(),
  teacherName: z.string().optional(),
  subjectId: z.string(),
  subjectName: z.string().optional(),
  subjectQuantity: z.number(),
})

export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  teachers: z.array(teacherSchema).optional().default([]),
})

export const levelSchema = z.object({
  id: z.string().optional(),
  levelId: z.string().optional(),
  name: z.string(),
  order: z.number(),
  contractId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  classes: z.array(classSchema).optional().default([]),
})

export const courseSchema = z.object({
  id: z.string().optional(),
  courseId: z.string(),
  name: z.string(),
  levels: z.array(levelSchema),
})

export const coursesFormSchema = z.object({
  courses: z.array(courseSchema),
})

export const editAcademicPeriodSchema = z.object({
  calendar: calendarFormSchema,
  courses: z.array(courseSchema),
})

export type CalendarFormValues = z.infer<typeof calendarFormSchema>
export type TeacherFormValues = z.infer<typeof teacherSchema>
export type ClassFormValues = z.infer<typeof classSchema>
export type LevelFormValues = z.infer<typeof levelSchema>
export type CourseFormValues = z.infer<typeof courseSchema>
export type CoursesFormValues = z.infer<typeof coursesFormSchema>
export type EditAcademicPeriodFormValues = z.infer<typeof editAcademicPeriodSchema>
