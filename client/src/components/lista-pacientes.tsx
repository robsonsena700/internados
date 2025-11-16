
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Coluna 1: P.E.L (Posto.Enfermaria.Leito) */}
              <div className="space-y-0.5">
                <p className="text-sm font-semibold uppercase" data-testid={`text-posto-${paciente.pkatendimento}`}>
                  {paciente.leito?.posto?.descricao || '-'}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-enfermaria-${paciente.pkatendimento}`}>
                  {paciente.leito?.enfermaria?.descricao || '-'}
                </p>
                <div>
                  {paciente.leito ? (
                    <Badge variant="outline" className="text-xs" data-testid={`text-leito-${paciente.pkatendimento}`}>
                      Leito {paciente.leito.numero || paciente.leito.descricao}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem leito</span>
                  )}
                </div>
              </div>

              {/* Coluna 2: Paciente */}
              <div>
                <p className="text-base font-semibold leading-tight mb-1" data-testid={`text-paciente-nome-${paciente.pkatendimento}`}>
                  {paciente.paciente.nome}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-paciente-idade-${paciente.pkatendimento}`}>
                  {paciente.paciente.dataNascimento 
                    ? `${calcularIdade(paciente.paciente.dataNascimento)} anos`
                    : '-'}
                  {' • '}
                  <span data-testid={`text-paciente-sexo-${paciente.pkatendimento}`}>
                    {paciente.paciente.sexo === 'M' ? 'Masculino' : paciente.paciente.sexo === 'F' ? 'Feminino' : '-'}
                  </span>
                </p>
              </div>

              {/* Coluna 3: Médico, Especialidade e Procedimento */}
              <div className="space-y-0.5">
                <p className="text-sm font-medium" data-testid={`text-medico-${paciente.pkatendimento}`}>
                  {paciente.medico?.nome || (
                    <span className="text-muted-foreground">Médico não atribuído</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-especialidade-${paciente.pkatendimento}`}>
                  {paciente.especialidade?.descricao || '-'}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-procedimento-${paciente.pkatendimento}`}>
                  {paciente.procedimento?.descricao || '-'}
                </p>
              </div>

              {/* Coluna 4: Data e Tempo de Internação */}
              <div className="space-y-1">
                <p className="text-sm" data-testid={`text-data-entrada-${paciente.pkatendimento}`}>
                  {new Date(paciente.dataEntrada).toLocaleDateString("pt-BR")}
                </p>
                <Badge variant="default" data-testid={`text-dias-internado-${paciente.pkatendimento}`}>
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
