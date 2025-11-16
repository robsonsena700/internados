
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
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
    <div className="space-y-4">
      {pacientes.map((paciente) => (
        <Card key={paciente.pkatendimento} data-testid={`card-paciente-${paciente.pkatendimento}`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Coluna 1: Posto, Enfermaria e Leito */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Posto</p>
                  <p className="text-sm font-medium" data-testid={`text-posto-${paciente.pkatendimento}`}>
                    {paciente.leito?.posto?.descricao || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enfermaria</p>
                  <p className="text-sm font-medium" data-testid={`text-enfermaria-${paciente.pkatendimento}`}>
                    {paciente.leito?.enfermaria?.descricao || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Leito</p>
                  {paciente.leito ? (
                    <Badge variant="outline" data-testid={`text-leito-${paciente.pkatendimento}`}>
                      {paciente.leito.numero || paciente.leito.descricao}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem leito</span>
                  )}
                </div>
              </div>

              {/* Coluna 2: Nome do Paciente (2 linhas) + Idade e Sexo */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Paciente</p>
                  <p className="text-lg font-semibold leading-tight" data-testid={`text-paciente-nome-${paciente.pkatendimento}`}>
                    {paciente.paciente.nome}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Idade: </span>
                    <span className="font-medium" data-testid={`text-paciente-idade-${paciente.pkatendimento}`}>
                      {paciente.paciente.dataNascimento 
                        ? `${calcularIdade(paciente.paciente.dataNascimento)} anos`
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sexo: </span>
                    <span className="font-medium" data-testid={`text-paciente-sexo-${paciente.pkatendimento}`}>
                      {paciente.paciente.sexo === 'M' ? 'Masculino' : paciente.paciente.sexo === 'F' ? 'Feminino' : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Médico Solicitante, Especialidade e Procedimento */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Médico Solicitante</p>
                  <p className="text-sm font-medium" data-testid={`text-medico-${paciente.pkatendimento}`}>
                    {paciente.medico?.nome || (
                      <span className="text-muted-foreground">Não atribuído</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Especialidade</p>
                  <p className="text-sm font-medium" data-testid={`text-especialidade-${paciente.pkatendimento}`}>
                    {paciente.especialidade?.descricao || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Procedimento</p>
                  <p className="text-sm font-medium" data-testid={`text-procedimento-${paciente.pkatendimento}`}>
                    {paciente.procedimento?.descricao || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Coluna 4: Data de Internação e Dias Internado */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Data de Internação</p>
                  <p className="text-sm font-medium" data-testid={`text-data-entrada-${paciente.pkatendimento}`}>
                    {new Date(paciente.dataEntrada).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tempo de Internação</p>
                  <Badge data-testid={`text-dias-internado-${paciente.pkatendimento}`}>
                    {paciente.diasInternado} {paciente.diasInternado === 1 ? "dia" : "dias"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
