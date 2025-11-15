import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full py-4 sm:py-6 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} VTEX Schema Builder. Feito para a comunidade VTEX.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link 
              href="https://developers.vtex.com/docs/guides/vtex-io-documentation-site-editor-schema-examples" 
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="hidden sm:inline">Documentação VTEX</span>
              <span className="sm:hidden">Docs</span>
            </Link>
            <Link 
              href="https://github.com/Fabricio-P-Viana" 
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
