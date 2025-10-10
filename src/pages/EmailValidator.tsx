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
  ShieldAlert,
  Ban,
  MailWarning,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type {
  ValidationStatus,
  SingleValidationResult,
  BatchResult,
  FileUploadResponse,
  FileStatusResponse,
} from '@/types/zerobounce'

const API_KEY = import.meta.env.VITE_ZEROBOUNCE_API_KEY
const SINGLE_VALIDATION_URL = 'https://api.zerobounce.net/v2/validate'
const BATCH_UPLOAD_URL = 'https://bulkapi.zerobounce.net/v2/sendfile'
const BATCH_STATUS_URL = 'https://bulkapi.zerobounce.net/v2/filestatus'
const BATCH_RESULT_URL = 'https://bulkapi.zerobounce.net/v2/getfile'

const statusConfig: Record<
  ValidationStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  valid: { icon: CheckCircle, color: 'text-success', label: 'Válido' },
  invalid: { icon: XCircle, color: 'text-destructive', label: 'Inválido' },
  'catch-all': {
    icon: AlertCircle,
    color: 'text-yellow-500',
    label: 'Catch-all',
  },
  unknown: {
    icon: HelpCircle,
    color: 'text-muted-foreground',
    label: 'Desconhecido',
  },
  spamtrap: { icon: ShieldAlert, color: 'text-orange-500', label: 'Spamtrap' },
  abuse: { icon: Ban, color: 'text-red-600', label: 'Abuso' },
  do_not_mail: {
    icon: MailWarning,
    color: 'text-gray-500',
    label: 'Não Enviar',
  },
}

export default function EmailValidatorPage() {
  const [singleEmail, setSingleEmail] = useState('')
  const [isSingleLoading, setIsSingleLoading] = useState(false)
  const [singleResult, setSingleResult] =
    useState<SingleValidationResult | null>(null)

  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const [batchFileId, setBatchFileId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSingleValidate = async () => {
    if (!singleEmail || !API_KEY) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: !API_KEY
          ? 'A chave da API não está configurada.'
          : 'Por favor, insira um e-mail.',
      })
      return
    }
    setIsSingleLoading(true)
    setSingleResult(null)
    try {
      const response = await fetch(
        `${SINGLE_VALIDATION_URL}?api_key=${API_KEY}&email=${encodeURIComponent(singleEmail)}`,
      )
      if (!response.ok) throw new Error('Falha na validação do e-mail.')
      const result: SingleValidationResult = await response.json()
      setSingleResult(result)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na Validação',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado.',
      })
    } finally {
      setIsSingleLoading(false)
    }
  }

  const pollBatchStatus = (fileId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch(
          `${BATCH_STATUS_URL}?api_key=${API_KEY}&file_id=${fileId}`,
        )
        if (!statusResponse.ok) throw new Error()
        const statusData: FileStatusResponse = await statusResponse.json()

        const progress = parseInt(statusData.complete_percentage, 10)
        setBatchProgress(progress)

        if (statusData.file_status === 'Complete') {
          clearInterval(interval)
          await fetchBatchResults(fileId)
        } else if (statusData.error_reason) {
          throw new Error(statusData.error_reason)
        }
      } catch (error) {
        clearInterval(interval)
        setIsBatchLoading(false)
        toast({
          variant: 'destructive',
          title: 'Erro no Processamento',
          description:
            error instanceof Error
              ? error.message
              : 'Não foi possível obter o status do arquivo.',
        })
      }
    }, 5000)
  }

  const fetchBatchResults = async (fileId: string) => {
    try {
      const resultsResponse = await fetch(
        `${BATCH_RESULT_URL}?api_key=${API_KEY}&file_id=${fileId}`,
      )
      if (!resultsResponse.ok) throw new Error('Falha ao buscar resultados.')
      const csvText = await resultsResponse.text()
      const lines = csvText.trim().split('\n')
      const headers = lines[0].split(',').map((h) => h.replace(/"/g, ''))
      const emailIndex = headers.indexOf('Email Address')
      const statusIndex = headers.indexOf('ZB Status')
      const subStatusIndex = headers.indexOf('ZB Sub Status')

      const results: BatchResult[] = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.replace(/"/g, ''))
        return {
          email: values[emailIndex],
          status: values[statusIndex] as ValidationStatus,
          sub_status: values[subStatusIndex],
        }
      })

      setBatchResults(results)
      toast({
        title: 'Validação em lote concluída!',
        description: 'Os resultados estão prontos para visualização.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Baixar Resultados',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado.',
      })
    } finally {
      setIsBatchLoading(false)
    }
  }

  const handleBatchValidate = async () => {
    if (!batchFile || !API_KEY) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: !API_KEY
          ? 'A chave da API não está configurada.'
          : 'Por favor, selecione um arquivo.',
      })
      return
    }
    setIsBatchLoading(true)
    setBatchProgress(0)
    setBatchResults([])
    setBatchFileId(null)

    const formData = new FormData()
    formData.append('api_key', API_KEY)
    formData.append('file', batchFile)
    formData.append('email_address_column', '1')

    try {
      const response = await fetch(BATCH_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Falha no upload do arquivo.')
      const data: FileUploadResponse = await response.json()
      if (!data.success) throw new Error(data.message)

      setBatchFileId(data.file_id)
      pollBatchStatus(data.file_id)
    } catch (error) {
      setIsBatchLoading(false)
      toast({
        variant: 'destructive',
        title: 'Erro no Upload',
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado.',
      })
    }
  }

  const exportResults = () => {
    if (batchResults.length === 0) return
    const headers = ['email', 'status', 'sub_status']
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...batchResults.map((row) =>
          headers.map((header) => row[header as keyof BatchResult]).join(','),
        ),
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'validation_results.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderStatus = (status: ValidationStatus) => {
    const config = statusConfig[status] || statusConfig.unknown
    return (
      <div className={cn('flex items-center gap-2', config.color)}>
        <config.icon className="h-4 w-4" />
        <span>{config.label}</span>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSingleValidate()}
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
                  {singleResult.did_you_mean && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Você quis dizer:{' '}
                      <strong>{singleResult.did_you_mean}</strong>?
                    </p>
                  )}
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
                onFileSelect={(file) => {
                  setBatchFile(file)
                  setBatchResults([])
                  setBatchProgress(0)
                }}
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
                    <Button variant="outline" size="sm" onClick={exportResults}>
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
                        {batchResults.slice(0, 10).map((res, i) => (
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
                    {batchResults.length > 10 && (
                      <p className="p-4 text-sm text-muted-foreground">
                        Mostrando 10 de {batchResults.length} resultados.
                        Exporte para ver todos.
                      </p>
                    )}
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
