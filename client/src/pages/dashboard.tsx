import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { FiltrosPacientes } from "@/components/filtros-pacientes";
import { CardsIndicadores } from "@/components/cards-indicadores";
import { ListaPacientes } from "@/components/lista-pacientes";
import type { PacienteInternado, Indicadores, FiltrosPacientes as FiltrosType } from "@shared/schema";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [filtros, setFiltros] = useState<FiltrosType>({});

  // Construir query params dos filtros
  const buildQueryParams = (filtros: FiltrosType) => {
    const params = new URLSearchParams();
    if (filtros.medicoId) params.append("medicoId", filtros.medicoId.toString());
    if (filtros.pacienteId) params.append("pacienteId", filtros.pacienteId.toString());
    if (filtros.unidadeId) params.append("unidadeId", filtros.unidadeId.toString());
    if (filtros.postoId) params.append("postoId", filtros.postoId.toString());
    if (filtros.especialidadeId) params.append("especialidadeId", filtros.especialidadeId.toString());
    if (filtros.procedimentoId) params.append("procedimentoId", filtros.procedimentoId.toString());
    return params.toString();
  };

  const queryParams = buildQueryParams(filtros);
  const queryString = queryParams ? `?${queryParams}` : "";

  const { data: pacientes, isLoading: isLoadingPacientes, error: errorPacientes } = useQuery<PacienteInternado[]>({
    queryKey: [`/api/pacientes-internados${queryString}`],
    retry: false,
  });

  const { data: indicadores, isLoading: isLoadingIndicadores } = useQuery<Indicadores>({
    queryKey: [`/api/indicadores${queryString}`],
    retry: false,
  });

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (errorPacientes) {
      const errorMessage = errorPacientes.message || "";
      if (errorMessage.includes("401")) {
        setLocation("/login");
      }
    }
  }, [errorPacientes, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <FiltrosPacientes filtros={filtros} onFiltrosChange={setFiltros} />
        <CardsIndicadores indicadores={indicadores} isLoading={isLoadingIndicadores} />
        <ListaPacientes pacientes={pacientes} isLoading={isLoadingPacientes} />
      </main>
    </div>
  );
}
