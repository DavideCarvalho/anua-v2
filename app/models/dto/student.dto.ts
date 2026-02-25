import { BaseModelDto } from '@adocasts.com/dto/base'
import type Student from '#models/student'
import UserDto from './user.dto.js'
import ClassDto from './class.dto.js'
import StudentAddressDto from './student_address.dto.js'
import StudentMedicalInfoDto from './student_medical_info.dto.js'
import StudentEmergencyContactDto from './student_emergency_contact.dto.js'
import { StudentHasResponsibleDto } from './student_has_responsible.dto.js'
import StudentDocumentDto from './student_document.dto.js'
import StudentHasLevelDto from './student_has_level.dto.js'

export default class StudentDto extends BaseModelDto {
  declare id: string
  declare discountPercentage: number
  declare monthlyPaymentAmount: number
  declare isSelfResponsible: boolean
  declare paymentDate: number | null
  declare classId: string | null
  declare contractId: string | null
  declare canteenLimit: number | null
  declare balance: number
  declare enrollmentStatus: string
  declare user?: UserDto
  declare class?: ClassDto
  declare address?: StudentAddressDto
  declare medicalInfo?: StudentMedicalInfoDto
  declare emergencyContacts?: StudentEmergencyContactDto[]
  declare responsibles?: StudentHasResponsibleDto[]
  declare documents?: StudentDocumentDto[]
  declare levels?: StudentHasLevelDto[]

  constructor(student?: Student) {
    super()

    if (!student) return

    this.id = student.id
    // Note: Model uses descountPercentage (typo in DB)
    this.discountPercentage = student.descountPercentage
    this.monthlyPaymentAmount = student.monthlyPaymentAmount
    this.isSelfResponsible = student.isSelfResponsible
    this.paymentDate = student.paymentDate
    this.classId = student.classId
    this.contractId = student.contractId
    this.canteenLimit = student.canteenLimit
    this.balance = student.balance
    this.enrollmentStatus = student.enrollmentStatus
    // Note: Student model doesn't have createdAt/updatedAt - they come from User
    this.user = student.user ? new UserDto(student.user) : undefined
    this.class = student.class ? new ClassDto(student.class) : undefined
    this.address = student.address ? new StudentAddressDto(student.address) : undefined
    this.medicalInfo = student.medicalInfo
      ? new StudentMedicalInfoDto(student.medicalInfo)
      : undefined
    this.emergencyContacts = student.emergencyContacts
      ? StudentEmergencyContactDto.fromArray(student.emergencyContacts)
      : undefined
    this.responsibles = student.responsibles
      ? StudentHasResponsibleDto.fromArray(student.responsibles)
      : undefined
    this.documents = student.documents ? StudentDocumentDto.fromArray(student.documents) : undefined
    this.levels = student.levels ? StudentHasLevelDto.fromArray(student.levels) : undefined
  }
}
