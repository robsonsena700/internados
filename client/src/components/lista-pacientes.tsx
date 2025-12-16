
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { PacienteInternado } from "@shared/schema";

interface ListaPacientesProps {
  pacientes?: PacienteInternado[];
  isLoading?: boolean;
}

export function ListaPacientes({ pacientes, isLoading }: ListaPacientesProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!pacientes || pacientes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              Nenhum paciente internado encontrado
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ajuste os filtros para ver resultados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const getCorPorTempoEspera = (datahora: string) => {
    const hoje = new Date();
    const dataLancamento = new Date(datahora);
    const diferencaMs = hoje.getTime() - dataLancamento.getTime();
    const diasDecorridos = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

    // Escala de 0 a 10 dias
    if (diasDecorridos === 0) {
      return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    } else if (diasDecorridos === 1) {
      return "bg-lime-50 dark:bg-lime-950 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800";
    } else if (diasDecorridos === 2) {
      return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    } else if (diasDecorridos >= 3 && diasDecorridos <= 4) {
      return "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    } else if (diasDecorridos >= 5 && diasDecorridos <= 6) {
      return "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    } else if (diasDecorridos >= 7 && diasDecorridos <= 8) {
      return "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    } else if (diasDecorridos === 9) {
      return "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    } else {
      // 10 dias ou mais
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700";
    }
  };

  return (
    <div className="space-y-3">
      {pacientes.map((paciente) => (
        <Card key={paciente.pkatendimento} data-testid={`card-paciente-${paciente.pkatendimento}`}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Coluna 1: P.E.L (Posto.Enfermaria.Leito) - 2 colunas */}
              <div className="space-y-0 md:col-span-2">
                <p className="text-xs font-bold uppercase leading-tight" data-testid={`text-posto-${paciente.pkatendimento}`}>
                  {paciente.leito?.posto?.descricao || 'POSTO NÃO DEFINIDO'}
                </p>
                <p className="text-xs font-bold uppercase leading-tight" data-testid={`text-enfermaria-${paciente.pkatendimento}`}>
                  {paciente.leito?.enfermaria?.descricao || 'ENFERMARIA NÃO DEFINIDA'}
                </p>
                <p className="text-xs font-bold leading-tight" data-testid={`text-leito-${paciente.pkatendimento}`}>
                  {paciente.leito?.descricao ? `Leito ${paciente.leito.descricao}` : 'Leito não definido'}
                </p>
              </div>

              {/* Coluna 2: Paciente - 4 colunas */}
              <div className="space-y-1 md:col-span-4">
                <Badge 
                  variant="default" 
                  className={`text-sm font-semibold px-4 py-1.5 whitespace-normal leading-tight ${
                    paciente.paciente.sexo?.toUpperCase() === 'MASCULINO' 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-pink-500 hover:bg-pink-600'
                  }`}
                  data-testid={`text-paciente-nome-${paciente.pkatendimento}`}
                >
                  {paciente.paciente.nome}
                </Badge>
                {paciente.paciente.dataNascimento && (
                  <div className="flex gap-2 flex-wrap">
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-normal ${
                        paciente.paciente.sexo?.toUpperCase() === 'MASCULINO' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                      }`}
                    >
                      DN {new Date(paciente.paciente.dataNascimento).toLocaleDateString("pt-BR")}
                    </span>
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-normal ${
                        paciente.paciente.sexo?.toUpperCase() === 'MASCULINO' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                      }`}
                    >
                      Idade {calcularIdade(paciente.paciente.dataNascimento)} anos
                    </span>
                  </div>
                )}
              </div>

              {/* Coluna 3: Profissional Solicitante, Especialidade e Procedimento - 4 colunas */}
              <div className="space-y-0 md:col-span-4">
                <p className="text-xs font-bold uppercase leading-tight" data-testid={`text-medico-${paciente.pkatendimento}`}>
                  {paciente.medico?.nome || 'PROFISSIONAL NÃO ATRIBUÍDO'}
                </p>
                <p className="text-xs font-normal uppercase leading-tight" data-testid={`text-especialidade-${paciente.pkatendimento}`}>
                  {paciente.especialidade?.descricao || 'Especialidade não definida'}
                </p>
                <p className="text-xs font-normal uppercase leading-tight" data-testid={`text-procedimento-${paciente.pkatendimento}`}>
                  {paciente.procedimento?.descricao || 'Procedimento não definido'}
                  {paciente.procedimento?.diaspermanencia && (
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      ({paciente.procedimento.diaspermanencia} dias)
                    </span>
                  )}
                </p>
              </div>

              {/* Coluna 4: Data e Tempo de Internação - 2 colunas */}
              <div className="space-y-1 text-right md:text-left md:col-span-2">
                <p className="text-xs font-normal" data-testid={`text-data-entrada-${paciente.pkatendimento}`}>
                  Desde de {new Date(paciente.dataEntrada).toLocaleDateString("pt-BR")}
                </p>
                <Badge 
                  variant="default" 
                  className={`text-sm px-3 py-1 ${
                    paciente.procedimento?.diaspermanencia
                      ? paciente.diasInternado > paciente.procedimento.diaspermanencia * 2
                        ? 'bg-red-500 hover:bg-red-600'
                        : paciente.diasInternado > Math.ceil(paciente.procedimento.diaspermanencia / 2)
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                  data-testid={`text-dias-internado-${paciente.pkatendimento}`}
                >
                  {paciente.diasInternado} {paciente.diasInternado === 1 ? "dia" : "dias"}
                </Badge>
              </div>
            </div>

            {/* Linha de procedimentos lançados */}
            {((paciente.procedimentosLancados && paciente.procedimentosLancados.length > 0) || (paciente.quantidadeExamesAnatomia && paciente.quantidadeExamesAnatomia > 0)) && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Pendências:</p>
                <div className="flex flex-wrap gap-2">
                  {paciente.procedimentosLancados && paciente.procedimentosLancados.map((proc) => (
                    <Badge 
                      key={proc.id}
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${getCorPorTempoEspera(proc.datahora)}`}
                      data-testid={`badge-procedimento-lancado-${proc.id}`}
                    >
                      {proc.descricao}
                      {proc.quantidade > 1 && (
                        <span className="ml-1 font-semibold">x{proc.quantidade}</span>
                      )}
                    </Badge>
                  ))}
                  {paciente.quantidadeExamesAnatomia !== undefined && paciente.quantidadeExamesAnatomia > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      data-testid={`badge-exames-anatomia-${paciente.pkatendimento}`}
                    >
                      {paciente.quantidadeExamesAnatomia} Exames de anatomia patológica
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
