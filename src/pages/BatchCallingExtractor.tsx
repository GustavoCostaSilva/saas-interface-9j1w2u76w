import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUploader } from '@/components/FileUploader'
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { processExcelFile } from '@/lib/batch-calling-helpers'
import { useXlsx } from '@/hooks/use-xlsx'

type ConversionStatus = 'idle' | 'loading' | 'success' | 'error'

export default function BatchCallingExtractorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [processedFiles, setProcessedFiles] = useState<Blob[]>([])
  const { toast } = useToast()
  const { xlsx, isLoading: isXlsxLoading, error: xlsxError } = useXlsx()

  const handleProcess = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Nenhum arquivo selecionado.',
        description: 'Por favor, selecione um arquivo .xlsx para processar.',
      })
      return
    }
    if (!xlsx) {
      toast({
        variant: 'destructive',
        title: 'Biblioteca de planilhas não carregada',
        description:
          'Aguarde um momento e tente novamente. Se o erro persistir, recarregue a página.',
      })
      return
    }
    setStatus('loading')
    setErrorMessage('')
    setProcessedFiles([])

    try {
      const blobs = await processExcelFile(file, xlsx)
      setProcessedFiles(blobs)
      setStatus('success')
      toast({
        title: 'Processamento concluído!',
        description: 'Seus arquivos de campanha estão prontos para download.',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
      setStatus('error')
      setErrorMessage(message)
      toast({
        variant: 'destructive',
        title: 'Erro no Processamento',
        description: message,
      })
    }
  }

  const handleDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderStatusIndicator = () => {
    switch (status) {
      case 'loading':
        return (
          <p className="text-center text-muted-foreground">
            Processando sua planilha...
          </p>
        )
      case 'success':
        return (
          <Alert variant="default" className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">
              Processamento concluído com sucesso!
            </AlertTitle>
            <AlertDescription>
              Seus 3 arquivos de campanha estão prontos para download.
            </AlertDescription>
          </Alert>
        )
      case 'error':
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erro no Processamento</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Batch Calling Extractor</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Extrair Dados para Batch Calling</CardTitle>
          <CardDescription>
            Faça upload de uma planilha .xlsx para gerar arquivos de campanha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isXlsxLoading && (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p className="text-muted-foreground">
                Carregando biblioteca de planilhas...
              </p>
            </div>
          )}
          {xlsxError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar dependência</AlertTitle>
              <AlertDescription>
                {xlsxError.message} Por favor, recarregue a página.
              </AlertDescription>
            </Alert>
          )}
          {!isXlsxLoading && !xlsxError && (
            <>
              <FileUploader
                onFileSelect={(selectedFile) => {
                  setFile(selectedFile)
                  setStatus('idle')
                  setProcessedFiles([])
                }}
                acceptedFormats=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                instructionText="Arraste e solte seu arquivo .xlsx aqui"
              />
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleProcess}
                  disabled={!file || status === 'loading' || !xlsx}
                  className="w-full sm:w-auto"
                >
                  {status === 'loading' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Processar Arquivo
                </Button>
                {status !== 'idle' && (
                  <div className="w-full">{renderStatusIndicator()}</div>
                )}
                {status === 'success' && processedFiles.length > 0 && (
                  <div className="w-full space-y-2 animate-fade-in-up">
                    {processedFiles.map((blob, index) => (
                      <Button
                        key={index}
                        onClick={() =>
                          handleDownload(blob, `output_${index + 1}.xlsx`)
                        }
                        className="w-full"
                        variant="secondary"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar output_{index + 1}.xlsx
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
