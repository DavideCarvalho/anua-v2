import '@adonisjs/inertia/types'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

type JsonPrimitive = string | number | boolean | null

declare module '@adonisjs/inertia/types' {
  interface InertiaPages {
    'aluno/jogo/create-character': {
      studentName: string
    }

    'aluno/jogo/tavern': {
      character: JSONDataTypes
    }

    'aluno/dashboard': {
      student: { id: string; name: string }
      avatar: {
        id: string
        skinTone: string
        hairStyle: string
        hairColor: string
        outfit: string
        accessories: string[]
      }
      gamification: {
        totalPoints: number
        currentLevel: number
        levelProgress: number
        streak: number
      }
      recentAchievements: {
        id: string
        name: string
        description: string
        icon: string | null
        rarity: string
        unlockedAt: string | null
      }[]
    }

    'aluno/loja/pontos': {
      items: {
        id: string
        name: string
        description: string | null
        price: number
        category: string
        imageUrl: string | null
        metadata: Record<string, JsonPrimitive> | null
      }[]
      itemsByCategory: {
        AVATAR_HAIR: {
          id: string
          name: string
          description: string | null
          price: number
          imageUrl: string | null
          metadata: Record<string, JsonPrimitive> | null
        }[]
        AVATAR_OUTFIT: {
          id: string
          name: string
          description: string | null
          price: number
          imageUrl: string | null
          metadata: Record<string, JsonPrimitive> | null
        }[]
        AVATAR_ACCESSORY: {
          id: string
          name: string
          description: string | null
          price: number
          imageUrl: string | null
          metadata: Record<string, JsonPrimitive> | null
        }[]
      }
      avatar: {
        id: string
        skinTone: string
        hairStyle: string
        hairColor: string
        outfit: string
        accessories: string[]
      }
      points: number
    }

    'escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/situacao': {
      academicPeriodSlug: string
      courseSlug: string
      classSlug: string
      classId: string
      academicPeriodId: string
      courseId: string
      className: string
      courseName: string
      academicPeriodName: string
      subjects: { id: string; name: string; slug: string; teacherUserId: string }[]
      currentUserId: string | null
      currentUserRole: string
    }
  }
}
