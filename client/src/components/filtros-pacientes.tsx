import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import type { Medico, Paciente, UnidadeSaude, Posto, Especialidade, Procedimento, FiltrosPacientes } from "@shared/schema";

interface FiltrosPacientesProps {
  filtros: FiltrosPacientes;
  onFiltrosChange: (filtros: FiltrosPacientes) => void;
}

export function FiltrosPacientes({ filtros, onFiltrosChange }: FiltrosPacientesProps) {
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

  const handleChange = (field: keyof FiltrosPacientes, value: string | undefined) => {
    onFiltrosChange({
      ...filtros,
      [field]: value ? (field.includes("Id") ? parseInt(value) : value) : undefined,
    });
  };

  const limparFiltros = () => {
    onFiltrosChange({});
  };

  const hasActiveFilters = Object.values(filtros).some(v => v !== undefined);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg font-medium">Filtros</CardTitle>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="medico" className="text-sm font-medium">
              Médico Assistente
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
            <Label htmlFor="paciente" className="text-sm font-medium">
              Paciente
            </Label>
            <Select
              value={filtros.pacienteId?.toString() || "all"}
              onValueChange={(value) => handleChange("pacienteId", value === "all" ? undefined : value)}
            >
              <SelectTrigger id="paciente" data-testid="select-paciente">
                <SelectValue placeholder="Todos os pacientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacientes</SelectItem>
                {pacientes?.map((paciente) => (
                  <SelectItem key={paciente.id} value={paciente.id.toString()}>
                    {paciente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade" className="text-sm font-medium">
              Unidade de Atendimento
            </Label>
            <Select
              value={filtros.unidadeId?.toString() || "all"}
              onValueChange={(value) => handleChange("unidadeId", value === "all" ? undefined : value)}
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
            <Label htmlFor="dataInicio" className="text-sm font-medium">
              Data Início
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={filtros.dataInicio || ""}
              onChange={(e) => handleChange("dataInicio", e.target.value)}
              data-testid="input-data-inicio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataFim" className="text-sm font-medium">
              Data Fim
            </Label>
            <Input
              id="dataFim"
              type="date"
              value={filtros.dataFim || ""}
              onChange={(e) => handleChange("dataFim", e.target.value)}
              data-testid="input-data-fim"
            />
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
      </CardContent>
    </Card>
  );
}
