import type { MapDef } from './map-types'

/**
 * Overworld map definition.
 *
 * Positions match the original SVG island scene interaction zones.
 * Colours are placeholder fills for the object sprites drawn with Graphics.
 */
export const OVERWORLD_MAP: MapDef = {
  width: 400,
  height: 300,
  playerSpawn: { x: 200, y: 150 },
  zones: [
    {
      id: 'treasure',
      label: 'Baú de Tesouros',
      href: '/aluno/loja/pontos',
      position: { x: 80, y: 80 },
      radius: 40,
      color: 0xf5a623, // golden
      width: 28,
      height: 24,
    },
    {
      id: 'market',
      label: 'Mercadinho',
      href: '/aluno/loja',
      position: { x: 300, y: 70 },
      radius: 40,
      color: 0x4caf50, // green
      width: 32,
      height: 28,
    },
    {
      id: 'mailbox',
      label: 'Correio',
      href: '/aluno/loja/pedidos',
      position: { x: 310, y: 195 },
      radius: 40,
      color: 0x5b8def, // blue
      width: 20,
      height: 28,
    },
  ],
}
