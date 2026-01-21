import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { UserCheck, Filter, Calendar, Save, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Input } from '../../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'

interface PageProps {
  schoolId: string
  classes?: Array<{ id: string; name: string }>
  students?: Array<{ id: string; name: string; classId: string }>
  [key: string]: any
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'

export default function PresencaPage() {
  const { schoolId, classes = [], students = [] } = usePage<PageProps>().props
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [isSaving, setIsSaving] = useState(false)

  const filteredStudents = selectedClass
    ? students.filter((s) => s.classId === selectedClass)
    : []

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement save logic
    setTimeout(() => {
      setIsSaving(false)
      alert('Presenca salva com sucesso!')
    }, 1000)
  }

  const getStatusButton = (studentId: string, status: AttendanceStatus, icon: React.ReactNode, label: string, color: string) => {
    const isSelected = attendance[studentId] === status
    return (
      <Button
        variant={isSelected ? 'default' : 'outline'}
        size="sm"
        className={isSelected ? color : ''}
        onClick={() => handleStatusChange(studentId, status)}
      >
        {icon}
      </Button>
    )
  }

  const getStats = () => {
    const values = Object.values(attendance)
    return {
      present: values.filter((s) => s === 'PRESENT').length,
      absent: values.filter((s) => s === 'ABSENT').length,
      late: values.filter((s) => s === 'LATE').length,
      justified: values.filter((s) => s === 'JUSTIFIED').length,
      total: filteredStudents.length,
    }
  }

  const stats = getStats()

  return (
    <EscolaLayout>
      <Head title="Presenca" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UserCheck className="h-6 w-6" />
              Lancamento de Presenca
            </h1>
            <p className="text-muted-foreground">Registre a presenca dos alunos</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving || !selectedClass}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Presenca'}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedClass && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                <p className="text-xs text-muted-foreground">Presentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">Ausentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.justified}</p>
                <p className="text-xs text-muted-foreground">Justificados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance List */}
        {selectedClass ? (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Alunos</CardTitle>
              <CardDescription>
                {format(new Date(selectedDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhum aluno encontrado nesta turma
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-center">
                          {attendance[student.id] ? (
                            <Badge
                              variant={
                                attendance[student.id] === 'PRESENT'
                                  ? 'default'
                                  : attendance[student.id] === 'ABSENT'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {attendance[student.id] === 'PRESENT' && 'Presente'}
                              {attendance[student.id] === 'ABSENT' && 'Ausente'}
                              {attendance[student.id] === 'LATE' && 'Atrasado'}
                              {attendance[student.id] === 'JUSTIFIED' && 'Justificado'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Nao registrado</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            {getStatusButton(
                              student.id,
                              'PRESENT',
                              <CheckCircle className="h-4 w-4" />,
                              'Presente',
                              'bg-green-500 hover:bg-green-600'
                            )}
                            {getStatusButton(
                              student.id,
                              'ABSENT',
                              <XCircle className="h-4 w-4" />,
                              'Ausente',
                              'bg-red-500 hover:bg-red-600'
                            )}
                            {getStatusButton(
                              student.id,
                              'LATE',
                              <Clock className="h-4 w-4" />,
                              'Atrasado',
                              'bg-yellow-500 hover:bg-yellow-600'
                            )}
                            {getStatusButton(
                              student.id,
                              'JUSTIFIED',
                              <AlertTriangle className="h-4 w-4" />,
                              'Justificado',
                              'bg-blue-500 hover:bg-blue-600'
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Selecione uma turma</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha uma turma para lancar a presenca dos alunos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
