-- =============================================================================
-- MASTPROD - 002: importação de trabalhadores a partir dos XMLs do eSocial
-- =============================================================================

ALTER TABLE public.funcionarios
  ADD COLUMN IF NOT EXISTS sexo                   TEXT,
  ADD COLUMN IF NOT EXISTS data_desligamento      DATE,
  ADD COLUMN IF NOT EXISTS origem                 TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'esocial')),
  ADD COLUMN IF NOT EXISTS esocial_sincronizado_em TIMESTAMPTZ;

-- Estabelecimentos do empregador (S-1005): usados como local do ambiente no S-2240
CREATE TABLE IF NOT EXISTS public.estabelecimentos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tp_insc     TEXT NOT NULL,          -- 1=CNPJ, 3=CAEPF, 4=CNO
  nr_insc     TEXT NOT NULL,
  cnae_prep   TEXT,
  ini_valid   TEXT,                   -- AAAA-MM
  fim_valid   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (empresa_id, tp_insc, nr_insc)
);

DROP TRIGGER IF EXISTS trg_estabelecimentos_updated_at ON public.estabelecimentos;
CREATE TRIGGER trg_estabelecimentos_updated_at
  BEFORE UPDATE ON public.estabelecimentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Histórico das importações (auditoria)
CREATE TABLE IF NOT EXISTS public.esocial_importacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  arquivos    TEXT[] NOT NULL DEFAULT '{}',
  resumo      JSONB NOT NULL,
  created_by  UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esocial_importacoes_empresa ON public.esocial_importacoes (empresa_id, created_at DESC);
