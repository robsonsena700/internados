import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard-header";
import { FiltrosPacientes } from "@/components/filtros-pacientes";
import { CardsIndicadores } from "@/components/cards-indicadores";
import { ListaPacientes } from "@/components/lista-pacientes";
import { Footer } from "@/components/footer";
import type { PacienteInternado, Indicadores, FiltrosPacientes as FiltrosType } from "@shared/schema";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [filtros, setFiltros] = useState<FiltrosType>({});
  const [showFiltros, setShowFiltros] = useState(true);
  const [showIndicadores, setShowIndicadores] = useState(true);
  const [maxLinhas, setMaxLinhas] = useState<number | undefined>(undefined);
  
  // Processar parâmetros da URL na inicialização
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Parâmetro login: se false, faz auto-login como admin
    const loginParam = params.get('login');
    if (loginParam === 'false') {
      // Auto-login como admin sem mostrar tela de login
      fetch('/internados/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: 'admin', password: '@dm1n' })
      })
      .then(async response => {
        if (response.ok) {
          // Aguarda um pouco para garantir que a sessão foi estabelecida
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Remove apenas o parâmetro login=false, mantendo todos os outros
          params.delete('login');
          const newUrl = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
          
          // Atualiza a URL sem recarregar a página
          window.history.replaceState({}, '', newUrl);
          
          // Força a atualização do componente para processar os outros parâmetros
          window.location.reload();
        }
      })
      .catch(console.error);
      return; // Sai do useEffect para não processar outros parâmetros ainda
    }
    
    // Parâmetro filtro: mostra/oculta accordion de filtros
    const filtroParam = params.get('filtro');
    if (filtroParam === 'false') {
      setShowFiltros(false);
    }
    
    // Parâmetro ind: mostra/oculta cards de indicadores
    const indParam = params.get('ind');
    if (indParam === 'false') {
      setShowIndicadores(false);
    }
    
    // Parâmetro unidade: filtra pela unidade e desabilita o filtro
    const unidadeParam = params.get('unidade');
    if (unidadeParam) {
      const unidadeId = parseInt(unidadeParam);
      if (!isNaN(unidadeId)) {
        setFiltros(prev => ({ ...prev, unidadeId }));
      }
    }
    
    // Parâmetro posto: filtra pelo posto e desabilita o filtro
    const postoParam = params.get('posto');
    if (postoParam) {
      const postoId = parseInt(postoParam);
      if (!isNaN(postoId)) {
        setFiltros(prev => ({ ...prev, postoId }));
      }
    }
    
    // Parâmetro linhas: limita o número de linhas mostradas
    const linhasParam = params.get('linhas');
    if (linhasParam) {
      const linhas = parseInt(linhasParam);
      if (!isNaN(linhas) && linhas > 0) {
        setMaxLinhas(linhas);
      }
    }
  }, []);

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

  // Aplicar limite de linhas se especificado
  const pacientesFiltrados = maxLinhas && pacientes 
    ? pacientes.slice(0, maxLinhas) 
    : pacientes;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 w-full px-4 py-6 space-y-6">
        {showFiltros && <FiltrosPacientes filtros={filtros} onFiltrosChange={setFiltros} />}
        {showIndicadores && <CardsIndicadores indicadores={indicadores} isLoading={isLoadingIndicadores} />}
        <ListaPacientes pacientes={pacientesFiltrados} isLoading={isLoadingPacientes} />
      </main>
      <Footer />
    </div>
  );
}
