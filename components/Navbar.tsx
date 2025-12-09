'use client';

import Link from "next/link"
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="bg-card border-b border-border px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-row w-full justify-between items-center">
          <Link href="/" className="font-bold text-lg sm:text-xl text-foreground hover:text-primary transition-colors">
            <span className="hidden sm:inline">VTEX Schema Builder</span>
            <span className="sm:hidden">VTEX Builder</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-2 w-9 h-9" />
            <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">
              Crie schemas para componentes VTEX
            </p>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card border-b border-border px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
      <div className="flex flex-row w-full justify-between items-center">
        <Link href="/" className="font-bold text-lg sm:text-xl text-foreground hover:text-primary transition-colors">
          <span className="hidden sm:inline">VTEX Schema Builder</span>
          <span className="sm:hidden">VTEX Builder</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            )}
          </button>
          
          <p className="text-xs sm:text-sm text-muted-foreground hidden lg:block">
            Criado por{' '}
            <Link 
              href={'https://fabricio.vercel.app'} 
              target="_blank"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Fabricio Viana
            </Link>
          </p>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
