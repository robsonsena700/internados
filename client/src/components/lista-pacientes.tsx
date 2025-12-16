
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

  return (
    <div className="space-y-3">
      {pacientes.map((paciente) => (
        <Card key={paciente.pkatendimento} data-testid={`card-paciente-${paciente.pkatendimento}`}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Coluna 1: P.E.L (Posto.Enfermaria.Leito) */}
              <div className="space-y-0">
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

              {/* Coluna 2: Paciente */}
              <div className="space-y-1">
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
                  <div className="flex gap-2">
                    <Badge 
                      variant="default" 
                      className={`text-xs font-normal px-3 py-1 ${
                        paciente.paciente.sexo?.toUpperCase() === 'MASCULINO' 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      }`}
                    >
                      DN {new Date(paciente.paciente.dataNascimento).toLocaleDateString("pt-BR")}
                    </Badge>
                    <Badge 
                      variant="default" 
                      className={`text-xs font-normal px-3 py-1 ${
                        paciente.paciente.sexo?.toUpperCase() === 'MASCULINO' 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      }`}
                    >
                      Idade {calcularIdade(paciente.paciente.dataNascimento)} anos
                    </Badge>
                  </div>
                )}
              </div>

              {/* Coluna 3: Profissional Solicitante, Especialidade e Procedimento */}
              <div className="space-y-0">
                <p className="text-xs font-bold uppercase leading-tight" data-testid={`text-medico-${paciente.pkatendimento}`}>
                  {paciente.medico?.nome || 'PROFISSIONAL NÃO ATRIBUÍDO'}
                </p>
                <p className="text-xs font-normal uppercase leading-tight" data-testid={`text-especialidade-${paciente.pkatendimento}`}>
                  {paciente.especialidade?.descricao || 'Especialidade não definida'}
                </p>
                <p className="text-xs font-normal uppercase leading-tight" data-testid={`text-procedimento-${paciente.pkatendimento}`}>
                  {paciente.procedimento?.descricao || 'Procedimento não definido'}
                </p>
              </div>

              {/* Coluna 4: Data e Tempo de Internação */}
              <div className="space-y-1 text-right md:text-left">
                <p className="text-xs font-normal" data-testid={`text-data-entrada-${paciente.pkatendimento}`}>
                  Desde de {new Date(paciente.dataEntrada).toLocaleDateString("pt-BR")}
                </p>
                <Badge 
                  variant="default" 
                  className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1" 
                  data-testid={`text-dias-internado-${paciente.pkatendimento}`}
                >
                  {paciente.diasInternado} {paciente.diasInternado === 1 ? "dia" : "dias"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
