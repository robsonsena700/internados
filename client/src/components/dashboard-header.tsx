import { Button } from "@/components/ui/button";
import { LogOut, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DashboardHeader() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setLocation("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout",
      });
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Pacientes Internados</h1>
            <p className="text-xs text-muted-foreground">Sistema de Acompanhamento</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
}
