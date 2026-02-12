Painel de Monitoramento de Pacientes

## Visão Geral

Este é um aplicativo de painel de controle para monitoramento de pacientes hospitalizados. O sistema oferece visibilidade em tempo real das admissões de pacientes, exibindo indicadores-chave e permitindo que a equipe médica filtre e acompanhe pacientes em diferentes departamentos, especialidades e procedimentos. Desenvolvido como um aplicativo web responsivo, ele atende profissionais de saúde que precisam de acesso rápido aos dados dos pacientes em computadores, tablets e dispositivos móveis.

O aplicativo se conecta a um banco de dados PostgreSQL existente com esquemas de dados de saúde estabelecidos e fornece uma interface simplificada para visualização de informações do paciente sem modificar a estrutura subjacente do banco de dados.

**Status Atual:** ✅ Totalmente operacional com 246 pacientes hospitalizados sendo monitorados. Todos os recursos foram testados e estão funcionando: autenticação, filtros dinâmicos, indicadores em tempo real (média de permanência de 161,6 dias, 43% de ocupação de leitos) e lista de pacientes responsiva.

## Preferências do Usuário

Estilo de comunicação preferido: Linguagem simples e cotidiana.

## Arquitetura do Sistema

### Arquitetura do Frontend

**Framework:** React com TypeScript, utilizando Vite como ferramenta de build e servidor de desenvolvimento.

**Sistema de Componentes da Interface do Usuário:** Shadcn/ui (variante no estilo New York) construído sobre primitivas de interface do usuário Radix, fornecendo uma biblioteca de componentes acessível e pré-estilizada. Os componentes utilizam Tailwind CSS para estilização, com um sistema de design focado na área da saúde, enfatizando clareza e estética profissional.

**Gerenciamento de Estado:** TanStack Query (React Query) gerencia o estado do servidor, a busca de dados e o cache. Não é necessário gerenciamento de estado global no cliente, pois o aplicativo é focado principalmente na exibição de dados, e não em estado.

**Roteamento:** Wouter fornece roteamento leve no lado do cliente com duas rotas principais: página de login e painel de controle.

**Manipulação de Formulários:** React Hook Form com validação de esquema Zod garante o envio de formulários com segurança de tipos, especialmente para autenticação.

**Design Responsivo:** Abordagem mobile-first utilizando breakpoints responsivos do Tailwind. O layout se adapta de cartões empilhados em coluna única em dispositivos móveis para grades de múltiplas colunas e tabelas completas em desktops.

### Arquitetura de Backend

**Ambiente de Execução:** Node.js com Express.js para lidar com requisições HTTP.

**Acesso ao Banco de Dados:** Conexão direta com PostgreSQL usando o pool de conexões da biblioteca `pg`. As consultas são escritas em SQL puro, em vez de usar um ORM, proporcionando controle direto sobre consultas complexas de dados da área da saúde.

**Design da API:** Endpoints RESTful retornando JSON. Os principais endpoints incluem:
- `/api/auth/login` e `/api/auth/logout` para autenticação
- `/api/pacientes-internados` para buscar pacientes internados com parâmetros de consulta opcionais para filtragem
- `/api/indicadores` para métricas do painel de controle
- Endpoints de dados de referência (`/api/medicos`, `/api/unidades`, `/api/leitos`, `/api/especialidades`, `/api/procedimentos`) para preencher menus suspensos de filtro

**Definição de Esquema:** As definições de esquema do Drizzle ORM em `shared/schema.ts` servem como definições de tipo TypeScript e documentação da estrutura do banco de dados, mas não são usadas para migrações ou modificações no banco de dados, visto que o banco de dados já existe.

### Configuração do Ambiente

Para rodar a aplicação localmente, é necessário configurar as variáveis de ambiente:

1.  Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como referência).
2.  Preencha as seguintes variáveis:
    -   `DATABASE_URL`: URL de conexão com o PostgreSQL (ex: `postgres://user:pass@host:5432/db`).
    -   `SESSION_SECRET`: Uma chave aleatória para assinar as sessões do navegador.
    -   `ADMIN_USERNAME` / `ADMIN_PASSWORD`: Credenciais para o perfil de administrador.
    -   `OPERADOR_USERNAME` / `OPERADOR_PASSWORD`: Credenciais para o perfil de operador.

O arquivo `.env` está incluído no `.gitignore` para garantir que suas credenciais nunca sejam enviadas para o repositório.

### Soluções de Armazenamento de Dados

**Banco de Dados:** PostgreSQL acessado via variável de ambiente no arquivo `.env` para produção.

**Tabelas e Mapeamentos de Colunas Principais:**
- `sotech.ate_atendimento` - Tabela principal de admissões/atendimento de pacientes (fktipoatendimento=2 para pacientes internados, datasaida IS NULL para pacientes atuais)
- `sotech.cdg_paciente` - Dados demográficos do paciente (coluna: `paciente` para nome)
- `sotech.cdg_interveniente` - Profissionais de saúde/médicos (coluna: `interveniente` para nome)
- `sotech.cdg_unidadesaude` - Unidades/instalações de saúde (coluna: `unidadesaude` para nome)
- `sotech.cdg_leito` - Atribuições de leito/quarto (coluna: `codleito` para número do leito)
- `sotech.tbn_especialidade` - Especialidades médicas (coluna: `especialidade` para nome)
- `sotech.tbl_procedimento` - Procedimentos médicos (coluna: `procedimento` para nome, (para o código: `codprocedimento`)

**Armazenamento de Sessão:** Sessões do Express armazenadas em memória (por padrão, MemoryStore). Para produção, isso deve ser substituído por um armazenamento de sessão persistente, como o connect-pg-simple com PostgreSQL ou Redis.

### Autenticação e Autorização

**Mecanismo:** Autenticação baseada em sessão com cookies somente HTTP. As credenciais do usuário são validadas em relação à lista de usuários codificada em `server/auth.ts`.

**Funções do Usuário:** Duas funções definidas - "admin" e "operador" (operador) - embora o controle de acesso baseado em funções não seja atualmente aplicado além do requisito de autenticação.

**Configuração de Sessão:** Tempo de vida da sessão de 24 horas, cookies seguros habilitados em produção, sessões apagadas ao fazer logout.

**Configuração de Segurança:**

O sistema implementa diversas camadas de proteção:
- **Helmet**: Proteção de headers HTTP contra Clickjacking e XSS.
- **Rate Limiting**: Limite de 100 requisições por 15 minutos para evitar força bruta.
- **Bcrypt**: Hashing de senhas para armazenamento seguro.
- **Sanitização**: Validação rigorosa de inputs com Zod e filtragem de tipos.

## Deployment e Operação

### Docker (Recomendado para Produção)

O projeto está containerizado para garantir consistência entre ambientes.

1. **Build e Execução Local:**
   ```bash
   docker-compose up --build
   ```

2. **Arquivos de Configuração:**
   - [Dockerfile](file:///c:/Users/Robson%20Sena/Documents/Internados-arc/Dockerfile): Multi-stage build para imagem leve (node:slim).
   - [docker-compose.yml](file:///c:/Users/Robson%20Sena/Documents/Internados-arc/docker-compose.yml): Orquestração do serviço da aplicação.
   - [.dockerignore](file:///c:/Users/Robson%20Sena/Documents/Internados-arc/.dockerignore): Exclusão de arquivos desnecessários.

### Guia de Deployment no Servidor (144.22.174.109)

1. **Acesso SSH:**
   Utilize a chave privada fornecida:
   ```powershell
   ssh -i "C:\Users\Robson Sena\Documents\ISFat\database\ssh\ssh-key-2026-01-30.key" ubuntu@144.22.174.109
   ```

2. **Infraestrutura no Servidor:**
   - **Nginx**: Atua como proxy reverso na porta 80/443. Ver arquivo [nginx.conf](file:///c:/Users/Robson%20Sena/Documents/Internados-arc/nginx.conf).
   - **SSL**: Certificados Let's Encrypt via Certbot.
   - **Firewall**: Portas permitidas: 80 (HTTP), 443 (HTTPS), 22 (SSH).

3. **Automação de Deploy:**
   Utilize o script [deploy_manual.ps1](file:///c:/Users/Robson%20Sena/Documents/Internados-arc/deploy_manual.ps1) para automatizar todo o processo:
   - Commit e Push automático.
   - Atualização remota do código.
   - Rebuild dos containers Docker.
   - Health check pós-deploy.

## Troubleshooting e Manutenção

- **Logs do Sistema**: `docker logs internados-app -f`
- **Backup**: O banco de dados é externo, realize backups periódicos via `pg_dump`.
- **Manutenção**: Atualizações semanais de pacotes via `npm update` e verificação de segurança com `npm audit`.