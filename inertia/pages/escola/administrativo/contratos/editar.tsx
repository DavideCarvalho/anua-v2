import { Head, usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { ArrowLeft } from 'lucide-react'

import { EscolaLayout } from '../../../../components/layouts'
import { Button } from '../../../../components/ui/button'
import { ContractForm } from '../../../../containers/contracts/contract-form'
import type { SharedProps } from '../../../../lib/types'

interface Contract {
  id: string
  name: string
  description?: string | null
  academicPeriodId?: string | null
  endDate?: string | null
  hasInsurance: boolean
  isActive: boolean
  enrollmentValue?: number | null
  enrollmentValueInstallments: number
  ammount: number
  paymentType: 'MONTHLY' | 'UPFRONT'
  installments: number
  flexibleInstallments: boolean
  paymentDays?: { day: number }[]
  interestConfig?: {
    delayInterestPercentage?: number | null
    delayInterestPerDayDelayed?: number | null
  } | null
  earlyDiscounts?: { daysBeforeDeadline: number; percentage: number }[]
}

interface PageProps extends SharedProps {
  contract: Contract
  academicPeriods: { id: string; name: string }[]
}

export default function EditarContratoPage() {
  const { props } = usePage<PageProps>()
  const schoolId = props.user?.schoolId
  const contract = props.contract

  return (
    <EscolaLayout>
      <Head title={`Editar ${contract?.name || 'Contrato'}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.administrativo.contratos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Contrato</h1>
            <p className="text-muted-foreground">{contract?.name}</p>
          </div>
        </div>

        {schoolId && contract ? (
          <ContractForm
            schoolId={schoolId}
            academicPeriods={props.academicPeriods || []}
            initialData={contract}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Contrato não encontrado.
          </div>
        )}
      </div>
    </EscolaLayout>
  )
}
