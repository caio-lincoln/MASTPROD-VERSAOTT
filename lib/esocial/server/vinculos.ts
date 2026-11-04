import "server-only"
import type { PoolClient } from "pg"
import type { TrabalhadorImportado } from "../import/parser"

const onlyDigits = (v: string | null | undefined) => String(v ?? "").replace(/\D/g, "")

/**
 * Grava os vínculos (matrículas) vindos da importação e recalcula o resumo de cada
 * trabalhador: ativo se tiver algum vínculo ativo; matrícula/admissão/cargo do vínculo
 * ativo mais recente. Desligamento só altera o vínculo da própria matrícula.
 */
export async function sincronizarVinculos(client: PoolClient, empresaId: string, trabalhadores: TrabalhadorImportado[]) {
  if (!trabalhadores.length) return
  const { rows } = await client.query<{ id: string; cpf: string }>(
    "SELECT id, cpf FROM funcionarios WHERE empresa_id = $1 AND cpf = ANY($2::text[])",
    [empresaId, trabalhadores.map((w) => w.cpf)]
  )
  const idPorCpf = new Map(rows.map((r) => [onlyDigits(r.cpf), r.id]))
  const tocados: string[] = []

  for (const w of trabalhadores) {
    const funcionarioId = idPorCpf.get(w.cpf)
    if (!funcionarioId) continue
    tocados.push(funcionarioId)

    for (const v of w.vinculos) {
      if (!v.matricula && !v.codCategoria) continue
      await client.query(
        `INSERT INTO funcionario_vinculos
           (funcionario_id, empresa_id, matricula, cod_categoria, cargo, cbo, data_admissao, data_desligamento, status, origem)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'esocial')
         ON CONFLICT (funcionario_id, (coalesce(matricula, 'categ:' || coalesce(cod_categoria, '')))) DO UPDATE SET
           cod_categoria = COALESCE(EXCLUDED.cod_categoria, funcionario_vinculos.cod_categoria),
           cargo = COALESCE(EXCLUDED.cargo, funcionario_vinculos.cargo),
           cbo = COALESCE(EXCLUDED.cbo, funcionario_vinculos.cbo),
           data_admissao = COALESCE(EXCLUDED.data_admissao, funcionario_vinculos.data_admissao),
           data_desligamento = CASE WHEN $10 THEN EXCLUDED.data_desligamento
                                    WHEN $11 THEN NULL
                                    ELSE funcionario_vinculos.data_desligamento END,
           status = CASE WHEN $10 AND EXCLUDED.data_desligamento IS NOT NULL THEN 'inativo'
                         WHEN $11 THEN 'ativo'
                         ELSE funcionario_vinculos.status END`,
        [
          funcionarioId,
          empresaId,
          v.matricula,
          v.codCategoria,
          v.cargo,
          v.cbo,
          v.dataAdmissao,
          v.dataDesligamento,
          v.dataDesligamento ? "inativo" : "ativo",
          v.temFim,
          v.temInicio && !v.temFim,
        ]
      )
    }

    // Vínculo conhecido só pela folha (S-1200 sem S-2200, ex.: admissão anterior aos downloads):
    // quando a pessoa passa a ter vínculos com admissão registrada, ele é encerrado, a menos que
    // a matrícula continue recebendo remuneração no período importado
    await client.query(
      `UPDATE funcionario_vinculos SET status = 'inativo'
        WHERE funcionario_id = $1 AND origem = 'esocial' AND status = 'ativo' AND data_admissao IS NULL
          AND EXISTS (SELECT 1 FROM funcionario_vinculos x WHERE x.funcionario_id = $1 AND x.data_admissao IS NOT NULL)
          AND NOT (coalesce(matricula, '') = ANY($2::text[]))`,
      [funcionarioId, [...w.matriculasRemuneradas]]
    )

    // Só há remuneração (sem S-2200 no histórico): registra a matrícula se a pessoa não tem vínculo nenhum
    if (!w.vinculos.length && w.matriculasRemuneradas.size) {
      const { rows: [tem] } = await client.query("SELECT 1 FROM funcionario_vinculos WHERE funcionario_id = $1 LIMIT 1", [funcionarioId])
      if (!tem) {
        for (const mat of w.matriculasRemuneradas) {
          await client.query(
            `INSERT INTO funcionario_vinculos (funcionario_id, empresa_id, matricula, cod_categoria, status, origem)
             VALUES ($1, $2, $3, $4, 'ativo', 'esocial') ON CONFLICT DO NOTHING`,
            [funcionarioId, empresaId, mat, w.codCategoria]
          )
        }
      }
    }
  }

  await recalcularResumo(client, tocados)
}

/**
 * Vínculo a usar num evento de SST. Com matrícula informada, usa (ou cria) esse vínculo sem
 * trocar a matrícula principal; sem matrícula, usa a principal do trabalhador.
 */
export async function resolverVinculo(client: PoolClient, empresaId: string, funcionarioId: string, matricula?: string | null) {
  const { rows: [f] } = await client.query(
    "SELECT matricula_esocial, cod_categoria FROM funcionarios WHERE id = $1 AND empresa_id = $2",
    [funcionarioId, empresaId]
  )
  if (!f) throw new Error("Funcionário não pertence à empresa selecionada.")
  const mat = matricula?.trim() || f.matricula_esocial || null
  if (!mat) return { matricula: null as string | null, codCategoria: f.cod_categoria as string | null }

  const { rowCount } = await client.query(
    `INSERT INTO funcionario_vinculos (funcionario_id, empresa_id, matricula, cod_categoria, status, origem)
     VALUES ($1, $2, $3, $4, 'ativo', 'manual') ON CONFLICT DO NOTHING`,
    [funcionarioId, empresaId, mat, f.cod_categoria]
  )
  if (rowCount) await recalcularResumo(client, [funcionarioId])
  const { rows: [v] } = await client.query(
    "SELECT cod_categoria FROM funcionario_vinculos WHERE funcionario_id = $1 AND matricula = $2",
    [funcionarioId, mat]
  )
  return { matricula: mat as string, codCategoria: (v?.cod_categoria ?? f.cod_categoria) as string | null }
}

/** Resumo do trabalhador a partir dos vínculos (o mais recente ativo é o principal). */
export async function recalcularResumo(client: PoolClient, funcionarioIds: string[]) {
  if (!funcionarioIds.length) return
  await client.query(
    `WITH principal AS (
       SELECT DISTINCT ON (v.funcionario_id) v.funcionario_id, v.matricula, v.cod_categoria, v.cargo, v.cbo, v.data_admissao
         FROM funcionario_vinculos v
        WHERE v.funcionario_id = ANY($1::uuid[]) AND v.status = 'ativo'
        ORDER BY v.funcionario_id, v.data_admissao DESC NULLS LAST, v.created_at DESC
     ),
     ultimo_desligamento AS (
       SELECT funcionario_id, max(data_desligamento) AS dt
         FROM funcionario_vinculos WHERE funcionario_id = ANY($1::uuid[]) GROUP BY funcionario_id
     )
     UPDATE funcionarios f SET
       status = CASE WHEN f.status = 'cancelado' THEN f.status
                     WHEN p.funcionario_id IS NOT NULL THEN 'ativo'
                     WHEN EXISTS (SELECT 1 FROM funcionario_vinculos x WHERE x.funcionario_id = f.id) THEN 'inativo'
                     ELSE f.status END,
       matricula_esocial = COALESCE(p.matricula, f.matricula_esocial),
       cod_categoria = COALESCE(p.cod_categoria, f.cod_categoria),
       cargo = COALESCE(p.cargo, f.cargo),
       cbo = COALESCE(p.cbo, f.cbo),
       data_admissao = COALESCE(p.data_admissao, f.data_admissao),
       data_desligamento = CASE WHEN p.funcionario_id IS NOT NULL THEN NULL ELSE COALESCE(u.dt, f.data_desligamento) END
     FROM funcionarios f2
     LEFT JOIN principal p ON p.funcionario_id = f2.id
     LEFT JOIN ultimo_desligamento u ON u.funcionario_id = f2.id
     WHERE f.id = f2.id AND f.id = ANY($1::uuid[])`,
    [funcionarioIds]
  )
}
