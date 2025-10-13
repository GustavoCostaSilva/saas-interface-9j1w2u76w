import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type HistoryItem = {
  id: string
  date: string
  fileName: string
  status: 'Concluído' | 'Falhou'
  contactsExtracted: number
  emailsExtracted: number
}

const extractorHistory: HistoryItem[] = [
  {
    id: '1',
    date: '2024-10-08 10:05',
    fileName: 'socios_empresa_a.xlsx',
    status: 'Concluído',
    contactsExtracted: 15,
    emailsExtracted: 12,
  },
  {
    id: '2',
    date: '2024-10-07 16:20',
    fileName: 'parceiros_atuais.csv',
    status: 'Concluído',
    contactsExtracted: 88,
    emailsExtracted: 80,
  },
  {
    id: '3',
    date: '2024-10-06 11:00',
    fileName: 'lista_incompleta.xlsx',
    status: 'Falhou',
    contactsExtracted: 0,
    emailsExtracted: 0,
  },
  {
    id: '4',
    date: '2024-10-05 15:45',
    fileName: 'contatos_gerais.xlsx',
    status: 'Concluído',
    contactsExtracted: 210,
    emailsExtracted: 195,
  },
]

export function PartnerContactExtractorHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Extrator de Contatos</CardTitle>
        <CardDescription>
          Processamentos recentes de planilhas de sócios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractorHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.date}
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-xs">
                    {item.fileName}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        item.status === 'Concluído' ? 'default' : 'destructive'
                      }
                      className={
                        item.status === 'Concluído'
                          ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                          : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.status === 'Concluído' ? (
                      <>
                        <span>{item.contactsExtracted} contatos</span>,{' '}
                        <span>{item.emailsExtracted} e-mails</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
