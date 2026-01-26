import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Paperclip, AlertCircle } from 'lucide-react'

interface ContractDocument {
  id: string
  name: string
  description: string | null
  required: boolean
}

interface RequiredDocumentsListProps {
  documents: ContractDocument[]
}

export function RequiredDocumentsList({ documents }: RequiredDocumentsListProps) {
  if (documents.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Documentos Exigidos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-2 text-sm py-1 border-b last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium">
                {doc.name}
                {doc.required && <span className="text-destructive ml-1">*</span>}
              </p>
              {doc.description && (
                <p className="text-xs text-muted-foreground">{doc.description}</p>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <AlertCircle className="h-3 w-3" />
          <span>
            Documentos pendentes ficarão disponíveis para o responsável completar depois.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
