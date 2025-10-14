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
import { parseCsv, parseXml } from '@/lib/parser'

type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error'
type ProcessedData = {
  emailsCsv: string
  contactsCsv: string
  totalContacts: number
  totalEmails: number
}

export default function PartnerContactExtractorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const { toast } = useToast()

  const formatPhoneNumber = (phone: string): string => {
    let digits = phone.replace(/\D/g, '')
    if (digits.length >= 10 && digits.length <= 11) {
      if (!digits.startsWith('55')) {
        digits = '55' + digits
      }
    }
    if (digits && !digits.startsWith('+')) {
      digits = '+' + digits
    }
    return digits
  }

  const toCsvRow = (row: string[]): string => {
    return row
      .map((value) => {
        if (
          value.includes(',') ||
          value.includes('"') ||
          value.includes('\n')
        ) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  }

  const handleProcess = async () => {
    if (!file) return
    setStatus('loading')
    setErrorMessage('')
    setProcessedData(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        let records: Record<string, string>[]

        if (file.name.toLowerCase().endsWith('.xml')) {
          records = parseXml(text)
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          records = parseCsv(text)
        } else {
          throw new Error('Formato de arquivo não suportado. Use .csv ou .xml.')
        }

        const emails: string[] = []
        const contacts: string[][] = []

        for (const record of records) {
          const partnerName = record['Nome Sócio']?.trim()
          const companyName = record['Razão Social']?.trim()
          const partnerEmail = record['Email Sócio']?.trim()
          const partnerPhone = record['Telefone Sócio']?.trim()

          if (partnerEmail) {
            emails.push(partnerEmail)
          }

          if (partnerName && partnerPhone && companyName) {
            const prompt = `Angela-Dibai Sales. OBJETIVO: Confirmar se número é de ${partnerName} (${companyName}). ABERTURA: Olá! Angela da Dibai Sales. Este número é de ${partnerName} da ${companyName}? CENÁRIOS: A)Sim=Silêncio+Log CONFIRMADO. B)Não=Desculpe+Log ERRADO. C)Conheço=Pedir número de ${partnerName}+Log NOVO. D)Quem é?=Yasmin sobre marketing ${companyName}.`
            contacts.push([
              partnerName,
              formatPhoneNumber(partnerPhone),
              companyName,
              prompt,
            ])
          }
        }

        const emailsCsv = ['Email Sócio', ...emails].join('\n')
        const contactsCsv = [
          toCsvRow(['name', 'phone_number', 'bussines', 'prompt']),
          ...contacts.map(toCsvRow),
        ].join('\n')

        setProcessedData({
          emailsCsv,
          contactsCsv,
          totalContacts: contacts.length,
          totalEmails: emails.length,
        })
        setStatus('success')
        toast({
          title: 'Processamento concluído!',
          description: `Foram extraídos ${emails.length} e-mails e ${contacts.length} contatos.`,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro desconhecido.'
        setErrorMessage(message)
        setStatus('error')
        toast({
          variant: 'destructive',
          title: 'Erro no Processamento',
          description: message,
        })
      }
    }

    reader.onerror = () => {
      const message = 'Não foi possível ler o arquivo.'
      setErrorMessage(message)
      setStatus('error')
      toast({
        variant: 'destructive',
        title: 'Erro de Leitura',
        description: message,
      })
    }

    reader.readAsText(file, 'UTF-8')
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
    if (!processedData) return
    createAndDownloadFile(
      'emails_socios.csv',
      processedData.emailsCsv,
      'text/csv;charset=utf-8;',
    )
  }

  const handleDownloadContacts = () => {
    if (!processedData) return
    createAndDownloadFile(
      'contatos_socios_formatado.csv',
      processedData.contactsCsv,
      'text/csv;charset=utf-8;',
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
              {`Foram extraídos ${processedData?.totalEmails || 0} e-mails e ${
                processedData?.totalContacts || 0
              } contatos. Seus arquivos estão prontos para download.`}
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
            Faça o upload de sua planilha (.csv ou .xml) para gerar arquivos de
            contatos e e-mails de sócios. O arquivo deve conter as colunas
            necessárias.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploader
            onFileSelect={(selectedFile) => {
              setFile(selectedFile)
              setStatus('idle')
              setProcessedData(null)
            }}
            acceptedFormats=".csv,.xml"
            instructionText="Arraste e solte sua planilha .csv ou .xml aqui"
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
                <Button
                  onClick={handleDownloadEmails}
                  className="w-full"
                  disabled={!processedData || processedData.totalEmails === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar E-mails ({processedData?.totalEmails || 0})
                </Button>
                <Button
                  onClick={handleDownloadContacts}
                  className="w-full"
                  disabled={!processedData || processedData.totalContacts === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Contatos ({processedData?.totalContacts || 0})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
