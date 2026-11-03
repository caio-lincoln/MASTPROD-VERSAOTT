-- =============================================================================
-- MASTPROD - 004: ASO (S-2220), CAT (S-2210) e histórico de eventos importados
-- =============================================================================

-- Monitoramento da saúde do trabalhador (S-2220). "dados" guarda o conteúdo do
-- evento no vocabulário do leiaute; as colunas soltas servem para listar e filtrar.
CREATE TABLE IF NOT EXISTS public.asos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  funcionario_id  UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  tp_exame_ocup   TEXT NOT NULL,      -- 0 admissional, 1 periódico, 2 retorno, 3 mudança de risco, 4 pontual, 9 demissional
  dt_aso          DATE NOT NULL,
  res_aso         TEXT,               -- 1 apto, 2 inapto
  medico_nome     TEXT,
  dados           JSONB NOT NULL,
  origem          TEXT NOT NULL DEFAULT 'mastprod' CHECK (origem IN ('mastprod', 'esocial')),
  created_by      UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asos_funcionario ON public.asos (funcionario_id, dt_aso DESC);
CREATE INDEX IF NOT EXISTS idx_asos_empresa ON public.asos (empresa_id, dt_aso DESC);

DROP TRIGGER IF EXISTS trg_asos_updated_at ON public.asos;
CREATE TRIGGER trg_asos_updated_at
  BEFORE UPDATE ON public.asos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Comunicação de acidente de trabalho (S-2210)
CREATE TABLE IF NOT EXISTS public.cats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  funcionario_id  UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  dt_acid         DATE NOT NULL,
  tp_acid         TEXT NOT NULL,      -- 1 típico, 2 doença, 3 trajeto
  tp_cat          TEXT NOT NULL,      -- 1 inicial, 2 reabertura, 3 óbito
  ind_obito       BOOLEAN NOT NULL DEFAULT FALSE,
  dados           JSONB NOT NULL,
  origem          TEXT NOT NULL DEFAULT 'mastprod' CHECK (origem IN ('mastprod', 'esocial')),
  created_by      UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cats_funcionario ON public.cats (funcionario_id, dt_acid DESC);
CREATE INDEX IF NOT EXISTS idx_cats_empresa ON public.cats (empresa_id, dt_acid DESC);

DROP TRIGGER IF EXISTS trg_cats_updated_at ON public.cats;
CREATE TRIGGER trg_cats_updated_at
  BEFORE UPDATE ON public.cats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Eventos vindos do download do eSocial ficam no histórico com o recibo original
ALTER TABLE public.esocial_eventos
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'mastprod' CHECK (origem IN ('mastprod', 'esocial'));

-- Um mesmo Id de evento não entra duas vezes (reimportação idempotente)
CREATE UNIQUE INDEX IF NOT EXISTS uq_esocial_eventos_id_evento
  ON public.esocial_eventos (empresa_id, id_evento) WHERE id_evento IS NOT NULL;

ALTER TABLE public.exposicoes_trabalhador
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'mastprod' CHECK (origem IN ('mastprod', 'esocial'));

-- respReg do S-2240 não traz o nome do responsável; o importador usa o CPF até alguém completar
ALTER TABLE public.exposicoes_trabalhador DROP CONSTRAINT IF EXISTS exposicoes_trabalhador_status_check;
ALTER TABLE public.exposicoes_trabalhador
  ADD CONSTRAINT exposicoes_trabalhador_status_check CHECK (status IN ('rascunho', 'pronto', 'enviado', 'erro', 'importado'));
