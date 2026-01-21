import vine from '@vinejs/vine'

// Post Types
const postTypes = ['TEXT', 'IMAGE', 'VIDEO', 'LINK', 'ANNOUNCEMENT'] as const
const postVisibilities = ['PUBLIC', 'SCHOOL_ONLY', 'CLASS_ONLY', 'PRIVATE'] as const

// Create Post Validator
export const createPostValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1),
    type: vine.enum(postTypes),
    visibility: vine.enum(postVisibilities).optional(),
    attachmentUrl: vine.string().trim().url().optional(),
    schoolId: vine.string(),
    classId: vine.string().optional(),
  })
)

// Update Post Validator
export const updatePostValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).optional(),
    type: vine.enum(postTypes).optional(),
    visibility: vine.enum(postVisibilities).optional(),
    attachmentUrl: vine.string().trim().url().optional().nullable(),
  })
)

// List Posts Validator
export const listPostsValidator = vine.compile(
  vine.object({
    schoolId: vine.string().optional(),
    classId: vine.string().optional(),
    authorId: vine.string().optional(),
    type: vine.enum(postTypes).optional(),
    visibility: vine.enum(postVisibilities).optional(),
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)

// Create Comment Validator
export const createCommentValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(2000),
    parentCommentId: vine.string().optional(),
  })
)

// Update Comment Validator
export const updateCommentValidator = vine.compile(
  vine.object({
    content: vine.string().trim().minLength(1).maxLength(2000),
  })
)

// List Comments Validator
export const listCommentsValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
  })
)
