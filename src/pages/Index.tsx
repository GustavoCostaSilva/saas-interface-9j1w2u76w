import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, FileUp, ArrowRight } from 'lucide-react'
import { EmailValidatorHistory } from '@/components/EmailValidatorHistory'

export default function Index() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <div className="max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Dibai Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sua central de ferramentas para otimizar processos e extrair dados
          valiosos.
        </p>
      </div>

      <div className="grid gap-8 max-w-2xl">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Validador de E-mail</CardTitle>
                <CardDescription>
                  Verifique e-mails individualmente ou em lote.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 mt-auto">
            <Button asChild className="w-full">
              <Link to="/email-validator">
                Validação Única <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/email-validator">
                Validação em Lote <FileUp className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 max-w-7xl">
        <EmailValidatorHistory />
      </div>
    </div>
  )
}
