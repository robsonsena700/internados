import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PacienteInternado } from "@shared/schema";

interface ListaPacientesProps {
  pacientes?: PacienteInternado[];
  isLoading?: boolean;
}

export function ListaPacientes({ pacientes, isLoading }: ListaPacientesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Leito</TableHead>
                  <TableHead>Médico Assistente</TableHead>
                  <TableHead>Data Internação</TableHead>
                  <TableHead>Dias Internado</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Procedimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((paciente) => (
                  <TableRow key={paciente.pkatendimento} data-testid={`row-paciente-${paciente.pkatendimento}`}>
                    <TableCell className="font-medium" data-testid={`text-paciente-nome-${paciente.pkatendimento}`}>
                      {paciente.paciente.nome}
                    </TableCell>
                    <TableCell data-testid={`text-leito-${paciente.pkatendimento}`}>
                      {paciente.leito ? (
                        <Badge variant="outline">
                          {paciente.leito.numero || paciente.leito.descricao}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem leito</span>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-medico-${paciente.pkatendimento}`}>
                      {paciente.medico?.nome || (
                        <span className="text-muted-foreground text-sm">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-data-entrada-${paciente.pkatendimento}`}>
                      {new Date(paciente.dataEntrada).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell data-testid={`text-dias-internado-${paciente.pkatendimento}`}>
                      <Badge>
                        {paciente.diasInternado} {paciente.diasInternado === 1 ? "dia" : "dias"}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-especialidade-${paciente.pkatendimento}`}>
                      {paciente.especialidade?.descricao || (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-procedimento-${paciente.pkatendimento}`}>
                      {paciente.procedimento?.descricao || (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {pacientes.map((paciente) => (
          <Card key={paciente.pkatendimento} data-testid={`card-paciente-${paciente.pkatendimento}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base" data-testid={`text-paciente-nome-mobile-${paciente.pkatendimento}`}>
                    {paciente.paciente.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {paciente.medico?.nome || "Sem médico atribuído"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Leito</p>
                    <p className="font-medium">
                      {paciente.leito ? paciente.leito.numero || paciente.leito.descricao : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Dias</p>
                    <p className="font-medium">{paciente.diasInternado}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Internação</p>
                    <p className="font-medium">
                      {new Date(paciente.dataEntrada).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {paciente.especialidade && (
                  <div>
                    <p className="text-xs text-muted-foreground">Especialidade</p>
                    <p className="text-sm">{paciente.especialidade.descricao}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
