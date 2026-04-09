# Aluno Kids Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a new, playful dashboard for students aged 14 and under, featuring a "Game Lobby" style with large buttons for different school areas (Canteen, Shop, etc.) and a dedicated status bar for points.

**Architecture:** Modify the existing student dashboard controller to calculate age using `birthDate` and conditionally render either the standard or the kids dashboard. The kids dashboard will be a new Inertia page with specialized components.

**Tech Stack:**

- AdonisJS (Backend)
- Luxon (Date calculations)
- Inertia.js + React (Frontend)
- Tailwind CSS (Styling)
- Lucide React (Icons)
- Canvas Confetti (Celebration effect)

---

### Task 1: Age-Based Logic in Controller

**Files:**

- Modify: `app/controllers/pages/aluno/show_aluno_dashboard_page_controller.ts`

**Step 1: Calculate age and determine if kids mode should be active**

```typescript
// Add to handle() method after loading user and role
const birthDate = user.birthDate
const isKids = birthDate ? Math.floor(Math.abs(birthDate.diffNow('years').years)) <= 14 : true // Default to kids if no birthDate?

// Update return statement
return inertia.render(isKids ? 'aluno/kids_dashboard' : 'aluno/dashboard', {
  isKids,
  // ... existing data
})
```

**Step 2: Commit**

```bash
git add app/controllers/pages/aluno/show_aluno_dashboard_page_controller.ts
git commit -m "feat: add age-based redirection logic for kids dashboard"
```

---

### Task 2: Kids Dashboard Page Skeleton

**Files:**

- Create: `inertia/pages/aluno/kids_dashboard.tsx`

**Step 1: Create the basic skeleton with AlunoLayout**

```tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'

export default function KidsDashboard({ student, gamification }: any) {
  return (
    <AlunoLayout>
      <Head title="Meu Cantinho" />
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
        {/* Components will go here */}
        <h1 className="text-4xl font-bold text-primary">Olá, {student.name}!</h1>
      </div>
    </AlunoLayout>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/pages/aluno/kids_dashboard.tsx
git commit -m "feat: create kids dashboard skeleton"
```

---

### Task 3: Kids Status Bar Component

**Files:**

- Create: `inertia/components/aluno/kids/status-bar.tsx`

**Step 1: Implement the playful status bar**

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar'
import { Star } from 'lucide-react'

export function KidsStatusBar({ student, points }: { student: any; points: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden bg-sky-200">
          {/* Simple placeholder for now, actual avatar later */}
          <Avatar className="w-full h-full">
            <AvatarFallback>{student.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estudante Estelar
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-yellow-400 border-4 border-slate-900 rounded-2xl px-4 py-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <Star className="w-6 h-6 fill-white text-white drop-shadow-sm animate-pulse" />
        <span className="text-2xl font-black text-slate-900">{points}</span>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/components/aluno/kids/status-bar.tsx
git commit -m "feat: add kids status bar component"
```

---

### Task 4: Kids Mode Card Component

**Files:**

- Create: `inertia/components/aluno/kids/mode-card.tsx`

**Step 1: Implement the large game-style button**

```tsx
import { Link } from '@inertiajs/react'
import { ReactNode } from 'react'

interface KidsModeCardProps {
  title: string
  subtitle: string
  icon: ReactNode
  href: string
  color: string // Tailwind color class like 'bg-orange-500'
}

export function KidsModeCard({ title, subtitle, icon, href, color }: KidsModeCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col items-center justify-center p-6 w-64 h-80 ${color} rounded-[3rem] border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-2 active:translate-y-2 active:shadow-none`}
    >
      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-white uppercase leading-tight drop-shadow-[2px_2px_0px_rgba(15,23,42,1)]">
          {title}
        </h3>
        <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
    </Link>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/components/aluno/kids/mode-card.tsx
git commit -m "feat: add kids mode card component"
```

---

### Task 5: Assemble Kids Dashboard Layout

**Files:**

- Modify: `inertia/pages/aluno/kids_dashboard.tsx`

**Step 1: Put it all together in the main page**

```tsx
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { KidsStatusBar } from '../../components/aluno/kids/status-bar'
import { KidsModeCard } from '../../components/aluno/kids/mode-card'
import { Utensils, ShoppingBag, Gift } from 'lucide-react'

export default function KidsDashboard({ student, gamification }: any) {
  return (
    <AlunoLayout>
      <Head title="Meu Hub de Prêmios" />
      <div className="flex flex-col items-center py-12 px-4 bg-sky-100 dark:bg-slate-950 min-h-screen">
        <KidsStatusBar student={student} points={gamification.totalPoints} />

        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <KidsModeCard
            title="Cantina"
            subtitle="Lanches Deliciosos"
            icon={<Utensils className="w-20 h-20 text-white" />}
            href="/aluno/loja" // Need to check if can filter by canteen
            color="bg-orange-500"
          />
          <KidsModeCard
            title="Lojinha"
            subtitle="Itens Incríveis"
            icon={<ShoppingBag className="w-20 h-20 text-white" />}
            href="/aluno/loja"
            color="bg-sky-500"
          />
          <KidsModeCard
            title="Prêmios"
            subtitle="Meus Resgates"
            icon={<Gift className="w-20 h-20 text-white" />}
            href="/aluno/loja/pedidos"
            color="bg-lime-500"
          />
        </div>
      </div>
    </AlunoLayout>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/pages/aluno/kids_dashboard.tsx
git commit -m "feat: assemble kids dashboard layout"
```

---

### Task 6: Add Celebration Effect (Optional/Polishing)

**Files:**

- Modify: `inertia/pages/aluno/kids_dashboard.tsx`
- Install: `npm install canvas-confetti @types/canvas-confetti`

**Step 1: Install confetti library**

Run: `npm install canvas-confetti @types/canvas-confetti`

**Step 2: Add trigger on mount (just for test) or later integrate with store success**

```tsx
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

// Inside KidsDashboard
useEffect(() => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  })
}, [])
```

**Step 3: Commit**

```bash
git add inertia/pages/aluno/kids_dashboard.tsx package.json
git commit -m "feat: add confetti celebration to kids dashboard"
```
