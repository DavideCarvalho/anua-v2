import React from 'react'
import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'

interface DashboardProps {
  isKids: boolean
  student: { id: string; name: string }
  avatar: any
  gamification: any
  recentAchievements: any[]
}

const AlunoKidsDashboardPage: React.FC<DashboardProps> = ({ student }) => {
  return (
    <AlunoLayout>
      <Head title="Meu Cantinho Kids" />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Olá, {student.name.split(' ')[0]}!</h1>
          <p className="mt-4 text-xl text-muted-foreground">Bem-vindo ao seu novo painel!</p>
          <div className="mt-8 rounded-lg bg-yellow-100 p-8 text-yellow-800">
            <p className="text-2xl font-bold">EM BREVE: DASHBOARD KIDS 🎨</p>
          </div>
        </div>
      </div>
    </AlunoLayout>
  )
}

export default AlunoKidsDashboardPage
