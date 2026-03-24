import StudentHasLevel from '#models/student_has_level'
import TeacherHasClass from '#models/teacher_has_class'
import CoordinatorHasLevel from '#models/coordinator_has_level'
import User from '#models/user'

export interface InquiryRecipient {
  userId: string
  userType: 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'
}

export async function resolveInquiryRecipients(
  studentId: string,
  schoolId: string
): Promise<InquiryRecipient[]> {
  const recipients: Map<string, InquiryRecipient> = new Map()

  const activeEnrollment = await StudentHasLevel.query()
    .where('studentId', studentId)
    .whereNull('deletedAt')
    .first()

  if (activeEnrollment) {
    if (activeEnrollment.classId) {
      const teacherClasses = await TeacherHasClass.query()
        .where('classId', activeEnrollment.classId)
        .where('isActive', true)
        .preload('teacher', (teacherQuery) => {
          teacherQuery.preload('user', (userQuery) => {
            userQuery.where('active', true).whereNull('deletedAt')
          })
        })

      for (const teacherClass of teacherClasses) {
        if (teacherClass.teacher?.user) {
          const userId = teacherClass.teacher.user.id
          if (!recipients.has(userId)) {
            recipients.set(userId, {
              userId,
              userType: 'TEACHER',
            })
          }
        }
      }
    }

    if (activeEnrollment.levelId) {
      const coordinatorLevels = await CoordinatorHasLevel.query()
        .whereHas('levelAssignedToCourseHasAcademicPeriod', (query) => {
          query.where('levelId', activeEnrollment.levelId!)
        })
        .preload('coordinator', (coordinatorQuery) => {
          coordinatorQuery.where('active', true).whereNull('deletedAt')
        })

      for (const coordinatorLevel of coordinatorLevels) {
        if (coordinatorLevel.coordinator) {
          const userId = coordinatorLevel.coordinator.id
          if (!recipients.has(userId)) {
            recipients.set(userId, {
              userId,
              userType: 'COORDINATOR',
            })
          }
        }
      }
    }
  }

  const directors = await User.query()
    .where('schoolId', schoolId)
    .where('active', true)
    .whereNull('deletedAt')
    .whereHas('role', (roleQuery) => {
      roleQuery.where('name', 'SCHOOL_DIRECTOR')
    })

  for (const director of directors) {
    if (!recipients.has(director.id)) {
      recipients.set(director.id, {
        userId: director.id,
        userType: 'DIRECTOR',
      })
    }
  }

  return Array.from(recipients.values())
}
