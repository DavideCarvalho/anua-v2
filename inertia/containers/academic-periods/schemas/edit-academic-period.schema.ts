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

export const calendarFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  segment: z.enum(SEGMENTS, { required_error: 'Segmento é obrigatório' }),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date({ required_error: 'Data de término é obrigatória' }),
  enrollmentStartDate: z.date().nullable().optional(),
  enrollmentEndDate: z.date().nullable().optional(),
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
  levelId: z.string(),
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
