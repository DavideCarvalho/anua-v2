import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import StudentHasLevel from '#models/student_has_level'
import TeacherHasClass from '#models/teacher_has_class'
import CoordinatorHasLevel from '#models/coordinator_has_level'
import User from '#models/user'

export type InquirySchoolActorType = 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'

export async function getInquiryActorTypeForUser(
  inquiry: ParentInquiry,
  userId: string
): Promise<InquirySchoolActorType | null> {
  const existingRecipient = await ParentInquiryRecipient.query()
    .where('inquiryId', inquiry.id)
    .where('userId', userId)
    .first()

  if (existingRecipient) {
    return existingRecipient.userType
  }

  const user = await User.query().where('id', userId).preload('role').first()
  if (!user) {
    return null
  }

  if (user.role?.name === 'SCHOOL_DIRECTOR') {
    return 'DIRECTOR'
  }

  const activeEnrollment = await StudentHasLevel.query()
    .where('studentId', inquiry.studentId)
    .whereNull('deletedAt')
    .first()

  if (!activeEnrollment) {
    return null
  }

  if (activeEnrollment.classId) {
    const teacherHasClass = await TeacherHasClass.query()
      .where('teacherId', userId)
      .where('classId', activeEnrollment.classId)
      .where('isActive', true)
      .first()

    if (teacherHasClass) {
      return 'TEACHER'
    }
  }

  if (activeEnrollment.levelAssignedToCourseAcademicPeriodId) {
    const coordinatorHasLevel = await CoordinatorHasLevel.query()
      .where('coordinatorId', userId)
      .where(
        'levelAssignedToCourseHasAcademicPeriodId',
        activeEnrollment.levelAssignedToCourseAcademicPeriodId
      )
      .first()

    if (coordinatorHasLevel) {
      return 'COORDINATOR'
    }
  }

  return null
}

export async function listAccessibleInquiryIdsForUser(
  userId: string,
  scopedSchoolIds: string[]
): Promise<string[]> {
  const ids = new Set<string>()

  const directRecipients = await ParentInquiryRecipient.query()
    .where('userId', userId)
    .select('inquiryId')
  for (const recipient of directRecipients) {
    ids.add(recipient.inquiryId)
  }

  const user = await User.query().where('id', userId).preload('role').first()
  if (!user) {
    return [...ids]
  }

  if (user.role?.name === 'SCHOOL_DIRECTOR') {
    const allInSchool = await ParentInquiry.query()
      .whereIn('schoolId', scopedSchoolIds)
      .select('id')
    for (const inquiry of allInSchool) {
      ids.add(inquiry.id)
    }
  }

  const teacherClassLinks = await TeacherHasClass.query()
    .where('teacherId', userId)
    .where('isActive', true)
    .select('classId')

  const classIds = teacherClassLinks.map((item) => item.classId).filter(Boolean)
  if (classIds.length > 0) {
    const studentLevels = await StudentHasLevel.query()
      .whereIn('classId', classIds)
      .whereNull('deletedAt')
      .select('studentId')
    const studentIds = [...new Set(studentLevels.map((item) => item.studentId))]
    if (studentIds.length > 0) {
      const teacherInquiries = await ParentInquiry.query()
        .whereIn('schoolId', scopedSchoolIds)
        .whereIn('studentId', studentIds)
        .select('id')
      for (const inquiry of teacherInquiries) {
        ids.add(inquiry.id)
      }
    }
  }

  const coordinatorLevels = await CoordinatorHasLevel.query()
    .where('coordinatorId', userId)
    .select('levelAssignedToCourseHasAcademicPeriodId')

  const levelAssignmentIds = coordinatorLevels
    .map((item) => item.levelAssignedToCourseHasAcademicPeriodId)
    .filter(Boolean)
  if (levelAssignmentIds.length > 0) {
    const studentLevels = await StudentHasLevel.query()
      .whereIn('levelAssignedToCourseAcademicPeriodId', levelAssignmentIds)
      .whereNull('deletedAt')
      .select('studentId')
    const studentIds = [...new Set(studentLevels.map((item) => item.studentId))]
    if (studentIds.length > 0) {
      const coordinatorInquiries = await ParentInquiry.query()
        .whereIn('schoolId', scopedSchoolIds)
        .whereIn('studentId', studentIds)
        .select('id')
      for (const inquiry of coordinatorInquiries) {
        ids.add(inquiry.id)
      }
    }
  }

  return [...ids]
}
