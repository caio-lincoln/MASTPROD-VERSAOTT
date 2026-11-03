-- =============================================================================
-- MASTPROD - 003: afastamento em aberto vindo do S-2230
-- =============================================================================

ALTER TABLE public.funcionarios
  ADD COLUMN IF NOT EXISTS afastamento_inicio DATE,
  ADD COLUMN IF NOT EXISTS afastamento_motivo TEXT;  -- código da Tabela 18 do eSocial
