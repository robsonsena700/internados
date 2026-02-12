import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  username: string;
  role: string;
}

export function Footer() {
  const [user, setUser] = useState<User | null>(null);
  
  // Obter versão e data do ambiente (definidos no vite.config.ts)
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
  const buildDate = import.meta.env.VITE_BUILD_DATE 
    ? new Date(import.meta.env.VITE_BUILD_DATE).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Data indisponível";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <footer className="w-full py-2 mt-auto border-t bg-card text-muted-foreground">
      <div className="w-full px-6">
        <div className="flex flex-col md:flex-row items-center justify-end gap-2 md:gap-3 text-[10px] sm:text-[11px]">
          <span className="font-medium">Copyright 2026 - Grupo IS</span>
          
          <Separator orientation="vertical" className="hidden md:block h-3" />
          
          <div className="flex items-center gap-1">
            <span className="opacity-70 text-[9px] uppercase tracking-wider">Usuário:</span>
            <span className="font-semibold text-foreground">
              {user ? user.username : "Visitante"}
            </span>
          </div>

          <Separator orientation="vertical" className="hidden md:block h-3" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help hover:text-foreground transition-colors">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded border">v{appVersion}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] p-2">
                <div className="space-y-1">
                  <p><span className="font-semibold">Versão:</span> {appVersion}</p>
                  <p><span className="font-semibold">Lançamento:</span> {buildDate}</p>
                  <Separator className="my-1" />
                  <p className="italic opacity-70">Clique para ver as notas de versão</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="hidden md:block h-3" />
          
          <a 
            href="https://github.com/robsonsena700/internados/blob/main/CHANGELOG.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary underline underline-offset-2 transition-colors"
          >
            Changelog
          </a>
        </div>
      </div>
    </footer>
  );
}
