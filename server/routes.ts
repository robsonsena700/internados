import type { Express } from "express";
import { createServer, type Server } from "http";
import { pool } from "./db";
import { authenticateUser, requireAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Autenticação
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Usuário ou senha inválidos" });
      }

      req.session.user = user;
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ success: true });
    });
  });

  // Endpoints protegidos - requerem autenticação
  app.use("/api/medicos", requireAuth);
  app.use("/api/pacientes", requireAuth);
  app.use("/api/unidades", requireAuth);
  app.use("/api/leitos", requireAuth);
  app.use("/api/especialidades", requireAuth);
  app.use("/api/procedimentos", requireAuth);
  app.use("/api/pacientes-internados", requireAuth);
  app.use("/api/indicadores", requireAuth);

  // Listar médicos (intervenientes)
  app.get("/api/medicos", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pkinterveniente as id, nome 
         FROM sotech.cdg_interveniente 
         WHERE ativo = true 
         ORDER BY nome 
         LIMIT 100`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
      res.status(500).json({ message: "Erro ao buscar médicos" });
    }
  });

  // Listar pacientes
  app.get("/api/pacientes", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pkpaciente as id, nome 
         FROM sotech.cdg_paciente 
         WHERE ativo = true 
         ORDER BY nome 
         LIMIT 100`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      res.status(500).json({ message: "Erro ao buscar pacientes" });
    }
  });

  // Listar unidades de saúde
  app.get("/api/unidades", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pkunidadesaude as id, descricao 
         FROM sotech.cdg_unidadesaude 
         WHERE ativo = true 
         ORDER BY descricao 
         LIMIT 100`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      res.status(500).json({ message: "Erro ao buscar unidades" });
    }
  });

  // Listar leitos
  app.get("/api/leitos", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pkleito as id, descricao, numero 
         FROM sotech.cdg_leito 
         WHERE ativo = true 
         ORDER BY numero, descricao 
         LIMIT 100`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar leitos:", error);
      res.status(500).json({ message: "Erro ao buscar leitos" });
    }
  });

  // Listar especialidades
  app.get("/api/especialidades", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pkespecialidade as id, descricao 
         FROM sotech.tbn_especialidade 
         WHERE ativo = true 
         ORDER BY descricao 
         LIMIT 100`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar especialidades:", error);
      res.status(500).json({ message: "Erro ao buscar especialidades" });
    }
  });

  // Listar procedimentos
  app.get("/api/procedimentos", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT pkprocedimento as id, descricao, codigo 
         FROM sotech.tbl_procedimento 
         WHERE ativo = true 
         ORDER BY descricao 
         LIMIT 100`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar procedimentos:", error);
      res.status(500).json({ message: "Erro ao buscar procedimentos" });
    }
  });

  // Listar pacientes internados com filtros
  app.get("/api/pacientes-internados", async (req, res) => {
    try {
      const {
        medicoId,
        pacienteId,
        unidadeId,
        leitoId,
        dataInicio,
        dataFim,
        especialidadeId,
        procedimentoId,
      } = req.query;

      let query = `
        SELECT 
          a.pkatendimento,
          jsonb_build_object('id', p.pkpaciente, 'nome', p.nome) as paciente,
          CASE 
            WHEN m.pkinterveniente IS NOT NULL 
            THEN jsonb_build_object('id', m.pkinterveniente, 'nome', m.nome)
            ELSE NULL
          END as medico,
          jsonb_build_object('id', u.pkunidadesaude, 'descricao', u.descricao) as unidadeSaude,
          CASE 
            WHEN l.pkleito IS NOT NULL 
            THEN jsonb_build_object('id', l.pkleito, 'descricao', l.descricao, 'numero', l.numero)
            ELSE NULL
          END as leito,
          CASE 
            WHEN e.pkespecialidade IS NOT NULL 
            THEN jsonb_build_object('id', e.pkespecialidade, 'descricao', e.descricao)
            ELSE NULL
          END as especialidade,
          CASE 
            WHEN pr.pkprocedimento IS NOT NULL 
            THEN jsonb_build_object('id', pr.pkprocedimento, 'descricao', pr.descricao)
            ELSE NULL
          END as procedimento,
          a.dataentrada as "dataEntrada",
          EXTRACT(DAY FROM (NOW() - a.dataentrada))::integer as "diasInternado",
          a.queixaprincipal as "queixaPrincipal"
        FROM sotech.ate_atendimento a
        INNER JOIN sotech.cdg_paciente p ON p.pkpaciente = a.fkpaciente
        INNER JOIN sotech.cdg_unidadesaude u ON u.pkunidadesaude = a.fkunidadesaude
        LEFT JOIN sotech.cdg_interveniente m ON m.pkinterveniente = a.fkprofissionalatendimento
        LEFT JOIN sotech.cdg_leito l ON l.pkleito = a.fkleito
        LEFT JOIN sotech.tbn_especialidade e ON e.pkespecialidade = a.fkespecialidade
        LEFT JOIN sotech.tbl_procedimento pr ON pr.pkprocedimento = a.fkprocedimentosolicitado
        WHERE a.fktipoatendimento = 2
          AND a.datasaida IS NULL
          AND a.ativo = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (medicoId) {
        query += ` AND a.fkprofissionalatendimento = $${paramIndex}`;
        params.push(parseInt(medicoId as string));
        paramIndex++;
      }

      if (pacienteId) {
        query += ` AND a.fkpaciente = $${paramIndex}`;
        params.push(parseInt(pacienteId as string));
        paramIndex++;
      }

      if (unidadeId) {
        query += ` AND a.fkunidadesaude = $${paramIndex}`;
        params.push(parseInt(unidadeId as string));
        paramIndex++;
      }

      if (leitoId) {
        query += ` AND a.fkleito = $${paramIndex}`;
        params.push(parseInt(leitoId as string));
        paramIndex++;
      }

      if (dataInicio) {
        query += ` AND a.dataentrada >= $${paramIndex}`;
        params.push(dataInicio);
        paramIndex++;
      }

      if (dataFim) {
        query += ` AND a.dataentrada <= $${paramIndex}`;
        params.push(dataFim);
        paramIndex++;
      }

      if (especialidadeId) {
        query += ` AND a.fkespecialidade = $${paramIndex}`;
        params.push(parseInt(especialidadeId as string));
        paramIndex++;
      }

      if (procedimentoId) {
        query += ` AND a.fkprocedimentosolicitado = $${paramIndex}`;
        params.push(parseInt(procedimentoId as string));
        paramIndex++;
      }

      query += ` ORDER BY a.dataentrada DESC LIMIT 100`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar pacientes internados:", error);
      res.status(500).json({ message: "Erro ao buscar pacientes internados" });
    }
  });

  // Indicadores
  app.get("/api/indicadores", async (req, res) => {
    try {
      const {
        medicoId,
        pacienteId,
        unidadeId,
        leitoId,
        dataInicio,
        dataFim,
        especialidadeId,
        procedimentoId,
      } = req.query;

      let baseWhere = `
        WHERE a.fktipoatendimento = 2
          AND a.datasaida IS NULL
          AND a.ativo = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (medicoId) {
        baseWhere += ` AND a.fkprofissionalatendimento = $${paramIndex}`;
        params.push(parseInt(medicoId as string));
        paramIndex++;
      }

      if (pacienteId) {
        baseWhere += ` AND a.fkpaciente = $${paramIndex}`;
        params.push(parseInt(pacienteId as string));
        paramIndex++;
      }

      if (unidadeId) {
        baseWhere += ` AND a.fkunidadesaude = $${paramIndex}`;
        params.push(parseInt(unidadeId as string));
        paramIndex++;
      }

      if (leitoId) {
        baseWhere += ` AND a.fkleito = $${paramIndex}`;
        params.push(parseInt(leitoId as string));
        paramIndex++;
      }

      if (dataInicio) {
        baseWhere += ` AND a.dataentrada >= $${paramIndex}`;
        params.push(dataInicio);
        paramIndex++;
      }

      if (dataFim) {
        baseWhere += ` AND a.dataentrada <= $${paramIndex}`;
        params.push(dataFim);
        paramIndex++;
      }

      if (especialidadeId) {
        baseWhere += ` AND a.fkespecialidade = $${paramIndex}`;
        params.push(parseInt(especialidadeId as string));
        paramIndex++;
      }

      if (procedimentoId) {
        baseWhere += ` AND a.fkprocedimentosolicitado = $${paramIndex}`;
        params.push(parseInt(procedimentoId as string));
        paramIndex++;
      }

      // Total de pacientes
      const totalQuery = `
        SELECT COUNT(*) as total
        FROM sotech.ate_atendimento a
        ${baseWhere}
      `;
      const totalResult = await pool.query(totalQuery, params);
      const totalPacientes = parseInt(totalResult.rows[0].total);

      // Média de dias internados
      const mediaQuery = `
        SELECT AVG(EXTRACT(DAY FROM (NOW() - a.dataentrada))) as media
        FROM sotech.ate_atendimento a
        ${baseWhere}
      `;
      const mediaResult = await pool.query(mediaQuery, params);
      const mediaDias = parseFloat(mediaResult.rows[0].media) || 0;

      // Taxa de ocupação (simplificado - total de pacientes / total de leitos ativos * 100)
      const leitosQuery = `SELECT COUNT(*) as total FROM sotech.cdg_leito WHERE ativo = true`;
      const leitosResult = await pool.query(leitosQuery);
      const totalLeitos = parseInt(leitosResult.rows[0].total) || 1;
      const ocupacaoLeitos = (totalPacientes / totalLeitos) * 100;

      // Distribuição por especialidades
      const especialidadesQuery = `
        SELECT 
          COALESCE(e.descricao, 'Sem especialidade') as especialidade,
          COUNT(*) as quantidade
        FROM sotech.ate_atendimento a
        LEFT JOIN sotech.tbn_especialidade e ON e.pkespecialidade = a.fkespecialidade
        ${baseWhere}
        GROUP BY e.descricao
        ORDER BY quantidade DESC
        LIMIT 5
      `;
      const especialidadesResult = await pool.query(especialidadesQuery, params);

      res.json({
        totalPacientes,
        mediaDias,
        ocupacaoLeitos,
        distribuicaoEspecialidades: especialidadesResult.rows,
      });
    } catch (error) {
      console.error("Erro ao buscar indicadores:", error);
      res.status(500).json({ message: "Erro ao buscar indicadores" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
