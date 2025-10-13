import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { SingleValidationResult } from '@/types/zerobounce'
import { renderStatus } from '@/lib/zerobounce-helpers'

const API_KEY = import.meta.env.VITE_ZEROBOUNCE_API_KEY
const SINGLE_VALIDATION_URL = 'https://api.zerobounce.net/v2/validate'

export function SingleEmailValidator() {
  const [singleEmail, setSingleEmail] = useState('')
  const [isSingleLoading, setIsSingleLoading] = useState(false)
  const [singleResult, setSingleResult] =
    useState<SingleValidationResult | null>(null)
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
        `${SINGLE_VALIDATION_URL}?api_key=${API_KEY}&email=${encodeURIComponent(
          singleEmail,
        )}`,
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

  return (
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
            <h3 className="font-semibold mb-2">Resultado da Validação:</h3>
            <div className="flex items-center gap-3">
              {renderStatus(singleResult.status)}
              <Badge variant="secondary">{singleResult.sub_status}</Badge>
            </div>
            {singleResult.did_you_mean && (
              <p className="text-sm text-muted-foreground mt-2">
                Você quis dizer: <strong>{singleResult.did_you_mean}</strong>?
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
