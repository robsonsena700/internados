import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Bed, Activity } from "lucide-react";
import type { Indicadores } from "@shared/schema";

interface CardsIndicadoresProps {
  indicadores?: Indicadores;
  isLoading?: boolean;
}

export function CardsIndicadores({ indicadores, isLoading }: CardsIndicadoresProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topEspecialidade = indicadores?.distribuicaoEspecialidades[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Pacientes
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-total-pacientes">
            {indicadores?.totalPacientes || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pacientes internados atualmente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Média de Permanência
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-media-dias">
            {indicadores?.mediaDias?.toFixed(1) || "0.0"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dias de internação em média
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Ocupação
          </CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-ocupacao-leitos">
            {indicadores?.ocupacaoLeitos?.toFixed(0) || "0"}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Leitos ocupados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Principal Especialidade
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="text-top-especialidade-count">
            {topEspecialidade?.quantidade || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-top-especialidade-name">
            {topEspecialidade?.especialidade || "Nenhuma"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
