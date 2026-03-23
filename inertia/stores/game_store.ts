import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameCharacter, GameCharacterMission, GameIdleState } from '../types/game'

interface GameState {
  character: GameCharacter | null
  activeMissions: GameCharacterMission[]
  idleState: GameIdleState | null

  setCharacter: (character: GameCharacter | null) => void
  setActiveMissions: (missions: GameCharacterMission[]) => void
  setIdleState: (state: GameIdleState | null) => void

  updateGold: (delta: number) => void
  updateEnergy: (energy: number) => void
  updateExperience: (xp: number) => void

  addMission: (mission: GameCharacterMission) => void
  removeMission: (missionId: string) => void
  updateMissionStatus: (missionId: string, status: string) => void

  reset: () => void
}

const initialState = {
  character: null,
  activeMissions: [],
  idleState: null,
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setCharacter: (character) => set({ character }),
      setActiveMissions: (activeMissions) => set({ activeMissions }),
      setIdleState: (idleState) => set({ idleState }),

      updateGold: (delta) =>
        set((state) => ({
          character: state.character
            ? { ...state.character, gold: state.character.gold + delta }
            : null,
        })),

      updateEnergy: (energy) =>
        set((state) => ({
          character: state.character ? { ...state.character, energy } : null,
        })),

      updateExperience: (xp) =>
        set((state) => ({
          character: state.character
            ? { ...state.character, experience: state.character.experience + xp }
            : null,
        })),

      addMission: (mission) =>
        set((state) => ({
          activeMissions: [...state.activeMissions, mission],
        })),

      removeMission: (missionId) =>
        set((state) => ({
          activeMissions: state.activeMissions.filter((m) => m.id !== missionId),
        })),

      updateMissionStatus: (missionId, status) =>
        set((state) => ({
          activeMissions: state.activeMissions.map((m) =>
            m.id === missionId ? { ...m, status: status as MissionStatus } : m
          ),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        character: state.character,
        activeMissions: state.activeMissions,
        idleState: state.idleState,
      }),
    }
  )
)

type MissionStatus = 'in_progress' | 'completed' | 'claimed'
