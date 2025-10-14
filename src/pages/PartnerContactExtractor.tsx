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

type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error'

export default function PartnerContactExtractorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { toast } = useToast()

  const handleProcess = async () => {
    if (!file) return
    setStatus('loading')
    setErrorMessage('')

    await new Promise((resolve) => setTimeout(resolve, 2500))

    if (Math.random() > 0.15) {
      setStatus('success')
      toast({
        title: 'Processamento concluído!',
        description:
          'Seus arquivos foram gerados e estão prontos para download.',
      })
    } else {
      const error =
        'Erro ao processar a planilha. Verifique se as colunas necessárias existem.'
      setStatus('error')
      setErrorMessage(error)
      toast({
        variant: 'destructive',
        title: 'Erro no Processamento',
        description: error,
      })
    }
  }

  const createAndDownloadFile = (
    filename: string,
    content: string,
    type: string,
  ) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadEmails = () => {
    const content =
      'Email Sócio\nsocio1@example.com\nsocio2@example.com\nsocio3@example.com'
    createAndDownloadFile(
      'emails_socios.csv',
      content,
      'text/csv;charset=utf-8;',
    )
  }

  const handleDownloadContacts = () => {
    const content =
      'name,phone_number,bussines,prompt\n"Socio Um","+5511999998888","Empresa Lead","Angela-Dibai Sales. OBJETIVO: Confirmar se número é de Socio Um (Empresa Lead). ABERTURA: Olá! Angela da Dibai Sales. Este número é de Socio Um da Empresa Lead? CENÁRIOS: A)Sim=Silêncio+Log CONFIRMADO. B)Não=Desculpe+Log ERRADO. C)Conheço=Pedir número de Socio Um+Log NOVO. D)Quem é?=Yasmin sobre marketing Empresa Lead."'
    createAndDownloadFile(
      'contatos_socios_formatado.xlsx',
      content,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  const renderStatusIndicator = () => {
    switch (status) {
      case 'success':
        return (
          <Alert variant="default" className="bg-success/10 border-success/20">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">
              Processamento concluído!
            </AlertTitle>
            <AlertDescription>
              Seus arquivos estão prontos para download.
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
      <h1 className="text-3xl font-bold mb-6">
        Processador de Contatos de Sócios
      </h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Extrair Contatos e E-mails</CardTitle>
          <CardDescription>
            Faça o upload de sua planilha para gerar arquivos de contatos e
            e-mails de sócios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploader
            onFileSelect={(selectedFile) => {
              setFile(selectedFile)
              setStatus('idle')
            }}
            acceptedFormats=".xlsx,.csv"
            instructionText="Arraste e solte sua planilha aqui"
          />
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleProcess}
              disabled={!file || status === 'loading'}
              className="w-full sm:w-auto"
            >
              {status === 'loading' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Processar Arquivo
            </Button>
            {status === 'loading' && (
              <p className="text-center text-muted-foreground">
                Processando sua planilha...
              </p>
            )}
            {status !== 'idle' && status !== 'loading' && (
              <div className="w-full">{renderStatusIndicator()}</div>
            )}
            {status === 'success' && (
              <div className="w-full grid sm:grid-cols-2 gap-4 animate-fade-in-up">
                <Button onClick={handleDownloadEmails} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar E-mails de Sócios (.csv)
                </Button>
                <Button onClick={handleDownloadContacts} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Contatos Formatados
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
