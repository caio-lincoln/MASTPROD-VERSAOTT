-- =============================================================================
-- MASTPROD - 005: permite excluir empresa que já tem S-2240
--
-- ambiente_id e responsavel_id eram ON DELETE RESTRICT: ao excluir a empresa, a
-- cascata apagava o ambiente/responsável antes das exposições que apontam para eles
-- e a exclusão falhava. Com a verificação adiada para o fim da transação
-- (DEFERRABLE INITIALLY DEFERRED), a cascata completa funciona e continua proibido
-- apagar um ambiente ou responsável que ainda esteja em uso.
-- =============================================================================

ALTER TABLE public.exposicoes_trabalhador DROP CONSTRAINT IF EXISTS exposicoes_trabalhador_ambiente_id_fkey;
ALTER TABLE public.exposicoes_trabalhador
  ADD CONSTRAINT exposicoes_trabalhador_ambiente_id_fkey
  FOREIGN KEY (ambiente_id) REFERENCES public.ambientes_trabalho(id)
  ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.exposicao_responsaveis DROP CONSTRAINT IF EXISTS exposicao_responsaveis_responsavel_id_fkey;
ALTER TABLE public.exposicao_responsaveis
  ADD CONSTRAINT exposicao_responsaveis_responsavel_id_fkey
  FOREIGN KEY (responsavel_id) REFERENCES public.responsaveis_registros_ambientais(id)
  ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED;
