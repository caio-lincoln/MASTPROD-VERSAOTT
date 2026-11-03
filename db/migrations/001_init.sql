-- =============================================================================
-- MASTPROD - 001: schema inicial (PostgreSQL 14+, local ou Railway)
-- Aplicado por: npm run db:migrate
-- O controle de acesso por empresa é feito na camada de API (lib/server/access.ts).
-- =============================================================================

-- =============================================================================
-- 1. EXTENSÕES E FUNÇÕES UTILITÁRIAS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- 0. USUÁRIOS DE ACESSO
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  nome        TEXT NOT NULL,
  senha_hash  TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),  -- admin vê todas as empresas
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON public.app_users;
CREATE TRIGGER trg_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 2. EMPRESAS E VÍNCULO USUÁRIO-EMPRESA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.empresas (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social              TEXT NOT NULL,
  cnpj                      TEXT NOT NULL UNIQUE,          -- CNPJ ou CPF (empregador pessoa física)
  cnae                      TEXT,
  status                    TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  atividade_principal       TEXT,
  endereco                  TEXT,
  cidade                    TEXT,
  estado                    TEXT,
  telefone                  TEXT,
  email                     TEXT,
  responsavel               TEXT,
  origem                    TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'esocial')),
  importada                 BOOLEAN NOT NULL DEFAULT FALSE,
  user_id                   UUID REFERENCES public.app_users(id) ON DELETE SET NULL, -- quem cadastrou

  -- S-1000 (Informações do Empregador)
  natureza_juridica         TEXT,
  classificacao_tributaria  TEXT,
  inicio_validade           DATE,
  ind_coop                  BOOLEAN DEFAULT FALSE,
  ind_constr                BOOLEAN DEFAULT FALSE,
  ind_des_folha             BOOLEAN DEFAULT FALSE,
  ind_ent_ed                BOOLEAN DEFAULT FALSE,
  ind_ett                   BOOLEAN DEFAULT FALSE,
  ind_prod_rural            BOOLEAN DEFAULT FALSE,
  ind_pps                   BOOLEAN DEFAULT FALSE,
  ind_cpf                   BOOLEAN DEFAULT FALSE,
  ind_opt_reg_eletron       TEXT CHECK (ind_opt_reg_eletron IN ('0', '1')),

  -- Situação no eSocial
  esocial_status            TEXT DEFAULT 'NAO_REGISTRADO',  -- NAO_REGISTRADO | REGISTRADO
  esocial_protocolo         TEXT,
  esocial_recibo            TEXT,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_empresas_updated_at ON public.empresas;
CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bloqueia edição/exclusão de empresas importadas do eSocial.
-- (A versão antiga retornava OLD no UPDATE, o que descartava silenciosamente
--  toda edição de empresa. Agora retorna NEW no UPDATE.)
CREATE OR REPLACE FUNCTION public.check_company_import_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.importada = TRUE AND OLD.origem = 'esocial' THEN
    RAISE EXCEPTION 'Não é permitido editar ou excluir empresas importadas do eSocial.';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_imported_company_modification ON public.empresas;
CREATE TRIGGER prevent_imported_company_modification
  BEFORE UPDATE OR DELETE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.check_company_import_status();

CREATE TABLE IF NOT EXISTS public.usuarios_empresas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'user', 'member', 'viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, empresa_id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_empresas_empresa ON public.usuarios_empresas (empresa_id);



-- =============================================================================
-- 3. CADASTROS SST
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.funcionarios (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id         UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome               TEXT NOT NULL,
  cpf                TEXT NOT NULL,
  data_nascimento    DATE,
  email              TEXT,
  telefone           TEXT,
  cargo              TEXT,
  departamento       TEXT,
  data_admissao      DATE,
  endereco           TEXT,
  status             TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),

  -- Identificação do vínculo no eSocial (ideVinculo do S-2210/S-2220/S-2240).
  -- A matrícula precisa ser IDÊNTICA à enviada no S-2200 pela folha/contabilidade.
  matricula_esocial  TEXT,
  cod_categoria      TEXT,          -- usado quando não há matrícula (TSVE sem S-2300), Tabela 01
  cbo                TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (empresa_id, cpf)
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON public.funcionarios (empresa_id);

DROP TRIGGER IF EXISTS trg_funcionarios_updated_at ON public.funcionarios;
CREATE TRIGGER trg_funcionarios_updated_at
  BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.epis (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id             UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome                   TEXT NOT NULL,
  tipo_protecao          TEXT,
  certificado_aprovacao  TEXT,       -- número do CA (docAval no S-2240)
  fabricante             TEXT,
  qtd_estoque            INTEGER NOT NULL DEFAULT 0,
  qtd_minima             INTEGER NOT NULL DEFAULT 0,
  validade               DATE,
  descricao              TEXT,
  status                 TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cancelado')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_epis_empresa ON public.epis (empresa_id);

DROP TRIGGER IF EXISTS trg_epis_updated_at ON public.epis;
CREATE TRIGGER trg_epis_updated_at
  BEFORE UPDATE ON public.epis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.treinamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  funcionario_id  UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  status          TEXT NOT NULL DEFAULT 'agendado'
                  CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado',
                                    'novo', 'iniciado', 'reagendado')),
  tipo_acao       TEXT,
  data_inicio     TIMESTAMPTZ,
  data_fim        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treinamentos_empresa ON public.treinamentos (empresa_id);

DROP TRIGGER IF EXISTS trg_treinamentos_updated_at ON public.treinamentos;
CREATE TRIGGER trg_treinamentos_updated_at
  BEFORE UPDATE ON public.treinamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.riscos_ocupacionais (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id          UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome_risco          TEXT NOT NULL,
  severidade          TEXT,
  tipo                TEXT,
  probabilidade       TEXT,
  descricao           TEXT,
  fonte_geradora      TEXT,
  consequencias       TEXT,
  setor               TEXT,
  medidas_controle    TEXT,
  data_identificacao  DATE DEFAULT CURRENT_DATE,
  responsavel         TEXT,
  status              TEXT NOT NULL DEFAULT 'ativo',
  cod_agente_nocivo   TEXT,          -- código da Tabela 24 do eSocial, quando aplicável
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_riscos_empresa ON public.riscos_ocupacionais (empresa_id);

DROP TRIGGER IF EXISTS trg_riscos_updated_at ON public.riscos_ocupacionais;
CREATE TRIGGER trg_riscos_updated_at
  BEFORE UPDATE ON public.riscos_ocupacionais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.biblioteca_documentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id       UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome_arquivo     TEXT NOT NULL,
  tipo             TEXT,
  categoria        TEXT,
  versao           TEXT,
  descricao        TEXT,
  tamanho          BIGINT,           -- bytes
  data_upload      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enviado_por      UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  mime_type        TEXT,
  conteudo         BYTEA,            -- arquivo armazenado no próprio banco
  caminho_storage  TEXT,             -- legado (Supabase Storage)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biblioteca_empresa ON public.biblioteca_documentos (empresa_id);


-- =============================================================================
-- 4. CERTIFICADOS DIGITAIS A1
-- =============================================================================

-- O .pfx + senha ficam cifrados com AES-256-GCM (ESOCIAL_CERT_ENCRYPTION_KEY,
-- só no servidor) em pfx_base64_encrypted. Nunca é devolvido ao navegador.
CREATE TABLE IF NOT EXISTS public.certificates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  pfx_storage_path      TEXT,
  pfx_base64_encrypted  TEXT,
  fingerprint           TEXT,
  valid_from            TIMESTAMPTZ,
  valid_to              TIMESTAMPTZ,
  created_by            UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_certificates (
  company_id      UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  certificate_id  UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (company_id, certificate_id)
);

-- No máximo um certificado padrão por empresa
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_certificates_default
  ON public.company_certificates (company_id) WHERE is_default;


-- =============================================================================
-- 5. ESOCIAL
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.esocial_eventos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  funcionario_id  UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  tipo_evento     TEXT NOT NULL,     -- 'S-1000', 'S-1005', 'S-2210', 'S-2220', 'S-2240', 'S-3000'...
  referencia_id   UUID,              -- registro de origem (ex.: exposicoes_trabalhador.id para S-2240)
  id_evento       TEXT,              -- atributo Id do XML (36 caracteres)
  ind_retif       TEXT DEFAULT '1' CHECK (ind_retif IN ('1', '2')),  -- 1=original, 2=retificação
  nr_recibo_retif TEXT,              -- recibo do evento original, quando retificação
  xml_envio       TEXT,
  xml_retorno     TEXT,
  protocolo       TEXT,
  recibo          TEXT,
  mensagem_erro   TEXT,
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'processando', 'enviado', 'processado', 'erro', 'rejeitado')),
  certificate_id  UUID REFERENCES public.certificates(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esocial_eventos_empresa ON public.esocial_eventos (empresa_id, tipo_evento);
CREATE INDEX IF NOT EXISTS idx_esocial_eventos_funcionario ON public.esocial_eventos (funcionario_id);
CREATE INDEX IF NOT EXISTS idx_esocial_eventos_status ON public.esocial_eventos (status);

DROP TRIGGER IF EXISTS trg_esocial_eventos_updated_at ON public.esocial_eventos;
CREATE TRIGGER trg_esocial_eventos_updated_at
  BEFORE UPDATE ON public.esocial_eventos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.esocial_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id              UUID REFERENCES public.esocial_eventos(id) ON DELETE CASCADE,
  event_type            TEXT,
  environment           TEXT,
  endpoint              TEXT,
  cert_subject          TEXT,
  cert_issuer           TEXT,
  cert_valid_from       TEXT,
  cert_valid_to         TEXT,
  comm_package_version  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esocial_logs_event ON public.esocial_logs (event_id);


-- =============================================================================
-- 6. S-2240 - CONDIÇÕES AMBIENTAIS DO TRABALHO
--    Estrutura espelha o leiaute evtExpRisco (S-1.2/S-1.3).
-- =============================================================================

-- Responsáveis pelos registros ambientais (respReg): engenheiro / técnico / médico
CREATE TABLE IF NOT EXISTS public.responsaveis_registros_ambientais (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  cpf         TEXT NOT NULL,         -- cpfResp
  ide_oc      TEXT CHECK (ide_oc IN ('1', '4', '9')),  -- 1=CRM, 4=CREA, 9=Outros
  dsc_oc      TEXT,                  -- descrição do órgão quando ide_oc = 9
  nr_oc       TEXT,                  -- número de inscrição no conselho
  uf_oc       TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (empresa_id, cpf)
);

DROP TRIGGER IF EXISTS trg_resp_reg_updated_at ON public.responsaveis_registros_ambientais;
CREATE TRIGGER trg_resp_reg_updated_at
  BEFORE UPDATE ON public.responsaveis_registros_ambientais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ambientes de trabalho (infoAmb)
CREATE TABLE IF NOT EXISTS public.ambientes_trabalho (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  local_amb   TEXT NOT NULL DEFAULT '1' CHECK (local_amb IN ('1', '2')),  -- 1=estab. próprio, 2=de terceiros
  dsc_setor   TEXT NOT NULL,
  tp_insc     TEXT NOT NULL DEFAULT '1' CHECK (tp_insc IN ('1', '3', '4')), -- 1=CNPJ, 3=CAEPF, 4=CNO
  nr_insc     TEXT NOT NULL,         -- inscrição do estabelecimento onde fica o ambiente
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambientes_empresa ON public.ambientes_trabalho (empresa_id);

DROP TRIGGER IF EXISTS trg_ambientes_updated_at ON public.ambientes_trabalho;
CREATE TRIGGER trg_ambientes_updated_at
  BEFORE UPDATE ON public.ambientes_trabalho
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Exposição do trabalhador (um registro = um evento S-2240)
CREATE TABLE IF NOT EXISTS public.exposicoes_trabalhador (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  funcionario_id    UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  ambiente_id       UUID NOT NULL REFERENCES public.ambientes_trabalho(id) ON DELETE RESTRICT,
  dt_ini_condicao   DATE NOT NULL,
  dt_fim_condicao   DATE,
  dsc_ativ_des      TEXT NOT NULL,   -- descrição das atividades desempenhadas
  obs_compl         TEXT,
  status            TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pronto', 'enviado', 'erro')),
  created_by        UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (dt_fim_condicao IS NULL OR dt_fim_condicao >= dt_ini_condicao)
);

CREATE INDEX IF NOT EXISTS idx_exposicoes_funcionario ON public.exposicoes_trabalhador (funcionario_id);
CREATE INDEX IF NOT EXISTS idx_exposicoes_empresa ON public.exposicoes_trabalhador (empresa_id);

DROP TRIGGER IF EXISTS trg_exposicoes_updated_at ON public.exposicoes_trabalhador;
CREATE TRIGGER trg_exposicoes_updated_at
  BEFORE UPDATE ON public.exposicoes_trabalhador
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Agentes nocivos da exposição (agNoc + epcEpi)
CREATE TABLE IF NOT EXISTS public.exposicao_agentes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exposicao_id    UUID NOT NULL REFERENCES public.exposicoes_trabalhador(id) ON DELETE CASCADE,
  risco_id        UUID REFERENCES public.riscos_ocupacionais(id) ON DELETE SET NULL,
  cod_ag_noc      TEXT NOT NULL,     -- Tabela 24 (ex.: 02.01.001 ruído; 09.01.001 ausência de agente)
  dsc_ag_noc      TEXT,
  tp_aval         TEXT CHECK (tp_aval IN ('1', '2')),  -- 1=quantitativo, 2=qualitativo
  int_conc        NUMERIC(14, 4),    -- intensidade/concentração
  lim_tol         NUMERIC(14, 4),    -- limite de tolerância
  un_med          TEXT,              -- Tabela de unidades de medida do leiaute
  tec_medicao     TEXT,
  nr_proc_jud     TEXT,

  -- epcEpi
  utiliz_epc      TEXT CHECK (utiliz_epc IN ('0', '1', '2')),  -- 0=não se aplica, 1=não implementa, 2=implementa
  efic_epc        TEXT CHECK (efic_epc IN ('S', 'N')),
  utiliz_epi      TEXT CHECK (utiliz_epi IN ('0', '1', '2')),
  efic_epi        TEXT CHECK (efic_epi IN ('S', 'N')),

  -- epiCompl (requisitos da NR-06 / NR-09)
  med_protecao    TEXT CHECK (med_protecao IN ('S', 'N')),
  cond_functo     TEXT CHECK (cond_functo IN ('S', 'N')),
  uso_inint       TEXT CHECK (uso_inint IN ('S', 'N')),
  przo_valid      TEXT CHECK (przo_valid IN ('S', 'N')),
  periodic_troca  TEXT CHECK (periodic_troca IN ('S', 'N')),
  higienizacao    TEXT CHECK (higienizacao IN ('S', 'N')),

  ordem           INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exposicao_agentes_exposicao ON public.exposicao_agentes (exposicao_id);

-- EPIs informados por agente (epi/docAval = número do CA)
CREATE TABLE IF NOT EXISTS public.exposicao_agente_epis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id   UUID NOT NULL REFERENCES public.exposicao_agentes(id) ON DELETE CASCADE,
  epi_id      UUID REFERENCES public.epis(id) ON DELETE SET NULL,
  doc_aval    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exposicao_agente_epis_agente ON public.exposicao_agente_epis (agente_id);

-- Responsáveis vinculados à exposição (respReg, 1..9 por evento)
CREATE TABLE IF NOT EXISTS public.exposicao_responsaveis (
  exposicao_id    UUID NOT NULL REFERENCES public.exposicoes_trabalhador(id) ON DELETE CASCADE,
  responsavel_id  UUID NOT NULL REFERENCES public.responsaveis_registros_ambientais(id) ON DELETE RESTRICT,
  PRIMARY KEY (exposicao_id, responsavel_id)
);

-- =============================================================================
-- 7. VIEW DO DASHBOARD
-- =============================================================================

CREATE OR REPLACE VIEW public.dashboard_metricas_por_empresa AS
SELECT
  e.id AS empresa_id,
  e.razao_social,
  (SELECT count(*) FROM public.funcionarios f
     WHERE f.empresa_id = e.id AND f.status = 'ativo')                                   AS total_funcionarios,
  (SELECT count(*) FROM public.treinamentos t
     WHERE t.empresa_id = e.id
       AND t.status IN ('agendado', 'em_andamento', 'novo', 'iniciado', 'reagendado'))   AS total_treinamentos_ativos,
  (SELECT count(*) FROM public.epis epi
     WHERE epi.empresa_id = e.id AND epi.status = 'ativo')                               AS total_epis_cadastrados,
  (SELECT count(*) FROM public.riscos_ocupacionais r
     WHERE r.empresa_id = e.id)                                                          AS total_riscos_identificados
FROM public.empresas e;
