import { BaseModelDto } from '@adocasts.com/dto/base'

export default class SchoolLogoUploadResponseDto extends BaseModelDto {
  declare url: string | null

  constructor(url?: string | null) {
    super()
    this.url = url ?? null
  }
}
