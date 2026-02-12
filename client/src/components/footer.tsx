import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

interface User {
  username: string;
  role: string;
}

export function Footer() {
  const [user, setUser] = useState<User | null>(null);

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
          
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
