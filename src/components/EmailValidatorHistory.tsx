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
import { FileText, User } from 'lucide-react'

type HistoryItem = {
  id: string
  date: string
  type: 'Único' | 'Em Lote'
  input: string
  status: 'Concluído' | 'Falhou'
  valid: number
  invalid: number
  total: number
}

const validationHistory: HistoryItem[] = [
  {
    id: '1',
    date: '2024-10-08 14:30',
    type: 'Em Lote',
    input: 'lista_clientes.csv',
    status: 'Concluído',
    valid: 450,
    invalid: 50,
    total: 500,
  },
  {
    id: '2',
    date: '2024-10-08 11:15',
    type: 'Único',
    input: 'contato@empresa.com',
    status: 'Concluído',
    valid: 1,
    invalid: 0,
    total: 1,
  },
  {
    id: '3',
    date: '2024-10-07 18:00',
    type: 'Em Lote',
    input: 'prospects_q3.csv',
    status: 'Concluído',
    valid: 1890,
    invalid: 110,
    total: 2000,
  },
  {
    id: '4',
    date: '2024-10-07 09:45',
    type: 'Único',
    input: 'email_invalido@.com',
    status: 'Concluído',
    valid: 0,
    invalid: 1,
    total: 1,
  },
]

export function EmailValidatorHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Validador de E-mail</CardTitle>
        <CardDescription>
          Atividades recentes de validações únicas e em lote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.type === 'Único' ? 'secondary' : 'outline'}
                      className="flex items-center gap-1 w-fit"
                    >
                      {item.type === 'Único' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-xs">
                    {item.input}
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
                    <span className="text-success font-semibold">
                      {item.valid}
                    </span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-destructive">{item.invalid}</span>
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
