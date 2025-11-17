
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import type { Medico, Paciente, UnidadeSaude, Posto, Especialidade, Procedimento, FiltrosPacientes } from "@shared/schema";
import { useState, useMemo } from "react";

interface FiltrosPacientesProps {
  filtros: FiltrosPacientes;
  onFiltrosChange: (filtros: FiltrosPacientes) => void;
}

// Verificar se filtros foram passados via URL
const isFilterLockedByUrl = (filterName: string) => {
  const params = new URLSearchParams(window.location.search);
  return params.has(filterName);
};

export function FiltrosPacientes({ filtros, onFiltrosChange }: FiltrosPacientesProps) {
  const [buscaPaciente, setBuscaPaciente] = useState("");
  
  const { data: medicos } = useQuery<Medico[]>({
    queryKey: ["/api/medicos"],
  });

  const { data: pacientes } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  const { data: unidades } = useQuery<UnidadeSaude[]>({
    queryKey: ["/api/unidades"],
  });

  const { data: postos } = useQuery<Posto[]>({
    queryKey: ["/api/postos"],
  });

  const { data: especialidades } = useQuery<Especialidade[]>({
    queryKey: ["/api/especialidades"],
  });

  const { data: procedimentos } = useQuery<Procedimento[]>({
    queryKey: ["/api/procedimentos"],
  });

  // Filtrar pacientes pela busca
  const pacientesFiltrados = useMemo(() => {
    if (!pacientes) return [];
    if (!buscaPaciente.trim()) return pacientes;
    
    const termo = buscaPaciente.toLowerCase();
    return pacientes.filter(p => 
      p.nome.toLowerCase().includes(termo)
    );
  }, [pacientes, buscaPaciente]);

  const handleChange = (field: keyof FiltrosPacientes, value: string | undefined) => {
    onFiltrosChange({
      ...filtros,
      [field]: value ? (field.includes("Id") ? parseInt(value) : value) : undefined,
    });
  };

  const limparFiltros = () => {
    onFiltrosChange({});
    setBuscaPaciente("");
  };

  const hasActiveFilters = Object.values(filtros).some(v => v !== undefined);

  // Obter nomes dos itens selecionados para exibição
  const getFiltrosAtivos = () => {
    const ativos: { label: string; valor: string; campo: keyof FiltrosPacientes }[] = [];
    
    if (filtros.pacienteId) {
      const paciente = pacientes?.find(p => p.id === filtros.pacienteId);
      if (paciente) ativos.push({ label: "Paciente", valor: paciente.nome, campo: "pacienteId" });
    }
    
    if (filtros.unidadeId) {
      const unidade = unidades?.find(u => u.id === filtros.unidadeId);
      if (unidade) ativos.push({ label: "Unidade", valor: unidade.descricao, campo: "unidadeId" });
    }
    
    if (filtros.postoId) {
      const posto = postos?.find(p => p.id === filtros.postoId);
      if (posto) ativos.push({ label: "Posto", valor: posto.descricao, campo: "postoId" });
    }
    
    if (filtros.especialidadeId) {
      const especialidade = especialidades?.find(e => e.id === filtros.especialidadeId);
      if (especialidade) ativos.push({ label: "Especialidade", valor: especialidade.descricao, campo: "especialidadeId" });
    }
    
    if (filtros.medicoId) {
      const medico = medicos?.find(m => m.id === filtros.medicoId);
      if (medico) ativos.push({ label: "Médico Solicitante", valor: medico.nome, campo: "medicoId" });
    }
    
    if (filtros.procedimentoId) {
      const procedimento = procedimentos?.find(p => p.id === filtros.procedimentoId);
      if (procedimento) ativos.push({ label: "Procedimento", valor: procedimento.descricao, campo: "procedimentoId" });
    }
    
    return ativos;
  };

  const filtrosAtivos = getFiltrosAtivos();

  return (
    <Card>
      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value="filtros" className="border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline py-0">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg font-medium">Filtros</CardTitle>
                </div>
              </AccordionTrigger>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparFiltros}
                  data-testid="button-clear-filters"
                  className="ml-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            {filtrosAtivos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filtrosAtivos.map((filtro) => (
                  <Badge 
                    key={filtro.campo} 
                    variant="secondary" 
                    className="text-xs px-2 py-1"
                  >
                    <span className="font-semibold mr-1">{filtro.label}:</span>
                    <span className="truncate max-w-[150px]">{filtro.valor}</span>
                    <button
                      onClick={() => handleChange(filtro.campo, undefined)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <AccordionContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Paciente - Linha completa com busca */}
                <div className="space-y-2">
                  <Label htmlFor="paciente" className="text-sm font-medium">
                    Paciente
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o nome do paciente..."
                      value={buscaPaciente}
                      onChange={(e) => setBuscaPaciente(e.target.value)}
                      className="flex-1"
                      data-testid="input-busca-paciente"
                    />
                    <Select
                      value={filtros.pacienteId?.toString() || "all"}
                      onValueChange={(value) => handleChange("pacienteId", value === "all" ? undefined : value)}
                    >
                      <SelectTrigger id="paciente" data-testid="select-paciente" className="w-[250px]">
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os pacientes</SelectItem>
                        {pacientesFiltrados?.map((paciente) => (
                          <SelectItem key={paciente.id} value={paciente.id.toString()}>
                            {paciente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Demais filtros em grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unidade" className="text-sm font-medium">
                      Unidade de Atendimento
                    </Label>
                    <Select
                      value={filtros.unidadeId?.toString() || "all"}
                      onValueChange={(value) => handleChange("unidadeId", value === "all" ? undefined : value)}
                      disabled={isFilterLockedByUrl("unidade")}
                    >
                      <SelectTrigger id="unidade" data-testid="select-unidade">
                        <SelectValue placeholder="Todas as unidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as unidades</SelectItem>
                        {unidades?.map((unidade) => (
                          <SelectItem key={unidade.id} value={unidade.id.toString()}>
                            {unidade.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="posto" className="text-sm font-medium">
                      Posto
                    </Label>
                    <Select
                      value={filtros.postoId?.toString() || "all"}
                      onValueChange={(value) => handleChange("postoId", value === "all" ? undefined : value)}
                      disabled={isFilterLockedByUrl("posto")}
                    >
                      <SelectTrigger id="posto" data-testid="select-posto">
                        <SelectValue placeholder="Todos os postos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os postos</SelectItem>
                        {postos?.map((posto) => (
                          <SelectItem key={posto.id} value={posto.id.toString()}>
                            {posto.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="especialidade" className="text-sm font-medium">
                      Especialidade
                    </Label>
                    <Select
                      value={filtros.especialidadeId?.toString() || "all"}
                      onValueChange={(value) => handleChange("especialidadeId", value === "all" ? undefined : value)}
                    >
                      <SelectTrigger id="especialidade" data-testid="select-especialidade">
                        <SelectValue placeholder="Todas as especialidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as especialidades</SelectItem>
                        {especialidades?.map((especialidade) => (
                          <SelectItem key={especialidade.id} value={especialidade.id.toString()}>
                            {especialidade.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medico" className="text-sm font-medium">
                      Médico Solicitante
                    </Label>
                    <Select
                      value={filtros.medicoId?.toString() || "all"}
                      onValueChange={(value) => handleChange("medicoId", value === "all" ? undefined : value)}
                    >
                      <SelectTrigger id="medico" data-testid="select-medico">
                        <SelectValue placeholder="Todos os médicos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os médicos</SelectItem>
                        {medicos?.map((medico) => (
                          <SelectItem key={medico.id} value={medico.id.toString()}>
                            {medico.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="procedimento" className="text-sm font-medium">
                      Procedimento Solicitado
                    </Label>
                    <Select
                      value={filtros.procedimentoId?.toString() || "all"}
                      onValueChange={(value) => handleChange("procedimentoId", value === "all" ? undefined : value)}
                    >
                      <SelectTrigger id="procedimento" data-testid="select-procedimento">
                        <SelectValue placeholder="Todos os procedimentos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os procedimentos</SelectItem>
                        {procedimentos?.map((procedimento) => (
                          <SelectItem key={procedimento.id} value={procedimento.id.toString()}>
                            {procedimento.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
