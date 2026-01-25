import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, FileSignature, Users, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import { useContractSignatureStatsQueryOptions } from '../../hooks/queries/use_contract_signature_stats'

export function SignatureStatusTable({ contractId }: { contractId: string }) {
  const { data } = useSuspenseQuery(useContractSignatureStatsQueryOptions(contractId))

  if (!data) return null

  const signatureRate = data.total > 0 ? Math.round((data.signed / data.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Matrículas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.signed}</div>
            <p className="text-xs text-muted-foreground">{signatureRate}% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando assinatura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Configurado</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{data.notConfigured}</div>
            <p className="text-xs text-muted-foreground">Sem submissão DocuSeal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Lista de Alunos e Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.students.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum aluno matriculado neste contrato ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.studentEmail}
                    </TableCell>
                    <TableCell className="text-sm">{student.courseName}</TableCell>
                    <TableCell className="text-sm">{student.levelName}</TableCell>
                    <TableCell className="text-sm">{student.academicPeriod}</TableCell>
                    <TableCell>
                      {student.signatureStatus === 'SIGNED' ? (
                        <Badge className="gap-1 border-green-200 bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Assinado
                        </Badge>
                      ) : student.submissionId ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-yellow-200 bg-yellow-50 text-yellow-700"
                        >
                          <Clock className="h-3 w-3" />
                          Pendente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="mr-1 h-3 w-3" />
                          Não enviado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.signedAt
                        ? new Date(student.signedAt).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Dica:</strong> Os alunos recebem um email automático do DocuSeal com o link para
            assinar o contrato digitalmente. Quando assinarem, o status será atualizado
            automaticamente para "Assinado".
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
