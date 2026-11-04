-- =============================================================================
-- MASTPROD - 006: vínculos (matrículas) do trabalhador
--
-- Uma pessoa (CPF) pode ter mais de um vínculo ativo na mesma empresa e várias
-- matrículas ao longo do tempo (readmissões). Os eventos de SST são por vínculo,
-- então cada matrícula tem seu próprio registro. funcionarios.matricula_esocial
-- continua existindo como o vínculo "principal" (o mais recente ativo).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.funcionario_vinculos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id     UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  empresa_id         UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  matricula          TEXT,             -- vazia para trabalhador sem vínculo (TSVE) sem matrícula
  cod_categoria      TEXT,
  cargo              TEXT,
  cbo                TEXT,
  data_admissao      DATE,
  data_desligamento  DATE,
  status             TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  origem             TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'esocial')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_funcionario_vinculos_chave
  ON public.funcionario_vinculos (funcionario_id, (coalesce(matricula, 'categ:' || coalesce(cod_categoria, ''))));
CREATE INDEX IF NOT EXISTS idx_funcionario_vinculos_empresa ON public.funcionario_vinculos (empresa_id, status);

DROP TRIGGER IF EXISTS trg_funcionario_vinculos_updated_at ON public.funcionario_vinculos;
CREATE TRIGGER trg_funcionario_vinculos_updated_at
  BEFORE UPDATE ON public.funcionario_vinculos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Vínculo inicial a partir do cadastro existente
INSERT INTO public.funcionario_vinculos
  (funcionario_id, empresa_id, matricula, cod_categoria, cargo, cbo, data_admissao, data_desligamento, status, origem)
SELECT f.id, f.empresa_id, f.matricula_esocial, f.cod_categoria, f.cargo, f.cbo, f.data_admissao, f.data_desligamento,
       CASE WHEN f.status = 'ativo' THEN 'ativo' ELSE 'inativo' END, f.origem
  FROM public.funcionarios f
 WHERE f.matricula_esocial IS NOT NULL OR f.cod_categoria IS NOT NULL
ON CONFLICT DO NOTHING;

-- A qual vínculo cada evento de SST se refere
ALTER TABLE public.exposicoes_trabalhador ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE public.asos ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS matricula TEXT;
