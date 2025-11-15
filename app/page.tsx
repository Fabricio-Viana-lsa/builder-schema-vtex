'use client'
 
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { FileCode2, Eye, Copy, Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter();

  const goToCreate = () => {
    router.push("/create");
  }

  return (
    <section className="flex items-center m-auto justify-center flex-col gap-8 py-10 sm:py-20 px-4 sm:px-6">
      <div className="text-center max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          VTEX Schema Builder
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
          Crie schemas JSON para componentes customizados da VTEX de forma simples e visual
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button onClick={goToCreate} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Começar a Criar
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open('https://developers.vtex.com/docs/guides/vtex-io-documentation-site-editor-schema-examples', '_blank')}
          >
            <FileCode2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Ver Documentação</span>
            <span className="sm:hidden">Docs</span>
          </Button>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full">
        <div className="bg-card p-4 sm:p-6 rounded-lg border border-border shadow-sm">
          <FileCode2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3" />
          <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">Interface Visual</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Crie schemas sem escrever código. Interface intuitiva e fácil de usar.
          </p>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg border border-border shadow-sm">
          <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">Preview em Tempo Real</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Visualize o JSON gerado instantaneamente enquanto configura as propriedades.
          </p>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg border border-border shadow-sm">
          <Copy className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400 mb-3" />
          <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">Copiar e Usar</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Copie o JSON pronto e cole diretamente no seu componente VTEX IO.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 bg-accent border border-border rounded-lg p-4 sm:p-6 max-w-3xl w-full">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm sm:text-base">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          Suporte completo aos tipos VTEX
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm">
          String, Boolean, Object, Array, Enum, Widgets (image-uploader, datetime, etc.) e muito mais.
        </p>
      </div>
    </section>
  );
}
