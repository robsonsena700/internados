import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, serial, numeric, smallint, uuid, char, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabelas do banco existente - apenas para referência de tipos

// Tabela de pacientes
export const pacientes = pgTable("cdg_paciente", {
  pkpaciente: serial("pkpaciente").primaryKey(),
  nome: text("nome"),
  cpf: text("cpf"),
  datanascimento: date("datanascimento"),
  sexo: char("sexo", { length: 1 }),
}, { schema: "sotech" });

// Tabela de profissionais/médicos
export const intervenientes = pgTable("cdg_interveniente", {
  pkinterveniente: serial("pkinterveniente").primaryKey(),
  nome: text("nome"),
  registro: text("registro"),
}, { schema: "sotech" });

// Tabela de unidades de saúde
export const unidadesSaude = pgTable("cdg_unidadesaude", {
  pkunidadesaude: serial("pkunidadesaude").primaryKey(),
  descricao: text("descricao"),
  cnes: text("cnes"),
}, { schema: "sotech" });

// Tabela de leitos
export const leitos = pgTable("cdg_leito", {
  pkleito: serial("pkleito").primaryKey(),
  descricao: text("descricao"),
  numero: text("numero"),
  // Adicionar chaves estrangeiras para Posto e Enfermaria se existirem
  // fkposto: integer("fkposto"),
  // fkenfermaria: integer("fkenfermaria"),
}, { schema: "sotech" });

// Tabela de especialidades
export const especialidades = pgTable("tbn_especialidade", {
  pkespecialidade: serial("pkespecialidade").primaryKey(),
  descricao: text("descricao"),
}, { schema: "sotech" });

// Tabela de procedimentos (tbl_procedimento - legado)
export const procedimentos = pgTable("tbl_procedimento", {
  pkprocedimento: serial("pkprocedimento").primaryKey(),
  descricao: text("descricao"),
  codigo: text("codigo"),
}, { schema: "sotech" });

// Tabela de procedimentos (tbn_procedimento - tabela SUS)
export const procedimentosSus = pgTable("tbn_procedimento", {
  pkprocedimento: serial("pkprocedimento").primaryKey(),
  codprocedimento: char("codprocedimento", { length: 10 }).notNull(),
  procedimento: text("procedimento").notNull(),
  fkformaorganizacao: integer("fkformaorganizacao"),
  complexidade: char("complexidade", { length: 1 }).notNull(),
  sexo: char("sexo", { length: 1 }).notNull(),
  quantidademax: integer("quantidademax").notNull(),
  diaspermanencia: integer("diaspermanencia").notNull(),
  pontos: integer("pontos").notNull(),
  idademin: integer("idademin").notNull(),
  idademax: integer("idademax").notNull(),
  valorsh: numeric("valorsh", { precision: 15, scale: 2 }).default(sql`0`).notNull(),
  valorsa: numeric("valorsa", { precision: 15, scale: 2 }).default(sql`0`).notNull(),
  valorsp: numeric("valorsp", { precision: 15, scale: 2 }).default(sql`0`).notNull(),
  fkfinanciamento: integer("fkfinanciamento"),
  fkrubrica: integer("fkrubrica"),
  competenciaini: char("competenciaini", { length: 6 }).default(sql`'000000'`).notNull(),
  competenciafim: char("competenciafim", { length: 6 }).default(sql`'999999'`).notNull(),
  tabela: varchar("tabela", { length: 4 }),
  operacional: integer("operacional"),
  fkatofaturamento: integer("fkatofaturamento"),
  fkuser: integer("fkuser").default(0).notNull(),
  version: integer("version").default(0).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  uuid: uuid("uuid").default(sql`uuid_generate_v4()`).notNull(),
}, { schema: "sotech" });

// Tabela principal de atendimentos
export const atendimentos = pgTable("ate_atendimento", {
  pkatendimento: serial("pkatendimento").primaryKey(),
  fktipoatendimento: integer("fktipoatendimento").notNull(),
  fkpaciente: integer("fkpaciente").notNull(),
  fkprofissionalatendimento: integer("fkprofissionalatendimento"),
  fkunidadesaude: integer("fkunidadesaude").notNull(),
  fkleito: integer("fkleito"),
  fkespecialidade: integer("fkespecialidade"),
  fkprocedimentosolicitado: integer("fkprocedimentosolicitado"),
  dataentrada: timestamp("dataentrada").notNull(),
  datasaida: timestamp("datasaida"),
  queixaprincipal: text("queixaprincipal"),
  ativo: boolean("ativo").default(true),
}, { schema: "sotech" });

// Tipos para o frontend
export type Paciente = {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: string;
  foto?: string;
};

export type Medico = {
  id: number;
  nome: string;
  registro?: string;
};

export type UnidadeSaude = {
  id: number;
  descricao: string;
  cnes?: string;
};

// Modificado para refletir a nova estrutura P.E.L
export interface Posto {
  id: number;
  descricao: string;
}

export interface Leito {
  id: number;
  numero: string;
  descricao?: string;
  posto?: {
    id: number;
    descricao: string;
  };
  enfermaria?: {
    id: number;
    descricao: string;
  };
}


export type Especialidade = {
  id: number;
  descricao: string;
};

export type Procedimento = {
  id: number;
  descricao: string;
  codigo?: string;
  diaspermanencia?: number;
};

export type ProcedimentoLancado = {
  id: number;
  descricao: string;
  quantidade: number;
  datahora: string;
};

export type PacienteInternado = {
  pkatendimento: number;
  paciente: {
    id: number;
    nome: string;
    dataNascimento?: string;
    sexo?: string;
  };
  medico: {
    id: number;
    nome: string;
  } | null;
  unidadeSaude: {
    id: number;
    descricao: string;
  };
  leito: Leito | null; // Usa o novo tipo Leito
  especialidade: {
    id: number;
    descricao: string;
  } | null;
  procedimento: {
    id: number;
    descricao: string;
  } | null;
  dataEntrada: string;
  diasInternado: number;
  queixaPrincipal?: string;
  procedimentosLancados?: ProcedimentoLancado[];
  quantidadeExamesAnatomia?: number;
};

// Modificado para usar postoId ao invés de leitoId
export interface FiltrosPacientes {
  medicoId?: number;
  pacienteId?: number;
  unidadeId?: number;
  postoId?: number;
  especialidadeId?: number;
  procedimentoId?: number;
}

export type Indicadores = {
  totalPacientes: number;
  mediaDias: number;
  ocupacaoLeitos: number;
  distribuicaoEspecialidades: Array<{
    especialidade: string;
    quantidade: number;
  }>;
};

// Schema de autenticação
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;