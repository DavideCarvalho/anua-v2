# Overworld Map Design

Grid 40×25 tiles, tileSize 16px → 640×400 world.

## Legend

- `~` = water (impassable)
- `.` = grass (walkable)
- `T` = Treasure (Baú de Tesouros)
- `M` = Market (Mercadinho)
- `B` = Mailbox (Correio)
- `P` = Player spawn

## ASCII Map

```
     0         1         2         3
     0123456789012345678901234567890123456789
 0   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 1   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 2   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 3   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 4   ~~~~~~~~~~..........................~~~~~~~~~~
 5   ~~~~~~~~~..............................~~~~~~~~~
 6   ~~~~~~~~~........T..............M......~~~~~~~~~
 7   ~~~~~~~~~..............................~~~~~~~~~
 8   ~~~~~~~~~..............................~~~~~~~~~
 9   ~~~~~~~~~..............................~~~~~~~~~
10   ~~~~~~~~~..............................~~~~~~~~~
11   ~~~~~~~~~..............................~~~~~~~~~
12   ~~~~~~~~~.................P...........~~~~~~~~~
13   ~~~~~~~~~..............................~~~~~~~~~
14   ~~~~~~~~~..............................~~~~~~~~~
15   ~~~~~~~~~..............................~~~~~~~~~
16   ~~~~~~~~~......................B......~~~~~~~~~
17   ~~~~~~~~~..............................~~~~~~~~~
18   ~~~~~~~~~..............................~~~~~~~~~
19   ~~~~~~~~~..............................~~~~~~~~~
20   ~~~~~~~~~~..........................~~~~~~~~~~
21   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
22   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
23   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
24   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Zone Table

| Zona     | tileX | tileY | ground[tileY*40+tileX] |
| -------- | ----- | ----- | ---------------------- |
| treasure | 12    | 6     | G (1)                  |
| market   | 28    | 6     | G (1)                  |
| mailbox  | 28    | 16    | G (1)                  |
| spawn    | 20    | 12    | G (1)                  |

## Zonas visuais (autotiling)

O mapa lógico usa apenas G (grama) e W (água). O autotiling define o tile visual em tempo de render com base nos 8 vizinhos:

| Zona     | Descrição                       | Tiles usados                                |
| -------- | ------------------------------- | ------------------------------------------- |
| Planície | Interior da ilha, longe da água | Grass Middle (variantes de Grass_Tiles_1–4) |
| Costa    | Borda grama/água                | Grass Edge + Water Edge (Beach_Tiles)       |
| Mar      | Água longe da terra             | Water Middle                                |

- **Planície**: tile G com todos os vizinhos G → Grass Middle (16 variantes por posição).
- **Costa**: tile G com vizinho W → Grass Edge; tile W com vizinho G → Water Edge (Beach).
- **Mar**: tile W com todos os vizinhos W → Water Middle.

## Rules

- All zones and spawn MUST be on grass tiles (G).
- Pixel position from tile: `(tileX + 0.5) * tileSize`, `(tileY + 0.5) * tileSize`.
