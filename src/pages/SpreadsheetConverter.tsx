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

type ConversionStatus = 'idle' | 'loading' | 'success' | 'error'

export default function SpreadsheetConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { toast } = useToast()

  const handleConvert = async () => {
    if (!file) return
    setStatus('loading')
    setErrorMessage('')

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success or error
    if (Math.random() > 0.2) {
      // 80% success rate
      setStatus('success')
      toast({
        title: 'Conversão bem-sucedida!',
        description: 'Sua planilha foi convertida e está pronta para download.',
      })
    } else {
      const error = 'Ocorreu um erro inesperado durante a conversão.'
      setStatus('error')
      setErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Erro na conversão',
        description: error,
      })
    }
  }

  const handleDownload = () => {
    // Mock file download
    const blob = new Blob(
      ['Este é um arquivo de planilha convertido de teste.'],
      {
        type: 'text/csv;charset=utf-8;',
      },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planilha_convertida.csv'
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
            Convertendo sua planilha...
          </p>
        )
      case 'success':
        return (
          <Alert variant="default" className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">
              Conversão concluída com sucesso!
            </AlertTitle>
            <AlertDescription>
              Sua planilha está pronta para ser baixada.
            </AlertDescription>
          </Alert>
        )
      case 'error':
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erro na conversão</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Conversor de Planilhas</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Converter Planilha</CardTitle>
          <CardDescription>
            Transforme suas planilhas CSV em formatos otimizados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploader
            onFileSelect={(selectedFile) => {
              setFile(selectedFile)
              setStatus('idle')
            }}
            acceptedFormats=".csv"
            instructionText="Arraste e solte seu arquivo CSV aqui"
          />
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleConvert}
              disabled={!file || status === 'loading'}
              className="w-full sm:w-auto"
            >
              {status === 'loading' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Converter Planilha
            </Button>
            {status !== 'idle' && (
              <div className="w-full">{renderStatusIndicator()}</div>
            )}
            {status === 'success' && (
              <Button
                onClick={handleDownload}
                className="w-full sm:w-auto animate-fade-in-up"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Planilha Convertida
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
