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

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    res.json(req.session.user);
  });

  // Endpoints protegidos - requerem autenticação
  app.use("/api/medicos", requireAuth);
  app.use("/api/pacientes", requireAuth);
  app.use("/api/unidades", requireAuth);
  app.use("/api/postos", requireAuth);
  app.use("/api/especialidades", requireAuth);
  app.use("/api/procedimentos", requireAuth);
  app.use("/api/pacientes-internados", requireAuth);
  app.use("/api/indicadores", requireAuth);

  // Listar médicos (intervenientes)
  app.get("/api/medicos", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT i.pkinterveniente as id, i.interveniente as nome 
         FROM sotech.cdg_interveniente i
         INNER JOIN sotech.ate_atendimento a ON a.fkprofissionalsolicitante = i.pkinterveniente OR a.fkprofissionalatendimento = i.pkinterveniente
         WHERE a.fktipoatendimento = 2
           AND a.datasaida IS NULL
           AND a.ativo = true
           AND i.ativo = true
         ORDER BY i.interveniente`
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
      const { search } = req.query; // Filtro de busca por nome
      let query = `
        SELECT DISTINCT p.pkpaciente as id, p.paciente as nome 
        FROM sotech.cdg_paciente p
        INNER JOIN sotech.ate_atendimento a ON a.fkpaciente = p.pkpaciente
        WHERE a.fktipoatendimento = 2
          AND a.datasaida IS NULL
          AND a.ativo = true
          AND p.ativo = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND LOWER(p.paciente) LIKE $${paramIndex}`;
        params.push(`%${(search as string).toLowerCase()}%`);
        paramIndex++;
      }

      query += ` ORDER BY p.paciente`;

      const result = await pool.query(query, params);
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
        `SELECT DISTINCT u.pkunidadesaude as id, u.unidadesaude as descricao 
         FROM sotech.cdg_unidadesaude u
         INNER JOIN sotech.ate_atendimento a ON a.fkunidadesaude = u.pkunidadesaude
         WHERE a.fktipoatendimento = 2
           AND a.datasaida IS NULL
           AND a.ativo = true
           AND u.ativo = true
         ORDER BY u.unidadesaude`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      res.status(500).json({ message: "Erro ao buscar unidades" });
    }
  });

  // Listar postos
  app.get("/api/postos", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT p.pkposto as id, p.posto as descricao 
         FROM sotech.cdg_posto p
         INNER JOIN sotech.cdg_enfermaria e ON e.fkposto = p.pkposto
         INNER JOIN sotech.cdg_leito l ON l.fkenfermaria = e.pkenfermaria
         INNER JOIN sotech.ate_atendimento a ON a.fkleito = l.pkleito
         WHERE a.fktipoatendimento = 2
           AND a.datasaida IS NULL
           AND a.ativo = true
           AND p.ativo = true
         ORDER BY p.posto`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar postos:", error);
      res.status(500).json({ message: "Erro ao buscar postos" });
    }
  });

  // Listar especialidades
  app.get("/api/especialidades", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT e.pkespecialidade as id, e.especialidade as descricao 
         FROM sotech.tbn_especialidade e
         INNER JOIN sotech.ate_atendimento a ON a.fkespecialidade = e.pkespecialidade
         WHERE a.fktipoatendimento = 2
           AND a.datasaida IS NULL
           AND a.ativo = true
           AND e.ativo = true
         ORDER BY e.especialidade`
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
        `SELECT DISTINCT 
           pr.pkprocedimento as id, 
           pr.procedimento as descricao, 
           pr.codprocedimento as codigo,
           tbn.diaspermanencia
         FROM sotech.tbl_procedimento pr
         INNER JOIN sotech.ate_atendimento a ON a.fkprocedimentosolicitado = pr.pkprocedimento
         LEFT JOIN sotech.tbn_procedimento tbn ON tbn.codprocedimento = pr.codprocedimento AND tbn.ativo = true
         WHERE a.fktipoatendimento = 2
           AND a.datasaida IS NULL
           AND a.ativo = true
           AND pr.ativo = true
         ORDER BY pr.procedimento`
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
        postoId,
        especialidadeId,
        procedimentoId,
      } = req.query;

      let query = `
        SELECT 
          a.pkatendimento,
          jsonb_build_object(
            'id', p.pkpaciente, 
            'nome', p.paciente,
            'dataNascimento', p.datanascimento,
            'sexo', s.sexo,
            'foto', p.foto
          ) as paciente,
          CASE 
            WHEN m.pkinterveniente IS NOT NULL 
            THEN jsonb_build_object('id', m.pkinterveniente, 'nome', m.interveniente)
            ELSE NULL
          END as medico,
          jsonb_build_object('id', u.pkunidadesaude, 'descricao', u.unidadesaude) as unidadeSaude,
          CASE 
            WHEN l.pkleito IS NOT NULL 
            THEN jsonb_build_object(
              'id', l.pkleito, 
              'numero', COALESCE(po.posto, '') || '.' || COALESCE(en.enfermaria, '') || '.' || COALESCE(l.codleito, ''),
              'descricao', l.codleito,
              'posto', jsonb_build_object('id', po.pkposto, 'descricao', po.posto),
              'enfermaria', jsonb_build_object('id', en.pkenfermaria, 'descricao', en.enfermaria)
            )
            ELSE NULL
          END as leito,
          CASE 
            WHEN e.pkespecialidade IS NOT NULL 
            THEN jsonb_build_object('id', e.pkespecialidade, 'descricao', e.especialidade)
            ELSE NULL
          END as especialidade,
          CASE 
            WHEN pr.pkprocedimento IS NOT NULL 
            THEN jsonb_build_object(
              'id', pr.pkprocedimento, 
              'descricao', pr.procedimento,
              'diaspermanencia', tbn.diaspermanencia
            )
            ELSE NULL
          END as procedimento,
          a.dataentrada as "dataEntrada",
          EXTRACT(DAY FROM (NOW() - a.dataentrada))::integer as "diasInternado",
          a.queixaprincipal as "queixaPrincipal",
          (
            SELECT jsonb_agg(jsonb_build_object(
              'id', lancamento.pkatendimentolancamento,
              'descricao', proc_lanc.procedimento,
              'quantidade', lancamento.quantidade,
              'datahora', lancamento.datahora
            ))
            FROM sotech.ate_atendimento_lancamento lancamento
            INNER JOIN sotech.tbl_procedimento proc_lanc ON proc_lanc.pkprocedimento = lancamento.fkprocedimento
            WHERE lancamento.fkatendimento = a.pkatendimento
              AND lancamento.status = 'S'
              AND proc_lanc.codprocedimento NOT LIKE '0202%'
          ) as "procedimentosLancados",
          (
            SELECT COUNT(*)::integer
            FROM sotech.ate_atendimento_lancamento lancamento
            INNER JOIN sotech.tbl_procedimento proc_lanc ON proc_lanc.pkprocedimento = lancamento.fkprocedimento
            WHERE lancamento.fkatendimento = a.pkatendimento
              AND lancamento.status = 'S'
              AND proc_lanc.codprocedimento LIKE '0202%'
          ) as "quantidadeExamesAnatomia",
          u.unidadesaude as unidade_ordem,
          po.posto as posto_ordem,
          en.enfermaria as enfermaria_ordem,
          l.codleito as leito_ordem
        FROM sotech.ate_atendimento a
        INNER JOIN sotech.cdg_paciente p ON p.pkpaciente = a.fkpaciente
        LEFT JOIN sotech.tbl_sexo s ON s.pksexo = p.fksexo
        INNER JOIN sotech.cdg_unidadesaude u ON u.pkunidadesaude = a.fkunidadesaude
        LEFT JOIN sotech.cdg_interveniente m ON m.pkinterveniente = a.fkprofissionalsolicitante
        LEFT JOIN sotech.cdg_leito l ON l.pkleito = a.fkleito
        LEFT JOIN sotech.cdg_enfermaria en ON en.pkenfermaria = l.fkenfermaria
        LEFT JOIN sotech.cdg_posto po ON po.pkposto = en.fkposto
        LEFT JOIN sotech.tbn_especialidade e ON e.pkespecialidade = a.fkespecialidade
        LEFT JOIN sotech.tbl_procedimento pr ON pr.pkprocedimento = a.fkprocedimentosolicitado
        LEFT JOIN sotech.tbn_procedimento tbn ON tbn.codprocedimento = pr.codprocedimento AND tbn.ativo = true
        WHERE a.fktipoatendimento = 2
          AND a.datasaida IS NULL
          AND a.ativo = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (medicoId) {
        query += ` AND (a.fkprofissionalatendimento = $${paramIndex} OR a.fkprofissionalsolicitante = $${paramIndex})`;
        const id = parseInt(medicoId as string);
        if (isNaN(id)) return res.status(400).json({ message: "ID do médico inválido" });
        params.push(id);
        paramIndex++;
      }

      if (pacienteId) {
        query += ` AND a.fkpaciente = $${paramIndex}`;
        const id = parseInt(pacienteId as string);
        if (isNaN(id)) return res.status(400).json({ message: "ID do paciente inválido" });
        params.push(id);
        paramIndex++;
      }

      if (unidadeId) {
        query += ` AND a.fkunidadesaude = $${paramIndex}`;
        const id = parseInt(unidadeId as string);
        if (isNaN(id)) return res.status(400).json({ message: "ID da unidade inválido" });
        params.push(id);
        paramIndex++;
      }

      if (postoId) {
        query += ` AND po.pkposto = $${paramIndex}`;
        const id = parseInt(postoId as string);
        if (isNaN(id)) return res.status(400).json({ message: "ID do posto inválido" });
        params.push(id);
        paramIndex++;
      }

      if (especialidadeId) {
        query += ` AND a.fkespecialidade = $${paramIndex}`;
        const id = parseInt(especialidadeId as string);
        if (isNaN(id)) return res.status(400).json({ message: "ID da especialidade inválido" });
        params.push(id);
        paramIndex++;
      }

      if (procedimentoId) {
        query += ` AND a.fkprocedimentosolicitado = $${paramIndex}`;
        const id = parseInt(procedimentoId as string);
        if (isNaN(id)) return res.status(400).json({ message: "ID do procedimento inválido" });
        params.push(id);
        paramIndex++;
      }

      query += ` ORDER BY u.unidadesaude, po.posto, en.enfermaria, l.codleito LIMIT 100`;

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
        postoId,
        especialidadeId,
        procedimentoId,
      } = req.query;

      let baseWhere = `
        WHERE a.fktipoatendimento = 2
          AND a.datasaida IS NULL
          AND a.ativo = true
      `;

      let baseJoin = `
        FROM sotech.ate_atendimento a
        LEFT JOIN sotech.cdg_leito l ON l.pkleito = a.fkleito
        LEFT JOIN sotech.cdg_enfermaria en ON en.pkenfermaria = l.fkenfermaria
        LEFT JOIN sotech.cdg_posto po ON po.pkposto = en.fkposto
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (medicoId) {
        baseWhere += ` AND (a.fkprofissionalatendimento = $${paramIndex} OR a.fkprofissionalsolicitante = $${paramIndex})`;
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

      if (postoId) {
        baseWhere += ` AND po.pkposto = $${paramIndex}`;
        params.push(parseInt(postoId as string));
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
        ${baseJoin}
        ${baseWhere}
      `;
      const totalResult = await pool.query(totalQuery, params);
      const totalPacientes = parseInt(totalResult.rows[0].total);

      // Média de dias internados
      const mediaQuery = `
        SELECT AVG(EXTRACT(DAY FROM (NOW() - a.dataentrada))) as media
        ${baseJoin}
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
          COALESCE(e.especialidade, 'Sem especialidade') as especialidade,
          COUNT(*) as quantidade
        FROM sotech.ate_atendimento a
        LEFT JOIN sotech.cdg_leito l ON l.pkleito = a.fkleito
        LEFT JOIN sotech.cdg_enfermaria en ON en.pkenfermaria = l.fkenfermaria
        LEFT JOIN sotech.cdg_posto po ON po.pkposto = en.fkposto
        LEFT JOIN sotech.tbn_especialidade e ON e.pkespecialidade = a.fkespecialidade
        ${baseWhere}
        GROUP BY e.especialidade
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