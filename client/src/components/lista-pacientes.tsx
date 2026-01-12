
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

  const getFotoPaciente = (paciente: { foto?: string; sexo?: string; dataNascimento?: string }) => {
    // Se tem foto cadastrada, retorna a foto
    if (paciente.foto) {
      return `data:image/jpeg;base64,${paciente.foto}`;
    }

    // Calcula idade para determinar se é criança ou adulto
    const idade = paciente.dataNascimento ? calcularIdade(paciente.dataNascimento) : 18;
    const isCrianca = idade <= 14;
    const isFeminino = paciente.sexo?.toUpperCase() === 'FEMININO' || paciente.sexo?.toUpperCase() === 'F';

    // Retorna avatar padrão baseado em sexo e idade
    if (isFeminino && !isCrianca) {
      return '/avatar-feminino-adulto.svg';
    } else if (isFeminino && isCrianca) {
      return '/avatar-feminino-crianca.svg';
    } else if (!isFeminino && !isCrianca) {
      return '/avatar-masculino-adulto.svg';
    } else {
      return '/avatar-masculino-crianca.svg';
    }
  };

  const getCorPorTempoEspera = (datahora: string) => {
    const hoje = new Date();
    const dataLancamento = new Date(datahora);
    const diferencaMs = hoje.getTime() - dataLancamento.getTime();
    const diasDecorridos = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

    // Escala gradual de 0 (verde - mesmo dia) a 10+ dias (vermelho escuro)
    if (diasDecorridos === 0) {
      // Verde - lançamento feito hoje
      return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700";
    } else if (diasDecorridos === 1) {
      // Verde claro
      return "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600";
    } else if (diasDecorridos === 2) {
      // Amarelo esverdeado
      return "bg-lime-50 dark:bg-lime-950 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800";
    } else if (diasDecorridos === 3) {
      // Amarelo
      return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    } else if (diasDecorridos === 4) {
      // Amarelo dourado
      return "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    } else if (diasDecorridos === 5) {
      // Laranja claro
      return "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    } else if (diasDecorridos === 6) {
      // Laranja
      return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 border-orange-300 dark:border-orange-700";
    } else if (diasDecorridos === 7) {
      // Laranja avermelhado
      return "bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-100 border-orange-400 dark:border-orange-600";
    } else if (diasDecorridos === 8) {
      // Vermelho rosado
      return "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-800";
    } else if (diasDecorridos === 9) {
      // Vermelho médio
      return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200 border-red-300 dark:border-red-800";
    } else {
      // Vermelho intenso - 10 dias ou mais
      return "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-700 font-semibold";
    }
  };

  return (
    <div className="space-y-3">
      {pacientes.map((paciente) => (
        <Card key={paciente.pkatendimento} data-testid={`card-paciente-${paciente.pkatendimento}`}>
          <CardContent className="p-4">
            <div className="flex gap-4 items-start">
              {/* Foto do Paciente - Ocupa altura das duas linhas */}
              <div className="flex-shrink-0">
                <img 
                  src={getFotoPaciente(paciente.paciente)} 
                  alt={paciente.paciente.nome}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  data-testid={`img-paciente-${paciente.pkatendimento}`}
                />
              </div>

              {/* Conteúdo Principal */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Coluna 1: Paciente - 4 colunas */}
                <div className="space-y-1 md:col-span-4">
                  <p className="text-base font-bold" data-testid={`text-paciente-nome-${paciente.pkatendimento}`}>
                    {paciente.paciente.nome}
                  </p>
                  {paciente.paciente.dataNascimento && (
                    <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                      <span>
                        DN {new Date(paciente.paciente.dataNascimento).toLocaleDateString("pt-BR")}
                      </span>
                      <span>•</span>
                      <span>
                        Idade {calcularIdade(paciente.paciente.dataNascimento)} anos
                      </span>
                    </div>
                  )}
                </div>

                {/* Coluna 2: P.E.L (Posto.Enfermaria.Leito) - 2 colunas */}
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
                    variant="outline" 
                    className={`text-sm px-2 py-1 font-bold w-[115px] justify-center ${
                      paciente.procedimento?.diaspermanencia 
                        ? (() => {
                            const metade = paciente.procedimento.diaspermanencia / 2;
                            const dobro = paciente.procedimento.diaspermanencia * 2;
                            
                            if (paciente.diasInternado < metade) {
                              return "bg-orange-500 text-white border-orange-600";
                            } else if (paciente.diasInternado > dobro) {
                              return "bg-red-600 text-white border-red-700";
                            } else {
                              return "bg-green-600 text-white border-green-700";
                            }
                          })()
                        : ''
                    }`}
                    data-testid={`badge-dias-internado-${paciente.pkatendimento}`}
                  >
                    {paciente.diasInternado} {paciente.diasInternado === 1 ? "dia" : "dias"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Linha de procedimentos lançados */}
            {(
              (paciente.procedimentosLancados && paciente.procedimentosLancados.length > 0) || 
              (paciente.quantidadeExamesAnatomia !== undefined && paciente.quantidadeExamesAnatomia !== null && paciente.quantidadeExamesAnatomia > 0)
            ) && (
              <div className="mt-3 pt-3 border-t ml-24">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Pendências:</p>
                <div className="flex flex-wrap gap-2">
                  {paciente.procedimentosLancados && paciente.procedimentosLancados.length > 0 && paciente.procedimentosLancados.map((proc) => (
                    <Badge 
                      key={proc.id}
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${proc.datahora ? getCorPorTempoEspera(proc.datahora) : ''}`}
                      data-testid={`badge-procedimento-lancado-${proc.id}`}
                    >
                      {proc.descricao}
                      {proc.quantidade > 1 && (
                        <span className="ml-1 font-semibold">x{proc.quantidade}</span>
                      )}
                    </Badge>
                  ))}
                  {paciente.quantidadeExamesAnatomia !== undefined && paciente.quantidadeExamesAnatomia !== null && paciente.quantidadeExamesAnatomia > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1"
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
