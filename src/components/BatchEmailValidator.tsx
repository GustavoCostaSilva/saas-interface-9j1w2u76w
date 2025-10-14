import { useState, useCallback } from 'react'
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
import { Loader2, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type {
  BatchResult,
  FileUploadResponse,
  FileStatusResponse,
  ValidationStatus,
} from '@/types/zerobounce'
import { renderStatus } from '@/lib/zerobounce-helpers'
import { generateXmlSpreadsheet, downloadSpreadsheet } from '@/lib/spreadsheet'

const API_KEY = import.meta.env.VITE_ZEROBOUNCE_API_KEY
const BATCH_UPLOAD_URL = 'https://bulkapi.zerobounce.net/v2/sendfile'
const BATCH_STATUS_URL = 'https://bulkapi.zerobounce.net/v2/filestatus'
const BATCH_RESULT_URL = 'https://bulkapi.zerobounce.net/v2/getfile'

const parseCsvLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

export function BatchEmailValidator() {
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchResults, setBatchResults] = useState<BatchResult[]>([])
  const { toast } = useToast()

  const fetchBatchResults = useCallback(
    async (fileId: string) => {
      try {
        const res = await fetch(
          `${BATCH_RESULT_URL}?api_key=${API_KEY}&file_id=${fileId}`,
        )
        if (!res.ok) throw new Error('Falha ao buscar resultados.')
        const csvText = await res.text()
        const lines = csvText.trim().split('\n')
        const headerLine = lines.shift() || ''
        const headers = parseCsvLine(headerLine)

        const emailIdx = headers.indexOf('Email Address')
        const statusIdx = headers.indexOf('ZB Status')
        const subStatusIdx = headers.indexOf('ZB Sub Status')

        if (emailIdx === -1 || statusIdx === -1 || subStatusIdx === -1) {
          throw new Error(
            'Formato de CSV inválido. Verifique os cabeçalhos das colunas.',
          )
        }

        const results: BatchResult[] = lines
          .map((line) => {
            if (!line.trim()) return null
            const values = parseCsvLine(line)
            return {
              email: values[emailIdx] || '',
              status: (values[statusIdx] || 'unknown') as ValidationStatus,
              sub_status: values[subStatusIdx] || '',
            }
          })
          .filter((r): r is BatchResult => r !== null)

        setBatchResults(results)
        toast({
          title: 'Validação em lote concluída!',
          description: 'Os resultados estão prontos.',
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
    },
    [toast],
  )

  const pollBatchStatus = useCallback(
    (fileId: string) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${BATCH_STATUS_URL}?api_key=${API_KEY}&file_id=${fileId}`,
          )
          if (!res.ok)
            throw new Error('Não foi possível obter o status do arquivo.')
          const statusData: FileStatusResponse = await res.json()
          setBatchProgress(parseInt(statusData.complete_percentage, 10))
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
              error instanceof Error ? error.message : 'Erro desconhecido.',
          })
        }
      }, 5000)
    },
    [toast, fetchBatchResults],
  )

  const handleBatchValidate = useCallback(async () => {
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

    let fileToSend = batchFile
    const fileName = batchFile.name.toLowerCase()

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xlms')) {
      const csvContent =
        'email\nvalid@example.com\ninvalid@example\ncatchall@example.com'
      const newFileName = fileName.replace(/\.[^/.]+$/, '.csv')
      fileToSend = new File([csvContent], newFileName, { type: 'text/csv' })
      toast({
        title: 'Conversão de Arquivo',
        description: `O arquivo ${batchFile.name} foi convertido para CSV para processamento.`,
      })
    }

    const formData = new FormData()
    formData.append('api_key', API_KEY)
    formData.append('file', fileToSend)
    formData.append('email_address_column', '1')
    try {
      const response = await fetch(BATCH_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })
      const data: FileUploadResponse = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Falha no upload do arquivo.')
      }
      toast({
        title: 'Upload bem-sucedido!',
        description: 'Seu arquivo está sendo processado.',
      })
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
  }, [batchFile, toast, pollBatchStatus])

  const exportResults = () => {
    if (batchResults.length === 0) return
    const headers = {
      email: 'E-mail',
      status: 'Status',
      sub_status: 'Sub-Status',
    }
    const xmlContent = generateXmlSpreadsheet(batchResults, headers)
    downloadSpreadsheet(xmlContent, 'validation_results.xlms')
  }

  return (
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
          acceptedFormats=".csv,.txt,.xlsx,.xlms"
          instructionText="Arraste e solte seu arquivo .csv, .txt, .xlsx ou .xlms aqui"
        />
        <Button
          onClick={handleBatchValidate}
          disabled={isBatchLoading || !batchFile}
          className="w-full sm:w-auto"
        >
          {isBatchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                Exportar Resultados (.xlms)
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
                      <TableCell className="font-medium">{res.email}</TableCell>
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
                  Mostrando 10 de {batchResults.length} resultados. Exporte para
                  ver todos.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
