import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SingleEmailValidator } from '@/components/SingleEmailValidator'
import { BatchEmailValidator } from '@/components/BatchEmailValidator'

export default function EmailValidatorPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Validador de E-mail</h1>
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="single">Validação Única</TabsTrigger>
          <TabsTrigger value="batch">Validação em Lote</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-6">
          <SingleEmailValidator />
        </TabsContent>
        <TabsContent value="batch" className="mt-6">
          <BatchEmailValidator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
