export type PlotState = 'empty' | 'growing' | 'ready'

export type CropType = 'carrot' | 'tomato' | 'corn' | 'pumpkin' | 'eggplant'

export interface Plot {
  id: number
  state: PlotState
  cropType: CropType | null
  plantedAt: string | null
}
