import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/FileUploader'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  Download,
  ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

type ValidationStatus = 'valid' | 'invalid' | 'catch-all' | 'unknown'
type SingleResult = {
  status: ValidationStatus
  message: string
  address: string
  sub_status: string
} | null
type BatchResult = {
  email: string
  status: ValidationStatus
  sub_status: string
  message: string
}

const statusConfig: Record<
  ValidationStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  valid: { icon: CheckCircle, color: 'text-success', label: 'Válido' },
  invalid: { icon: XCircle, color: 'text-destructive', label: 'Inválido' },
  'catch-all': { icon: AlertCircle, color: 'text-primary', label: 'Catch-all' },
  unknown: {
    icon: HelpCircle,
    color: 'text-muted-foreground',
    label: 'Desconhecido',
  },
}

const mockSingleValidation = async (email: string): Promise<SingleResult> => {
  await new Promise((res) => setTimeout(res, 1000))
  if (!email || !/\S+@\S+\.\S+/.test(email))
    return {
      status: 'invalid',
      sub_status: 'invalid_format',
      address: email,
      message: 'Formato de e-mail inválido.',
    }
  const statuses: ValidationStatus[] = [
    'valid',
    'invalid',
    'catch-all',
    'unknown',
  ]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  return {
    status: randomStatus,
    sub_status: 'mock_sub_status',
    address: email,
    message: `Este é um resultado de teste para ${email}.`,
  }
}

const mockBatchResults: BatchResult[] = Array.from({ length: 25 }, (_, i) => {
  const statuses: ValidationStatus[] = [
    'valid',
    'invalid',
    'catch-all',
    'unknown',
  ]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  return {
    email: `usuario${i + 1}@example.com`,
    status: randomStatus,
    sub_status: `sub_status_${i}`,
    message: `Resultado para o e-mail ${i + 1}`,
  }
})

export default function EmailValidatorPage() {
  const [singleEmail, setSingleEmail] = useState('')
  const [isSingleLoading, setIsSingleLoading] = useState(false)
  const [singleResult, setSingleResult] = useState<SingleResult>(null)
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const { toast } = useToast()

  const handleSingleValidate = async () => {
    if (!singleEmail) return
    setIsSingleLoading(true)
    setSingleResult(null)
    const result = await mockSingleValidation(singleEmail)
    setSingleResult(result)
    setIsSingleLoading(false)
  }

  const handleBatchValidate = async () => {
    if (!batchFile) return
    setIsBatchLoading(true)
    setBatchProgress(0)
    setBatchResults([])
    // Simulate processing
    const interval = setInterval(() => {
      setBatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBatchLoading(false)
          setBatchResults(mockBatchResults)
          toast({
            title: 'Validação em lote concluída!',
            description: 'Os resultados estão prontos para visualização.',
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const renderStatus = (status: ValidationStatus) => {
    const { icon: Icon, color, label } = statusConfig[status]
    return (
      <div className={cn('flex items-center gap-2', color)}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Validador de E-mail</h1>
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="single">Validação Única</TabsTrigger>
          <TabsTrigger value="batch">Validação em Lote</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Validação de E-mail Único</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="E-mail para validar"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                />
                <Button
                  onClick={handleSingleValidate}
                  disabled={isSingleLoading || !singleEmail}
                >
                  {isSingleLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Validar E-mail
                </Button>
              </div>
              {singleResult && (
                <div className="p-4 border rounded-lg animate-fade-in-up">
                  <h3 className="font-semibold mb-2">
                    Resultado da Validação:
                  </h3>
                  <div className="flex items-center gap-3">
                    {renderStatus(singleResult.status)}
                    <Badge variant="secondary">{singleResult.sub_status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {singleResult.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="batch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Validação de E-mails em Lote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploader
                onFileSelect={setBatchFile}
                acceptedFormats=".csv,.txt"
                instructionText="Arraste e solte seu arquivo .csv ou .txt aqui"
              />
              <Button
                onClick={handleBatchValidate}
                disabled={isBatchLoading || !batchFile}
                className="w-full sm:w-auto"
              >
                {isBatchLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Iniciar Validação em Lote
              </Button>
              {isBatchLoading && (
                <div className="space-y-2">
                  <Progress value={batchProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Processando {batchProgress}%...
                  </p>
                </div>
              )}
              {batchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Resultados</h3>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Resultados
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sub Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchResults.map((res, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {res.email}
                            </TableCell>
                            <TableCell>{renderStatus(res.status)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{res.sub_status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
