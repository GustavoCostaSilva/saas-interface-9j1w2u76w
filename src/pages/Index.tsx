import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MailCheck, Sheet, ArrowRight } from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Bem-vindo(a) às Ferramentas Essenciais!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sua solução completa para validação de e-mails e conversão de
          planilhas.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl w-full">
        <Card className="transform transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-md-hover">
          <CardHeader className="items-center text-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Validador de E-mail</CardTitle>
            <CardDescription>
              Verifique a validade de e-mails individualmente ou em lote com
              precisão.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/email-validator">
                Acessar Validador <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transform transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-md-hover">
          <CardHeader className="items-center text-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <Sheet className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Conversor de Planilhas</CardTitle>
            <CardDescription>
              Transforme suas planilhas Excel/CSV em formatos otimizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/spreadsheet-converter">
                Acessar Conversor <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
